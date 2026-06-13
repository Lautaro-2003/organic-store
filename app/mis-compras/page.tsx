"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Package, ShoppingBag, Loader2, Calendar, CreditCard, ArrowLeft } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MisComprasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }

    async function fetchOrders() {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      if (!session) { setLoading(false); return }

      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (data.orders) setOrders(data.orders)
      setLoading(false)
    }

    fetchOrders()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="py-12 max-w-4xl mx-auto text-center">
        <div className="bg-white border border-stone-200 rounded-2xl p-12 shadow-sm">
          <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-stone-900 mb-2">No tenés compras aún</h2>
          <p className="text-stone-500 text-sm mb-6">
            Cuando realices tu primera compra, el historial aparecerá acá.
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md shadow-emerald-800/10"
          >
            <ShoppingBag className="w-4 h-4" />
            Ver Productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
          Tu cuenta
        </span>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          Mis Compras
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {orders.length} orden{orders.length !== 1 ? 'es' : ''} realizada{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(order.created_at)}
                </div>
                <p className="text-[10px] font-mono text-stone-400">
                  ID: {order.id.slice(0, 8)}...
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  <CreditCard className="w-3 h-3" />
                  {order.status === 'confirmed' ? 'Confirmada' : order.status}
                </span>
                <p className="font-black text-stone-900 text-lg mt-1">
                  $ {order.total.toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-2">
              {order.items.map((item: OrderItem) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{item.name}</span>
                    <span className="text-stone-400 font-medium">x{item.quantity}</span>
                  </div>
                  <span className="font-semibold text-stone-700">
                    $ {(item.price * item.quantity).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-emerald-700 font-bold text-sm hover:text-emerald-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
