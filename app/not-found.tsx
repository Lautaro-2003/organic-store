import Link from 'next/link'
import { Leaf, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="text-center max-w-md">
        <div className="bg-emerald-50 text-emerald-700 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Leaf className="w-10 h-10" />
        </div>
        <h1 className="text-6xl font-black text-stone-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-stone-900 mb-3">Página no encontrada</h2>
        <p className="text-stone-500 text-sm mb-8 leading-relaxed">
          La página que buscás no existe o fue movida. 
          Quizás el enlace que seguiste está roto o la página fue eliminada.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-800/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <Link
            href="/productos"
            className="inline-flex items-center justify-center gap-2 bg-white border border-stone-200 text-stone-700 font-bold px-6 py-3 rounded-xl text-sm transition-all hover:bg-stone-50"
          >
            Ver productos
          </Link>
        </div>
      </div>
    </div>
  )
}
