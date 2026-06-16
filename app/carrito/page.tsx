"use client";

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Loader, CreditCard, ChevronDown, ChevronUp, Tag, Percent, X, LogIn } from 'lucide-react';

interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  apartment: string;
  neighborhood: string;
  province: string;
  zipCode: string;
  notes: string;
}

const emptyShipping: ShippingAddress = {
  fullName: '', phone: '', street: '', apartment: '',
  neighborhood: '', province: 'Santa Fe', zipCode: '', notes: '',
};

const provinces = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
];

export default function CarritoPage() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, clearCart } = useCartStore();
  const { user } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [shipping, setShipping] = useState<ShippingAddress>(emptyShipping);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 15000 ? 0 : 1500;
  const discountPercent = appliedCoupon?.discount_percent ?? 0;
  const discount = Math.round(subtotal * discountPercent / 100);
  const total = subtotal + shippingCost - discount;

  function validateForm(): boolean {
    const errors: string[] = [];
    if (!shipping.fullName.trim()) errors.push('Nombre completo');
    if (!shipping.phone.trim()) errors.push('Teléfono');
    if (!shipping.street.trim()) errors.push('Calle y número');
    if (!shipping.neighborhood.trim()) errors.push('Barrio/Localidad');
    if (!shipping.province) errors.push('Provincia');
    if (!shipping.zipCode.trim()) errors.push('Código postal');
    if (shipping.neighborhood.trim() && !shipping.neighborhood.toLowerCase().includes('rosario')) {
      setError('Lo sentimos, por el momento solo realizamos envíos dentro de Rosario.');
      setFormErrors(errors);
      return false;
    }
    setFormErrors(errors);
    return errors.length === 0;
  }

  const createPreference = async () => {
    if (!validateForm()) return;

    setCheckingOut(true);
    setError('');

    localStorage.setItem('pending_order', JSON.stringify({
      items: cart,
      total,
      subtotal,
      discount,
      discount_percent: discountPercent,
      coupon_code: appliedCoupon?.code,
      shipping_cost: shippingCost,
      shipping_address: shipping,
    }));
    localStorage.setItem('pending_shipping', JSON.stringify(shipping));

    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      if (!session) {
        setError('Debés iniciar sesión para continuar')
        return
      }
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: cart,
          coupon_code: appliedCoupon?.code || null,
          discount_percent: discountPercent || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('pending_session_id', data.session_id);
      setPreferenceId(data.id);
    } catch (err) {
      localStorage.removeItem('pending_order');
      localStorage.removeItem('pending_session_id');
      setError(err instanceof Error ? err.message : 'Error al conectar con Mercado Pago');
    } finally {
      setCheckingOut(false);
    }
  };

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    setAppliedCoupon(null)

    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      if (!session) {
        setCouponError('Debés iniciar sesión para usar cupones')
        return
      }
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ code: couponCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCouponError(data.error || 'Cupón inválido')
        return
      }
      setAppliedCoupon({ code: data.code, discount_percent: data.discount_percent })
      setCouponCode('')
    } catch {
      setCouponError('Error al validar el cupón')
    } finally {
      setCouponLoading(false)
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null)
    setCouponError('')
  }

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
    <div className="py-12 max-w-5xl mx-auto overflow-x-hidden">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Tu pedido
          </span>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-stone-900 tracking-tight break-words">
            Mi Carrito ({totalItems})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-red-500 font-medium transition flex items-center gap-1 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5 shrink-0" />
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
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
                      onClick={() => {
                        if (item.stock > 0 && item.quantity >= item.stock) return;
                        addToCart({ ...item, quantity: 1 });
                      }}
                      disabled={item.stock > 0 && item.quantity >= item.stock}
                      className={`p-1.5 transition rounded ${item.stock > 0 && item.quantity >= item.stock ? 'text-stone-300 cursor-not-allowed' : 'text-stone-500 hover:text-stone-800'}`}
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

          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full flex items-center justify-between p-5 hover:bg-stone-50/50 transition"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="M3.27 6.96L12 12.01l8.73-5.05" />
                  <path d="M12 22.08V12" />
                </svg>
                <span className="font-bold text-stone-800 text-sm">Dirección de envío</span>
              </div>
              {showForm ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
            </button>

            {showForm && (
              <div className="px-5 pb-5 border-t border-stone-100 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Nombre completo *</label>
                    <input type="text" value={shipping.fullName} onChange={e => setShipping(p => ({ ...p, fullName: e.target.value }))} placeholder="María García" className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Teléfono *</label>
                    <input type="tel" value={shipping.phone} onChange={e => setShipping(p => ({ ...p, phone: e.target.value }))} placeholder="11 1234-5678" className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Código postal *</label>
                    <input type="text" value={shipping.zipCode} onChange={e => setShipping(p => ({ ...p, zipCode: e.target.value }))} placeholder="1425" className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Calle y número *</label>
                    <input type="text" value={shipping.street} onChange={e => setShipping(p => ({ ...p, street: e.target.value }))} placeholder="Av. Corrientes 1234" className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Piso/Depto</label>
                    <input type="text" value={shipping.apartment} onChange={e => setShipping(p => ({ ...p, apartment: e.target.value }))} placeholder="3° B" className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Barrio/Localidad *</label>
                    <input type="text" value={shipping.neighborhood} onChange={e => setShipping(p => ({ ...p, neighborhood: e.target.value }))} placeholder="Palermo" className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Provincia *</label>
                    <select value={shipping.province} disabled className="w-full bg-stone-100 border border-stone-200 rounded-xl py-2.5 px-3.5 text-sm text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition appearance-none cursor-not-allowed">
                      <option value="Santa Fe">Santa Fe</option>
                    </select>
                    <p className="text-[10px] text-stone-400 mt-1.5">Solo realizamos envíos en Rosario, Santa Fe.</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider mb-1">Notas adicionales</label>
                    <input type="text" value={shipping.notes} onChange={e => setShipping(p => ({ ...p, notes: e.target.value }))} placeholder="Ej: timbre roto, llamar antes de llegar" className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm sticky top-24">
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
                {shippingCost === 0 ? (
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    ¡Gratis!
                  </span>
                ) : (
                  <span className="font-medium text-stone-900">$ {shippingCost.toLocaleString('es-AR')}</span>
                )}
              </div>
              {shippingCost > 0 && (
                <p className="text-[10px] text-stone-400 mt-1">
                  Sumá $ {(15000 - subtotal).toLocaleString('es-AR')} más para envío gratis
                </p>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Descuento ({appliedCoupon?.code})</span>
                  <span className="font-bold">- $ {discount.toLocaleString('es-AR')}</span>
                </div>
              )}
            </div>

            <div className="mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">{appliedCoupon.code}</span>
                    <span className="text-xs text-emerald-600 font-semibold">({appliedCoupon.discount_percent}% OFF)</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-emerald-500 hover:text-emerald-700 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : user ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon() } }}
                      placeholder="Código de descuento"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition disabled:opacity-50"
                  >
                    {couponLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Aplicar'}
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-500 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Iniciá sesión para usar cupones de descuento
                </Link>
              )}
              {couponError && (
                <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
              )}
            </div>

            <div className="flex justify-between font-black text-xl text-stone-900 mb-6">
              <span>Total:</span>
              <span>$ {total.toLocaleString('es-AR')}</span>
            </div>

            {formErrors.length > 0 && (
              <div className="bg-red-50 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl mb-4">
                Completá los campos obligatorios: {formErrors.join(', ')}
              </div>
            )}

            {!preferenceId ? (
              <button
                onClick={createPreference}
                disabled={checkingOut}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3.5 rounded-xl transition duration-200 text-sm shadow-md shadow-emerald-700/10 hover:shadow-lg active:scale-[0.98] transform flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {checkingOut ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Continuar al pago
                  </>
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

            <div className="mt-5 pt-4 border-t border-stone-100">
              <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider text-center mb-3">
                Pagá con
              </p>
              <div className="flex items-center justify-center gap-4">
                <svg viewBox="0 0 48 32" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="32" rx="4" fill="#1A1F71"/>
                  <text x="24" y="20" textAnchor="middle" fill="white" fontFamily="Arial" fontSize="14" fontWeight="bold">V</text>
                </svg>
                <svg viewBox="0 0 48 32" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="32" rx="4" fill="#EB001B"/>
                  <circle cx="18" cy="16" r="10" fill="#F79E1B" fillOpacity="0.3"/>
                  <circle cx="30" cy="16" r="10" fill="#EB001B" fillOpacity="0.3"/>
                </svg>
                <svg viewBox="0 0 48 32" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="32" rx="4" fill="#00B4E0"/>
                  <text x="24" y="20" textAnchor="middle" fill="white" fontFamily="Arial" fontSize="12" fontWeight="bold">MP</text>
                </svg>
              </div>
              <p className="text-[10px] text-stone-400 text-center mt-2">
                Tarjeta de crédito, débito o Mercado Pago
              </p>
            </div>
          </div>

          {!showForm && !preferenceId && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white border border-stone-200 rounded-xl py-3 transition flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="M3.27 6.96L12 12.01l8.73-5.05" />
                <path d="M12 22.08V12" />
              </svg>
              Agregar dirección de envío
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
