"use client"

import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Star, MessageSquare, User, Loader2, Send, Pencil, Trash2 } from 'lucide-react'

interface Review {
  id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  user_name?: string
}

interface Props {
  productId: string
  onReviewSubmitted?: () => void
}

export function ReviewsSection({ productId, onReviewSubmitted }: Props) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState(0)
  const [editHoverRating, setEditHoverRating] = useState(0)
  const [editComment, setEditComment] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/reviews?product_id=${productId}`)
      const data = await res.json()
      if (data.reviews) setReviews(data.reviews)
      setLoading(false)
    }
    load()
  }, [productId])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (rating === 0) { setError('Seleccioná una puntuación'); return }
    if (!comment.trim()) { setError('Escribí un comentario'); return }

    setSubmitting(true)
    const { data: { session } } = await supabaseBrowser.auth.getSession()
    if (!session) { setError('Iniciá sesión para dejar una reseña'); setSubmitting(false); return }

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ product_id: productId, rating, comment: comment.trim() }),
    })

    if (res.ok) {
      const data = await res.json()
      setReviews((prev) => [data.review, ...prev])
      setRating(0)
      setComment('')
      onReviewSubmitted?.()
    } else {
      const data = await res.json()
      setError(data.error || 'Error al enviar la reseña')
    }

    setSubmitting(false)
  }

  function handleStartEdit(review: Review) {
    setEditingId(review.id)
    setEditRating(review.rating)
    setEditComment(review.comment)
    setError('')
    setDeletingId(null)
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditRating(0)
    setEditComment('')
    setError('')
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editingId) return
    if (editRating === 0) { setError('Seleccioná una puntuación'); return }
    if (!editComment.trim()) { setError('Escribí un comentario'); return }

    setEditSubmitting(true)
    const { data: { session } } = await supabaseBrowser.auth.getSession()
    if (!session) { setError('Iniciá sesión'); setEditSubmitting(false); return }

    const res = await fetch('/api/reviews', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id: editingId, rating: editRating, comment: editComment.trim() }),
    })

    if (res.ok) {
      const data = await res.json()
      setReviews((prev) => prev.map((r) => r.id === editingId ? { ...r, ...data.review } : r))
      setEditingId(null)
      setEditRating(0)
      setEditComment('')
      onReviewSubmitted?.()
    } else {
      const data = await res.json()
      setError(data.error || 'Error al actualizar')
    }

    setEditSubmitting(false)
  }

  async function handleDelete(reviewId: string) {
    const { data: { session } } = await supabaseBrowser.auth.getSession()
    if (!session) { setError('Iniciá sesión para eliminar'); return }

    console.log('[ReviewsSection] handleDelete ejecutado:', { reviewId, token: session.access_token?.slice(0, 20) + '...' })

    const res = await fetch(`/api/reviews?id=${reviewId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })

    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      setDeletingId(null)
      onReviewSubmitted?.()
    } else {
      const data = await res.json()
      setError(data.error || 'Error al eliminar')
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <section className="border-t border-stone-200 pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Reseñas</h2>
          {avgRating && (
            <p className="text-sm text-stone-500 mt-1">
              {reviews.length} opinión{reviews.length !== 1 ? 'es' : ''} — {avgRating} promedio
            </p>
          )}
        </div>
        {!loading && (
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4 text-stone-400" />
            <span className="text-sm font-bold text-stone-500">{reviews.length}</span>
          </div>
        )}
      </div>

      {user && (
        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="font-bold text-stone-900 text-sm mb-4">Dejá tu reseña</h3>

          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => {
              const star = i + 1
              const filled = star <= (hoverRating || rating)
              return (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${filled ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`}
                  />
                </button>
              )
            })}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Contá tu experiencia con este producto..."
            rows={3}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none mb-4"
          />

          {error && (
            <p className="text-red-500 text-xs font-semibold mb-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting ? 'Enviando...' : 'Publicar reseña'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white border border-stone-200 rounded-2xl">
          <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-semibold">Este producto no tiene reseñas aún</p>
          <p className="text-stone-400 text-sm mt-1">
            {user ? 'Sé el primero en opinar' : 'Iniciá sesión para dejar tu reseña'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-sm">{review.user_name || 'Usuario'}</p>
                    <p className="text-[10px] text-stone-400">{formatDate(review.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`}
                      />
                    ))}
                  </div>
                  {user && review.user_id === user.id && editingId !== review.id && (
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        onClick={() => handleStartEdit(review)}
                        className="p-1 text-stone-400 hover:text-emerald-600 transition rounded-lg hover:bg-stone-100"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(deletingId === review.id ? null : review.id)}
                        className="p-1 text-stone-400 hover:text-red-600 transition rounded-lg hover:bg-stone-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {editingId === review.id ? (
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const star = i + 1
                      const filled = star <= (editHoverRating || editRating)
                      return (
                        <button
                          key={i}
                          type="button"
                          onMouseEnter={() => setEditHoverRating(star)}
                          onMouseLeave={() => setEditHoverRating(0)}
                          onClick={() => setEditRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-5 h-5 ${filled ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`}
                          />
                        </button>
                      )
                    })}
                  </div>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={2}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={editSubmitting}
                      className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition disabled:opacity-60"
                    >
                      {editSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Guardar'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-xs font-bold text-stone-400 hover:text-stone-600 transition px-3 py-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-stone-600 text-sm leading-relaxed">{review.comment}</p>
                  {deletingId === review.id && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-100">
                      <span className="text-xs text-stone-500">¿Eliminar esta reseña?</span>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 transition"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="text-xs font-bold text-stone-400 hover:text-stone-600 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
