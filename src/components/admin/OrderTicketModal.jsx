import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Check, MessageSquare, DollarSign, Calendar, User, Phone, Tag, ShieldCheck, X } from 'lucide-react';

export default function OrderTicketModal({ isOpen, onClose }) {
  const { prices, exchangeRate, addOrder, customers } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [baskets, setBaskets] = useState(1);
  const [servicePackage, setServicePackage] = useState('comboFull'); // 'comboFull' | 'washWithSoap' | 'washOnly' | 'dryOnly' | 'comforterSingle' | 'comforterDouble' | 'comforterLarge' | 'busCovers'
  const [customPriceUSD, setCustomPriceUSD] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('paid'); // 'paid' | 'pending'
  const [paymentMethod, setPaymentMethod] = useState('pago_movil'); // 'usd_cash' | 'bs_cash' | 'pago_movil' | 'transfer'
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Calcular precio según paquete
  let calculatedTotal = 0;
  if (servicePackage === 'comboFull') calculatedTotal = baskets * prices.comboFull;
  else if (servicePackage === 'washWithSoap') calculatedTotal = baskets * prices.washWithSoapCombo;
  else if (servicePackage === 'washOnly') calculatedTotal = baskets * prices.washOnly;
  else if (servicePackage === 'dryOnly') calculatedTotal = baskets * prices.dryOnly;
  else if (servicePackage === 'comforterSingle') calculatedTotal = prices.comforterSingle;
  else if (servicePackage === 'comforterDouble') calculatedTotal = prices.comforterDouble;
  else if (servicePackage === 'comforterLarge') calculatedTotal = prices.comforterMatrimonialLarge;
  else if (servicePackage === 'busCovers') calculatedTotal = parseFloat(customPriceUSD) || 30.00;

  const totalUSD = calculatedTotal;
  const totalBs = totalUSD * exchangeRate;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Por favor indica nombre y teléfono del cliente');
      return;
    }

    const packageNames = {
      comboFull: `${baskets} Cesta(s) - Combo Completo ($7.50)`,
      washWithSoap: `${baskets} Cesta(s) - Lavado + Jabón ($4.50)`,
      washOnly: `${baskets} Cesta(s) - Solo Lavado ($4.00)`,
      dryOnly: `${baskets} Cesta(s) - Solo Secado ($3.00)`,
      comforterSingle: `1 Edredón Individual ($10.00)`,
      comforterDouble: `1 Edredón Doble ($12.00)`,
      comforterLarge: `1 Edredón Matrimonial Grande ($14.00)`,
      busCovers: `Forros de Autobús ($${totalUSD.toFixed(2)})`
    };

    const newOrder = addOrder({
      customerName,
      customerPhone,
      itemsSummary: packageNames[servicePackage],
      totalUSD,
      totalBs,
      paymentStatus,
      paymentMethod,
      orderStatus: 'received',
      notes
    });

    // Preguntar si desea enviar comprobante por WhatsApp
    const sendWhatsApp = window.confirm(`¡Ticket ${newOrder.id} creado con éxito!\n¿Deseas enviar el comprobante digital por WhatsApp al cliente?`);
    if (sendWhatsApp) {
      const msg = `🧾 *COMPROBANTE DE SERVICIO - LAVANDERÍA AJ*\n\n` +
        `*Ticket:* #${newOrder.id}\n` +
        `*Cliente:* ${customerName}\n` +
        `*Servicio:* ${packageNames[servicePackage]}\n` +
        `*Total:* $${totalUSD.toFixed(2)} USD (Bs. ${totalBs.toFixed(2)})\n` +
        `*Estado de Pago:* ${paymentStatus === 'paid' ? '✅ PAGADO' : '⏳ PENDIENTE POR PAGAR AL RETIRAR'}\n\n` +
        `Te avisaremos por este medio en cuanto tu ropa esté lista. ¡Gracias por tu confianza!`;
      
      const phoneDigits = customerPhone.replace(/\D/g, '');
      const formattedPhone = phoneDigits.startsWith('0') ? `58${phoneDigits.slice(1)}` : phoneDigits.startsWith('58') ? phoneDigits : `58${phoneDigits}`;
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-cyan-500/30 p-6 sm:p-8 bg-[#091024] shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-2 rounded-xl bg-white/5"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Plus size={20} />
          </span>
          <h2 className="text-xl font-bold text-white">Nuevo Ticket de Recepción</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Nombre del Cliente *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Teléfono WhatsApp *</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ej. 04141234567"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Servicio */}
          <div>
            <label className="text-xs font-mono text-gray-400 block mb-1">Tipo de Servicio</label>
            <select
              value={servicePackage}
              onChange={(e) => setServicePackage(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="comboFull">Combo Completo VIP ($7.50 / Cesta)</option>
              <option value="washWithSoap">Solo Lavado + Jabón ($4.50 / Cesta)</option>
              <option value="washOnly">Solo Lavado ($4.00 / Cesta)</option>
              <option value="dryOnly">Solo Secado ($3.00 / Cesta)</option>
              <option value="comforterSingle">Edredón Individual ($10.00)</option>
              <option value="comforterDouble">Edredón Doble ($12.00)</option>
              <option value="comforterLarge">Edredón Matrimonial Grande ($14.00)</option>
              <option value="busCovers">Forros de Autobús ($28 - $36)</option>
            </select>
          </div>

          {/* Cantidad de Cestas si aplica */}
          {['comboFull', 'washWithSoap', 'washOnly', 'dryOnly'].includes(servicePackage) && (
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Cantidad de Cestas</label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setBaskets(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      baskets === num ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-slate-900 border-white/10 text-gray-300'
                    }`}
                  >
                    {num} {num === 1 ? 'Cesta' : 'Cestas'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Precio forros si aplica */}
          {servicePackage === 'busCovers' && (
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Monto Acordado en Dólares ($)</label>
              <input
                type="number"
                step="1"
                value={customPriceUSD}
                onChange={(e) => setCustomPriceUSD(e.target.value)}
                placeholder="Ej. 30.00"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}

          {/* Estado de Pago */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Condición de Pago</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-white/10 bg-slate-900/50 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="paymentStatus"
                    checked={paymentStatus === 'paid'}
                    onChange={() => setPaymentStatus('paid')}
                    className="text-cyan-500"
                  />
                  <span>✅ Pagado Ahora</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-white/10 bg-slate-900/50 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="paymentStatus"
                    checked={paymentStatus === 'pending'}
                    onChange={() => setPaymentStatus('pending')}
                    className="text-cyan-500"
                  />
                  <span>⏳ Al Retirar</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-400 block mb-1">Método de Pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="pago_movil">Pago Móvil</option>
                <option value="usd_cash">Divisas ($ Efectivo)</option>
                <option value="bs_cash">Efectivo en Bs</option>
                <option value="transfer">Transferencia Bancaria</option>
              </select>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs font-mono text-gray-400 block mb-1">Observaciones / Detalles</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Ropa delicada, bolsa verde..."
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Resumen Final */}
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-mono text-gray-400 block">Total a Cobrar:</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">${totalUSD.toFixed(2)} USD</span>
            </div>
            <div className="text-right text-xs text-gray-300 font-mono">
              ~Bs. {totalBs.toFixed(2)}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl bg-slate-800 text-gray-300 font-bold text-xs uppercase"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider transition-all"
            >
              Crear Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
