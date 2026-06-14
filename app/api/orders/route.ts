import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 're_xxx') return null
  return new Resend(apiKey)
}

function adminEmailHtml(order: any, userEmail: string) {
  const itemsHtml = order.items.map((item: any) =>
    `<tr><td style="padding:6px 0;color:#1c1917;">${item.name} x${item.quantity}</td><td style="padding:6px 0;text-align:right;color:#1c1917;font-weight:600;">$ ${(item.price * item.quantity).toLocaleString('es-AR')}</td></tr>`
  ).join('')

  const shipping = order.shipping_address || {}

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f5f5f0;font-family:system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:20px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr><td style="background:#059669;padding:24px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:20px;">Nuevo Pedido</h1></td></tr>
<tr><td style="padding:24px;">
<p style="margin:0 0 16px;color:#44403c;font-size:14px;"><strong>Cliente:</strong> ${userEmail}</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-bottom:1px solid #e7e5e4;padding-bottom:8px;font-size:12px;font-weight:700;color:#78716c;text-transform:uppercase;">Producto</td><td style="border-bottom:1px solid #e7e5e4;padding-bottom:8px;font-size:12px;font-weight:700;color:#78716c;text-transform:uppercase;text-align:right;">Subtotal</td></tr>${itemsHtml}</table>
<p style="margin:16px 0 0;text-align:right;font-size:18px;font-weight:800;color:#1c1917;">Total: $ ${order.total.toLocaleString('es-AR')}</p>
${shipping.fullName ? `<div style="margin-top:16px;padding:12px;background:#f0fdf4;border-radius:12px;font-size:13px;color:#44403c;"><p style="margin:0 0 4px;"><strong>Envío:</strong> ${shipping.fullName}</p><p style="margin:0 0 4px;">${shipping.street}${shipping.apartment ? ', ' + shipping.apartment : ''}</p><p style="margin:0 0 4px;">${shipping.neighborhood}, ${shipping.province} — CP: ${shipping.zipCode}</p><p style="margin:0;"><strong>Tel:</strong> ${shipping.phone}</p>${shipping.notes ? `<p style="margin:4px 0 0;color:#a16207;">Notas: ${shipping.notes}</p>` : ''}</div>` : ''}
</td></tr></table></body></html>`
}

function customerEmailHtml(order: any, shipping: any) {
  const itemsHtml = order.items.map((item: any) =>
    `<tr><td style="padding:6px 0;color:#1c1917;">${item.name} x${item.quantity}</td><td style="padding:6px 0;text-align:right;color:#1c1917;font-weight:600;">$ ${(item.price * item.quantity).toLocaleString('es-AR')}</td></tr>`
  ).join('')

  const address = shipping ? `${shipping.street}${shipping.apartment ? ', ' + shipping.apartment : ''}, ${shipping.neighborhood}, ${shipping.province}` : '—'

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f5f5f0;font-family:system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:20px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr><td style="background:#059669;padding:24px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:20px;">¡Compra confirmada!</h1></td></tr>
<tr><td style="padding:24px;">
<p style="margin:0 0 16px;color:#44403c;font-size:14px;">Gracias por tu compra en <strong>Orgánico</strong>. Acá está el resumen:</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-bottom:1px solid #e7e5e4;padding-bottom:8px;font-size:12px;font-weight:700;color:#78716c;text-transform:uppercase;">Producto</td><td style="border-bottom:1px solid #e7e5e4;padding-bottom:8px;font-size:12px;font-weight:700;color:#78716c;text-transform:uppercase;text-align:right;">Subtotal</td></tr>${itemsHtml}</table>
<p style="margin:16px 0 0;text-align:right;font-size:18px;font-weight:800;color:#1c1917;">Total: $ ${order.total.toLocaleString('es-AR')}</p>
<div style="margin-top:16px;padding:12px;background:#f0fdf4;border-radius:12px;font-size:13px;color:#44403c;"><p style="margin:0 0 4px;"><strong>Dirección de envío:</strong></p><p style="margin:0;">${address}</p></div>
<div style="margin-top:12px;padding:12px;background:#fffbeb;border-radius:12px;font-size:13px;color:#92400e;"><p style="margin:0;font-weight:600;">Tiempo estimado de entrega:</p><p style="margin:4px 0 0;">Entre 24 y 48 horas hábiles.</p></div>
</td></tr></table></body></html>`
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await getSupabaseAdmin().auth.getUser(token)
    if (authError || !user) {
      return Response.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { items, total, shipping_address, session_id } = await request.json()
    if (!items || items.length === 0) {
      return Response.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const cleanupReservations = () =>
      session_id
        ? supabase.from('stock_reservations').delete().eq('session_id', session_id)
        : Promise.resolve()

    if (session_id) {
      const { data: reservations, error: reservationError } = await supabase
        .from('stock_reservations')
        .select('id')
        .eq('session_id', session_id)
        .gt('expires_at', new Date().toISOString())

      if (!reservationError && reservations && reservations.length > 0) {
        await cleanupReservations()
      }
    }

    const { error: stockError } = await supabase
      .rpc('reserve_stock', { p_items: items })

    if (stockError) {
      await cleanupReservations()
      const message = stockError.message || 'Stock insuficiente'
      return Response.json({ error: message }, { status: 409 })
    }

    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        items,
        total,
        status: 'confirmed',
        shipping_address: shipping_address || null,
      })
      .select()
      .single()

    if (insertError) {
      await cleanupReservations()
      console.error('[Orders] Error al guardar:', insertError)
      return Response.json({ error: 'Error al guardar la orden' }, { status: 500 })
    }

    await cleanupReservations()

    const resend = getResend()
    const adminEmail = process.env.ADMIN_EMAIL
    const from = process.env.RESEND_FROM || 'Orgánico <pedidos@organico.com>'

    if (resend && user.email) {
      try {
        await resend.emails.send({
          from,
          to: user.email,
          subject: 'Tu compra en Orgánico fue confirmada',
          html: customerEmailHtml(order, shipping_address),
        })
        console.log(`[Orders] Email de confirmación enviado a ${user.email}`)
      } catch (mailErr) {
        console.error('[Orders] Error al enviar email al cliente:', mailErr)
      }
    }

    if (resend && adminEmail) {
      try {
        await resend.emails.send({
          from,
          to: adminEmail,
          subject: `Nuevo pedido — $ ${order.total.toLocaleString('es-AR')}`,
          html: adminEmailHtml(order, user.email || '—'),
        })
        console.log(`[Orders] Email de notificación enviado al admin`)
      } catch (mailErr) {
        console.error('[Orders] Error al enviar email al admin:', mailErr)
      }
    }

    return Response.json({ order })
  } catch (error) {
    console.error('[Orders] Error:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await getSupabaseAdmin().auth.getUser(token)
    if (authError || !user) {
      return Response.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { data: orders, error } = await getSupabaseAdmin()
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Orders] Error al listar:', error)
      return Response.json({ error: 'Error al obtener órdenes' }, { status: 500 })
    }

    return Response.json({ orders })
  } catch (error) {
    console.error('[Orders] Error:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
