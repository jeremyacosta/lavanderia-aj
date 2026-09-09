import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Calculator, Check, Plus, Minus, Info, ArrowRight, ShoppingBag } from 'lucide-react';

export default function BasketCalculator() {
  const { prices, exchangeRate } = useApp();

  // Estados del cotizador
  const [basketCount, setBasketCount] = useState(1);
  const [serviceType, setServiceType] = useState('comboFull'); // 'comboFull' | 'washWithSoap' | 'custom'
  
  // Opciones personalizadas
  const [includeWash, setIncludeWash] = useState(true);
  const [includeDry, setIncludeDry] = useState(false);
  const [includeSoap, setIncludeSoap] = useState(true);
  const [includeSoftener, setIncludeSoftener] = useState(false);
  const [includeBleach, setIncludeBleach] = useState(false);
  const [includeLabor, setIncludeLabor] = useState(true);

  // Estimador de prendas
  const [activeTab, setActiveTab] = useState('baskets'); // 'baskets' | 'estimator'
  const [pantsMen, setPantsMen] = useState(0);
  const [pantsWomen, setPantsWomen] = useState(0);
  const [shirts, setShirts] = useState(0);
  const [towels, setTowels] = useState(0);
  const [bedsheets, setBedsheets] = useState(0);

  // Cálculo de unidades equivalentes
  const calculatedBasketsFromClothes = Math.max(
    1,
    Math.ceil(
      (pantsMen * 1.3 + pantsWomen * 1.1 + shirts * 0.45 + towels * 1.5 + bedsheets * 2.8) / 6.0
    )
  );

  // Cálculo del precio unitario por cesta según tipo
  let unitPriceUSD = 0;
  if (serviceType === 'comboFull') {
    unitPriceUSD = prices.comboFull; // 7.50$
  } else if (serviceType === 'washWithSoap') {
    unitPriceUSD = prices.washWithSoapCombo; // 4.50$
  } else {
    // Personalizado
    if (includeWash) unitPriceUSD += prices.washOnly; // 4.00
    if (includeDry) unitPriceUSD += prices.dryOnly; // 3.00
    if (includeSoap) unitPriceUSD += prices.soap; // 0.50
    if (includeSoftener) unitPriceUSD += prices.softener; // 0.70
    if (includeBleach) unitPriceUSD += prices.bleachDegreaser; // 0.50
    if (includeLabor) unitPriceUSD += prices.labor; // 0.20
  }

  const effectiveBaskets = activeTab === 'baskets' ? basketCount : calculatedBasketsFromClothes;
  const totalUSD = effectiveBaskets * unitPriceUSD;
  const totalBs = totalUSD * exchangeRate;

  return (
    <div className="rounded-3xl glass-panel p-6 sm:p-8 mb-8 border border-cyan-500/20 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2 border border-cyan-500/30">
            <Calculator size={14} /> Cotizador Interactivo por Cestas
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Calcula el Total de tu Lavada
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            1 Cesta equivale a <strong>5 a 7 kg de ropa seca</strong>.
          </p>
        </div>

        {/* Tab switch */}
        <div className="p-1 rounded-xl bg-slate-900/80 border border-white/10 flex">
          <button
            onClick={() => setActiveTab('baskets')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'baskets' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Por Cestas Directas
          </button>
          <button
            onClick={() => setActiveTab('estimator')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'estimator' ? 'bg-cyan-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Por Cantidad de Prendas
          </button>
        </div>
      </div>

      {/* Mode 1: Baskets direct */}
      {activeTab === 'baskets' ? (
        <div className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">¿Cuántas cestas de ropa tienes?</h3>
            <p className="text-xs text-gray-400">Cada cesta es una lavada estándar de 5 a 7 kg.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setBasketCount(Math.max(1, basketCount - 1))}
              className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 text-white font-bold text-lg flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-colors"
            >
              <Minus size={18} />
            </button>
            <span className="text-3xl font-extrabold text-cyan-400 font-mono w-12 text-center">
              {basketCount}
            </span>
            <button
              onClick={() => setBasketCount(basketCount + 1)}
              className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 text-white font-bold text-lg flex items-center justify-center hover:bg-cyan-500 hover:text-black transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      ) : (
        /* Mode 2: Estimator by items */
        <div className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <h3 className="text-sm font-bold text-white mb-3">Indica cuántas prendas tienes aproximadamente:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <label className="text-[11px] text-gray-400 block mb-1">Pantalones Hombre</label>
              <input
                type="number"
                min="0"
                value={pantsMen || ''}
                placeholder="0"
                onChange={(e) => setPantsMen(parseInt(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white font-bold text-center text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <label className="text-[11px] text-gray-400 block mb-1">Pantalones Mujer</label>
              <input
                type="number"
                min="0"
                value={pantsWomen || ''}
                placeholder="0"
                onChange={(e) => setPantsWomen(parseInt(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white font-bold text-center text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <label className="text-[11px] text-gray-400 block mb-1">Franelas / Camisas</label>
              <input
                type="number"
                min="0"
                value={shirts || ''}
                placeholder="0"
                onChange={(e) => setShirts(parseInt(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white font-bold text-center text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <label className="text-[11px] text-gray-400 block mb-1">Toallas de Baño</label>
              <input
                type="number"
                min="0"
                value={towels || ''}
                placeholder="0"
                onChange={(e) => setTowels(parseInt(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white font-bold text-center text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <label className="text-[11px] text-gray-400 block mb-1">Juegos de Sábanas</label>
              <input
                type="number"
                min="0"
                value={bedsheets || ''}
                placeholder="0"
                onChange={(e) => setBedsheets(parseInt(e.target.value) || 0)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white font-bold text-center text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300">
            <span>💡 Estimación automática:</span>
            <span className="font-extrabold text-sm">{calculatedBasketsFromClothes} Cesta(s) (~{calculatedBasketsFromClothes * 6} kg en seco)</span>
          </div>
        </div>
      )}

      {/* Service Type Selector */}
      <h3 className="text-sm font-bold text-white mb-3 uppercase font-mono tracking-wider">
        Selecciona tu Paquete de Servicio:
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Option 1: Combo Estrella */}
        <div
          onClick={() => setServiceType('comboFull')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all relative ${
            serviceType === 'comboFull'
              ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
              : 'border-white/10 bg-slate-900/40 hover:border-white/20'
          }`}
        >
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-cyan-400 text-black text-[10px] font-extrabold uppercase">
            Más Popular
          </div>
          <h4 className="text-base font-extrabold text-white mb-1">⭐ Servicio Completo VIP</h4>
          <p className="text-xs text-gray-400 mb-3">Lavado + Secado + Jabón + Suavizante + Mano de Obra</p>
          <div className="text-2xl font-black text-cyan-400 font-mono">${prices.comboFull.toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ cesta</span></div>
        </div>

        {/* Option 2: Solo Lavado + Jabón */}
        <div
          onClick={() => setServiceType('washWithSoap')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            serviceType === 'washWithSoap'
              ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
              : 'border-white/10 bg-slate-900/40 hover:border-white/20'
          }`}
        >
          <h4 className="text-base font-extrabold text-white mb-1">Lavado + Jabón</h4>
          <p className="text-xs text-gray-400 mb-3">Lavado con jabón incluido + Mano de Obra (Sin secado)</p>
          <div className="text-2xl font-black text-white font-mono">${prices.washWithSoapCombo.toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ cesta</span></div>
        </div>

        {/* Option 3: Personalizado */}
        <div
          onClick={() => setServiceType('custom')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            serviceType === 'custom'
              ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
              : 'border-white/10 bg-slate-900/40 hover:border-white/20'
          }`}
        >
          <h4 className="text-base font-extrabold text-white mb-1">Arma a tu Gusto</h4>
          <p className="text-xs text-gray-400 mb-3">Elige exactamente qué insumos y procesos deseas</p>
          <div className="text-2xl font-black text-white font-mono">${unitPriceUSD.toFixed(2)} <span className="text-xs text-gray-400 font-normal">/ cesta</span></div>
        </div>
      </div>

      {/* Custom options checklist (Only visible if 'custom') */}
      {serviceType === 'custom' && (
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 mb-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" checked={includeWash} onChange={(e) => setIncludeWash(e.target.checked)} className="rounded text-cyan-500" />
            Lavado (${prices.washOnly.toFixed(2)})
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" checked={includeDry} onChange={(e) => setIncludeDry(e.target.checked)} className="rounded text-cyan-500" />
            Secado (${prices.dryOnly.toFixed(2)})
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" checked={includeSoap} onChange={(e) => setIncludeSoap(e.target.checked)} className="rounded text-cyan-500" />
            Jabón Líquido (${prices.soap.toFixed(2)})
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" checked={includeSoftener} onChange={(e) => setIncludeSoftener(e.target.checked)} className="rounded text-cyan-500" />
            Suavizante (${prices.softener.toFixed(2)})
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" checked={includeBleach} onChange={(e) => setIncludeBleach(e.target.checked)} className="rounded text-cyan-500" />
            Cloro/Desengrasante (${prices.bleachDegreaser.toFixed(2)})
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input type="checkbox" checked={includeLabor} onChange={(e) => setIncludeLabor(e.target.checked)} className="rounded text-cyan-500" />
            Mano de Obra (${prices.labor.toFixed(2)})
          </label>
        </div>
      )}

      {/* Summary Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-xs uppercase font-mono text-cyan-400 mb-1">Presupuesto Estimado:</div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">${totalUSD.toFixed(2)} USD</span>
            <span className="text-sm text-gray-300 font-mono">(Aprox. Bs. {totalBs.toFixed(2)})</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {effectiveBaskets} Cesta(s) de ropa · {serviceType === 'comboFull' ? 'Servicio Completo ($7.50)' : serviceType === 'washWithSoap' ? 'Lavado + Jabón ($4.50)' : 'Personalizado'}
          </div>
        </div>

        <a
          href={`https://wa.me/584126701633?text=Hola%20Lavanderia%20AJ,%20quiero%20solicitar%20un%20servicio%20para%20${effectiveBaskets}%20cesta(s)%20de%20ropa%20(Total%20estimado:%20$${totalUSD.toFixed(2)}).`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        >
          Pedir por WhatsApp <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
}
