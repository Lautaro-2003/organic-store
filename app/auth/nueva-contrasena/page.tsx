"use client"

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Leaf, Loader2, Lock, AlertCircle, Check, Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function NuevaContrasenaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabaseBrowser.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/auth/login'), 2500)
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm text-center">
            <div className="bg-emerald-50 text-emerald-700 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 mb-2">¡Contraseña actualizada!</h1>
            <p className="text-stone-500 text-sm">
              Redirigiendo al inicio de sesión...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="bg-emerald-50 text-emerald-700 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-stone-900">Nueva Contraseña</h1>
            <p className="text-stone-500 text-sm mt-1">Ingresá tu nueva contraseña</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-10 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Repetí la contraseña"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 pl-10 pr-10 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition duration-200 flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-emerald-800/10"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Actualizar contraseña'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-stone-500 mt-6">
            <Link href="/auth/login" className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:text-emerald-800 transition">
              <ArrowLeft className="w-3 h-3" />
              Volver a Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
