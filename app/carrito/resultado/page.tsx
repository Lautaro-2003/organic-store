"use client";

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { useCartStore } from '@/store/cartStore';
import { CheckCircle, XCircle, Clock, ArrowLeft, ShoppingBag, Package, Loader2 } from 'lucide-react';

const statusConfig = {
  approved: {
    title: '¡Pago exitoso!',
    description: 'Tu orden fue confirmada exitosamente.',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  rejected: {
    title: 'Pago rechazado',
    description: 'El pago no pudo ser procesado. Podés intentar con otro medio de pago.',
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  pending: {
    title: 'Pago pendiente',
    description: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
} as const;

type PaymentStatus = keyof typeof statusConfig;

function ResultadoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (status !== 'approved') return;

    let seconds = 5;
    setCountdown(seconds);

    intervalRef.current = setInterval(() => {
      seconds--;
      setCountdown(seconds);
      if (seconds <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        router.push('/mis-compras');
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, router]);

  function goToMyPurchases() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    router.push('/mis-compras');
  }

  useEffect(() => {
    const s = searchParams.get('status') as PaymentStatus | null;
    if (s && s in statusConfig) setStatus(s);
  }, [searchParams]);

  useEffect(() => {
    if (status !== 'approved' || saved || saving) return;
    if (!cart || cart.length === 0) return;

    async function saveOrder() {
      setSaving(true);
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        console.log('[Resultado] session obtenida:', session ? 'ok' : 'null');

        if (!session) {
          setError('No hay sesión activa. Iniciá sesión y volvé a intentar.');
          setSaving(false);
          return;
        }

        const pendingShipping = localStorage.getItem('pending_shipping');
        if (!pendingShipping) {
          setError('No se encontraron datos de envío. Por favor, volvé a iniciar el proceso de compra.');
          setSaving(false);
          return;
        }

        const session_id = localStorage.getItem('pending_session_id');
        if (!session_id) {
          setError('La sesión de compra expiró. Por favor, volvé a iniciar el proceso de compra.');
          setSaving(false);
          return;
        }

        const shippingData = JSON.parse(pendingShipping);

        const pendingOrder = localStorage.getItem('pending_order');
        const couponCode = pendingOrder ? JSON.parse(pendingOrder).coupon_code : null;

        async function postOrder(sid: string | null) {
          return fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session!.access_token}`,
            },
            body: JSON.stringify({
              items: cart.map(({ id, name, quantity, price }) => ({ id, name, quantity, price })),
              shipping_address: shippingData,
              ...(sid ? { session_id: sid } : {}),
              ...(couponCode ? { coupon_code: couponCode } : {}),
            }),
          })
        }

        console.log('[Resultado] Enviando POST a /api/orders');
        let res = await postOrder(session_id)
        console.log('[Resultado] Respuesta POST /api/orders:', res.status, res.statusText);

        if (!res.ok && res.status === 409) {
          console.log('[Resultado] Sesión expirada, reintentando sin session_id');
          res = await postOrder(null)
          console.log('[Resultado] Reintento respuesta:', res.status, res.statusText);
        }

        const data = await res.json();
        console.log('[Resultado] Body respuesta:', data);

        if (res.ok) {
          localStorage.removeItem('pending_shipping');
          localStorage.removeItem('pending_session_id');
          clearCart();
          setSaved(true);
        } else {
          setError(data.error || 'Error al guardar la orden. Contactanos para asistencia.');
        }
      } catch (err) {
        console.error('[Resultado] Error al guardar la orden:', err);
        setError('Error de conexión. Tu pago fue procesado pero no pudimos guardar la orden.');
      } finally {
        setSaving(false);
      }
    }

    saveOrder();
  }, [status, cart, saved, saving]);

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="py-12 max-w-lg mx-auto">
      <div className={`${config.bg} border ${config.border} rounded-3xl p-10 text-center shadow-sm`}>
        <Icon className={`w-20 h-20 ${config.color} mx-auto mb-6 ${saving ? 'animate-pulse' : ''}`} />
        <h1 className="text-2xl font-black text-stone-900 mb-3">{config.title}</h1>
          <p className="text-stone-600 text-sm mb-8 leading-relaxed">
            {error ? '' : saving ? 'Guardando tu orden...' : config.description}
          </p>
          {status === 'approved' && !saving && countdown > 0 && (
            <p className="text-stone-500 text-xs mb-6">
              Serás redirigido a Mis Compras en {countdown} segundos...
            </p>
          )}
        {error && (
          <p className="text-red-500 text-sm mb-8 leading-relaxed font-semibold">{error}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {status === 'approved' ? (
            <>
              <button
                onClick={goToMyPurchases}
                className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md"
              >
                <Package className="w-4 h-4" />
                Ver mis compras
              </button>
              <Link
                href="/productos"
                className="inline-flex items-center justify-center gap-2 bg-white border border-stone-200 text-stone-700 font-bold px-6 py-3 rounded-xl transition-all text-sm hover:bg-stone-50"
              >
                <ShoppingBag className="w-4 h-4" />
                Seguir comprando
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/carrito"
                className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al carrito
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-white border border-stone-200 text-stone-700 font-bold px-6 py-3 rounded-xl transition-all text-sm hover:bg-stone-50"
              >
                Ir al inicio
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense fallback={
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    }>
      <ResultadoContent />
    </Suspense>
  );
}
