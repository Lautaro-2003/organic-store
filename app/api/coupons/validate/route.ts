import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return Response.json({ error: 'Código inválido' }, { status: 400 })
    }

    const { data, error } = await getSupabaseAdmin()
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single()

    if (error || !data) {
      return Response.json({ error: 'Cupón no encontrado' }, { status: 404 })
    }

    if (!data.active) {
      return Response.json({ error: 'Este cupón ya no está activo' }, { status: 400 })
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return Response.json({ error: 'Este cupón ha expirado' }, { status: 400 })
    }

    return Response.json({
      valid: true,
      code: data.code,
      discount_percent: data.discount_percent,
    })
  } catch {
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
