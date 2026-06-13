import { readProducts, updateProduct, deleteProduct } from '@/lib/products'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const products = await readProducts()
  const product = products.find(p => p.id === id)

  if (!product) {
    return Response.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  return Response.json({ product })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.name !== undefined) updates.name = body.name
    if (body.price !== undefined) updates.price = Number(body.price)
    if (body.image !== undefined) updates.image = body.image
    if (body.category !== undefined) updates.category = body.category
    if (body.description !== undefined) updates.description = body.description
    if (body.stock !== undefined) updates.stock = Number(body.stock)

    const updated = await updateProduct(id, updates)

    if (!updated) {
      return Response.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return Response.json({ success: true, product: updated })
  } catch {
    return Response.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ok = await deleteProduct(id)

    if (!ok) {
      return Response.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Error al eliminar producto' }, { status: 500 })
  }
}
