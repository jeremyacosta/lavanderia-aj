import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, Plus, Search, Filter, CheckCircle2, 
  Clock, AlertCircle, Trash2, Check, DollarSign, 
  Sparkles, X, ShieldAlert, FileText, Share2, 
  Package, Droplets, CheckSquare, Layers, Lock, 
  Calendar, Eye, Phone, RefreshCw
} from 'lucide-react';

export default function EmployeeWorkStation() {
  const { 
    dailyRecords, 
    addDailyRecord, 
    markRecordDelivered, 
    markRecordPaid, 
    deleteRecordWithAudit, 
    detergentLogs, 
    addDetergentLog, 
    dailyClosures, 
    saveDailyClosure, 
    exchangeRate,
    prices
  } = useApp();

  const [activeTab, setActiveTab] = useState('daily_log'); // 'daily_log' | 'stored_clothes' | 'detergents' | 'closure'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado del Formulario de Carga Rápida
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
  const [paymentMethod, setPaymentMethod] = useState('pago_movil');
  const [bankReference, setBankReference] = useState('');
  const [manualTotalUSD, setManualTotalUSD] = useState('');
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
      notes: notes.trim()
    });

    if (markedNewDetergent) {
      addDetergentLog(newDetergentType, `Apertura registrada en orden de ${customerName.trim()}`, 'Encargada');
    }

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
    setManualTotalUSD('');
    setManualAmountPaidUSD('');
    setBankReference('');
    setNotes('');
    setPaymentStatus('paid');
    setMarkedNewDetergent(false);
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
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2 border border-cyan-500/30">
            <BookOpen size={14} className="text-cyan-400" />
            <span>Puesto de Trabajo · Personal LAV</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Gestión Diaria de Clientes y Caja
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Digitalización del cuaderno físico de Lavandería AJ. Carga de prendas, abonos, ropa en depósito y cierres.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              setShowAddModal(true);
            }}
            className="px-5 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={18} />
            <span>Anotar Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Selector de Pestañas Principales */}
      <div className="flex flex-wrap items-center gap-2 border-b border-blue-200/80 pb-3">
        <button
          onClick={() => setActiveTab('daily_log')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'daily_log'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <FileText size={16} />
          <span>📝 Cuaderno Diario ({recordsOfSelectedDate.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stored_clothes')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'stored_clothes'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <Package size={16} />
          <span>🧺 Ropa Dejada en Depósito ({storedClothesRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('detergents')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'detergents'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <Droplets size={16} />
          <span>🧴 Control de Insumos ({detergentLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('closure')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'closure'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <DollarSign size={16} />
          <span>📊 Cierre Diario de Caja</span>
        </button>
      </div>

      {/* PESTAÑA 1: CUADERNO DIARIO (REGISTRO POR FILAS) */}
      {activeTab === 'daily_log' && (
        <div className="space-y-4">
          
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Calendar size={15} className="text-blue-600" />
                Fecha del Cuaderno:
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-bold text-slate-900 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative w-full sm:w-64">
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
          <div className="bg-white rounded-3xl border border-blue-200/80 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Hora</th>
                    <th className="py-3 px-4">Cliente</th>
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
                  {searchedRecords.length > 0 ? (
                    searchedRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-600 whitespace-nowrap">
                          {rec.time}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-extrabold text-slate-900 text-sm">{rec.customerName}</p>
                          {rec.customerPhone && (
                            <p className="text-[10px] text-slate-500 font-mono">{rec.customerPhone}</p>
                          )}
                          {rec.notes && (
                            <p className="text-[10px] text-amber-700 font-medium italic mt-0.5">
                              {rec.notes}
                            </p>
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
                <div className="sm:col-span-2">
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
              </div>

              {/* Botones de Servicios / Cestas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Cantidades de Servicios por Cesta:</label>
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
                  <label className="block text-xs font-bold text-blue-900 mb-1">Monto Total USD (Calculado: ${calculatedUSD.toFixed(2)}):</label>
                  <input
                    type="number"
                    step="any"
                    value={manualTotalUSD}
                    onChange={(e) => setManualTotalUSD(e.target.value)}
                    placeholder={`Por defecto: ${calculatedUSD.toFixed(2)}`}
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-blue-700">≈ Bs. {effectiveTotalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">Estado del Pago:</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-blue-200 text-xs font-bold text-slate-900 bg-white focus:outline-none"
                  >
                    <option value="paid">✓ Pagado Completo</option>
                    <option value="partial">⏳ Abono Parcial</option>
                    <option value="pending">❌ Debe Completo (Paga al retirar)</option>
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

    </div>
  );
}
