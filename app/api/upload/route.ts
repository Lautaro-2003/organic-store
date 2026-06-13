import { createSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return Response.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    const supabase = createSupabaseClient()

    if (!supabase) {
      // Fallback: guardar localmente
      const { writeFile, mkdir } = await import('fs/promises')
      const path = await import('path')
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
      await mkdir(uploadDir, { recursive: true })
      const ext = file.name.split('.').pop() || 'jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const filepath = path.join(uploadDir, filename)
      await writeFile(filepath, buffer)
      return Response.json({ success: true, url: `/uploads/products/${filename}` })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filename, buffer, {
        contentType: file.type || `image/${ext}`,
        upsert: false,
      })

    if (error) {
      console.error('[Supabase] Error al subir imagen:', error.message)
      return Response.json({ error: 'Error al subir imagen al servidor' }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('products').getPublicUrl(data.path)

    return Response.json({ success: true, url: urlData.publicUrl })
  } catch {
    return Response.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}
