"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { AddToCartButton } from '@/components/AddToCartButton'
import { ReviewsSection } from '@/components/ReviewsSection'
import { ProductRating } from '@/components/ProductRating'
import type { Product } from '@/types/product'

interface Props {
  product: Product
}

export function ProductPageClient({ product }: Props) {
  const [refreshKey, setRefreshKey] = useState(0)
  const outOfStock = (product.stock ?? 0) <= 0

  return (
    <div className="py-12 overflow-x-hidden">
      <Link
        href="/productos"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-emerald-700 transition mb-8"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a productos
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
        <div className="bg-stone-100 rounded-3xl aspect-square relative overflow-hidden border border-stone-200">
          <Image
            src={product.image || 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          <div className="absolute top-4 left-4">
            <span className="text-xs font-extrabold tracking-widest text-emerald-800 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl uppercase shadow-sm border border-stone-100">
              {product.category}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <ProductRating refreshKey={refreshKey} productId={product.id} />

          <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight mb-3">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-stone-600 text-base leading-relaxed mb-6">
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-4 mb-8">
            <span className="text-3xl font-black text-stone-900">
              $ {product.price?.toLocaleString('es-AR')}
            </span>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${
              outOfStock
                ? 'bg-red-50 text-red-500'
                : (product.stock ?? 0) <= 5
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-emerald-50 text-emerald-700'
            }`}>
              {outOfStock
                ? 'Sin stock'
                : `Stock: ${product.stock}`}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <AddToCartButton
              id={product.id}
              name={product.name}
              price={product.price}
              category={product.category}
              stock={product.stock ?? 0}
              outOfStock={outOfStock}
            />
          </div>
        </div>
      </div>

      <ReviewsSection productId={product.id} onReviewSubmitted={() => setRefreshKey(k => k + 1)} />
    </div>
  )
}
