import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calculator, Plus, Minus, Sparkles, 
  MessageCircle, ArrowRight, RefreshCw, CheckCircle2,
  Info, AlertTriangle, ShieldCheck, Send, Check, X
} from 'lucide-react';

export default function BasketCalculator() {
  const { prices, exchangeRate, addDailyRecord } = useApp();

  // Modal para enviar pedido automático a la encargada / Personal LAV
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [orderSentSuccess, setOrderSentSuccess] = useState(false);
  const [sentOrderDetails, setSentOrderDetails] = useState(null);

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

  // Plan base de servicio: 'comboFull' ($7.50) | 'washWithSoap' ($4.50) | 'custom'
  const [basePlan, setBasePlan] = useState('comboFull');

  // Adicionales que se pueden sumar a cualquier combo sin perder el ahorro del paquete
  const [addBleach, setAddBleach] = useState(false);         // Cloro: $0.50
  const [addDegreaser, setAddDegreaser] = useState(false);   // Desengrasante: $0.50

  // Opciones exclusivas para cuando el cliente elige modo 'custom' (A tu medida)
  const [customWash, setCustomWash] = useState(true);          // $4.00
  const [customDry, setCustomDry] = useState(true);            // $3.00
  const [customSoap, setCustomSoap] = useState(true);          // $0.50
  const [customSoftener, setCustomSoftener] = useState(true);  // $0.70
  const [customBleach, setCustomBleach] = useState(false);     // $0.50
  const [customDegreaser, setCustomDegreaser] = useState(false); // $0.50
  const [customLabor, setCustomLabor] = useState(true);        // $0.20

  // Cálculos de prendas y capacidad
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

  // Precio unitario por cesta según combo y productos adicionales
  let basketUnitPrice = 0;
  let planTitleSummary = '';
  let extrasList = [];

  const bleachPrice = prices.bleach ?? 0.50;
  const degreaserPrice = prices.degreaser ?? 0.50;

  if (basePlan === 'comboFull') {
    let price = prices.comboFull || 7.50;
    if (addBleach) {
      price += bleachPrice;
      extrasList.push(`Cloro (+$${bleachPrice.toFixed(2)})`);
    }
    if (addDegreaser) {
      price += degreaserPrice;
      extrasList.push(`Desengrasante (+$${degreaserPrice.toFixed(2)})`);
    }
    basketUnitPrice = price;
    planTitleSummary = extrasList.length > 0 
      ? `⭐ Combo Estrella VIP ($7.50) + ${extrasList.join(' + ')}`
      : '⭐ Combo Estrella VIP ($7.50)';
  } else if (basePlan === 'washWithSoap') {
    let price = prices.washWithSoapCombo || 4.50;
    if (addBleach) {
      price += bleachPrice;
      extrasList.push(`Cloro (+$${bleachPrice.toFixed(2)})`);
    }
    if (addDegreaser) {
      price += degreaserPrice;
      extrasList.push(`Desengrasante (+$${degreaserPrice.toFixed(2)})`);
    }
    basketUnitPrice = price;
    planTitleSummary = extrasList.length > 0 
      ? `💧 Lavado + Jabón ($4.50) + ${extrasList.join(' + ')}`
      : '💧 Lavado + Jabón ($4.50)';
  } else {
    // Modo A la Medida
    let customSum = 0;
    const activeCustom = [];
    if (customWash) { customSum += (prices.washOnly || 4.00); activeCustom.push('Lavado'); }
    if (customDry) { customSum += (prices.dryOnly || 3.00); activeCustom.push('Secado'); }
    if (customSoap) { customSum += (prices.soap || 0.50); activeCustom.push('Jabón'); }
    if (customSoftener) { customSum += (prices.softener || 0.70); activeCustom.push('Suavizante'); }
    if (customBleach) { customSum += bleachPrice; activeCustom.push('Cloro'); }
    if (customDegreaser) { customSum += degreaserPrice; activeCustom.push('Desengrasante'); }
    if (customLabor) { customSum += (prices.labor || 0.20); activeCustom.push('Mano de obra'); }
    
    basketUnitPrice = customSum;
    planTitleSummary = `🛠️ A tu Medida: ${activeCustom.length > 0 ? activeCustom.join(', ') : 'Ningún servicio'}`;
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
  const safeRate = exchangeRate || 40.50;
  const totalBs = totalUSD * safeRate;

  // Reset
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
    setBasePlan('comboFull');
    setAddBleach(false);
    setAddDegreaser(false);
  };

  // Mensaje para WhatsApp con la frase oficial requerida
  const generateWhatsAppMessage = () => {
    const lines = [];
    lines.push('🧺 *SOLICITUD DE COTIZACIÓN - LAVANDERÍA AJ*');
    lines.push('_"El mejor servicio al mejor precio es nuestra mayor prioridad"_');
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
      lines.push(`⚙️ *Plan para la ropa:* ${planTitleSummary}`);
      lines.push(`  ↳ Tarifa: $${basketUnitPrice.toFixed(2)} por cesta`);
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
    lines.push(`💰 *TOTAL ESTIMADO:* *$${totalUSD.toFixed(2)} USD* (~Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`);
    lines.push('');
    lines.push('⚠️ *Nota importante:* Entiendo que este monto es un presupuesto estimado y estará sujeto a ajustes por el operario al momento de recibir la ropa en el local.');
    lines.push('');
    lines.push('¿Tienen disponibilidad para recibirme hoy? ¡Muchas gracias!');

    return encodeURIComponent(lines.join('\n'));
  };

  const handleSendAppOrder = (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Por favor ingresa tu nombre para que la encargada te identifique.');
      return;
    }

    const createdRecord = addDailyRecord({
      customerName: clientName.trim(),
      customerPhone: clientPhone.trim() || 'Portal Web',
      washCount: effectiveBaskets,
      dryCount: (basePlan === 'washWithSoap' && basePlan !== 'custom') ? 0 : effectiveBaskets,
      soapCount: effectiveBaskets,
      laborCount: effectiveBaskets,
      softenerCount: (basePlan === 'comboFull' && basePlan !== 'custom') ? effectiveBaskets : 0,
      bleachCount: addBleach ? 1 : 0,
      degreaserCount: addDegreaser ? 1 : 0,
      totalUSD: totalUSD,
      totalBs: totalBs,
      amountPaidUSD: 0,
      amountPaidBs: 0,
      debtUSD: totalUSD,
      paymentStatus: 'pending',
      paymentMethod: 'pago_movil',
      bankReference: 'Pedido por App',
      deliveryStatus: 'in_store',
      origin: 'app',
      intakeStatus: 'pending_intake',
      notes: `📲 Pedido desde la App: ${useDirectBaskets ? `${directBaskets} cestas` : `${totalClothesCount} prendas (~${effectiveBaskets} cestas)`}${totalComfortersCount > 0 ? ` + ${totalComfortersCount} edredón(es)` : ''} · ${planTitleSummary}`
    });

    setSentOrderDetails({
      id: createdRecord.id,
      name: clientName.trim(),
      totalUSD,
      totalBs,
      baskets: effectiveBaskets
    });
    setOrderSentSuccess(true);
    setShowOrderModal(false);
  };

  return (
    <div className="rounded-3xl bg-white border border-blue-200/80 shadow-lg shadow-blue-900/5 p-4 sm:p-8 mb-8 w-full max-w-full overflow-hidden">
      
      {/* Header del Simulador con el eslogan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-blue-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-200 max-w-full">
            <Calculator size={14} className="text-blue-600 shrink-0" />
            <span className="truncate">Simulador Inteligente de Cestas y Prendas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight break-words">
            Calcula tu Presupuesto al Instante
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-blue-800 mt-1 flex items-center gap-1.5 flex-wrap">
            <Sparkles size={14} className="text-amber-500 shrink-0" />
            <span>El mejor servicio al mejor precio es nuestra mayor prioridad</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0">1</span>
            <span>{useDirectBaskets ? 'Indica tus Cestas de Ropa:' : 'Ingresa la Cantidad de tus Prendas:'}</span>
          </h3>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 w-fit">
            1 Cesta = 5 a 7 kg en seco (~6 kg promedio)
          </span>
        </div>

        {useDirectBaskets ? (
          <div key="direct-baskets-box" className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
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
          <div key="clothes-garments-box">
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛏️</span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Edredones / Cobijas Gruesas</h4>
                    <p className="text-[11px] text-slate-600">Se lavan y secan individualmente en ciclo especial completo</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full self-start sm:self-auto shrink-0">
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                      {effectiveBaskets}
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {effectiveBaskets === 1 ? '1 Cesta Requerida' : `${effectiveBaskets} Cestas Requeridas`}
                    </span>
                    <span className="text-slate-500 font-medium text-[11px]">
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-600">
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

      {/* SECCIÓN 2: SELECCIÓN DE PLANES Y ADICIONALES */}
      <div className="py-6 border-b border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            <span>Elige el Plan para tus Cestas:</span>
          </h3>
          <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
            Tarifa por cesta: <strong className="text-blue-700 font-black text-sm">${basketUnitPrice.toFixed(2)} USD</strong>
          </span>
        </div>

        {/* 3 Planes Base */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          
          {/* Combo Estrella */}
          <div 
            onClick={() => setBasePlan('comboFull')} 
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
              basePlan === 'comboFull' 
                ? 'bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500/20' 
                : 'bg-white border-slate-200 hover:border-blue-300'
            }`}
          >
            {basePlan === 'comboFull' && (
              <span className="absolute top-3 right-3 text-blue-600">
                <CheckCircle2 size={18} />
              </span>
            )}
            <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Más Popular & Ahorro
            </span>
            <h4 className="font-black text-slate-900 text-sm mt-1.5">COMBO ESTRELLA VIP</h4>
            <p className="text-[11px] text-slate-600 mt-1 mb-2 leading-tight">
              Lavado + Secado + Jabón + Suavizante + Mano de Obra
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-blue-700">$7.50</span>
              <span className="text-xs font-semibold text-slate-500">/ cesta</span>
            </div>
          </div>

          {/* Lavado + Jabón */}
          <div 
            onClick={() => setBasePlan('washWithSoap')} 
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
              basePlan === 'washWithSoap' 
                ? 'bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500/20' 
                : 'bg-white border-slate-200 hover:border-blue-300'
            }`}
          >
            {basePlan === 'washWithSoap' && (
              <span className="absolute top-3 right-3 text-blue-600">
                <CheckCircle2 size={18} />
              </span>
            )}
            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Económico
            </span>
            <h4 className="font-black text-slate-900 text-sm mt-1.5">LAVADO + JABÓN</h4>
            <p className="text-[11px] text-slate-600 mt-1 mb-2 leading-tight">
              Lavado + Jabón + Mano de Obra (Tú la secas en casa)
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-blue-700">$4.50</span>
              <span className="text-xs font-semibold text-slate-500">/ cesta</span>
            </div>
          </div>

          {/* A Medida */}
          <div 
            onClick={() => setBasePlan('custom')} 
            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
              basePlan === 'custom' 
                ? 'bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500/20' 
                : 'bg-white border-slate-200 hover:border-blue-300'
            }`}
          >
            {basePlan === 'custom' && (
              <span className="absolute top-3 right-3 text-blue-600">
                <CheckCircle2 size={18} />
              </span>
            )}
            <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Personalizado
            </span>
            <h4 className="font-black text-slate-900 text-sm mt-1.5">A TU MEDIDA</h4>
            <p className="text-[11px] text-slate-600 mt-1 mb-2 leading-tight">
              Arma tu paquete desde cero eligiendo cada servicio
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-blue-700">${basketUnitPrice.toFixed(2)}</span>
              <span className="text-xs font-semibold text-slate-500">/ cesta</span>
            </div>
          </div>
        </div>

        {/* SI ESTÁ EN COMBO: SECCIÓN DE PRODUCTOS ESPECIALES ADICIONALES (CLORO Y DESENGRASANTE) */}
        {basePlan !== 'custom' ? (
          <div key="combo-addons" className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <div>
                  <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                    ¿Deseas agregar Cloro o Desengrasante a tu combo?
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Se suman directamente a tu combo por solo <strong>$0.50 c/u</strong> sin perder tu tarifa con descuento.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              
              {/* Botón Cloro */}
              <button
                type="button"
                onClick={() => setAddBleach(!addBleach)}
                className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all active:scale-98 ${
                  addBleach 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🧪</span>
                  <div>
                    <p className="font-black text-xs">Cloro Blanqueador</p>
                    <p className={`text-[10px] ${addBleach ? 'text-blue-100' : 'text-slate-500'}`}>
                      Ideal para prendas blancas o percudidas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2 py-0.5 rounded ${addBleach ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'}`}>
                    +$0.50
                  </span>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${addBleach ? 'bg-white text-blue-600' : 'border border-slate-300'}`}>
                    {addBleach ? '✓' : ''}
                  </span>
                </div>
              </button>

              {/* Botón Desengrasante */}
              <button
                type="button"
                onClick={() => setAddDegreaser(!addDegreaser)}
                className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all active:scale-98 ${
                  addDegreaser 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🧽</span>
                  <div>
                    <p className="font-black text-xs">Desengrasante Industrial</p>
                    <p className={`text-[10px] ${addDegreaser ? 'text-blue-100' : 'text-slate-500'}`}>
                      Grasa pesada, mecánicos, manchas difíciles
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2 py-0.5 rounded ${addDegreaser ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'}`}>
                    +$0.50
                  </span>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${addDegreaser ? 'bg-white text-blue-600' : 'border border-slate-300'}`}>
                    {addDegreaser ? '✓' : ''}
                  </span>
                </div>
              </button>

            </div>
          </div>
        ) : (
          /* MODO A TU MEDIDA: SELECTOR COMPLETO */
          <div key="custom-service-buttons" className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-700">
              Selecciona los servicios individuales que deseas contratar:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { id: 'wash', label: 'Lavado', price: prices.washOnly || 4.00, setter: setCustomWash, val: customWash, icon: '🫧' },
                { id: 'dry', label: 'Secado', price: prices.dryOnly || 3.00, setter: setCustomDry, val: customDry, icon: '💨' },
                { id: 'soap', label: 'Jabón', price: prices.soap || 0.50, setter: setCustomSoap, val: customSoap, icon: '🧴' },
                { id: 'soft', label: 'Suaviz.', price: prices.softener || 0.70, setter: setCustomSoftener, val: customSoftener, icon: '🌸' },
                { id: 'bleach', label: 'Cloro', price: bleachPrice, setter: setCustomBleach, val: customBleach, icon: '🧪' },
                { id: 'degreaser', label: 'Desengr.', price: degreaserPrice, setter: setCustomDegreaser, val: customDegreaser, icon: '🧽' },
                { id: 'labor', label: 'Mano Obra', price: prices.labor || 0.20, setter: setCustomLabor, val: customLabor, icon: '👔' }
              ].map((svc) => (
                <button 
                  key={svc.id} 
                  onClick={() => svc.setter(!svc.val)} 
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-1 shadow-xs active:scale-95 ${
                    svc.val 
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-400' 
                      : 'bg-white border-slate-200 text-slate-400 opacity-60 hover:opacity-100'
                  }`}
                >
                  <span className="text-lg">{svc.icon}</span>
                  <span className="text-[11px] font-black">{svc.label}</span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                    svc.val ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    ${svc.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 3: CUADRO DE RESUMEN CLARO, AVISO OBLIGATORIO Y BOTÓN WHATSAPP */}
      <div className="pt-6">
        <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 border border-blue-800 w-full max-w-full overflow-hidden">
          
          {/* Desglose dinámico del resumen */}
          <div className="space-y-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider">
              <Sparkles size={16} />
              <span>Resumen Detallado de tu Cotización</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-200">
              {/* Línea de Ropa ordinaria */}
              {effectiveBaskets > 0 ? (
                <div key="summary-baskets-row" className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-start gap-1 sm:gap-4">
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
                <div key="summary-comforters-row" className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-start gap-1 sm:gap-4">
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
                <div key="summary-plan-name" className="text-[11px] text-cyan-200/90 pt-1 break-words">
                  Plan: <strong>{planTitleSummary}</strong>
                </div>
              ) : null}
            </div>

            {/* Total General Grande */}
            <div className="pt-2 border-t border-blue-800/80 flex flex-wrap items-baseline gap-2 sm:gap-3">
              <div className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">
                ${totalUSD.toFixed(2)} <span className="text-base sm:text-lg font-bold text-cyan-300">USD</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-300">
                ≈ Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* FRASE OBLIGATORIA SOLICITADA */}
            <div className="mt-2 p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-start gap-2 max-w-xl">
              <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">
                <strong>Nota:</strong> El monto final estará sujeto a ajustes por el operario al momento de recibir la ropa.
              </span>
            </div>

            {/* AVISO DE PEDIDO ENVIADO CON ÉXITO A PERSONAL LAV */}
            {orderSentSuccess && sentOrderDetails && (
              <div className="mt-3 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-100 flex items-start gap-3">
                <CheckCircle2 size={22} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-black text-xs text-emerald-300">¡Pedido Enviado a la Pantalla de la Encargada!</h4>
                  <p className="text-[11px]">
                    Tu orden por <strong>${sentOrderDetails.totalUSD.toFixed(2)} USD</strong> ya aparece automáticamente en el panel <strong>Personal LAV</strong> a nombre de <strong>{sentOrderDetails.name}</strong>.
                  </p>
                  <p className="text-[10px] text-emerald-200/70">
                    Al llegar al local, indícale a la operaria tu nombre para recepcionar tus prendas.
                  </p>
                </div>
              </div>
            )}

            {totalUSD === 0 ? (
              <p key="summary-zero-tip" className="text-[11px] text-cyan-300 font-semibold">
                👆 Ingresa prendas o edredones arriba para calcular tu monto estimado.
              </p>
            ) : null}
          </div>

          {/* Botones de Acción */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col items-center gap-2.5">
            <button 
              type="button"
              onClick={() => {
                if (totalUSD === 0) {
                  alert('Agrega al menos una cesta o prenda antes de enviar tu pedido.');
                  return;
                }
                setShowOrderModal(true);
              }}
              disabled={totalUSD === 0}
              className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 ${
                totalUSD > 0
                  ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-900/30 ring-2 ring-blue-400/50'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
              <span>Enviar Pedido a Lavandería</span>
              <ArrowRight size={18} />
            </button>

            <a 
              href={`https://wa.me/584126701633?text=${generateWhatsAppMessage()}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 transition-colors ${
                totalUSD === 0 ? 'pointer-events-none opacity-40' : ''
              }`}
            >
              <MessageCircle size={16} className="text-emerald-400" />
              <span>Cotizar / Notificar por WhatsApp</span>
            </a>

            <span className="text-[11px] text-slate-400 font-medium">
              Atención directa: <strong>0412-6701633</strong>
            </span>
          </div>

        </div>
      </div>

      {/* MODAL: INGRESAR NOMBRE DEL CLIENTE PARA ENVIAR PEDIDO A PERSONAL LAV */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-blue-200 shadow-2xl animate-in fade-in zoom-in duration-150 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Send size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Enviar Pedido al Sistema</h3>
                  <p className="text-[11px] text-slate-500">Llegará directo a la pantalla de la encargada</p>
                </div>
              </div>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 space-y-1">
              <div className="flex justify-between font-bold">
                <span>Total Estimado:</span>
                <span className="text-blue-700 font-mono font-black text-sm">${totalUSD.toFixed(2)} USD</span>
              </div>
              <p className="text-[11px] text-slate-600">
                {effectiveBaskets > 0 && `• ${effectiveBaskets} cesta(s) (${planTitleSummary})`}
                {totalComfortersCount > 0 && ` • ${totalComfortersCount} edredón(es)`}
              </p>
            </div>

            <form onSubmit={handleSendAppOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tu Nombre o Apodo *:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej: Albert, Jenny, Familia Pérez..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Teléfono de Contacto (Opcional):
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Ej: 0412-1234567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  No te preocupes por pagar ahora: puedes cancelar al entregar o al retirar tu ropa en mostrador.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check size={16} />
                  <span>Confirmar Pedido</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
