import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calculator, Plus, Minus, Sparkles, 
  MessageCircle, ArrowRight, RefreshCw, CheckCircle2,
  Info
} from 'lucide-react';

export default function BasketCalculator() {
  const { prices, exchangeRate } = useApp();

  // Cantidad de prendas del cliente
  const [pants, setPants] = useState(0);         // ~5 pantalones = 1 cesta (~1.2 kg c/u)
  const [shirts, setShirts] = useState(0);       // ~12 franelas = 1 cesta (~0.5 kg c/u)
  const [towels, setTowels] = useState(0);       // ~3.5 toallas = 1 cesta (~1.6 kg c/u)
  const [mixedClothes, setMixedClothes] = useState(0); // ~16 prendas variadas = 1 cesta (~0.375 kg c/u)

  // Edredones (cobro por pieza individual según tamaño)
  const [comforterSingle, setComforterSingle] = useState(0);     // $10
  const [comforterDouble, setComforterDouble] = useState(0);     // $12
  const [comforterLarge, setComforterLarge] = useState(0);       // $14

  // Modo directo de cestas (si el cliente ya las tiene medidas)
  const [directBaskets, setDirectBaskets] = useState(1);
  const [useDirectBaskets, setUseDirectBaskets] = useState(false);

  // Modo de servicio: 'comboFull' ($7.50), 'washWithSoap' ($4.50), 'custom'
  const [serviceMode, setServiceMode] = useState('comboFull');

  // Opciones individuales
  const [serviceWash, setServiceWash] = useState(true);          // $4.00
  const [serviceDry, setServiceDry] = useState(true);            // $3.00
  const [serviceSoap, setServiceSoap] = useState(true);          // $0.50
  const [serviceSoftener, setServiceSoftener] = useState(true);  // $0.70
  const [serviceBleach, setServiceBleach] = useState(false);     // $0.50
  const [serviceLabor, setServiceLabor] = useState(true);        // $0.20

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

  const toggleCustomService = (setter, currentValue) => {
    setter(!currentValue);
    setServiceMode('custom');
  };

  // Cálculos de prendas y peso
  const totalClothesCount = pants + shirts + towels + mixedClothes;

  const totalWeightApprox = 
    (pants * 1.2) + 
    (shirts * 0.5) + 
    (towels * 1.6) + 
    (mixedClothes * 0.375);

  const BASKET_CAPACITY_KG = 6.0;

  const calculatedBaskets = totalClothesCount > 0 
    ? Math.max(1, Math.ceil(totalWeightApprox / BASKET_CAPACITY_KG)) 
    : 0;

  const effectiveBaskets = useDirectBaskets 
    ? directBaskets 
    : calculatedBaskets;

  const weightInCurrentBasket = totalWeightApprox > 0
    ? (totalWeightApprox % BASKET_CAPACITY_KG === 0 ? BASKET_CAPACITY_KG : (totalWeightApprox % BASKET_CAPACITY_KG))
    : 0;

  const basketPercentFilled = totalClothesCount > 0 
    ? Math.min(100, Math.round((weightInCurrentBasket / BASKET_CAPACITY_KG) * 100))
    : 0;

  const remainingKgInBasket = Math.max(0, BASKET_CAPACITY_KG - weightInCurrentBasket);

  // Precio unitario por cesta
  let basketUnitPrice = 0;
  if (serviceMode === 'comboFull') {
    basketUnitPrice = prices.comboFull || 7.50;
  } else if (serviceMode === 'washWithSoap') {
    basketUnitPrice = prices.washWithSoapCombo || 4.50;
  } else {
    let customSum = 0;
    if (serviceWash) customSum += (prices.washOnly || 4.00);
    if (serviceDry) customSum += (prices.dryOnly || 3.00);
    if (serviceSoap) customSum += (prices.soap || 0.50);
    if (serviceSoftener) customSum += (prices.softener || 0.70);
    if (serviceBleach) customSum += (prices.bleachDegreaser || 0.50);
    if (serviceLabor) customSum += (prices.labor || 0.20);
    basketUnitPrice = customSum;
  }

  // Subtotales
  const subtotalClothes = effectiveBaskets * basketUnitPrice;

  const totalComfortersCount = comforterSingle + comforterDouble + comforterLarge;
  const subtotalComforters = 
    (comforterSingle * (prices.comforterSingle || 10.00)) +
    (comforterDouble * (prices.comforterDouble || 12.00)) +
    (comforterLarge * (prices.comforterMatrimonialLarge || 14.00));

  const totalUSD = subtotalClothes + subtotalComforters;
  const safeRate = exchangeRate || 40.50;
  const totalBs = totalUSD * safeRate;

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
      lines.push(`  ↳ Total ropa: *${effectiveBaskets} cesta(s)* (~${totalWeightApprox.toFixed(1)} kg)`);
    }

    if (effectiveBaskets > 0) {
      lines.push('');
      lines.push('⚙️ *Servicios seleccionados para la ropa:*');
      if (serviceMode === 'comboFull') {
        lines.push(`  - ⭐ COMBO ESTRELLA VIP: $${basketUnitPrice.toFixed(2)} c/u (Lavado + Secado + Jabón + Suavizante + Mano de Obra)`);
      } else if (serviceMode === 'washWithSoap') {
        lines.push(`  - 💧 Lavado + Jabón + Mano de Obra: $${basketUnitPrice.toFixed(2)} c/u`);
      } else {
        const activeSvcs = [];
        if (serviceWash) activeSvcs.push('Lavado ($4.00)');
        if (serviceDry) activeSvcs.push('Secado ($3.00)');
        if (serviceSoap) activeSvcs.push('Jabón ($0.50)');
        if (serviceSoftener) activeSvcs.push('Suavizante ($0.70)');
        if (serviceBleach) activeSvcs.push('Cloro ($0.50)');
        if (serviceLabor) activeSvcs.push('Mano de obra ($0.20)');
        lines.push(`  - Personalizado ($${basketUnitPrice.toFixed(2)} c/u): ${activeSvcs.join(', ')}`);
      }
      lines.push(`  ↳ Subtotal Ropa: *${effectiveBaskets} cesta(s) × $${basketUnitPrice.toFixed(2)} = $${subtotalClothes.toFixed(2)} USD*`);
    }

    if (totalComfortersCount > 0) {
      lines.push('');
      lines.push('🛏️ *Edredones:*');
      if (comforterSingle > 0) lines.push(`  - Individual: ${comforterSingle} ($${(comforterSingle * 10).toFixed(2)})`);
      if (comforterDouble > 0) lines.push(`  - Doble/Matrimonial: ${comforterDouble} ($${(comforterDouble * 12).toFixed(2)})`);
      if (comforterLarge > 0) lines.push(`  - Matrimonial Grande: ${comforterLarge} ($${(comforterLarge * 14).toFixed(2)})`);
      lines.push(`  ↳ Subtotal Edredones: *$${subtotalComforters.toFixed(2)} USD*`);
    }

    lines.push('');
    lines.push(`💰 *TOTAL GENERAL ESTIMADO:* *$${totalUSD.toFixed(2)} USD* (~Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`);
    lines.push('');
    lines.push('¿Tienen disponibilidad para recibir mi ropa hoy? ¡Muchas gracias!');

    return encodeURIComponent(lines.join('\n'));
  };

  return (
    <div className="rounded-3xl bg-white border border-blue-200/80 shadow-lg shadow-blue-900/5 p-6 sm:p-8 mb-8">
      
      {/* Header del Simulador */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-blue-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200">
            <Calculator size={14} className="text-blue-600" />
            <span>Simulador Inteligente de Cestas y Prendas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Calcula tu Presupuesto al Instante
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Ingresa tu cantidad de ropa o edredones, personaliza los servicios y comprueba el precio exacto en tiempo real.
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
            <span>{useDirectBaskets ? '🧺 Modo: Cestas Directas' : '👕 Modo: Por Prendas'}</span>
          </button>
          <button
            onClick={handleReset}
            title="Reiniciar simulador a 0"
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <RefreshCw size={15} />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN 1: INGRESO DE PRENDAS O CESTAS */}
      <div className="py-6 border-b border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            <span>{useDirectBaskets ? 'Indica tus Cestas de Ropa:' : 'Ingresa la Cantidad de tus Prendas:'}</span>
          </h3>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            1 Cesta = 5 a 7 kg en seco (~6 kg promedio)
          </span>
        </div>

        {useDirectBaskets ? (
          <div key="direct-baskets-mode" className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900 text-sm">¿Cuántas cestas completas vas a lavar?</p>
              <p className="text-xs text-slate-500">Capacidad estándar de 5 a 7 kilos en seco por cesta.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDirectBaskets(Math.max(1, directBaskets - 1))}
                className="w-11 h-11 rounded-xl bg-white border border-blue-200 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold shadow-sm active:scale-95"
              >
                <Minus size={18} />
              </button>
              <span className="w-14 text-center text-3xl font-black text-blue-900 font-mono">
                {directBaskets}
              </span>
              <button
                onClick={() => setDirectBaskets(directBaskets + 1)}
                className="w-11 h-11 rounded-xl bg-white border border-blue-200 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold shadow-sm active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div key="garments-mode">
            {/* Grid de prendas ordinarias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Pantalones */}
              <div className="rounded-2xl p-4 bg-slate-50/70 border border-slate-200 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">👖</span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">~5 por cesta</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Pantalones</h4>
                <p className="text-[11px] text-slate-500 mb-2">Jeans, monos, drills (~1.2 kg)</p>
                <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1.5 border border-slate-200">
                  <button 
                    onClick={() => setPants(Math.max(0, pants - 1))} 
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold active:scale-95"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-black text-base text-slate-900 select-none">
                    {pants}
                  </span>
                  <button 
                    onClick={() => setPants(pants + 1)} 
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold active:scale-95"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Franelas / Camisas */}
              <div className="rounded-2xl p-4 bg-slate-50/70 border border-slate-200 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">👕</span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">~12 por cesta</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Franelas / Camisas</h4>
                <p className="text-[11px] text-slate-500 mb-2">Algodón, poliéster (~0.5 kg)</p>
                <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1.5 border border-slate-200">
                  <button 
                    onClick={() => setShirts(Math.max(0, shirts - 1))} 
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold active:scale-95"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-black text-base text-slate-900 select-none">
                    {shirts}
                  </span>
                  <button 
                    onClick={() => setShirts(shirts + 1)} 
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold active:scale-95"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Toallas de Baño */}
              <div className="rounded-2xl p-4 bg-slate-50/70 border border-slate-200 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🧖</span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">~3 a 4 por cesta</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Toallas de Baño</h4>
                <p className="text-[11px] text-slate-500 mb-2">Toallones grandes (~1.6 kg)</p>
                <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1.5 border border-slate-200">
                  <button 
                    onClick={() => setTowels(Math.max(0, towels - 1))} 
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold active:scale-95"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-black text-base text-slate-900 select-none">
                    {towels}
                  </span>
                  <button 
                    onClick={() => setTowels(towels + 1)} 
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold active:scale-95"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Ropa Variada */}
              <div className="rounded-2xl p-4 bg-slate-50/70 border border-slate-200 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🧺</span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">~16 por cesta</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Ropa Variada</h4>
                <p className="text-[11px] text-slate-500 mb-2">Shorts, pijamas, sábanas</p>
                <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1.5 border border-slate-200">
                  <button 
                    onClick={() => setMixedClothes(Math.max(0, mixedClothes - 1))} 
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold active:scale-95"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center font-black text-base text-slate-900 select-none">
                    {mixedClothes}
                  </span>
                  <button 
                    onClick={() => setMixedClothes(mixedClothes + 1)} 
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold active:scale-95"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN EDREDONES */}
            <div className="mt-4 p-4 rounded-2xl bg-sky-50/60 border border-sky-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛏️</span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Edredones / Cobijas Gruesas</h4>
                    <p className="text-[11px] text-slate-600">Se lavan y secan individualmente en ciclo especial completo</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                  ❌ No King Size
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Individual', val: comforterSingle, setter: setComforterSingle, price: '$10.00' },
                  { label: 'Doble / Matrimonial', val: comforterDouble, setter: setComforterDouble, price: '$12.00' },
                  { label: 'Matrimonial Grande', val: comforterLarge, setter: setComforterLarge, price: '$14.00' }
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 border border-sky-200/80 flex items-center justify-between shadow-xs">
                    <div>
                      <p className="font-bold text-xs text-slate-900">{item.label}</p>
                      <p className="text-xs font-black text-blue-600">{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => item.setter(Math.max(0, item.val - 1))} 
                        className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold active:scale-95"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm text-slate-900">{item.val}</span>
                      <button 
                        onClick={() => item.setter(item.val + 1)} 
                        className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center font-bold active:scale-95"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BARRA DE CAPACIDAD Y LLENADO EN VIVO */}
            {totalClothesCount > 0 ? (
              <div key="basket-progress-bar" className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
                      {effectiveBaskets}
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {effectiveBaskets === 1 ? '1 Cesta Requerida' : `${effectiveBaskets} Cestas Requeridas`}
                    </span>
                    <span className="text-slate-500 font-medium">
                      ({totalClothesCount} prendas • ~{totalWeightApprox.toFixed(1)} kg)
                    </span>
                  </div>
                  <div className="text-blue-800 font-bold">
                    Cesta #{effectiveBaskets}: {basketPercentFilled}% ocupada
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      basketPercentFilled >= 90 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${basketPercentFilled}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>
                    💡 Capacidad de cesta: Se cobra por cesta de 5 a 7 kg.
                  </span>
                  {remainingKgInBasket > 0 ? (
                    <span className="text-emerald-700 font-bold">
                      ¡Puedes meter ~{remainingKgInBasket.toFixed(1)} kg más en esta cesta sin pagar extra!
                    </span>
                  ) : null}
                </div>
              </div>
            ) : (
              <div key="basket-empty-tip" className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
                <Info size={16} className="text-blue-500 shrink-0" />
                <span>Usa los botones <strong>+</strong> para indicar tus prendas y verás cómo se va llenando tu cesta en tiempo real.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECCIÓN 2: SELECCIÓN DE SERVICIOS */}
      <div className="py-6 border-b border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            <span>Elige los Servicios para tu Ropa:</span>
          </h3>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            Tarifa actual: <strong className="text-blue-900">${basketUnitPrice.toFixed(2)}</strong> / cesta
          </span>
        </div>

        {/* Planes / Presets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          
          {/* Combo Estrella */}
          <div 
            onClick={() => handlePresetChange('comboFull')} 
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
              serviceMode === 'comboFull' 
                ? 'bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500/20' 
                : 'bg-white border-slate-200 hover:border-blue-300'
            }`}
          >
            {serviceMode === 'comboFull' && (
              <span className="absolute top-3 right-3 text-blue-600">
                <CheckCircle2 size={18} />
              </span>
            )}
            <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Más Popular
            </span>
            <h4 className="font-black text-slate-900 text-sm mt-1.5">COMBO ESTRELLA VIP</h4>
            <p className="text-[11px] text-slate-600 mt-1 mb-2">
              Lavado + Secado + Jabón + Suavizante + Mano de Obra
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-blue-700">$7.50</span>
              <span className="text-xs font-semibold text-slate-500">/ cesta</span>
            </div>
          </div>

          {/* Lavado + Jabón */}
          <div 
            onClick={() => handlePresetChange('washWithSoap')} 
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
              serviceMode === 'washWithSoap' 
                ? 'bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500/20' 
                : 'bg-white border-slate-200 hover:border-blue-300'
            }`}
          >
            {serviceMode === 'washWithSoap' && (
              <span className="absolute top-3 right-3 text-blue-600">
                <CheckCircle2 size={18} />
              </span>
            )}
            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Económico
            </span>
            <h4 className="font-black text-slate-900 text-sm mt-1.5">LAVADO + JABÓN</h4>
            <p className="text-[11px] text-slate-600 mt-1 mb-2">
              Lavado + Jabón + Mano de Obra (Tú la secas en casa)
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-blue-700">$4.50</span>
              <span className="text-xs font-semibold text-slate-500">/ cesta</span>
            </div>
          </div>

          {/* A Medida */}
          <div 
            onClick={() => handlePresetChange('custom')} 
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
              serviceMode === 'custom' 
                ? 'bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500/20' 
                : 'bg-white border-slate-200 hover:border-blue-300'
            }`}
          >
            {serviceMode === 'custom' && (
              <span className="absolute top-3 right-3 text-blue-600">
                <CheckCircle2 size={18} />
              </span>
            )}
            <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Personalizado
            </span>
            <h4 className="font-black text-slate-900 text-sm mt-1.5">A TU MEDIDA</h4>
            <p className="text-[11px] text-slate-600 mt-1 mb-2">
              Elige exactamente qué productos y procesos deseas
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-blue-700">${basketUnitPrice.toFixed(2)}</span>
              <span className="text-xs font-semibold text-slate-500">/ cesta</span>
            </div>
          </div>
        </div>

        {/* Botones de Servicios Individuales */}
        <p className="text-xs font-bold text-slate-700 mb-2">
          Activa o desactiva servicios individuales para recalcular:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { id: 'wash', label: 'Lavado', price: prices.washOnly || 4.00, setter: setServiceWash, val: serviceWash, icon: '🫧' },
            { id: 'dry', label: 'Secado', price: prices.dryOnly || 3.00, setter: setServiceDry, val: serviceDry, icon: '💨' },
            { id: 'soap', label: 'Jabón', price: prices.soap || 0.50, setter: setServiceSoap, val: serviceSoap, icon: '🧴' },
            { id: 'soft', label: 'Suavizante', price: prices.softener || 0.70, setter: setServiceSoftener, val: serviceSoftener, icon: '🌸' },
            { id: 'bleach', label: 'Cloro/Desengr.', price: prices.bleachDegreaser || 0.50, setter: setServiceBleach, val: serviceBleach, icon: '🧪' },
            { id: 'labor', label: 'Mano de Obra', price: prices.labor || 0.20, setter: setServiceLabor, val: serviceLabor, icon: '👔' }
          ].map((svc) => (
            <button 
              key={svc.id} 
              onClick={() => toggleCustomService(svc.setter, svc.val)} 
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1 shadow-xs active:scale-95 ${
                svc.val 
                  ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-400' 
                  : 'bg-white border-slate-200 text-slate-400 opacity-60 hover:opacity-100'
              }`}
            >
              <span className="text-xl">{svc.icon}</span>
              <span className="text-[11px] font-black">{svc.label}</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                svc.val ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
              }`}>
                ${svc.price.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN 3: CUADRO DE RESUMEN CLARO Y BOTÓN WHATSAPP */}
      <div className="pt-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 border border-blue-800">
          
          {/* Desglose dinámico del resumen */}
          <div className="space-y-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider">
              <Sparkles size={16} />
              <span>Resumen Detallado de tu Cotización</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-200">
              {/* Línea de Ropa ordinaria */}
              {effectiveBaskets > 0 ? (
                <div key="summary-baskets-row" className="flex items-center justify-between lg:justify-start gap-4">
                  <span className="text-slate-300">
                    🧺 <strong>{effectiveBaskets} Cesta(s)</strong> de ropa:
                  </span>
                  <span className="font-mono font-bold text-white">
                    {effectiveBaskets} × ${basketUnitPrice.toFixed(2)} = <strong>${subtotalClothes.toFixed(2)} USD</strong>
                  </span>
                </div>
              ) : (
                <div key="summary-no-baskets-row" className="text-slate-400">
                  🧺 <em>No has agregado cestas de ropa ordinaria.</em>
                </div>
              )}

              {/* Línea de Edredones */}
              {totalComfortersCount > 0 ? (
                <div key="summary-comforters-row" className="flex items-center justify-between lg:justify-start gap-4">
                  <span className="text-slate-300">
                    🛏️ <strong>{totalComfortersCount} Edredón(es)</strong>:
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    +${subtotalComforters.toFixed(2)} USD
                  </span>
                </div>
              ) : null}

              {/* Plan activo */}
              {effectiveBaskets > 0 ? (
                <div key="summary-plan-name" className="text-[11px] text-cyan-200/90 pt-1">
                  Plan: {serviceMode === 'comboFull' ? '⭐ Combo Estrella VIP ($7.50)' : serviceMode === 'washWithSoap' ? '💧 Lavado + Jabón ($4.50)' : '🛠️ Personalizado'}
                </div>
              ) : null}
            </div>

            {/* Total General Grande */}
            <div className="pt-2 border-t border-blue-800/80 flex items-baseline gap-3">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                ${totalUSD.toFixed(2)} <span className="text-lg font-bold text-cyan-300">USD</span>
              </div>
              <div className="text-sm font-bold text-slate-300">
                ≈ Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {totalUSD === 0 ? (
              <p key="summary-zero-tip" className="text-[11px] text-amber-300 font-semibold">
                👆 Ingresa prendas o edredones arriba para calcular tu monto exacto.
              </p>
            ) : null}
          </div>

          {/* Botón WhatsApp */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col items-center gap-2">
            <a 
              href={`https://wa.me/584126701633?text=${generateWhatsAppMessage()}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`w-full sm:w-auto px-7 py-4 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 ${
                totalUSD > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-900/30 ring-2 ring-emerald-400/50'
                  : 'bg-slate-700 text-slate-300 cursor-not-allowed pointer-events-none'
              }`}
            >
              <MessageCircle size={20} className="text-white" />
              <span>Cotizar por WhatsApp</span>
              <ArrowRight size={18} />
            </a>
            <span className="text-[11px] text-slate-300 font-medium">
              Atención directa: <strong>0412-6701633</strong>
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
