import type { Metadata } from 'next'
import { Leaf, Sprout, Heart, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre Nosotros - Orgánico',
  description: 'Conocé nuestra historia, misión y valores. Somos un mercado orgánico argentino comprometido con la alimentación consciente y sustentable.',
  openGraph: {
    title: 'Sobre Nosotros - Orgánico',
    description: 'Conocé nuestra historia, misión y valores.',
  },
}

const values = [
  {
    icon: Sprout,
    title: 'Origen Responsable',
    description: 'Trabajamos directamente con productores agroecológicos certificados de Mendoza, Río Negro y el noroeste argentino.',
  },
  {
    icon: Heart,
    title: 'Compromiso con tu Salud',
    description: 'Cada producto es seleccionado por su perfil nutricional, libre de agrotóxicos, conservantes y aditivos artificiales.',
  },
  {
    icon: Leaf,
    title: 'Sustentabilidad Real',
    description: 'Usamos empaques compostables, compensamos nuestra huella de carbono y promovemos la economía circular.',
  },
  {
    icon: Shield,
    title: 'Comercio Justo',
    description: 'Pagamos precios justos a nuestros productores y garantizamos trazabilidad completa de cada producto.',
  },
]

export default function SobreNosotrosPage() {
  return (
    <div className="py-12 max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
          Quiénes somos
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight mb-4">
          Sobre Nosotros
        </h1>
        <p className="text-stone-600 text-base leading-relaxed max-w-2xl mx-auto">
          Orgánico nació en 2020 con una misión clara: acercar alimentos reales, libres de químicos y producidos 
          con respeto por el ambiente, a los hogares de toda Argentina.
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-8 md:p-10 shadow-sm mb-12">
        <h2 className="text-xl font-black text-stone-900 mb-4">Nuestra Historia</h2>
        <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
          <p>
            Todo empezó en un pequeño departamento de Buenos Aires, cuando sus fundadores —una pareja de 
            nutricionistas y emprendedores— notaron lo difícil que era encontrar productos orgánicos de calidad 
            a precios accesibles. Los pocos que existían estaban dispersos en dietéticas de barrio o en 
            cadenas que no garantizaban su origen.
          </p>
          <p>
            Decidieron crear un puente directo entre los pequeños productores agroecológicos del país y los 
            consumidores conscientes. Así nació Orgánico: una tienda online que prioriza la transparencia, 
            la calidad y el impacto positivo.
          </p>
          <p>
            Hoy trabajamos con más de 15 productores certificados de 6 provincias argentinas, despachamos 
            a todo el país y tenemos una comunidad de más de 10.000 clientes que eligen comer mejor todos los días.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
        {values.map((v, i) => {
          const Icon = v.icon
          return (
            <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl w-fit mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm mb-2">{v.title}</h3>
              <p className="text-stone-500 text-xs leading-relaxed">{v.description}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-gradient-to-br from-emerald-800 to-emerald-600 rounded-3xl p-8 md:p-10 text-center text-white shadow-lg">
        <h2 className="text-2xl font-black mb-3">Sumate a la comunidad</h2>
        <p className="text-sm text-emerald-100 max-w-lg mx-auto mb-6">
          Cada compra que hacés en Orgánico es un voto por un sistema alimentario más justo, saludable y sustentable.
        </p>
        <a
          href="/productos"
          className="inline-flex items-center gap-2 bg-white text-emerald-800 font-bold px-6 py-3 rounded-xl text-sm hover:bg-emerald-50 transition shadow-lg"
        >
          Conocé nuestros productos
        </a>
      </div>
    </div>
  )
}
