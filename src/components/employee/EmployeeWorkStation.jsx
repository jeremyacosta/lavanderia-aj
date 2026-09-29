import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, Plus, Search, Filter, CheckCircle2, 
  Clock, AlertCircle, Trash2, Check, DollarSign, 
  Sparkles, X, ShieldAlert, FileText, Share2, 
  Package, Droplets, CheckSquare, Layers, Lock, 
  Calendar, Eye, Phone, RefreshCw, Smartphone, ArrowRight, MessageCircle,
  Printer, Copy, UserCheck
} from 'lucide-react';

export default function EmployeeWorkStation() {
  const { 
    dailyRecords, 
    customers,
    addDailyRecord, 
    updateDailyRecord,
    markRecordDelivered, 
    markRecordPaid, 
    deleteRecordWithAudit,
    verifyAdminPassword,
    detergentLogs, 
    addDetergentLog, 
    dailyClosures, 
    saveDailyClosure,
    isCloudConnected,
    exchangeRate,
    euroRate,
    bcvLastUpdated,
    bcvLoading,
    fetchBcvRates,
    prices
  } = useApp();

  const [activeTab, setActiveTab] = useState('daily_log'); // 'daily_log' | 'stored_clothes' | 'detergents' | 'closure'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('all'); // 'all' | 'walk_in' | 'app'
  const [mobileViewMode, setMobileViewMode] = useState('cards'); // 'cards' | 'table'

  // Modal para recepcionar y ajustar pedidos que llegaron de la App
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [recordForIntake, setRecordForIntake] = useState(null);
  const [intakeBaskets, setIntakeBaskets] = useState(1);
  const [intakeBleach, setIntakeBleach] = useState(0);
  const [intakeDegreaser, setIntakeDegreaser] = useState(0);
  const [intakePaymentStatus, setIntakePaymentStatus] = useState('paid');
  const [intakePaymentMethod, setIntakePaymentMethod] = useState('pago_movil');
  const [intakeBankRef, setIntakeBankRef] = useState('');
  const [intakeNotes, setIntakeNotes] = useState('');
  const [intakeCedula, setIntakeCedula] = useState('');

  // Estado para la Barra Directa de Carga en Mostrador
  const [inlineClientCedula, setInlineClientCedula] = useState('');
  const [inlineClientName, setInlineClientName] = useState('');
  const [inlineClientPhone, setInlineClientPhone] = useState('');
  const [inlineMatchedCustomer, setInlineMatchedCustomer] = useState(null);
  const [inlineShowCedulaSuggestions, setInlineShowCedulaSuggestions] = useState(false);
  const [inlineShowNameSuggestions, setInlineShowNameSuggestions] = useState(false);

  const [inlineBaskets, setInlineBaskets] = useState(1);
  const [inlineWashCount, setInlineWashCount] = useState(1);
  const [inlineDryCount, setInlineDryCount] = useState(1);
  const [inlineSoapCount, setInlineSoapCount] = useState(1);
  const [inlineLaborCount, setInlineLaborCount] = useState(1);
  const [inlineSoftenerCount, setInlineSoftenerCount] = useState(1);
  const [inlineBleachCount, setInlineBleachCount] = useState(0);
  const [inlineDegreaserCount, setInlineDegreaserCount] = useState(0);
  const [inlineAmountUSD, setInlineAmountUSD] = useState('7.50');
  const [inlineCurrencyMode, setInlineCurrencyMode] = useState('USD'); // 'USD' o 'BS'
  const [inlinePayMethod, setInlinePayMethod] = useState('usd_cash'); // 'usd_cash' | 'pago_movil' | 'bs_cash' | 'pending'
  const [inlineBankRef, setInlineBankRef] = useState('');
  const [inlineNotes, setInlineNotes] = useState('');
  const [inlineServiceType, setInlineServiceType] = useState('combo'); // 'combo' | 'lavado_jabon' | 'solo_secado' | 'edredon_ind' | 'edredon_mat' | 'edredon_grande' | 'forros_bus' | 'custom'
  const [inlineSuccessToast, setInlineSuccessToast] = useState('');

  // Modal de Edición Rápida de Servicios/Cestas de un Ticket existente
  const [editServicesModalOpen, setEditServicesModalOpen] = useState(false);
  const [recordToEditServices, setRecordToEditServices] = useState(null);
  const [editWashCount, setEditWashCount] = useState(1);
  const [editDryCount, setEditDryCount] = useState(1);
  const [editSoapCount, setEditSoapCount] = useState(1);
  const [editLaborCount, setEditLaborCount] = useState(1);
  const [editSoftenerCount, setEditSoftenerCount] = useState(1);
  const [editBleachCount, setEditBleachCount] = useState(0);
  const [editDegreaserCount, setEditDegreaserCount] = useState(0);
  const [editTotalUSD, setEditTotalUSD] = useState('');

  // === MODAL DE COMPROBANTE DE PAGO ===
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptRecord, setReceiptRecord] = useState(null);
  const [receiptCopiedToast, setReceiptCopiedToast] = useState(false);

  // === MODAL HACER CIERRE DEL DIA ===
  const [closureModalOpen, setClosureModalOpen] = useState(false);
  const [closureConfirmNotes, setClosureConfirmNotes] = useState('');
  const [postClosureUnlockOpen, setPostClosureUnlockOpen] = useState(false);
  const [postClosurePassword, setPostClosurePassword] = useState('');
  const [postClosureError, setPostClosureError] = useState('');
  const [postClosureUnlocked, setPostClosureUnlocked] = useState(false);

  // Estado del Formulario de Carga Rápida (Mostrador)
  const [showAddModal, setShowAddModal] = useState(false);
  const [time, setTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [customerCedula, setCustomerCedula] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [modalMatchedCustomer, setModalMatchedCustomer] = useState(null);
  const [modalShowCedulaSuggestions, setModalShowCedulaSuggestions] = useState(false);
  const [modalShowNameSuggestions, setModalShowNameSuggestions] = useState(false);
  
  // Servicios (cantidades)
  const [washCount, setWashCount] = useState(1);
  const [dryCount, setDryCount] = useState(1);
  const [soapCount, setSoapCount] = useState(1);
  const [laborCount, setLaborCount] = useState(1);
  const [softenerCount, setSoftenerCount] = useState(1);
  const [bleachCount, setBleachCount] = useState(0);
  const [degreaserCount, setDegreaserCount] = useState(0);

  // Directorio consolidado de clientes para autocompletado y reconocimiento inteligente
  const registeredClients = useMemo(() => {
    const map = new Map();
    // 1. Clientes registrados en AppContext / CRM
    (customers || []).forEach(c => {
      const key = (c.cedula ? c.cedula.trim().toLowerCase() : '') || 
                  (c.phone ? c.phone.trim() : '') || 
                  (c.name ? c.name.trim().toLowerCase() : '');
      if (key) {
        map.set(key, {
          name: c.name || '',
          cedula: c.cedula || '',
          phone: c.phone || '',
          visits: c.visits || 1,
          notes: c.notes || ''
        });
      }
    });

    // 2. Historial de tickets del cuaderno
    (dailyRecords || []).forEach(r => {
      if (r.customerName && r.customerName !== 'Cliente sin nombre') {
        const cedKey = r.customerCedula ? r.customerCedula.trim().toLowerCase() : '';
        const phoneKey = r.customerPhone && r.customerPhone !== 'En mostrador' ? r.customerPhone.trim() : '';
        const nameKey = r.customerName.trim().toLowerCase();

        let foundKey = null;
        if (cedKey && map.has(cedKey)) foundKey = cedKey;
        else if (phoneKey && map.has(phoneKey)) foundKey = phoneKey;
        else if (nameKey && map.has(nameKey)) foundKey = nameKey;

        if (foundKey) {
          const item = map.get(foundKey);
          if (!item.cedula && r.customerCedula) item.cedula = r.customerCedula;
          if (!item.phone && r.customerPhone && r.customerPhone !== 'En mostrador') item.phone = r.customerPhone;
          item.visits = Math.max(item.visits || 1, 2);
        } else {
          const newKey = cedKey || phoneKey || nameKey;
          map.set(newKey, {
            name: r.customerName,
            cedula: r.customerCedula || '',
            phone: r.customerPhone && r.customerPhone !== 'En mostrador' ? r.customerPhone : '',
            visits: 1,
            notes: ''
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => (b.visits || 1) - (a.visits || 1));
  }, [customers, dailyRecords]);

  // Búsqueda por cédula
  const getCedulaMatches = (query) => {
    if (!query || query.trim().length < 2) return [];
    const cleanQ = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    return registeredClients.filter(c => {
      const cleanC = (c.cedula || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanC.includes(cleanQ);
    }).slice(0, 5);
  };

  // Búsqueda por nombre
  const getNameMatches = (query) => {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return registeredClients.filter(c => 
      c.name.toLowerCase().includes(q)
    ).slice(0, 5);
  };

  // Seleccionar cliente en Barra Directa
  const handleSelectCustomerInline = (client) => {
    setInlineClientCedula(client.cedula || '');
    setInlineClientName(client.name || '');
    setInlineClientPhone(client.phone || '');
    setInlineMatchedCustomer(client);
    setInlineShowCedulaSuggestions(false);
    setInlineShowNameSuggestions(false);
  };

  const handleInlineCedulaChange = (val) => {
    setInlineClientCedula(val);
    setInlineShowCedulaSuggestions(true);
    setInlineShowNameSuggestions(false);

    const cleanInput = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanInput.length >= 6) {
      const match = registeredClients.find(c => {
        const cleanC = (c.cedula || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanC === cleanInput;
      });
      if (match) {
        setInlineClientName(match.name);
        if (match.phone) setInlineClientPhone(match.phone);
        setInlineMatchedCustomer(match);
        return;
      }
    }
    if (inlineMatchedCustomer && val !== inlineMatchedCustomer.cedula) {
      setInlineMatchedCustomer(null);
    }
  };

  const handleInlineNameChange = (val) => {
    setInlineClientName(val);
    setInlineShowNameSuggestions(true);
    setInlineShowCedulaSuggestions(false);

    const match = val.toLowerCase().match(/(\d+)\s*cesta/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 10) {
        handleInlineBasketsChange(num);
      }
    }

    const exactMatch = registeredClients.find(c => c.name.toLowerCase().trim() === val.toLowerCase().trim());
    if (exactMatch) {
      if (exactMatch.cedula && !inlineClientCedula) setInlineClientCedula(exactMatch.cedula);
      if (exactMatch.phone && !inlineClientPhone) setInlineClientPhone(exactMatch.phone);
      setInlineMatchedCustomer(exactMatch);
    } else if (inlineMatchedCustomer && val !== inlineMatchedCustomer.name) {
      setInlineMatchedCustomer(null);
    }
  };

  // Seleccionar cliente en Modal Detallado
  const handleSelectCustomerModal = (client) => {
    setCustomerCedula(client.cedula || '');
    setCustomerName(client.name || '');
    setCustomerPhone(client.phone || '');
    setModalMatchedCustomer(client);
    setModalShowCedulaSuggestions(false);
    setModalShowNameSuggestions(false);
  };

  const handleModalCedulaChange = (val) => {
    setCustomerCedula(val);
    setModalShowCedulaSuggestions(true);
    setModalShowNameSuggestions(false);

    const cleanInput = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanInput.length >= 6) {
      const match = registeredClients.find(c => {
        const cleanC = (c.cedula || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanC === cleanInput;
      });
      if (match) {
        setCustomerName(match.name);
        if (match.phone) setCustomerPhone(match.phone);
        setModalMatchedCustomer(match);
        return;
      }
    }
    if (modalMatchedCustomer && val !== modalMatchedCustomer.cedula) {
      setModalMatchedCustomer(null);
    }
  };

  const handleModalNameChange = (val) => {
    setCustomerName(val);
    setModalShowNameSuggestions(true);
    setModalShowCedulaSuggestions(false);

    const match = val.toLowerCase().match(/(\d+)\s*cesta/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 10) {
        setWashCount(num);
        setDryCount(num);
        setSoapCount(num);
        setLaborCount(num);
        setSoftenerCount(num);
        setManualTotalUSD((num * (prices.comboFull || 7.50)).toFixed(2));
      }
    }

    const exactMatch = registeredClients.find(c => c.name.toLowerCase().trim() === val.toLowerCase().trim());
    if (exactMatch) {
      if (exactMatch.cedula && !customerCedula) setCustomerCedula(exactMatch.cedula);
      if (exactMatch.phone && !customerPhone) setCustomerPhone(exactMatch.phone);
      setModalMatchedCustomer(exactMatch);
    } else if (modalMatchedCustomer && val !== modalMatchedCustomer.name) {
      setModalMatchedCustomer(null);
    }
  };

  // Helper para añadir o editar la cédula de un ticket existente
  const handleEditCedula = (rec) => {
    const current = rec.customerCedula || '';
    const val = prompt(`Ingresa o edita la Cédula / C.I. para "${rec.customerName}":`, current);
    if (val !== null && val.trim() !== current) {
      updateDailyRecord(rec.id, { customerCedula: val.trim() });
      setInlineSuccessToast(`🪪 Cédula actualizada para ${rec.customerName}: ${val.trim()}`);
      setTimeout(() => setInlineSuccessToast(''), 3000);
    }
  };

  // Pagos
  const [paymentStatus, setPaymentStatus] = useState('paid'); // 'paid' | 'partial' | 'pending'
  const [paymentMethod, setPaymentMethod] = useState('usd_cash');
  const [bankReference, setBankReference] = useState('');
  const [manualTotalUSD, setManualTotalUSD] = useState('7.50');
  const [manualAmountPaidUSD, setManualAmountPaidUSD] = useState('');
  const [notes, setNotes] = useState('');
  const [markedNewDetergent, setMarkedNewDetergent] = useState(false);
  const [newDetergentType, setNewDetergentType] = useState('Jabón');

  // Modal de Borrado Protegido con Auditoría
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [deleteReasonInput, setDeleteReasonInput] = useState('');
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');

  // Modal de Cobro de Deuda / Entrega
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [recordToPay, setRecordToPay] = useState(null);
  const [payMethodSelect, setPayMethodSelect] = useState('usd_cash');
  const [payRefInput, setPayRefInput] = useState('');

  // Estado de Cierre Diario
  const [fondoInicialBs, setFondoInicialBs] = useState('860');
  const [dineroEntregadoBs, setDineroEntregadoBs] = useState('');
  const [dineroEntregadoUSD, setDineroEntregadoUSD] = useState('');
  const [closureNotes, setClosureNotes] = useState('');
  const [closureSuccessAlert, setClosureSuccessAlert] = useState(false);

  // Cálculo sugerido del costo según servicios ingresados
  const calculateSuggestedUSD = () => {
    // Si coincide con Combo Estrella 1 cesta completa
    if (washCount === 1 && dryCount === 1 && soapCount === 1 && laborCount === 1 && softenerCount === 1) {
      let base = prices.comboFull || 7.50;
      base += bleachCount * (prices.bleach || 0.50);
      base += degreaserCount * (prices.degreaser || 0.50);
      return base;
    }
    // Múltiples cestas estándar de combo
    if (washCount > 1 && washCount === dryCount && washCount === soapCount && washCount === laborCount && washCount === softenerCount) {
      let base = washCount * (prices.comboFull || 7.50);
      base += bleachCount * (prices.bleach || 0.50);
      base += degreaserCount * (prices.degreaser || 0.50);
      return base;
    }
    // Suma individual
    let sum = 0;
    sum += washCount * (prices.washOnly || 4.00);
    sum += dryCount * (prices.dryOnly || 3.00);
    sum += soapCount * (prices.soap || 0.50);
    sum += laborCount * (prices.labor || 0.20);
    sum += softenerCount * (prices.softener || 0.70);
    sum += bleachCount * (prices.bleach || 0.50);
    sum += degreaserCount * (prices.degreaser || 0.50);
    return sum;
  };

  const calculatedUSD = calculateSuggestedUSD();
  const effectiveTotalUSD = manualTotalUSD !== '' ? parseFloat(manualTotalUSD) || 0 : calculatedUSD;
  const effectiveTotalBs = effectiveTotalUSD * (exchangeRate || 40.50);

  const effectivePaidUSD = paymentStatus === 'paid' 
    ? effectiveTotalUSD 
    : paymentStatus === 'pending' 
      ? 0 
      : (manualAmountPaidUSD !== '' ? parseFloat(manualAmountPaidUSD) || 0 : 0);

  const effectiveDebtUSD = Math.max(0, effectiveTotalUSD - effectivePaidUSD);

  // Manejador para agregar nuevo registro
  const handleCreateRecord = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Por favor indica el nombre del cliente');
      return;
    }

    addDailyRecord({
      date: selectedDate,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: customerName.trim(),
      customerCedula: customerCedula.trim(),
      customerPhone: customerPhone.trim(),
      washCount,
      dryCount,
      soapCount,
      laborCount,
      softenerCount,
      bleachCount,
      degreaserCount,
      totalUSD: effectiveTotalUSD,
      totalBs: effectiveTotalBs,
      amountPaidUSD: effectivePaidUSD,
      amountPaidBs: effectivePaidUSD * (exchangeRate || 40.50),
      debtUSD: effectiveDebtUSD,
      paymentStatus,
      paymentMethod,
      bankReference: bankReference.trim(),
      deliveryStatus: 'in_store',
      origin: 'walk_in',
      intakeStatus: 'confirmed',
      notes: notes.trim()
    });

    if (markedNewDetergent) {
      addDetergentLog(newDetergentType, `Apertura registrada en orden de ${customerName.trim()}`, 'Encargada');
    }

    setInlineSuccessToast(`✅ ¡Cliente "${customerName.trim()}" registrado con éxito por $${effectiveTotalUSD.toFixed(2)} USD!`);
    setTimeout(() => setInlineSuccessToast(''), 4000);

    // Limpiar formulario
    setShowAddModal(false);
    setCustomerName('');
    setCustomerCedula('');
    setCustomerPhone('');
    setModalMatchedCustomer(null);
    setModalShowCedulaSuggestions(false);
    setModalShowNameSuggestions(false);
    setWashCount(1);
    setDryCount(1);
    setSoapCount(1);
    setLaborCount(1);
    setSoftenerCount(1);
    setBleachCount(0);
    setDegreaserCount(0);
    setManualTotalUSD('7.50');
    setManualAmountPaidUSD('');
    setBankReference('');
    setNotes('');
    setPaymentStatus('paid');
    setMarkedNewDetergent(false);
    setOriginFilter('all');
  };

  // Notificar al cliente por WhatsApp que su ropa está lista
  const notifyCustomerWhatsApp = (rec) => {
    const rawPhone = (rec.customerPhone || '').replace(/\D/g, '');
    let cleanPhone = rawPhone;
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '58' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('58')) {
      cleanPhone = '58' + cleanPhone;
    }
    const text = encodeURIComponent(
      `🧼 *LAVANDERÍA AJ*\n` +
      `¡Hola ${rec.customerName}! Tu ropa (${rec.washCount || 1} cesta/servicio) ya está lista para retirar en nuestro local.\n` +
      `💵 Total: $${(rec.totalUSD || 0).toFixed(2)} USD (Bs. ${(rec.totalBs || 0).toLocaleString('es-VE')})\n` +
      `📌 Estado: ${rec.paymentStatus === 'paid' ? '✅ Ya pagado' : `⏳ Saldo pendiente: $${(rec.debtUSD || rec.totalUSD || 0).toFixed(2)} USD`}\n` +
      `¡Te esperamos!`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // Abrir Modal de Comprobante de Pago
  const openReceiptModal = (rec) => {
    setReceiptRecord(rec);
    setReceiptModalOpen(true);
  };

  // Enviar Comprobante Digital Oficial por WhatsApp
  const shareReceiptWhatsApp = (rec) => {
    const rawPhone = (rec.customerPhone || '').replace(/\D/g, '');
    let cleanPhone = rawPhone;
    if (cleanPhone.startsWith('0')) cleanPhone = '58' + cleanPhone.slice(1);
    else if (!cleanPhone.startsWith('58') && cleanPhone.length > 0) cleanPhone = '58' + cleanPhone;

    const ticketId = rec.id ? rec.id.slice(-6).toUpperCase() : '000';
    const isPaid = rec.paymentStatus === 'paid';
    const safeRate = exchangeRate || 40.50;
    const paidUSD = rec.amountPaidUSD !== undefined ? rec.amountPaidUSD : (isPaid ? rec.totalUSD : 0);
    const paidBs = rec.amountPaidBs !== undefined ? rec.amountPaidBs : (paidUSD * safeRate);
    const debt = rec.debtUSD !== undefined ? rec.debtUSD : (isPaid ? 0 : rec.totalUSD);

    const text = encodeURIComponent(
      `🧾 *COMPROBANTE DE PAGO · LAVANDERÍA AJ EXPRESS*\n` +
      `_"El mejor servicio al mejor precio es nuestra mayor prioridad"_\n\n` +
      `📌 *N° de Ticket:* #TKT-${ticketId}\n` +
      `👤 *Cliente:* ${rec.customerName}\n` +
      (rec.customerCedula ? `🪪 *C.I / Cédula:* ${rec.customerCedula}\n` : '') +
      `📅 *Fecha:* ${rec.date} · 🕒 ${rec.time}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🧺 *Servicio:* ${rec.notes || `${rec.washCount || 1} Cesta(s)`}\n` +
      `🫧 Lavados: ${rec.washCount || 0}   |   💨 Secados: ${rec.dryCount || 0}\n` +
      `🧼 Jabón: ${rec.soapCount || 0}   |   🌸 Suavizante: ${rec.softenerCount || 0}\n` +
      (rec.bleachCount > 0 ? `🧪 Cloro: ${rec.bleachCount} cesta(s)\n` : '') +
      (rec.degreaserCount > 0 ? `🧽 Desengrasante: ${rec.degreaserCount} cesta(s)\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💵 *Total:* $${(rec.totalUSD || 0).toFixed(2)} USD (Bs. ${(rec.totalBs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })})\n` +
      `💰 *Monto Pagado:* $${paidUSD.toFixed(2)} USD (Bs. ${paidBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })})\n` +
      (debt > 0 
        ? `⏳ *Saldo Pendiente:* $${debt.toFixed(2)} USD\n` 
        : `✅ *Estado:* TOTALMENTE PAGADO\n`) +
      `💳 *Forma de Pago:* ${rec.paymentMethod === 'usd_cash' ? 'Efectivo USD ($)' : rec.paymentMethod === 'pago_movil' ? 'Pago Móvil' : rec.paymentMethod === 'bs_cash' ? 'Efectivo Bs' : 'Transferencia'}\n` +
      (rec.bankReference ? `🔖 *Referencia:* ${rec.bankReference}\n` : '') +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *Entrega:* ${rec.deliveryStatus === 'delivered' ? '✅ Ropa ya entregada' : '🧺 En local / Lista para retirar'}\n\n` +
      `¡Muchas gracias por su preferencia! Conserve este comprobante para retirar.`
    );

    if (cleanPhone && cleanPhone.length >= 10) {
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    } else {
      const userPhone = prompt('Ingresa el número de WhatsApp del cliente para enviarle el comprobante (Ej: 04121234567):');
      if (userPhone) {
        let p = userPhone.replace(/\D/g, '');
        if (p.startsWith('0')) p = '58' + p.slice(1);
        else if (!p.startsWith('58')) p = '58' + p;
        window.open(`https://wa.me/${p}?text=${text}`, '_blank');
      }
    }
  };

  // Copiar Comprobante de Pago al Portapapeles
  const copyReceiptText = (rec) => {
    const ticketId = rec.id ? rec.id.slice(-6).toUpperCase() : '000';
    const isPaid = rec.paymentStatus === 'paid';
    const paidUSD = rec.amountPaidUSD !== undefined ? rec.amountPaidUSD : (isPaid ? rec.totalUSD : 0);
    const debt = rec.debtUSD !== undefined ? rec.debtUSD : (isPaid ? 0 : rec.totalUSD);

    const text = 
      `🧾 COMPROBANTE DE PAGO · LAVANDERÍA AJ EXPRESS\n` +
      `"El mejor servicio al mejor precio es nuestra mayor prioridad"\n\n` +
      `N° Ticket: #TKT-${ticketId}\n` +
      `Cliente: ${rec.customerName}\n` +
      (rec.customerCedula ? `C.I / Cédula: ${rec.customerCedula}\n` : '') +
      `Fecha: ${rec.date} · ${rec.time}\n` +
      `Servicio: ${rec.notes || `${rec.washCount || 1} Cesta(s)`}\n` +
      `Total: $${(rec.totalUSD || 0).toFixed(2)} USD (Bs. ${(rec.totalBs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })})\n` +
      `Pagado: $${paidUSD.toFixed(2)} USD\n` +
      `Estado: ${debt === 0 ? 'PAGADO COMPLETO' : `PENDIENTE ($${debt.toFixed(2)} USD)`}\n` +
      `Ref: ${rec.bankReference || 'Sin referencia'}\n`;

    navigator.clipboard.writeText(text);
    setReceiptCopiedToast(true);
    setTimeout(() => setReceiptCopiedToast(false), 3000);
  };

  // Cálculo de precio flexible y justo considerando operaciones exactas
  const calculateFlexibleServicePrice = (wash, dry, soap, labor, softener, bleach, degreaser, serviceType = 'custom') => {
    const comboPrice = prices.comboFull || 7.50;
    const washPrice = prices.washOnly || 4.50;
    const dryPrice = prices.dryOnly || 3.00;
    const bleachPrice = prices.bleach || 0.50;
    const degreaserPrice = prices.degreaser || 0.50;

    const extras = (bleach * bleachPrice) + (degreaser * degreaserPrice);

    if (serviceType === 'edredon_ind') return (wash * (prices.edredonInd || 10.00)) + extras;
    if (serviceType === 'edredon_mat') return (wash * (prices.edredonMat || 12.00)) + extras;
    if (serviceType === 'edredon_grande') return (wash * (prices.edredonGrande || 14.00)) + extras;
    if (serviceType === 'forros_bus') return (Math.max(1, Math.round(wash / 4)) * (prices.forrosBus || 32.00)) + extras;

    // Si es solo lavado sin secado
    if (wash > 0 && dry === 0) {
      return (wash * washPrice) + extras;
    }
    // Si es solo secado sin lavado
    if (wash === 0 && dry > 0) {
      return (dry * dryPrice) + extras;
    }
    // Si la cantidad de lavado y secado es exactamente igual
    if (wash === dry && wash > 0) {
      return (wash * comboPrice) + extras;
    }
    // Si se lavan más cestas de las que se secan (ej: 3 lavados, 2 secados => 2 combos completos + 1 solo lavado)
    if (wash > dry) {
      const combos = dry;
      const extraWashOnly = wash - dry;
      return (combos * comboPrice) + (extraWashOnly * washPrice) + extras;
    }
    // Si se secan más cestas de las que se lavan (ej: 2 lavados, 3 secados => 2 combos completos + 1 solo secado)
    if (dry > wash) {
      const combos = wash;
      const extraDryOnly = dry - wash;
      return (combos * comboPrice) + (extraDryOnly * dryPrice) + extras;
    }
    return extras;
  };

  // Sincronizar monto y notas de la barra rápida según los servicios activos
  const syncInlineState = (newWash, newDry, newSoap, newLabor, newSoftener, newBleach, newDegreaser, newType, basketsCount) => {
    const rate = exchangeRate || 40.50;
    const totalUSD = calculateFlexibleServicePrice(newWash, newDry, newSoap, newLabor, newSoftener, newBleach, newDegreaser, newType);
    const totalUSDStr = totalUSD.toFixed(2);
    
    if (inlineCurrencyMode === 'BS') {
      setInlineAmountUSD((totalUSD * rate).toFixed(2));
    } else {
      setInlineAmountUSD(totalUSDStr);
    }

    // Generar descripción clara del ticket
    let desc = '';
    if (newType === 'edredon_ind') desc = `${basketsCount} Edredón(es) Individual ($10.00 c/u)`;
    else if (newType === 'edredon_mat') desc = `${basketsCount} Edredón(es) Matrimonial ($12.00 c/u)`;
    else if (newType === 'edredon_grande') desc = `${basketsCount} Edredón(es) Grande ($14.00 c/u)`;
    else if (newType === 'forros_bus') desc = `${basketsCount} Juego(s) Forros de Autobús ($32.00 c/u)`;
    else if (newDry === 0 && newWash > 0) desc = `${newWash} Cesta(s) Solo Lavado + Jabón ($4.50 c/u)`;
    else if (newWash === 0 && newDry > 0) desc = `${newDry} Cesta(s) Solo Secado ($3.00 c/u)`;
    else if (newWash === newDry) desc = `${newWash} Cesta(s) Combo Completo ($7.50 c/u)`;
    else desc = `${Math.max(newWash, newDry)} Cesta(s) (${newWash} lav, ${newDry} sec)`;

    if (newBleach > 0) desc += ` + ${newBleach} Cloro`;
    if (newDegreaser > 0) desc += ` + ${newDegreaser} Desengrasante`;

    setInlineNotes(desc);
  };

  // Cambio del tipo de servicio predeterminado (Combo, Solo Lavado, Solo Secado, Edredones, etc.)
  const selectInlineServiceType = (type, count = inlineBaskets) => {
    setInlineServiceType(type);
    const baskets = Math.max(1, count);
    setInlineBaskets(baskets);

    let w = baskets, d = baskets, j = baskets, mo = baskets, su = baskets;
    if (type === 'lavado_jabon') {
      w = baskets; d = 0; j = baskets; mo = baskets; su = 0;
    } else if (type === 'solo_secado') {
      w = 0; d = baskets; j = 0; mo = baskets; su = 0;
    } else if (type === 'forros_bus') {
      w = baskets * 4; d = baskets * 4; j = baskets * 4; mo = baskets * 4; su = baskets * 4;
    }

    setInlineWashCount(w);
    setInlineDryCount(d);
    setInlineSoapCount(j);
    setInlineLaborCount(mo);
    setInlineSoftenerCount(su);

    syncInlineState(w, d, j, mo, su, inlineBleachCount, inlineDegreaserCount, type, baskets);
  };

  // Cambio dinámico de cestas respetando estrictamente el tipo de servicio seleccionado
  const handleInlineBasketsChange = (newCount) => {
    const count = Math.max(1, newCount);
    setInlineBaskets(count);

    let w = count, d = count, j = count, mo = count, su = count;
    if (inlineServiceType === 'lavado_jabon') {
      w = count; d = 0; j = count; mo = count; su = 0;
    } else if (inlineServiceType === 'solo_secado') {
      w = 0; d = count; j = 0; mo = count; su = 0;
    } else if (inlineServiceType === 'forros_bus') {
      w = count * 4; d = count * 4; j = count * 4; mo = count * 4; su = count * 4;
    } else if (inlineServiceType === 'custom') {
      w = count;
      d = Math.min(count, inlineDryCount);
      j = count;
      mo = count;
      su = d;
    }

    setInlineWashCount(w);
    setInlineDryCount(d);
    setInlineSoapCount(j);
    setInlineLaborCount(mo);
    setInlineSoftenerCount(su);

    syncInlineState(w, d, j, mo, su, inlineBleachCount, inlineDegreaserCount, inlineServiceType, count);
  };

  // Modificar operaciones individuales (Lavado, Secado, Jabón, etc.) permitiendo restar o sumar secado libremente
  const handleInlineServiceCountChange = (serviceKey, delta) => {
    let w = inlineWashCount;
    let d = inlineDryCount;
    let j = inlineSoapCount;
    let mo = inlineLaborCount;
    let su = inlineSoftenerCount;
    let cl = inlineBleachCount;
    let de = inlineDegreaserCount;

    if (serviceKey === 'wash') w = Math.max(0, w + delta);
    if (serviceKey === 'dry') d = Math.max(0, d + delta);
    if (serviceKey === 'soap') j = Math.max(0, j + delta);
    if (serviceKey === 'labor') mo = Math.max(0, mo + delta);
    if (serviceKey === 'softener') su = Math.max(0, su + delta);
    if (serviceKey === 'bleach') cl = Math.max(0, cl + delta);
    if (serviceKey === 'degreaser') de = Math.max(0, de + delta);

    setInlineWashCount(w);
    setInlineDryCount(d);
    setInlineSoapCount(j);
    setInlineLaborCount(mo);
    setInlineSoftenerCount(su);
    setInlineBleachCount(cl);
    setInlineDegreaserCount(de);

    const maxBaskets = Math.max(1, w, d);
    setInlineBaskets(maxBaskets);
    setInlineServiceType('custom');

    syncInlineState(w, d, j, mo, su, cl, de, 'custom', maxBaskets);
  };

  const handleInlineBleachChange = (delta) => {
    handleInlineServiceCountChange('bleach', delta);
  };

  const handleInlineDegreaserChange = (delta) => {
    handleInlineServiceCountChange('degreaser', delta);
  };

  // Modificar servicios en el modal detallado recalculando el monto en vivo
  const handleModalServiceChange = (key, newVal) => {
    const val = Math.max(0, newVal);
    let w = washCount, d = dryCount, j = soapCount, mo = laborCount, su = softenerCount, cl = bleachCount, de = degreaserCount;
    if (key === 'wash') { w = val; setWashCount(val); }
    else if (key === 'dry') { d = val; setDryCount(val); }
    else if (key === 'soap') { j = val; setSoapCount(val); }
    else if (key === 'labor') { mo = val; setLaborCount(val); }
    else if (key === 'softener') { su = val; setSoftenerCount(val); }
    else if (key === 'bleach') { cl = val; setBleachCount(val); }
    else if (key === 'degreaser') { de = val; setDegreaserCount(val); }

    let sum = 0;
    if (w > 0 && w === d && w === j && w === mo && w === su) {
      sum = (w * (prices.comboFull || 7.50)) + (cl * (prices.bleach || 0.50)) + (de * (prices.degreaser || 0.50));
    } else {
      sum = (w * (prices.washOnly || 4.00)) +
            (d * (prices.dryOnly || 3.00)) +
            (j * (prices.soap || 0.50)) +
            (mo * (prices.labor || 0.20)) +
            (su * (prices.softener || 0.70)) +
            (cl * (prices.bleach || 0.50)) +
            (de * (prices.degreaser || 0.50));
    }
    setManualTotalUSD(sum.toFixed(2));
    let n = `${w} Cesta(s)`;
    if (cl > 0) n += ` + ${cl} Cloro`;
    if (de > 0) n += ` + ${de} Desengrasante`;
    setNotes(n);
  };

  // Abrir Modal para Corregir/Editar Servicios de un Registro
  const openEditServicesModal = (rec) => {
    setRecordToEditServices(rec);
    setEditWashCount(rec.washCount !== undefined ? Number(rec.washCount) : 1);
    setEditDryCount(rec.dryCount !== undefined ? Number(rec.dryCount) : 1);
    setEditSoapCount(rec.soapCount !== undefined ? Number(rec.soapCount) : 1);
    setEditLaborCount(rec.laborCount !== undefined ? Number(rec.laborCount) : 1);
    setEditSoftenerCount(rec.softenerCount !== undefined ? Number(rec.softenerCount) : 1);
    setEditBleachCount(Number(rec.bleachCount) || 0);
    setEditDegreaserCount(Number(rec.degreaserCount) || 0);
    setEditTotalUSD((rec.totalUSD || 0).toString());
    setEditServicesModalOpen(true);
  };

  const handleSaveEditServices = (e) => {
    e.preventDefault();
    if (!recordToEditServices) return;
    const newTotalUSD = parseFloat(editTotalUSD) !== undefined && !isNaN(parseFloat(editTotalUSD)) ? parseFloat(editTotalUSD) : (recordToEditServices.totalUSD || 0);
    const rate = exchangeRate || 40.50;
    const newTotalBs = newTotalUSD * rate;
    const isPaid = recordToEditServices.paymentStatus === 'paid';
    const amountPaidUSD = isPaid ? newTotalUSD : (recordToEditServices.amountPaidUSD || 0);
    const debtUSD = Math.max(0, newTotalUSD - amountPaidUSD);

    updateDailyRecord(recordToEditServices.id, {
      washCount: editWashCount,
      dryCount: editDryCount,
      soapCount: editSoapCount,
      laborCount: editLaborCount,
      softenerCount: editSoftenerCount,
      bleachCount: editBleachCount,
      degreaserCount: editDegreaserCount,
      totalUSD: newTotalUSD,
      totalBs: newTotalBs,
      amountPaidUSD,
      amountPaidBs: amountPaidUSD * rate,
      debtUSD,
      notes: (editBleachCount > 0 || editDegreaserCount > 0)
        ? `${editWashCount} Cesta(s) (${editWashCount} lav, ${editDryCount} sec)${editBleachCount > 0 ? ` + ${editBleachCount} Cloro ($${(editBleachCount * (prices.bleach || 0.50)).toFixed(2)})` : ''}${editDegreaserCount > 0 ? ` + ${editDegreaserCount} Desengrasante ($${(editDegreaserCount * (prices.degreaser || 0.50)).toFixed(2)})` : ''}`
        : (recordToEditServices.notes || `${editWashCount} Cesta(s) (${editWashCount} lav, ${editDryCount} sec)`)
    });

    setInlineSuccessToast(`✅ Servicios actualizados para "${recordToEditServices.customerName}": L:${editWashCount} · S:${editDryCount} · J:${editSoapCount} · Suav:${editSoftenerCount}${editBleachCount > 0 ? ` · Cl:${editBleachCount}` : ''}${editDegreaserCount > 0 ? ` · Des:${editDegreaserCount}` : ''}`);
    setTimeout(() => setInlineSuccessToast(''), 4000);
    setEditServicesModalOpen(false);
    setRecordToEditServices(null);
  };

  // Manejador para carga directa e instantánea en barra de mostrador
  const handleInlineQuickAdd = (e) => {
    e.preventDefault();
    if (!inlineClientName.trim()) {
      alert('Por favor indica el nombre del cliente');
      return;
    }

    const rate = exchangeRate || 40.50;
    // Calcular USD y Bs según moneda de entrada elegida
    let numUSD, numBs;
    if (inlineCurrencyMode === 'BS') {
      numBs  = parseFloat(inlineAmountUSD) || 0; // el campo "inlineAmountUSD" contiene Bs cuando modo=BS
      numUSD = numBs / rate;
    } else {
      numUSD = parseFloat(inlineAmountUSD) || 0;
      numBs  = numUSD * rate;
    }
    const isPending = inlinePayMethod === 'pending';

    let finalWash = inlineWashCount;
    let finalDry = inlineDryCount;
    let finalSoap = inlineSoapCount;
    let finalLabor = inlineLaborCount;
    let finalSoftener = inlineSoftenerCount;
    let finalBleach = inlineBleachCount;
    let finalDegreaser = inlineDegreaserCount;

    let notesText = inlineNotes.trim();
    if (!notesText) {
      if (finalDry === 0 && finalWash > 0) {
        notesText = `${finalWash} Cesta(s) (Solo Lavado + Jabón)`;
      } else if (finalWash === 0 && finalDry > 0) {
        notesText = `${finalDry} Cesta(s) (Solo Secado)`;
      } else if (finalWash === finalDry) {
        notesText = `${finalWash} Cesta(s) (${finalWash} lav, ${finalDry} sec)`;
      } else {
        notesText = `${Math.max(finalWash, finalDry)} Cesta(s) (${finalWash} lav, ${finalDry} sec)`;
      }
      if (finalBleach > 0) notesText += ` + ${finalBleach} Cloro`;
      if (finalDegreaser > 0) notesText += ` + ${finalDegreaser} Desengrasante`;
    }

    addDailyRecord({
      date: selectedDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: inlineClientName.trim(),
      customerCedula: inlineClientCedula.trim(),
      customerPhone: inlineClientPhone.trim(),
      washCount: finalWash,
      dryCount: finalDry,
      soapCount: finalSoap,
      laborCount: finalLabor,
      softenerCount: finalSoftener,
      bleachCount: finalBleach,
      degreaserCount: finalDegreaser,
      totalUSD: numUSD,
      totalBs: numBs,
      amountPaidUSD: isPending ? 0 : numUSD,
      amountPaidBs:  isPending ? 0 : numBs,
      debtUSD: isPending ? numUSD : 0,
      paymentStatus: isPending ? 'pending' : 'paid',
      paymentMethod: isPending ? 'usd_cash' : inlinePayMethod,
      inputCurrency: inlineCurrencyMode, // registrar en qué moneda se ingresó
      bankReference: inlineBankRef.trim() || (inlinePayMethod === 'usd_cash' ? 'Efectivo $' : inlinePayMethod === 'bs_cash' ? 'Efectivo Bs' : isPending ? 'Debe al retirar' : 'Comprobante mostrador'),
      deliveryStatus: 'in_store',
      origin: 'walk_in',
      intakeStatus: 'confirmed',
      notes: notesText
    });

    setInlineSuccessToast(`✅ "${inlineClientName.trim()}" registrado · ${finalWash} Cesta(s)${finalBleach > 0 ? ` + ${finalBleach} Cloro` : ''}${finalDegreaser > 0 ? ` + ${finalDegreaser} Deseng` : ''} · $${numUSD.toFixed(2)} USD ≈ Bs. ${numBs.toLocaleString('es-VE', {minimumFractionDigits:2})}`);
    setTimeout(() => setInlineSuccessToast(''), 4000);

    setInlineClientName('');
    setInlineClientCedula('');
    setInlineClientPhone('');
    setInlineMatchedCustomer(null);
    setInlineShowCedulaSuggestions(false);
    setInlineShowNameSuggestions(false);
    setInlineBaskets(1);
    setInlineWashCount(1);
    setInlineDryCount(1);
    setInlineSoapCount(1);
    setInlineLaborCount(1);
    setInlineSoftenerCount(1);
    setInlineBleachCount(0);
    setInlineDegreaserCount(0);
    setInlineAmountUSD('7.50');
    setInlineBankRef('');
    setInlineNotes('');
    setInlinePayMethod('usd_cash');
    setInlineServiceType('combo');
    setOriginFilter('all');
  };

  // Botones de presets rápidos para mostrador
  const applyPreset = (presetName) => {
    if (presetName === 'combo1') {
      setWashCount(1);
      setDryCount(1);
      setSoapCount(1);
      setLaborCount(1);
      setSoftenerCount(1);
      setBleachCount(0);
      setDegreaserCount(0);
      setManualTotalUSD('7.50');
      setNotes('1 Cesta Completa Combo ($7.50)');
    } else if (presetName === 'combo2') {
      setWashCount(2);
      setDryCount(2);
      setSoapCount(2);
      setLaborCount(2);
      setSoftenerCount(2);
      setBleachCount(0);
      setDegreaserCount(0);
      setManualTotalUSD('15.00');
      setNotes('2 Cestas Completas Combo ($15.00)');
    } else if (presetName === 'lavado_jabon') {
      setWashCount(1);
      setDryCount(0);
      setSoapCount(1);
      setLaborCount(1);
      setSoftenerCount(0);
      setBleachCount(0);
      setDegreaserCount(0);
      setManualTotalUSD('4.50');
      setNotes('Solo Lavado + Jabón ($4.50)');
    } else if (presetName === 'edredon_ind') {
      setWashCount(1);
      setDryCount(1);
      setSoapCount(1);
      setLaborCount(1);
      setSoftenerCount(1);
      setManualTotalUSD('10.00');
      setNotes('Edredón Individual ($10.00)');
    } else if (presetName === 'edredon_mat') {
      setWashCount(1);
      setDryCount(1);
      setSoapCount(1);
      setLaborCount(1);
      setSoftenerCount(1);
      setManualTotalUSD('12.00');
      setNotes('Edredón Matrimonial ($12.00)');
    } else if (presetName === 'edredon_grande') {
      setWashCount(1);
      setDryCount(1);
      setSoapCount(1);
      setLaborCount(1);
      setSoftenerCount(1);
      setManualTotalUSD('14.00');
      setNotes('Edredón Matrimonial Grande ($14.00)');
    } else if (presetName === 'forros_bus') {
      setWashCount(4);
      setDryCount(4);
      setSoapCount(4);
      setLaborCount(4);
      setSoftenerCount(4);
      setManualTotalUSD('32.00');
      setNotes('Forros de Autobús completos con bolsas ($32.00)');
    }
  };

  // Abrir modal de recepción para pedidos desde la App
  const openIntakeModal = (rec) => {
    setRecordForIntake(rec);
    setIntakeBaskets(rec.washCount || 1);
    setIntakeBleach(rec.bleachCount || 0);
    setIntakeDegreaser(rec.degreaserCount || 0);
    setIntakePaymentStatus(rec.paymentStatus || 'paid');
    setIntakePaymentMethod(rec.paymentMethod || 'pago_movil');
    setIntakeBankRef(rec.bankReference && rec.bankReference !== 'Pedido por App' && rec.bankReference !== 'Pedido Web' ? rec.bankReference : '');
    setIntakeNotes(rec.notes || '');
    setIntakeCedula(rec.customerCedula || '');
    setIntakeModalOpen(true);
  };

  // Confirmar recepción física de prendas y ajustar cestas si pesaron más/menos
  const handleConfirmIntake = (e) => {
    e.preventDefault();
    if (!recordForIntake) return;

    let unitPrice = prices.comboFull || 7.50;
    let adjustedTotalUSD = (intakeBaskets * unitPrice) + (intakeBleach * 0.50) + (intakeDegreaser * 0.50);
    let adjustedTotalBs = adjustedTotalUSD * (exchangeRate || 40.50);

    let paidUSD = intakePaymentStatus === 'paid' ? adjustedTotalUSD : 0;
    let debtUSD = intakePaymentStatus === 'paid' ? 0 : adjustedTotalUSD;

    updateDailyRecord(recordForIntake.id, {
      customerCedula: intakeCedula.trim(),
      washCount: intakeBaskets,
      dryCount: intakeBaskets,
      soapCount: intakeBaskets,
      laborCount: intakeBaskets,
      softenerCount: intakeBaskets,
      bleachCount: intakeBleach,
      degreaserCount: intakeDegreaser,
      totalUSD: adjustedTotalUSD,
      totalBs: adjustedTotalBs,
      amountPaidUSD: paidUSD,
      amountPaidBs: paidUSD * (exchangeRate || 40.50),
      debtUSD: debtUSD,
      paymentStatus: intakePaymentStatus,
      paymentMethod: intakePaymentMethod,
      bankReference: intakeBankRef.trim() || (intakePaymentMethod === 'usd_cash' ? 'Efectivo $' : 'Pendiente'),
      intakeStatus: 'confirmed',
      notes: `${intakeNotes} · [Mostrador: ${intakeBaskets} cesta(s) verificadas]`
    });

    setIntakeModalOpen(false);
    setRecordForIntake(null);
    alert('✅ Recepción de prendas y ajuste de cestas guardado en el cuaderno diario.');
  };

  // Manejador para Borrado Protegido con Auditoría
  const handleConfirmDelete = (e) => {
    e.preventDefault();
    if (!recordToDelete) return;

    setDeleteErrorMsg('');
    const result = deleteRecordWithAudit(
      recordToDelete.id, 
      adminPasswordInput, 
      deleteReasonInput, 
      'Encargada / Puesto de Trabajo'
    );

    if (result.success) {
      setDeleteModalOpen(false);
      setRecordToDelete(null);
      setAdminPasswordInput('');
      setDeleteReasonInput('');
      setDeleteErrorMsg('');
      alert('✅ Registro eliminado y registrado en la bitácora de auditoría del administrador.');
    } else {
      setDeleteErrorMsg(result.message);
    }
  };

  // Manejador para Cobrar y Entregar
  const handleConfirmPaymentAndDelivery = (e) => {
    e.preventDefault();
    if (!recordToPay) return;

    markRecordPaid(recordToPay.id, {
      paymentMethod: payMethodSelect,
      bankReference: payRefInput.trim() || 'Cobrado en mostrador al retirar',
      notes: `Deuda de $${recordToPay.debtUSD.toFixed(2)} liquidada al retirar el ${new Date().toISOString().split('T')[0]}`
    });

    markRecordDelivered(recordToPay.id);

    setPayModalOpen(false);
    setRecordToPay(null);
    setPayRefInput('');
    alert('✅ Pago procesado y ropa marcada como entregada.');
  };

  // Registros filtrados por fecha seleccionada con protección contra nulos
  const safeDailyRecords = (dailyRecords || []).filter(r => r && typeof r === 'object');
  const safeClosures = (dailyClosures || []).filter(c => c && typeof c === 'object');
  const recordsOfSelectedDate = safeDailyRecords.filter(r => r.date === selectedDate);
  const searchedRecords = recordsOfSelectedDate.filter(r => {
    const nameMatch = (r.customerName || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const refMatch = r.bankReference ? String(r.bankReference).toLowerCase().includes((searchTerm || '').toLowerCase()) : false;
    const notesMatch = r.notes ? String(r.notes).toLowerCase().includes((searchTerm || '').toLowerCase()) : false;
    return nameMatch || refMatch || notesMatch;
  });

  const appOrdersCount = recordsOfSelectedDate.filter(r => r.origin === 'app').length;
  const pendingAppOrdersCount = recordsOfSelectedDate.filter(r => r.origin === 'app' && r.intakeStatus === 'pending_intake').length;
  const walkInCount = recordsOfSelectedDate.filter(r => r.origin !== 'app').length;

  const filteredByOrigin = searchedRecords.filter(r => {
    if (originFilter === 'app') return r.origin === 'app';
    if (originFilter === 'walk_in') return r.origin !== 'app';
    return true;
  });

  // ====== ESTADÍSTICAS DEL CIERRE DIARIO ======
  const rate = exchangeRate || 40.50;

  // Cierre existente para la fecha seleccionada
  const existingClosure = safeClosures.find(c => c && c.date === selectedDate);
  const isDayClosed = !!(existingClosure?.isClosed);

  // Ropa nueva del día seleccionado (creada en selectedDate) que ya pagó
  const newDayRecords = recordsOfSelectedDate.filter(r => r.paymentStatus === 'paid' || r.paymentStatus === 'partial');
  const newDayPagoMovil = newDayRecords.filter(r => r.paymentMethod === 'pago_movil' || r.paymentMethod === 'transfer');
  const newDayEfectivoUSD = newDayRecords.filter(r => r.paymentMethod === 'usd_cash');
  const newDayEfectivoBs  = newDayRecords.filter(r => r.paymentMethod === 'bs_cash');

  const newPagoMovilBs  = newDayPagoMovil.reduce((a, r) => a + (r.amountPaidBs || 0), 0);
  const newPagoMovilUSD = newDayPagoMovil.reduce((a, r) => a + (r.amountPaidUSD || 0), 0);
  const newEfectivoUSD  = newDayEfectivoUSD.reduce((a, r) => a + (r.amountPaidUSD || 0), 0);
  const newEfectivoBs   = newDayEfectivoBs.reduce((a, r) => a + (r.amountPaidBs || 0), 0);
  const newTotalUSD     = newDayRecords.reduce((a, r) => a + (r.amountPaidUSD || 0), 0);
  const newTotalBs      = newDayRecords.reduce((a, r) => a + (r.amountPaidBs || 0), 0);
  const newPendienteUSD = recordsOfSelectedDate.filter(r => r.paymentStatus === 'pending').reduce((a, r) => a + (r.totalUSD || 0), 0);

  // Ropa del DEPÓSITO (de días anteriores) que fue COBRADA/ENTREGADA HOY
  // = registros creados ANTES del selectedDate, con paymentDate = selectedDate o deliveredDate = selectedDate
  const depositoEntregadoHoy = safeDailyRecords.filter(r => {
    if (r.date === selectedDate) return false; // solo las de días anteriores
    const cobradaHoy = r.paymentDate === selectedDate || r.deliveredDate === selectedDate;
    const fueEntregada = r.deliveryStatus === 'delivered' && (r.deliveredDate === selectedDate);
    const fuePagada    = r.paymentStatus === 'paid' && r.paymentDate === selectedDate;
    return cobradaHoy || fueEntregada || fuePagada;
  });
  const depPagoMovil  = depositoEntregadoHoy.filter(r => r.paymentMethod === 'pago_movil' || r.paymentMethod === 'transfer');
  const depEfectivoUSD = depositoEntregadoHoy.filter(r => r.paymentMethod === 'usd_cash');
  const depEfectivoBs  = depositoEntregadoHoy.filter(r => r.paymentMethod === 'bs_cash');
  const depPagoMovilBs  = depPagoMovil.reduce((a, r) => a + (r.amountPaidBs || 0), 0);
  const depPagoMovilUSD = depPagoMovil.reduce((a, r) => a + (r.amountPaidUSD || 0), 0);
  const depEfUSD        = depEfectivoUSD.reduce((a, r) => a + (r.amountPaidUSD || 0), 0);
  const depEfBs         = depEfectivoBs.reduce((a, r) => a + (r.amountPaidBs || 0), 0);
  const depTotalUSD     = depositoEntregadoHoy.reduce((a, r) => a + (r.amountPaidUSD || 0), 0);
  const depTotalBs      = depositoEntregadoHoy.reduce((a, r) => a + (r.amountPaidBs || 0), 0);

  // PERCIBIDO DEL DÍA = nuevo + depósito cobrado hoy
  const percibidoTotalUSD = newTotalUSD + depTotalUSD;
  const percibidoTotalBs  = newTotalBs  + depTotalBs;
  const percibidoPagoMovilBs  = newPagoMovilBs  + depPagoMovilBs;
  const percibidoPagoMovilUSD = newPagoMovilUSD + depPagoMovilUSD;
  const percibidoEfectivoUSD  = newEfectivoUSD  + depEfUSD;
  const percibidoEfectivoBs   = newEfectivoBs   + depEfBs;

  // legacy compat (para la pestaña closure y WhatsApp)
  const totalCobradoUSD = newTotalUSD;
  const totalCobradoBs  = newTotalBs;
  const totalPagoMovilBs = percibidoPagoMovilBs;
  const totalPagoMovilUSD = percibidoPagoMovilUSD;
  const totalEfectivoUSD = percibidoEfectivoUSD;
  const totalEfectivoBs  = percibidoEfectivoBs;
  const totalEfectivoBsEnUSD = percibidoEfectivoBs / rate;

  // Handler para confirmar cierre del día
  const handleConfirmClosure = () => {
    saveDailyClosure({
      date: selectedDate,
      // Ropa nueva del día
      newCobradoUSD: newTotalUSD,
      newCobradoBs:  newTotalBs,
      newPagoMovilBs, newPagoMovilUSD,
      newEfectivoUSD, newEfectivoBs,
      newPendienteUSD,
      newCount: newDayRecords.length,
      // Depósito cobrado hoy
      depTotalUSD, depTotalBs,
      depPagoMovilBs, depPagoMovilUSD,
      depEfUSD, depEfBs,
      depCount: depositoEntregadoHoy.length,
      // Totales percibidos
      cobradoUSD: percibidoTotalUSD,
      cobradoBs:  percibidoTotalBs,
      pagoMovilBs:  percibidoPagoMovilBs,
      pagoMovilUSD: percibidoPagoMovilUSD,
      divisasEfectivoUSD: percibidoEfectivoUSD,
      efectivoBs: percibidoEfectivoBs,
      efectivoUSD: percibidoEfectivoBs / rate,
      notes: closureConfirmNotes.trim(),
      closedBy: 'Personal LAV',
      closedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setClosureModalOpen(false);
    setClosureConfirmNotes('');
  };

  // Generar mensaje de WhatsApp para el cierre del día
  const generateClosureWhatsApp = () => {
    const lines = [];
    lines.push('🧼 *CIERRE DE CAJA - LAVANDERÍA AJ*');
    lines.push(`📅 *Fecha:* ${selectedDate}`);
    lines.push(`🕒 *Hora:* ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    lines.push('────────────────────────');
    lines.push(`📋 *Ropa del Día (${newDayRecords.length} servicios):* $${newTotalUSD.toFixed(2)} USD`);
    if (depositoEntregadoHoy.length > 0)
      lines.push(`🏪 *Depósito Cobrado Hoy (${depositoEntregadoHoy.length}):* $${depTotalUSD.toFixed(2)} USD`);
    lines.push('────────────────────────');
    lines.push(`📲 *Pago Móvil:* Bs. ${percibidoPagoMovilBs.toLocaleString('es-VE')} ($${percibidoPagoMovilUSD.toFixed(2)})`);
    lines.push(`💵 *Divisas Efectivo:* $${percibidoEfectivoUSD.toFixed(2)}`);
    lines.push(`🇻🇪 *Efectivo Bs:* Bs. ${percibidoEfectivoBs.toLocaleString('es-VE')} ($${(percibidoEfectivoBs/rate).toFixed(2)})`);
    lines.push('────────────────────────');
    lines.push(`✅ *TOTAL PERCIBIDO:* $${percibidoTotalUSD.toFixed(2)} USD`);
    lines.push(`   Bs. ${percibidoTotalBs.toLocaleString('es-VE')}`);
    if (closureConfirmNotes) lines.push(`📝 *Nota:* ${closureConfirmNotes}`);
    lines.push('');
    lines.push('Sistema PWA - Lavandería AJ');
    return encodeURIComponent(lines.join('\n'));
  };

  // Listado de Ropa Dejada (en depósito)
  const storedClothesRecords = dailyRecords.filter(r => r.deliveryStatus === 'in_store');

  return (
    <div className="space-y-6">
      
      {/* Top Banner de Personal LAV */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-950 to-slate-900 p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-800 w-full max-w-full overflow-hidden">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-500/30">
              <BookOpen size={14} className="text-cyan-400" />
              <span>Puesto de Trabajo · Personal LAV</span>
            </div>
            {isCloudConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-300 text-xs font-black border border-emerald-400/40 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>🟢 Nube Activa (Sincronizado)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/30 text-amber-300 text-xs font-black border border-amber-400/40">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>🟡 Modo Local (Sin sincronizar con laptop)</span>
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight">
            Gestión Diaria de Clientes y Caja
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Digitalización del cuaderno físico de Lavandería AJ. Carga de prendas, abonos, ropa en depósito y cierres.
          </p>

          {/* Tasa Oficial BCV en Personal LAV */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-blue-800/80 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-300 font-extrabold uppercase tracking-wider text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Tasa Oficial BCV:</span>
            </span>
            <span className="font-mono font-bold text-white">
              💵 $ 1 = <strong className="text-emerald-300">Bs. {exchangeRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </span>
            <span className="text-blue-400/60">•</span>
            <span className="font-mono font-bold text-white">
              💶 € 1 = <strong className="text-cyan-300">Bs. {(euroRate || 972.65).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </span>
            <button
              type="button"
              onClick={() => fetchBcvRates()}
              disabled={bcvLoading}
              title="Actualizar tasa BCV oficial ahora"
              className="p-1 rounded-md text-cyan-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={12} className={bcvLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              setShowAddModal(true);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={18} />
            <span>Anotar Cliente en Mostrador</span>
          </button>
        </div>
      </div>

      {/* BANNER DE AVISO: PEDIDOS RECIBIDOS DESDE LA APP WEB */}
      {pendingAppOrdersCount > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-blue-500/40 animate-in fade-in duration-200 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Smartphone size={22} className="text-cyan-200" />
            </div>
            <div>
              <p className="font-black text-sm sm:text-base flex items-center gap-2">
                <span>¡Hay {pendingAppOrdersCount} pedido(s) recibido(s) desde la App Web esperando ropa!</span>
              </p>
              <p className="text-xs text-blue-100 mt-0.5">
                Los clientes cotizaron sus prendas desde la app. Cuando lleguen al mostrador, presiona <strong>"⚖️ Recibir Ropa / Ajustar"</strong> para verificar las cestas y confirmar.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('daily_log');
              setOriginFilter('app');
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-blue-800 font-black text-xs uppercase shadow-sm hover:bg-blue-50 transition-all shrink-0 active:scale-95 text-center"
          >
            Ver Pedidos de la App ({pendingAppOrdersCount})
          </button>
        </div>
      )}

      {/* Selector de Pestañas Principales */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-blue-200/80 pb-3 overflow-x-auto no-scrollbar sm:flex-wrap w-full max-w-full">
        <button
          onClick={() => setActiveTab('daily_log')}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === 'daily_log'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <FileText size={15} />
          <span>📝 Cuaderno Diario ({recordsOfSelectedDate.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stored_clothes')}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === 'stored_clothes'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <Package size={15} />
          <span>🧺 Depósito ({storedClothesRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('detergents')}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === 'detergents'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <Droplets size={15} />
          <span>🧴 Insumos ({detergentLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('closure')}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
            activeTab === 'closure'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-blue-50 border border-slate-200'
          }`}
        >
          <DollarSign size={15} />
          <span>📊 Cierre de Caja</span>
        </button>
      </div>

      {/* PESTAÑA 1: CUADERNO DIARIO (REGISTRO POR FILAS) */}
      {activeTab === 'daily_log' && (
        <div className="space-y-4">

          {/* Toast de confirmación al cargar cliente */}
          {inlineSuccessToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs shadow-md flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 size={18} />
              <span>{inlineSuccessToast}</span>
            </div>
          )}

          {/* BARRA DIRECTA DE CARGA EN MOSTRADOR */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-blue-200 shadow-md w-full max-w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3 border-b border-blue-50 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm shrink-0">
                  ⚡
                </span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-none">
                    Carga Directa en Mostrador
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ingresa los datos del cliente, monto y forma de pago al instante
                  </p>
                </div>
              </div>

              {/* Botón para abrir el formulario con desglose completo */}
              <button
                type="button"
                onClick={() => {
                  setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                  setShowAddModal(true);
                }}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-extrabold flex items-center gap-1 hover:underline self-start sm:self-auto"
              >
                <span>+ Abrir Formulario Detallado</span>
              </button>
            </div>

            {/* Banner de Reconocimiento si el cliente ya está registrado en el sistema */}
            {inlineMatchedCustomer && (
              <div className="mb-3 p-2.5 px-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs shadow-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    ✓
                  </span>
                  <span className="font-black text-emerald-900">
                    ¡Cliente Registrado!
                  </span>
                  <span className="font-bold text-emerald-800">
                    {inlineMatchedCustomer.name}
                  </span>
                  {inlineMatchedCustomer.cedula && (
                    <span className="font-mono text-[11px] bg-emerald-100/90 px-1.5 py-0.5 rounded text-emerald-900 font-bold border border-emerald-200">
                      🪪 {inlineMatchedCustomer.cedula}
                    </span>
                  )}
                  {inlineMatchedCustomer.phone && (
                    <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                      📞 {inlineMatchedCustomer.phone}
                    </span>
                  )}
                  {inlineMatchedCustomer.visits > 1 && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-200">
                      ⭐ {inlineMatchedCustomer.visits} visitas
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setInlineMatchedCustomer(null);
                    setInlineClientCedula('');
                    setInlineClientName('');
                    setInlineClientPhone('');
                  }}
                  className="text-[11px] text-emerald-700 hover:text-emerald-950 font-bold hover:underline shrink-0 ml-2"
                >
                  ✕ Limpiar / Nuevo
                </button>
              </div>
            )}

            <form onSubmit={handleInlineQuickAdd} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5 items-start">
                {/* 0. Cédula del Cliente con autocompletado */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cédula / C.I.:
                  </label>
                  <input
                    type="text"
                    value={inlineClientCedula}
                    onChange={(e) => handleInlineCedulaChange(e.target.value)}
                    onFocus={() => {
                      setInlineShowCedulaSuggestions(true);
                      setInlineShowNameSuggestions(false);
                    }}
                    placeholder="Ej: V-18452331"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-base sm:text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  {/* Desplegable de sugerencias por Cédula */}
                  {inlineShowCedulaSuggestions && inlineClientCedula.trim().length >= 2 && getCedulaMatches(inlineClientCedula).length > 0 && (
                    <div className="absolute top-full left-0 z-40 mt-1 w-64 bg-white border border-blue-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100">
                      <div className="p-1.5 px-2.5 bg-blue-50 text-[10px] font-bold text-blue-900 flex justify-between items-center">
                        <span>✨ Clientes con esta Cédula:</span>
                        <button type="button" onClick={() => setInlineShowCedulaSuggestions(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
                      </div>
                      {getCedulaMatches(inlineClientCedula).map((client, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectCustomerInline(client)}
                          className="w-full text-left p-2 hover:bg-blue-50/70 transition-colors flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{client.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">🪪 {client.cedula}</div>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Usar ➔
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 1. Nombre del Cliente con autocompletado */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cliente *:
                  </label>
                  <input
                    type="text"
                    required
                    value={inlineClientName}
                    onChange={(e) => handleInlineNameChange(e.target.value)}
                    onFocus={() => {
                      setInlineShowNameSuggestions(true);
                      setInlineShowCedulaSuggestions(false);
                    }}
                    placeholder="Ej: Albert, Jenny..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-base sm:text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  {/* Desplegable de sugerencias por Nombre */}
                  {inlineShowNameSuggestions && inlineClientName.trim().length >= 2 && getNameMatches(inlineClientName).length > 0 && (
                    <div className="absolute top-full left-0 z-40 mt-1 w-64 bg-white border border-blue-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100">
                      <div className="p-1.5 px-2.5 bg-blue-50 text-[10px] font-bold text-blue-900 flex justify-between items-center">
                        <span>✨ Clientes existentes:</span>
                        <button type="button" onClick={() => setInlineShowNameSuggestions(false)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
                      </div>
                      {getNameMatches(inlineClientName).map((client, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectCustomerInline(client)}
                          className="w-full text-left p-2 hover:bg-blue-50/70 transition-colors flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{client.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {client.cedula ? `🪪 ${client.cedula}` : ''} {client.phone ? `📞 ${client.phone}` : ''}
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Usar ➔
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Teléfono */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono (Opcional):
                  </label>
                  <input
                    type="tel"
                    value={inlineClientPhone}
                    onChange={(e) => setInlineClientPhone(e.target.value)}
                    placeholder="Ej: 0412..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-base sm:text-xs font-mono text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {/* 3. Selector de Cestas */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    🧺 Cestas:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleInlineBasketsChange(inlineBaskets - 1)}
                      className="w-9 h-10 sm:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-lg flex items-center justify-center border border-slate-200 transition-colors shrink-0"
                      title="Restar una cesta"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center bg-blue-50 border border-blue-200 rounded-xl py-1.5 px-2">
                      <span className="font-black text-blue-950 text-sm leading-tight block">{inlineBaskets}</span>
                      <span className="text-[10px] text-blue-700 font-bold block leading-none">cesta{inlineBaskets > 1 ? 's' : ''}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInlineBasketsChange(inlineBaskets + 1)}
                      className="w-9 h-10 sm:h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg flex items-center justify-center shadow-xs transition-colors shrink-0"
                      title="Sumar una cesta"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 4. Monto con toggle $ / Bs */}
                <div>
                  <label className="block text-xs font-bold mb-1" style={{color: inlineCurrencyMode === 'BS' ? '#854d0e' : '#1e3a8a'}}>
                    Monto {inlineCurrencyMode === 'BS' ? 'en Bolívares (Bs.)' : 'en Dólares ($ USD)'} *:
                  </label>
                  <div className="flex gap-1.5">
                    {/* Toggle moneda */}
                    <button
                      type="button"
                      onClick={() => { setInlineCurrencyMode(inlineCurrencyMode === 'USD' ? 'BS' : 'USD'); setInlineAmountUSD(''); }}
                      className={`px-3 py-2.5 sm:py-2 rounded-xl text-sm sm:text-xs font-black border shrink-0 transition-all ${inlineCurrencyMode === 'USD' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-amber-500 text-white border-amber-500 shadow-xs'}`}
                      title="Cambiar moneda de entrada"
                    >
                      {inlineCurrencyMode === 'USD' ? '💵 $' : '🇻🇪 Bs'}
                    </button>
                    <input
                      type="number"
                      step="any"
                      required
                      value={inlineAmountUSD}
                      onChange={(e) => setInlineAmountUSD(e.target.value)}
                      placeholder={inlineCurrencyMode === 'BS' ? 'Ej: 6420' : '7.50'}
                      className={`w-full px-3.5 py-2.5 sm:py-2 rounded-xl text-base sm:text-xs font-mono font-black focus:outline-none focus:ring-2 ${inlineCurrencyMode === 'BS' ? 'border border-amber-400 bg-amber-50/50 text-amber-950 focus:ring-amber-400' : 'border border-blue-300 bg-blue-50/50 text-blue-950 focus:ring-blue-500'}`}
                    />
                  </div>
                  {/* Conversión automática */}
                  {inlineCurrencyMode === 'USD' ? (
                    <span className="text-xs text-blue-700 font-bold block mt-1">
                      ≈ Bs. {((parseFloat(inlineAmountUSD) || 0) * (exchangeRate || 1)).toLocaleString('es-VE', { minimumFractionDigits: 2 })} <span className="text-slate-400 font-normal lowercase select-none">+ iva</span>
                    </span>
                  ) : (
                    <span className="text-xs text-amber-700 font-bold block mt-1">
                      ≈ $ {((parseFloat(inlineAmountUSD) || 0) / (exchangeRate || 1)).toFixed(2)} USD <span className="text-slate-400 font-normal lowercase select-none">+ iva</span>
                    </span>
                  )}
                </div>

                {/* 5. Forma de Pago */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Forma de Pago:
                  </label>
                  <select
                    value={inlinePayMethod}
                    onChange={(e) => setInlinePayMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-sm sm:text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:bg-white transition-all"
                  >
                    <option value="usd_cash">💵 Efectivo USD ($)</option>
                    <option value="pago_movil">📱 Pago Móvil</option>
                    <option value="bs_cash">🇻🇪 Efectivo Bs</option>
                    <option value="pending">⏳ Ropa Dejada (Paga al retirar)</option>
                  </select>
                </div>

                {/* 6. Referencia y Botón Guardar */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Referencia / RF:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inlineBankRef}
                      onChange={(e) => setInlineBankRef(e.target.value)}
                      placeholder="Ej: RF 1234"
                      className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-base sm:text-xs font-mono text-slate-900 bg-slate-50 focus:outline-none focus:bg-white transition-all"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm sm:text-xs uppercase shadow-md flex items-center justify-center gap-1.5 shrink-0 transition-transform active:scale-95"
                    >
                      <Plus size={18} />
                      <span>Cargar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Selector de Tipo de Servicio (Presets) */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <span>⚡ Servicio Base:</span>
                    <span className="text-[10px] font-normal text-slate-400">({inlineBaskets} cesta{inlineBaskets > 1 ? 's' : ''})</span>
                  </span>
                  {inlineServiceType === 'custom' && (
                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                      🛠️ Personalizado libre
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => selectInlineServiceType('combo')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all ${
                      inlineServiceType === 'combo'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-blue-50/70 hover:bg-blue-100 text-blue-900 border-blue-200'
                    }`}
                  >
                    ⭐ Combo Completo ($7.50)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectInlineServiceType('lavado_jabon')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all ${
                      inlineServiceType === 'lavado_jabon'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                    }`}
                  >
                    🫧 Solo Lavado + Jabón ($4.50)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectInlineServiceType('solo_secado')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all ${
                      inlineServiceType === 'solo_secado'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                    }`}
                  >
                    💨 Solo Secado ($3.00)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectInlineServiceType('edredon_ind')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all ${
                      inlineServiceType === 'edredon_ind'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                    }`}
                  >
                    🛏️ Edredón Ind ($10)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectInlineServiceType('edredon_mat')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all ${
                      inlineServiceType === 'edredon_mat'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                    }`}
                  >
                    🛏️ Edredón Mat ($12)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectInlineServiceType('edredon_grande')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all ${
                      inlineServiceType === 'edredon_grande'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                    }`}
                  >
                    🛏️ Edredón Grande ($14)
                  </button>
                  <button
                    type="button"
                    onClick={() => selectInlineServiceType('forros_bus')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black border transition-all ${
                      inlineServiceType === 'forros_bus'
                        ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                        : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border-cyan-200'
                    }`}
                  >
                    🚌 Forros Bus ($32)
                  </button>
                </div>
              </div>

              {/* Barra de Ajuste Libre de Operaciones (Sumar o restar Secado, Lavado, Jabón, etc.) */}
              <div className="flex flex-col gap-2 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                    <span>🎛️ Operaciones del Ticket</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      (Suma o resta secado, lavado o adicionales a voluntad):
                    </span>
                  </div>
                  {(inlineWashCount !== inlineDryCount || inlineBleachCount > 0 || inlineDegreaserCount > 0 || inlineServiceType === 'custom') && (
                    <button
                      type="button"
                      onClick={() => selectInlineServiceType('combo', inlineBaskets)}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      Restablecer al combo base
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  {/* Stepper Lavado */}
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-all ${
                    inlineWashCount > 0 ? 'bg-white border-blue-300 text-slate-900 shadow-2xs' : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    <span className="text-xs font-bold mr-1">🫧 Lav:</span>
                    <button
                      type="button"
                      onClick={() => handleInlineServiceCountChange('wash', -1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center transition-colors active:scale-95"
                      title="Restar un lavado"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-xs w-5 text-center select-none text-blue-700">
                      {inlineWashCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInlineServiceCountChange('wash', +1)}
                      className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center transition-colors active:scale-95"
                      title="Sumar un lavado"
                    >
                      +
                    </button>
                  </div>

                  {/* Stepper Secado (Permite restar secado si una cesta no se seca) */}
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-all ${
                    inlineDryCount > 0 ? 'bg-white border-blue-300 text-slate-900 shadow-2xs' : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}>
                    <span className="text-xs font-bold mr-1">💨 Sec:</span>
                    <button
                      type="button"
                      onClick={() => handleInlineServiceCountChange('dry', -1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center transition-colors active:scale-95"
                      title="Restar un secado (ej: para cestas que solo se lavan)"
                    >
                      -
                    </button>
                    <span className={`font-mono font-black text-xs w-5 text-center select-none ${inlineDryCount === 0 ? 'text-amber-700' : 'text-blue-700'}`}>
                      {inlineDryCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInlineServiceCountChange('dry', +1)}
                      className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center transition-colors active:scale-95"
                      title="Sumar un secado"
                    >
                      +
                    </button>
                  </div>

                  {/* Stepper Jabón */}
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-all ${
                    inlineSoapCount > 0 ? 'bg-white border-blue-300 text-slate-900 shadow-2xs' : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    <span className="text-xs font-bold mr-1">🧼 Jab:</span>
                    <button
                      type="button"
                      onClick={() => handleInlineServiceCountChange('soap', -1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center transition-colors active:scale-95"
                      title="Restar jabón"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-xs w-5 text-center select-none text-blue-700">
                      {inlineSoapCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInlineServiceCountChange('soap', +1)}
                      className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center transition-colors active:scale-95"
                      title="Sumar jabón"
                    >
                      +
                    </button>
                  </div>

                  {/* Stepper Suavizante */}
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-all ${
                    inlineSoftenerCount > 0 ? 'bg-white border-purple-300 text-purple-950 shadow-2xs' : 'bg-slate-100 border-slate-200 text-slate-400'
                  }`}>
                    <span className="text-xs font-bold mr-1">🌸 Suav:</span>
                    <button
                      type="button"
                      onClick={() => handleInlineServiceCountChange('softener', -1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center transition-colors active:scale-95"
                      title="Restar suavizante"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-xs w-5 text-center select-none text-purple-700">
                      {inlineSoftenerCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInlineServiceCountChange('softener', +1)}
                      className="w-6 h-6 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-black text-sm flex items-center justify-center transition-colors active:scale-95"
                      title="Sumar suavizante"
                    >
                      +
                    </button>
                  </div>

                  {/* Stepper Cloro */}
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-all ${
                    inlineBleachCount > 0 ? 'bg-cyan-50 border-cyan-400 text-cyan-950 shadow-2xs' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <span className="text-xs font-bold mr-1">🧪 Cloro:</span>
                    <button
                      type="button"
                      onClick={() => handleInlineBleachChange(-1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center transition-colors active:scale-95"
                      title="Restar cloro"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-xs w-5 text-center select-none text-cyan-800">
                      {inlineBleachCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInlineBleachChange(+1)}
                      className="w-6 h-6 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-black text-sm flex items-center justify-center transition-colors active:scale-95"
                      title="Sumar cloro (+$0.50)"
                    >
                      +
                    </button>
                  </div>

                  {/* Stepper Desengrasante */}
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-all ${
                    inlineDegreaserCount > 0 ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-2xs' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <span className="text-xs font-bold mr-1">🧽 Deseng:</span>
                    <button
                      type="button"
                      onClick={() => handleInlineDegreaserChange(-1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center transition-colors active:scale-95"
                      title="Restar desengrasante"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-xs w-5 text-center select-none text-amber-800">
                      {inlineDegreaserCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleInlineDegreaserChange(+1)}
                      className="w-6 h-6 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-black text-sm flex items-center justify-center transition-colors active:scale-95"
                      title="Sumar desengrasante (+$0.50)"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Resumen dinámico que se guardará en el Cuaderno */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5 font-bold text-slate-700">
                    <span className="text-[11px] text-slate-500 mr-0.5">Se anotará:</span>
                    <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-blue-700 font-black">🫧 L: {inlineWashCount}</span>
                    <span className={`px-2 py-0.5 rounded-lg border font-black ${inlineDryCount === 0 ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-blue-700'}`}>
                      💨 S: {inlineDryCount}
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-blue-700 font-black">🧼 J: {inlineSoapCount}</span>
                    <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-blue-700 font-black">✋ MO: {inlineLaborCount}</span>
                    <span className="bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-purple-700 font-black">🌸 Suav: {inlineSoftenerCount}</span>
                    {inlineBleachCount > 0 && (
                      <span className="bg-cyan-100 px-2 py-0.5 rounded-lg border border-cyan-300 text-cyan-900 font-black">🧪 Cl: {inlineBleachCount}</span>
                    )}
                    {inlineDegreaserCount > 0 && (
                      <span className="bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300 text-amber-900 font-black">🧽 Des: {inlineDegreaserCount}</span>
                    )}
                  </div>
                  {inlineWashCount !== inlineDryCount && (
                    <span className="text-[11px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg">
                      {inlineWashCount > inlineDryCount ? `⚠️ ${inlineWashCount - inlineDryCount} cesta(s) sin secar` : `⚠️ ${inlineDryCount - inlineWashCount} secado(s) adicional(es)`}
                    </span>
                  )}
                </div>
              </div>
            </form>
          </div>
          
          {/* ── BANNER: DÍA CERRADO ── */}
          {isDayClosed && !postClosureUnlocked && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                <div>
                  <p className="text-xs font-black">Cierre del {selectedDate} confirmado</p>
                  <p className="text-[11px] text-emerald-700">Para añadir o editar algo, introduce la clave de administrador.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setPostClosureUnlockOpen(true); setPostClosurePassword(''); setPostClosureError(''); }}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 shrink-0"
              >
                <Lock size={13} /> Desbloquear
              </button>
            </div>
          )}
          {isDayClosed && postClosureUnlocked && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-600 shrink-0" />
              <span>Edición desbloqueada temporalmente. El cierre se recalculará si haces cambios.</span>
              <button type="button" onClick={() => setPostClosureUnlocked(false)} className="ml-auto text-amber-600 hover:text-amber-800 underline text-[11px]">Volver a bloquear</button>
            </div>
          )}

          {/* ── BOTÓN HACER CIERRE DEL DÍA ── */}
          {!isDayClosed && (
            <button
              type="button"
              onClick={() => setClosureModalOpen(true)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-slate-800 to-blue-900 hover:from-slate-700 hover:to-blue-800 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
            >
              <DollarSign size={18} />
              <span>🔒 Hacer Cierre del Día · {selectedDate}</span>
            </button>
          )}
          {isDayClosed && (
            <button
              type="button"
              onClick={() => setClosureModalOpen(true)}
              className="w-full py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 size={16} />
              <span>Ver Resumen del Cierre · {selectedDate}</span>
            </button>
          )}

          {/* Barra de Filtros de Fecha, Origen y Búsqueda */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Calendar size={15} className="text-blue-600" />
                  Fecha:
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-bold text-slate-900 bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botones de Filtro por Origen (Mostrador vs App) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOriginFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    originFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos ({recordsOfSelectedDate.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOriginFilter('walk_in')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    originFilter === 'walk_in'
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🏢 Mostrador ({walkInCount})
                </button>
                <button
                  type="button"
                  onClick={() => setOriginFilter('app')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    originFilter === 'app'
                      ? 'bg-blue-600 text-white shadow-xs font-black'
                      : 'text-blue-700 hover:text-blue-900'
                  }`}
                >
                  <Smartphone size={12} />
                  <span>App ({appOrdersCount})</span>
                </button>
              </div>
            </div>

            <div className="relative w-full lg:w-64">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente o referencia..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Selector de Modo de Vista en Pantalla Móvil (Tarjetas de Cerca vs Tabla Completa) */}
          <div className="flex sm:hidden items-center justify-between bg-white p-2.5 rounded-2xl border border-blue-200/90 shadow-xs mb-1">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 ml-1">
              <span>Modo de Vista:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMobileViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  mobileViewMode === 'cards'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📱 Tarjetas (De Cerca)</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                  mobileViewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📋 Cuaderno Tabla</span>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              VISTA 1: TARJETAS MÓVILES ESTRUCTURADAS (BIEN DE CERCA)
              Visible en móviles cuando mobileViewMode === 'cards'
          ══════════════════════════════════════════════════════════════════ */}
          {mobileViewMode === 'cards' && (
            <div className="sm:hidden space-y-3">
              {filteredByOrigin.length > 0 ? (
                filteredByOrigin.map((rec) => (
                  <div 
                    key={rec.id} 
                    className="bg-white rounded-2xl p-4 border border-blue-200 shadow-sm space-y-3 transition-all hover:border-blue-400"
                  >
                    {/* Fila 1: Cliente, Hora, Origen y Borrar */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                            {rec.customerName}
                          </h4>
                          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                            🕒 {rec.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          {rec.customerCedula ? (
                            <button
                              type="button"
                              onClick={() => handleEditCedula(rec)}
                              title="Toca para editar la cédula"
                              className="inline-flex items-center gap-1 font-mono text-[11px] font-black text-slate-800 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded-md border border-slate-200 transition-colors"
                            >
                              🪪 {rec.customerCedula}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEditCedula(rec)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 transition-colors"
                              title="Asignar cédula a este cliente"
                            >
                              + Añadir C.I.
                            </button>
                          )}
                          {rec.customerPhone && (
                            <a 
                              href={`tel:${rec.customerPhone}`}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 font-mono font-bold hover:underline"
                            >
                              <Phone size={12} />
                              <span>{rec.customerPhone}</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {rec.origin === 'app' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
                            <Smartphone size={12} /> App
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200">
                            Mostrador
                          </span>
                        )}
                        <button
                          title="Eliminar registro (Requiere Clave de Administrador)"
                          onClick={() => {
                            setRecordToDelete(rec);
                            setAdminPasswordInput('');
                            setDeleteReasonInput('');
                            setDeleteErrorMsg('');
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Fila 2: Desglose de Prendas y Servicios */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => openEditServicesModal(rec)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 font-black transition-colors"
                        title="Toca para modificar las cestas o servicios de este ticket"
                      >
                        🧺 {rec.washCount || 1} Cesta(s) <span className="text-[11px] text-blue-600 font-normal">✏️</span>
                      </button>
                      {rec.washCount > 0 && <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">🫧 {rec.washCount} Lav</span>}
                      {rec.dryCount > 0 && <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">💨 {rec.dryCount} Sec</span>}
                      {rec.soapCount > 0 && <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">🧼 {rec.soapCount} Jab</span>}
                      {rec.softenerCount > 0 && <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">🌸 {rec.softenerCount} Suav</span>}
                      {rec.bleachCount > 0 && <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200">🧪 Cloro</span>}
                      {rec.degreaserCount > 0 && <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">✨ Deseng</span>}
                    </div>

                    {/* Nota si existe */}
                    {rec.notes && (
                      <p className="text-xs text-amber-900 bg-amber-50/80 p-2 rounded-xl border border-amber-200/70 italic">
                        📝 {rec.notes}
                      </p>
                    )}

                    {/* Si es pedido de app pendiente por recepcionar */}
                    {rec.origin === 'app' && rec.intakeStatus === 'pending_intake' && (
                      <button
                        onClick={() => openIntakeModal(rec)}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm animate-pulse"
                      >
                        <span>⚖️ Recibir Ropa / Ajustar Cestas</span>
                      </button>
                    )}

                    {/* Fila 3: Bloque Financiero (Total, Conversión y Estado de Pago) */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Servicio</span>
                        <p className="text-lg font-black text-blue-950 font-mono leading-tight">
                          ${(rec.totalUSD || 0).toFixed(2)} <span className="text-xs font-semibold text-slate-500">USD</span>
                        </p>
                        <p className="text-xs font-bold text-slate-600 font-mono">
                          ≈ Bs. {(rec.totalBs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="text-right space-y-1">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                          rec.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : rec.paymentStatus === 'partial'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {rec.paymentStatus === 'paid' ? '✓ Pagado' : rec.paymentStatus === 'partial' ? `Abonó $${rec.amountPaidUSD.toFixed(2)}` : 'Debe al retirar'}
                        </span>
                        {rec.bankReference && (
                          <p className="text-[10px] font-mono text-slate-600 block">
                            {rec.bankReference}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Fila 4: Botones de Acción Táctiles (Grandes y Cómodos) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {rec.deliveryStatus === 'delivered' ? (
                        <div className="flex-1 flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-emerald-800 text-xs font-bold">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            <span>Ropa Entregada</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Deseas regresar la ropa de "${rec.customerName}" a En Almacén?`)) {
                                updateDailyRecord(rec.id, { deliveryStatus: 'in_store', deliveredDate: null });
                              }
                            }}
                            className="text-xs text-slate-500 underline font-medium hover:text-slate-800"
                          >
                            Deshacer
                          </button>
                        </div>
                      ) : (
                        <>
                          {rec.debtUSD > 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setRecordToPay(rec);
                                setPayMethodSelect('usd_cash');
                                setPayRefInput('');
                                setPayModalOpen(true);
                              }}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                            >
                              <DollarSign size={15} />
                              <span>Cobrar y Entregar</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                markRecordDelivered(rec.id);
                                setInlineSuccessToast(`✅ ¡Ropa de "${rec.customerName}" entregada con éxito!`);
                                setTimeout(() => setInlineSuccessToast(''), 3500);
                              }}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                            >
                              <Check size={16} />
                              <span>Marcar Entregado</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* Botón WhatsApp directo si tiene teléfono */}
                      {rec.customerPhone && (
                        <button
                          type="button"
                          onClick={() => notifyCustomerWhatsApp(rec)}
                          className="px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                          title="Avisar por WhatsApp que la ropa está lista"
                        >
                          <MessageCircle size={15} className="text-emerald-600" />
                          <span>Avisar</span>
                        </button>
                      )}

                      {/* Botón Comprobante de Pago Oficial */}
                      <button
                        type="button"
                        onClick={() => openReceiptModal(rec)}
                        className="px-3 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
                        title="Generar comprobante de pago oficial para el cliente"
                      >
                        <FileText size={15} className="text-blue-600" />
                        <span>Recibo</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-blue-200 text-center text-slate-500 shadow-sm">
                  <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-800">No hay registros para la fecha {selectedDate}.</p>
                  <p className="text-xs text-slate-500 mt-1">Usa la barra superior para cargar el primer cliente del turno.</p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VISTA 2: TABLA COMPLETA DEL CUADERNO FÍSICO
              Visible en escritorio (sm:block) y en móvil si el usuario elige "Cuaderno Tabla"
          ══════════════════════════════════════════════════════════════════ */}
          <div className={`${mobileViewMode === 'table' ? 'block' : 'hidden sm:block'} bg-white rounded-3xl border border-blue-200/80 shadow-md w-full max-w-full`}>
            <div className="sm:hidden px-3.5 py-2.5 bg-blue-50 text-xs text-blue-700 font-bold flex items-center justify-between border-b border-blue-100">
              <span>👈 Desliza horizontalmente la tabla 👉</span>
              <span className="font-mono">{filteredByOrigin.length} filas</span>
            </div>
            <div 
              className="touch-scroll overflow-x-auto w-full max-w-full"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y' }}
            >
              <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Hora</th>
                    <th className="py-3 px-4">Cliente / Origen</th>
                    <th className="py-3 px-2 text-center">Lav</th>
                    <th className="py-3 px-2 text-center">Sec</th>
                    <th className="py-3 px-2 text-center">Jab</th>
                    <th className="py-3 px-2 text-center">M.O</th>
                    <th className="py-3 px-2 text-center">Suav</th>
                    <th className="py-3 px-2 text-center">Cloro</th>
                    <th className="py-3 px-2 text-center">Deseng</th>
                    <th className="py-3 px-4 text-right">Monto</th>
                    <th className="py-3 px-3">Estado / REF</th>
                    <th className="py-3 px-3">Entrega</th>
                    <th className="py-3 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredByOrigin.length > 0 ? (
                    filteredByOrigin.map((rec) => (
                      <tr key={rec.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-600 whitespace-nowrap">
                          {rec.time}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-extrabold text-slate-900 text-sm">{rec.customerName}</p>
                            {rec.origin === 'app' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                                <Smartphone size={10} /> App
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-slate-100 shrink-0">
                                Mostrador
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {rec.customerCedula ? (
                              <button
                                type="button"
                                onClick={() => handleEditCedula(rec)}
                                title="Clic para modificar cédula"
                                className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded border border-slate-200 transition-colors"
                              >
                                🪪 {rec.customerCedula}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleEditCedula(rec)}
                                className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline"
                                title="Asignar cédula a este cliente"
                              >
                                + C.I.
                              </button>
                            )}
                            {rec.customerPhone && (
                              <span className="text-[10px] text-slate-500 font-mono">{rec.customerPhone}</span>
                            )}
                            {rec.customerPhone && (
                              <button
                                type="button"
                                onClick={() => notifyCustomerWhatsApp(rec)}
                                className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                                title="Avisar por WhatsApp"
                              >
                                <MessageCircle size={10} /> Avisar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openReceiptModal(rec)}
                              className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                              title="Ver comprobante de pago para este cliente"
                            >
                              <FileText size={10} /> Recibo
                            </button>
                          </div>
                          {rec.notes && (
                            <p className="text-[10px] text-amber-700 font-medium italic mt-0.5">
                              {rec.notes}
                            </p>
                          )}
                          {rec.origin === 'app' && rec.intakeStatus === 'pending_intake' && (
                            <button
                              onClick={() => openIntakeModal(rec)}
                              className="mt-1.5 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 animate-pulse"
                            >
                              <span>⚖️ Recibir Ropa / Ajustar Cestas</span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">
                          <button
                            type="button"
                            onClick={() => openEditServicesModal(rec)}
                            className="hover:bg-blue-100 hover:text-blue-800 px-2 py-0.5 rounded-lg text-blue-700 font-black inline-flex items-center gap-1 transition-colors"
                            title="Haz clic para modificar los servicios (Lavado, Secado, Jabón, etc.) de este ticket"
                          >
                            <span>{rec.washCount || 0}</span>
                            <span className="text-[10px] text-blue-500 font-normal">✏️</span>
                          </button>
                        </td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{rec.dryCount || 0}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{rec.soapCount || 0}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{rec.laborCount || 0}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{rec.softenerCount || 0}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{rec.bleachCount || '-'}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{rec.degreaserCount || '-'}</td>
                        
                        {/* Monto y Cobro */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <p className="font-black text-slate-900 font-mono text-sm">
                            ${rec.totalUSD.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Bs. {rec.totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </p>
                        </td>

                        {/* Estado del Pago y Referencia */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              rec.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.paymentStatus === 'partial'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {rec.paymentStatus === 'paid' ? '✓ Pagado' : rec.paymentStatus === 'partial' ? `Abonó $${rec.amountPaidUSD.toFixed(2)}` : 'Debe'}
                            </span>
                            {rec.bankReference && (
                              <p className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block">
                                {rec.bankReference}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Estado de Entrega Interactivo */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {rec.deliveryStatus === 'delivered' ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl font-bold text-xs shadow-xs">
                                <CheckCircle2 size={13} className="text-emerald-600" /> Entregado
                              </span>
                              <button
                                type="button"
                                title="Desmarcar entrega (devolver a almacén si fue un error)"
                                onClick={() => {
                                  if (window.confirm(`¿Deseas devolver la ropa de "${rec.customerName}" a En Almacén?`)) {
                                    updateDailyRecord(rec.id, { deliveryStatus: 'in_store', deliveredDate: null });
                                  }
                                }}
                                className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                              >
                                Deshacer
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {rec.debtUSD > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRecordToPay(rec);
                                    setPayMethodSelect('usd_cash');
                                    setPayRefInput('');
                                    setPayModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] shadow-xs transition-all flex items-center gap-1 active:scale-95"
                                  title="Cobrar deuda pendiente y entregar ropa"
                                >
                                  <DollarSign size={13} />
                                  <span>Cobrar y Entregar</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    markRecordDelivered(rec.id);
                                    setInlineSuccessToast(`✅ ¡Ropa de "${rec.customerName}" marcada como entregada!`);
                                    setTimeout(() => setInlineSuccessToast(''), 3500);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] shadow-xs transition-all flex items-center gap-1 active:scale-95"
                                  title="Marcar ropa como entregada al cliente"
                                >
                                  <Check size={13} />
                                  <span>Marcar Entregado</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Botón de Recibo y Borrado Protegido */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openReceiptModal(rec)}
                              className="p-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1 text-[11px] font-black"
                              title="Generar e imprimir comprobante de pago oficial"
                            >
                              <FileText size={13} />
                              <span>Recibo</span>
                            </button>
                            <button
                              title="Eliminar registro (Requiere Clave de Administrador)"
                              onClick={() => {
                                setRecordToDelete(rec);
                                setAdminPasswordInput('');
                                setDeleteReasonInput('');
                                setDeleteErrorMsg('');
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="13" className="py-12 text-center text-slate-500">
                        <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="font-bold">No hay registros para la fecha {selectedDate}.</p>
                        <p className="text-xs">Usa el botón superior "Anotar Nuevo Cliente" para comenzar el turno.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: ROPA DEJADA EN DEPÓSITO */}
      {activeTab === 'stored_clothes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black">
                {storedClothesRecords.length}
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Control de Ropa Dejada en Depósito</h3>
                <p className="text-xs text-slate-600">Prendas esperando retiro o liquidación de saldo.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-white px-3 py-1.5 rounded-xl border border-amber-200">
              {storedClothesRecords.filter(r => r.paymentStatus !== 'paid').length} con deuda pendiente
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {storedClothesRecords.map((rec) => (
              <div key={rec.id} className="p-5 rounded-2xl bg-white border border-blue-200/80 shadow-xs flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500">{rec.date} · {rec.time}</span>
                    <h4 className="font-black text-slate-900 text-base">{rec.customerName}</h4>
                    {rec.customerPhone && <p className="text-xs text-slate-500 font-mono">{rec.customerPhone}</p>}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    rec.paymentStatus === 'paid' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {rec.paymentStatus === 'paid' ? '✓ Pagado' : `Debe $${rec.debtUSD.toFixed(2)}`}
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p><strong>Cestas/Servicios:</strong> L:{rec.washCount} S:{rec.dryCount} J:{rec.soapCount} Suav:{rec.softenerCount}</p>
                  {rec.notes && <p className="mt-1 text-slate-700 italic">"{rec.notes}"</p>}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="font-mono font-black text-sm text-slate-900">
                    Total: ${rec.totalUSD.toFixed(2)}
                  </span>
                  
                  {rec.paymentStatus !== 'paid' ? (
                    <button
                      onClick={() => {
                        setRecordToPay(rec);
                        setPayMethodSelect('usd_cash');
                        setPayRefInput('');
                        setPayModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <DollarSign size={14} /> Cobrar y Entregar
                    </button>
                  ) : (
                    <button
                      onClick={() => markRecordDelivered(rec.id)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Check size={14} /> Entregar Ropa
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: CONTROL DE DETERGENTES */}
      {activeTab === 'detergents' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-blue-200/80 shadow-md">
            <h3 className="font-black text-slate-900 text-base mb-1">Registro de Apertura de Insumos</h3>
            <p className="text-xs text-slate-600 mb-4">
              Marca aquí cuando abras un nuevo envase de detergente para que quede registrado en el inventario.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Jabón Nuevo', type: 'Jabón', icon: '🧴', color: 'bg-blue-50 border-blue-300 text-blue-900' },
                { label: 'Suavizante Nuevo', type: 'Suavizante', icon: '🌸', color: 'bg-purple-50 border-purple-300 text-purple-900' },
                { label: 'Cloro Nuevo', type: 'Cloro', icon: '🧪', color: 'bg-cyan-50 border-cyan-300 text-cyan-900' },
                { label: 'Desengrasante Nuevo', type: 'Desengrasante', icon: '🧽', color: 'bg-emerald-50 border-emerald-300 text-emerald-900' }
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    const notes = prompt(`¿Alguna observación para la apertura de ${item.label}? (Opcional):`) || 'Apertura de envase en turno';
                    addDetergentLog(item.type, notes, 'Encargada');
                    alert(`✅ Registrada apertura de ${item.label}`);
                  }}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 shadow-xs active:scale-95 hover:shadow-md ${item.color}`}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="font-extrabold text-xs">{item.label}</span>
                  <span className="text-[10px] font-bold opacity-80">+ Registrar Apertura</span>
                </button>
              ))}
            </div>
          </div>

          {/* Historial de Insumos */}
          <div className="bg-white rounded-3xl border border-blue-200/80 shadow-sm overflow-hidden p-6">
            <h4 className="font-extrabold text-slate-900 text-sm mb-3">Historial de Insumos Iniciados</h4>
            <div className="space-y-2">
              {detergentLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {log.item === 'Jabón' ? '🧴' : log.item === 'Suavizante' ? '🌸' : log.item === 'Cloro' ? '🧪' : '🧽'}
                    </span>
                    <div>
                      <p className="font-black text-slate-900">{log.item} iniciado</p>
                      <p className="text-slate-500 text-[11px]">{log.notes}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-slate-600">
                    <p className="font-bold">{log.date}</p>
                    <p className="text-[10px]">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: CIERRE DIARIO DE CAJA */}
      {activeTab === 'closure' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Cierre de la fecha */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-blue-200 shadow-md space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Cierre de Caja del Día</h3>
                  <p className="text-xs text-slate-500">Resumen y arqueo del dinero recibido el {selectedDate}</p>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-bold text-slate-900 bg-blue-50/50"
                />
              </div>

              {/* Tarjetas de Resumen Financiero del Día */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-xs font-bold text-blue-700">Total General Cobrado</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-blue-950 font-mono">${totalCobradoUSD.toFixed(2)} USD</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 font-mono">
                    ≈ Bs. {totalCobradoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-xs font-bold text-purple-700">Pago Móvil / Transferencias</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-purple-950 font-mono">
                      Bs. {totalPagoMovilBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-purple-700 font-mono">
                    (${totalPagoMovilUSD.toFixed(2)} USD)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-700">Divisas en Efectivo ($)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-emerald-950 font-mono">${totalEfectivoUSD.toFixed(2)} USD</span>
                  </div>
                  <span className="text-[11px] text-emerald-600">Billetes recibidos en caja</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-xs font-bold text-amber-700">Efectivo en Bolívares (Bs)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-amber-950 font-mono">
                      Bs. {totalEfectivoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-600 font-mono">(${totalEfectivoBsEnUSD.toFixed(2)} USD)</span>
                </div>
              </div>

              {/* Formulario de Arqueo */}
              <form onSubmit={handleSaveClosure} className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="font-extrabold text-slate-900 text-sm">Arqueo y Entrega de Dinero:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fondo Recibido (Bs):</label>
                    <input
                      type="number"
                      step="any"
                      value={fondoInicialBs}
                      onChange={(e) => setFondoInicialBs(e.target.value)}
                      placeholder="Ej: 860"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dinero Entregado en Bs:</label>
                    <input
                      type="number"
                      step="any"
                      value={dineroEntregadoBs}
                      onChange={(e) => setDineroEntregadoBs(e.target.value)}
                      placeholder="Ej: 850"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dinero Entregado en $:</label>
                    <input
                      type="number"
                      step="any"
                      value={dineroEntregadoUSD}
                      onChange={(e) => setDineroEntregadoUSD(e.target.value)}
                      placeholder="Ej: 20"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notas del Cierre:</label>
                  <input
                    type="text"
                    value={closureNotes}
                    onChange={(e) => setClosureNotes(e.target.value)}
                    placeholder="Observaciones de caja o novedades del turno..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {closureSuccessAlert && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Cierre guardado exitosamente en el historial del Administrador.</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <a
                    href={`https://wa.me/584126701633?text=${generateClosureWhatsApp()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Share2 size={15} />
                    <span>Enviar Cierre a WhatsApp</span>
                  </a>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-2"
                  >
                    <Check size={15} />
                    <span>Guardar Registro de Cierre</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Columna Derecha: Historial de Cierres Anteriores */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-blue-200/80 shadow-sm">
              <h4 className="font-black text-slate-900 text-sm mb-3">Historial de Cierres Registrados</h4>
              <div className="space-y-3">
                {dailyClosures.map((cl) => (
                  <div key={cl.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">{cl.date}</span>
                      <span className="font-mono font-bold text-blue-700">${cl.cobradoUSD.toFixed(2)} USD</span>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <p>• Pago Móvil: Bs. {cl.pagoMovilBs.toLocaleString('es-VE')}</p>
                      <p>• Divisas Efectivo: ${cl.divisasEfectivoUSD.toFixed(2)}</p>
                      <p>• Dinero Entregado: Bs. {cl.dineroEntregadoBs} / ${cl.dineroEntregadoUSD}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MODAL 1: CARGA RÁPIDA DE CLIENTE / ORDEN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 border border-blue-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Anotar Nuevo Cliente en Cuaderno</h3>
                <p className="text-xs text-slate-500">Carga rápida para atención en mostrador</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            {/* Banner de Reconocimiento si el cliente ya está registrado en el sistema */}
            {modalMatchedCustomer && (
              <div className="mb-3 p-2.5 px-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs shadow-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    ✓
                  </span>
                  <span className="font-black text-emerald-900">
                    ¡Cliente Registrado!
                  </span>
                  <span className="font-bold text-emerald-800">
                    {modalMatchedCustomer.name}
                  </span>
                  {modalMatchedCustomer.cedula && (
                    <span className="font-mono text-[11px] bg-emerald-100/90 px-1.5 py-0.5 rounded text-emerald-900 font-bold border border-emerald-200">
                      🪪 {modalMatchedCustomer.cedula}
                    </span>
                  )}
                  {modalMatchedCustomer.phone && (
                    <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                      📞 {modalMatchedCustomer.phone}
                    </span>
                  )}
                  {modalMatchedCustomer.visits > 1 && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-200">
                      ⭐ {modalMatchedCustomer.visits} visitas
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalMatchedCustomer(null);
                    setCustomerCedula('');
                    setCustomerName('');
                    setCustomerPhone('');
                  }}
                  className="text-[11px] text-emerald-700 hover:text-emerald-950 font-bold hover:underline shrink-0 ml-2"
                >
                  ✕ Limpiar / Nuevo
                </button>
              </div>
            )}

            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora:</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>
                {/* Cédula del Cliente con autocompletado */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cédula / C.I.:</label>
                  <input
                    type="text"
                    value={customerCedula}
                    onChange={(e) => handleModalCedulaChange(e.target.value)}
                    onFocus={() => {
                      setModalShowCedulaSuggestions(true);
                      setModalShowNameSuggestions(false);
                    }}
                    placeholder="Ej: V-18452331"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                  {/* Desplegable de sugerencias por Cédula */}
                  {modalShowCedulaSuggestions && customerCedula.trim().length >= 2 && getCedulaMatches(customerCedula).length > 0 && (
                    <div className="absolute top-full left-0 z-40 mt-1 w-64 bg-white border border-blue-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100">
                      <div className="p-1.5 px-2 bg-blue-50 text-[10px] font-bold text-blue-900 flex justify-between items-center">
                        <span>✨ Clientes con esta Cédula:</span>
                        <button type="button" onClick={() => setModalShowCedulaSuggestions(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                      </div>
                      {getCedulaMatches(customerCedula).map((client, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectCustomerModal(client)}
                          className="w-full text-left p-2 hover:bg-blue-50/70 transition-colors flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{client.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">🪪 {client.cedula}</div>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Usar ➔
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Nombre del Cliente con autocompletado */}
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Cliente *:</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={customerName}
                    onChange={(e) => handleModalNameChange(e.target.value)}
                    onFocus={() => {
                      setModalShowNameSuggestions(true);
                      setModalShowCedulaSuggestions(false);
                    }}
                    placeholder="Ej: Albert, Jenny, Enrique..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                  {/* Desplegable de sugerencias por Nombre */}
                  {modalShowNameSuggestions && customerName.trim().length >= 2 && getNameMatches(customerName).length > 0 && (
                    <div className="absolute top-full left-0 z-40 mt-1 w-64 bg-white border border-blue-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100">
                      <div className="p-1.5 px-2 bg-blue-50 text-[10px] font-bold text-blue-900 flex justify-between items-center">
                        <span>✨ Clientes existentes:</span>
                        <button type="button" onClick={() => setModalShowNameSuggestions(false)} className="text-slate-400 hover:text-slate-700">✕</button>
                      </div>
                      {getNameMatches(customerName).map((client, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectCustomerModal(client)}
                          className="w-full text-left p-2 hover:bg-blue-50/70 transition-colors flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{client.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {client.cedula ? `🪪 ${client.cedula}` : ''} {client.phone ? `📞 ${client.phone}` : ''}
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Usar ➔
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono (Opcional):</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ej: 0412-1234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Atajos Rápidos de Servicios Frecuentes */}
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
                <span className="text-[11px] font-black text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  Atajos Rápidos (Carga en 1 Clic):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button 
                    type="button" 
                    onClick={() => applyPreset('combo1')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-600 hover:text-white text-blue-900 text-xs font-bold border border-blue-200 shadow-xs transition-colors"
                  >
                    🧺 1 Cesta ($7.50)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('combo2')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-600 hover:text-white text-blue-900 text-xs font-bold border border-blue-200 shadow-xs transition-colors"
                  >
                    🧺🧺 2 Cestas ($15.00)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('lavado_jabon')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-600 hover:text-white text-blue-900 text-xs font-bold border border-blue-200 shadow-xs transition-colors"
                  >
                    🫧 Lavado + Jabón ($4.50)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('edredon_ind')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 text-xs font-bold border border-indigo-200 shadow-xs transition-colors"
                  >
                    🛏️ Edredón Ind. ($10)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('edredon_mat')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 text-xs font-bold border border-indigo-200 shadow-xs transition-colors"
                  >
                    🛏️ Edredón Mat. ($12)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('edredon_grande')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 text-xs font-bold border border-indigo-200 shadow-xs transition-colors"
                  >
                    🛏️ Edredón Grande ($14)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyPreset('forros_bus')} 
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-cyan-600 hover:text-white text-cyan-900 text-xs font-bold border border-cyan-200 shadow-xs transition-colors"
                  >
                    🚌 Forros Bus ($32)
                  </button>
                </div>
              </div>

              {/* Botones de Servicios / Cestas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Cantidades de Servicios por Cesta (Personalizable):</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {[
                    { key: 'wash', label: 'Lavado', val: washCount },
                    { key: 'dry', label: 'Secado', val: dryCount },
                    { key: 'soap', label: 'Jabón', val: soapCount },
                    { key: 'labor', label: 'Mano O.', val: laborCount },
                    { key: 'softener', label: 'Suaviz.', val: softenerCount },
                    { key: 'bleach', label: 'Cloro', val: bleachCount },
                    { key: 'degreaser', label: 'Deseng.', val: degreaserCount }
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                      <p className="text-[10px] font-bold text-slate-600 mb-1">{s.label}</p>
                      <div className="flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => handleModalServiceChange(s.key, s.val - 1)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-blue-600 hover:text-white"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm text-slate-900 w-4 text-center">{s.val}</span>
                        <button
                          type="button"
                          onClick={() => handleModalServiceChange(s.key, s.val + 1)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-blue-600 hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Montos y Totales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-blue-900">
                      Monto Designado a Cobrar ($ USD) *:
                    </label>
                    <button
                      type="button"
                      onClick={() => setManualTotalUSD(calculatedUSD.toFixed(2))}
                      className="text-[10px] font-black text-blue-700 bg-white hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs"
                      title="Recalcular con tarifas oficiales"
                    >
                      ⚡ Sugerido: ${calculatedUSD.toFixed(2)}
                    </button>
                  </div>
                  <input
                    type="number"
                    step="any"
                    required
                    value={manualTotalUSD}
                    onChange={(e) => setManualTotalUSD(e.target.value)}
                    placeholder="7.50"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 text-sm font-mono font-black text-blue-950 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] font-bold text-blue-700 mt-1 block">
                    ≈ Bs. {effectiveTotalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">Forma / Estado de Pago:</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 text-xs font-bold text-slate-900 bg-white focus:outline-none"
                  >
                    <option value="paid">✓ Cancela Ahora Completo</option>
                    <option value="pending">⏳ Ropa Dejada (Paga al retirar)</option>
                    <option value="partial">⏳ Abono Parcial</option>
                  </select>
                </div>
              </div>

              {paymentStatus === 'partial' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">Monto Abonado ($):</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={manualAmountPaidUSD}
                      onChange={(e) => setManualAmountPaidUSD(e.target.value)}
                      placeholder="Ej: 13.35"
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-mono font-bold text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">Resta por Cobrar:</label>
                    <p className="text-base font-black text-red-600 font-mono pt-2">
                      ${effectiveDebtUSD.toFixed(2)} USD
                    </p>
                  </div>
                </div>
              )}

              {/* Método de Pago y Referencia */}
              {paymentStatus !== 'pending' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Método de Pago:</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-none"
                    >
                      <option value="pago_movil">📱 Pago Móvil</option>
                      <option value="usd_cash">💵 Efectivo USD ($)</option>
                      <option value="bs_cash">🇻🇪 Efectivo Bs</option>
                      <option value="transfer">🏦 Transferencia Bancaria</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Referencia Bancaria (REF):</label>
                    <input
                      type="text"
                      value={bankReference}
                      onChange={(e) => setBankReference(e.target.value)}
                      placeholder="Ej: RF 7423 o 13358"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 bg-slate-50 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Marcador de Detergente Nuevo */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={markedNewDetergent}
                    onChange={(e) => setMarkedNewDetergent(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>🧴 Marcar "Detergente Nuevo" en este turno</span>
                </label>
                {markedNewDetergent && (
                  <select
                    value={newDetergentType}
                    onChange={(e) => setNewDetergentType(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="Jabón">Jabón</option>
                    <option value="Suavizante">Suavizante</option>
                    <option value="Cloro">Cloro</option>
                    <option value="Desengrasante">Desengrasante</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notas u observaciones:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Dejó ropa blanca y jeans / Paga al retirar..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md"
                >
                  Guardar en el Cuaderno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BORRADO PROTEGIDO CON AUDITORÍA */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-red-200 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center border border-red-200">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Acción Protegida: Borrar Registro</h3>
                <p className="text-[11px] text-slate-500">Requiere clave maestra y motivo para auditoría</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 mb-4 space-y-1">
              <p><strong>Cliente:</strong> {recordToDelete?.customerName}</p>
              <p><strong>Monto:</strong> ${recordToDelete?.totalUSD.toFixed(2)} USD (Bs. {recordToDelete?.totalBs.toLocaleString('es-VE')})</p>
              <p><strong>Hora:</strong> {recordToDelete?.time} ({recordToDelete?.date})</p>
            </div>

            <form onSubmit={handleConfirmDelete} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña del Administrador:
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Ingresa clave maestra (ej: aj2026)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono text-center tracking-widest text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo obligatorio de la eliminación:
                </label>
                <textarea
                  required
                  rows="2"
                  value={deleteReasonInput}
                  onChange={(e) => setDeleteReasonInput(e.target.value)}
                  placeholder="Ej: Error de tipeo en el monto, el cliente no concretó el servicio..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-slate-500">
                  Esta justificación se guardará de forma inmutable en el panel del administrador.
                </span>
              </div>

              {deleteErrorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                  {deleteErrorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md"
                >
                  Confirmar Eliminación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: COBRAR DEUDA Y ENTREGAR */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-blue-200 shadow-2xl">
            <h3 className="font-black text-slate-900 text-base mb-1">Cobrar y Entregar Ropa</h3>
            <p className="text-xs text-slate-500 mb-4">
              Cliente: <strong>{recordToPay?.customerName}</strong>
            </p>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center mb-4">
              <span className="text-xs font-bold text-amber-800">Monto Pendiente a Cobrar</span>
              <p className="text-2xl font-black text-amber-950 font-mono">${recordToPay?.debtUSD.toFixed(2)} USD</p>
              <span className="text-xs font-semibold text-amber-700 font-mono">
                ≈ Bs. {(recordToPay?.debtUSD * (exchangeRate || 40.50)).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <form onSubmit={handleConfirmPaymentAndDelivery} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Método con el que cancela:</label>
                <select
                  value={payMethodSelect}
                  onChange={(e) => setPayMethodSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50"
                >
                  <option value="usd_cash">💵 Efectivo USD ($)</option>
                  <option value="pago_movil">📱 Pago Móvil</option>
                  <option value="bs_cash">🇻🇪 Efectivo Bs</option>
                  <option value="transfer">🏦 Transferencia Bancaria</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Referencia (si aplica):</label>
                <input
                  type="text"
                  value={payRefInput}
                  onChange={(e) => setPayRefInput(e.target.value)}
                  placeholder="Ej: RF 8899"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md"
                >
                  Confirmar Cobro y Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: RECEPCIÓN Y AJUSTE DE PRENDAS PARA PEDIDOS DESDE LA APP */}
      {intakeModalOpen && recordForIntake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-blue-200 shadow-2xl animate-in fade-in zoom-in duration-150 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Recepción de Ropa · Pedido desde la App</h3>
                  <p className="text-xs text-slate-500">
                    Cliente: <strong>{recordForIntake.customerName}</strong> {recordForIntake.customerPhone ? `(${recordForIntake.customerPhone})` : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIntakeModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-900 mb-4 flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Nota del operario:</strong> Verifica la cantidad real de cestas al pesar la ropa del cliente y ajusta si es necesario.
              </span>
            </div>

            <form onSubmit={handleConfirmIntake} className="space-y-4">
              {/* Cédula del Cliente */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cédula / C.I. del Cliente:
                </label>
                <input
                  type="text"
                  value={intakeCedula}
                  onChange={(e) => setIntakeCedula(e.target.value)}
                  placeholder="Ej: V-18452331"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Ajuste de Cestas */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-sm text-slate-900">Cestas de Ropa Recibidas:</p>
                  <p className="text-[11px] text-slate-500">
                    Cotizó en la app: {recordForIntake.washCount} cesta(s) (~$7.50 c/u)
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIntakeBaskets(Math.max(1, intakeBaskets - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-bold hover:bg-blue-600 hover:text-white flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-black text-lg font-mono text-slate-900">
                    {intakeBaskets}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIntakeBaskets(intakeBaskets + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 font-bold hover:bg-blue-600 hover:text-white flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Insumos adicionales */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-1">Cloro (+$0.50):</span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIntakeBleach(Math.max(0, intakeBleach - 1))}
                      className="w-7 h-7 rounded bg-white border border-slate-200 font-bold"
                    >-</button>
                    <span className="font-bold text-sm">{intakeBleach}</span>
                    <button
                      type="button"
                      onClick={() => setIntakeBleach(intakeBleach + 1)}
                      className="w-7 h-7 rounded bg-white border border-slate-200 font-bold"
                    >+</button>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-1">Desengrasante (+$0.50):</span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIntakeDegreaser(Math.max(0, intakeDegreaser - 1))}
                      className="w-7 h-7 rounded bg-white border border-slate-200 font-bold"
                    >-</button>
                    <span className="font-bold text-sm">{intakeDegreaser}</span>
                    <button
                      type="button"
                      onClick={() => setIntakeDegreaser(intakeDegreaser + 1)}
                      className="w-7 h-7 rounded bg-white border border-slate-200 font-bold"
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Monto Final Recalculado */}
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 block">Monto Total Ajustado:</span>
                  <span className="text-[11px] text-blue-700">
                    ≈ Bs. {(((intakeBaskets * (prices.comboFull || 7.50)) + (intakeBleach * 0.50) + (intakeDegreaser * 0.50)) * (exchangeRate || 40.50)).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-blue-950">
                  ${((intakeBaskets * (prices.comboFull || 7.50)) + (intakeBleach * 0.50) + (intakeDegreaser * 0.50)).toFixed(2)} USD
                </div>
              </div>

              {/* Estado y Método de Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cobro:</label>
                  <select
                    value={intakePaymentStatus}
                    onChange={(e) => setIntakePaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50"
                  >
                    <option value="paid">✓ Cancela Ahora Completo</option>
                    <option value="pending">⏳ Deja Ropa (Paga al retirar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Método de Pago:</label>
                  <select
                    value={intakePaymentMethod}
                    onChange={(e) => setIntakePaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-slate-50"
                  >
                    <option value="pago_movil">📱 Pago Móvil</option>
                    <option value="usd_cash">💵 Efectivo USD ($)</option>
                    <option value="bs_cash">🇻🇪 Efectivo Bs</option>
                    <option value="transfer">🏦 Transferencia Bancaria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Referencia Bancaria (si canceló):</label>
                <input
                  type="text"
                  value={intakeBankRef}
                  onChange={(e) => setIntakeBankRef(e.target.value)}
                  placeholder="Ej: RF 4589"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIntakeModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase shadow-md flex items-center gap-1.5"
                >
                  <Check size={16} />
                  <span>Confirmar Recepción y Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: EDITAR SERVICIOS Y CESTAS DE UN TICKET EXISTENTE */}
      {editServicesModalOpen && recordToEditServices && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-blue-200 shadow-2xl animate-in fade-in zoom-in duration-150 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-200 text-lg">
                  🧺
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Modificar Servicios y Cestas</h3>
                  <p className="text-xs text-slate-500">
                    Cliente: <strong>{recordToEditServices.customerName}</strong> {recordToEditServices.customerPhone ? `(${recordToEditServices.customerPhone})` : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditServicesModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditServices} className="space-y-4">
              {/* Atajos Rápidos para el Ticket */}
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-1.5">
                <span className="text-[11px] font-black text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  Ajustar Rápido a:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setEditWashCount(num);
                        setEditDryCount(num);
                        setEditSoapCount(num);
                        setEditLaborCount(num);
                        setEditSoftenerCount(num);
                        setEditTotalUSD((num * (prices.comboFull || 7.50)).toFixed(2));
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors ${
                        editWashCount === num && editDryCount === num 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                          : 'bg-white hover:bg-blue-100 text-blue-900 border-blue-200'
                      }`}
                    >
                      🧺 {num} Cesta{num > 1 ? 's' : ''} (${(num * (prices.comboFull || 7.50)).toFixed(2)})
                    </button>
                  ))}
                </div>
              </div>

              {/* Contadores Detallados */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'Lavado (L)', val: editWashCount, setter: setEditWashCount, color: 'text-blue-700' },
                  { label: 'Secado (S)', val: editDryCount, setter: setEditDryCount, color: 'text-blue-700' },
                  { label: 'Jabón (J)', val: editSoapCount, setter: setEditSoapCount, color: 'text-blue-700' },
                  { label: 'Mano O. (MO)', val: editLaborCount, setter: setEditLaborCount, color: 'text-blue-700' },
                  { label: 'Suavizante', val: editSoftenerCount, setter: setEditSoftenerCount, color: 'text-purple-700' },
                  { label: 'Cloro', val: editBleachCount, setter: setEditBleachCount, color: 'text-cyan-700' },
                  { label: 'Desengrasante', val: editDegreaserCount, setter: setEditDegreaserCount, color: 'text-amber-700' }
                ].map((s, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
                    <p className={`text-[10px] font-black uppercase mb-1 ${s.color}`}>{s.label}</p>
                    <div className="flex items-center justify-between gap-1 bg-white rounded-xl border border-slate-200 px-1 py-0.5">
                      <button
                        type="button"
                        onClick={() => s.setter(Math.max(0, s.val - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white font-black text-sm flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <span className="font-mono font-black text-sm text-slate-900 w-5">{s.val}</span>
                      <button
                        type="button"
                        onClick={() => s.setter(s.val + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white font-black text-sm flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Monto Total Cobrado */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Monto Total USD ($):</label>
                  <button
                    type="button"
                    onClick={() => {
                      const w = editWashCount, d = editDryCount, j = editSoapCount, mo = editLaborCount, su = editSoftenerCount, cl = editBleachCount, de = editDegreaserCount;
                      let sum = 0;
                      if (w > 0 && w === d && w === j && w === mo && w === su) {
                        sum = (w * (prices.comboFull || 7.50)) + (cl * (prices.bleach || 0.50)) + (de * (prices.degreaser || 0.50));
                      } else {
                        sum = (w * (prices.washOnly || 4.00)) +
                              (d * (prices.dryOnly || 3.00)) +
                              (j * (prices.soap || 0.50)) +
                              (mo * (prices.labor || 0.20)) +
                              (su * (prices.softener || 0.70)) +
                              (cl * (prices.bleach || 0.50)) +
                              (de * (prices.degreaser || 0.50));
                      }
                      setEditTotalUSD(sum.toFixed(2));
                    }}
                    className="text-[10px] font-black text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs"
                    title="Recalcular monto según servicios seleccionados"
                  >
                    ⚡ Recalcular Sugerido
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    required
                    value={editTotalUSD}
                    onChange={(e) => setEditTotalUSD(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-mono font-black text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                    ≈ Bs. {((parseFloat(editTotalUSD) || 0) * (exchangeRate || 40.50)).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditServicesModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Check size={16} />
                  <span>Guardar Servicios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: HACER CIERRE DEL DÍA
      ══════════════════════════════════════════════════ */}
      {closureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-200 my-4 overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-blue-900 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <DollarSign size={18} className="text-cyan-300" />
                  {isDayClosed ? 'Resumen del Cierre' : 'Hacer Cierre del Día'}
                </h3>
                <p className="text-xs text-blue-300 mt-0.5">📅 {selectedDate} · {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
              </div>
              <button onClick={() => setClosureModalOpen(false)} className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* ── SECCIÓN 1: ROPA DEL DÍA ── */}
              <div className="rounded-2xl border border-blue-200 overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-black text-blue-900">📋 Ropa Trabajada Hoy ({newDayRecords.length} servicios)</span>
                  <span className="text-xs font-black text-blue-800 font-mono">${newTotalUSD.toFixed(2)} USD</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {/* Pago Móvil */}
                  <div className="flex items-center justify-between px-4 py-2 text-xs">
                    <span className="text-slate-600 flex items-center gap-1.5"><span className="text-base">📱</span> Pago Móvil / Transferencia</span>
                    <div className="text-right">
                      <p className="font-black text-slate-900 font-mono">Bs. {newPagoMovilBs.toLocaleString('es-VE', {minimumFractionDigits:2})}</p>
                      <p className="text-[10px] text-slate-500 font-mono">(${newPagoMovilUSD.toFixed(2)} USD)</p>
                    </div>
                  </div>
                  {/* Divisas */}
                  <div className="flex items-center justify-between px-4 py-2 text-xs">
                    <span className="text-slate-600 flex items-center gap-1.5"><span className="text-base">💵</span> Divisas / Efectivo USD ($)</span>
                    <div className="text-right">
                      <p className="font-black text-slate-900 font-mono">${newEfectivoUSD.toFixed(2)} USD</p>
                    </div>
                  </div>
                  {/* Efectivo Bs */}
                  <div className="flex items-center justify-between px-4 py-2 text-xs">
                    <span className="text-slate-600 flex items-center gap-1.5"><span className="text-base">🇻🇪</span> Efectivo Bolívares</span>
                    <div className="text-right">
                      <p className="font-black text-slate-900 font-mono">Bs. {newEfectivoBs.toLocaleString('es-VE', {minimumFractionDigits:2})}</p>
                      <p className="text-[10px] text-slate-500 font-mono">(${(newEfectivoBs / (exchangeRate||1)).toFixed(2)} USD)</p>
                    </div>
                  </div>
                  {/* Pendiente */}
                  {newPendienteUSD > 0 && (
                    <div className="flex items-center justify-between px-4 py-2 text-xs bg-amber-50">
                      <span className="text-amber-700 flex items-center gap-1.5"><span className="text-base">⏳</span> Ropa Dejada / Por Cobrar</span>
                      <p className="font-black text-amber-800 font-mono">${newPendienteUSD.toFixed(2)} USD</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── SECCIÓN 2: DEPÓSITO COBRADO HOY ── */}
              <div className="rounded-2xl border border-amber-200 overflow-hidden">
                <div className="bg-amber-50 px-4 py-2 flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900">🏪 Ropa del Depósito Cobrada Hoy ({depositoEntregadoHoy.length})</span>
                  <span className="text-xs font-black text-amber-800 font-mono">${depTotalUSD.toFixed(2)} USD</span>
                </div>
                {depositoEntregadoHoy.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-slate-400 italic">Sin cobros de depósito registrados hoy.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {depositoEntregadoHoy.map(r => (
                      <div key={r.id} className="flex items-center justify-between px-4 py-2 text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{r.customerName}</p>
                          <p className="text-[10px] text-slate-500">{r.date} → cobrado hoy · {r.paymentMethod === 'pago_movil' ? '📱 PM' : r.paymentMethod === 'usd_cash' ? '💵 $' : '🇻🇪 Bs'}</p>
                        </div>
                        <span className="font-black font-mono text-amber-800">${(r.amountPaidUSD||0).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-4 py-2 text-xs bg-amber-50/50">
                      <span className="text-amber-700">📱 Pago Móvil depósito</span>
                      <span className="font-mono font-bold text-amber-800">Bs. {depPagoMovilBs.toLocaleString('es-VE')} (${depPagoMovilUSD.toFixed(2)})</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2 text-xs bg-amber-50/50">
                      <span className="text-amber-700">💵 Divisas depósito</span>
                      <span className="font-mono font-bold text-amber-800">${depEfUSD.toFixed(2)} USD</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2 text-xs bg-amber-50/50">
                      <span className="text-amber-700">🇻🇪 Efectivo Bs. depósito</span>
                      <span className="font-mono font-bold text-amber-800">Bs. {depEfBs.toLocaleString('es-VE')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECCIÓN 3: TOTAL PERCIBIDO DEL DÍA ── */}
              <div className="rounded-2xl border-2 border-slate-800 overflow-hidden">
                <div className="bg-slate-800 px-4 py-2.5">
                  <p className="text-xs font-black text-cyan-300 uppercase tracking-wide">✅ Total Percibido del Día</p>
                  <p className="text-[11px] text-slate-400">Ropa nueva + Depósito cobrado hoy</p>
                </div>
                <div className="bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-700">📱 Pago Móvil</span>
                    <div className="text-right">
                      <p className="font-black text-slate-900 font-mono">Bs. {percibidoPagoMovilBs.toLocaleString('es-VE', {minimumFractionDigits:2})}</p>
                      <p className="text-[11px] text-slate-500 font-mono">(${percibidoPagoMovilUSD.toFixed(2)})</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-700">💵 Divisas $</span>
                    <p className="font-black text-slate-900 font-mono">${percibidoEfectivoUSD.toFixed(2)} USD</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-700">🇻🇪 Efectivo Bs.</span>
                    <div className="text-right">
                      <p className="font-black text-slate-900 font-mono">Bs. {percibidoEfectivoBs.toLocaleString('es-VE', {minimumFractionDigits:2})}</p>
                      <p className="text-[11px] text-slate-500 font-mono">(${(percibidoEfectivoBs / (exchangeRate||1)).toFixed(2)})</p>
                    </div>
                  </div>
                  <div className="border-t-2 border-slate-300 pt-2 flex items-center justify-between">
                    <span className="font-black text-slate-900 text-base">TOTAL</span>
                    <div className="text-right">
                      <p className="font-black text-blue-900 text-xl font-mono">${percibidoTotalUSD.toFixed(2)} USD</p>
                      <p className="text-xs text-slate-600 font-mono">Bs. {percibidoTotalBs.toLocaleString('es-VE', {minimumFractionDigits:2})}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── NOTAS Y ACCIONES ── */}
              {!isDayClosed && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Observaciones del cierre (opcional):</label>
                  <input
                    type="text"
                    value={closureConfirmNotes}
                    onChange={e => setClosureConfirmNotes(e.target.value)}
                    placeholder="Ej: Todo cuadrado. Sin novedad."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/584126701633?text=${generateClosureWhatsApp()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                >
                  <Share2 size={14} /> Enviar por WhatsApp
                </a>

                {!isDayClosed && (
                  <button
                    type="button"
                    onClick={handleConfirmClosure}
                    className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <CheckCircle2 size={16} /> Confirmar Cierre del Día
                  </button>
                )}
                {isDayClosed && (
                  <div className="flex-1 py-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-xs text-center">
                    ✅ Cierre ya confirmado · {existingClosure?.closedAt}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: DESBLOQUEAR POST-CIERRE (CLAVE)
      ══════════════════════════════════════════════════ */}
      {postClosureUnlockOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-amber-300 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Lock size={20} className="text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Desbloquear Cierre</h3>
                <p className="text-[11px] text-slate-500">Ingresa la clave de administrador para permitir ediciones post-cierre.</p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                autoFocus
                value={postClosurePassword}
                onChange={e => setPostClosurePassword(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    if (verifyAdminPassword(postClosurePassword)) {
                      setPostClosureUnlocked(true);
                      setPostClosureUnlockOpen(false);
                      setPostClosureError('');
                    } else {
                      setPostClosureError('Clave incorrecta. Inténtalo de nuevo.');
                    }
                  }
                }}
                placeholder="Ingresa clave maestra (ej: aj2026)"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono text-center tracking-widest text-slate-900 focus:outline-none focus:border-amber-500"
              />
              {postClosureError && (
                <p className="text-xs font-bold text-red-600 text-center">{postClosureError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPostClosureUnlockOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                >Cancelar</button>
                <button
                  type="button"
                  onClick={() => {
                    if (verifyAdminPassword(postClosurePassword)) {
                      setPostClosureUnlocked(true);
                      setPostClosureUnlockOpen(false);
                      setPostClosureError('');
                    } else {
                      setPostClosureError('Clave incorrecta. Inténtalo de nuevo.');
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-sm"
                >Desbloquear</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL: COMPROBANTE DE PAGO OFICIAL PARA CLIENTES
      ══════════════════════════════════════════════════ */}
      {receiptModalOpen && receiptRecord && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          {/* Estilos para impresión limpia de la tirilla/recibo */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * { visibility: hidden !important; }
              #printable-receipt-area, #printable-receipt-area * { visibility: visible !important; }
              #printable-receipt-area {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 420px !important;
                margin: 0 auto !important;
                padding: 16px !important;
                box-shadow: none !important;
                border: 1px solid #ddd !important;
              }
            }
          `}} />

          <div className="relative w-full max-w-md bg-white rounded-3xl border border-blue-200 shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
            
            {/* Cabecera del Modal (No imprimible) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50 print:hidden shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">Comprobante de Pago</h3>
                  <p className="text-[11px] text-slate-500">Ticket oficial de servicio para el cliente</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors border border-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* CUERPO DEL COMPROBANTE */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-4 text-slate-800 bg-white flex-1" id="printable-receipt-area">
              
              {/* Encabezado del Negocio */}
              <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl mb-1 shadow-sm">
                  AJ
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">LAVANDERÍA AJ EXPRESS</h2>
                <p className="text-[11px] font-bold text-blue-700 tracking-wide">SERVICIO DE LAVANDERÍA Y TINTORERÍA</p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">"El mejor servicio al mejor precio es nuestra mayor prioridad"</p>
                
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    #TKT-{(receiptRecord.id || '').slice(-6).toUpperCase()}
                  </span>
                  <span className="text-[11px]">{receiptRecord.date} · {receiptRecord.time}</span>
                </div>
              </div>

              {/* Datos del Cliente */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Cliente:</span>
                  <strong className="text-slate-900 font-black text-sm">{receiptRecord.customerName}</strong>
                </div>
                {receiptRecord.customerCedula && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">C.I. / Cédula:</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      🪪 {receiptRecord.customerCedula}
                    </span>
                  </div>
                )}
                {receiptRecord.customerPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Teléfono:</span>
                    <span className="font-mono font-bold text-slate-700">{receiptRecord.customerPhone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Origen:</span>
                  <span className="font-bold text-blue-800">{receiptRecord.origin === 'app' ? '📱 Pedido por App' : '🏪 Mostrador Local'}</span>
                </div>
              </div>

              {/* Desglose de Servicios y Operaciones */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-700 pb-1 border-b border-slate-200">
                  <span>DESCRIPCIÓN DEL SERVICIO</span>
                  <span>DETALLE</span>
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>🧺 Total Cestas:</span>
                    <span className="font-mono text-sm font-black text-blue-900">{receiptRecord.washCount || 1} Cesta(s)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 py-2 px-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] font-bold text-slate-700">
                    <div>🫧 Lavados: <span className="font-black text-blue-700">{receiptRecord.washCount || 0}</span></div>
                    <div>💨 Secados: <span className="font-black text-blue-700">{receiptRecord.dryCount || 0}</span></div>
                    <div>🧼 Jabón: <span className="font-black text-blue-700">{receiptRecord.soapCount || 0}</span></div>
                    <div>🌸 Suavizante: <span className="font-black text-purple-700">{receiptRecord.softenerCount || 0}</span></div>
                    {receiptRecord.bleachCount > 0 && (
                      <div className="col-span-2 text-cyan-800 font-black">🧪 Cloro: {receiptRecord.bleachCount} cesta(s) (+$0.50 c/u)</div>
                    )}
                    {receiptRecord.degreaserCount > 0 && (
                      <div className="col-span-2 text-amber-800 font-black">🧽 Desengrasante: {receiptRecord.degreaserCount} cesta(s) (+$0.50 c/u)</div>
                    )}
                  </div>

                  {receiptRecord.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                      📝 {receiptRecord.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Bloque Financiero y Estado de Pago */}
              <div className="pt-2 border-t-2 border-dashed border-slate-300 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Total en Divisas:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">${(receiptRecord.totalUSD || 0).toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Tasa Oficial BCV:</span>
                  <span>Bs. {(exchangeRate || 40.50).toFixed(2)} / USD</span>
                </div>
                <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                  <span>Total en Bolívares:</span>
                  <span className="font-mono text-base text-blue-900">
                    Bs. {(receiptRecord.totalBs || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Sello de Pago */}
                <div className="mt-2 p-3 rounded-2xl border flex items-center justify-between gap-2 bg-slate-50">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Estado del Pago</span>
                    <strong className={`text-xs sm:text-sm font-black uppercase ${
                      receiptRecord.paymentStatus === 'paid' 
                        ? 'text-emerald-700' 
                        : receiptRecord.paymentStatus === 'partial' 
                          ? 'text-amber-700' 
                          : 'text-red-700'
                    }`}>
                      {receiptRecord.paymentStatus === 'paid' ? '✅ PAGADO COMPLETO' : receiptRecord.paymentStatus === 'partial' ? '⚠️ ABONO PARCIAL' : '⏳ PENDIENTE AL RETIRAR'}
                    </strong>
                    {receiptRecord.bankReference && (
                      <span className="text-[10px] text-slate-500 block font-mono">Ref: {receiptRecord.bankReference}</span>
                    )}
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-500 block font-bold">Monto Pagado</span>
                    <span className="font-black text-slate-900 text-sm">
                      ${(receiptRecord.amountPaidUSD !== undefined ? receiptRecord.amountPaidUSD : (receiptRecord.paymentStatus === 'paid' ? receiptRecord.totalUSD : 0)).toFixed(2)} USD
                    </span>
                    {receiptRecord.debtUSD > 0 && (
                      <span className="text-[10px] text-red-600 block font-bold">
                        Resta: ${receiptRecord.debtUSD.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pie de Recibo */}
              <div className="text-center pt-2 text-[10px] text-slate-500 space-y-1 border-t border-slate-100">
                <p className="font-bold text-slate-700">Estado de Ropa: {receiptRecord.deliveryStatus === 'delivered' ? '✅ Ya entregada' : '🧺 Lista para retirar en local'}</p>
                <p>Presenta este comprobante digital al momento de retirar tus prendas.</p>
                <p className="font-black text-blue-800">¡Gracias por preferirnos!</p>
              </div>
            </div>

            {/* Botones de Acción (No imprimibles) */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 space-y-2 print:hidden shrink-0">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => shareReceiptWhatsApp(receiptRecord)}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <MessageCircle size={16} />
                  <span>Enviar WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Printer size={16} />
                  <span>Imprimir / PDF</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyReceiptText(receiptRecord)}
                  className="flex-1 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Copy size={14} />
                  <span>{receiptCopiedToast ? '¡Copiado con Éxito!' : 'Copiar Texto'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
