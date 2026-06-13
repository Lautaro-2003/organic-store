import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Award, Truck, ShieldCheck, Star } from 'lucide-react';

export default function Hero() {
  return (
    <div className="space-y-12 my-6">
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-100 via-stone-50 to-emerald-50/50 py-16 md:py-24 px-8 md:px-16 rounded-3xl border border-stone-200/50 shadow-sm flex flex-col lg:flex-row items-center gap-12">
        
        {/* Background Blur Ornaments */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/20 rounded-full blur-3xl -z-10 -translate-x-10 translate-y-10" />

        {/* Left Side: Content */}
        <div className="flex-1 max-w-xl md:max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold tracking-wider text-emerald-800 uppercase bg-emerald-100/60 px-3.5 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-700" />
            <span>Almacén de Vida & Bienestar</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-tight mb-6">
            Alimentación pura para <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-emerald-600">tu bienestar real</span>
          </h1>
          
          <p className="text-stone-600 text-base md:text-lg mb-8 leading-relaxed max-w-lg">
            Descubrí una selección meticulosa de productos orgánicos, frutos secos premium y harinas naturales. Directo de productores conscientes a tu hogar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link 
              href="/productos" 
              className="inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-md shadow-emerald-800/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transform duration-200 text-sm"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#beneficios" 
              className="inline-flex items-center justify-center bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 font-bold px-8 py-4 rounded-2xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transform duration-200 text-sm"
            >
              Conocer Más
            </a>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-3.5 border-t border-stone-200/60 pt-6">
            <div className="flex -space-x-2">
              <span className="w-8 h-8 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-stone-50">AR</span>
              <span className="w-8 h-8 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-stone-50">100%</span>
              <span className="w-8 h-8 rounded-full bg-stone-800 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-stone-50">BIO</span>
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                <span className="font-bold text-stone-800">4.9/5 estrellas</span> por más de 1,500 familias conscientes.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Showcase Image with floating badges */}
        <div className="flex-1 w-full max-w-md lg:max-w-none relative aspect-[4/3] rounded-3xl overflow-hidden border border-stone-200/50 shadow-md">
          <Image 
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1000&q=80"
            alt="Alimentos orgánicos y saludables"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover hover:scale-105 transition-transform duration-700"
          />
          
          {/* Floating Badges */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-stone-100 flex items-center gap-2.5 animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="bg-emerald-100 p-1.5 rounded-xl text-emerald-800">
              <Award className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-stone-900 leading-none">Certificado</span>
              <span className="text-[9px] font-bold text-emerald-700 uppercase mt-0.5">100% Orgánico</span>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-stone-100 flex items-center gap-2.5 animate-bounce" style={{ animationDuration: '4s' }}>
            <div className="bg-amber-100 p-1.5 rounded-xl text-amber-800">
              <Truck className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-stone-900 leading-none">Envío en el Día</span>
              <span className="text-[9px] font-bold text-amber-700 uppercase mt-0.5">A Todo el País</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid / Brand Values */}
      <section id="beneficios" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        <div className="bg-white border border-stone-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-4">
          <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm mb-1">Envío Rápido & Seguro</h3>
            <p className="text-stone-500 text-xs leading-relaxed">
              Despachos inmediatos con seguimiento y envíos gratis en compras superiores a $15.000.
            </p>
          </div>
        </div>

        <div className="bg-white border border-stone-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-4">
          <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm mb-1">Calidad Agroecológica</h3>
            <p className="text-stone-500 text-xs leading-relaxed">
              Productos sin agregados químicos, conservantes ni pesticidas. Directo del campo.
            </p>
          </div>
        </div>

        <div className="bg-white border border-stone-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-4 sm:col-span-2 lg:col-span-1">
          <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm mb-1">Transacciones 100% Protegidas</h3>
            <p className="text-stone-500 text-xs leading-relaxed">
              Pagá con total tranquilidad mediante tarjetas de crédito, débito o transferencias bancarias.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}