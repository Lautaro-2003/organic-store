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

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()
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
      .select('id, name, stock')
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

    const client = new MercadoPagoConfig({ accessToken: token })

    const body = {
      items: items.map((item: { id: string; name: string; quantity: number; price: number }) => ({
        id: item.id,
        title: item.name,
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
        currency_id: 'ARS',
      })),
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
      { error: error?.message || 'Error interno' },
      { status: 500 }
    )
  }
}
