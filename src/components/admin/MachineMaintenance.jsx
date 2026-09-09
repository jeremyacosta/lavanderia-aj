import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Wrench, AlertTriangle, CheckCircle, Plus, Calendar, Activity, X } from 'lucide-react';

export default function MachineMaintenance() {
  const { machines, maintenanceLogs, updateMachineStatus, addMaintenanceLog, exchangeRate } = useApp();

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState(machines[0]?.id || '');
  const [problem, setProblem] = useState('');
  const [technician, setTechnician] = useState('');
  const [costUSD, setCostUSD] = useState('');
  const [logStatus, setLogStatus] = useState('in_progress'); // 'in_progress' | 'resolved'

  const handleCreateLog = (e) => {
    e.preventDefault();
    if (!problem) return;

    const machineObj = machines.find(m => m.id === selectedMachineId);

    addMaintenanceLog({
      machineId: selectedMachineId,
      machineName: machineObj ? machineObj.name : 'Maquinaria',
      problem,
      technician: technician || 'Taller Interno',
      costUSD: parseFloat(costUSD) || 0.00,
      status: logStatus
    });

    // Actualizar estado de la máquina
    if (logStatus === 'resolved') {
      updateMachineStatus(selectedMachineId, 'operational', `Reparado: ${problem}`);
    } else {
      updateMachineStatus(selectedMachineId, 'maintenance_needed', `En revisión: ${problem}`);
    }

    setProblem('');
    setTechnician('');
    setCostUSD('');
    setIsLogModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header and Quick Stats */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-mono uppercase text-cyan-400 font-bold mb-1">
            Taller & Mantenimiento Preventivo / Correctivo
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Estado de Lavadoras y Secadoras
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Monitoreo en tiempo real de operatividad, registro de fallas, piezas y costos de reparación.
          </p>
        </div>

        <button
          onClick={() => setIsLogModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex-shrink-0"
        >
          <Plus size={16} /> Reportar Reparación / Falla
        </button>
      </div>

      {/* Machine Status Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {machines.map((machine) => {
          const isOperational = machine.status === 'operational';
          const isMaintenance = machine.status === 'maintenance_needed';
          const isOutOfService = machine.status === 'out_of_service';

          return (
            <div
              key={machine.id}
              className={`rounded-3xl p-6 border glass-panel transition-all ${
                isOperational
                  ? 'border-green-500/30'
                  : isMaintenance
                  ? 'border-amber-500/40 bg-amber-950/10'
                  : 'border-red-500/50 bg-red-950/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase text-gray-400">{machine.capacity}</span>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    isOperational
                      ? 'bg-green-500/10 text-green-400 border-green-500/30'
                      : isMaintenance
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}
                >
                  {isOperational ? '● Operativa' : isMaintenance ? '▲ Requiere Mantenimiento' : '✖ Fuera de Servicio'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{machine.name}</h3>
              <p className="text-xs text-gray-400 mb-4 min-h-[36px]">{machine.notes}</p>

              <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-mono">Último Servicio:</span>
                <span className="font-mono text-gray-300 font-bold">{machine.lastService}</span>
              </div>

              {/* Status change actions */}
              <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                <button
                  onClick={() => updateMachineStatus(machine.id, 'operational', '100% Operativa y calibrada')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    isOperational ? 'bg-green-500/20 text-green-300 border-green-500/40' : 'bg-slate-900 border-white/10 text-gray-400'
                  }`}
                >
                  Operativa
                </button>
                <button
                  onClick={() => updateMachineStatus(machine.id, 'maintenance_needed', 'Mantenimiento preventivo programado')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    isMaintenance ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-900 border-white/10 text-gray-400'
                  }`}
                >
                  Revisar
                </button>
                <button
                  onClick={() => updateMachineStatus(machine.id, 'out_of_service', 'Equipo apagado por reparación')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    isOutOfService ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-slate-900 border-white/10 text-gray-400'
                  }`}
                >
                  Parada
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Maintenance Logs History Table */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-2">Historial de Mantenimientos & Reparaciones</h3>
        <p className="text-xs text-gray-400 mb-6">Registro detallado de piezas cambiadas, fallas y técnicos</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-gray-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Máquina</th>
                <th className="py-3 px-3">Falla / Servicio Realizado</th>
                <th className="py-3 px-3">Técnico / Encargado</th>
                <th className="py-3 px-3">Costo ($)</th>
                <th className="py-3 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {maintenanceLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02]">
                  <td className="py-4 px-3 font-mono text-gray-400">{log.date}</td>
                  <td className="py-4 px-3 font-bold text-white">{log.machineName}</td>
                  <td className="py-4 px-3 max-w-xs">{log.problem}</td>
                  <td className="py-4 px-3 text-cyan-300">{log.technician}</td>
                  <td className="py-4 px-3 font-mono font-bold text-white">
                    ${log.costUSD.toFixed(2)}
                    {log.costUSD > 0 && (
                      <span className="block text-[10px] text-gray-400">Bs. {(log.costUSD * exchangeRate).toFixed(0)}</span>
                    )}
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.status === 'resolved'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {log.status === 'resolved' ? 'Resuelto' : 'En Progreso'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Reportar Mantenimiento */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-cyan-500/30 bg-[#091024]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Registrar Falla o Mantenimiento</h3>
              <button onClick={() => setIsLogModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Seleccionar Máquina</label>
                <select
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.capacity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Descripción del Problema o Pieza Cambiada</label>
                <textarea
                  required
                  rows="3"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Ej. Cambio de bomba de agua, limpieza de filtro de pelusa, fuga..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Costo Repuesto / Técnico ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={costUSD}
                    onChange={(e) => setCostUSD(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">Técnico / Taller</label>
                  <input
                    type="text"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    placeholder="Ej. Técnico José"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">Estado de la Reparación</label>
                <select
                  value={logStatus}
                  onChange={(e) => setLogStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="resolved">✅ Trabajo Finalizado (Máquina lista)</option>
                  <option value="in_progress">⏳ En Progreso (Esperando repuesto/mano de obra)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-gray-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs"
                >
                  Guardar en Taller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
