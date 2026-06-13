import { MessageCircle } from 'lucide-react';

export default function WhatsappButton() {
  return (
    <a
      href="https://wa.me/5493412604111?text=¡Hola!%20Buenos%20días,%20tengo%20una%20consulta%20sobre%20sus%20productos%20🌿"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}
