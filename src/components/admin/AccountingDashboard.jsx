import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, Percent, 
  Plus, CheckCircle2, Clock, MessageSquare, AlertCircle, 
  Layers, ChevronRight, UserCheck, ArrowUpRight, ShieldAlert,
  AlertTriangle, FileText, Package
} from 'lucide-react';
import OrderTicketModal from './OrderTicketModal';

export default function AccountingDashboard() {
  const { 
    orders, expenses, exchangeRate, setExchangeRate, 
    updateOrderStatus, updatePaymentStatus, addExpense,
    auditLogs, dailyClosures, detergentLogs, dailyRecords
  } = useApp();

  const [adminTab, setAdminTab] = useState('metrics'); // 'metrics' | 'audit' | 'closures' | 'supplies'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all'); // 'today' | 'all'
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Formulario nuevo gasto rápido
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('supplies');
  const [expenseAmountUSD, setExpenseAmountUSD] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtrado
  const filteredOrders = filterPeriod === 'today' ? orders.filter(o => o.date === todayStr) : orders;
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
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[11px] border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Cliente / Contacto</th>
                      <th className="py-3 px-4">Servicio</th>
                      <th className="py-3 px-4 text-right">Total ($ USD)</th>
                      <th className="py-3 px-4 text-center">Pago</th>
                      <th className="py-3 px-4 text-center">Estado Ropa</th>
                      <th className="py-3 px-4 text-center">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">
                          #{order.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{order.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{order.customerPhone}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {order.itemsSummary}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                          ${order.totalUSD.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.paymentStatus === 'paid' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.paymentStatus === 'paid' ? 'Pagado' : 'Por Cobrar'}
                          </span>
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

      {/* Modal Nuevo Ticket */}
      <OrderTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
