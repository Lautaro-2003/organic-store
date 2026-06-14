import type { Metadata } from 'next'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Términos y Condiciones - Orgánico',
  description: 'Términos y condiciones de uso de nuestra tienda orgánica online.',
  openGraph: {
    title: 'Términos y Condiciones - Orgánico',
    description: 'Términos y condiciones de uso de nuestra tienda orgánica online.',
  },
}

export default function TerminosPage() {
  return (
    <div className="py-12 max-w-3xl mx-auto">
      <div className="mb-10 text-center">
        <div className="bg-emerald-50 text-emerald-700 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-2">Términos y Condiciones</h1>
        <p className="text-stone-500 text-sm">Última actualización: junio 2026</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl p-8 md:p-10 shadow-sm space-y-8 text-sm text-stone-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-black text-stone-900 mb-3">1. Aceptación de los términos</h2>
          <p>Al acceder y utilizar esta tienda online, aceptás los presentes términos y condiciones. Si no estás de acuerdo, por favor no uses nuestros servicios.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-900 mb-3">2. Productos y precios</h2>
          <p>Todos los precios están expresados en pesos argentinos (ARS) e incluyen IVA. Nos reservamos el derecho de modificar precios sin previo aviso, pero los pedidos ya confirmados mantendrán el precio al momento de la compra.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-900 mb-3">3. Envíos y entregas</h2>
          <p>Realizamos envíos a todo el país a través de correo privado. Los plazos de entrega varían según la ubicación: CABA y GBA (1-3 días hábiles), interior del país (3-7 días hábiles). El envío es gratuito para compras superiores a $15.000.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-900 mb-3">4. Cambios y devoluciones</h2>
          <p>Aceptamos cambios y devoluciones dentro de los 10 días posteriores a la recepción del pedido, siempre que el producto esté en su estado original. Contactanos a <a href="mailto:tienda@organico.com" className="text-emerald-700 font-semibold hover:text-emerald-800">tienda@organico.com</a> para gestionar el proceso.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-900 mb-3">5. Medios de pago</h2>
          <p>Aceptamos tarjetas de crédito y débito, transferencias bancarias y pagos a través de Mercado Pago. Todos los pagos son procesados de forma segura por Mercado Pago.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-900 mb-3">6. Responsabilidad</h2>
          <p>Orgánico no se responsabiliza por demoras en la entrega causadas por el correo o por eventos de fuerza mayor. Tampoco nos responsabilizamos por el uso indebido de los productos adquiridos.</p>
        </section>

        <section>
          <h2 className="text-lg font-black text-stone-900 mb-3">7. Contacto</h2>
          <p>Para consultas sobre estos términos, escribinos a <a href="mailto:legal@organico.com" className="text-emerald-700 font-semibold hover:text-emerald-800">legal@organico.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
