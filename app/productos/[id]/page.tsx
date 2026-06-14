import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProduct, readProducts } from '@/lib/products'
import { createSupabaseClient } from '@/lib/supabase'
import { ProductPageClient } from '@/components/ProductPageClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const products = await readProducts()
  return products.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: 'Producto no encontrado - Orgánico' }

  return {
    title: `${product.name} - Orgánico`,
    description: product.description || `Comprá ${product.name} al mejor precio en nuestra tienda orgánica.`,
    openGraph: {
      title: `${product.name} - Orgánico`,
      description: product.description || `Comprá ${product.name} al mejor precio.`,
      images: product.image ? [{ url: product.image }] : [],
    },
  }
}

async function getAvailableStock(productId: string, realStock: number): Promise<number> {
  const supabase = createSupabaseClient()
  if (!supabase) return realStock

  const { data: reservations } = await supabase
    .from('stock_reservations')
    .select('quantity')
    .eq('product_id', productId)
    .gt('expires_at', new Date().toISOString())

  const reserved = reservations?.reduce((sum, r) => sum + r.quantity, 0) ?? 0
  return Math.max(0, realStock - reserved)
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const availableStock = await getAvailableStock(id, product.stock ?? 0)

  return <ProductPageClient product={{ ...product, stock: availableStock }} />
}
