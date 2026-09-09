import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, Percent, 
  Plus, CheckCircle2, Clock, MessageSquare, AlertCircle, 
  Layers, ChevronRight, UserCheck, ArrowUpRight
} from 'lucide-react';
import OrderTicketModal from './OrderTicketModal';

export default function AccountingDashboard() {
  const { 
    orders, expenses, exchangeRate, setExchangeRate, 
    updateOrderStatus, updatePaymentStatus, addExpense 
  } = useApp();

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
            Control de Caja y Finanzas
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

        {/* Por Cobrar al Retirar */}
        <div className="rounded-3xl bg-white p-6 border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">Por Cobrar (Al Retirar)</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600"><Clock size={16} /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono mb-1">
            ${pendingIncomeUSD.toFixed(2)}
          </div>
          <div className="text-xs text-amber-800 font-mono font-semibold">
            ~Bs. {(pendingIncomeUSD * exchangeRate).toFixed(2)}
          </div>
        </div>

        {/* Total Gastos Operativos */}
        <div className="rounded-3xl bg-white p-6 border border-red-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-mono uppercase font-semibold">Gastos Operativos</span>
            <span className="p-2 rounded-xl bg-red-50 text-red-600"><TrendingDown size={16} /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-700 font-mono mb-1">
            ${totalExpensesUSD.toFixed(2)}
          </div>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="text-[11px] text-red-600 font-bold underline mt-1 block hover:text-red-700"
          >
            + Registrar Gasto
          </button>
        </div>

        {/* Ganancia Neta & Margen */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 border border-emerald-300 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-mono uppercase font-bold">Ganancia Neta Real</span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700"><Percent size={16} /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono mb-1">
            ${netProfitUSD.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-700 font-bold font-mono">
            Margen de Ganancia: {profitMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Desglose de Métodos de Pago */}
      <div className="rounded-3xl bg-white p-6 border border-blue-200/80 shadow-sm">
        <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider font-bold mb-4">
          Distribución de Caja por Método de Pago:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1 font-medium">Pago Móvil</span>
            <span className="text-lg font-black text-slate-900 font-mono">${pagoMovilTotal.toFixed(2)}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1 font-medium">Divisas ($ Efectivo)</span>
            <span className="text-lg font-black text-slate-900 font-mono">${usdCashTotal.toFixed(2)}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1 font-medium">Efectivo en Bs</span>
            <span className="text-lg font-black text-slate-900 font-mono">${bsCashTotal.toFixed(2)}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1 font-medium">Transferencias</span>
            <span className="text-lg font-black text-slate-900 font-mono">${transferTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Orders Management Table */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-blue-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Tickets y Órdenes Recientes</h3>
            <p className="text-xs text-slate-500">Control de estado de lavado, cobros y avisos por WhatsApp</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-bold">
            {filteredOrders.length} Órdenes
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No hay tickets registrados en este período.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 font-mono uppercase text-[11px] bg-slate-50/50">
                <tr>
                  <th className="py-3 px-3">Ticket</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Servicio</th>
                  <th className="py-3 px-3">Monto</th>
                  <th className="py-3 px-3">Pago</th>
                  <th className="py-3 px-3">Estado Ropa</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-4 px-3 font-mono font-black text-blue-700">{order.id}</td>
                    <td className="py-4 px-3">
                      <div className="font-black text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{order.customerPhone}</div>
                    </td>
                    <td className="py-4 px-3 max-w-[200px] truncate text-slate-600 font-medium">{order.itemsSummary}</td>
                    <td className="py-4 px-3 font-mono font-black text-slate-900">
                      ${order.totalUSD.toFixed(2)}
                      <span className="block text-[10px] text-slate-500 font-normal">Bs. {order.totalBs.toFixed(0)}</span>
                    </td>
                    <td className="py-4 px-3">
                      {order.paymentStatus === 'paid' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✅ Pagado
                        </span>
                      ) : (
                        <button
                          onClick={() => updatePaymentStatus(order.id, 'paid')}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                          ⏳ Marcar Pagado
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                      >
                        <option value="received">📥 Recibido</option>
                        <option value="washing">🧼 En Lavado</option>
                        <option value="drying">💨 En Secado</option>
                        <option value="ready">✨ Listo</option>
                        <option value="delivered">📦 Entregado</option>
                      </select>
                    </td>
                    <td className="py-4 px-3 text-right">
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
