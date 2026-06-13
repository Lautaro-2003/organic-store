import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import { readProducts } from '@/lib/products';
import { Truck, ShieldCheck, Headphones, Quote, Leaf, Sparkles } from 'lucide-react';

export default async function HomePage() {
  const products = await readProducts();
  const featuredProducts = products.slice(0, 3);

  const values = [
    {
      icon: Leaf,
      title: '100% Orgánico y Natural',
      description: 'Todos nuestros productos son seleccionados de productores certificados, libres de pesticidas y químicos artificiales.',
    },
    {
      icon: Truck,
      title: 'Envío Rápido y Seguro',
      description: 'Despachamos el mismo día. Envíos sin cargo en compras superiores a $15.000 con seguimiento en tiempo real.',
    },
    {
      icon: ShieldCheck,
      title: 'Compra Protegida',
      description: 'Tus datos y pagos están encriptados. Aceptamos tarjetas, transferencias y billeteras digitales.',
    },
    {
      icon: Headphones,
      title: 'Atención Personalizada',
      description: 'Un equipo de nutricionistas y asesores responde tus consultas de lunes a sábados en menos de 2 horas.',
    },
  ];

  const testimonials = [
    {
      name: 'María Fernanda López',
      role: 'Cliente frecuente',
      quote: 'Desde que compro en Orgánico mi cocina cambió por completo. La granola y la miel son increíbles, se nota que son productos de verdad.',
      initials: 'ML',
      color: 'bg-emerald-600',
    },
    {
      name: 'Carlos Martínez',
      role: 'Deportista y nutrición saludable',
      quote: 'Las almendras premium son las mejores que probé. Las uso para mis snacks post-entreno y la calidad es superior a cualquier otra marca.',
      initials: 'CM',
      color: 'bg-amber-500',
    },
    {
      name: 'Sofía Ramírez',
      role: 'Mamá consciente',
      quote: 'Por fin encuentro un lugar donde todo es orgánico de verdad. La harina de almendras me salvó para las recetas sin gluten de mis hijos.',
      initials: 'SR',
      color: 'bg-stone-700',
    },
  ];

  const banners = [
    {
      title: 'Primera compra',
      subtitle: 'Llevate 15% OFF',
      description: 'Usá el código BIENVENIDO15 y empezá tu camino saludable con un descuento especial.',
      gradient: 'from-emerald-800 to-emerald-600',
      iconColor: 'text-emerald-200',
    },
    {
      title: 'Envío gratuito',
      subtitle: 'Desde $15.000',
      description: 'Hacé tu pedido hoy y recibilo sin cargo en la puerta de tu casa. Sin mínimo de productos.',
      gradient: 'from-amber-600 to-amber-500',
      iconColor: 'text-amber-200',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      <Hero />

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
              Selección de la casa
            </span>
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
              Productos Destacados
            </h2>
          </div>
          <a href="/productos" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition duration-200">
            Ver todo el catálogo →
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featuredProducts.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              price={product.price}
              image={product.image}
              description={product.description}
              rating={product.rating}
            />
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-stone-100/80 rounded-3xl p-8 md:p-12 border border-stone-200/50">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Nuestros pilares
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
            ¿Por qué elegirnos?
          </h2>
          <p className="text-stone-500 text-sm mt-2 max-w-lg mx-auto">
            Construimos una experiencia de compra consciente, desde el origen hasta tu mesa.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, i) => {
            const Icon = value.icon;
            return (
              <div key={i} className="bg-white border border-stone-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl w-fit mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900 text-sm mb-2">{value.title}</h3>
                <p className="text-stone-500 text-xs leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Offer Banners */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner, i) => (
          <div
            key={i}
            className={`relative overflow-hidden bg-gradient-to-br ${banner.gradient} rounded-3xl p-8 md:p-10 shadow-lg`}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full blur-3xl translate-y-10 -translate-x-10" />
            <Sparkles className={`absolute top-6 right-6 w-8 h-8 ${banner.iconColor} opacity-60`} />
            <div className="relative">
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{banner.title}</span>
              <h3 className="text-2xl md:text-3xl font-black text-white mt-1 mb-3">{banner.subtitle}</h3>
              <p className="text-sm text-white/80 max-w-xs mb-6">{banner.description}</p>
              <a
                href="/productos"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm backdrop-blur-sm border border-white/20"
              >
                Aprovechar oferta
                <Sparkles className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </section>

      {/* Testimonials */}
      <section>
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Testimonios reales
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-stone-500 text-sm mt-2 max-w-lg mx-auto">
            Familias, deportistas y cocineros conscientes ya forman parte de nuestra comunidad.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white border border-stone-200/60 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
              <Quote className="w-8 h-8 text-emerald-200 mb-4" />
              <p className="text-stone-600 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-stone-100">
                <div className={`w-10 h-10 rounded-full ${t.color} text-white text-xs font-bold flex items-center justify-center`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">{t.name}</p>
                  <p className="text-stone-400 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
