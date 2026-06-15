import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const cronSecret = process.env.CRON_SECRET

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

function recoveryEmailHtml(items: any[]) {
  const itemsHtml = items.map((item: any) =>
    `<tr><td style="padding:8px 0;"><img src="${item.image || ''}" alt="${item.name}" style="width:48px;height:48px;border-radius:12px;object-fit:cover;display:block;" onerror="this.style.display='none'"/></td><td style="padding:8px 0;color:#1c1917;font-size:14px;font-weight:600;">${item.name}</td><td style="padding:8px 0;text-align:center;color:#78716c;font-size:14px;">x${item.quantity}</td><td style="padding:8px 0;text-align:right;color:#1c1917;font-weight:700;font-size:14px;">$ ${(item.price * item.quantity).toLocaleString('es-AR')}</td></tr>`
  ).join('')

  const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/></head><body style="margin:0;padding:0;background:#f5f5f0;font-family:system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:20px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr><td style="background:#059669;padding:32px 24px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:24px;">\u00bfOlvidaste algo?</h1></td></tr>
<tr><td style="padding:24px;">
<p style="margin:0 0 16px;color:#44403c;font-size:15px;">Notamos que dejaste productos en tu carrito. \u00a1Todav\u00eda est\u00e1n esperando por vos!</p>
<table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
<p style="margin:16px 0 0;text-align:right;font-size:16px;font-weight:800;color:#1c1917;">Subtotal: $ ${subtotal.toLocaleString('es-AR')}</p>
<p style="margin:24px 0 0;text-align:center;"><a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/carrito" style="display:inline-block;background:#059669;color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;">Completar mi compra</a></p>
<p style="margin:16px 0 0;font-size:12px;color:#a8a29e;text-align:center;">Este mensaje fue generado autom\u00e1ticamente.</p>
</td></tr></table></body></html>`
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ') || authHeader.slice(7) !== cronSecret) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const resend = getResend()

    if (!resend) {
      return Response.json({ error: 'Resend no configurado' }, { status: 500 })
    }

    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

    const { data: carts, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('reminder_sent', false)
      .lt('updated_at', thirtyMinAgo)

    if (error) {
      console.error('[Cron] Error al buscar carritos:', error)
      return Response.json({ error: 'Error al buscar carritos' }, { status: 500 })
    }

    console.log(`[Cron] Carritos abandonados encontrados: ${carts?.length ?? 0}`)

    const from = process.env.RESEND_FROM || 'onboarding@resend.dev'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''

    let sent = 0
    for (const cart of carts ?? []) {
      try {
        await resend.emails.send({
          from,
          to: cart.email,
          subject: '\u00bfOlvidaste algo? \uD83D\uDED2',
          html: recoveryEmailHtml(cart.items),
        })

        await supabase
          .from('abandoned_carts')
          .update({ reminder_sent: true })
          .eq('id', cart.id)

        sent++
        console.log(`[Cron] Email enviado a ${cart.email}`)
      } catch (err) {
        console.error(`[Cron] Error al enviar a ${cart.email}:`, err)
      }
    }

    return Response.json({ ok: true, processed: carts?.length ?? 0, sent })
  } catch (error) {
    console.error('[Cron] Error:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
