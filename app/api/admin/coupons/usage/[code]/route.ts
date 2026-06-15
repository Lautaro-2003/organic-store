import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const supabase = getSupabaseAdmin()

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, created_at, total, discount_amount, status, user_id, shipping_address')
      .eq('coupon_code', code.toUpperCase())
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Admin Coupon Usage] Error:', error)
      return Response.json({ error: 'Error al obtener uso del cupón' }, { status: 500 })
    }

    const usage = await Promise.all(
      (orders ?? []).map(async (order) => {
        let email: string | null = null

        if (order.shipping_address && typeof order.shipping_address === 'object') {
          const addr = order.shipping_address as Record<string, unknown>
          if (typeof addr.email === 'string') {
            email = addr.email
          }
        }

        if (!email && order.user_id) {
          const { data: user } = await supabase.auth.admin.getUserById(order.user_id)
          if (user?.user?.email) {
            email = user.user.email
          }
        }

        return {
          id: order.id,
          created_at: order.created_at,
          email,
          total: order.total,
          discount_amount: order.discount_amount ?? 0,
          status: order.status,
        }
      })
    )

    return Response.json({ usage })
  } catch (error) {
    console.error('[Admin Coupon Usage] Error:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
