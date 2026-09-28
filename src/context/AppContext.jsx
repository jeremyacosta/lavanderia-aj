import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initFirebase, 
  getFirebaseConfig, 
  syncDocToCloud, 
  deleteDocFromCloud, 
  subscribeToCollection 
} from '../services/firebase';

const AppContext = createContext();

export const INITIAL_PRICES = {
  washOnly: 4.00,
  dryOnly: 3.00,
  soap: 0.50,
  softener: 0.70,
  bleach: 0.50,            // Cloro por cesta
  degreaser: 0.50,         // Desengrasante por cesta
  bleachDegreaser: 0.50,   // Compatibilidad
  labor: 0.20,
  comboFull: 7.50,         // Lavado + Secado + Jabón + Suavizante + Mano de Obra
  washWithSoapCombo: 4.50, // Solo Lavado + Jabón + Mano de Obra
  comforterSingle: 10.00,
  comforterDouble: 12.00,
  comforterMatrimonialLarge: 14.00,
  busSeatCoversMin: 28.00,
  busSeatCoversMax: 36.00,
};

const DEFAULT_MACHINES = [
  { id: 'lav-1', name: 'Lavadora Industrial #1', type: 'washer', capacity: '15 kg', status: 'operational', lastService: '2026-09-01', notes: 'Funcionando al 100%' },
  { id: 'lav-2', name: 'Lavadora Automática #2', type: 'washer', capacity: '10 kg', status: 'operational', lastService: '2026-08-20', notes: 'Filtro limpio' },
  { id: 'lav-3', name: 'Lavadora Automática #3', type: 'washer', capacity: '10 kg', status: 'maintenance_needed', lastService: '2026-07-15', notes: 'Revisar manguera de desagüe' },
  { id: 'sec-1', name: 'Secadora a Gas #1', type: 'dryer', capacity: '15 kg', status: 'operational', lastService: '2026-09-03', notes: 'Filtro de pelusa limpio' },
  { id: 'sec-2', name: 'Secadora a Gas #2', type: 'dryer', capacity: '15 kg', status: 'operational', lastService: '2026-08-28', notes: 'Excelente temperatura' },
  { id: 'sec-3', name: 'Secadora Eléctrica #3', type: 'dryer', capacity: '10 kg', status: 'out_of_service', lastService: '2026-08-10', notes: 'Esperando termostato' },
];

// Función para asegurar que las cantidades de servicios correspondan fielmente a las cestas
export function normalizeRecordServices(r) {
  if (!r) return r;
  let wash = Number(r.washCount);
  let dry = Number(r.dryCount);
  let soap = Number(r.soapCount);
  let labor = Number(r.laborCount);
  let softener = Number(r.softenerCount);
  let bleach = Number(r.bleachCount) || 0;
  let degreaser = Number(r.degreaserCount) || 0;

  const textToScan = `${r.notes || ''} ${r.customerName || ''}`.toLowerCase();
  
  // Buscar si especifica cestas en el texto ("2 cestas", "3 cestas", "2 cesta", etc.)
  const basketMatch = textToScan.match(/(\d+)\s*cesta/);
  let detectedBaskets = basketMatch ? parseInt(basketMatch[1], 10) : 0;

  // Si no hay mención en texto pero el totalUSD coincide con múltiplos de combos ($7.50 c/u)
  if (!detectedBaskets && r.totalUSD) {
    const num = Number(r.totalUSD);
    if (Math.abs(num - 15.00) < 0.35) detectedBaskets = 2;
    else if (Math.abs(num - 22.50) < 0.35) detectedBaskets = 3;
    else if (Math.abs(num - 30.00) < 0.35) detectedBaskets = 4;
    else if (Math.abs(num - 37.50) < 0.35) detectedBaskets = 5;
  }

  // Si se detectaron 2 o más cestas pero en las otras columnas marca 1 (por defecto anterior)
  if (detectedBaskets > 1) {
    if (isNaN(wash) || wash <= 1) wash = detectedBaskets;
    if (isNaN(dry) || dry <= 1) dry = detectedBaskets;
    if (isNaN(soap) || soap <= 1) soap = detectedBaskets;
    if (isNaN(labor) || labor <= 1) labor = detectedBaskets;
    if (isNaN(softener) || softener <= 1) softener = detectedBaskets;
  }

  // Si washCount > 1 pero las otras columnas de combo quedaron en 1
  if (wash > 1) {
    if (isNaN(dry) || dry === 1) dry = wash;
    if (isNaN(soap) || soap === 1) soap = wash;
    if (isNaN(labor) || labor === 1) labor = wash;
    if (isNaN(softener) || softener === 1) softener = wash;
  }

  return {
    ...r,
    washCount: isNaN(wash) ? 1 : wash,
    dryCount: isNaN(dry) ? (isNaN(wash) ? 1 : wash) : dry,
    soapCount: isNaN(soap) ? (isNaN(wash) ? 1 : wash) : soap,
    laborCount: isNaN(labor) ? (isNaN(wash) ? 1 : wash) : labor,
    softenerCount: isNaN(softener) ? (isNaN(wash) ? 1 : wash) : softener,
    bleachCount: bleach,
    degreaserCount: degreaser
  };
}

