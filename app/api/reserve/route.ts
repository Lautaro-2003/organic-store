import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

async function getUserFromToken(token: string) {
  const { data: { user }, error } = await getSupabaseAdmin().auth.getUser(token)
  if (error || !user) return null
  return user
}

async function hasUserUsedCoupon(userId: string, couponCode: string) {
  const { count } = await getSupabaseAdmin()
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('coupon_code', couponCode)
    .neq('status', 'cancelled')

  return (count ?? 0) > 0
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await getUserFromToken(authHeader.slice(7))
    if (!user) {
      return Response.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { items, coupon_code, discount_percent } = await request.json()
    if (!items || items.length === 0) {
      return Response.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    await supabase
      .from('stock_reservations')
      .delete()
      .lt('expires_at', new Date().toISOString())

    const productIds = items.map((i: any) => i.id)

    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .in('id', productIds)

    if (!products || products.length !== items.length) {
      return Response.json({ error: 'Producto no encontrado' }, { status: 400 })
    }

    const stockMap = new Map(products.map((p: any) => [p.id, p]))
    const nameMap = new Map(products.map((p: any) => [p.id, p.name]))

    const { data: reservations } = await supabase
      .from('stock_reservations')
      .select('product_id, quantity')
      .in('product_id', productIds)
      .gt('expires_at', new Date().toISOString())

    const reservedMap = new Map<string, number>()
    if (reservations) {
      for (const r of reservations) {
        reservedMap.set(r.product_id, (reservedMap.get(r.product_id) || 0) + r.quantity)
      }
    }

    for (const item of items) {
      const product = stockMap.get(item.id)
      if (!product) {
        return Response.json({ error: `Producto ${item.name} no encontrado` }, { status: 400 })
      }
      const reserved = reservedMap.get(item.id) || 0
      const available = product.stock - reserved
      if (available < item.quantity) {
        return Response.json(
          { error: `Stock insuficiente para ${nameMap.get(item.id)}` },
          { status: 409 }
        )
      }
    }

    const session_id = crypto.randomUUID()
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString()

    const reservationsData = items.map((item: any) => ({
      session_id,
      product_id: item.id,
      quantity: item.quantity,
      expires_at,
    }))

    const { error: insertError } = await supabase
      .from('stock_reservations')
      .insert(reservationsData)

    if (insertError) {
      console.error('[Reserve] Error al insertar reservas:', insertError)
      return Response.json({ error: 'Error al reservar stock' }, { status: 500 })
    }

    const token = process.env.MP_ACCESS_TOKEN
    if (!token || token === 'xxx') {
      return Response.json(
        { error: 'Mercado Pago no está configurado' },
        { status: 500 }
      )
    }

    const priceMap = new Map(products.map((p: any) => [p.id, p.price]))
    let subtotal = 0
    for (const item of items) {
      subtotal += (priceMap.get(item.id) || item.price) * item.quantity
    }

    let discountAmount = 0
    let validatedCouponCode: string | null = null

    if (coupon_code && discount_percent) {
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', coupon_code.toUpperCase().trim())
        .single()

      if (!couponError && coupon && coupon.active) {
        const expired = coupon.expires_at && new Date(coupon.expires_at) < new Date()
        const reachedLimit = coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses
        const belowMinimum = coupon.min_order_amount !== null && subtotal < coupon.min_order_amount
        const alreadyUsed = await hasUserUsedCoupon(user.id, coupon.code)

        if (!expired && !reachedLimit && !belowMinimum && !alreadyUsed) {
          validatedCouponCode = coupon.code
          discountAmount = Math.round((subtotal * discount_percent) / 100)
        }
      }
    }

    const client = new MercadoPagoConfig({ accessToken: token })

    const mpItems = items.map((item: { id: string; name: string; quantity: number; price: number }) => ({
      id: item.id,
      title: item.name,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: 'ARS',
    }))

    if (discountAmount > 0) {
      mpItems.push({
        id: 'coupon_discount',
        title: `Descuento cupón ${validatedCouponCode} (${discount_percent}%)`,
        quantity: 1,
        unit_price: -discountAmount,
        currency_id: 'ARS',
      })
    }

    const body = {
      items: mpItems,
      back_urls: {
        success: `http://localhost:3000/carrito/resultado?status=approved&session_id=${session_id}`,
        failure: `http://localhost:3000/carrito/resultado?status=rejected&session_id=${session_id}`,
        pending: `http://localhost:3000/carrito/resultado?status=pending&session_id=${session_id}`,
      },
      statement_descriptor: 'TIENDA ORGANICA',
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
      },
    }

    const preference = await new Preference(client).create({ body })

    return Response.json({
      id: preference.id,
      init_point: preference.init_point,
      session_id,
    })
  } catch (error) {
    console.error('[Reserve] Error:', error)
    return Response.json(
      { error: (error as Error)?.message || 'Error interno' },
      { status: 500 }
    )
  }
}
