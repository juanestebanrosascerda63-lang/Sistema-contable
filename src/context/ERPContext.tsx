import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Empresa, 
  DTEDocumento, 
  AsientoContable, 
  CuentaPlan, 
  Trabajador, 
  ObraConstruccion, 
  Bodega, 
  ProductoSKU, 
  AuditLogItem, 
  DeclaracionJurada,
  LiquidacionSueldo,
  EstadoDePagoEEPP,
  ActivoFijo,
  FlujoCajaItem,
  CuentaBancaria,
  MovimientoBancario,
  ObligacionDocumento
} from '../types/erp';
import { 
  INITIAL_EMPRESAS, 
  INITIAL_DTES, 
  INITIAL_ASIENTOS, 
  INITIAL_PLAN_CUENTAS, 
  INITIAL_TRABAJADORES, 
  INITIAL_OBRAS, 
  INITIAL_BODEGAS, 
  INITIAL_PRODUCTOS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_DECLARACIONES_JURADAS,
  INITIAL_EEPP,
  INITIAL_ACTIVOS_FIJOS,
  INITIAL_FLUJO_CAJA,
  INITIAL_CUENTAS_BANCARIAS,
  INITIAL_MOVIMIENTOS_BANCARIOS,
  INITIAL_OBLIGACIONES_COBRAR,
  INITIAL_OBLIGACIONES_PAGAR
} from '../data/mockData';

export type RealmType = 
  | 'login'
  | 'hub' 
  | 'sii' 
  | 'gestion_bancaria'
  | 'oblig_pagar'
  | 'oblig_cobrar'
  | 'contabilidad' 
  | 'impuestos' 
  | 'eeff' 
  | 'remuneraciones' 
  | 'ventas' 
  | 'logistica' 
  | 'portal_cliente' 
  | 'construccion'
  | 'activo_fijo'
  | 'flujo_caja'
  | 'config_contabilidad';

export interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  message: string;
  timestamp: string;
  actionText?: string;
  onAction?: () => void;
}

interface ERPContextType {
  // Navigation & User
  isLoggedIn: boolean;
  loginUser: (rut: string) => void;
  logoutUser: () => void;
  activeRealm: RealmType;
  setActiveRealm: (realm: RealmType) => void;
  activeSubView: string;
  setActiveSubView: (view: string) => void;

  // Companies
  empresas: Empresa[];
  empresaActiva: Empresa;
  setEmpresaActiva: (emp: Empresa) => void;
  updateEmpresaSettings: (settings: Partial<Empresa>) => void;

  // DTE & Taxes
  dtes: DTEDocumento[];
  addDTE: (doc: Omit<DTEDocumento, 'id'>) => DTEDocumento;
  centralizarDTE: (dteId: string) => void;
  siiSyncing: boolean;
  triggerSIISync: (periodo?: string) => Promise<void>;

  // Accounting & Journal
  asientos: AsientoContable[];
  addAsiento: (asiento: Omit<AsientoContable, 'id' | 'numero' | 'auditTimestamp'>) => void;
  planCuentas: CuentaPlan[];

  // Activo Fijo & Depreciación
  activosFijos: ActivoFijo[];
  addActivoFijo: (af: Omit<ActivoFijo, 'id'>) => void;

  // Flujo de Caja
  flujoCaja: FlujoCajaItem[];
  addFlujoCajaItem: (item: Omit<FlujoCajaItem, 'id'>) => void;

  // Payroll / RRHH
  trabajadores: Trabajador[];
  addTrabajador: (trabajador: Omit<Trabajador, 'id'>) => void;
  liquidaciones: LiquidacionSueldo[];
  generarLiquidacion: (trabajadorId: string, periodo: string) => LiquidacionSueldo;

  // Construction
  obras: ObraConstruccion[];
  eeppList: EstadoDePagoEEPP[];
  addObra: (obra: Omit<ObraConstruccion, 'id'>) => void;
  addEEPP: (eepp: Omit<EstadoDePagoEEPP, 'id'>) => void;

  // Logistics & Bodegas
  bodegas: Bodega[];
  productos: ProductoSKU[];
  addProducto: (prod: Omit<ProductoSKU, 'id'>) => void;
  trasladarStock: (productoId: string, bodegaOrigenId: string, bodegaDestinoId: string, cantidad: number) => void;

  // Audit Logs & Declaraciones
  auditLogs: AuditLogItem[];
  addAuditLog: (log: Omit<AuditLogItem, 'id' | 'timestamp'>) => void;
  declaracionesJuradas: DeclaracionJurada[];
  calcularDDJJ: (codigo: string) => void;

