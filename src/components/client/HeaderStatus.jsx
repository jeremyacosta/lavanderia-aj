import React, { useState, useEffect } from 'react';
import { Clock, Phone, MapPin, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function HeaderStatus() {
  const { exchangeRate, euroRate, fetchBcvRates, bcvLoading } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [currentTimeText, setCurrentTimeText] = useState('');
  const [currentDayText, setCurrentDayText] = useState('');

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const day = now.getDay(); // 0 = Domingo, 1-6 = Lunes a Sábado
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      setCurrentDayText(daysOfWeek[day]);
      setCurrentTimeText(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      if (day === 0) {
        // Domingo: 9:00 AM (540m) a 4:00 PM (960m)
        setIsOpen(totalMinutes >= 540 && totalMinutes < 960);
      } else {
        // Lunes a Sábado: 7:30 AM (450m) a 6:00 PM (1080m)
        setIsOpen(totalMinutes >= 450 && totalMinutes < 1080);
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200/80 p-4 sm:p-8 mb-6 sm:mb-8 shadow-sm w-full max-w-full">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
        <div className="w-full lg:max-w-2xl">
          {/* Status badge in real time */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border max-w-full"
            style={{
              background: isOpen ? 'rgba(220, 252, 231, 0.9)' : 'rgba(254, 226, 226, 0.9)',
              borderColor: isOpen ? '#86efac' : '#fca5a5',
              color: isOpen ? '#15803d' : '#b91c1c'
            }}
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {isOpen && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOpen ? 'bg-green-600' : 'bg-red-600'}`} />
            </span>
            <span className="truncate">{isOpen ? 'Abierto Ahora para Recepción y Entrega' : 'Cerrado en este momento'}</span>
          </div>

          {/* Slogan oficial destacado */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-900 border border-blue-200 text-xs sm:text-sm font-black mb-3 max-w-full">
            <Sparkles size={16} className="text-amber-500 shrink-0" />
            <span className="break-words">El mejor servicio al mejor precio es nuestra mayor prioridad</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight break-words">
            LAVANDERÍA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">AJ</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-base mt-2 max-w-xl font-medium">
            Cuidado profesional, rapidez y pulcritud para tus prendas, edredones y forros de vehículos.
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs sm:text-sm text-slate-700">
            <span className="flex items-center gap-1.5 text-blue-800 font-semibold bg-white/80 px-2.5 py-1 rounded-lg border border-blue-200 text-xs">
              <Clock size={14} className="text-blue-600 shrink-0" /> Lun - Sáb: 7:30 AM a 6:00 PM
            </span>
            <span className="flex items-center gap-1.5 text-blue-800 font-semibold bg-white/80 px-2.5 py-1 rounded-lg border border-blue-200 text-xs">
              <Clock size={14} className="text-blue-600 shrink-0" /> Dom: 9:00 AM a 4:00 PM
            </span>
          </div>

          {/* Tasa Oficial BCV en Vivo (Dólar y Euro) */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="inline-flex flex-wrap items-center gap-2 bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white px-3.5 py-1.5 rounded-xl shadow-xs border border-blue-800/80 text-xs">
              <div className="flex items-center gap-1.5 text-cyan-300 font-extrabold text-[11px] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tasa Oficial BCV:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono font-bold text-xs">
                <span>
                  💵 $ 1 = <strong className="text-emerald-300 font-black">Bs. {exchangeRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </span>
                <span className="text-blue-400/60 hidden sm:inline">•</span>
                <span>
                  💶 € 1 = <strong className="text-cyan-300 font-black">Bs. {euroRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => fetchBcvRates()}
                title="Actualizar tasa oficial BCV ahora"
                disabled={bcvLoading}
                className="p-1 rounded-md text-cyan-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw size={12} className={bcvLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Contact Box */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/584126701633?text=Hola%20Lavanderia%20AJ,%20quiero%20consultar%20disponibilidad%20de%20lavado"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md shadow-emerald-700/20 transition-all transform hover:-translate-y-0.5 text-center"
          >
            <Phone size={18} className="shrink-0" />
            <span>WhatsApp: 0412-6701633</span>
          </a>
        </div>
      </div>
    </div>
  );
}
