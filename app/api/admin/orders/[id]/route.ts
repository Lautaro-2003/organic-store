import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

const validStatuses = ['pendiente', 'en camino', 'entregado']

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!validStatuses.includes(status)) {
      return Response.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const { data: order } = await getSupabaseAdmin()
      .from('orders')
      .select('id')
      .eq('id', id)
      .single()

    if (!order) {
      return Response.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    const { error } = await getSupabaseAdmin()
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('[Admin Orders] Error al actualizar:', error)
      return Response.json({ error: 'Error al actualizar orden' }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[Admin Orders] Error:', error)
    return Response.json({ error: 'Error al actualizar orden' }, { status: 500 })
  }
}
