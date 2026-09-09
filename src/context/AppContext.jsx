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
  // Configuración general
  const [exchangeRate, setExchangeRate] = useState(() => {
    const saved = localStorage.getItem('aj_exchange_rate');
    return saved ? parseFloat(saved) : 40.50; // Tasa Bs/$
  });

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

  useEffect(() => {
    localStorage.setItem('aj_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('aj_machines', JSON.stringify(machines));
  }, [machines]);

  useEffect(() => {
    localStorage.setItem('aj_maintenance_logs', JSON.stringify(maintenanceLogs));
  }, [maintenanceLogs]);

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

  return (
    <AppContext.Provider value={{
      prices: INITIAL_PRICES,
      exchangeRate,
      setExchangeRate,
      customers,
      orders,
      expenses,
      machines,
      maintenanceLogs,
      addOrder,
      updateOrderStatus,
      updatePaymentStatus,
      addExpense,
      addMaintenanceLog,
      updateMachineStatus
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
