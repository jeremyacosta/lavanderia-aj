import React, { useState, useEffect } from 'react';
import { Clock, Phone, MapPin, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function HeaderStatus() {
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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-slate-900/50 border border-cyan-500/20 p-6 sm:p-8 backdrop-blur-xl mb-8 shadow-2xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          {/* Status badge in real time */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
            style={{
              background: isOpen ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              borderColor: isOpen ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
              color: isOpen ? '#4ade80' : '#f87171'
            }}
          >
            <span className="relative flex h-2.5 w-2.5">
              {isOpen && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
            </span>
            {isOpen ? 'Abierto Ahora para Recepción y Entrega' : 'Cerrado en este momento'}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            LAVANDERÍA <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">AJ</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base mt-2 max-w-xl">
            Cuidado profesional, rapidez y pulcritud para tus prendas, edredones y forros de vehículos.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs sm:text-sm text-gray-400 font-mono">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Clock size={16} /> Lun - Sáb: 7:30 AM a 6:00 PM | Dom: 9:00 AM a 4:00 PM
            </span>
          </div>
        </div>

        {/* Quick Contact Box */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/584126701633?text=Hola%20Lavanderia%20AJ,%20quiero%20consultar%20disponibilidad%20de%20lavado"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-sm shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all transform hover:-translate-y-0.5"
          >
            <Phone size={18} className="text-black" />
            WhatsApp: 0412-6701633
          </a>
        </div>
      </div>
    </div>
  );
}
