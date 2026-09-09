import React, { useState } from "react";
import { Phone, Clock, CreditCard, Star, Tag, Info, MessageCircle, ChevronDown, ChevronUp, Sparkles, Zap } from "lucide-react";

const WA_NUMBER = "584126701633";
const WA_URL = `https://wa.me/${WA_NUMBER}`;

const PROMOTIONS = [
  {
    id: "combo_estrella",
    badge: "⭐ MÁS POPULAR",
    badgeColor: "from-yellow-400/20 to-amber-500/10 border-yellow-400/40 text-yellow-300",
    title: "COMBO ESTRELLA",
    subtitle: "Lavado + Secado + Jabón + Suavizante + Mano de Obra",
    price: "$7.50",
    per: "por cesta",
    detail: "El paquete completo para tu ropa del día a día.",
    highlight: true,
  },
  {
    id: "solo_lavado",
    badge: "💧 Solo Lavado",
    badgeColor: "from-cyan-400/20 to-blue-500/10 border-cyan-400/40 text-cyan-300",
    title: "LAVADO + JABÓN",
    subtitle: "Lavado + Jabón + Mano de Obra (sin secado)",
    price: "$4.50",
    per: "por cesta",
    detail: "Ideal si prefieres secar en casa o solo necesitas el lavado.",
    highlight: false,
  },
  {
    id: "edredones",
    badge: "🛏️ Edredones",
    badgeColor: "from-purple-400/20 to-violet-500/10 border-purple-400/40 text-purple-300",
    title: "EDREDONES",
    subtitle: "Lavado + Secado + Todos los detergentes",
    price: "Desde $10",
    per: "individual / $12 doble / $14 matrimonial",
    detail: "Todo incluido. Sin costo extra por detergentes.",
    highlight: false,
  },
  {
    id: "buses",
    badge: "🚌 Para Empresas",
    badgeColor: "from-green-400/20 to-emerald-500/10 border-green-400/40 text-green-300",
    title: "FORROS DE AUTOBUSES",
    subtitle: "Lavado completo con empaque especial",
    price: "$28 – $36",
    per: "por forro (incluye bolsas)",
    detail: "Incluye lavado, secado, detergentes y bolsas para guardar.",
    highlight: false,
  },
];

const PAYMENT_METHODS = [
  { icon: "💵", name: "Efectivo USD", desc: "Divisas aceptadas" },
  { icon: "🇻🇪", name: "Efectivo Bs", desc: "Bolívares" },
  { icon: "📱", name: "Pago Móvil", desc: "Inmediato" },
  { icon: "🏦", name: "Transferencia", desc: "Bancaria" },
];

const FAQ = [
  { q: "¿Cuándo pago — antes o después?", a: "Como prefieras. Puedes pagar al dejar la ropa o al retirarla." },
  { q: "¿Aceptan Zelle o Binance?", a: "No. Aceptamos: efectivo USD, efectivo Bs, Pago Móvil y Transferencia bancaria venezolana." },
  { q: "¿Cuánto pesa una cesta?", a: "Entre 5 y 7 kg en seco. Equivale a 4-5 pantalones, ~12 franelas, 3-4 toallas o 2 juegos de sábanas completos." },
  { q: "¿Hacen planchado, desmanchado o calzado?", a: "No. Solo lavado y secado de ropa de tela." },
  { q: "¿Entregan a domicilio?", a: "El servicio es presencial. El cliente deja y retira la ropa en el local." },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden" onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
        <span className="text-sm font-semibold text-white pr-4">{item.q}</span>
        {open ? <ChevronUp size={16} className="text-cyan-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
      </div>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">{item.a}</div>
      )}
    </div>
  );
}

