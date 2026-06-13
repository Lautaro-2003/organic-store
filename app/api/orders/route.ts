import { createClient } from '@supabase/supabase-js'
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
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await getSupabaseAdmin().auth.getUser(token)
    if (authError || !user) {
      return Response.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { items, total } = await request.json()
    if (!items || items.length === 0) {
      return Response.json({ error: 'Carrito vacío' }, { status: 400 })
    }

    const { data: order, error: insertError } = await getSupabaseAdmin()
      .from('orders')
      .insert({
        user_id: user.id,
        items,
        total,
        status: 'confirmed',
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Orders] Error al guardar:', insertError)
      return Response.json({ error: 'Error al guardar la orden' }, { status: 500 })
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
