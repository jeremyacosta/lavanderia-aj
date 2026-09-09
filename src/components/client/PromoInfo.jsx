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
    <div className="border border-blue-100 rounded-xl overflow-hidden bg-white shadow-xs" onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50/50 transition-colors">
        <span className="text-sm font-bold text-slate-800 pr-4">{item.q}</span>
        {open ? <ChevronUp size={16} className="text-blue-600 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
      </div>
      {open && (
        <div className="px-4 pb-4 text-sm text-slate-600 leading-relaxed border-t border-blue-50 pt-3">{item.a}</div>
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
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Tag size={18} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Precios y Promociones</h2>
            <p className="text-xs text-slate-500">Tarifas claras sin cargos ocultos</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {PROMOTIONS.map((promo) => (
            <div
              key={promo.id}
              className={`relative rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-all ${
                promo.highlight ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-blue-100'
              }`}
            >
              {promo.highlight && (
                <div className="absolute -top-3 left-4">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black tracking-widest uppercase shadow-xs">
                    ⭐ El más pedido
                  </span>
                </div>
              )}
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-blue-200 bg-blue-50 text-blue-800 mb-3">
                {promo.badge}
              </div>
              <h3 className="text-base font-black text-slate-900 leading-tight">{promo.title}</h3>
              <p className="text-xs text-slate-600 mt-1 mb-3 leading-relaxed">{promo.subtitle}</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-blue-700 font-mono">{promo.price}</span>
                <span className="text-xs text-slate-500 mb-1">{promo.per}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{promo.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MÉTODOS DE PAGO */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CreditCard size={18} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Métodos de Pago Aceptados</h2>
            <p className="text-xs text-slate-500">Sin Zelle · Sin Binance · Operaciones en Venezuela</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PAYMENT_METHODS.map((pm) => (
            <div key={pm.name} className="rounded-2xl border border-blue-100 bg-white p-4 text-center shadow-xs hover:border-blue-300 transition-colors">
              <div className="text-3xl mb-2">{pm.icon}</div>
              <p className="text-xs font-black text-slate-900">{pm.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{pm.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HORARIO & CONTACTO */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-blue-600" />
            <h3 className="font-black text-slate-900">Horario de Atención</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700 font-medium">📅 Lun – Sáb</span>
              <span className="text-sm font-bold text-blue-900 bg-blue-50 rounded-lg px-2.5 py-0.5 border border-blue-200">7:30 AM – 6:00 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-700 font-medium">🌤️ Domingos</span>
              <span className="text-sm font-bold text-blue-900 bg-blue-50 rounded-lg px-2.5 py-0.5 border border-blue-200">9:00 AM – 4:00 PM</span>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
              💡 <strong>Tip:</strong> Para edredones y forros de bus, tráelos temprano para que queden listos el mismo día.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Phone size={16} className="text-emerald-600" />
              <h3 className="font-black text-slate-900">Contáctanos</h3>
            </div>
            <p className="text-xs text-slate-500 mb-1">Línea directa de atención</p>
            <p className="text-2xl font-black text-slate-900 tracking-wider font-mono">0412-670-1633</p>
            <p className="text-xs text-slate-500 mt-1">LAVANDERÍA AJ · Caracas, Venezuela</p>
          </div>
          <a
            href={`${WA_URL}?text=${encodeURIComponent("Hola! Me comunico desde la app de Lavandería AJ. Quisiera información sobre sus servicios.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white font-extrabold text-sm shadow-sm"
          >
            <MessageCircle size={16} />
            Escribir por WhatsApp
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Info size={18} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Preguntas Frecuentes</h2>
            <p className="text-xs text-slate-500">Respuestas rápidas a tus dudas</p>
          </div>
        </div>
        <div className="space-y-2">
          {FAQ.map((item, i) => <FaqItem key={i} item={item} />)}
        </div>
      </div>

      {/* SERVICIOS EXCLUIDOS */}
      <div className="rounded-2xl border border-red-200 bg-red-50/70 p-5">
        <p className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
          <Zap size={14} className="text-red-600" /> Servicios que <strong>NO</strong> ofrecemos:
        </p>
        <div className="flex flex-wrap gap-2">
          {["❌ Calzado", "❌ Planchado", "❌ Desmanchado", "❌ King Size", "❌ Domicilio"].map(s => (
            <span key={s} className="px-3 py-1 rounded-full bg-white border border-red-200 text-xs text-red-700 font-semibold shadow-2xs">{s}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
