"use client"

import { useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCartStore } from '@/store/cartStore'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function CartAbandonmentSync() {
  const { user } = useAuth()
  const cart = useCartStore((s) => s.cart)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!user || cart.length === 0) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      const items = cart.map(({ id, name, quantity, price }) => ({
        id, name, quantity, price,
      }))

      const { data: existing } = await supabaseBrowser
        .from('abandoned_carts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        await supabaseBrowser
          .from('abandoned_carts')
          .update({ items, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        await supabaseBrowser
          .from('abandoned_carts')
          .insert({
            user_id: user.id,
            email: user.email,
            items,
          })
      }
    }, 2000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [user, cart])

  return null
}
