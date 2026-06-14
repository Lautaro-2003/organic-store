"use client"

import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { ShoppingBag, Check, Loader2 } from 'lucide-react'

interface Props {
  id: string
  name: string
  price: number
  category: string
  stock: number
  outOfStock: boolean
}

export function AddToCartButton({ id, name, price, category, stock, outOfStock }: Props) {
  const addToCart = useCartStore((state) => state.addToCart)
  const cartItem = useCartStore((state) => state.cart.find((item) => item.id === id))
  const [isAdding, setIsAdding] = useState(false)

  const maxedOut = !outOfStock && (cartItem?.quantity || 0) >= stock

  function handleAdd() {
    if (maxedOut || outOfStock) return
    setIsAdding(true)
    addToCart({ id, name, category, price, quantity: 1, stock })
    setTimeout(() => setIsAdding(false), 1200)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={outOfStock || maxedOut || isAdding}
      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg active:scale-[0.98] ${
        outOfStock || maxedOut
          ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
          : isAdding
            ? 'bg-emerald-600 text-white shadow-emerald-600/10'
            : 'bg-emerald-900 hover:bg-emerald-800 text-white shadow-emerald-900/10 hover:shadow-xl'
      }`}
    >
      {outOfStock ? (
        'Sin stock disponible'
      ) : maxedOut ? (
        'Stock máximo alcanzado'
      ) : isAdding ? (
        <>
          <Check className="w-5 h-5" />
          Agregado al carrito
        </>
      ) : (
        <>
          <ShoppingBag className="w-5 h-5" />
          Agregar al carrito
        </>
      )}
    </button>
  )
}
