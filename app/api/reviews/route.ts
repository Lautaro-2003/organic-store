import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')

    if (!productId) {
      return Response.json({ error: 'Falta product_id' }, { status: 400 })
    }

    const { data: reviews, error } = await getSupabaseAdmin()
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Reviews] Error:', error)
      return Response.json({ error: 'Error al cargar reseñas' }, { status: 500 })
    }

    return Response.json({ reviews })
  } catch (error) {
    console.error('[Reviews] Error:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
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
      console.error('[Reviews] Auth error:', authError)
      return Response.json({ error: 'Token inválido' }, { status: 401 })
    }

    const { product_id, rating, comment } = await request.json()

    if (!product_id || !rating || !comment?.trim()) {
      return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return Response.json({ error: 'La puntuación debe ser entre 1 y 5' }, { status: 400 })
    }

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    )

    const { data: review, error: insertError } = await userClient
      .from('reviews')
      .insert({
        user_id: user.id,
        product_id,
        rating,
        comment: comment.trim(),
        user_name: user.user_metadata?.full_name || 'Usuario',
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Reviews] Error al insertar:', JSON.stringify(insertError, null, 2))
      return Response.json({ error: insertError?.message, code: insertError?.code, details: insertError?.details, hint: insertError?.hint }, { status: 500 })
    }

    return Response.json({ review })
  } catch (error) {
    console.error('[Reviews] Error:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await getSupabaseAdmin().auth.getUser(token)
    if (authError || !user) {
      console.error('[Reviews DELETE] Auth error:', authError?.message)
      return Response.json({ error: 'Token inválido', detail: authError?.message }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('id')
    console.log('[Reviews DELETE] reviewId recibido:', reviewId)
    console.log('[Reviews DELETE] user_id del token:', user.id)

    if (!reviewId) {
      return Response.json({ error: 'Falta id' }, { status: 400 })
    }

    const { data: review, error: findError } = await getSupabaseAdmin()
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single()

    console.log('[Reviews DELETE] resultado búsqueda:', { review, findError: findError?.message })

    if (!review) {
      return Response.json({ error: 'Reseña no encontrada', detail: findError?.message }, { status: 404 })
    }

    if (review.user_id !== user.id) {
      console.error('[Reviews DELETE] user_id no coincide:', { reviewUserId: review.user_id, tokenUserId: user.id })
      return Response.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { error: deleteError } = await getSupabaseAdmin()
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (deleteError) {
      console.error('[Reviews DELETE] Error de Supabase:', deleteError)
      return Response.json({ error: 'Error al eliminar', detail: deleteError.message, code: deleteError.code }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('[Reviews DELETE] Error inesperado:', error)
    return Response.json({ error: 'Error interno', detail: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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

    const { id, rating, comment } = await request.json()

    if (!id) {
      return Response.json({ error: 'Falta id' }, { status: 400 })
    }

    if (rating && (rating < 1 || rating > 5)) {
      return Response.json({ error: 'La puntuación debe ser entre 1 y 5' }, { status: 400 })
    }

    const { data: review } = await getSupabaseAdmin()
      .from('reviews')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!review) {
      return Response.json({ error: 'Reseña no encontrada' }, { status: 404 })
    }

    if (review.user_id !== user.id) {
      return Response.json({ error: 'No autorizado' }, { status: 403 })
    }

    const updates: Record<string, unknown> = {}
    if (rating) updates.rating = rating
    if (comment?.trim()) updates.comment = comment.trim()

    const { data: updated, error: updateError } = await getSupabaseAdmin()
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return Response.json({ error: 'Error al actualizar' }, { status: 500 })
    }

    return Response.json({ review: updated })
  } catch (error) {
    console.error('[Reviews] Error:', error)
    return Response.json({ error: 'Error interno' }, { status: 500 })
  }
}
