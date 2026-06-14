"use client";

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Leaf, Mail, Camera, Globe, MessageCircle, Send, Check, Loader, Shield } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al suscribir');
      }

      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-100 px-6 py-12 mt-20 rounded-t-[2.5rem]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-stone-800 pb-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">ORGÁNICO</span>
          </div>
          <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
            Alimentación consciente y sustentable para el bienestar y la vitalidad de toda tu familia. Productos orgánicos premium directo a tu hogar.
          </p>
          {/* Social */}
          <div className="flex items-center gap-3 mt-6">
            <a
              href="#"
              className="bg-stone-800 hover:bg-emerald-700 text-stone-400 hover:text-white w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              aria-label="Instagram"
            >
              <Camera className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="bg-stone-800 hover:bg-emerald-700 text-stone-400 hover:text-white w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              aria-label="Facebook"
            >
              <Globe className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="bg-stone-800 hover:bg-emerald-700 text-stone-400 hover:text-white w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a
              href="mailto:hola@organico.com"
              className="bg-stone-800 hover:bg-emerald-700 text-stone-400 hover:text-white w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Navigation + Legal */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Navegación</span>
            <Link href="/" className="text-stone-400 hover:text-white transition duration-200 text-sm">Inicio</Link>
            <Link href="/productos" className="text-stone-400 hover:text-white transition duration-200 text-sm">Productos</Link>
            <Link href="/sobre-nosotros" className="text-stone-400 hover:text-white transition duration-200 text-sm">Sobre Nosotros</Link>
            <Link href="/carrito" className="text-stone-400 hover:text-white transition duration-200 text-sm">Mi Carrito</Link>
            <Link href="/mis-compras" className="text-stone-400 hover:text-white transition duration-200 text-sm">Mis Compras</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Información</span>
            <Link href="/privacidad" className="text-stone-400 hover:text-white transition duration-200 text-sm">Política de Privacidad</Link>
            <Link href="/terminos" className="text-stone-400 hover:text-white transition duration-200 text-sm">Términos y Condiciones</Link>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <span className="font-semibold text-white text-xs uppercase tracking-wider mb-3 block">Newsletter</span>
          <p className="text-stone-400 text-sm mb-4 leading-relaxed">
            Recibí novedades, recetas saludables y ofertas exclusivas directamente en tu correo.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-stone-800 border border-stone-700 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 ${
                subscribed
                  ? 'bg-emerald-600 text-white'
                  : loading
                    ? 'bg-emerald-600/50 text-white cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10 hover:shadow-lg active:scale-95'
              }`}
            >
              {subscribed ? (
                <><Check className="w-3.5 h-3.5" /><span>Suscrito</span></>
              ) : loading ? (
                <Loader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <><Send className="w-3.5 h-3.5" /><span>Enviar</span></>
              )}
            </button>
          </form>
          {subscribed && (
            <p className="text-emerald-400 text-xs mt-2 animate-pulse">¡Gracias por suscribirte!</p>
          )}
          {error && (
            <p className="text-red-400 text-xs mt-2">{error}</p>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row justify-between text-xs text-stone-500 gap-2">
        <span>© 2026 Tienda Orgánica. Todos los derechos reservados.</span>
        <span className="font-medium">Diseño Premium & Minimalista</span>
      </div>
    </footer>
  );
}
