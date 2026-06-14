"use client"

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

interface Props {
  productId: string
  refreshKey?: number
}

export function ProductRating({ productId, refreshKey }: Props) {
  const [rating, setRating] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/reviews?product_id=${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data.reviews?.length > 0) {
          const total = data.reviews.reduce((a: number, r: { rating: number }) => a + r.rating, 0)
          const avg = total / data.reviews.length
          setRating(avg)
        } else {
          setRating(null)
        }
      })
  }, [productId, refreshKey])

  const stars = rating ? Math.round(rating) : 0

  return (
    <div className="flex items-center gap-1.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < stars ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`}
        />
      ))}
      {rating !== null && (
        <span className="text-sm font-bold text-stone-500 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}