export default function PromoInfo() {
  return (
    <section className="space-y-10 mt-8">
      {/* PROMOCIONES */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-yellow-400/20 flex items-center justify-center">
            <Tag size={18} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Precios y Promociones</h2>
            <p className="text-xs text-gray-400">Precios fijos · Sin sorpresas</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {PROMOTIONS.map((promo) => (
            <div
              key={promo.id}
              className={`relative rounded-2xl border bg-gradient-to-br p-5 ${promo.badgeColor} ${promo.highlight ? "ring-2 ring-yellow-400/30" : ""}`}
            >
              {promo.highlight && (
                <div className="absolute -top-3 left-4">
                  <span className="px-3 py-1 rounded-full bg-yellow-400 text-black text-[10px] font-black tracking-widest uppercase shadow-lg">
                    ⭐ El más pedido
                  </span>
                </div>
              )}
              <div className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-3 ${promo.badgeColor}`}>
                {promo.badge}
              </div>
              <h3 className="text-base font-extrabold text-white leading-tight">{promo.title}</h3>
              <p className="text-xs text-gray-300 mt-1 mb-3 leading-relaxed">{promo.subtitle}</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-white">{promo.price}</span>
                <span className="text-xs text-gray-400 mb-1">{promo.per}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">{promo.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MÉTODOS DE PAGO */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-green-400/20 flex items-center justify-center">
            <CreditCard size={18} className="text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Métodos de Pago</h2>
            <p className="text-xs text-gray-400">Sin Zelle · Sin Binance · Solo Venezuela</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PAYMENT_METHODS.map((pm) => (
            <div key={pm.name} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center hover:border-green-400/30 transition-colors">
              <div className="text-3xl mb-2">{pm.icon}</div>
              <p className="text-xs font-bold text-white">{pm.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{pm.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HORARIO & CONTACTO */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-cyan-400" />
            <h3 className="font-extrabold text-white">Horario de Atención</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">📅 Lun – Sáb</span>
              <span className="text-sm font-bold text-white bg-cyan-500/20 rounded-lg px-2.5 py-0.5 border border-cyan-500/30">7:30 AM – 6:00 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">🌤️ Domingos</span>
              <span className="text-sm font-bold text-white bg-blue-500/20 rounded-lg px-2.5 py-0.5 border border-blue-500/30">9:00 AM – 4:00 PM</span>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20">
            <p className="text-[11px] text-yellow-300 leading-relaxed">
              💡 <strong>Tip:</strong> Para edredones y forros de bus, tráelos temprano para que queden listos el mismo día.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Phone size={16} className="text-green-400" />
              <h3 className="font-extrabold text-white">Contáctanos</h3>
            </div>
            <p className="text-sm text-gray-300 mb-1">Número de atención</p>
            <p className="text-2xl font-black text-white tracking-wider">0412-670-1633</p>
            <p className="text-xs text-gray-400 mt-1">LAVANDERÍA AJ · Caracas, Venezuela</p>
          </div>
          <a
            href={`${WA_URL}?text=${encodeURIComponent("Hola! Me comunico desde la app de Lavandería AJ. Quisiera información sobre sus servicios.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 active:scale-95 transition-all text-white font-extrabold text-sm shadow-md"
          >
            <MessageCircle size={16} />
            Escribir por WhatsApp
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-400/20 flex items-center justify-center">
            <Info size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Preguntas Frecuentes</h2>
            <p className="text-xs text-gray-400">Todo lo que necesitas saber</p>
          </div>
        </div>
        <div className="space-y-2">
          {FAQ.map((item, i) => <FaqItem key={i} item={item} />)}
        </div>
      </div>

      {/* SERVICIOS EXCLUIDOS */}
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <p className="text-sm font-bold text-red-300 mb-2 flex items-center gap-2">
          <Zap size={14} /> Servicios que NO ofrecemos:
        </p>
        <div className="flex flex-wrap gap-2">
          {["❌ Calzado", "❌ Planchado", "❌ Desmanchado", "❌ King Size", "❌ Domicilio"].map(s => (
            <span key={s} className="px-3 py-1 rounded-full bg-red-900/40 border border-red-500/30 text-xs text-red-300 font-semibold">{s}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
