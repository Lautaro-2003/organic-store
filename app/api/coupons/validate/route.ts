import { createClient } from '@supabase/supabase-js'

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

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await getUserFromToken(authHeader.slice(7))
    if (!user) {
      return Response.json({ error: 'Token inválido' }, { status: 401 })
    }

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

    if (data.max_uses !== null && data.uses_count >= data.max_uses) {
      return Response.json({ error: 'Este cupón ya alcanzó el límite de usos' }, { status: 400 })
    }

    const alreadyUsed = await hasUserUsedCoupon(user.id, data.code)
    if (alreadyUsed) {
      return Response.json({ error: 'Ya usaste este cupón anteriormente' }, { status: 400 })
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
