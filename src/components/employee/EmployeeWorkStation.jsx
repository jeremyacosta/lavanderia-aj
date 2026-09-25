import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, Plus, Search, Filter, CheckCircle2, 
  Clock, AlertCircle, Trash2, Check, DollarSign, 
  Sparkles, X, ShieldAlert, FileText, Share2, 
  Package, Droplets, CheckSquare, Layers, Lock, 
  Calendar, Eye, Phone, RefreshCw, Smartphone, ArrowRight
} from 'lucide-react';

export default function EmployeeWorkStation() {
  const { 
    dailyRecords, 
    addDailyRecord, 
    updateDailyRecord,
    markRecordDelivered, 
    markRecordPaid, 
    deleteRecordWithAudit, 
    detergentLogs, 
    addDetergentLog, 
    dailyClosures, 
    saveDailyClosure, 
    exchangeRate,
    euroRate,
    bcvLastUpdated,
    bcvLoading,
    fetchBcvRates,
    prices
  } = useApp();

  const [activeTab, setActiveTab] = useState('daily_log'); // 'daily_log' | 'stored_clothes' | 'detergents' | 'closure'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('all'); // 'all' | 'walk_in' | 'app'

  // Modal para recepcionar y ajustar pedidos que llegaron de la App
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [recordForIntake, setRecordForIntake] = useState(null);
  const [intakeBaskets, setIntakeBaskets] = useState(1);
  const [intakeBleach, setIntakeBleach] = useState(0);
  const [intakeDegreaser, setIntakeDegreaser] = useState(0);
  const [intakePaymentStatus, setIntakePaymentStatus] = useState('paid');
  const [intakePaymentMethod, setIntakePaymentMethod] = useState('pago_movil');
  const [intakeBankRef, setIntakeBankRef] = useState('');
  const [intakeNotes, setIntakeNotes] = useState('');

  // Estado para la Barra Directa de Carga en Mostrador
  const [inlineClientName, setInlineClientName] = useState('');
  const [inlineClientPhone, setInlineClientPhone] = useState('');
  const [inlineAmountUSD, setInlineAmountUSD] = useState('7.50');
  const [inlinePayMethod, setInlinePayMethod] = useState('usd_cash'); // 'usd_cash' | 'pago_movil' | 'bs_cash' | 'pending'
  const [inlineBankRef, setInlineBankRef] = useState('');
  const [inlineNotes, setInlineNotes] = useState('');
  const [inlineSuccessToast, setInlineSuccessToast] = useState('');

  // Estado del Formulario de Carga Rápida (Mostrador)
  const [showAddModal, setShowAddModal] = useState(false);
  const [time, setTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  // Servicios (cantidades)
  const [washCount, setWashCount] = useState(1);
  const [dryCount, setDryCount] = useState(1);
  const [soapCount, setSoapCount] = useState(1);
  const [laborCount, setLaborCount] = useState(1);
  const [softenerCount, setSoftenerCount] = useState(1);
  const [bleachCount, setBleachCount] = useState(0);
  const [degreaserCount, setDegreaserCount] = useState(0);

  // Pagos
  const [paymentStatus, setPaymentStatus] = useState('paid'); // 'paid' | 'partial' | 'pending'
  const [paymentMethod, setPaymentMethod] = useState('usd_cash');
  const [bankReference, setBankReference] = useState('');
  const [manualTotalUSD, setManualTotalUSD] = useState('7.50');
  const [manualAmountPaidUSD, setManualAmountPaidUSD] = useState('');
  const [notes, setNotes] = useState('');
  const [markedNewDetergent, setMarkedNewDetergent] = useState(false);
  const [newDetergentType, setNewDetergentType] = useState('Jabón');

  // Modal de Borrado Protegido con Auditoría
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [deleteReasonInput, setDeleteReasonInput] = useState('');
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');

  // Modal de Cobro de Deuda / Entrega
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [recordToPay, setRecordToPay] = useState(null);
  const [payMethodSelect, setPayMethodSelect] = useState('usd_cash');
  const [payRefInput, setPayRefInput] = useState('');

  // Estado de Cierre Diario
  const [fondoInicialBs, setFondoInicialBs] = useState('860');
  const [dineroEntregadoBs, setDineroEntregadoBs] = useState('');
  const [dineroEntregadoUSD, setDineroEntregadoUSD] = useState('');
  const [closureNotes, setClosureNotes] = useState('');
  const [closureSuccessAlert, setClosureSuccessAlert] = useState(false);

  // Cálculo sugerido del costo según servicios ingresados
  const calculateSuggestedUSD = () => {
    // Si coincide con Combo Estrella 1 cesta completa
    if (washCount === 1 && dryCount === 1 && soapCount === 1 && laborCount === 1 && softenerCount === 1) {
      let base = prices.comboFull || 7.50;
      base += bleachCount * (prices.bleach || 0.50);
      base += degreaserCount * (prices.degreaser || 0.50);
      return base;
    }
    // Múltiples cestas estándar de combo
    if (washCount > 1 && washCount === dryCount && washCount === soapCount && washCount === laborCount && washCount === softenerCount) {
      let base = washCount * (prices.comboFull || 7.50);
      base += bleachCount * (prices.bleach || 0.50);
      base += degreaserCount * (prices.degreaser || 0.50);
      return base;
    }
    // Suma individual
    let sum = 0;
    sum += washCount * (prices.washOnly || 4.00);
    sum += dryCount * (prices.dryOnly || 3.00);
    sum += soapCount * (prices.soap || 0.50);
    sum += laborCount * (prices.labor || 0.20);
    sum += softenerCount * (prices.softener || 0.70);
    sum += bleachCount * (prices.bleach || 0.50);
    sum += degreaserCount * (prices.degreaser || 0.50);
    return sum;
  };

  const calculatedUSD = calculateSuggestedUSD();
  const effectiveTotalUSD = manualTotalUSD !== '' ? parseFloat(manualTotalUSD) || 0 : calculatedUSD;
  const effectiveTotalBs = effectiveTotalUSD * (exchangeRate || 40.50);

  const effectivePaidUSD = paymentStatus === 'paid' 
    ? effectiveTotalUSD 
    : paymentStatus === 'pending' 
      ? 0 
      : (manualAmountPaidUSD !== '' ? parseFloat(manualAmountPaidUSD) || 0 : 0);

  const effectiveDebtUSD = Math.max(0, effectiveTotalUSD - effectivePaidUSD);

  // Manejador para agregar nuevo registro
  const handleCreateRecord = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Por favor indica el nombre del cliente');
      return;
    }

    addDailyRecord({
      date: selectedDate,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      washCount,
      dryCount,
      soapCount,
      laborCount,
      softenerCount,
      bleachCount,
      degreaserCount,
      totalUSD: effectiveTotalUSD,
      totalBs: effectiveTotalBs,
      amountPaidUSD: effectivePaidUSD,
      amountPaidBs: effectivePaidUSD * (exchangeRate || 40.50),
      debtUSD: effectiveDebtUSD,
      paymentStatus,
      paymentMethod,
      bankReference: bankReference.trim(),
      deliveryStatus: 'in_store',
      origin: 'walk_in',
      intakeStatus: 'confirmed',
      notes: notes.trim()
    });

    if (markedNewDetergent) {
      addDetergentLog(newDetergentType, `Apertura registrada en orden de ${customerName.trim()}`, 'Encargada');
    }

    setInlineSuccessToast(`✅ ¡Cliente "${customerName.trim()}" registrado con éxito por $${effectiveTotalUSD.toFixed(2)} USD!`);
    setTimeout(() => setInlineSuccessToast(''), 4000);

    // Limpiar formulario
    setShowAddModal(false);
    setCustomerName('');
    setCustomerPhone('');
    setWashCount(1);
    setDryCount(1);
    setSoapCount(1);
    setLaborCount(1);
    setSoftenerCount(1);
    setBleachCount(0);
    setDegreaserCount(0);
    setManualTotalUSD('7.50');
    setManualAmountPaidUSD('');
    setBankReference('');
    setNotes('');
    setPaymentStatus('paid');
    setMarkedNewDetergent(false);
    setOriginFilter('all');
  };

  // Manejador para carga directa e instantánea en barra de mostrador
  const handleInlineQuickAdd = (e) => {
    e.preventDefault();
    if (!inlineClientName.trim()) {
      alert('Por favor indica el nombre del cliente');
      return;
    }

    const numUSD = parseFloat(inlineAmountUSD) || 0;
    const isPending = inlinePayMethod === 'pending';

    addDailyRecord({
      date: selectedDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: inlineClientName.trim(),
      customerPhone: inlineClientPhone.trim(),
      washCount: 1,
      dryCount: 1,
      soapCount: 1,
      laborCount: 1,
      softenerCount: 1,
      bleachCount: 0,
      degreaserCount: 0,
      totalUSD: numUSD,
      totalBs: numUSD * (exchangeRate || 40.50),
      amountPaidUSD: isPending ? 0 : numUSD,
      amountPaidBs: isPending ? 0 : numUSD * (exchangeRate || 40.50),
      debtUSD: isPending ? numUSD : 0,
      paymentStatus: isPending ? 'pending' : 'paid',
      paymentMethod: isPending ? 'usd_cash' : inlinePayMethod,
      bankReference: inlineBankRef.trim() || (inlinePayMethod === 'usd_cash' ? 'Efectivo $' : inlinePayMethod === 'bs_cash' ? 'Efectivo Bs' : isPending ? 'Debe al retirar' : 'Comprobante mostrador'),
      deliveryStatus: 'in_store',
      origin: 'walk_in',
      intakeStatus: 'confirmed',
      notes: inlineNotes.trim() || (isPending ? 'Ropa dejada / Paga al retirar' : 'Cargado directamente en mostrador')
    });

    setInlineSuccessToast(`✅ ¡Cliente "${inlineClientName.trim()}" registrado en el cuaderno por $${numUSD.toFixed(2)} USD!`);
    setTimeout(() => setInlineSuccessToast(''), 4000);

    setInlineClientName('');
    setInlineClientPhone('');
    setInlineAmountUSD('7.50');
    setInlineBankRef('');
    setInlineNotes('');
    setInlinePayMethod('usd_cash');
    setOriginFilter('all');
  };

  // Botones de presets rápidos para mostrador
  const applyPreset = (presetName) => {
    if (presetName === 'combo1') {
      setWashCount(1);
      setDryCount(1);
      setSoapCount(1);
      setLaborCount(1);
      setSoftenerCount(1);
      setBleachCount(0);
      setDegreaserCount(0);
      setManualTotalUSD('7.50');
      setNotes('1 Cesta Completa Combo ($7.50)');
    } else if (presetName === 'combo2') {
      setWashCount(2);
      setDryCount(2);
      setSoapCount(2);
      setLaborCount(2);
      setSoftenerCount(2);
      setBleachCount(0);
      setDegreaserCount(0);
      setManualTotalUSD('15.00');
      setNotes('2 Cestas Completas Combo ($15.00)');
    } else if (presetName === 'lavado_jabon') {
      setWashCount(1);
      setDryCount(0);
      setSoapCount(1);
      setLaborCount(1);
      setSoftenerCount(0);
      setBleachCount(0);
      setDegreaserCount(0);
      setManualTotalUSD('4.50');
      setNotes('Solo Lavado + Jabón ($4.50)');
    } else if (presetName === 'edredon_ind') {
      setWashCount(1);
      setDryCount(1);
      setSoapCount(1);
      setLaborCount(1);
      setSoftenerCount(1);
      setManualTotalUSD('10.00');
      setNotes('Edredón Individual ($10.00)');
    } else if (presetName === 'edredon_mat') {
      setWashCount(1);
      setDryCount(1);
      setSoapCount(1);
      setLaborCount(1);
      setSoftenerCount(1);
      setManualTotalUSD('12.00');
      setNotes('Edredón Matrimonial ($12.00)');
    } else if (presetName === 'edredon_grande') {
      setWashCount(1);
      setDryCount(1);
      setSoapCount(1);
      setLaborCount(1);
      setSoftenerCount(1);
      setManualTotalUSD('14.00');
      setNotes('Edredón Matrimonial Grande ($14.00)');
    } else if (presetName === 'forros_bus') {
      setWashCount(4);
      setDryCount(4);
      setSoapCount(4);
      setLaborCount(4);
      setSoftenerCount(4);
      setManualTotalUSD('32.00');
      setNotes('Forros de Autobús completos con bolsas ($32.00)');
    }
  };

  // Abrir modal de recepción para pedidos desde la App
  const openIntakeModal = (rec) => {
    setRecordForIntake(rec);
    setIntakeBaskets(rec.washCount || 1);
    setIntakeBleach(rec.bleachCount || 0);
    setIntakeDegreaser(rec.degreaserCount || 0);
    setIntakePaymentStatus(rec.paymentStatus || 'paid');
    setIntakePaymentMethod(rec.paymentMethod || 'pago_movil');
    setIntakeBankRef(rec.bankReference && rec.bankReference !== 'Pedido por App' && rec.bankReference !== 'Pedido Web' ? rec.bankReference : '');
    setIntakeNotes(rec.notes || '');
    setIntakeModalOpen(true);
  };

  // Confirmar recepción física de prendas y ajustar cestas si pesaron más/menos
  const handleConfirmIntake = (e) => {
    e.preventDefault();
    if (!recordForIntake) return;

    let unitPrice = prices.comboFull || 7.50;
    let adjustedTotalUSD = (intakeBaskets * unitPrice) + (intakeBleach * 0.50) + (intakeDegreaser * 0.50);
    let adjustedTotalBs = adjustedTotalUSD * (exchangeRate || 40.50);

    let paidUSD = intakePaymentStatus === 'paid' ? adjustedTotalUSD : 0;
    let debtUSD = intakePaymentStatus === 'paid' ? 0 : adjustedTotalUSD;

    updateDailyRecord(recordForIntake.id, {
      washCount: intakeBaskets,
      dryCount: intakeBaskets,
      soapCount: intakeBaskets,
      laborCount: intakeBaskets,
      softenerCount: intakeBaskets,
      bleachCount: intakeBleach,
      degreaserCount: intakeDegreaser,
      totalUSD: adjustedTotalUSD,
      totalBs: adjustedTotalBs,
      amountPaidUSD: paidUSD,
      amountPaidBs: paidUSD * (exchangeRate || 40.50),
      debtUSD: debtUSD,
      paymentStatus: intakePaymentStatus,
      paymentMethod: intakePaymentMethod,
      bankReference: intakeBankRef.trim() || (intakePaymentMethod === 'usd_cash' ? 'Efectivo $' : 'Pendiente'),
      intakeStatus: 'confirmed',
      notes: `${intakeNotes} · [Mostrador: ${intakeBaskets} cesta(s) verificadas]`
    });

    setIntakeModalOpen(false);
    setRecordForIntake(null);
    alert('✅ Recepción de prendas y ajuste de cestas guardado en el cuaderno diario.');
  };

  // Manejador para Borrado Protegido con Auditoría
  const handleConfirmDelete = (e) => {
    e.preventDefault();
    if (!recordToDelete) return;

    setDeleteErrorMsg('');
    const result = deleteRecordWithAudit(
      recordToDelete.id, 
      adminPasswordInput, 
      deleteReasonInput, 
      'Encargada / Puesto de Trabajo'
    );

    if (result.success) {
      setDeleteModalOpen(false);
      setRecordToDelete(null);
      setAdminPasswordInput('');
      setDeleteReasonInput('');
      setDeleteErrorMsg('');
      alert('✅ Registro eliminado y registrado en la bitácora de auditoría del administrador.');
    } else {
      setDeleteErrorMsg(result.message);
    }
  };

  // Manejador para Cobrar y Entregar
  const handleConfirmPaymentAndDelivery = (e) => {
    e.preventDefault();
    if (!recordToPay) return;

    markRecordPaid(recordToPay.id, {
      paymentMethod: payMethodSelect,
      bankReference: payRefInput.trim() || 'Cobrado en mostrador al retirar',
      notes: `Deuda de $${recordToPay.debtUSD.toFixed(2)} liquidada al retirar el ${new Date().toISOString().split('T')[0]}`
    });

    markRecordDelivered(recordToPay.id);

    setPayModalOpen(false);
    setRecordToPay(null);
    setPayRefInput('');
    alert('✅ Pago procesado y ropa marcada como entregada.');
  };

  // Registros filtrados por fecha seleccionada
  const recordsOfSelectedDate = dailyRecords.filter(r => r.date === selectedDate);
  const searchedRecords = recordsOfSelectedDate.filter(r => 
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.bankReference && r.bankReference.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const appOrdersCount = recordsOfSelectedDate.filter(r => r.origin === 'app').length;
  const pendingAppOrdersCount = recordsOfSelectedDate.filter(r => r.origin === 'app' && r.intakeStatus === 'pending_intake').length;
  const walkInCount = recordsOfSelectedDate.filter(r => r.origin !== 'app').length;

  const filteredByOrigin = searchedRecords.filter(r => {
    if (originFilter === 'app') return r.origin === 'app';
    if (originFilter === 'walk_in') return r.origin !== 'app';
    return true;
  });

  // Estadísticas del Cierre Diario de la fecha seleccionada
  const totalCobradoUSD = recordsOfSelectedDate.reduce((acc, r) => acc + (r.amountPaidUSD || 0), 0);
  const totalCobradoBs = recordsOfSelectedDate.reduce((acc, r) => acc + (r.amountPaidBs || 0), 0);

  const pagoMovilRecords = recordsOfSelectedDate.filter(r => r.paymentMethod === 'pago_movil' || r.paymentMethod === 'transfer');
  const totalPagoMovilUSD = pagoMovilRecords.reduce((acc, r) => acc + (r.amountPaidUSD || 0), 0);
  const totalPagoMovilBs = pagoMovilRecords.reduce((acc, r) => acc + (r.amountPaidBs || 0), 0);

  const efectivoUSDRecords = recordsOfSelectedDate.filter(r => r.paymentMethod === 'usd_cash');
  const totalEfectivoUSD = efectivoUSDRecords.reduce((acc, r) => acc + (r.amountPaidUSD || 0), 0);

  const efectivoBsRecords = recordsOfSelectedDate.filter(r => r.paymentMethod === 'bs_cash');
  const totalEfectivoBs = efectivoBsRecords.reduce((acc, r) => acc + (r.amountPaidBs || 0), 0);
  const totalEfectivoBsEnUSD = totalEfectivoBs / (exchangeRate || 40.50);

  // Guardar cierre diario
  const handleSaveClosure = (e) => {
    e.preventDefault();
    saveDailyClosure({
      date: selectedDate,
      cobradoBs: totalCobradoBs,
      cobradoUSD: totalCobradoUSD,
      pagoMovilBs: totalPagoMovilBs,
      pagoMovilUSD: totalPagoMovilUSD,
      efectivoBs: totalEfectivoBs,
      efectivoUSD: totalEfectivoBsEnUSD,
      divisasEfectivoUSD: totalEfectivoUSD,
      fondoInicialBs: parseFloat(fondoInicialBs) || 0,
      dineroEntregadoBs: parseFloat(dineroEntregadoBs) || 0,
      dineroEntregadoUSD: parseFloat(dineroEntregadoUSD) || 0,
      notes: closureNotes.trim(),
      closedBy: 'Personal LAV'
    });
    setClosureSuccessAlert(true);
    setTimeout(() => setClosureSuccessAlert(false), 4000);
  };

  // Generar mensaje de WhatsApp para el cierre del día
  const generateClosureWhatsApp = () => {
    const lines = [];
    lines.push(`🧼 *CIERRE DE CAJA DIARIO - LAVANDERÍA AJ*`);
    lines.push(`📅 *Fecha:* ${selectedDate}`);
    lines.push(`🕒 *Generado:* ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    lines.push('----------------------------------------');
    lines.push(`💵 *Total Cobrado USD:* $${totalCobradoUSD.toFixed(2)}`);
    lines.push(`🇻🇪 *Total Cobrado Bs:* Bs. ${totalCobradoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`);
    lines.push('');
    lines.push(`📲 *Pago Móvil:* Bs. ${totalPagoMovilBs.toLocaleString('es-VE')} ($${totalPagoMovilUSD.toFixed(2)})`);
    lines.push(`💵 *Efectivo Divisas ($):* $${totalEfectivoUSD.toFixed(2)} USD`);
    lines.push(`💵 *Efectivo Bolívares:* Bs. ${totalEfectivoBs.toLocaleString('es-VE')} ($${totalEfectivoBsEnUSD.toFixed(2)})`);
    lines.push('');
    lines.push(`🏦 *Fondo Recibido:* Bs. ${parseFloat(fondoInicialBs || 0).toLocaleString('es-VE')}`);
    lines.push(`🤝 *Dinero Entregado:* Bs. ${parseFloat(dineroEntregadoBs || 0).toLocaleString('es-VE')} y $${parseFloat(dineroEntregadoUSD || 0).toFixed(2)} USD`);
    if (closureNotes) lines.push(`📝 *Notas:* ${closureNotes}`);
    lines.push('');
    lines.push('Enviado desde el Sistema PWA Oficial - Lavandería AJ (Personal LAV)');

    return encodeURIComponent(lines.join('\n'));
  };

  // Listado de Ropa Dejada (en depósito)
  const storedClothesRecords = dailyRecords.filter(r => r.deliveryStatus === 'in_store');

  return (
    <div className="space-y-6">
      
      {/* Top Banner de Personal LAV */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-800 w-full max-w-full overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2 border border-cyan-500/30">
            <BookOpen size={14} className="text-cyan-400" />
            <span>Puesto de Trabajo · Personal LAV</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            Gestión Diaria de Clientes y Caja
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Digitalización del cuaderno físico de Lavandería AJ. Carga de prendas, abonos, ropa en depósito y cierres.
          </p>

          {/* Tasa Oficial BCV en Personal LAV */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-blue-800/80 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-300 font-extrabold uppercase tracking-wider text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tasa Oficial BCV:</span>
            </span>
            <span className="font-mono font-bold text-white">
              💵 $ 1 = <strong className="text-emerald-300">Bs. {exchangeRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </span>
            <span className="text-blue-400/60">•</span>
            <span className="font-mono font-bold text-white">
              💶 € 1 = <strong className="text-cyan-300">Bs. {(euroRate || 972.65).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </span>
            <button
              type="button"
              onClick={() => fetchBcvRates()}
              disabled={bcvLoading}
              title="Actualizar tasa BCV oficial ahora"
              className="p-1 rounded-md text-cyan-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={12} className={bcvLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              setShowAddModal(true);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={18} />
            <span>Anotar Cliente en Mostrador</span>
          </button>
        </div>
      </div>

      {/* BANNER DE AVISO: PEDIDOS RECIBIDOS DESDE LA APP WEB */}
      {pendingAppOrdersCount > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-blue-500/40 animate-in fade-in duration-200 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Smartphone size={22} className="text-cyan-200" />
            </div>
            <div>
              <p className="font-black text-sm sm:text-base flex items-center gap-2">
                <span>¡Hay {pendingAppOrdersCount} pedido(s) recibido(s) desde la App Web esperando ropa!</span>
              </p>
              <p className="text-xs text-blue-100 mt-0.5">
                Los clientes cotizaron sus prendas desde la app. Cuando lleguen al mostrador, presiona <strong>"⚖️ Recibir Ropa / Ajustar"</strong> para verificar las cestas y confirmar.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('daily_log');
              setOriginFilter('app');
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-blue-800 font-black text-xs uppercase shadow-sm hover:bg-blue-50 transition-all shrink-0 active:scale-95 text-center"
          >
            Ver Pedidos de la App ({pendingAppOrdersCount})
          </button>
        </div>
      )}

      {/* Selector de Pestañas Principales */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-blue-200/80 pb-3 overflow-x-auto no-scrollbar sm:flex-wrap w-full max-w-full">
        <button
          onClick={() => setActiveTab('daily_log')}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === 'daily_log'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <FileText size={15} />
          <span>📝 Cuaderno Diario ({recordsOfSelectedDate.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stored_clothes')}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === 'stored_clothes'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <Package size={15} />
          <span>🧺 Depósito ({storedClothesRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('detergents')}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === 'detergents'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <Droplets size={15} />
          <span>🧴 Insumos ({detergentLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('closure')}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === 'closure'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <DollarSign size={15} />
          <span>📊 Cierre de Caja</span>
        </button>
      </div>

      {/* PESTAÑA 1: CUADERNO DIARIO (REGISTRO POR FILAS) */}
      {activeTab === 'daily_log' && (
        <div className="space-y-4">

          {/* Toast de confirmación al cargar cliente */}
          {inlineSuccessToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs shadow-md flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 size={18} />
              <span>{inlineSuccessToast}</span>
            </div>
          )}

          {/* BARRA DIRECTA DE CARGA EN MOSTRADOR */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-blue-200 shadow-md w-full max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3 border-b border-blue-50 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
                  ⚡
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-none">
                    Carga Directa en Mostrador
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ingresa los datos del cliente, monto y forma de pago al instante
                  </p>
                </div>
              </div>

              {/* Botón para abrir el formulario con desglose completo */}
              <button
                type="button"
                onClick={() => {
                  setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                  setShowAddModal(true);
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-extrabold flex items-center gap-1 hover:underline self-start sm:self-auto"
              >
                <span>+ Abrir Formulario Detallado</span>
              </button>
            </div>

            <form onSubmit={handleInlineQuickAdd} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* 1. Nombre del Cliente */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Cliente *:
                  </label>
                  <input
                    type="text"
                    required
                    value={inlineClientName}
                    onChange={(e) => setInlineClientName(e.target.value)}
                    placeholder="Ej: Albert, Jenny..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 2. Teléfono */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Teléfono (Opcional):
                  </label>
                  <input
                    type="tel"
                    value={inlineClientPhone}
                    onChange={(e) => setInlineClientPhone(e.target.value)}
                    placeholder="Ej: 0412..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 3. Monto Designado */}
                <div>
                  <label className="block text-[11px] font-bold text-blue-900 mb-1">
                    Monto Designado ($ USD) *:
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={inlineAmountUSD}
                    onChange={(e) => setInlineAmountUSD(e.target.value)}
                    placeholder="7.50"
                    className="w-full px-3 py-2 rounded-xl border border-blue-300 text-xs font-mono font-black text-blue-950 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">
                    ≈ Bs. {((parseFloat(inlineAmountUSD) || 0) * (exchangeRate || 855.66)).toLocaleString('es-VE', { minimumFractionDigits: 2 })} <span className="text-slate-400 font-normal lowercase select-none">+ iva</span>
                  </span>
                </div>

                {/* 4. Forma de Pago */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Forma de Pago:
                  </label>
                  <select
                    value={inlinePayMethod}
                    onChange={(e) => setInlinePayMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none"
                  >
                    <option value="usd_cash">💵 Efectivo USD ($)</option>
                    <option value="pago_movil">📱 Pago Móvil</option>
                    <option value="bs_cash">🇻🇪 Efectivo Bs</option>
                    <option value="pending">⏳ Ropa Dejada (Paga al retirar)</option>
                  </select>
                </div>

                {/* 5. Referencia y Botón Guardar */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Referencia / RF:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inlineBankRef}
                      onChange={(e) => setInlineBankRef(e.target.value)}
                      placeholder="Ej: RF 1234"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-slate-50 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase shadow-md flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
                    >
                      <Plus size={16} />
                      <span>Cargar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Atajos Rápidos de Monto en Mostrador */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Montos Rápidos:</span>
                <button
                  type="button"
                  onClick={() => {
                    setInlineAmountUSD('7.50');
                    setInlineNotes('1 Cesta Combo ($7.50)');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-extrabold border border-blue-200"
                >
                  🧺 1 Cesta ($7.50)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInlineAmountUSD('15.00');
                    setInlineNotes('2 Cestas Combo ($15.00)');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-extrabold border border-blue-200"
                >
                  🧺🧺 2 Cestas ($15.00)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInlineAmountUSD('4.50');
                    setInlineNotes('Solo Lavado + Jabón ($4.50)');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-extrabold border border-blue-200"
                >
                  🫧 Lavado + Jabón ($4.50)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInlineAmountUSD('10.00');
                    setInlineNotes('Edredón Individual ($10.00)');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-extrabold border border-indigo-200"
                >
                  🛏️ Edredón Ind ($10)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInlineAmountUSD('12.00');
                    setInlineNotes('Edredón Matrimonial ($12.00)');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-extrabold border border-indigo-200"
                >
                  🛏️ Edredón Mat ($12)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInlineAmountUSD('14.00');
                    setInlineNotes('Edredón Grande ($14.00)');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-extrabold border border-indigo-200"
                >
                  🛏️ Edredón Grande ($14)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInlineAmountUSD('32.00');
                    setInlineNotes('Forros de Autobús ($32.00)');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-[11px] font-extrabold border border-cyan-200"
                >
                  🚌 Forros Bus ($32)
                </button>
              </div>
            </form>
          </div>
          
          {/* Barra de Filtros de Fecha, Origen y Búsqueda */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Calendar size={15} className="text-blue-600" />
                  Fecha:
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-bold text-slate-900 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botones de Filtro por Origen (Mostrador vs App) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOriginFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    originFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos ({recordsOfSelectedDate.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOriginFilter('walk_in')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    originFilter === 'walk_in'
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🏢 Mostrador ({walkInCount})
                </button>
                <button
                  type="button"
                  onClick={() => setOriginFilter('app')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    originFilter === 'app'
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'text-blue-700 hover:text-blue-900'
                  }`}
                >
                  <Smartphone size={12} />
                  <span>App ({appOrdersCount})</span>
                </button>
              </div>
            </div>

            <div className="relative w-full lg:w-64">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente o referencia..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Tabla que replica el cuaderno físico */}
          <div className="bg-white rounded-3xl border border-blue-200/80 shadow-md overflow-hidden w-full max-w-full">
            <div className="sm:hidden px-3.5 py-2 bg-blue-50 text-[11px] text-blue-700 font-bold flex items-center justify-between border-b border-blue-100">
              <span>👈 Desliza horizontalmente la tabla 👉</span>
              <span>{filteredByOrigin.length} filas</span>
            </div>
            <div className="overflow-x-auto w-full max-w-full">
              <table className="w-full text-left text-xs min-w-[720px]">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Hora</th>
                    <th className="py-3 px-4">Cliente / Origen</th>
                    <th className="py-3 px-2 text-center">Lav</th>
                    <th className="py-3 px-2 text-center">Sec</th>
                    <th className="py-3 px-2 text-center">Jab</th>
                    <th className="py-3 px-2 text-center">M.O</th>
                    <th className="py-3 px-2 text-center">Suav</th>
                    <th className="py-3 px-2 text-center">Cloro</th>
                    <th className="py-3 px-2 text-center">Deseng</th>
                    <th className="py-3 px-4 text-right">Monto</th>
                    <th className="py-3 px-3">Estado / REF</th>
                    <th className="py-3 px-3">Entrega</th>
                    <th className="py-3 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredByOrigin.length > 0 ? (
                    filteredByOrigin.map((rec) => (
                      <tr key={rec.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-600 whitespace-nowrap">
                          {rec.time}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <p className="font-extrabold text-slate-900 text-sm">{rec.customerName}</p>
                            {rec.origin === 'app' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                                <Smartphone size={10} /> App
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-slate-100 shrink-0">
                                Mostrador
                              </span>
                            )}
                          </div>
                          {rec.customerPhone && (
                            <p className="text-[10px] text-slate-500 font-mono">{rec.customerPhone}</p>
                          )}
                          {rec.notes && (
                            <p className="text-[10px] text-amber-700 font-medium italic mt-0.5">
                              {rec.notes}
                            </p>
                          )}
                          {rec.origin === 'app' && rec.intakeStatus === 'pending_intake' && (
                            <button
                              onClick={() => openIntakeModal(rec)}
                              className="mt-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 animate-pulse"
                            >
                              <span>⚖️ Recibir Ropa / Ajustar Cestas</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{rec.washCount || 0}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{rec.dryCount || 0}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{rec.soapCount || 0}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{rec.laborCount || 0}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{rec.softenerCount || 0}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{rec.bleachCount || '-'}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{rec.degreaserCount || '-'}</td>
                        
                        {/* Monto y Cobro */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <p className="font-black text-slate-900 font-mono text-sm">
                            ${rec.totalUSD.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Bs. {rec.totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </p>
                        </td>

                        {/* Estado del Pago y Referencia */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              rec.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.paymentStatus === 'partial'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {rec.paymentStatus === 'paid' ? '✓ Pagado' : rec.paymentStatus === 'partial' ? `Abonó $${rec.amountPaidUSD.toFixed(2)}` : 'Debe'}
                            </span>
                            {rec.bankReference && (
                              <p className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block">
                                {rec.bankReference}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Estado de Entrega */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {rec.deliveryStatus === 'delivered' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                              <CheckCircle2 size={14} /> Entregado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Package size={14} /> En Almacén
                            </span>
                          )}
                        </td>

                        {/* Botón de Borrado Protegido */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            title="Eliminar registro (Requiere Clave de Administrador)"
                            onClick={() => {
                              setRecordToDelete(rec);
                              setAdminPasswordInput('');
                              setDeleteReasonInput('');
                              setDeleteErrorMsg('');
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="13" className="py-12 text-center text-slate-500">
                        <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="font-bold">No hay registros para la fecha {selectedDate}.</p>
                        <p className="text-xs">Usa el botón superior "Anotar Nuevo Cliente" para comenzar el turno.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: ROPA DEJADA EN DEPÓSITO */}
      {activeTab === 'stored_clothes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black">
                {storedClothesRecords.length}
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Control de Ropa Dejada en Depósito</h3>
                <p className="text-xs text-slate-600">Prendas esperando retiro o liquidación de saldo.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-white px-3 py-1.5 rounded-xl border border-amber-200">
              {storedClothesRecords.filter(r => r.paymentStatus !== 'paid').length} con deuda pendiente
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {storedClothesRecords.map((rec) => (
              <div key={rec.id} className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500">{rec.date} · {rec.time}</span>
                    <h4 className="font-black text-slate-900 text-base">{rec.customerName}</h4>
                    {rec.customerPhone && <p className="text-xs text-slate-500 font-mono">{rec.customerPhone}</p>}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    rec.paymentStatus === 'paid' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {rec.paymentStatus === 'paid' ? '✓ Pagado' : `Debe $${rec.debtUSD.toFixed(2)}`}
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p><strong>Cestas/Servicios:</strong> L:{rec.washCount} S:{rec.dryCount} J:{rec.soapCount} Suav:{rec.softenerCount}</p>
                  {rec.notes && <p className="mt-1 text-slate-700 italic">"{rec.notes}"</p>}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="font-mono font-black text-sm text-slate-900">
                    Total: ${rec.totalUSD.toFixed(2)}
                  </span>
                  
                  {rec.paymentStatus !== 'paid' ? (
                    <button
                      onClick={() => {
                        setRecordToPay(rec);
                        setPayMethodSelect('usd_cash');
                        setPayRefInput('');
                        setPayModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <DollarSign size={14} /> Cobrar y Entregar
                    </button>
                  ) : (
                    <button
                      onClick={() => markRecordDelivered(rec.id)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Check size={14} /> Entregar Ropa
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: CONTROL DE DETERGENTES */}
      {activeTab === 'detergents' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-blue-200/80 shadow-md">
            <h3 className="font-black text-slate-900 text-base mb-1">Registro de Apertura de Insumos</h3>
            <p className="text-xs text-slate-600 mb-4">
              Marca aquí cuando abras un nuevo envase de detergente para que quede registrado en el inventario.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Jabón Nuevo', type: 'Jabón', icon: '🧴', color: 'bg-blue-50 border-blue-300 text-blue-900' },
                { label: 'Suavizante Nuevo', type: 'Suavizante', icon: '🌸', color: 'bg-purple-50 border-purple-300 text-purple-900' },
                { label: 'Cloro Nuevo', type: 'Cloro', icon: '🧪', color: 'bg-cyan-50 border-cyan-300 text-cyan-900' },
                { label: 'Desengrasante Nuevo', type: 'Desengrasante', icon: '🧽', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    const notes = prompt(`¿Alguna observación para la apertura de ${item.label}? (Opcional):`) || 'Apertura de envase en turno';
                    addDetergentLog(item.type, notes, 'Encargada');
                    alert(`✅ Registrada apertura de ${item.label}`);
                  }}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 shadow-xs active:scale-95 hover:shadow-md ${item.color}`}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="font-extrabold text-xs">{item.label}</span>
                  <span className="text-[10px] font-bold opacity-80">+ Registrar Apertura</span>
                </button>
              ))}
            </div>
          </div>

          {/* Historial de Insumos */}
          <div className="bg-white rounded-3xl border border-blue-200/80 shadow-sm overflow-hidden p-6">
            <h4 className="font-extrabold text-slate-900 text-sm mb-3">Historial de Insumos Iniciados</h4>
            <div className="space-y-2">
              {detergentLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {log.item === 'Jabón' ? '🧴' : log.item === 'Suavizante' ? '🌸' : log.item === 'Cloro' ? '🧪' : '🧽'}
                    </span>
                    <div>
                      <p className="font-black text-slate-900">{log.item} iniciado</p>
                      <p className="text-slate-500 text-[11px]">{log.notes}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-slate-600">
                    <p className="font-bold">{log.date}</p>
                    <p className="text-[10px]">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: CIERRE DIARIO DE CAJA */}
      {activeTab === 'closure' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Cierre de la fecha */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-blue-200 shadow-md space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Cierre de Caja del Día</h3>
                  <p className="text-xs text-slate-500">Resumen y arqueo del dinero recibido el {selectedDate}</p>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-bold text-slate-900 bg-blue-50/50"
                />
              </div>

              {/* Tarjetas de Resumen Financiero del Día */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-xs font-bold text-blue-700">Total General Cobrado</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-blue-950 font-mono">${totalCobradoUSD.toFixed(2)} USD</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 font-mono">
                    ≈ Bs. {totalCobradoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-xs font-bold text-purple-700">Pago Móvil / Transferencias</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-purple-950 font-mono">
                      Bs. {totalPagoMovilBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-purple-700 font-mono">
                    (${totalPagoMovilUSD.toFixed(2)} USD)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-700">Divisas en Efectivo ($)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-emerald-950 font-mono">${totalEfectivoUSD.toFixed(2)} USD</span>
                  </div>
                  <span className="text-[11px] text-emerald-600">Billetes recibidos en caja</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-xs font-bold text-amber-700">Efectivo en Bolívares (Bs)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-amber-950 font-mono">
                      Bs. {totalEfectivoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-600 font-mono">(${totalEfectivoBsEnUSD.toFixed(2)} USD)</span>
                </div>
              </div>

              {/* Formulario de Arqueo */}
              <form onSubmit={handleSaveClosure} className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="font-extrabold text-slate-900 text-sm">Arqueo y Entrega de Dinero:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fondo Recibido (Bs):</label>
                    <input
                      type="number"
                      step="any"
                      value={fondoInicialBs}
                      onChange={(e) => setFondoInicialBs(e.target.value)}
                      placeholder="Ej: 860"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dinero Entregado en Bs:</label>
                    <input
                      type="number"
                      step="any"
                      value={dineroEntregadoBs}
                      onChange={(e) => setDineroEntregadoBs(e.target.value)}
                      placeholder="Ej: 850"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dinero Entregado en $:</label>
                    <input
                      type="number"
                      step="any"
                      value={dineroEntregadoUSD}
                      onChange={(e) => setDineroEntregadoUSD(e.target.value)}
                      placeholder="Ej: 20"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notas del Cierre:</label>
                  <input
                    type="text"
                    value={closureNotes}
                    onChange={(e) => setClosureNotes(e.target.value)}
                    placeholder="Observaciones de caja o novedades del turno..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {closureSuccessAlert && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Cierre guardado exitosamente en el historial del Administrador.</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <a
                    href={`https://wa.me/584126701633?text=${generateClosureWhatsApp()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Share2 size={15} />
                    <span>Enviar Cierre a WhatsApp</span>
                  </a>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-2"
                  >
                    <Check size={15} />
                    <span>Guardar Registro de Cierre</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Columna Derecha: Historial de Cierres Anteriores */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-sm">
              <h4 className="font-black text-slate-900 text-sm mb-3">Historial de Cierres Registrados</h4>
              <div className="space-y-3">
                {dailyClosures.map((cl) => (
                  <div key={cl.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">{cl.date}</span>
                      <span className="font-mono font-bold text-blue-700">${cl.cobradoUSD.toFixed(2)} USD</span>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <p>• Pago Móvil: Bs. {cl.pagoMovilBs.toLocaleString('es-VE')}</p>
                      <p>• Divisas Efectivo: ${cl.divisasEfectivoUSD.toFixed(2)}</p>
                      <p>• Dinero Entregado: Bs. {cl.dineroEntregadoBs} / ${cl.dineroEntregadoUSD}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: CARGA RÁPIDA DE CLIENTE / ORDEN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 border border-blue-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Anotar Nuevo Cliente en Cuaderno</h3>
                <p className="text-xs text-slate-500">Carga rápida para atención en mostrador</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora:</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Cliente *:</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej: Albert, Jenny, Enrique..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono (Opcional):</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ej: 0412-1234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Atajos Rápidos de Servicios Frecuentes */}
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
                <span className="text-[11px] font-black text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  Atajos Rápidos (Carga en 1 Clic):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button 
                    type="button" 
                    onClick={() => applyPreset('combo1')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-600 hover:text-white text-blue-900 text-xs font-bold border border-blue-200 shadow-xs transition-colors"
                  >
                    🧺 1 Cesta ($7.50)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('combo2')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-600 hover:text-white text-blue-900 text-xs font-bold border border-blue-200 shadow-xs transition-colors"
                  >
                    🧺🧺 2 Cestas ($15.00)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('lavado_jabon')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-600 hover:text-white text-blue-900 text-xs font-bold border border-blue-200 shadow-xs transition-colors"
                  >
                    🫧 Lavado + Jabón ($4.50)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('edredon_ind')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 text-xs font-bold border border-indigo-200 shadow-xs transition-colors"
                  >
                    🛏️ Edredón Ind. ($10)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('edredon_mat')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 text-xs font-bold border border-indigo-200 shadow-xs transition-colors"
                  >
                    🛏️ Edredón Mat. ($12)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('edredon_grande')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 text-xs font-bold border border-indigo-200 shadow-xs transition-colors"
                  >
                    🛏️ Edredón Grande ($14)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('forros_bus')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-cyan-600 hover:text-white text-cyan-900 text-xs font-bold border border-cyan-200 shadow-xs transition-colors"
                  >
                    🚌 Forros Bus ($32)
                  </button>
                </div>
              </div>

              {/* Botones de Servicios / Cestas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Cantidades de Servicios por Cesta (Personalizable):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {[
                    { label: 'Lavado', val: washCount, setter: setWashCount },
                    { label: 'Secado', val: dryCount, setter: setDryCount },
                    { label: 'Jabón', val: soapCount, setter: setSoapCount },
                    { label: 'Mano O.', val: laborCount, setter: setLaborCount },
                    { label: 'Suaviz.', val: softenerCount, setter: setSoftenerCount },
                    { label: 'Cloro', val: bleachCount, setter: setBleachCount },
                    { label: 'Deseng.', val: degreaserCount, setter: setDegreaserCount }
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] font-bold text-slate-600 mb-1">{s.label}</p>
                      <div className="flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => s.setter(Math.max(0, s.val - 1))}
                          className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-blue-600 hover:text-white"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm text-slate-900 w-4 text-center">{s.val}</span>
                        <button
                          type="button"
                          onClick={() => s.setter(s.val + 1)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-blue-600 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Montos y Totales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200">
                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">
                    Monto Designado a Cobrar ($ USD) *:
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={manualTotalUSD}
                    onChange={(e) => setManualTotalUSD(e.target.value)}
                    placeholder="7.50"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 text-sm font-mono font-black text-blue-950 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] font-bold text-blue-700 mt-1 block">
                    ≈ Bs. {effectiveTotalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">Forma / Estado de Pago:</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 text-xs font-bold text-slate-900 bg-white focus:outline-none"
                  >
                    <option value="paid">✓ Cancela Ahora Completo</option>
                    <option value="pending">⏳ Ropa Dejada (Paga al retirar)</option>
                    <option value="partial">⏳ Abono Parcial</option>
                  </select>
                </div>
              </div>

              {paymentStatus === 'partial' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">Monto Abonado ($):</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={manualAmountPaidUSD}
                      onChange={(e) => setManualAmountPaidUSD(e.target.value)}
                      placeholder="Ej: 13.35"
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-mono font-bold text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">Resta por Cobrar:</label>
                    <p className="text-base font-black text-red-600 font-mono pt-2">
                      ${effectiveDebtUSD.toFixed(2)} USD
                    </p>
                  </div>
                </div>
              )}

              {/* Método de Pago y Referencia */}
              {paymentStatus !== 'pending' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Método de Pago:</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none"
                    >
                      <option value="pago_movil">📱 Pago Móvil</option>
                      <option value="usd_cash">💵 Efectivo USD ($)</option>
                      <option value="bs_cash">🇻🇪 Efectivo Bs</option>
                      <option value="transfer">🏦 Transferencia Bancaria</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Referencia Bancaria (REF):</label>
                    <input
                      type="text"
                      value={bankReference}
                      onChange={(e) => setBankReference(e.target.value)}
                      placeholder="Ej: RF 7423 o 13358"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-slate-50 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Marcador de Detergente Nuevo */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={markedNewDetergent}
                    onChange={(e) => setMarkedNewDetergent(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>🧴 Marcar "Detergente Nuevo" en este turno</span>
                </label>
                {markedNewDetergent && (
                  <select
                    value={newDetergentType}
                    onChange={(e) => setNewDetergentType(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="Jabón">Jabón</option>
                    <option value="Suavizante">Suavizante</option>
                    <option value="Cloro">Cloro</option>
                    <option value="Desengrasante">Desengrasante</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notas u observaciones:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Dejó ropa blanca y jeans / Paga al retirar..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md"
                >
                  Guardar en el Cuaderno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BORRADO PROTEGIDO CON AUDITORÍA */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-red-200 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center border border-red-200">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Acción Protegida: Borrar Registro</h3>
                <p className="text-[11px] text-slate-500">Requiere clave maestra y motivo para auditoría</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 mb-4 space-y-1">
              <p><strong>Cliente:</strong> {recordToDelete?.customerName}</p>
              <p><strong>Monto:</strong> ${recordToDelete?.totalUSD.toFixed(2)} USD (Bs. {recordToDelete?.totalBs.toLocaleString('es-VE')})</p>
              <p><strong>Hora:</strong> {recordToDelete?.time} ({recordToDelete?.date})</p>
            </div>

            <form onSubmit={handleConfirmDelete} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña del Administrador:
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Ingresa clave maestra (ej: aj2026)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-center tracking-widest text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo obligatorio de la eliminación:
                </label>
                <textarea
                  required
                  rows="2"
                  value={deleteReasonInput}
                  onChange={(e) => setDeleteReasonInput(e.target.value)}
                  placeholder="Ej: Error de tipeo en el monto, el cliente no concretó el servicio..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-slate-500">
                  Esta justificación se guardará de forma inmutable en el panel del administrador.
                </span>
              </div>

              {deleteErrorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {deleteErrorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md"
                >
                  Confirmar Eliminación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: COBRAR DEUDA Y ENTREGAR */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-blue-200 shadow-2xl">
            <h3 className="font-black text-slate-900 text-base mb-1">Cobrar y Entregar Ropa</h3>
            <p className="text-xs text-slate-500 mb-4">
              Cliente: <strong>{recordToPay?.customerName}</strong>
            </p>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center mb-4">
              <span className="text-xs font-bold text-amber-800">Monto Pendiente a Cobrar</span>
              <p className="text-2xl font-black text-amber-950 font-mono">${recordToPay?.debtUSD.toFixed(2)} USD</p>
              <span className="text-xs font-semibold text-amber-700 font-mono">
                ≈ Bs. {(recordToPay?.debtUSD * (exchangeRate || 40.50)).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <form onSubmit={handleConfirmPaymentAndDelivery} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Método con el que cancela:</label>
                <select
                  value={payMethodSelect}
                  onChange={(e) => setPayMethodSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50"
                >
                  <option value="usd_cash">💵 Efectivo USD ($)</option>
                  <option value="pago_movil">📱 Pago Móvil</option>
                  <option value="bs_cash">🇻🇪 Efectivo Bs</option>
                  <option value="transfer">🏦 Transferencia Bancaria</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Referencia (si aplica):</label>
                <input
                  type="text"
                  value={payRefInput}
                  onChange={(e) => setPayRefInput(e.target.value)}
                  placeholder="Ej: RF 8899"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md"
                >
                  Confirmar Cobro y Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: RECEPCIÓN Y AJUSTE DE PRENDAS PARA PEDIDOS DESDE LA APP */}
      {intakeModalOpen && recordForIntake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-blue-200 shadow-2xl animate-in fade-in zoom-in duration-150 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Recepción de Ropa · Pedido desde la App</h3>
                  <p className="text-xs text-slate-500">
                    Cliente: <strong>{recordForIntake.customerName}</strong> {recordForIntake.customerPhone ? `(${recordForIntake.customerPhone})` : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIntakeModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 mb-4 flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Nota del operario:</strong> Verifica la cantidad real de cestas al pesar la ropa del cliente y ajusta si es necesario.
              </span>
            </div>

            <form onSubmit={handleConfirmIntake} className="space-y-4">
              {/* Ajuste de Cestas */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-sm text-slate-900">Cestas de Ropa Recibidas:</p>
                  <p className="text-[11px] text-slate-500">
                    Cotizó en la app: {recordForIntake.washCount} cesta(s) (~$7.50 c/u)
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIntakeBaskets(Math.max(1, intakeBaskets - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-bold hover:bg-blue-600 hover:text-white flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-black text-lg font-mono text-slate-900">
                    {intakeBaskets}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIntakeBaskets(intakeBaskets + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-bold hover:bg-blue-600 hover:text-white flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Insumos adicionales */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-1">Cloro (+$0.50):</span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIntakeBleach(Math.max(0, intakeBleach - 1))}
                      className="w-7 h-7 rounded bg-white border border-slate-200 font-bold"
                    >-</button>
                    <span className="font-bold text-sm">{intakeBleach}</span>
                    <button
                      type="button"
                      onClick={() => setIntakeBleach(intakeBleach + 1)}
                      className="w-7 h-7 rounded bg-white border border-slate-200 font-bold"
                    >+</button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-1">Desengrasante (+$0.50):</span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIntakeDegreaser(Math.max(0, intakeDegreaser - 1))}
                      className="w-7 h-7 rounded bg-white border border-slate-200 font-bold"
                    >-</button>
                    <span className="font-bold text-sm">{intakeDegreaser}</span>
                    <button
                      type="button"
                      onClick={() => setIntakeDegreaser(intakeDegreaser + 1)}
                      className="w-7 h-7 rounded bg-white border border-slate-200 font-bold"
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Monto Final Recalculado */}
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 block">Monto Total Ajustado:</span>
                  <span className="text-[11px] text-blue-700">
                    ≈ Bs. {(((intakeBaskets * (prices.comboFull || 7.50)) + (intakeBleach * 0.50) + (intakeDegreaser * 0.50)) * (exchangeRate || 40.50)).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-blue-950">
                  ${((intakeBaskets * (prices.comboFull || 7.50)) + (intakeBleach * 0.50) + (intakeDegreaser * 0.50)).toFixed(2)} USD
                </div>
              </div>

              {/* Estado y Método de Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cobro:</label>
                  <select
                    value={intakePaymentStatus}
                    onChange={(e) => setIntakePaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50"
                  >
                    <option value="paid">✓ Cancela Ahora Completo</option>
                    <option value="pending">⏳ Deja Ropa (Paga al retirar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Método de Pago:</label>
                  <select
                    value={intakePaymentMethod}
                    onChange={(e) => setIntakePaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50"
                  >
                    <option value="pago_movil">📱 Pago Móvil</option>
                    <option value="usd_cash">💵 Efectivo USD ($)</option>
                    <option value="bs_cash">🇻🇪 Efectivo Bs</option>
                    <option value="transfer">🏦 Transferencia Bancaria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Referencia Bancaria (si canceló):</label>
                <input
                  type="text"
                  value={intakeBankRef}
                  onChange={(e) => setIntakeBankRef(e.target.value)}
                  placeholder="Ej: RF 4589"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIntakeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase shadow-md flex items-center gap-1.5"
                >
                  <Check size={16} />
                  <span>Confirmar Recepción y Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
