import type { Metadata } from 'next'
import { Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidad - Orgánico',
  description: 'Conocé cómo protegemos tus datos personales en nuestra tienda orgánica online.',
  openGraph: {
    title: 'Política de Privacidad - Orgánico',
    description: 'Conocé cómo protegemos tus datos personales.',
  },
}

export default function PrivacidadPage() {
  return (
    <div className="py-12 max-w-3xl mx-auto">
      <div className="mb-10 text-center">
        <div className="bg-emerald-50 text-emerald-700 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-2">Política de Privacidad</h1>
        <p className="text-stone-500 text-sm">Última actualización: junio 2026</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-8 md:p-10 shadow-sm space-y-8 text-sm text-stone-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-black text-stone-900 mb-3">1. Información que recopilamos</h2>
          <p>Al registrarte en nuestra tienda, recopilamos tu nombre, dirección de email y los datos de envío necesarios para procesar tus pedidos. También almacenamos información sobre tus compras para brindarte un historial completo.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-900 mb-3">2. Uso de la información</h2>
          <p>Utilizamos tus datos exclusivamente para:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Procesar y gestionar tus pedidos</li>
            <li>Enviarte actualizaciones sobre el estado de tus compras</li>
            <li>Mejorar nuestra experiencia de compra</li>
            <li>Enviarte nuestro newsletter (solo si lo solicitaste)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-900 mb-3">3. Protección de datos</h2>
          <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra accesos no autorizados, pérdida o destrucción. Todos los pagos se procesan a través de Mercado Pago, que cumple con los más altos estándares de seguridad financiera.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-900 mb-3">4. Tus derechos</h2>
          <p>En cualquier momento podés solicitar la modificación o eliminación de tus datos personales escribiéndonos a <a href="mailto:privacidad@organico.com" className="text-emerald-700 font-semibold hover:text-emerald-800">privacidad@organico.com</a>. También podés darte de baja del newsletter en cualquier momento.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-900 mb-3">5. Cookies</h2>
          <p>Usamos cookies esenciales para el funcionamiento de la tienda (carrito de compras, sesión de usuario). No utilizamos cookies de rastreo publicitario sin tu consentimiento explícito.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-900 mb-3">6. Contacto</h2>
          <p>Si tenés preguntas sobre esta política, escribinos a <a href="mailto:privacidad@organico.com" className="text-emerald-700 font-semibold hover:text-emerald-800">privacidad@organico.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
