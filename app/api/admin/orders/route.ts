import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET() {
  try {
    const { data: orders, error } = await getSupabaseAdmin()
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Admin Orders] Error:', error)
      return Response.json({ error: 'Error al obtener órdenes' }, { status: 500 })
    }

    return Response.json({ orders })
  } catch (error) {
    console.error('[Admin Orders] Error:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
