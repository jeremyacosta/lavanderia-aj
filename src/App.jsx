import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import HeaderStatus from './components/client/HeaderStatus';
import BasketCalculator from './components/client/BasketCalculator';
import ComforterAndBusSection from './components/client/ComforterAndBusSection';
import PromoInfo from './components/client/PromoInfo';
import AccountingDashboard from './components/admin/AccountingDashboard';
import MachineMaintenance from './components/admin/MachineMaintenance';
import CustomerCRM from './components/admin/CustomerCRM';
import { 
  Sparkles, Layers, Calculator, Settings, Users, 
  Wrench, DollarSign, Shield, Phone, Globe, ShieldAlert 
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('client'); // 'client' | 'admin_accounting' | 'admin_machines' | 'admin_crm'
  const [adminAuth, setAdminAuth] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAdminAccess = (viewName) => {
    if (adminAuth) {
      setCurrentView(viewName);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Clave de acceso administrativa por defecto para Lavandería AJ
    if (passwordInput === 'aj2026' || passwordInput === '1234') {
      setAdminAuth(true);
      setShowAuthModal(false);
      setCurrentView('admin_accounting');
      setPasswordInput('');
    } else {
      alert('Contraseña incorrecta. (Prueba: aj2026 o 1234)');
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#080E1E] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 border-b border-cyan-500/20 bg-[#080E1E]/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Logo */}
            <div 
              onClick={() => setCurrentView('client')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
                AJ
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white block leading-none">
                  LAVANDERÍA <span className="text-cyan-400">AJ</span>
                </span>
                <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">
                  Sistema & PWA Oficial
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setCurrentView('client')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'client'
                    ? 'bg-cyan-500 text-black shadow-md font-extrabold'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                <Globe size={14} /> Portal Clientes
              </button>

              <button
                onClick={() => handleAdminAccess('admin_accounting')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView.startsWith('admin')
                    ? 'bg-blue-600 text-white shadow-md font-extrabold'
                    : 'text-gray-400 hover:text-white bg-white/5'
                }`}
              >
                <DollarSign size={14} /> Panel Administrador
              </button>
            </div>
          </div>

          {/* Sub-menu if admin is active */}
          {currentView.startsWith('admin') && (
            <div className="border-t border-white/5 bg-slate-900/60 px-4 py-2 flex justify-center gap-2 overflow-x-auto">
              <button
                onClick={() => setCurrentView('admin_accounting')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  currentView === 'admin_accounting' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
                }`}
              >
                📊 Caja & Contabilidad
              </button>
              <button
                onClick={() => setCurrentView('admin_machines')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  currentView === 'admin_machines' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
                }`}
              >
                🔧 Taller de Lavadoras/Secadoras
              </button>
              <button
                onClick={() => setCurrentView('admin_crm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  currentView === 'admin_crm' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-gray-400 hover:text-white'
                }`}
              >
                👥 Directorio de Clientes
              </button>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {currentView === 'client' && (
            <>
              {/* Header Status with opening hours */}
              <HeaderStatus />

              {/* Basket Calculator with exact prices ($7.50 / $4.50 / etc) */}
              <BasketCalculator />

              {/* Comforters & Bus Covers */}
              <ComforterAndBusSection />

              {/* Promotions, Payment Methods, Schedule, FAQ */}
              <PromoInfo />
            </>
          )}

          {currentView === 'admin_accounting' && <AccountingDashboard />}
          {currentView === 'admin_machines' && <MachineMaintenance />}
          {currentView === 'admin_crm' && <CustomerCRM />}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-[#060B18] py-8 mt-12 text-center text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-bold text-gray-400">
              LAVANDERÍA AJ · Teléfono: 0412-6701633 · Caracas, Venezuela
            </p>
            <p className="text-[11px] text-gray-600 font-mono">
              Desarrollado con arquitectura de alta velocidad por <strong className="text-cyan-400">Ingenius SA</strong> (Jeremy Acosta & Saul Araujo)
            </p>
          </div>
        </footer>

        {/* Admin Password Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl glass-panel p-6 border border-cyan-500/40 bg-[#0A1024]">
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-2">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">Acceso Administrativo</h3>
                <p className="text-xs text-gray-400">Ingresa la clave de administración de Lavandería AJ</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Contraseña (ej. aj2026)"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-center text-white focus:outline-none focus:border-cyan-400 tracking-widest text-lg font-mono"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-800 text-gray-300 font-bold text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase"
                  >
                    Ingresar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppProvider>
  );
}