export function AppProvider({ children }) {
  // Estado de sincronización en la Nube (Firebase)
  const [isCloudConnected, setIsCloudConnected] = useState(() => !!getFirebaseConfig());

  // Configuración general de tasas (USD y EUR oficiales del BCV)
  const [exchangeRate, setExchangeRate] = useState(() => {
    const saved = localStorage.getItem('aj_exchange_rate');
    return saved ? parseFloat(saved) : 855.66; // Tasa oficial BCV USD
  });

  const [euroRate, setEuroRate] = useState(() => {
    const saved = localStorage.getItem('aj_euro_rate');
    return saved ? parseFloat(saved) : 972.65; // Tasa oficial BCV EUR
  });

  const [bcvLastUpdated, setBcvLastUpdated] = useState(() => {
    return localStorage.getItem('aj_bcv_last_updated') || new Date().toLocaleDateString('es-VE');
  });

  const [bcvLoading, setBcvLoading] = useState(false);

  // Función para consultar las tasas oficiales del Banco Central de Venezuela en vivo
  const fetchBcvRates = async () => {
    setBcvLoading(true);
    try {
      // Consultar APIs oficiales de Venezuela
      const [resUsd, resEur] = await Promise.allSettled([
        fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
        fetch('https://ve.dolarapi.com/v1/euros/oficial')
      ]);

      let usdRate = null;
      let eurRate = null;
      let updateDate = null;

      if (resUsd.status === 'fulfilled' && resUsd.value.ok) {
        const dataUsd = await resUsd.value.json();
        if (dataUsd && typeof dataUsd.promedio === 'number' && dataUsd.promedio > 0) {
          usdRate = dataUsd.promedio;
          updateDate = dataUsd.fechaActualizacion;
        }
      }

      if (resEur.status === 'fulfilled' && resEur.value.ok) {
        const dataEur = await resEur.value.json();
        if (dataEur && typeof dataEur.promedio === 'number' && dataEur.promedio > 0) {
          eurRate = dataEur.promedio;
        }
      }

      // Fallback si la primera API no respondió
      if (!usdRate) {
        const fallbackRes = await fetch('https://open.er-api.com/v6/latest/USD');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (fallbackData?.rates?.VES) {
            usdRate = fallbackData.rates.VES;
            if (fallbackData?.rates?.EUR) {
              eurRate = usdRate / fallbackData.rates.EUR;
            }
          }
        }
      }

      if (usdRate) {
        setExchangeRate(usdRate);
        localStorage.setItem('aj_exchange_rate', usdRate.toString());
      }
      if (eurRate) {
        setEuroRate(eurRate);
        localStorage.setItem('aj_euro_rate', eurRate.toString());
      }

      const formattedDate = updateDate 
        ? new Date(updateDate).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : new Date().toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      setBcvLastUpdated(formattedDate);
      localStorage.setItem('aj_bcv_last_updated', formattedDate);
      return { success: true, usd: usdRate, eur: eurRate };
    } catch (err) {
      console.warn('[BCV Sync] Error al obtener tasa automática:', err);
      return { success: false, error: err };
    } finally {
      setBcvLoading(false);
    }
  };

  // Actualización automática al abrir la aplicación y cada 30 minutos
  useEffect(() => {
    fetchBcvRates();
    const interval = setInterval(fetchBcvRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Clientes
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('aj_customers');
    return saved ? JSON.parse(saved) : [
      { id: 'c1', name: 'Carlos Rodríguez', phone: '04141234567', visits: 4, notes: 'Cliente frecuente, prefiere poco suavizante' },
      { id: 'c2', name: 'María Fernández', phone: '04247654321', visits: 2, notes: 'Trae edredones dobles' },
      { id: 'c3', name: 'Línea de Transporte Unión', phone: '04129988776', visits: 5, notes: 'Forros de autobús completos' }
    ];
  });

  // Órdenes / Tickets de Servicio
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('aj_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'AJ-101',
        customerName: 'Carlos Rodríguez',
        customerPhone: '04141234567',
        date: new Date().toISOString().split('T')[0],
        time: '08:30 AM',
        itemsSummary: '2 Cestas (Combo Completo $7.50)',
        totalUSD: 15.00,
        totalBs: 607.50,
        paymentStatus: 'paid', // 'paid' | 'pending'
        paymentMethod: 'pago_movil', // 'usd_cash' | 'bs_cash' | 'pago_movil' | 'transfer'
        orderStatus: 'ready', // 'received' | 'washing' | 'drying' | 'ready' | 'delivered'
        notes: 'Listo en mostrador'
      },
      {
        id: 'AJ-102',
        customerName: 'María Fernández',
        customerPhone: '04247654321',
        date: new Date().toISOString().split('T')[0],
        time: '10:15 AM',
        itemsSummary: '1 Edredón Doble ($12.00)',
        totalUSD: 12.00,
        totalBs: 486.00,
        paymentStatus: 'pending',
        paymentMethod: 'usd_cash',
        orderStatus: 'washing',
        notes: 'Paga al retirar'
      }
    ];
  });

  // Gastos Operativos
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('aj_expenses');
    return saved ? JSON.parse(saved) : [
      { id: 'e1', date: new Date().toISOString().split('T')[0], category: 'supplies', description: 'Cuñete de Jabón Líquido Industrial', amountUSD: 25.00, amountBs: 1012.50 },
      { id: 'e2', date: new Date().toISOString().split('T')[0], category: 'supplies', description: 'Galón de Suavizante Floral', amountUSD: 12.00, amountBs: 486.00 },
      { id: 'e3', date: new Date().toISOString().split('T')[0], category: 'maintenance', description: 'Repuesto correa para Lavadora #3', amountUSD: 8.00, amountBs: 324.00 }
    ];
  });

  // Maquinaria & Taller de Reparaciones
  const [machines, setMachines] = useState(() => {
    const saved = localStorage.getItem('aj_machines');
    return saved ? JSON.parse(saved) : DEFAULT_MACHINES;
  });

  // Historial de Mantenimientos
  const [maintenanceLogs, setMaintenanceLogs] = useState(() => {
    const saved = localStorage.getItem('aj_maintenance_logs');
    return saved ? JSON.parse(saved) : [
      { id: 'm1', machineId: 'lav-3', machineName: 'Lavadora Automática #3', date: '2026-09-02', problem: 'Desgaste en correa de tracción', technician: 'Técnico José', costUSD: 8.00, status: 'in_progress' },
      { id: 'm2', machineId: 'sec-1', machineName: 'Secadora a Gas #1', date: '2026-09-03', problem: 'Limpieza profunda de conductos de gas y pelusa', technician: 'Mantenimiento Interno', costUSD: 0.00, status: 'resolved' }
    ];
  });

  // Persistir en LocalStorage
  useEffect(() => {
    localStorage.setItem('aj_exchange_rate', exchangeRate.toString());
  }, [exchangeRate]);

  useEffect(() => {
    localStorage.setItem('aj_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('aj_orders', JSON.stringify(orders));
  }, [orders]);


  // Cuaderno Diario de Operaciones (Registros de clientes cargados por empleada/administrador)
  const [dailyRecords, setDailyRecords] = useState(() => {
    const saved = localStorage.getItem('aj_daily_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeRecordServices);
        }
      } catch (e) {
        console.warn('Error al parsear aj_daily_records:', e);
      }
    }
    return [
      {
        id: 'rec_101',
        date: '2026-09-07',
        time: '08:43 AM',
        customerName: 'Jenny',
        customerPhone: '04126701633',
        washCount: 1,
        dryCount: 1,
        soapCount: 1,
        laborCount: 1,
        softenerCount: 1,
        bleachCount: 1,
        degreaserCount: 1,
        totalUSD: 34.00,
        totalBs: 2670.00,
        amountPaidUSD: 34.00,
        amountPaidBs: 2670.00,
        debtUSD: 0,
        paymentStatus: 'paid', // 'paid' | 'partial' | 'pending'
        paymentMethod: 'pago_movil',
        bankReference: 'RF 7423',
        deliveryStatus: 'delivered', // 'in_store' | 'delivered'
        deliveredDate: '2026-09-08',
        notes: 'Pagó completo y retiró 08/09'
      },
      {
        id: 'rec_102',
        date: '2026-09-07',
        time: '10:05 AM',
        customerName: 'Albert',
        customerPhone: '04140001122',
        washCount: 2,
        dryCount: 2,
        soapCount: 2,
        laborCount: 2,
        softenerCount: 2,
        bleachCount: 0,
        degreaserCount: 0,
        totalUSD: 15.00,
        totalBs: 607.50,
        amountPaidUSD: 13.35,
        amountPaidBs: 540.00,
        debtUSD: 1.65,
        paymentStatus: 'partial',
        paymentMethod: 'pago_movil',
        bankReference: 'RF 13358',
        deliveryStatus: 'in_store',
        notes: 'Abono 12.400 Bs (13.35$). Restan 1.65$'
      },
      {
        id: 'rec_103',
        date: '2026-09-07',
        time: '12:18 PM',
        customerName: 'Abuela',
        customerPhone: '04245558899',
        washCount: 5,
        dryCount: 5,
        soapCount: 5,
        laborCount: 5,
        softenerCount: 5,
        bleachCount: 0,
        degreaserCount: 0,
        totalUSD: 37.50,
        totalBs: 1518.75,
        amountPaidUSD: 9.00,
        amountPaidBs: 364.50,
        debtUSD: 28.50,
        paymentStatus: 'partial',
        paymentMethod: 'bs_cash',
        bankReference: 'RF 4708',
        deliveryStatus: 'in_store',
        notes: 'Abono 19.000 Bs + 9$ en efectivo. Jeremy 4000 Bs'
      },
      {
        id: 'rec_104',
        date: '2026-09-07',
        time: '01:28 PM',
        customerName: 'Alonzo',
        customerPhone: '04169994433',
        washCount: 2,
        dryCount: 2,
        soapCount: 2,
        laborCount: 2,
        softenerCount: 2,
        bleachCount: 0,
        degreaserCount: 0,
        totalUSD: 15.00,
        totalBs: 607.50,
        amountPaidUSD: 15.00,
        amountPaidBs: 607.50,
        debtUSD: 0,
        paymentStatus: 'paid',
        paymentMethod: 'usd_cash',
        bankReference: 'Efectivo en mano',
        deliveryStatus: 'delivered',
        deliveredDate: '2026-09-08',
        notes: 'Pagó al retirar el 08/09'
      },
      {
        id: 'rec_105',
        date: '2026-09-07',
        time: '03:40 PM',
        customerName: 'Enrique V.',
        customerPhone: '04123332211',
        washCount: 2,
        dryCount: 2,
        soapCount: 2,
        laborCount: 2,
        softenerCount: 0,
        bleachCount: 0,
        degreaserCount: 0,
        totalUSD: 12.20,
        totalBs: 494.10,
        amountPaidUSD: 0,
        amountPaidBs: 0,
        debtUSD: 12.20,
        paymentStatus: 'pending',
        paymentMethod: 'por_definir',
        bankReference: 'Pendiente',
        deliveryStatus: 'in_store',
        notes: 'Debe 12.20$ completo. Ropa dejada en depósito.'
      },
      {
        id: 'rec_106',
        date: '2026-09-07',
        time: '04:15 PM',
        customerName: 'Javier',
        customerPhone: '04147778899',
        washCount: 3,
        dryCount: 3,
        soapCount: 3,
        laborCount: 3,
        softenerCount: 3,
        bleachCount: 0,
        degreaserCount: 0,
        totalUSD: 24.00,
        totalBs: 972.00,
        amountPaidUSD: 24.00,
        amountPaidBs: 972.00,
        debtUSD: 0,
        paymentStatus: 'paid',
        paymentMethod: 'pago_movil',
        bankReference: 'RF 4432',
        deliveryStatus: 'in_store',
        notes: 'Pagado el 07/09 con RF 4432. Por retirar'
      }
    ];
  });

  // Registro de Apertura de Detergentes (Jabón nuevo, suavizante nuevo, etc.)
  const [detergentLogs, setDetergentLogs] = useState(() => {
    const saved = localStorage.getItem('aj_detergent_logs');
    return saved ? JSON.parse(saved) : [
      { id: 'det_1', date: '2026-09-07', time: '12:18 PM', item: 'Jabón', notes: 'Abierto en turno orden #rec_103 (Abuela)', employee: 'Encargada' },
      { id: 'det_2', date: '2026-09-08', time: '09:30 AM', item: 'Suavizante', notes: 'Nuevo galón de suavizante floral', employee: 'Encargada' }
    ];
  });

  // Historial de Cierres Diarios de Caja
  const [dailyClosures, setDailyClosures] = useState(() => {
    const saved = localStorage.getItem('aj_daily_closures');
    return saved ? JSON.parse(saved) : [
      {
        id: 'close_0709',
        date: '2026-09-07',
        closedAt: '2026-09-07 06:15 PM',
        cobradoBs: 41920.00,
        cobradoUSD: 47.60,
        pagoMovilBs: 13800.00,
        pagoMovilUSD: 15.60,
        efectivoBs: 25100.00,
        efectivoUSD: 28.50,
        divisasEfectivoUSD: 3.50,
        fondoInicialBs: 860.00,
        dineroEntregadoBs: 850.00,
        dineroEntregadoUSD: 20.00,
        notes: 'Cierre del 07/09 según cuaderno físico',
        closedBy: 'Encargada'
      }
    ];
  });

  // Registro Inmutable de Auditoría (Borrados y anulaciones con motivo y contraseña)
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('aj_audit_logs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'aud_sample_1',
        timestamp: '2026-09-06 05:40 PM',
        action: 'REGISTRO_INICIAL',
        entityType: 'SISTEMA',
        entityId: 'SYS',
        reason: 'Activación del Módulo de Auditoría y Trazabilidad',
        performedBy: 'Administrador (Jeremy / Saul)',
        details: 'Protección de borrados habilitada con clave maestra.'
      }
    ];
  });

  // Persistir en LocalStorage
  useEffect(() => {
    localStorage.setItem('aj_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('aj_machines', JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem('aj_maintenance_logs', JSON.stringify(maintenanceLogs));
  }, [maintenanceLogs]);

  useEffect(() => {
    localStorage.setItem('aj_daily_records', JSON.stringify(dailyRecords));
  }, [dailyRecords]);

  useEffect(() => {
    localStorage.setItem('aj_detergent_logs', JSON.stringify(detergentLogs));
  }, [detergentLogs]);

  useEffect(() => {
    localStorage.setItem('aj_daily_closures', JSON.stringify(dailyClosures));
  }, [dailyClosures]);

  useEffect(() => {
    localStorage.setItem('aj_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Suscripciones en tiempo real a la nube
  useEffect(() => {
    const config = getFirebaseConfig();
    if (!config) {
      setIsCloudConnected(false);
      return;
    }

    const { isConfigured } = initFirebase();
    setIsCloudConnected(isConfigured);

    if (isConfigured) {
      // 1. Sincronización en vivo del Cuaderno Diario
      const unsubDaily = subscribeToCollection('daily_records', (cloudRecords) => {
        if (cloudRecords && Array.isArray(cloudRecords) && cloudRecords.length > 0) {
          setDailyRecords(prev => {
            const currentList = Array.isArray(prev) ? prev.filter(r => r && r.id) : [];
            const map = new Map(currentList.map(r => [String(r.id), r]));
            cloudRecords.filter(cr => cr && cr.id).forEach(cr => {
              const norm = normalizeRecordServices(cr);
              map.set(String(norm.id), {
                ...norm,
                totalUSD: Number(norm.totalUSD) || 0,
                totalBs: Number(norm.totalBs) || 0,
                amountPaidUSD: Number(norm.amountPaidUSD) || 0,
                amountPaidBs: Number(norm.amountPaidBs) || 0,
                debtUSD: Number(norm.debtUSD) || 0,
                customerName: norm.customerName || 'Cliente sin nombre',
                paymentStatus: norm.paymentStatus || 'pending',
                deliveryStatus: norm.deliveryStatus || 'in_store'
              });
            });
            const merged = Array.from(map.values()).sort((a, b) => {
              const dateA = String(a.date || '') + ' ' + String(a.time || '');
              const dateB = String(b.date || '') + ' ' + String(b.time || '');
              return dateB.localeCompare(dateA);
            });
            return merged;
          });
        }
      });

      // 2. Sincronización en vivo de Cierres Diarios
      const unsubClosures = subscribeToCollection('daily_closures', (cloudClosures) => {
        if (cloudClosures && Array.isArray(cloudClosures) && cloudClosures.length > 0) {
          setDailyClosures(prev => {
            const currentList = Array.isArray(prev) ? prev.filter(c => c && c.date) : [];
            const map = new Map(currentList.map(c => [String(c.date), c]));
            cloudClosures.filter(cc => cc && cc.date).forEach(cc => map.set(String(cc.date), cc));
            return Array.from(map.values()).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
          });
        }
      });

      // 3. Sincronización de Insumos / Detergentes
      const unsubDetergents = subscribeToCollection('detergent_logs', (cloudLogs) => {
        if (cloudLogs && cloudLogs.length > 0) {
          setDetergentLogs(prev => {
            const currentList = Array.isArray(prev) ? prev : [];
            const map = new Map(currentList.map(d => [d.id, d]));
            cloudLogs.forEach(cd => map.set(cd.id, cd));
            return Array.from(map.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          });
        }
      });

      // 4. Sincronización de Gastos
      const unsubExpenses = subscribeToCollection('expenses', (cloudExp) => {
        if (cloudExp && cloudExp.length > 0) {
          setExpenses(prev => {
            const currentList = Array.isArray(prev) ? prev : [];
            const map = new Map(currentList.map(e => [e.id, e]));
            cloudExp.forEach(ce => map.set(ce.id, ce));
            return Array.from(map.values()).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          });
        }
      });

      return () => {
        unsubDaily();
        unsubClosures();
        unsubDetergents();
        unsubExpenses();
      };
    }
  }, [isCloudConnected]);

  // Funciones de gestión
  const addOrder = (newOrder) => {
    const nextId = `AJ-${100 + orders.length + 1}`;
    const orderWithId = {
      ...newOrder,
      id: nextId,
      date: newOrder.date || new Date().toISOString().split('T')[0],
      time: newOrder.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setOrders([orderWithId, ...orders]);

    // Actualizar o crear cliente
    const existingIndex = customers.findIndex(c => c.phone.trim() === newOrder.customerPhone.trim());
    if (existingIndex >= 0) {
      const updated = [...customers];
      updated[existingIndex].visits = (updated[existingIndex].visits || 1) + 1;
      setCustomers(updated);
    } else if (newOrder.customerName) {
      setCustomers([...customers, {
        id: `c_${Date.now()}`,
        name: newOrder.customerName,
        phone: newOrder.customerPhone,
        visits: 1,
        notes: 'Cliente registrado vía ticket'
      }]);
    }

    return orderWithId;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    // Sincronizar también en el cuaderno diario si corresponde
    const recId = orderId.startsWith('AJ-') ? `rec_${orderId.slice(3)}` : orderId;
    const isDelivered = newStatus === 'delivered';
    setDailyRecords(prev => prev.map(r => (r.id === orderId || r.id === recId) ? {
      ...r,
      deliveryStatus: isDelivered ? 'delivered' : r.deliveryStatus,
      deliveredDate: isDelivered ? new Date().toISOString().split('T')[0] : r.deliveredDate
    } : r));
  };

  const updatePaymentStatus = (orderId, newPaymentStatus, method) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { 
      ...o, 
      paymentStatus: newPaymentStatus,
      paymentMethod: method || o.paymentMethod 
    } : o));
    // Sincronizar también en el cuaderno diario si corresponde
    const recId = orderId.startsWith('AJ-') ? `rec_${orderId.slice(3)}` : orderId;
    setDailyRecords(prev => prev.map(r => (r.id === orderId || r.id === recId) ? {
      ...r,
      paymentStatus: newPaymentStatus,
      paymentMethod: method || r.paymentMethod,
      debtUSD: newPaymentStatus === 'paid' ? 0 : r.debtUSD,
      amountPaidUSD: newPaymentStatus === 'paid' ? r.totalUSD : r.amountPaidUSD
    } : r));
  };

  const addExpense = (expense) => {
    const newExp = {
      ...expense,
      id: `e_${Date.now()}`,
      date: expense.date || new Date().toISOString().split('T')[0]
    };
    setExpenses([newExp, ...expenses]);
  };

  const addMaintenanceLog = (log) => {
    const newLog = {
      ...log,
      id: `m_${Date.now()}`,
      date: log.date || new Date().toISOString().split('T')[0]
    };
    setMaintenanceLogs([newLog, ...maintenanceLogs]);

    // Si tiene costo, registrar automáticamente como gasto
    if (parseFloat(log.costUSD) > 0) {
      addExpense({
        category: 'maintenance',
        description: `Reparación: ${log.machineName} - ${log.problem}`,
        amountUSD: parseFloat(log.costUSD),
        amountBs: parseFloat(log.costUSD) * exchangeRate,
        date: log.date
      });
    }
  };

  const updateMachineStatus = (machineId, status, notes) => {
    setMachines(machines.map(m => m.id === machineId ? { 
      ...m, 
      status, 
      notes: notes !== undefined ? notes : m.notes,
      lastService: new Date().toISOString().split('T')[0]
    } : m));
  };

  // --- MÉTODOS DEL CUADERNO DIARIO Y PANEL DE EMPLEADA ---
  const addDailyRecord = (newRecord) => {
    const nextId = `rec_${Date.now()}`;
    const recDate = newRecord.date || new Date().toISOString().split('T')[0];
    const isPaid = newRecord.paymentStatus === 'paid';
    const isDelivered = newRecord.deliveryStatus === 'delivered';
    const record = normalizeRecordServices({
      ...newRecord,
      id: nextId,
      date: recDate,
      time: newRecord.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentDate: isPaid ? (newRecord.paymentDate || recDate) : null,
      deliveryStatus: newRecord.deliveryStatus || 'in_store'
    });
    setDailyRecords(prev => [record, ...prev]);

    // Sincronizar automáticamente en la colección de Órdenes para que aparezca en Administración y Contabilidad
    const orderFormat = {
      id: `AJ-${nextId.slice(4)}`,
      originalId: nextId,
      customerName: record.customerName,
      customerPhone: record.customerPhone || 'En mostrador',
      date: record.date,
      time: record.time,
      itemsSummary: record.notes || `${record.washCount} Cesta(s) (${record.washCount} lav, ${record.dryCount} sec)`,
      totalUSD: record.totalUSD || 0,
      totalBs: record.totalBs || 0,
      amountPaidUSD: record.amountPaidUSD !== undefined ? record.amountPaidUSD : (isPaid ? record.totalUSD : 0),
      amountPaidBs: record.amountPaidBs !== undefined ? record.amountPaidBs : (isPaid ? record.totalBs : 0),
      debtUSD: record.debtUSD !== undefined ? record.debtUSD : (isPaid ? 0 : record.totalUSD),
      paymentStatus: record.paymentStatus || 'pending',
      paymentMethod: record.paymentMethod || 'pago_movil',
      paymentDate: record.paymentDate,
      orderStatus: isDelivered ? 'delivered' : 'ready',
      deliveryStatus: record.deliveryStatus || 'in_store',
      origin: record.origin || 'walk_in',
      bankReference: record.bankReference || '',
      washCount: record.washCount,
      dryCount: record.dryCount,
      soapCount: record.soapCount,
      laborCount: record.laborCount,
      softenerCount: record.softenerCount,
      bleachCount: record.bleachCount || 0,
      degreaserCount: record.degreaserCount || 0,
      notes: record.notes || ''
    };
    setOrders(prev => [orderFormat, ...prev]);

    // Si se incluye teléfono o nombre, sincronizar con clientes
    if (newRecord.customerPhone) {
      const existing = customers.find(c => c.phone.trim() === newRecord.customerPhone.trim());
      if (existing) {
        setCustomers(customers.map(c => c.phone.trim() === newRecord.customerPhone.trim() ? { ...c, visits: (c.visits || 1) + 1 } : c));
      } else if (newRecord.customerName) {
        setCustomers([{
          id: `c_${Date.now()}`,
          name: newRecord.customerName,
          phone: newRecord.customerPhone,
          visits: 1,
          notes: 'Registrado desde el mostrador / cuaderno'
        }, ...customers]);
      }
    }

    // Sincronizar de inmediato a la nube
    syncDocToCloud('daily_records', record.id, record);
    syncDocToCloud('orders', orderFormat.id, orderFormat);

    return record;
  };

  const updateDailyRecord = (id, updatedFields) => {
    setDailyRecords(prev => {
      const target = prev.find(r => r.id === id);
      if (target) {
        const merged = normalizeRecordServices({ ...target, ...updatedFields });
        syncDocToCloud('daily_records', id, merged);
        return prev.map(r => r.id === id ? merged : r);
      }
      return prev;
    });

    // Sincronizar en órdenes
    setOrders(prev => prev.map(o => {
      if (o.id === id || o.originalId === id || o.id === `AJ-${id.replace('rec_', '')}`) {
        return {
          ...o,
          ...updatedFields,
          orderStatus: updatedFields.deliveryStatus === 'delivered' ? 'delivered' : o.orderStatus
        };
      }
      return o;
    }));
  };

  const markRecordDelivered = (id, deliveredDate) => {
    const today = deliveredDate || new Date().toISOString().split('T')[0];
    setDailyRecords(prev => {
      const target = prev.find(r => r.id === id);
      if (target) {
        syncDocToCloud('daily_records', id, { ...target, deliveryStatus: 'delivered', deliveredDate: today });
      }
      return prev.map(r => r.id === id ? { 
        ...r, 
        deliveryStatus: 'delivered',
        deliveredDate: today
      } : r);
    });

    // Sincronizar en órdenes para que Administración lo vea entregado
    setOrders(prev => prev.map(o => (o.id === id || o.originalId === id || o.id === `AJ-${id.replace('rec_', '')}`) ? {
      ...o,
      orderStatus: 'delivered',
      deliveryStatus: 'delivered',
      deliveredDate: today
    } : o));
  };

  const markRecordPaid = (id, paymentData = {}) => {
    const paymentDate = paymentData.paymentDate || new Date().toISOString().split('T')[0];
    setDailyRecords(prev => {
      const target = prev.find(r => r.id === id);
      if (target) {
        const updated = {
          ...target,
          paymentStatus: 'paid',
          amountPaidUSD: target.totalUSD,
          amountPaidBs: target.totalBs,
          debtUSD: 0,
          paymentDate: paymentDate,
          paymentMethod: paymentData.paymentMethod || target.paymentMethod || 'usd_cash',
          bankReference: paymentData.bankReference || target.bankReference || 'Pagado en mostrador',
          notes: paymentData.notes ? `${target.notes ? target.notes + ' · ' : ''}${paymentData.notes}` : target.notes
        };
        syncDocToCloud('daily_records', id, updated);
      }
      return prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            paymentStatus: 'paid',
            amountPaidUSD: r.totalUSD,
            amountPaidBs: r.totalBs,
            debtUSD: 0,
            paymentDate: paymentDate,
            paymentMethod: paymentData.paymentMethod || r.paymentMethod || 'usd_cash',
            bankReference: paymentData.bankReference || r.bankReference || 'Pagado en mostrador',
            notes: paymentData.notes ? `${r.notes ? r.notes + ' · ' : ''}${paymentData.notes}` : r.notes
          };
        }
        return r;
      });
    });

    // Sincronizar en órdenes para que Administración registre el pago
    setOrders(prev => prev.map(o => (o.id === id || o.originalId === id || o.id === `AJ-${id.replace('rec_', '')}`) ? {
      ...o,
      paymentStatus: 'paid',
      paymentDate: paymentDate,
      paymentMethod: paymentData.paymentMethod || o.paymentMethod || 'usd_cash'
    } : o));
  };

  // Verificación de Contraseña Administrativa
  const verifyAdminPassword = (password) => {
    return password === 'aj2026' || password === '1234';
  };

  // Agregar log a la auditoría
  const logAuditAction = ({ action, entityType, entityId, reason, performedBy, details, recordSnapshot }) => {
    const auditEntry = {
      id: `aud_${Date.now()}`,
      timestamp: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      action: action || 'MODIFICACION',
      entityType: entityType || 'SISTEMA',
      entityId: entityId || 'SYS',
      reason: reason || 'Acción autorizada por administrador',
      performedBy: performedBy || 'Administrador / Encargada',
      details: details || '',
      recordSnapshot: recordSnapshot || null
    };
    setAuditLogs(prev => [auditEntry, ...prev]);
    return auditEntry;
  };

  // Borrado Estrictamente Protegido con Contraseña Maestra y Motivo Obligatorio
  const deleteRecordWithAudit = (id, adminPassword, reason, performedBy = 'Encargada / Empleada') => {
    if (!verifyAdminPassword(adminPassword)) {
      return { success: false, message: 'Contraseña de Administrador incorrecta. Operación no autorizada.' };
    }

    if (!reason || reason.trim().length < 4) {
      return { success: false, message: 'Debes indicar el motivo detallado de la eliminación para el registro de auditoría.' };
    }

    const recordToDelete = dailyRecords.find(r => r.id === id);
    if (!recordToDelete) {
      return { success: false, message: 'Registro no encontrado.' };
    }

    // Crear entrada inmutable en la Auditoría del Administrador
    logAuditAction({
      action: 'ELIMINACIÓN_REGISTRO',
      entityType: 'CUADERNO_DIARIO',
      entityId: id,
      reason: reason.trim(),
      performedBy: performedBy,
      recordSnapshot: {
        cliente: recordToDelete.customerName,
        montoUSD: recordToDelete.totalUSD,
        montoBs: recordToDelete.totalBs,
        fecha: recordToDelete.date,
        hora: recordToDelete.time,
        servicios: `L:${recordToDelete.washCount || 0} S:${recordToDelete.dryCount || 0} J:${recordToDelete.soapCount || 0} Suav:${recordToDelete.softenerCount || 0} Cl:${recordToDelete.bleachCount || 0} Des:${recordToDelete.degreaserCount || 0}`,
        referencia: recordToDelete.bankReference || 'S/R',
        estadoPago: recordToDelete.paymentStatus
      }
    });

    deleteDocFromCloud('daily_records', id);
    deleteDocFromCloud('orders', `AJ-${id.replace('rec_', '')}`);
    setDailyRecords(prev => prev.filter(r => r.id !== id));
    setOrders(prev => prev.filter(o => o.id !== id && o.originalId !== id && o.id !== `AJ-${id.replace('rec_', '')}`));

    return { success: true, message: 'Registro eliminado y registrado en la bitácora de auditoría del administrador.' };
  };

  // Apertura de Detergentes
  const addDetergentLog = (item, notes = '', employee = 'Encargada') => {
    const newLog = {
      id: `det_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      item,
      notes,
      employee
    };
    setDetergentLogs([newLog, ...detergentLogs]);
    return newLog;
  };

  // Guardar Cierre Diario de Caja (Crea o actualiza si ya existe para esa fecha)
  const saveDailyClosure = (closureData) => {
    const date = closureData.date || new Date().toISOString().split('T')[0];
    const newClosure = {
      ...closureData,
      id: closureData.id || `close_${Date.now()}`,
      closedAt: closureData.closedAt || `${date} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      date,
      isClosed: true
    };
    setDailyClosures(prev => {
      const idx = prev.findIndex(c => c.date === date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...newClosure };
        return copy;
      }
      return [newClosure, ...prev];
    });
    syncDocToCloud('daily_closures', newClosure.date, newClosure);
    return newClosure;
  };

  return (
    <AppContext.Provider value={{
      prices: INITIAL_PRICES,
      exchangeRate,
      setExchangeRate,
      euroRate,
      setEuroRate,
      bcvLastUpdated,
      bcvLoading,
      fetchBcvRates,
      customers,
      orders,
      expenses,
      machines,
      maintenanceLogs,
      dailyRecords,
      detergentLogs,
      dailyClosures,
      auditLogs,
      addOrder,
      updateOrderStatus,
      updatePaymentStatus,
      addExpense,
      addMaintenanceLog,
      updateMachineStatus,
      addDailyRecord,
      updateDailyRecord,
      markRecordDelivered,
      markRecordPaid,
      verifyAdminPassword,
      deleteRecordWithAudit,
      logAuditAction,
      addDetergentLog,
      saveDailyClosure,
      isCloudConnected,
      setIsCloudConnected,
      getFirebaseConfig
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
