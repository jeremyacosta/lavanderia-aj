import React, { createContext, useContext, useState, useEffect } from 'react';

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

export function AppProvider({ children }) {
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
    return saved ? JSON.parse(saved) : [
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
    setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
  };

  const updatePaymentStatus = (orderId, newPaymentStatus, method) => {
    setOrders(orders.map(o => o.id === orderId ? { 
      ...o, 
      paymentStatus: newPaymentStatus,
      paymentMethod: method || o.paymentMethod 
    } : o));
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
    const record = {
      ...newRecord,
      id: nextId,
      date: newRecord.date || new Date().toISOString().split('T')[0],
      time: newRecord.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      deliveryStatus: newRecord.deliveryStatus || 'in_store'
    };
    setDailyRecords([record, ...dailyRecords]);

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
          notes: 'Registrado desde el cuaderno diario'
        }, ...customers]);
      }
    }

    return record;
  };

  const updateDailyRecord = (id, updatedFields) => {
    setDailyRecords(dailyRecords.map(r => r.id === id ? { ...r, ...updatedFields } : r));
  };

  const markRecordDelivered = (id) => {
    setDailyRecords(dailyRecords.map(r => r.id === id ? { 
      ...r, 
      deliveryStatus: 'delivered',
      deliveredDate: new Date().toISOString().split('T')[0]
    } : r));
  };

  const markRecordPaid = (id, paymentData = {}) => {
    setDailyRecords(dailyRecords.map(r => {
      if (r.id === id) {
        return {
          ...r,
          paymentStatus: 'paid',
          amountPaidUSD: r.totalUSD,
          amountPaidBs: r.totalBs,
          debtUSD: 0,
          paymentMethod: paymentData.paymentMethod || r.paymentMethod || 'usd_cash',
          bankReference: paymentData.bankReference || r.bankReference || 'Pagado en mostrador',
          notes: paymentData.notes ? `${r.notes ? r.notes + ' · ' : ''}${paymentData.notes}` : r.notes
        };
      }
      return r;
    }));
  };

  // Verificación de Contraseña Administrativa
  const verifyAdminPassword = (password) => {
    return password === 'aj2026' || password === '1234';
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
    const auditEntry = {
      id: `aud_${Date.now()}`,
      timestamp: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
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
    };

    setAuditLogs([auditEntry, ...auditLogs]);
    setDailyRecords(dailyRecords.filter(r => r.id !== id));

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

  // Guardar Cierre Diario de Caja
  const saveDailyClosure = (closureData) => {
    const newClosure = {
      ...closureData,
      id: `close_${Date.now()}`,
      closedAt: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      date: closureData.date || new Date().toISOString().split('T')[0]
    };
    setDailyClosures([newClosure, ...dailyClosures]);
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
      addDetergentLog,
      saveDailyClosure
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
