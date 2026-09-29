import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, Percent, 
  Plus, CheckCircle2, Clock, MessageSquare, AlertCircle, 
  Layers, ChevronRight, UserCheck, ArrowUpRight, ShieldAlert,
  AlertTriangle, FileText, Package, Lock, Key, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import OrderTicketModal from './OrderTicketModal';

export default function AccountingDashboard() {
  const { 
    orders, expenses, exchangeRate, setExchangeRate, 
    updateOrderStatus, updatePaymentStatus, addExpense,
    auditLogs, dailyClosures, detergentLogs, dailyRecords,
    isCloudConnected, setIsCloudConnected, resetSystemToCleanState,
    changePasswords
  } = useApp();

  const [showCloudModal, setShowCloudModal] = useState(false);
  const [firebaseConfigInput, setFirebaseConfigInput] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customProjectId, setCustomProjectId] = useState('');
  const [cloudSyncStatusMsg, setCloudSyncStatusMsg] = useState('');
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);

  // Modal de Puesta a Cero / Iniciar Operaciones Reales
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetAdminPassword, setResetAdminPassword] = useState('');
  const [resetClearTickets, setResetClearTickets] = useState(true);
  const [resetClearClosures, setResetClearClosures] = useState(true);
  const [resetClearDetergents, setResetClearDetergents] = useState(true);
  const [resetClearExpenses, setResetClearExpenses] = useState(true);
  const [resetClearCustomers, setResetClearCustomers] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetResultMsg, setResetResultMsg] = useState({ text: '', type: '' });

  // Gestión de Seguridad & Contraseñas
  const [currentAdminPassInput, setCurrentAdminPassInput] = useState('');
  const [newAdminPassInput, setNewAdminPassInput] = useState('');
  const [confirmAdminPassInput, setConfirmAdminPassInput] = useState('');
  const [newEmployeePassInput, setNewEmployeePassInput] = useState('');
  const [confirmEmployeePassInput, setConfirmEmployeePassInput] = useState('');
  const [showPassValues, setShowPassValues] = useState(false);
  const [passChangeStatus, setPassChangeStatus] = useState({ text: '', type: '' });
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Función ultra-robusta para auto-detectar campos de cualquier texto que pegue el usuario
  const autoParseFirebaseText = (text) => {
    setFirebaseConfigInput(text);
    if (!text || !text.trim()) return;

    // 1. Buscar apiKey
    let foundKey = '';
    const keyMatch = text.match(/apiKey["']?\s*[:=]\s*["']?([A-Za-z0-9_\-]+)["']?/i);
    if (keyMatch && keyMatch[1]) {
      foundKey = keyMatch[1];
    } else {
      // Fallback: patrón estándar de Google API key (AIzaSy...)
      const directKey = text.match(/(AIza[0-9A-Za-z_\-]{30,45})/);
      if (directKey) foundKey = directKey[1];
    }
    if (foundKey) setCustomApiKey(foundKey);

    // 2. Buscar projectId
    let foundProj = '';
    const projMatch = text.match(/projectId["']?\s*[:=]\s*["']?([a-z0-9_\-]+)["']?/i);
    if (projMatch && projMatch[1]) {
      foundProj = projMatch[1];
    } else {
      // Fallback: buscar dominio .firebaseapp.com
      const domainMatch = text.match(/([a-z0-9_\-]+)\.firebaseapp\.com/i);
      if (domainMatch && domainMatch[1]) foundProj = domainMatch[1];
    }
    if (foundProj) setCustomProjectId(foundProj);
  };

  const [adminTab, setAdminTab] = useState('metrics'); // 'metrics' | 'audit' | 'closures' | 'supplies'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'today' | 'all'
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Formulario nuevo gasto rápido
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('supplies');
  const [expenseAmountUSD, setExpenseAmountUSD] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Unificación integral: reúne los servicios cargados desde Mostrador, Cuaderno Diario, App y Tickets
  const allOrders = React.useMemo(() => {
    const list = new Map();

    // 1. Mapear todos los dailyRecords (donde se cargan los servicios de mostrador y cuaderno)
    (dailyRecords || []).forEach(r => {
      if (!r || !r.id) return;
      const rIdStr = String(r.id);
      const isPaid = r.paymentStatus === 'paid';
      const isDelivered = r.deliveryStatus === 'delivered';
      const orderId = rIdStr.startsWith('rec_') ? `AJ-${rIdStr.slice(4)}` : rIdStr;
      list.set(r.id, {
        id: orderId,
        recordId: r.id,
        customerName: r.customerName,
        customerPhone: r.customerPhone || 'En mostrador',
        date: r.date,
        time: r.time,
        itemsSummary: r.notes || `${r.washCount || 1} Cesta(s) (${r.washCount || 1} lav, ${r.dryCount || 0} sec)`,
        totalUSD: r.totalUSD || 0,
        totalBs: r.totalBs || 0,
        amountPaidUSD: r.amountPaidUSD !== undefined ? r.amountPaidUSD : (isPaid ? r.totalUSD : 0),
        amountPaidBs: r.amountPaidBs !== undefined ? r.amountPaidBs : (isPaid ? r.totalBs : 0),
        debtUSD: r.debtUSD !== undefined ? r.debtUSD : (isPaid ? 0 : r.totalUSD),
        paymentStatus: r.paymentStatus || 'pending',
        paymentMethod: r.paymentMethod || 'pago_movil',
        orderStatus: isDelivered ? 'delivered' : 'ready',
        deliveryStatus: r.deliveryStatus || 'in_store',
        origin: r.origin || 'counter',
        bankReference: r.bankReference || '',
        notes: r.notes || ''
      });
    });

    // 2. Mapear orders adicionales si no coinciden por id
    (orders || []).forEach(o => {
      const key = o.originalId || o.id;
      if (!list.has(key) && !list.has(o.id) && !list.has(`rec_${o.id.replace('AJ-', '')}`)) {
        list.set(o.id, o);
      }
    });

    return Array.from(list.values()).sort((a, b) => {
      const da = (a.date || '') + ' ' + (a.time || '');
      const db = (b.date || '') + ' ' + (b.time || '');
      return db.localeCompare(da);
    });
  }, [dailyRecords, orders]);

  // Filtrado
  const filteredOrders = filterPeriod === 'today' ? allOrders.filter(o => o.date === todayStr) : allOrders;
  const filteredExpenses = filterPeriod === 'today' ? expenses.filter(e => e.date === todayStr) : expenses;

  // Métricas Financieras
  const totalIncomeUSD = filteredOrders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.totalUSD : 0), 0);
  const pendingIncomeUSD = filteredOrders.reduce((acc, o) => acc + (o.paymentStatus === 'pending' ? o.totalUSD : 0), 0);
  const totalExpensesUSD = filteredExpenses.reduce((acc, e) => acc + e.amountUSD, 0);
  const netProfitUSD = totalIncomeUSD - totalExpensesUSD;
  const profitMargin = totalIncomeUSD > 0 ? ((netProfitUSD / totalIncomeUSD) * 100) : 0;

  // Desglose por métodos de pago
  const pagoMovilTotal = filteredOrders.filter(o => o.paymentStatus === 'paid' && o.paymentMethod === 'pago_movil').reduce((acc, o) => acc + o.totalUSD, 0);
  const usdCashTotal = filteredOrders.filter(o => o.paymentStatus === 'paid' && o.paymentMethod === 'usd_cash').reduce((acc, o) => acc + o.totalUSD, 0);
  const bsCashTotal = filteredOrders.filter(o => o.paymentStatus === 'paid' && o.paymentMethod === 'bs_cash').reduce((acc, o) => acc + o.totalUSD, 0);
  const transferTotal = filteredOrders.filter(o => o.paymentStatus === 'paid' && o.paymentMethod === 'transfer').reduce((acc, o) => acc + o.totalUSD, 0);

  // Enviar mensaje de ropa lista
  const notifyCustomerReady = (order) => {
    const phoneDigits = order.customerPhone.replace(/\D/g, '');
    const formattedPhone = phoneDigits.startsWith('0') ? `58${phoneDigits.slice(1)}` : phoneDigits.startsWith('58') ? phoneDigits : `58${phoneDigits}`;
    
    let msg = `🧺 *¡HOLA ${order.customerName.toUpperCase()}! TU ROPA ESTÁ LISTA EN LAVANDERÍA AJ*\n\n` +
      `*Ticket:* #${order.id}\n` +
      `*Servicio:* ${order.itemsSummary}\n` +
      `*Estado:* Listo y empaquetado para retirar ✨\n`;

    if (order.paymentStatus === 'pending') {
      msg += `\n*Monto pendiente al retirar:* $${order.totalUSD.toFixed(2)} USD (Bs. ${order.totalBs.toFixed(2)})\n`;
    } else {
      msg += `\n*Estado de Pago:* ✅ Totalmente Pagado\n`;
    }

    msg += `\nPuedes pasar a retirar en nuestro horario habitual. ¡Te esperamos!`;

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmountUSD) return;

    addExpense({
      category: expenseCategory,
      description: expenseDesc,
      amountUSD: parseFloat(expenseAmountUSD),
      amountBs: parseFloat(expenseAmountUSD) * exchangeRate,
      date: todayStr
    });

    setExpenseDesc('');
    setExpenseAmountUSD('');
    setShowExpenseModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Controls Bar */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-blue-200/80 shadow-md shadow-blue-900/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-mono uppercase text-blue-600 font-bold mb-1">
            Panel de Administración & Contabilidad Diaria
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Control de Caja, Finanzas y Auditoría
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Tasa del día */}
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-200 px-3">
            <span className="text-[11px] text-slate-600 font-mono font-semibold">Tasa Bs/$:</span>
            <input
              type="number"
              step="0.1"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
              className="w-16 bg-white border border-blue-200 rounded-lg text-xs text-slate-900 font-black p-1 text-center font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Period selector */}
          <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 flex">
            <button
              onClick={() => setFilterPeriod('today')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterPeriod === 'today' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterPeriod === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Histórico
            </button>
          </div>

          {/* Cloud Sync Button */}
          <button
            type="button"
            onClick={() => setShowCloudModal(true)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all border shadow-xs ${
              isCloudConnected 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 animate-pulse'
            }`}
            title="Conexión en la nube para sincronizar laptops y teléfonos en tiempo real"
          >
            <span className="text-base">{isCloudConnected ? '☁️' : '⚠️'}</span>
            <span>{isCloudConnected ? 'Nube Activa (En Vivo)' : 'Sincronizar Teléfonos'}</span>
          </button>

          {/* Puesta a Cero / Iniciar Operaciones Reales */}
          <button
            type="button"
            onClick={() => {
              setResetResultMsg({ text: '', type: '' });
              setResetAdminPassword('');
              setShowResetModal(true);
            }}
            className="px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-xs"
            title="Limpiar datos de prueba y poner el sistema a cero para comenzar operaciones reales"
          >
            <span className="text-base">🧹</span>
            <span>Poner a Cero</span>
          </button>

          {/* New Ticket Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus size={16} /> Nuevo Ticket
          </button>
        </div>
      </div>

      {/* Selector de Pestañas de Administración */}
      <div className="flex flex-wrap items-center gap-2 border-b border-blue-200/80 pb-3">
        <button
          onClick={() => setAdminTab('metrics')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 ${
            adminTab === 'metrics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <TrendingUp size={16} />
          <span>Finanzas & Tickets</span>
        </button>

        <button
          onClick={() => setAdminTab('audit')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 ${
            adminTab === 'audit'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
          }`}
        >
          <ShieldAlert size={16} />
          <span>🛡️ Bitácora de Auditoría ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('closures')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 ${
            adminTab === 'closures'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <DollarSign size={16} />
          <span>📊 Cierres Diarios Cuadrados ({dailyClosures.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('supplies')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 ${
            adminTab === 'supplies'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <Layers size={16} />
          <span>🧴 Insumos & Detergentes ({detergentLogs.length})</span>
        </button>

        <button
          onClick={() => {
            setAdminTab('security');
            setPassChangeStatus({ text: '', type: '' });
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 ${
            adminTab === 'security'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200'
          }`}
        >
          <Lock size={16} />
          <span>🔐 Seguridad & Claves</span>
        </button>
      </div>

      {/* CONTENIDO SEGÚN PESTAÑA ACTIVA */}
      {adminTab === 'metrics' && (
        <>
          {/* Financial Key Metrics (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Ingresos Cobrados */}
            <div className="rounded-3xl bg-white p-6 border border-blue-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-mono uppercase font-semibold">Ingresos Cobrados</span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600"><DollarSign size={16} /></span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mb-1">
                ${totalIncomeUSD.toFixed(2)}
              </div>
              <div className="text-xs text-blue-700 font-mono font-semibold">
                ~Bs. {(totalIncomeUSD * exchangeRate).toFixed(2)}
              </div>
            </div>

            {/* Ganancia Neta Estimada */}
            <div className="rounded-3xl bg-white p-6 border border-blue-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-mono uppercase font-semibold">Ganancia Neta</span>
                <span className={`p-2 rounded-xl ${netProfitUSD >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  <TrendingUp size={16} />
                </span>
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono mb-1 ${netProfitUSD >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                ${netProfitUSD.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Margen operativo: <strong className="text-slate-800">{profitMargin.toFixed(1)}%</strong>
              </div>
            </div>

            {/* Gastos Operativos */}
            <div className="rounded-3xl bg-white p-6 border border-blue-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-mono uppercase font-semibold">Gastos Registrados</span>
                <button 
                  onClick={() => setShowExpenseModal(true)}
                  className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  title="Añadir gasto"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mb-1">
                ${totalExpensesUSD.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500">
                {filteredExpenses.length} deducciones registradas
              </div>
            </div>

            {/* Por Cobrar (Pendiente en Almacén) */}
            <div className="rounded-3xl bg-white p-6 border border-blue-200/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-mono uppercase font-semibold">Por Cobrar al Retirar</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600"><Clock size={16} /></span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-900 font-mono mb-1">
                ${pendingIncomeUSD.toFixed(2)}
              </div>
              <div className="text-xs text-amber-700 font-medium">
                Ropa terminada pendiente de cobro
              </div>
            </div>
          </div>

          {/* Payment Methods Breakdown & Expenses Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Method Breakdown */}
            <div className="lg:col-span-2 rounded-3xl bg-white p-6 sm:p-8 border border-blue-200/80 shadow-sm">
              <h3 className="text-base font-black text-slate-900 mb-6 flex items-center justify-between">
                <span>Distribución de Ingresos por Método de Pago</span>
                <span className="text-xs font-mono text-slate-500 font-semibold">{filteredOrders.filter(o => o.paymentStatus === 'paid').length} cobros</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <span className="text-xs font-bold text-blue-900 block mb-1">📱 Pago Móvil</span>
                  <div className="text-lg font-black text-slate-900 font-mono">${pagoMovilTotal.toFixed(2)}</div>
                  <div className="text-[10px] text-blue-700 font-mono">~Bs. {(pagoMovilTotal * exchangeRate).toFixed(2)}</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-900 block mb-1">💵 Efectivo USD</span>
                  <div className="text-lg font-black text-slate-900 font-mono">${usdCashTotal.toFixed(2)}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">En billetes caja</div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                  <span className="text-xs font-bold text-indigo-900 block mb-1">🇻🇪 Efectivo Bs</span>
                  <div className="text-lg font-black text-slate-900 font-mono">${bsCashTotal.toFixed(2)}</div>
                  <div className="text-[10px] text-indigo-700 font-mono">~Bs. {(bsCashTotal * exchangeRate).toFixed(2)}</div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
                  <span className="text-xs font-bold text-purple-900 block mb-1">🏦 Transferencia</span>
                  <div className="text-lg font-black text-slate-900 font-mono">${transferTotal.toFixed(2)}</div>
                  <div className="text-[10px] text-purple-700 font-mono">Banesco/Mercantil</div>
                </div>
              </div>
            </div>

            {/* Expenses Summary Box */}
            <div className="rounded-3xl bg-white p-6 border border-blue-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-slate-900">Gastos Recientes</h3>
                  <button 
                    onClick={() => setShowExpenseModal(true)}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    + Agregar
                  </button>
                </div>
                <div className="space-y-2.5">
                  {filteredExpenses.slice(0, 3).map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-800">{e.description}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{e.date}</div>
                      </div>
                      <span className="font-mono font-bold text-red-600">-${e.amountUSD.toFixed(2)}</span>
                    </div>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <p className="text-xs text-slate-400 py-4 text-center">No hay gastos en este periodo</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Orders / Tickets List */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-blue-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Tickets de Servicio y Ropa en Proceso</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control de clientes, cestas recibidas y entregas</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> Nuevo Ticket
              </button>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <AlertCircle size={36} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-semibold">No hay tickets registrados en este periodo</p>
              </div>
            ) : (
              <div className="overflow-x-auto touch-scroll w-full" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}>
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[11px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Ticket / Hora</th>
                      <th className="py-3 px-4">Cliente / Contacto</th>
                      <th className="py-3 px-4">Servicio</th>
                      <th className="py-3 px-4 text-right">Total ($ USD)</th>
                      <th className="py-3 px-4 text-center">Forma de Pago</th>
                      <th className="py-3 px-4 text-center">Estado Ropa</th>
                      <th className="py-3 px-4 text-center">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-blue-600 text-xs block">
                            #{order.id}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-700 block mt-0.5">
                            🕒 {order.time || '--:--'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 block">
                            {order.date}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{order.customerName}</span>
                            {order.origin === 'walk_in' || order.origin === 'counter' ? (
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold border border-slate-200">
                                🏢 Mostrador
                              </span>
                            ) : order.origin === 'app' ? (
                              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-black border border-blue-200">
                                📱 App
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">{order.customerPhone}</div>
                          {order.notes && <div className="text-[10px] text-amber-700 italic max-w-xs truncate">{order.notes}</div>}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {order.itemsSummary}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900 text-sm whitespace-nowrap">
                          <div>${order.totalUSD.toFixed(2)}</div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            ≈ Bs. {(order.totalBs || (order.totalUSD * (exchangeRate || 1))).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {order.paymentStatus === 'paid' ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ✓ Pagado
                              </span>
                              <div className="text-[11px] font-bold text-slate-800">
                                {order.paymentMethod === 'usd_cash' && '💵 Divisa $ (Efectivo)'}
                                {order.paymentMethod === 'pago_movil' && '📱 Pago Móvil'}
                                {order.paymentMethod === 'bs_cash' && '🇻🇪 Efectivo Bs.'}
                                {order.paymentMethod === 'transfer' && '🏦 Transferencia'}
                                {!['usd_cash', 'pago_movil', 'bs_cash', 'transfer'].includes(order.paymentMethod) && order.paymentMethod}
                              </div>
                              {order.bankReference && (
                                <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block max-w-[140px] truncate">
                                  {order.bankReference}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                order.paymentStatus === 'partial'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-red-100 text-red-800 border border-red-300'
                              }`}>
                                {order.paymentStatus === 'partial' ? '⚠️ Abono Parcial' : '⏳ Por Cobrar'}
                              </span>
                              <div className="text-xs font-mono font-black text-red-600">
                                Debe: ${(order.debtUSD !== undefined && order.debtUSD > 0 ? order.debtUSD : order.totalUSD).toFixed(2)} USD
                              </div>
                              <span className="text-[10px] text-slate-400 block">
                                Paga al retirar
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => notifyCustomerReady(order)}
                            title="Notificar por WhatsApp que la ropa está lista"
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] inline-flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <MessageSquare size={13} />
                            Avisar Listo
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* PESTAÑA: BITÁCORA DE AUDITORÍA Y TRAZABILIDAD (BORRADOS) */}
      {adminTab === 'audit' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black shadow-sm">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  Bitácora de Auditoría y Trazabilidad de Borrados
                </h3>
                <p className="text-xs text-slate-600">
                  Control estricto de seguridad: Cualquier dato eliminado por la empleada requiere tu contraseña y queda registrado aquí con fecha, monto y el motivo exacto.
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-amber-900 bg-white px-3.5 py-1.5 rounded-xl border border-amber-300">
              {auditLogs.length} Evento(s) Registrado(s)
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-black text-slate-900 text-sm">Historial Inmutable de Acciones</h4>
              <span className="text-[11px] text-slate-500 font-medium">Solo visible para el Administrador</span>
            </div>

            <div className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        log.action === 'ELIMINACIÓN_REGISTRO'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {log.performedBy}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-500 font-medium">
                      🕒 {log.timestamp}
                    </span>
                  </div>

                  {/* MOTIVO OBLIGATORIO DESTACADO */}
                  <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5">
                    <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-black text-amber-900 uppercase tracking-wide">
                        Motivo ingresado para autorizar el borrado:
                      </span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        "{log.reason}"
                      </p>
                    </div>
                  </div>

                  {/* SNAPSHOT DEL REGISTRO BORRADO */}
                  {log.recordSnapshot && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Cliente afectado:</span>
                        <strong className="text-slate-900">{log.recordSnapshot.cliente}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Monto borrado:</span>
                        <strong className="text-red-700 font-mono">${log.recordSnapshot.montoUSD?.toFixed(2)} USD</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Fecha/Hora original:</span>
                        <span className="font-mono">{log.recordSnapshot.fecha} ({log.recordSnapshot.hora})</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Servicios / REF:</span>
                        <span>{log.recordSnapshot.servicios} · {log.recordSnapshot.referencia}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: CIERRES DIARIOS CUADRADOS */}
      {adminTab === 'closures' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-blue-50/70 border border-blue-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                Historial de Cierres Diarios de Caja
              </h3>
              <p className="text-xs text-slate-600">
                Arqueos de caja entregados por la encargada al final de cada turno.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-900 bg-white px-3 py-1.5 rounded-xl border border-blue-200">
              {dailyClosures.length} Cierres
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyClosures.map((closure) => (
              <div key={closure.id} className="p-6 rounded-3xl bg-white border border-blue-200/80 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-mono text-slate-500 font-medium">Cierre del {closure.date}</span>
                    <h4 className="text-xl font-black text-slate-900 font-mono">${closure.cobradoUSD.toFixed(2)} USD</h4>
                    <span className="text-xs text-blue-700 font-mono font-semibold">≈ Bs. {closure.cobradoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                    Cerrado por: {closure.closedBy}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                    <span className="text-[10px] text-purple-700 font-bold block">Pago Móvil / Transf:</span>
                    <strong className="text-purple-950 font-mono">Bs. {closure.pagoMovilBs.toLocaleString('es-VE')}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 font-bold block">Divisas en Efectivo:</span>
                    <strong className="text-emerald-950 font-mono">${closure.divisasEfectivoUSD.toFixed(2)} USD</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                    <span className="text-[10px] text-amber-700 font-bold block">Efectivo en Bs:</span>
                    <strong className="text-amber-950 font-mono">Bs. {closure.efectivoBs.toLocaleString('es-VE')}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-600 font-bold block">Dinero Entregado:</span>
                    <strong className="text-slate-900 font-mono">Bs. {closure.dineroEntregadoBs} / ${closure.dineroEntregadoUSD}</strong>
                  </div>
                </div>

                {closure.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{closure.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA: CONSUMO DE INSUMOS Y DETERGENTES */}
      {adminTab === 'supplies' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-blue-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                Consumo y Apertura de Detergentes
              </h3>
              <p className="text-xs text-slate-600">
                Registro de envases de jabón, suavizante, cloro y desengrasante iniciados en el taller.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              {detergentLogs.length} Aperturas
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            <div className="divide-y divide-slate-100">
              {detergentLogs.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {item.item === 'Jabón' ? '🧴' : item.item === 'Suavizante' ? '🌸' : item.item === 'Cloro' ? '🧪' : '🧽'}
                    </span>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm">{item.item} iniciado</h5>
                      <p className="text-slate-500 text-[11px]">{item.notes} · Registrado por: {item.employee}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-slate-600">
                    <p className="font-bold">{item.date}</p>
                    <p className="text-[10px]">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA: SEGURIDAD Y GESTIÓN DE CONTRASEÑAS */}
      {adminTab === 'security' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-white border border-indigo-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-xs">
                <Lock size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  Gestión de Seguridad & Contraseñas
                </h3>
                <p className="text-xs text-slate-500">
                  Control de credenciales de acceso para Administradores y Personal de Mostrador.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 flex items-center gap-1.5">
                <ShieldCheck size={16} />
                <span>Credenciales Protegidas</span>
              </span>
            </div>
          </div>

          {/* Tarjetas de Información de Roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rol Administrador */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-white/10 text-indigo-300">
                    <Key size={18} />
                  </span>
                  <h4 className="font-black text-sm">Clave Maestra Administrador</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Activa
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Autoriza el acceso al módulo de Finanzas, Cierres Diarios, Auditoría, Eliminación de registros y Puesta a Cero del sistema.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-200 bg-white/5 p-2 rounded-xl border border-white/10">
                <span>🛡️ Estado: Configurada & Encriptada localmente</span>
              </div>
            </div>

            {/* Rol Personal LAV */}
            <div className="p-5 rounded-3xl bg-white border border-blue-200 shadow-sm relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Key size={18} />
                  </span>
                  <h4 className="font-black text-sm text-slate-900">Clave de Personal de Mostrador</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  Personal LAV
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Permite a las empleadas y encargadas iniciar turno en la estación de trabajo y registrar tickets en el cuaderno físico/digital.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span>🧺 Permiso: Mostrador, Cestas y Cobros</span>
              </div>
            </div>
          </div>

          {/* Formulario de Cambio de Contraseñas */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-black text-slate-900 text-base">
                  Cambiar o Actualizar Contraseñas
                </h4>
                <p className="text-xs text-slate-500">
                  Por seguridad, debes ingresar tu contraseña de administrador actual para validar el cambio.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPassValues(!showPassValues)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors w-fit"
              >
                {showPassValues ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showPassValues ? 'Ocultar texto' : 'Ver contraseñas'}</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPassChangeStatus({ text: '', type: '' });

                if (!currentAdminPassInput.trim()) {
                  setPassChangeStatus({ text: 'Debes ingresar tu contraseña de administrador actual para validar la operación.', type: 'error' });
                  return;
                }

                if (!newAdminPassInput.trim() && !newEmployeePassInput.trim()) {
                  setPassChangeStatus({ text: 'Ingresa al menos una nueva contraseña (de administrador o de personal) para actualizar.', type: 'error' });
                  return;
                }

                if (newAdminPassInput && newAdminPassInput !== confirmAdminPassInput) {
                  setPassChangeStatus({ text: 'Las contraseñas nuevas de Administrador no coinciden entre sí.', type: 'error' });
                  return;
                }

                if (newEmployeePassInput && newEmployeePassInput !== confirmEmployeePassInput) {
                  setPassChangeStatus({ text: 'Las contraseñas nuevas de Personal no coinciden entre sí.', type: 'error' });
                  return;
                }

                setIsUpdatingPass(true);
                const res = await changePasswords({
                  currentAdminPassword: currentAdminPassInput,
                  newAdminPassword: newAdminPassInput.trim() || undefined,
                  newEmployeePassword: newEmployeePassInput.trim() || undefined
                });
                setIsUpdatingPass(false);

                if (res.success) {
                  setPassChangeStatus({ text: res.message, type: 'success' });
                  setCurrentAdminPassInput('');
                  setNewAdminPassInput('');
                  setConfirmAdminPassInput('');
                  setNewEmployeePassInput('');
                  setConfirmEmployeePassInput('');
                } else {
                  setPassChangeStatus({ text: res.message, type: 'error' });
                }
              }}
              className="space-y-6"
            >
              {/* Sección 1: Contraseña Actual */}
              <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200">
                <label className="block text-xs font-black text-amber-950 mb-1.5">
                  1. Contraseña de Administrador Actual *:
                </label>
                <input
                  type={showPassValues ? 'text' : 'password'}
                  required
                  value={currentAdminPassInput}
                  onChange={(e) => setCurrentAdminPassInput(e.target.value)}
                  placeholder="Ingresa tu contraseña actual de administrador"
                  className="w-full p-3 rounded-xl border border-amber-300 font-mono text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-amber-800 mt-1 block">
                  Requerido para autorizar el cambio.
                </span>
              </div>

              {/* Sección 2: Nueva Contraseña Administrador */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <h5 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <span>👑 2. Nueva Contraseña de Administrador</span>
                    <span className="text-[10px] font-normal text-slate-500">(Opcional, dejar vacío si no la vas a cambiar)</span>
                  </h5>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nueva Contraseña Admin:
                    </label>
                    <input
                      type={showPassValues ? 'text' : 'password'}
                      value={newAdminPassInput}
                      onChange={(e) => setNewAdminPassInput(e.target.value)}
                      placeholder="Nueva contraseña fuerte"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Repetir Nueva Contraseña Admin:
                    </label>
                    <input
                      type={showPassValues ? 'text' : 'password'}
                      value={confirmAdminPassInput}
                      onChange={(e) => setConfirmAdminPassInput(e.target.value)}
                      placeholder="Confirma la nueva contraseña"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Nueva Contraseña Personal LAV */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <h5 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                    <span>👥 3. Nueva Contraseña para Personal / Empleadas (Mostrador)</span>
                    <span className="text-[10px] font-normal text-slate-500">(Opcional, dejar vacío si no la vas a cambiar)</span>
                  </h5>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nueva Contraseña Personal:
                    </label>
                    <input
                      type={showPassValues ? 'text' : 'password'}
                      value={newEmployeePassInput}
                      onChange={(e) => setNewEmployeePassInput(e.target.value)}
                      placeholder="Nueva contraseña para empleadas"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Repetir Nueva Contraseña Personal:
                    </label>
                    <input
                      type={showPassValues ? 'text' : 'password'}
                      value={confirmEmployeePassInput}
                      onChange={(e) => setConfirmEmployeePassInput(e.target.value)}
                      placeholder="Confirma la nueva contraseña de personal"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Mensajes de resultado */}
              {passChangeStatus.text && (
                <div className={`p-3.5 rounded-2xl text-xs font-bold ${
                  passChangeStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-300'
                }`}>
                  {passChangeStatus.text}
                </div>
              )}

              {/* Botón Guardar */}
              <button
                type="submit"
                disabled={isUpdatingPass}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Lock size={16} />
                <span>{isUpdatingPass ? '⏳ Guardando y Sincronizando...' : '💾 Guardar y Actualizar Contraseñas en Todo el Sistema'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Gasto */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 mb-1">Registrar Gasto Operativo</h3>
            <p className="text-xs text-slate-500 mb-4">Se descontará automáticamente del flujo de caja</p>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-600 font-semibold block mb-1">Concepto del Gasto</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Ej. Compra de cloro, bolsas, pago de agua..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-600 font-semibold block mb-1">Monto ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expenseAmountUSD}
                    onChange={(e) => setExpenseAmountUSD(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-600 font-semibold block mb-1">Categoría</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                  >
                    <option value="supplies">Insumos (Jabón/Suavizante)</option>
                    <option value="maintenance">Mantenimiento / Taller</option>
                    <option value="utilities">Servicios (Agua/Gas/Luz)</option>
                    <option value="payroll">Personal / Nómina</option>
                    <option value="other">Otros</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
                >
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* Modal de Conexión en la Nube (Firebase) */}
      {showCloudModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-blue-200 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl">
                  ☁️
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Sincronización en la Nube (Multi-Dispositivo)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Conexión permanente en tiempo real entre laptop y teléfonos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCloudModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Estado actual de conexión */}
            <div className={`p-4 rounded-2xl border ${
              isCloudConnected 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <div className="flex items-center gap-2 font-black text-sm">
                <span>{isCloudConnected ? '✅ BASE DE DATOS ACTIVA' : '⚠️ MODO LOCAL (SIN SINCRONIZAR)'}</span>
              </div>
              <p className="text-xs mt-1 leading-relaxed">
                {isCloudConnected 
                  ? 'Tu sistema está conectado a Google Cloud Firebase. Cada cliente, pago, abono o cierre se actualiza en vivo al instante en cualquier laptop o teléfono conectado.'
                  : 'Actualmente los datos se guardan solo en la memoria de este navegador. Para que la laptop y el teléfono compartan los mismos datos al segundo, conecta tu proyecto gratuito de Firebase.'}
              </p>
            </div>

            {/* Acciones si ya está conectado */}
            {isCloudConnected && (
              <div className="space-y-4 pt-1">
                {/* CAJA DE ENLACE MÁGICO PARA CONECTAR TELÉFONOS AL INSTANTE */}
                <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-300 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📲</span>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">
                        Conectar Teléfonos con 1 Clic (Sin Escribir Claves)
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Envía este enlace por WhatsApp a tu teléfono o al personal. Al abrirlo, el teléfono se conecta solo.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const saved = localStorage.getItem('aj_firebase_config');
                        if (!saved) return;
                        const cfg = JSON.parse(saved);
                        const magicUrl = `${window.location.origin}/?sync_key=${encodeURIComponent(cfg.apiKey)}&sync_proj=${encodeURIComponent(cfg.projectId)}`;
                        navigator.clipboard.writeText(magicUrl);
                        setCloudSyncStatusMsg('📋 ¡Enlace copiado al portapapeles! Pégalo en el navegador de tu teléfono.');
                        setTimeout(() => setCloudSyncStatusMsg(''), 5000);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span>📋 Copiar Enlace para Teléfonos</span>
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        '🧼 *ENLACE DE CONEXIÓN - LAVANDERÍA AJ*\n' +
                        'Abre este enlace en el navegador de tu teléfono para conectar la base de datos en vivo con la laptop:\n\n' +
                        (() => {
                          try {
                            const saved = localStorage.getItem('aj_firebase_config');
                            if (!saved) return window.location.origin;
                            const cfg = JSON.parse(saved);
                            if (!cfg || !cfg.apiKey || !cfg.projectId) return window.location.origin;
                            return `${window.location.origin}/?sync_key=${encodeURIComponent(cfg.apiKey)}&sync_proj=${encodeURIComponent(cfg.projectId)}`;
                          } catch (e) {
                            return window.location.origin;
                          }
                        })()
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <span>💬 Enviar por WhatsApp al Teléfono</span>
                    </a>
                  </div>
                </div>

                {/* AVISO IMPORTANTE DE REGLAS DE FIRESTORE */}
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
                  <p className="font-black text-amber-950 flex items-center gap-1.5">
                    <span>⚠️ ¿Ya abriste el enlace en el teléfono pero no ves los tickets?</span>
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Entra a <strong>console.firebase.google.com</strong> &gt; tu proyecto &gt; <strong>Firestore Database</strong> &gt; pestaña <strong>Reglas (Rules)</strong>.
                    Verifica que diga: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-amber-950">allow read, write: if true;</code> y haz clic en <strong>Publicar (Publish)</strong>. Si dice <code>if false;</code>, Google bloquea la conexión.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isUploadingLocal}
                  onClick={async () => {
                    setIsUploadingLocal(true);
                    setCloudSyncStatusMsg('Subiendo registros locales a la nube...');
                    try {
                      const { syncDocToCloud } = await import('../../services/firebase');
                      let count = 0;
                      for (const r of dailyRecords) {
                        await syncDocToCloud('daily_records', r.id, r);
                        count++;
                      }
                      for (const o of orders) {
                        await syncDocToCloud('orders', o.id, o);
                      }
                      for (const c of dailyClosures) {
                        await syncDocToCloud('daily_closures', c.date, c);
                      }
                      setCloudSyncStatusMsg(`¡Listo! Se sincronizaron ${count} registros locales a la nube.`);
                      setTimeout(() => setCloudSyncStatusMsg(''), 4000);
                    } catch (err) {
                      setCloudSyncStatusMsg('Error al sincronizar: ' + err.message);
                    } finally {
                      setIsUploadingLocal(false);
                    }
                  }}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <span>{isUploadingLocal ? '⏳ Sincronizando...' : '📤 Subir Todos los Registros de Este Equipo a la Nube'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowCloudModal(false);
                    setResetResultMsg({ text: '', type: '' });
                    setResetAdminPassword('');
                    setShowResetModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>🧹 Puesta a Cero de Datos en la Nube y Este Equipo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Deseas desconectar la base de datos de la nube en este dispositivo?')) {
                      localStorage.removeItem('aj_firebase_config');
                      setIsCloudConnected(false);
                      setCloudSyncStatusMsg('Desconectado. Ahora estás en modo local.');
                    }
                  }}
                  className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50"
                >
                  Desconectar Proyecto de la Nube
                </button>
              </div>
            )}

            {/* Formulario de Configuración si no está conectado */}
            {!isCloudConnected && (
              <div className="space-y-4">
                <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-xs space-y-1.5 text-slate-800">
                  <p className="font-black text-blue-950 flex items-center gap-1.5">
                    <span>💡 Instrucciones rápidas (Firebase Gratis Permanente):</span>
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Pega abajo el bloque que te dio Firebase, <strong>o si prefieres escribe tu API Key y Project ID directamente en las 2 casillas</strong>. El sistema los detecta automáticamente.
                  </p>
                </div>

                {/* Opción A: Pegar todo el bloque */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-slate-900">
                      1. Pega aquí el código que te dio Firebase:
                    </label>
                    {customApiKey && customProjectId && (
                      <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        ✓ Datos detectados
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={firebaseConfigInput}
                    onChange={(e) => autoParseFirebaseText(e.target.value)}
                    placeholder={'Pega aquí todo lo que copiaste de Firebase (const firebaseConfig = { apiKey: "...", ... })'}
                    className="w-full p-3 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Opción B: Las 2 casillas directas editables */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-xs font-black text-slate-900">
                    2. O verifica/escribe los 2 datos directamente:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        API Key (apiKey) *:
                      </label>
                      <input
                        type="text"
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value.trim())}
                        placeholder="Ej: AIzaSyA123456789..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-500"
                      />
                      {customApiKey ? (
                        <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">✓ Válida ({customApiKey.slice(0, 10)}...)</span>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">⚠️ Falta ingresar</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Project ID (projectId) *:
                      </label>
                      <input
                        type="text"
                        value={customProjectId}
                        onChange={(e) => setCustomProjectId(e.target.value.trim().toLowerCase())}
                        placeholder="Ej: lavanderia-aj o aj-express-123"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-500"
                      />
                      {customProjectId ? (
                        <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">✓ {customProjectId}</span>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">⚠️ Falta ingresar</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    // Tomar customApiKey o autoParse
                    let apiKey = customApiKey.trim();
                    let projectId = customProjectId.trim();

                    if (!apiKey || !projectId) {
                      // Intento de rescate si solo pegaron en el textarea
                      const raw = firebaseConfigInput.trim();
                      if (raw) {
                        const k = raw.match(/apiKey["']?\s*[:=]\s*["']?([A-Za-z0-9_\-]+)["']?/i) || raw.match(/(AIza[0-9A-Za-z_\-]{30,45})/);
                        const p = raw.match(/projectId["']?\s*[:=]\s*["']?([a-z0-9_\-]+)["']?/i) || raw.match(/([a-z0-9_\-]+)\.firebaseapp\.com/i);
                        if (k) apiKey = k[1];
                        if (p) projectId = p[1];
                      }
                    }

                    if (!apiKey) {
                      alert('Por favor escribe o pega tu API Key (comienza por AIzaSy...).');
                      return;
                    }
                    if (!projectId) {
                      alert('Por favor escribe o pega tu Project ID (el nombre de tu proyecto en Firebase, ej: lavanderia-aj).');
                      return;
                    }

                    const authDomain = `${projectId}.firebaseapp.com`;
                    const storageBucket = `${projectId}.firebasestorage.app`;
                    const configObj = { 
                      apiKey, 
                      authDomain, 
                      projectId, 
                      storageBucket, 
                      messagingSenderId: '', 
                      appId: '' 
                    };

                    localStorage.setItem('aj_firebase_config', JSON.stringify(configObj));

                    try {
                      setCloudSyncStatusMsg('Conectando a Google Cloud Firebase...');
                      const { initFirebase } = await import('../../services/firebase');
                      const { isConfigured, error } = initFirebase();
                      if (isConfigured) {
                        setIsCloudConnected(true);
                        setCloudSyncStatusMsg('✅ ¡Conexión exitosa! Ahora todos tus dispositivos se sincronizan en vivo.');
                        setTimeout(() => setShowCloudModal(false), 2000);
                      } else {
                        alert('Error al conectar: ' + (error?.message || 'Verifica los datos'));
                        setCloudSyncStatusMsg('');
                      }
                    } catch (e) {
                      alert('Error: ' + e.message);
                      setCloudSyncStatusMsg('');
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm uppercase shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <span>💾 Guardar y Conectar en Vivo</span>
                </button>
              </div>
            )}

            {cloudSyncStatusMsg && (
              <p className="text-xs font-bold text-center text-blue-700 bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                {cloudSyncStatusMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal Puesta a Cero / Iniciar Operaciones Reales */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-100 relative my-8 animate-in fade-in zoom-in duration-150">
            {/* Botón Cerrar */}
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>

            {/* Encabezado */}
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl shadow-xs">
                🧹
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Puesta a Cero del Sistema
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Limpieza de pruebas para inicio de operaciones reales en lavandería
                </p>
              </div>
            </div>

            {/* Explicación clara */}
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-950 space-y-1.5 mb-4">
              <p className="font-bold flex items-center gap-1.5 text-rose-900">
                <span>⚠️ ¿Para qué sirve esta acción?</span>
              </p>
              <p className="text-[11px] leading-relaxed text-rose-800">
                Borra los tickets, cobros y registros simulados para que tu contabilidad y tu cuaderno comiencen 100% limpios.
                {isCloudConnected 
                  ? ' Como tienes la NUBE ACTIVA, se vaciará también en Google Cloud Firestore para que todos tus teléfonos y laptops queden limpios y sincronizados al instante.' 
                  : ' Se limpiarán los datos en este equipo para comenzar desde cero.'}
              </p>
            </div>

            {/* Checkboxes de qué limpiar */}
            <div className="space-y-2 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block mb-2">
                Selecciona qué deseas limpiar:
              </span>

              {/* Tickets y Cuaderno */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={resetClearTickets}
                  onChange={(e) => setResetClearTickets(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    🧺 Tickets de Servicio & Cuaderno Diario ({dailyRecords.length} registros)
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Limpia todas las órdenes de lavado/secado de prueba.
                  </p>
                </div>
              </label>

              {/* Cierres Diarios */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={resetClearClosures}
                  onChange={(e) => setResetClearClosures(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    📊 Cierres Diarios de Caja ({dailyClosures.length} cierres)
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Limpia los cuadres de caja simulados.
                  </p>
                </div>
              </label>

              {/* Apertura de Detergentes */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={resetClearDetergents}
                  onChange={(e) => setResetClearDetergents(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    🧴 Control de Insumos & Detergentes ({detergentLogs.length} notas)
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Limpia las aperturas de botellones y cuñetes de prueba.
                  </p>
                </div>
              </label>

              {/* Gastos */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={resetClearExpenses}
                  onChange={(e) => setResetClearExpenses(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    📉 Gastos Operativos ({expenses.length} gastos)
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Limpia los gastos y compras de prueba.
                  </p>
                </div>
              </label>

              {/* Clientes Registrados */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none pt-2 border-t border-slate-200">
                <input
                  type="checkbox"
                  checked={resetClearCustomers}
                  onChange={(e) => setResetClearCustomers(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    👥 Limpiar también la Cartera de Clientes
                  </span>
                  <p className="text-[10px] text-slate-500">
                    {resetClearCustomers 
                      ? '⚠️ Se borrarán todos los clientes para empezar con la agenda en blanco.' 
                      : '✓ Recomendado: Dejar desmarcado para conservar a los clientes reales ya registrados con su cédula.'}
                  </p>
                </div>
              </label>
            </div>

            {/* Contraseña de Administrador */}
            <div className="mb-4">
              <label className="block text-xs font-black text-slate-800 mb-1">
                🔒 Contraseña de Administrador *:
              </label>
              <input
                type="password"
                value={resetAdminPassword}
                onChange={(e) => setResetAdminPassword(e.target.value)}
                placeholder="Ingresa la contraseña de administrador"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-rose-500 transition-all"
              />
            </div>

            {/* Mensajes de resultado */}
            {resetResultMsg.text && (
              <div className={`p-3 rounded-xl mb-4 text-xs font-bold ${
                resetResultMsg.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : resetResultMsg.type === 'info'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {resetResultMsg.text}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isResetting || !resetAdminPassword.trim()}
                onClick={async () => {
                  if (!resetAdminPassword.trim()) {
                    setResetResultMsg({ text: 'Por favor ingresa la contraseña de administrador.', type: 'error' });
                    return;
                  }

                  setIsResetting(true);
                  setResetResultMsg({ text: 'Limpiando datos en local y en la nube...', type: 'info' });

                  const res = await resetSystemToCleanState(resetAdminPassword, {
                    clearTickets: resetClearTickets,
                    clearClosures: resetClearClosures,
                    clearDetergents: resetClearDetergents,
                    clearExpenses: resetClearExpenses,
                    clearCustomers: resetClearCustomers
                  });

                  setIsResetting(false);
                  if (res.success) {
                    setResetResultMsg({ text: res.message, type: 'success' });
                    setTimeout(() => {
                      setShowResetModal(false);
                    }, 2200);
                  } else {
                    setResetResultMsg({ text: res.message, type: 'error' });
                  }
                }}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>{isResetting ? '⏳ Limpiando...' : '🧹 Confirmar y Poner a Cero'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Ticket */}
      <OrderTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
