import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calculator, Plus, Minus, Sparkles, 
  MessageCircle, ArrowRight, RefreshCw
} from 'lucide-react';

export default function BasketCalculator() {
  const { prices, exchangeRate } = useApp();

  // Cantidad de prendas del cliente
  const [pants, setPants] = useState(0);         // ~5 pantalones = 1 cesta
  const [shirts, setShirts] = useState(0);       // ~12 franelas = 1 cesta
  const [towels, setTowels] = useState(0);       // ~3.5 toallas = 1 cesta
  const [mixedClothes, setMixedClothes] = useState(0); // ~16 prendas ligeras/ropa variada = 1 cesta

  // Edredones (se cobran por unidad y tamaño)
  const [comforterSingle, setComforterSingle] = useState(0);     // $10
  const [comforterDouble, setComforterDouble] = useState(0);     // $12
  const [comforterLarge, setComforterLarge] = useState(0);       // $14

  // Modo directo de cestas (si el cliente ya las tiene medidas)
  const [directBaskets, setDirectBaskets] = useState(0);
  const [useDirectBaskets, setUseDirectBaskets] = useState(false);

  // Selección de servicios para la ropa ordinaria
  // Presets: 'comboFull' ($7.50), 'washWithSoap' ($4.50), 'custom'
  const [serviceMode, setServiceMode] = useState('comboFull');

  // Opciones de servicios individuales
  const [serviceWash, setServiceWash] = useState(true);          // $4.00
  const [serviceDry, setServiceDry] = useState(true);            // $3.00
  const [serviceSoap, setServiceSoap] = useState(true);          // $0.50
  const [serviceSoftener, setServiceSoftener] = useState(true);  // $0.70
  const [serviceBleach, setServiceBleach] = useState(false);     // $0.50
  const [serviceLabor, setServiceLabor] = useState(true);        // $0.20

  // Manejador de cambio de Preset
  const handlePresetChange = (mode) => {
    setServiceMode(mode);
    if (mode === 'comboFull') {
      setServiceWash(true);
      setServiceDry(true);
      setServiceSoap(true);
      setServiceSoftener(true);
      setServiceBleach(false);
      setServiceLabor(true);
    } else if (mode === 'washWithSoap') {
      setServiceWash(true);
      setServiceDry(false);
      setServiceSoap(true);
      setServiceSoftener(false);
      setServiceBleach(false);
      setServiceLabor(true);
    }
  };

  // Cuando se conmuta un servicio manual, pasamos a modo personalizado
  const toggleCustomService = (setter, currentValue) => {
    setter(!currentValue);
    setServiceMode('custom');
  };

  // Cálculo de Cestas Estimadas a partir de las prendas
  const totalWeightApprox = 
    (pants * 1.2) + 
    (shirts * 0.5) + 
    (towels * 1.7) + 
    (mixedClothes * 0.375);

  const totalClothesCount = pants + shirts + towels + mixedClothes;

  const calculatedBaskets = totalClothesCount > 0 
    ? Math.max(1, Math.ceil(totalWeightApprox / 6.0)) 
    : 0;

  const effectiveBaskets = useDirectBaskets 
    ? directBaskets 
    : (totalClothesCount > 0 ? calculatedBaskets : 1);

  // Precio unitario por cesta según servicios seleccionados
  let basketUnitPrice = 0;
  if (serviceMode === 'comboFull') {
    basketUnitPrice = prices.comboFull || 7.50;
  } else if (serviceMode === 'washWithSoap') {
    basketUnitPrice = prices.washWithSoapCombo || 4.50;
  } else {
    if (serviceWash) basketUnitPrice += (prices.washOnly || 4.00);
    if (serviceDry) basketUnitPrice += (prices.dryOnly || 3.00);
    if (serviceSoap) basketUnitPrice += (prices.soap || 0.50);
    if (serviceSoftener) basketUnitPrice += (prices.softener || 0.70);
    if (serviceBleach) basketUnitPrice += (prices.bleachDegreaser || 0.50);
    if (serviceLabor) basketUnitPrice += (prices.labor || 0.20);
  }

  // Costo por cestas de ropa
  const subtotalClothes = effectiveBaskets * basketUnitPrice;

  // Costo por Edredones
  const totalComfortersCount = comforterSingle + comforterDouble + comforterLarge;
  const subtotalComforters = 
    (comforterSingle * (prices.comforterSingle || 10.00)) +
    (comforterDouble * (prices.comforterDouble || 12.00)) +
    (comforterLarge * (prices.comforterMatrimonialLarge || 14.00));

  // TOTAL ESTIMADO
  const totalUSD = subtotalClothes + subtotalComforters;
  const totalBs = totalUSD * exchangeRate;

  // Reset general
  const handleReset = () => {
    setPants(0);
    setShirts(0);
    setTowels(0);
    setMixedClothes(0);
    setComforterSingle(0);
    setComforterDouble(0);
    setComforterLarge(0);
    setDirectBaskets(1);
    setUseDirectBaskets(false);
    handlePresetChange('comboFull');
  };

  // Generar mensaje detallado para WhatsApp
  const generateWhatsAppMessage = () => {
    const lines = [];
    lines.push('🧺 *SOLICITUD DE COTIZACIÓN - LAVANDERÍA AJ*');
    lines.push('');
    
    if (useDirectBaskets) {
      lines.push(`• Cestas directas: *${directBaskets} cesta(s)*`);
    } else if (totalClothesCount > 0) {
      lines.push('👕 *Prendas ingresadas:*');
      if (pants > 0) lines.push(`  - Pantalones: ${pants}`);
      if (shirts > 0) lines.push(`  - Franelas/Camisas: ${shirts}`);
      if (towels > 0) lines.push(`  - Toallas: ${towels}`);
      if (mixedClothes > 0) lines.push(`  - Ropa Variada: ${mixedClothes}`);
      lines.push(`  ↳ Cestas estimadas: *${effectiveBaskets} cesta(s)* (~${(effectiveBaskets * 6).toFixed(0)} kg)`);
    } else {
      lines.push(`• Cestas: *${effectiveBaskets} cesta(s)*`);
    }

    lines.push('');
    lines.push('⚙️ *Servicios para la ropa:*');
    if (serviceMode === 'comboFull') {
      lines.push('  - ⭐ COMBO ESTRELLA ($7.50/cesta): Lavado + Secado + Jabón + Suavizante + Mano de Obra');
    } else if (serviceMode === 'washWithSoap') {
      lines.push('  - 💧 Lavado + Jabón + Mano de Obra ($4.50/cesta)');
    } else {
      const activeSvcs = [];
      if (serviceWash) activeSvcs.push('Lavado ($4)');
      if (serviceDry) activeSvcs.push('Secado ($3)');
      if (serviceSoap) activeSvcs.push('Jabón ($0.50)');
      if (serviceSoftener) activeSvcs.push('Suavizante ($0.70)');
      if (serviceBleach) activeSvcs.push('Cloro/Desengrasante ($0.50)');
      if (serviceLabor) activeSvcs.push('Mano de obra ($0.20)');
      lines.push(`  - Personalizado: ${activeSvcs.join(', ')} ($${basketUnitPrice.toFixed(2)}/cesta)`);
    }

    if (totalComfortersCount > 0) {
      lines.push('');
      lines.push('🛏️ *Edredones:*');
      if (comforterSingle > 0) lines.push(`  - Individual: ${comforterSingle} ($${(comforterSingle * 10).toFixed(2)})`);
      if (comforterDouble > 0) lines.push(`  - Doble/Matrimonial: ${comforterDouble} ($${(comforterDouble * 12).toFixed(2)})`);
      if (comforterLarge > 0) lines.push(`  - Matrimonial Grande: ${comforterLarge} ($${(comforterLarge * 14).toFixed(2)})`);
    }

    lines.push('');
    lines.push(`💰 *TOTAL ESTIMADO:* *$${totalUSD.toFixed(2)} USD* (~Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`);
    lines.push('');
    lines.push('¿Tienen disponibilidad para recibir mis prendas hoy? ¡Muchas gracias!');

    return encodeURIComponent(lines.join('\n'));
  };

  return (
    <div className="rounded-3xl bg-white border border-blue-200/80 shadow-lg shadow-blue-900/5 p-6 sm:p-8 mb-8">
      
      {/* Header del Simulador */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-blue-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
            <Calculator size={14} className="text-blue-600" />
            Simulador Inteligente de Prendas y Servicios
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Calcula tu Lavada según tus Prendas
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Ingresa la cantidad de ropa, selecciona los servicios deseados y obtén tu precio estimado al instante.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseDirectBaskets(!useDirectBaskets)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              useDirectBaskets 
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                : 'bg-blue-50/80 text-blue-900 border-blue-200 hover:bg-blue-100'
            }`}
          >
            {useDirectBaskets ? '🧺 Modo: Cestas Directas' : '👕 Modo: Por Prendas'}
          </button>
          <button
            onClick={handleReset}
            title="Reiniciar simulador"
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: INGRESO DE PRENDAS O CESTAS */}
      <div className="py-6 border-b border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            {useDirectBaskets ? 'Indica tus Cestas de Ropa:' : 'Ingresa la Cantidad de tus Prendas:'}
          </h3>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            1 Cesta = 5 a 7 kg de ropa seca
          </span>
        </div>

        {useDirectBaskets ? (
          <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900 text-sm">¿Cuántas cestas completas vas a lavar?</p>
              <p className="text-xs text-slate-500">Capacidad estándar de 5 a 7 kilos en seco por cesta.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDirectBaskets(Math.max(1, directBaskets - 1))}
                className="w-11 h-11 rounded-xl bg-white border border-blue-200 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold shadow-sm"
              >
                <Minus size={18} />
              </button>
              <span className="w-14 text-center text-3xl font-black text-blue-900 font-mono">
                {directBaskets}
              </span>
              <button
                onClick={() => setDirectBaskets(directBaskets + 1)}
                className="w-11 h-11 rounded-xl bg-white border border-blue-200 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold shadow-sm"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl p-4 bg-slate-50/70 border border-slate-200 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">👖</span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">~5 por cesta</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Pantalones</h4>
                <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1.5 border border-slate-200 mt-2">
                  <button onClick={() => setPants(Math.max(0, pants - 1))} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold"><Minus size={14} /></button>
                  <input type="number" min="0" value={pants} onChange={(e) => setPants(Math.max(0, parseInt(e.target.value) || 0))} className="w-12 text-center font-black text-base text-slate-900 focus:outline-none" />
                  <button onClick={() => setPants(pants + 1)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold"><Plus size={14} /></button>
                </div>
              </div>

              <div className="rounded-2xl p-4 bg-slate-50/70 border border-slate-200 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">👕</span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">~12 por cesta</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Franelas / Camisas</h4>
                <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1.5 border border-slate-200 mt-2">
                  <button onClick={() => setShirts(Math.max(0, shirts - 1))} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold"><Minus size={14} /></button>
                  <input type="number" min="0" value={shirts} onChange={(e) => setShirts(Math.max(0, parseInt(e.target.value) || 0))} className="w-12 text-center font-black text-base text-slate-900 focus:outline-none" />
                  <button onClick={() => setShirts(shirts + 1)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold"><Plus size={14} /></button>
                </div>
              </div>

              <div className="rounded-2xl p-4 bg-slate-50/70 border border-slate-200 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🧖</span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">~3 a 4 por cesta</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Toallas de Baño</h4>
                <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1.5 border border-slate-200 mt-2">
                  <button onClick={() => setTowels(Math.max(0, towels - 1))} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold"><Minus size={14} /></button>
                  <input type="number" min="0" value={towels} onChange={(e) => setTowels(Math.max(0, parseInt(e.target.value) || 0))} className="w-12 text-center font-black text-base text-slate-900 focus:outline-none" />
                  <button onClick={() => setTowels(towels + 1)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold"><Plus size={14} /></button>
                </div>
              </div>

              <div className="rounded-2xl p-4 bg-slate-50/70 border border-slate-200 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🧺</span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">~16 por cesta</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Ropa Variada</h4>
                <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1.5 border border-slate-200 mt-2">
                  <button onClick={() => setMixedClothes(Math.max(0, mixedClothes - 1))} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold"><Minus size={14} /></button>
                  <input type="number" min="0" value={mixedClothes} onChange={(e) => setMixedClothes(Math.max(0, parseInt(e.target.value) || 0))} className="w-12 text-center font-black text-base text-slate-900 focus:outline-none" />
                  <button onClick={() => setMixedClothes(mixedClothes + 1)} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold"><Plus size={14} /></button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-sky-50/60 border border-sky-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛏️</span>
                  <h4 className="font-extrabold text-slate-900 text-sm">Edredones</h4>
                </div>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">❌ No King Size</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Individual', val: comforterSingle, setter: setComforterSingle, price: '$10.00' },
                  { label: 'Doble/Matrim', val: comforterDouble, setter: setComforterDouble, price: '$12.00' },
                  { label: 'Mat. Grande', val: comforterLarge, setter: setComforterLarge, price: '$14.00' }
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 border border-sky-200/80 flex items-center justify-between">
                    <div><p className="font-bold text-xs text-slate-900">{item.label}</p><p className="text-[10px] font-extrabold text-blue-600">{item.price}</p></div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => item.setter(Math.max(0, item.val - 1))} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold"><Minus size={12} /></button>
                      <span className="w-6 text-center font-bold text-sm text-slate-900">{item.val}</span>
                      <button onClick={() => item.setter(item.val + 1)} className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold"><Plus size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">{effectiveBaskets}</div>
                <div>
                  <h5 className="font-black text-slate-900 text-sm">{effectiveBaskets === 1 ? '1 Cesta' : `${effectiveBaskets} Cestas`}</h5>
                  <p className="text-xs text-slate-600">Total: {totalClothesCount} prendas estimadas.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="py-6 border-b border-blue-100">
        <h3 className="text-base font-extrabold text-slate-900 mb-4">Selecciona servicios para tus prendas:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {[
            { id: 'comboFull', title: 'COMBO ESTRELLA VIP', price: '$7.50', desc: 'Lavado + Secado + Jabón + Suavizante + Mano de Obra' },
            { id: 'washWithSoap', title: 'LAVADO + JABÓN', price: '$4.50', desc: 'Lavado + Jabón + Mano de Obra (Sin secado)' },
            { id: 'custom', title: 'A MEDIDA', price: `$${basketUnitPrice.toFixed(2)}`, desc: 'Personaliza los servicios' }
          ].map((mode) => (
            <div key={mode.id} onClick={() => handlePresetChange(mode.id)} className={`cursor-pointer rounded-2xl p-4 border transition-all ${serviceMode === mode.id ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20' : 'bg-white border-slate-200'}`}>
              <h4 className="font-black text-slate-900 text-sm">{mode.title}</h4>
              <p className="text-[10px] text-slate-600 mt-1 mb-2">{mode.desc}</p>
              <span className="text-lg font-black text-blue-700">{mode.price}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {[
            { id: 'wash', label: 'Lavado', price: prices.washOnly, setter: setServiceWash, val: serviceWash, icon: '🫧' },
            { id: 'dry', label: 'Secado', price: prices.dryOnly, setter: setServiceDry, val: serviceDry, icon: '💨' },
            { id: 'soap', label: 'Jabón', price: prices.soap, setter: setServiceSoap, val: serviceSoap, icon: '🧴' },
            { id: 'soft', label: 'Suaviz.', price: prices.softener, setter: setServiceSoftener, val: serviceSoftener, icon: '🌸' },
            { id: 'bleach', label: 'Cloro', price: prices.bleachDegreaser, setter: setServiceBleach, val: serviceBleach, icon: '🧪' },
            { id: 'labor', label: 'Mano O.', price: prices.labor, setter: setServiceLabor, val: serviceLabor, icon: '👔' }
          ].map((svc) => (
            <button key={svc.id} onClick={() => toggleCustomService(svc.setter, svc.val)} className={`p-3 rounded-xl border transition-all ${svc.val ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'}`}>
              <span className="text-lg">{svc.icon}</span>
              <p className="text-[10px] font-bold text-slate-700">{svc.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-extrabold uppercase tracking-wider"><Sparkles size={16} /> Resumen</div>
            <p className="text-sm text-slate-200">Total: ${totalUSD.toFixed(2)} USD (≈ Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</p>
          </div>
          <a href={`https://wa.me/584126701633?text=${generateWhatsAppMessage()}`} target="_blank" rel="noopener noreferrer" className="px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-sm uppercase flex items-center gap-2 shadow-lg">
            <MessageCircle size={18} /> Enviar a WhatsApp <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
