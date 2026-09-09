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
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-blue-200/80 shadow-md shadow-blue-900/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-mono uppercase text-blue-600 font-bold mb-1">
            Taller & Mantenimiento Preventivo / Correctivo
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Estado de Lavadoras y Secadoras
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoreo en tiempo real de operatividad, registro de fallas, piezas y costos de reparación.
          </p>
        </div>

        <button
          onClick={() => setIsLogModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all flex-shrink-0"
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
              className={`rounded-3xl p-6 border bg-white shadow-sm transition-all ${
                isOperational
                  ? 'border-emerald-300'
                  : isMaintenance
                  ? 'border-amber-300 bg-amber-50/30'
                  : 'border-red-300 bg-red-50/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold">{machine.capacity}</span>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    isOperational
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isMaintenance
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {isOperational ? '● Operativa' : isMaintenance ? '▲ Requiere Mantenimiento' : '✖ Fuera de Servicio'}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-1">{machine.name}</h3>
              <p className="text-xs text-slate-600 mb-4 min-h-[36px] font-medium">{machine.notes}</p>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono">Último Servicio:</span>
                <span className="font-mono text-slate-800 font-bold">{machine.lastService}</span>
              </div>

              {/* Status change actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => updateMachineStatus(machine.id, 'operational', '100% Operativa y calibrada')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    isOperational ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Operativa
                </button>
                <button
                  onClick={() => updateMachineStatus(machine.id, 'maintenance_needed', 'Mantenimiento preventivo programado')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    isMaintenance ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Taller
                </button>
                <button
                  onClick={() => updateMachineStatus(machine.id, 'out_of_service', 'Avería grave / detenida')}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-colors ${
                    isOutOfService ? 'bg-red-100 text-red-800 border-red-300' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
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
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-blue-200/80 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 mb-2">Historial de Mantenimientos & Reparaciones</h3>
        <p className="text-xs text-slate-500 mb-6">Registro detallado de piezas cambiadas, fallas y técnicos</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-500 font-mono uppercase text-[11px] bg-slate-50/50">
              <tr>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Máquina</th>
                <th className="py-3 px-3">Falla / Servicio Realizado</th>
                <th className="py-3 px-3">Técnico / Encargado</th>
                <th className="py-3 px-3">Costo ($)</th>
                <th className="py-3 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {maintenanceLogs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-3 font-mono text-slate-500">{log.date}</td>
                  <td className="py-4 px-3 font-black text-slate-900">{log.machineName}</td>
                  <td className="py-4 px-3 max-w-xs text-slate-700">{log.problem}</td>
                  <td className="py-4 px-3 text-blue-700 font-semibold">{log.technician}</td>
                  <td className="py-4 px-3 font-mono font-black text-slate-900">
                    ${log.costUSD.toFixed(2)}
                    {log.costUSD > 0 && (
                      <span className="block text-[10px] text-slate-500 font-normal">Bs. {(log.costUSD * exchangeRate).toFixed(0)}</span>
                    )}
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 border border-blue-200 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">Registrar Falla o Mantenimiento</h3>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-600 font-semibold block mb-1">Seleccionar Máquina</label>
                <select
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.capacity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-600 font-semibold block mb-1">Descripción del Problema o Pieza</label>
                <textarea
                  required
                  rows="3"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="Ej. Cambio de bomba de agua, limpieza de filtro de pelusa, fuga..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-slate-600 font-semibold block mb-1">Costo ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={costUSD}
                    onChange={(e) => setCostUSD(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-600 font-semibold block mb-1">Técnico / Taller</label>
                  <input
                    type="text"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    placeholder="Ej. Técnico José"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-600 font-semibold block mb-1">Estado de la Reparación</label>
                <select
                  value={logStatus}
                  onChange={(e) => setLogStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="resolved">✅ Trabajo Finalizado (Máquina lista)</option>
                  <option value="in_progress">⏳ En Progreso (Esperando repuesto/mano de obra)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs"
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
