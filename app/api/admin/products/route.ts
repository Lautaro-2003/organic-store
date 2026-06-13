import { readProducts, addProduct, generateId } from '@/lib/products'

export async function GET() {
  const products = await readProducts()
  return Response.json({ products })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, price, image, category, description, stock } = body

    if (!name || !price || !category) {
      return Response.json({ error: 'Faltan campos requeridos (name, price, category)' }, { status: 400 })
    }

    const newProduct = {
      id: generateId(),
      name,
      price: Number(price),
      image: image || '',
      category,
      description: description || '',
      rating: 0,
      stock: stock ? Number(stock) : 0,
    }

    const created = await addProduct(newProduct)

    if (!created) {
      return Response.json({ error: 'Error al crear producto en la base de datos' }, { status: 500 })
    }

    return Response.json({ success: true, product: created })
  } catch {
    return Response.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
