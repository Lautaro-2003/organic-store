import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { data: coupon } = await getSupabaseAdmin()
      .from('coupons')
      .select('active')
      .eq('id', id)
      .single()

    if (!coupon) {
      return Response.json({ error: 'Cupón no encontrado' }, { status: 404 })
    }

    const { error } = await getSupabaseAdmin()
      .from('coupons')
      .update({ active: !coupon.active })
      .eq('id', id)

    if (error) {
      console.error('[Admin Coupons] Error:', error)
      return Response.json({ error: 'Error al actualizar cupón' }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[Admin Coupons] Error:', error)
    return Response.json({ error: 'Error al actualizar cupón' }, { status: 500 })
  }
}
