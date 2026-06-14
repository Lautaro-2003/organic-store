import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProduct, readProducts } from '@/lib/products'
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

export default async function ProductoPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  return <ProductPageClient product={product} />
}
