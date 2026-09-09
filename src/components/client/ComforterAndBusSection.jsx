import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bed, Truck, Check, Sparkles, Shield, AlertCircle } from 'lucide-react';

export default function ComforterAndBusSection() {
  const { prices, exchangeRate } = useApp();

  const comforters = [
    {
      title: 'Edredón Individual',
      price: prices.comforterSingle,
      desc: 'Lavado profundo con detergente, suavizante y secado completo.',
      badge: 'Individual',
      color: 'border-cyan-500/30 bg-cyan-950/20'
    },
    {
      title: 'Edredón Doble (Matrimonial)',
      price: prices.comforterDouble,
      desc: 'Tamaño estándar matrimonial, desengrasado y perfumado.',
      badge: 'Matrimonial',
      color: 'border-blue-500/30 bg-blue-950/20',
      popular: true
    },
    {
      title: 'Edredón Matrimonial Grande',
      price: prices.comforterMatrimonialLarge,
      desc: 'Para edredones amplios y gruesos (No incluye King Size).',
      badge: 'Grande',
      color: 'border-purple-500/30 bg-purple-950/20'
    },
  ];

  return (
    <div className="space-y-8 mb-12">
      {/* 1. Edredones Section */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-blue-500/20 shadow-xl">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-500/30 w-fit">
          <Bed size={14} /> Servicio Especial de Edredones
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Lavado & Secado Completo de Edredones
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mb-6">
          Incluye todos los detergentes, desengrasantes, suavizante y secado en máquinas de alta capacidad.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {comforters.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 border ${item.color} relative flex flex-col justify-between`}
            >
              {item.popular && (
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-cyan-400 text-black text-[10px] font-extrabold uppercase">
                  Más Solicitado
                </div>
              )}
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 block mb-1">
                  {item.badge}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-gray-400 mb-6">{item.desc}</p>
              </div>

              <div className="border-t border-white/10 pt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-cyan-400 font-mono">${item.price.toFixed(2)}</span>
                  <span className="text-xs text-gray-400 ml-1">USD</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  ~Bs. {(item.price * exchangeRate).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>Nota importante: No se reciben edredones tamaño King Size.</span>
        </div>
      </div>

      {/* 2. Forros de Autobuses Section */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-r from-slate-900/90 via-amber-950/20 to-slate-900/90 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-500/30">
              <Truck size={14} /> Plan Especial Autobuseros & Transporte
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Lavado Completo para Forros de Autobuses y Camionetas
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Servicio industrial con desengrasante químico de alta potencia, lavado profundo, secado total y <strong>bolsas especiales de embalaje incluidas</strong> para su protección.
            </p>

            <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-300">
              <span className="flex items-center gap-1.5"><Check size={14} className="text-amber-400" /> Todos los detergentes incluidos</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-amber-400" /> Secado total</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-amber-400" /> Bolsas de guardado incluidas</span>
            </div>
          </div>

          <div className="w-full lg:w-auto p-5 rounded-2xl bg-black/50 border border-amber-500/40 text-center flex-shrink-0">
            <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">Rango de Precio:</span>
            <div className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
              ${prices.busSeatCoversMin} - ${prices.busSeatCoversMax}
            </div>
            <span className="text-xs text-gray-400 font-mono block mt-1">
              (Bs. {(prices.busSeatCoversMin * exchangeRate).toFixed(0)} - {(prices.busSeatCoversMax * exchangeRate).toFixed(0)})
            </span>
            <a
              href="https://wa.me/584126701633?text=Hola%20Lavanderia%20AJ,%20quiero%20cotizar%20el%20lavado%20de%20forros%20de%20autobuses"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block w-full px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              Cotizar Forros por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
