"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useCartStore } from '@/store/cartStore';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Loader } from 'lucide-react';

export default function CarritoPage() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCartStore();
  const [checkingOut, setCheckingOut] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 15000 ? 0 : 1500;
  const total = subtotal + shipping;

  const createPreference = async () => {
    setCheckingOut(true);
    setError('');
    try {
      const res = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreferenceId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con Mercado Pago');
    } finally {
      setCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-12 max-w-4xl mx-auto text-center">
        <div className="bg-white border border-stone-200 rounded-2xl p-12 shadow-sm">
          <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-stone-900 mb-2">Tu carrito está vacío</h2>
          <p className="text-stone-500 text-sm mb-6">
            Agregá productos desde nuestro catálogo para empezar tu pedido.
          </p>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md shadow-emerald-800/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Ver Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Tu pedido
          </span>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            Mi Carrito ({totalItems})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-red-500 font-medium transition flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-white p-5 border border-stone-200 rounded-2xl shadow-sm hover:shadow-md transition duration-200"
            >
              <div className="w-16 h-16 bg-stone-100 border border-stone-200/60 rounded-xl flex items-center justify-center text-[10px] text-stone-400 font-bold uppercase tracking-wider shrink-0">
                {item.category.slice(0, 2)}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wide">
                  {item.category}
                </span>
                <h4 className="font-bold text-stone-800 text-base mt-1 truncate">{item.name}</h4>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-stone-200 rounded-lg">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="p-1.5 text-stone-500 hover:text-stone-800 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-sm font-bold text-stone-900">{item.quantity}</span>
                    <button
                      onClick={() => addToCart({ ...item, quantity: 1 })}
                      className="p-1.5 text-stone-500 hover:text-stone-800 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-stone-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block leading-none mb-0.5">
                  Precio
                </span>
                <span className="font-black text-stone-900 text-lg">
                  $ {(item.price * item.quantity).toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-stone-200 p-6 rounded-2xl h-fit shadow-sm sticky top-24">
          <h3 className="font-bold text-stone-800 text-xs uppercase tracking-widest border-b border-stone-100 pb-3 mb-4">
            Resumen
          </h3>
          <div className="space-y-2.5 text-sm text-stone-600 border-b border-stone-100 pb-4 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-stone-900">$ {subtotal.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span>Envío</span>
              {shipping === 0 ? (
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  ¡Gratis!
                </span>
              ) : (
                <span className="font-medium text-stone-900">$ {shipping.toLocaleString('es-AR')}</span>
              )}
            </div>
            {shipping > 0 && (
              <p className="text-[10px] text-stone-400 mt-1">
                Sumá $ {(15000 - subtotal).toLocaleString('es-AR')} más para envío gratis
              </p>
            )}
          </div>
          <div className="flex justify-between font-black text-xl text-stone-900 mb-6">
            <span>Total:</span>
            <span>$ {total.toLocaleString('es-AR')}</span>
          </div>

          {!preferenceId ? (
            <button
              onClick={createPreference}
              disabled={checkingOut}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3.5 rounded-xl transition duration-200 text-sm shadow-md shadow-emerald-700/10 hover:shadow-lg active:scale-[0.98] transform flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {checkingOut ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                'Pagar con Mercado Pago'
              )}
            </button>
          ) : (
            <div className="wallet-container">
              <Wallet initialization={{ preferenceId }} />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 text-center mt-3">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
