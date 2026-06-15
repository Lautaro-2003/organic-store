import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  console.log('[Email] RESEND_API_KEY presente:', !!apiKey, '| valor:', apiKey ? apiKey.slice(0, 10) + '...' : 'undefined')
  if (!apiKey || apiKey === 're_xxx') {
    console.log('[Email] getResend: retorna null — clave no configurada o placeholder')
    return null
  }
  return new Resend(apiKey)
}

function statusEmailHtml(order: any, title: string, message: string) {
  const itemsHtml = order.items.map((item: any) =>
    `<tr><td style="padding:6px 0;color:#1c1917;">${item.name} x${item.quantity}</td><td style="padding:6px 0;text-align:right;color:#1c1917;font-weight:600;">$ ${(item.price * item.quantity).toLocaleString('es-AR')}</td></tr>`
  ).join('')

  const name = order.shipping_address?.fullName || ''

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f5f5f0;font-family:system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:20px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr><td style="background:#059669;padding:24px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:20px;">${title}</h1></td></tr>
<tr><td style="padding:24px;">
${name ? `<p style="margin:0 0 16px;color:#44403c;font-size:14px;">Hola <strong>${name}</strong>,</p>` : ''}
<p style="margin:0 0 16px;color:#44403c;font-size:14px;">${message}</p>
<p style="margin:0 0 12px;color:#78716c;font-size:12px;font-weight:700;text-transform:uppercase;">Resumen de tu pedido</p>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-bottom:1px solid #e7e5e4;padding-bottom:8px;font-size:12px;font-weight:700;color:#78716c;text-transform:uppercase;">Producto</td><td style="border-bottom:1px solid #e7e5e4;padding-bottom:8px;font-size:12px;font-weight:700;color:#78716c;text-transform:uppercase;text-align:right;">Subtotal</td></tr>${itemsHtml}</table>
${order.discount_amount ? `<p style="margin:8px 0 0;text-align:right;font-size:14px;color:#059669;">Descuento: -$ ${order.discount_amount.toLocaleString('es-AR')}</p>` : ''}
<p style="margin:8px 0 0;text-align:right;font-size:18px;font-weight:800;color:#1c1917;">Total: $ ${order.total.toLocaleString('es-AR')}</p>
<p style="margin:20px 0 0;font-size:12px;color:#a8a29e;text-align:center;">N\u00famero de orden: ${order.id.slice(0, 8)}</p>
</td></tr></table></body></html>`
}

const validStatuses = ['pendiente', 'en camino', 'entregado']

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await request.json()

    console.log('[Email] ===== INICIO PATCH =====')
    console.log('[Email] ID orden:', id)
    console.log('[Email] Nuevo estado recibido:', JSON.stringify(status))

    if (!validStatuses.includes(status)) {
      return Response.json({ error: 'Estado inv\u00e1lido' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', id)
      .single()

    if (!order) {
      console.log('[Email] Orden no encontrada')
      return Response.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    console.log('[Email] Estado anterior:', order.status)
    console.log('[Email] Estado nuevo:', status)

    if (order.status === status) {
      console.log('[Email] Mismo estado, no se hace nada')
      return Response.json({ success: true })
    }

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('[Admin Orders] Error al actualizar:', error)
      return Response.json({ error: 'Error al actualizar orden' }, { status: 500 })
    }

    console.log('[Email] UPDATE exitoso, status:', status)

    // --- Enviar email al cliente si el estado cambió a "en camino" o "entregado" ---
    console.log('[Email] ¿status coincide con "en camino" o "entregado"?', status === 'en camino' || status === 'entregado')

    if (status === 'en camino' || status === 'entregado') {
      const resend = getResend()
      const from = process.env.RESEND_FROM || 'onboarding@resend.dev'
      console.log('[Email] RESEND_FROM:', from)

      if (resend) {
        console.log('[Email] Resend instanciado correctamente')

        const { data: fullOrder, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single()

        console.log('[Email] fullOrder:', fullOrder ? 'encontrada' : 'null')
        console.log('[Email] fetchError:', fetchError)

        if (fullOrder) {
          console.log('[Email] shipping_address:', JSON.stringify(fullOrder.shipping_address))
          console.log('[Email] user_id:', fullOrder.user_id)

          let email: string | null = null

          if (fullOrder.shipping_address && typeof fullOrder.shipping_address === 'object') {
            const addr = fullOrder.shipping_address as Record<string, unknown>
            console.log('[Email] Campos en shipping_address:', Object.keys(addr))
            if (typeof addr.email === 'string') {
              email = addr.email
              console.log('[Email] Email desde shipping_address.email:', email)
            } else {
              console.log('[Email] shipping_address no tiene campo "email"')
            }
          } else {
            console.log('[Email] shipping_address es null o no es objeto')
          }

          if (!email && fullOrder.user_id) {
            console.log('[Email] Buscando email en auth.users para user_id:', fullOrder.user_id)
            const { data: user, error: userError } = await supabase.auth.admin.getUserById(fullOrder.user_id)
            console.log('[Email] auth.getUserById error:', userError)
            console.log('[Email] auth.getUserById user:', user ? 'encontrado' : 'null')
            if (user?.user?.email) {
              email = user.user.email
              console.log('[Email] Email desde auth.users:', email)
            } else {
              console.log('[Email] auth.users no tiene email para este user_id')
            }
          }

          console.log('[Email] Email destinatario final:', email)

          if (email) {
            try {
              const subject = status === 'en camino'
                ? 'Tu pedido est\u00e1 en camino'
                : 'Tu pedido fue entregado'
              const title = status === 'en camino'
                ? '\u00a1Tu pedido est\u00e1 en camino!'
                : '\u00a1Pedido entregado!'
              const message = status === 'en camino'
                ? 'Tu pedido ha sido despachado y est\u00e1 en camino a tu domicilio. Te recomendamos estar atento para recibirlo.'
                : 'Tu pedido fue entregado con \u00e9xito. Esperamos que disfrutes tus productos. Te invitamos a dejar una rese\u00f1a en la p\u00e1gina de Mis Compras para ayudarnos a seguir mejorando.'

              console.log('[Email] Enviando a Resend...')
              console.log('[Email] Subject:', subject)
              console.log('[Email] To:', email)
              console.log('[Email] From:', from)

              const emailResult = await resend.emails.send({
                from,
                to: email,
                subject,
                html: statusEmailHtml(fullOrder, title, message),
              })

              console.log('[Email] Resend response:', JSON.stringify(emailResult))
              console.log('[Email] Email de "' + status + '" enviado a ' + email)
            } catch (mailErr: any) {
              console.error('[Email] Resend error:', mailErr.message || mailErr)
              console.error('[Email] Resend error stack:', mailErr.stack)
            }
          } else {
            console.log('[Email] No se pudo resolver el email del cliente — email es null')
          }
        }
      } else {
        console.log('[Email] Resend no disponible (getResend retornó null)')
      }
    } else {
      console.log('[Email] Estado no requiere envío de email')
    }

    console.log('[Email] ===== FIN PATCH =====')
    return Response.json({ success: true })
  } catch (error: any) {
    console.error('[Admin Orders] Error:', error)
    console.error('[Admin Orders] Error stack:', error.stack)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
