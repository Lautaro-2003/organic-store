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
    const { data: coupons, error } = await getSupabaseAdmin()
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Admin Coupons] Error:', error)
      return Response.json({ error: 'Error al cargar cupones' }, { status: 500 })
    }

    return Response.json({ coupons: coupons ?? [] })
  } catch (error) {
    console.error('[Admin Coupons] Error:', error)
    return Response.json({ error: 'Error al cargar cupones' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, discount_percent, expires_at } = await request.json()

    if (!code || !discount_percent) {
      return Response.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const { data, error } = await getSupabaseAdmin()
      .from('coupons')
      .insert({ code: code.toUpperCase(), discount_percent, expires_at: expires_at || null })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return Response.json({ error: 'Ya existe un cupón con ese código' }, { status: 409 })
      }
      console.error('[Admin Coupons] Error:', error)
      return Response.json({ error: 'Error al crear cupón' }, { status: 500 })
    }

    return Response.json({ coupon: data })
  } catch (error) {
    console.error('[Admin Coupons] Error:', error)
    return Response.json({ error: 'Error al crear cupón' }, { status: 500 })
  }
}
