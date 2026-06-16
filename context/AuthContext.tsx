"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const initialised = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const [{ data: { session } }, adminRes] = await Promise.all([
        supabaseBrowser.auth.getSession(),
        fetch('/api/admin/me').then(r => r.json()),
      ])

      if (cancelled) return

      setUser(session?.user ?? null)
      setIsAdmin(adminRes.isAdmin === true)
      setLoading(false)
      initialised.current = true
    }

    init()

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!initialised.current) return

    let cancelled = false

    fetch('/api/admin/me')
      .then(r => r.json())
      .then(data => {
        if (!cancelled) setIsAdmin(data.isAdmin === true)
      })

    return () => { cancelled = true }
  }, [pathname])

  async function signOut() {
    if (isAdmin) {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsAdmin(false)
    }
    await supabaseBrowser.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
