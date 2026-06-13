import { readProducts, writeProducts } from '@/lib/products'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const products = readProducts()
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
    const products = readProducts()
    const index = products.findIndex(p => p.id === id)

    if (index === -1) {
      return Response.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    products[index] = {
      ...products[index],
      ...body,
      price: body.price !== undefined ? Number(body.price) : products[index].price,
      stock: body.stock !== undefined ? Number(body.stock) : products[index].stock,
    }

    writeProducts(products)

    return Response.json({ success: true, product: products[index] })
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
    const products = readProducts()
    const index = products.findIndex(p => p.id === id)

    if (index === -1) {
      return Response.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    products.splice(index, 1)
    writeProducts(products)

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Error al eliminar producto' }, { status: 500 })
  }
}
