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
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-mono uppercase text-cyan-400 font-bold mb-1">
            Panel de Administración & Contabilidad Diaria
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Control de Caja y Finanzas
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Tasa del día */}
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/40 border border-white/10 px-3">
            <span className="text-[11px] text-gray-400 font-mono">Tasa Bs/$:</span>
            <input
              type="number"
              step="0.1"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
              className="w-16 bg-slate-900 border border-white/10 rounded-lg text-xs text-white font-bold p-1 text-center font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Period selector */}
          <div className="p-1 rounded-2xl bg-slate-900 border border-white/10 flex">
            <button
              onClick={() => setFilterPeriod('today')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterPeriod === 'today' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterPeriod === 'all' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Histórico
            </button>
          </div>

          {/* New Ticket Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
          >
            <Plus size={16} /> Nuevo Ticket
          </button>
        </div>
      </div>

      {/* Financial Key Metrics (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Ingresos Cobrados */}
        <div className="rounded-3xl glass-card p-6 border-cyan-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-mono uppercase">Ingresos Cobrados</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400"><DollarSign size={16} /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mb-1">
            ${totalIncomeUSD.toFixed(2)}
          </div>
          <div className="text-xs text-cyan-400/80 font-mono">
            ~Bs. {(totalIncomeUSD * exchangeRate).toFixed(2)}
          </div>
        </div>

        {/* Por Cobrar al Retirar */}
        <div className="rounded-3xl glass-card p-6 border-amber-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-mono uppercase">Por Cobrar (Al Retirar)</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><Clock size={16} /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mb-1">
            ${pendingIncomeUSD.toFixed(2)}
          </div>
          <div className="text-xs text-amber-300/80 font-mono">
            ~Bs. {(pendingIncomeUSD * exchangeRate).toFixed(2)}
          </div>
        </div>

        {/* Total Gastos Operativos */}
        <div className="rounded-3xl glass-card p-6 border-red-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-mono uppercase">Gastos Operativos</span>
            <span className="p-2 rounded-xl bg-red-500/10 text-red-400"><TrendingDown size={16} /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-400 font-mono mb-1">
            ${totalExpensesUSD.toFixed(2)}
          </div>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="text-[11px] text-red-300 underline mt-1 block"
          >
            + Registrar Gasto
          </button>
        </div>

        {/* Ganancia Neta & Margen */}
        <div className="rounded-3xl glass-card p-6 border-green-500/30 bg-gradient-to-br from-slate-900 to-green-950/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-mono uppercase">Ganancia Neta Real</span>
            <span className="p-2 rounded-xl bg-green-500/20 text-green-400"><Percent size={16} /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-green-400 font-mono mb-1">
            ${netProfitUSD.toFixed(2)}
          </div>
          <div className="text-xs text-green-300 font-bold font-mono">
            Margen de Ganancia: {profitMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Desglose de Métodos de Pago */}
      <div className="rounded-3xl glass-panel p-6 border border-white/5">
        <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">
          Distribución de Caja por Método de Pago:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-xs text-gray-400 block mb-1">Pago Móvil</span>
            <span className="text-lg font-black text-white font-mono">${pagoMovilTotal.toFixed(2)}</span>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-xs text-gray-400 block mb-1">Divisas ($ Efectivo)</span>
            <span className="text-lg font-black text-white font-mono">${usdCashTotal.toFixed(2)}</span>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-xs text-gray-400 block mb-1">Efectivo en Bs</span>
            <span className="text-lg font-black text-white font-mono">${bsCashTotal.toFixed(2)}</span>
          </div>
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <span className="text-xs text-gray-400 block mb-1">Transferencias</span>
            <span className="text-lg font-black text-white font-mono">${transferTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Orders Management Table */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Tickets y Órdenes Recientes</h3>
            <p className="text-xs text-gray-400">Control de estado de lavado, cobros y avisos por WhatsApp</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold">
            {filteredOrders.length} Órdenes
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No hay tickets registrados en este período.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-gray-400 font-mono uppercase text-[11px]">
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
              <tbody className="divide-y divide-white/5 text-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-3 font-mono font-bold text-cyan-400">{order.id}</td>
                    <td className="py-4 px-3">
                      <div className="font-bold text-white">{order.customerName}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{order.customerPhone}</div>
                    </td>
                    <td className="py-4 px-3 max-w-[200px] truncate">{order.itemsSummary}</td>
                    <td className="py-4 px-3 font-mono font-bold text-white">
                      ${order.totalUSD.toFixed(2)}
                      <span className="block text-[10px] text-gray-400">Bs. {order.totalBs.toFixed(0)}</span>
                    </td>
                    <td className="py-4 px-3">
                      {order.paymentStatus === 'paid' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                          ✅ Pagado
                        </span>
                      ) : (
                        <button
                          onClick={() => updatePaymentStatus(order.id, 'paid')}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-green-500 hover:text-black transition-colors"
                        >
                          ⏳ Marcar Pagado
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-lg p-1.5 text-[11px] text-white focus:outline-none focus:border-cyan-400 font-mono"
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
                        className="px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-extrabold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare size={13} /> Avisar Ropa Lista
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-red-500/30 bg-[#0A1022]">
            <h3 className="text-lg font-bold text-white mb-4">Registrar Egreso / Gasto</h3>
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Descripción del Gasto</label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Ej. Compra de cloro, bolsa, pago de gas..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Monto en Dólares ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expenseAmountUSD}
                    onChange={(e) => setExpenseAmountUSD(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Categoría</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-400"
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
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-gray-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs"
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
