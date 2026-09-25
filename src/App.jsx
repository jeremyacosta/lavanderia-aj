import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import HeaderStatus from './components/client/HeaderStatus';
import BasketCalculator from './components/client/BasketCalculator';
import ComforterAndBusSection from './components/client/ComforterAndBusSection';
import PromoInfo from './components/client/PromoInfo';
import AccountingDashboard from './components/admin/AccountingDashboard';
import MachineMaintenance from './components/admin/MachineMaintenance';
import CustomerCRM from './components/admin/CustomerCRM';
import EmployeeWorkStation from './components/employee/EmployeeWorkStation';
import { 
  Sparkles, Layers, Calculator, Settings, Users, 
  Wrench, DollarSign, Shield, Phone, Globe, ShieldAlert,
  BookOpen
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

  // Autenticación específica para Personal LAV
  const [employeeAuth, setEmployeeAuth] = useState(false);
  const [employeePasswordInput, setEmployeePasswordInput] = useState('');
  const [showEmployeeAuthModal, setShowEmployeeAuthModal] = useState(false);
  const [employeeAuthError, setEmployeeAuthError] = useState('');

  const handleAdminAccess = (viewName) => {
    if (adminAuth) {
      setCurrentView(viewName);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleEmployeeAccess = () => {
    if (employeeAuth || adminAuth) {
      setCurrentView('employee');
    } else {
      setEmployeePasswordInput('');
      setEmployeeAuthError('');
      setShowEmployeeAuthModal(true);
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

  const handleEmployeeLogin = (e) => {
    e.preventDefault();
    const cleanPass = employeePasswordInput.trim();
    // Clave requerida por el usuario: 'lav2026' (además de llaves maestras de admin)
    if (cleanPass === 'lav2026' || cleanPass === 'aj2026' || cleanPass === '1234') {
      setEmployeeAuth(true);
      setShowEmployeeAuthModal(false);
      setCurrentView('employee');
      setEmployeePasswordInput('');
      setEmployeeAuthError('');
    } else {
      setEmployeeAuthError('Contraseña incorrecta. La clave es lav2026');
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#EEF5FB] text-slate-900 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
        
        {/* Top Slogan Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white py-2 px-3 text-center text-xs sm:text-sm font-black tracking-wide shadow-xs flex items-center justify-center gap-1.5 leading-tight">
          <Sparkles size={14} className="text-amber-300 shrink-0" />
          <span className="break-words">El mejor servicio al mejor precio es nuestra mayor prioridad</span>
          <Sparkles size={14} className="text-amber-300 shrink-0 hidden sm:inline" />
        </div>

        {/* Top Navbar */}
        <header className="sticky top-0 z-40 border-b border-blue-200/70 bg-white/95 backdrop-blur-md shadow-xs">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-20 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
            {/* Logo */}
            <div 
              onClick={() => setCurrentView('client')}
              className="flex items-center gap-2.5 cursor-pointer group w-full sm:w-auto justify-between sm:justify-start"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                  AJ
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 block leading-none">
                    LAVANDERÍA <span className="text-blue-600">AJ</span>
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-semibold">
                    Sistema & PWA Oficial
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center justify-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setCurrentView('client')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                  currentView === 'client'
                    ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                <Globe size={14} className="shrink-0" />
                <span>Portal Clientes</span>
              </button>

              <button
                onClick={handleEmployeeAccess}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                  currentView === 'employee'
                    ? 'bg-blue-600 text-white shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                <BookOpen size={14} className="shrink-0" />
                <span>Personal LAV</span>
              </button>

              <button
                onClick={() => handleAdminAccess('admin_accounting')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                  currentView.startsWith('admin')
                    ? 'bg-slate-900 text-white shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                <DollarSign size={14} className="shrink-0" />
                <span>Admin</span>
              </button>
            </nav>
          </div>

          {/* Sub-menu if admin is active */}
          {currentView.startsWith('admin') && (
            <div className="border-t border-blue-100 bg-blue-50/80 px-3 py-2 flex justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setCurrentView('admin_accounting')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  currentView === 'admin_accounting' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 Caja & Contabilidad
              </button>
              <button
                onClick={() => setCurrentView('admin_machines')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  currentView === 'admin_machines' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔧 Taller de Lavadoras/Secadoras
              </button>
              <button
                onClick={() => setCurrentView('admin_crm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                  currentView === 'admin_crm' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                👥 Directorio de Clientes
              </button>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 w-full max-w-full overflow-hidden">
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

            {currentView === 'employee' && <EmployeeWorkStation />}
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

        {/* Modal de Acceso para Personal LAV (Clave: lav2026) */}
        {showEmployeeAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 border border-blue-200 shadow-2xl animate-in fade-in zoom-in duration-150">
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 border border-blue-100">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900">Personal LAV</h3>
                <p className="text-xs text-slate-500">Ingresa la clave de acceso de personal para abrir la estación de trabajo</p>
              </div>

              <form onSubmit={handleEmployeeLogin} className="space-y-4">
                <div>
                  <input
                    type="password"
                    required
                    autoFocus
                    value={employeePasswordInput}
                    onChange={(e) => {
                      setEmployeePasswordInput(e.target.value);
                      if (employeeAuthError) setEmployeeAuthError('');
                    }}
                    placeholder="Contraseña (ej. lav2026)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-slate-900 focus:outline-none focus:border-blue-500 tracking-widest text-lg font-mono"
                  />
                  {employeeAuthError && (
                    <p className="text-rose-600 text-xs text-center font-bold mt-2">
                      {employeeAuthError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmployeeAuthModal(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase shadow-md shadow-blue-500/20"
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
