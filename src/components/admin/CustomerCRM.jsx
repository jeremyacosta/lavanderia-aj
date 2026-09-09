import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Phone, MessageSquare, Plus, Search, Calendar, Star, Tag } from 'lucide-react';

export default function CustomerCRM() {
  const { customers, orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const openWhatsAppChat = (phone, name) => {
    const phoneDigits = phone.replace(/\D/g, '');
    const formattedPhone = phoneDigits.startsWith('0') ? `58${phoneDigits.slice(1)}` : phoneDigits.startsWith('58') ? phoneDigits : `58${phoneDigits}`;
    const msg = `¡Hola ${name}! Te saludamos desde Lavandería AJ 🧺. ¿En qué podemos ayudarte hoy?`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header and Search */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-blue-200/80 shadow-md shadow-blue-900/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-mono uppercase text-blue-600 font-bold mb-1">
            Base de Datos & Fidelización
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Directorio de Clientes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registro de visitas, historial de pedidos y acceso directo a chat de WhatsApp.
          </p>
        </div>

        <div className="w-full md:w-72 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((cust) => {
          const customerOrders = orders.filter(o => o.customerPhone === cust.phone);
          const totalSpentUSD = customerOrders.reduce((acc, o) => acc + o.totalUSD, 0);

          return (
            <div
              key={cust.id}
              className="rounded-3xl bg-white p-6 border border-blue-200/80 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                    <Star size={11} className="text-amber-500" /> {cust.visits} Visitas
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-bold">
                    ${totalSpentUSD.toFixed(2)} USD
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 mb-1">{cust.name}</h3>
                <p className="text-xs text-blue-700 font-mono mb-3 font-semibold">{cust.phone}</p>
                <p className="text-xs text-slate-600 mb-6 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  {cust.notes || 'Sin observaciones'}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center gap-2">
                <button
                  onClick={() => openWhatsAppChat(cust.phone, cust.name)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageSquare size={14} /> Abrir WhatsApp
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