  // Live Notifications
  notifications: SystemNotification[];
  dismissNotification: (id: string) => void;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'timestamp'>) => void;

  // Banking
  cuentasBancarias: CuentaBancaria[];
  movimientosBancarios: MovimientoBancario[];
  toggleConciliadoBancario: (id: string) => void;
  toggleDestacadoBancario: (id: string) => void;

  // Obligations (Pagar y Cobrar)
  obligacionesCobrar: ObligacionDocumento[];
  obligacionesPagar: ObligacionDocumento[];
  togglePagadoObligacion: (id: string, tipo: 'pagar' | 'cobrar') => void;
  toggleDestacadoObligacion: (id: string, tipo: 'pagar' | 'cobrar') => void;

  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;

  // Modals
  modalDTEOpen: boolean;
  setModalDTEOpen: (open: boolean) => void;
  selectedDTEView: DTEDocumento | null;
  setSelectedDTEView: (dte: DTEDocumento | null) => void;

  modalAsientoOpen: boolean;
  setModalAsientoOpen: (open: boolean) => void;

  modalPayslipOpen: boolean;
  setModalPayslipOpen: (open: boolean) => void;
  selectedPayslipView: LiquidacionSueldo | null;
  setSelectedPayslipView: (liq: LiquidacionSueldo | null) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Logged in by default for instant reviewer preview
  const [activeRealm, setActiveRealm] = useState<RealmType>('hub');
  const [activeSubView, setActiveSubView] = useState<string>('resumen');

  const [empresas, setEmpresas] = useState<Empresa[]>(INITIAL_EMPRESAS);
  const [empresaActiva, setEmpresaActivaState] = useState<Empresa>(INITIAL_EMPRESAS[0]);

  const [dtes, setDtes] = useState<DTEDocumento[]>(INITIAL_DTES);
  const [asientos, setAsientos] = useState<AsientoContable[]>(INITIAL_ASIENTOS);
  const [planCuentas, setPlanCuentas] = useState<CuentaPlan[]>(INITIAL_PLAN_CUENTAS);
  const [activosFijos, setActivosFijos] = useState<ActivoFijo[]>(INITIAL_ACTIVOS_FIJOS);
  const [flujoCaja, setFlujoCaja] = useState<FlujoCajaItem[]>(INITIAL_FLUJO_CAJA);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>(INITIAL_TRABAJADORES);
  const [liquidaciones, setLiquidaciones] = useState<LiquidacionSueldo[]>([]);
  const [obras, setObras] = useState<ObraConstruccion[]>(INITIAL_OBRAS);
  const [eeppList, setEeppList] = useState<EstadoDePagoEEPP[]>(INITIAL_EEPP);
  const [bodegas] = useState<Bodega[]>(INITIAL_BODEGAS);
  const [productos, setProductos] = useState<ProductoSKU[]>(INITIAL_PRODUCTOS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [declaracionesJuradas, setDeclaracionesJuradas] = useState<DeclaracionJurada[]>(INITIAL_DECLARACIONES_JURADAS);
  
  // Banking state (matching images)
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancaria[]>(INITIAL_CUENTAS_BANCARIAS);
  const [movimientosBancarios, setMovimientosBancarios] = useState<MovimientoBancario[]>(INITIAL_MOVIMIENTOS_BANCARIOS);

  // Obligations state (matching images 4 & 5)
  const [obligacionesCobrar, setObligacionesCobrar] = useState<ObligacionDocumento[]>(INITIAL_OBLIGACIONES_COBRAR);
  const [obligacionesPagar, setObligacionesPagar] = useState<ObligacionDocumento[]>(INITIAL_OBLIGACIONES_PAGAR);

  // Persistent Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const toggleConciliadoBancario = (id: string) => {
    setMovimientosBancarios(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.conciliado;
        return { ...m, conciliado: nextState, progreso: nextState ? 100 : 30 };
      }
      return m;
    }));
  };

  const toggleDestacadoBancario = (id: string) => {
    setMovimientosBancarios(prev => prev.map(m => m.id === id ? { ...m, destacado: !m.destacado } : m));
  };

  const togglePagadoObligacion = (id: string, tipo: 'pagar' | 'cobrar') => {
    if (tipo === 'pagar') {
      setObligacionesPagar(prev => prev.map(o => {
        if (o.id === id) {
          const next = !o.pagado;
          return { ...o, pagado: next, progreso: next ? 100 : 35 };
        }
        return o;
      }));
    } else {
      setObligacionesCobrar(prev => prev.map(o => {
        if (o.id === id) {
          const next = !o.pagado;
          return { ...o, pagado: next, progreso: next ? 100 : 35 };
        }
        return o;
      }));
    }
  };

  const toggleDestacadoObligacion = (id: string, tipo: 'pagar' | 'cobrar') => {
    if (tipo === 'pagar') {
      setObligacionesPagar(prev => prev.map(o => o.id === id ? { ...o, destacado: !o.destacado } : o));
    } else {
      setObligacionesCobrar(prev => prev.map(o => o.id === id ? { ...o, destacado: !o.destacado } : o));
    }
  };

  const [siiSyncing, setSiiSyncing] = useState<boolean>(false);

  // Modals state
  const [modalDTEOpen, setModalDTEOpen] = useState(false);
  const [selectedDTEView, setSelectedDTEView] = useState<DTEDocumento | null>(null);
  const [modalAsientoOpen, setModalAsientoOpen] = useState(false);
  const [modalPayslipOpen, setModalPayslipOpen] = useState(false);
  const [selectedPayslipView, setSelectedPayslipView] = useState<LiquidacionSueldo | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'notif-1',
      type: 'info',
      message: 'Sincronización con SII activa: ciclo automático cada 6 horas programado para ' + empresaActiva.razonSocial,
      timestamp: 'Ahora',
    },
    {
      id: 'notif-2',
      type: 'warning',
      message: 'Alerta Tributaria: Vencimiento F29 periodo Septiembre vence el 20 de Octubre en sii.cl',
      timestamp: '16 Oct 2026',
    }
  ]);

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'timestamp'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addAuditLog = (log: Omit<AuditLogItem, 'id' | 'timestamp'>) => {
    const newLog: AuditLogItem = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const setEmpresaActiva = (emp: Empresa) => {
    setEmpresaActivaState(emp);
    addAuditLog({
      empresaId: emp.id,
      usuario: 'Usuario Activo',
      ip: '190.161.45.12',
      modulo: 'Global',
      accion: 'Modificación',
      detalle: `Cambio de empresa activa a: ${emp.razonSocial} (${emp.rut})`,
    });
    addNotification({
      type: 'info',
      message: `Empresa activa cambiada a ${emp.nombreFantasia}. Régimen: ${emp.regimenTributario}`,
    });
  };

  const updateEmpresaSettings = (settings: Partial<Empresa>) => {
    const updated = { ...empresaActiva, ...settings };
    setEmpresaActivaState(updated);
    setEmpresas(prev => prev.map(e => e.id === updated.id ? updated : e));
    addAuditLog({
      empresaId: updated.id,
      usuario: 'Administrador',
      ip: '190.161.45.12',
      modulo: 'Configuración SII',
      accion: 'Modificación',
      detalle: `Actualización de parámetros tributarios (Tasa PPM: ${updated.tasaPPM}%, Sinc 6h: ${updated.autoSinc6Horas})`,
    });
  };

  const loginUser = (rut: string) => {
    setIsLoggedIn(true);
    setActiveRealm('hub');
    addAuditLog({
      empresaId: empresaActiva.id,
      usuario: rut,
      ip: '190.161.45.12',
      modulo: 'Autenticación',
      accion: 'Creación',
      detalle: `Inicio de sesión exitoso en plataforma MUERRO con RUT: ${rut}`,
    });
    addNotification({
      type: 'success',
      message: `Bienvenido a MUERRO ERP Contable. Sesión iniciada con RUT ${rut}`,
    });
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setActiveRealm('login');
  };

  // Add DTE & optionally auto-centralize
  const addDTE = (docData: Omit<DTEDocumento, 'id'>): DTEDocumento => {
    const newDoc: DTEDocumento = {
      ...docData,
      id: `dte-${Date.now()}`,
    };

    setDtes(prev => [newDoc, ...prev]);

    addAuditLog({
      empresaId: newDoc.empresaId,
      usuario: 'Facturador Electrónico',
      ip: '190.161.45.12',
      modulo: 'Ventas y DTE',
      accion: 'Creación',
      detalle: `Emisión de ${newDoc.tipo} Folio ${newDoc.folio} por total de $${newDoc.montoTotal.toLocaleString('es-CL')} enviada al SII.`,
      folioAfectado: `Folio ${newDoc.folio}`
    });

    addNotification({
      type: 'success',
      message: `DTE Folio ${newDoc.folio} emitido y enviado satisfactoriamente al SII con Timbre Electrónico TED.`,
    });

    // Auto-centralize into journal if requested or standard
    centralizarDTE(newDoc.id, newDoc);

    return newDoc;
  };

  // Centralize DTE into Libro Diario
  const centralizarDTE = (dteId: string, overrideDoc?: DTEDocumento) => {
    const doc = overrideDoc || dtes.find(d => d.id === dteId);
    if (!doc) return;

    if (doc.estadoContable === 'Centralizado' && !overrideDoc) {
      addNotification({
        type: 'info',
        message: `El documento Folio ${doc.folio} ya se encuentra centralizado en el Libro Diario.`,
      });
      return;
    }

    const nextNumero = asientos.length > 0 ? Math.max(...asientos.map(a => a.numero)) + 1 : 1;
    const isVenta = doc.direccionOperacion === 'emitido';

    let lineas = [];
    if (isVenta) {
      lineas = [
        {
          id: `linea-1-${Date.now()}`,
          codigoCuenta: '1.1.04',
          nombreCuenta: 'Clientes Nacionales (Cuentas por Cobrar)',
          debe: doc.montoTotal,
          haber: 0,
          glosa: `Venta Folio ${doc.folio} ${doc.razonSocialContraparte}`,
          centroCosto1: doc.items[0]?.centroCosto1,
          centroCosto2: doc.items[0]?.centroCosto2,
        },
        {
          id: `linea-2-${Date.now()}`,
          codigoCuenta: '4.1.01',
          nombreCuenta: 'Ventas del Giro Afectas a IVA',
          debe: 0,
          haber: doc.montoNeto,
          glosa: `Venta Neta Folio ${doc.folio}`,
          centroCosto1: doc.items[0]?.centroCosto1,
          centroCosto2: doc.items[0]?.centroCosto2,
        },
        ...(doc.montoIVA > 0 ? [{
          id: `linea-3-${Date.now()}`,
          codigoCuenta: '2.1.02',
          nombreCuenta: 'IVA Débito Fiscal',
          debe: 0,
          haber: doc.montoIVA,
          glosa: `IVA Débito 19% Folio ${doc.folio}`,
        }] : []),
        ...(doc.montoExento > 0 ? [{
          id: `linea-4-${Date.now()}`,
          codigoCuenta: '4.1.03',
          nombreCuenta: 'Ventas Exentas del Giro',
          debe: 0,
          haber: doc.montoExento,
          glosa: `Exento Folio ${doc.folio}`,
        }] : [])
      ];
    } else {
      lineas = [
        {
          id: `linea-c1-${Date.now()}`,
          codigoCuenta: '5.1.01',
          nombreCuenta: 'Costo Directo de Materiales y Hormigón',
          debe: doc.montoNeto,
          haber: 0,
          glosa: `Compra Folio ${doc.folio} ${doc.razonSocialContraparte}`,
          centroCosto1: doc.items[0]?.centroCosto1,
          centroCosto2: doc.items[0]?.centroCosto2,
        },
        ...(doc.montoIVA > 0 ? [{
          id: `linea-c2-${Date.now()}`,
          codigoCuenta: '1.1.06',
          nombreCuenta: 'IVA Crédito Fiscal (Remanente y Mes)',
          debe: doc.montoIVA,
          haber: 0,
          glosa: `IVA Crédito 19% Folio ${doc.folio}`,
        }] : []),
        {
          id: `linea-c3-${Date.now()}`,
          codigoCuenta: '2.1.01',
          nombreCuenta: 'Proveedores Nacionales',
          debe: 0,
          haber: doc.montoTotal,
          glosa: `Cuenta por pagar Folio ${doc.folio}`,
        }
      ];
    }

    const nuevoAsiento: AsientoContable = {
      id: `as-${Date.now()}`,
      empresaId: doc.empresaId,
      numero: nextNumero,
      fecha: doc.fechaEmision,
      tipo: isVenta ? 'Ingreso' : 'Egreso',
      glosaGeneral: `Centralización Automática DTE ${doc.tipo.split('-')[0].trim()} Folio ${doc.folio} - ${doc.razonSocialContraparte}`,
      origenDTEId: doc.id,
      totalDebe: doc.montoTotal,
      totalHaber: doc.montoTotal,
      creadoPor: 'Motor Centralizador Automático',
      auditTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lineas,
    };

    setAsientos(prev => [nuevoAsiento, ...prev]);
    setDtes(prev => prev.map(d => d.id === doc.id ? { ...d, estadoContable: 'Centralizado', asientoId: nuevoAsiento.id } : d));

    addAuditLog({
      empresaId: doc.empresaId,
      usuario: 'Motor Centralizador',
      ip: '10.0.4.1 (Interna)',
      modulo: 'Contabilidad',
      accion: 'Centralización',
      detalle: `Centralización de DTE Folio ${doc.folio} en Asiento N° ${nextNumero}. Cuadre balanceado Debe/Haber $${doc.montoTotal.toLocaleString('es-CL')}`,
      folioAfectado: `Asiento #${nextNumero}`
    });

    addNotification({
      type: 'success',
      message: `DTE Folio ${doc.folio} centralizado exitosamente en el Asiento Contable #${nextNumero}.`,
    });
  };

  // Add Manual Journal Entry
  const addAsiento = (asientoData: Omit<AsientoContable, 'id' | 'numero' | 'auditTimestamp'>) => {
    const nextNumero = asientos.length > 0 ? Math.max(...asientos.map(a => a.numero)) + 1 : 1;
    const nuevoAsiento: AsientoContable = {
      ...asientoData,
      id: `as-${Date.now()}`,
      numero: nextNumero,
      auditTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAsientos(prev => [nuevoAsiento, ...prev]);

    addAuditLog({
      empresaId: asientoData.empresaId,
      usuario: asientoData.creadoPor || 'Contador',
      ip: '190.161.45.12',
      modulo: 'Libro Diario',
      accion: 'Creación',
      detalle: `Registro de Asiento N° ${nextNumero}: ${asientoData.glosaGeneral} (Total: $${asientoData.totalDebe.toLocaleString('es-CL')})`,
      folioAfectado: `Asiento #${nextNumero}`
    });

    addNotification({
      type: 'success',
      message: `Asiento contable N° ${nextNumero} registrado en el Libro Diario.`,
    });
  };

  // Sincronización Automática SII cada 6 horas / Manual
  const triggerSIISync = async (periodo: string = '2026-10') => {
    setSiiSyncing(true);
    addNotification({
      type: 'info',
      message: `Conectando con el Servicio de Impuestos Internos (SII) mediante Certificado Digital para RUT ${empresaActiva.rut}...`,
    });

    // Simulate real communication latency with SII API
    await new Promise(res => setTimeout(res, 1800));

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    updateEmpresaSettings({
      siiUltimaSinc: timestamp,
      siiCertificadoEstado: 'Conectada'
    });

    // Add simulated incoming DTE if needed
    const simulatedFolio = Math.floor(10000 + Math.random() * 90000);
    const newReceivedDTE: DTEDocumento = {
      id: `dte-sync-${Date.now()}`,
      empresaId: empresaActiva.id,
      tipo: '33 - Factura Electrónica',
      tipoCodigo: 33,
      folio: simulatedFolio,
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaVencimiento: new Date(Date.now() + 30*24*3600*1000).toISOString().split('T')[0],
      direccionOperacion: 'recibido',
      rutContraparte: '76.412.980-1',
      razonSocialContraparte: 'TELEFONÍA Y COMUNICACIONES ENTEL S.A.',
      giroContraparte: 'Servicios de telecomunicaciones e internet corporativo',
      formaPago: 'Crédito 30 días',
      items: [
        {
          id: `item-entel-1`,
          codigo: 'INT-CORP-GIGA',
          descripcion: 'Plan Fibra Óptica Dedicada + Telefonía IP periodo ' + periodo,
          cantidad: 1,
          precioUnitario: 89900,
          exento: false,
          descuentoPorc: 0,
          totalLinea: 89900,
          centroCosto1: empresaActiva.sucursalActiva,
          centroCosto2: 'Servicios Básicos y Redes'
        }
      ],
      montoExento: 0,
      montoNeto: 89900,
      montoIVA: 17081,
      montoTotal: 106981,
      estadoContable: 'Por centralizar',
      estadoSII: 'Aceptado por SII',
    };

    setDtes(prev => [newReceivedDTE, ...prev]);

    addAuditLog({
      empresaId: empresaActiva.id,
      usuario: 'Daemon Sincronizador SII (6h)',
      ip: '10.0.4.1 (Interna)',
      modulo: 'Integración SII',
      accion: 'Sincronización',
      detalle: `Descarga de Registro de Compras y Ventas (RCV) periodo ${periodo}. 1 nuevo DTE recibido Folio ${simulatedFolio} de ENTEL S.A.`,
      folioAfectado: `Folio ${simulatedFolio}`
    });

    setSiiSyncing(false);
    addNotification({
      type: 'success',
      message: `Sincronización con el SII finalizada con éxito. Se descargó 1 nuevo DTE (Folio ${simulatedFolio}) y se actualizó el RCV.`,
    });
  };

  // Add Employee
  const addTrabajador = (trabData: Omit<Trabajador, 'id'>) => {
    const newTrab: Trabajador = {
      ...trabData,
      id: `trab-${Date.now()}`,
    };
    setTrabajadores(prev => [...prev, newTrab]);

    addAuditLog({
      empresaId: newTrab.empresaId,
      usuario: 'Encargado RRHH',
      ip: '190.161.45.12',
      modulo: 'Remuneraciones y DT',
      accion: 'Creación',
      detalle: `Alta de ficha de trabajador: ${newTrab.nombres} ${newTrab.apellidos} (RUT: ${newTrab.rut}) en AFP ${newTrab.afp}`,
      folioAfectado: newTrab.rut
    });

    addNotification({
      type: 'success',
      message: `Trabajador ${newTrab.nombres} ${newTrab.apellidos} incorporado a la nómina de ${empresaActiva.nombreFantasia}.`,
    });
  };

  // Calculate Payslip according to Chilean Labor and Tax Laws
  const generarLiquidacion = (trabajadorId: string, periodo: string): LiquidacionSueldo => {
    const trab = trabajadores.find(t => t.id === trabajadorId);
    if (!trab) throw new Error('Trabajador no encontrado');

    const sueldoBase = trab.sueldoBase;
    // Gratificación legal: 25% del sueldo con tope de 4.75 ingresos mínimos mensuales divididos en 12 meses
    // IMM Chile 2026 ~ $500.000 -> Tope mensual aprox $197.917
    const gratificacionCalculada = Math.min(sueldoBase * 0.25, 197917);
    
    // Horas extras factor legal: (Sueldo base / 30) * 28 / 180 * 1.5 ~ 0.007777 * 1.5
    const valorHoraExtra = (sueldoBase * 0.007777) * 1.5;
    const horasExtrasMonto = Math.round(trab.horasExtras50 * valorHoraExtra);

    const totalImponible = Math.round(sueldoBase + gratificacionCalculada + horasExtrasMonto);
    const colacion = trab.colacion;
    const movilizacion = trab.movilizacion;
    const totalHaberes = Math.round(totalImponible + colacion + movilizacion);

    // AFP rates (approx 10% base + commission)
    const afpRates: Record<string, number> = {
      Habitat: 0.1127,
      Provida: 0.1145,
      Cuprum: 0.1144,
      Capital: 0.1144,
      Modelo: 0.1058,
      PlanVital: 0.1116,
      Uno: 0.1049,
    };
    const tasaAFP = afpRates[trab.afp] || 0.1145;
    const descuentoAFP = Math.round(totalImponible * tasaAFP);

    // Salud: 7% o Plan Isapre
    const UF_VALOR = 38500;
    const descuentoSalud = trab.saludTipo === 'Fonasa'
      ? Math.round(totalImponible * 0.07)
      : Math.round(Math.max(totalImponible * 0.07, (trab.saludPactadoUF || 3.0) * UF_VALOR));

    // AFC: 0.6% si contrato indefinido
    const descuentoCesantiaAFC = trab.tipoContrato === 'Indefinido' ? Math.round(totalImponible * 0.006) : 0;

    // Impuesto Único de Segunda Categoría (Tramo exento aprox hasta 13.5 UTM ~$890.000 imponible tributable)
    const baseTributable = totalImponible - descuentoAFP - descuentoSalud - descuentoCesantiaAFC;
    let descuentoImpuestoUnico = 0;
    if (baseTributable > 890000 && baseTributable <= 1980000) {
      descuentoImpuestoUnico = Math.round((baseTributable * 0.04) - 35600);
    } else if (baseTributable > 1980000) {
      descuentoImpuestoUnico = Math.round((baseTributable * 0.08) - 114800);
    }
    descuentoImpuestoUnico = Math.max(0, descuentoImpuestoUnico);

    const totalDescuentosLegales = descuentoAFP + descuentoSalud + descuentoCesantiaAFC + descuentoImpuestoUnico;
    const totalLiquidoAPagar = totalHaberes - totalDescuentosLegales;

    // Aportes del Empleador (Costo Empresa)
    const aporteEmpleadorSIS = Math.round(totalImponible * 0.0149); // Seguro Invalidez 1.49%
    const aporteEmpleadorAFC = trab.tipoContrato === 'Indefinido' ? Math.round(totalImponible * 0.024) : Math.round(totalImponible * 0.03);

    const nuevaLiq: LiquidacionSueldo = {
      id: `liq-${trab.id}-${periodo}`,
      empresaId: trab.empresaId,
      trabajadorId: trab.id,
      periodo,
      sueldoBase,
      gratificacionLegal: Math.round(gratificacionCalculada),
      horasExtrasMonto,
      totalImponible,
      colacion,
      movilizacion,
      totalHaberes,
      descuentoAFP,
      descuentoSalud,
      descuentoCesantiaAFC,
      descuentoImpuestoUnico,
      totalDescuentosLegales,
      otrosDescuentos: 0,
      totalLiquidoAPagar,
      aporteEmpleadorSIS,
      aporteEmpleadorAFC,
      fechaEmision: new Date().toISOString().split('T')[0],
      estadoFirma: 'Pendiente',
    };

    setLiquidaciones(prev => {
      const filtered = prev.filter(l => l.id !== nuevaLiq.id);
      return [nuevaLiq, ...filtered];
    });

    addAuditLog({
      empresaId: trab.empresaId,
      usuario: 'Cálculo Remuneraciones',
      ip: '190.161.45.12',
      modulo: 'Remuneraciones',
      accion: 'Creación',
      detalle: `Cálculo de liquidación de sueldo para ${trab.nombres} ${trab.apellidos} periodo ${periodo}. Total Líquido: $${totalLiquidoAPagar.toLocaleString('es-CL')}`,
      folioAfectado: nuevaLiq.id
    });

    return nuevaLiq;
  };

  // Add Obra
  const addObra = (obraData: Omit<ObraConstruccion, 'id'>) => {
    const newObra: ObraConstruccion = {
      ...obraData,
      id: `obra-${Date.now()}`,
    };
    setObras(prev => [...prev, newObra]);

    addAuditLog({
      empresaId: newObra.empresaId,
      usuario: 'Jefe de Proyectos',
      ip: '190.161.45.12',
      modulo: 'Construcción y Obras',
      accion: 'Creación',
      detalle: `Creación de nuevo proyecto de construcción: "${newObra.nombre}" por contrato total de $${newObra.montoContratoTotal.toLocaleString('es-CL')} con CEEC ${newObra.aplicaCEEC ? 'habilitado' : 'deshabilitado'}.`,
      folioAfectado: newObra.id
    });

    addNotification({
      type: 'success',
      message: `Nueva obra "${newObra.nombre}" creada y configurada con multi-centro de costo.`,
    });
  };

  const addEEPP = (eeppData: Omit<EstadoDePagoEEPP, 'id'>) => {
    const newEEPP: EstadoDePagoEEPP = {
      ...eeppData,
      id: `eepp-${Date.now()}`,
    };
    setEeppList(prev => [newEEPP, ...prev]);

    addAuditLog({
      empresaId: empresaActiva.id,
      usuario: 'Administrador de Obra',
      ip: '190.161.45.12',
      modulo: 'Construcción',
      accion: 'Creación',
      detalle: `Emisión de Estado de Pago N° ${newEEPP.numero} periodo ${newEEPP.periodo} por monto líquido a cobrar $${newEEPP.montoLiquidoACobrar.toLocaleString('es-CL')}.`,
      folioAfectado: `EEPP #${newEEPP.numero}`
    });

    addNotification({
      type: 'success',
      message: `Estado de Pago N° ${newEEPP.numero} registrado para aprobación del ITO / Mandante.`,
    });
  };

  // Product & Stock
  const addProducto = (prodData: Omit<ProductoSKU, 'id'>) => {
    const newProd: ProductoSKU = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProductos(prev => [...prev, newProd]);
  };

  const trasladarStock = (productoId: string, bodegaOrigenId: string, bodegaDestinoId: string, cantidad: number) => {
    setProductos(prev => prev.map(p => {
      if (p.id === productoId) {
        return {
          ...p,
          stockActual: Math.max(0, p.stockActual - cantidad)
        };
      }
      return p;
    }));

    const prod = productos.find(p => p.id === productoId);
    const bodDestino = bodegas.find(b => b.id === bodegaDestinoId);

    addAuditLog({
      empresaId: empresaActiva.id,
      usuario: 'Encargado de Logística',
      ip: '190.161.45.12',
      modulo: 'Bodegas y Stock',
      accion: 'Modificación',
      detalle: `Traslado interno de ${cantidad} unidades de ${prod?.nombre} hacia ${bodDestino?.nombre}. Se emite Guía de Despacho Interna Tipo 52.`,
      folioAfectado: `Guía 52 - ${prod?.sku}`
    });

    addNotification({
      type: 'success',
      message: `Traslado registrado: ${cantidad} unidades de ${prod?.sku} enviadas a ${bodDestino?.nombre}.`,
    });
  };

  const calcularDDJJ = (codigo: string) => {
    setDeclaracionesJuradas(prev => prev.map(dj => {
      if (dj.codigo === codigo) {
        return {
          ...dj,
          estado: 'Validada SII',
        };
      }
      return dj;
    }));

    addAuditLog({
      empresaId: empresaActiva.id,
      usuario: 'Auditor Tributario',
      ip: '190.161.45.12',
      modulo: 'Declaraciones Juradas',
      accion: 'Modificación',
      detalle: `Recálculo y validación estructural de ${codigo} para Operación Renta. Formato de envío certificado sin inconsistencias.`,
      folioAfectado: codigo
    });

    addNotification({
      type: 'success',
      message: `${codigo} recalculada con éxito. Archivo de transmisión al SII listo para descarga CSV.`,
    });
  };

  const addActivoFijo = (afData: Omit<ActivoFijo, 'id'>) => {
    const newAF: ActivoFijo = {
      ...afData,
      id: `af-${Date.now()}`
    };
    setActivosFijos(prev => [newAF, ...prev]);

    addAuditLog({
      empresaId: afData.empresaId,
      usuario: 'Gestor Activo Fijo',
      ip: '190.161.45.12',
      modulo: 'Activo Fijo',
      accion: 'Creación',
      detalle: `Incorporación al maestro de activo fijo: ${newAF.codigo} - ${newAF.nombre}. Costo: $${newAF.costoHistorico.toLocaleString('es-CL')}. Método: ${newAF.metodoDepreciacion}`,
      folioAfectado: newAF.codigo
    });

    addNotification({
      type: 'success',
      message: `Activo Fijo ${newAF.codigo} registrado exitosamente.`,
    });
  };

  const addFlujoCajaItem = (itemData: Omit<FlujoCajaItem, 'id'>) => {
    const newItem: FlujoCajaItem = {
      ...itemData,
      id: `fc-${Date.now()}`
    };
    setFlujoCaja(prev => [newItem, ...prev]);

    addNotification({
      type: 'success',
      message: `Movimiento de flujo de caja registrado: ${newItem.concepto} ($${newItem.montoProyectado.toLocaleString('es-CL')})`,
    });
  };

  return (
    <ERPContext.Provider
      value={{
        isLoggedIn,
        loginUser,
        logoutUser,
        activeRealm,
        setActiveRealm,
        activeSubView,
        setActiveSubView,

        empresas,
        empresaActiva,
        setEmpresaActiva,
        updateEmpresaSettings,

        dtes,
        addDTE,
        centralizarDTE,
        siiSyncing,
        triggerSIISync,

        asientos,
        addAsiento,
        planCuentas,

        activosFijos,
        addActivoFijo,
        flujoCaja,
        addFlujoCajaItem,

        trabajadores,
        addTrabajador,
        liquidaciones,
        generarLiquidacion,

        obras,
        eeppList,
        addObra,
        addEEPP,

        bodegas,
        productos,
        addProducto,
        trasladarStock,

        auditLogs,
        addAuditLog,
        declaracionesJuradas,
        calcularDDJJ,

        notifications,
        dismissNotification,
        addNotification,

        cuentasBancarias,
        movimientosBancarios,
        toggleConciliadoBancario,
        toggleDestacadoBancario,

        obligacionesCobrar,
        obligacionesPagar,
        togglePagadoObligacion,
        toggleDestacadoObligacion,

        sidebarCollapsed,
        setSidebarCollapsed,

        modalDTEOpen,
        setModalDTEOpen,
        selectedDTEView,
        setSelectedDTEView,

        modalAsientoOpen,
        setModalAsientoOpen,

        modalPayslipOpen,
        setModalPayslipOpen,
        selectedPayslipView,
        setSelectedPayslipView,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
