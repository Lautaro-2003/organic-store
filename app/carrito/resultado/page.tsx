"use client";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';

const statusConfig = {
  success: {
    title: '¡Pago aprobado!',
    description: 'Tu orden fue confirmada exitosamente. En breve recibirás un email con los detalles.',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  failure: {
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
  const [status, setStatus] = useState<PaymentStatus>('pending');

  useEffect(() => {
    const s = searchParams.get('status') as PaymentStatus | null;
    if (s && s in statusConfig) setStatus(s);
  }, [searchParams]);

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="py-12 max-w-lg mx-auto">
      <div className={`${config.bg} border ${config.border} rounded-3xl p-10 text-center shadow-sm`}>
        <Icon className={`w-20 h-20 ${config.color} mx-auto mb-6`} />
        <h1 className="text-2xl font-black text-stone-900 mb-3">{config.title}</h1>
        <p className="text-stone-600 text-sm mb-8 leading-relaxed">{config.description}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {status === 'success' ? (
            <Link
              href="/productos"
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              Seguir comprando
            </Link>
          ) : (
            <Link
              href="/carrito"
              className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al carrito
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white border border-stone-200 text-stone-700 font-bold px-6 py-3 rounded-xl transition-all text-sm hover:bg-stone-50"
          >
            Ir al inicio
          </Link>
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
