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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('[ErrorBoundary captured error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 my-4 text-center">
          <h3 className="font-black text-base text-amber-900 mb-1">Actualizando vista...</h3>
          <p className="text-xs text-slate-600 mb-3">Presiona para restaurar el estado:</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow hover:bg-blue-700 transition-colors"
          >
            Recargar Simulador
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      <div className="min-h-screen bg-[#EEF5FB] text-slate-900 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
        
        {/* Top Slogan Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white py-2 px-4 text-center text-xs sm:text-sm font-black tracking-wide shadow-xs flex items-center justify-center gap-2">
          <Sparkles size={15} className="text-amber-300 shrink-0" />
          <span>El mejor servicio al mejor precio es nuestra mayor prioridad</span>
          <Sparkles size={15} className="text-amber-300 shrink-0 hidden sm:inline" />
        </div>

        {/* Top Navbar */}
        <header className="sticky top-0 z-40 border-b border-blue-200/70 bg-white/90 backdrop-blur-md shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Logo */}
            <div 
              onClick={() => setCurrentView('client')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                AJ
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 block leading-none">
                  LAVANDERÍA <span className="text-blue-600">AJ</span>
                </span>
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-semibold">
                  Sistema & PWA Oficial
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('client')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView === 'client'
                    ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                <Globe size={14} /> Portal Clientes
              </button>

              <button
                onClick={() => handleAdminAccess('admin_accounting')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentView.startsWith('admin')
                    ? 'bg-slate-900 text-white shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                <DollarSign size={14} /> Panel Administrador
              </button>
            </div>
          </div>

          {/* Sub-menu if admin is active */}
          {currentView.startsWith('admin') && (
            <div className="border-t border-blue-100 bg-blue-50/80 px-4 py-2 flex justify-center gap-2 overflow-x-auto">
              <button
                onClick={() => setCurrentView('admin_accounting')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  currentView === 'admin_accounting' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 Caja & Contabilidad
              </button>
              <button
                onClick={() => setCurrentView('admin_machines')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  currentView === 'admin_machines' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔧 Taller de Lavadoras/Secadoras
              </button>
              <button
                onClick={() => setCurrentView('admin_crm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  currentView === 'admin_crm' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👥 Directorio de Clientes
              </button>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <ErrorBoundary>
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
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="border-t border-blue-100 bg-white py-8 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-bold text-slate-700">
              LAVANDERÍA AJ · Teléfono: 0412-6701633 · Caracas, Venezuela
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Desarrollado con arquitectura de alta velocidad por <strong className="text-blue-600">Ingenius SA</strong> (Jeremy Acosta & Saul Araujo)
            </p>
          </div>
        </footer>

        {/* Admin Password Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 border border-blue-200 shadow-2xl">
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 border border-blue-100">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900">Acceso Administrativo</h3>
                <p className="text-xs text-slate-500">Ingresa la clave de administración de Lavandería AJ</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Contraseña (ej. aj2026)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-slate-900 focus:outline-none focus:border-blue-500 tracking-widest text-lg font-mono"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase"
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
