export interface Empresa {
  id: string;
  rut: string;
  razonSocial: string;
  nombreFantasia: string;
  giro: string;
  direccion: string;
  comuna: string;
  ciudad: string;
  regimenTributario: '14 D3 ProPyme General' | '14 D8 ProPyme Transparente' | '14 A Régimen General' | 'Renta Presunta';
  tasaPPM: number; // e.g. 1.25%
  isConstructora?: boolean;
  sucursalActiva: string;
  sucursales: string[];
  contactoEmail: string;
  representanteRut: string;
  representanteNombre: string;
  siiCertificadoEstado: 'Conectada' | 'Desconectada' | 'Error de Credenciales';
  siiUltimaSinc: string;
  autoSinc6Horas: boolean;
}

export type TipoDTE = 
  | '33 - Factura Electrónica'
  | '34 - Factura No Afecta o Exenta Electrónica'
  | '39 - Boleta Electrónica'
  | '61 - Nota de Crédito Electrónica'
  | '56 - Nota de Débito Electrónica'
  | '52 - Guía de Despacho Electrónica';

export interface DTEDetalleItem {
  id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  exento: boolean;
  descuentoPorc: number;
  totalLinea: number;
  centroCosto1?: string; // Obra
  centroCosto2?: string; // Partida
}

export interface DTEDocumento {
  id: string;
  empresaId: string;
  tipo: TipoDTE;
  tipoCodigo: number;
  folio: number;
  fechaEmision: string;
  fechaVencimiento: string;
  direccionOperacion: 'emitido' | 'recibido'; // Venta o Compra
  rutContraparte: string;
  razonSocialContraparte: string;
  giroContraparte: string;
  formaPago: 'Contado' | 'Crédito 30 días' | 'Crédito 60 días' | 'Crédito 90 días';
  items: DTEDetalleItem[];
  montoExento: number;
  montoNeto: number;
  montoIVA: number;
  montoTotal: number;
  estadoContable: 'Por centralizar' | 'Centralizado';
  estadoSII: 'Aceptado por SII' | 'Aceptado con Reparos' | 'Rechazado' | 'Pendiente';
  inconsistencia?: string;
  asientoId?: string;
  obraId?: string;
  partidaId?: string;
}

export interface LineaAsiento {
  id: string;
  codigoCuenta: string;
  nombreCuenta: string;
  debe: number;
  haber: number;
  glosa: string;
  centroCosto1?: string;
  centroCosto2?: string;
}

export interface AsientoContable {
  id: string;
  empresaId: string;
  numero: number;
  fecha: string;
  tipo: 'Ingreso' | 'Egreso' | 'Traspaso' | 'Apertura' | 'Cierre' | 'Ajuste IFRS';
  glosaGeneral: string;
  lineas: LineaAsiento[];
  totalDebe: number;
  totalHaber: number;
  origenDTEId?: string;
  creadoPor: string;
  auditTimestamp: string;
}

export interface CuentaPlan {
  codigo: string;
  nombre: string;
  tipo: 'Activo Corriente' | 'Activo No Corriente' | 'Pasivo Corriente' | 'Pasivo No Corriente' | 'Patrimonio' | 'Ingresos' | 'Costos' | 'Gastos';
  saldo: number;
  naturaleza: 'Deudora' | 'Acreedora';
}

export interface FilaBalance8Columnas {
  codigo: string;
  nombre: string;
  tipo: string;
  debitos: number;
  creditos: number;
  saldoDeudor: number;
  saldoAcreedor: number;
  activo: number;
  pasivo: number;
  perdida: number;
  ganancia: number;
}

export interface ActivoFijo {
  id: string;
  empresaId: string;
  codigo: string;
  nombre: string;
  categoria: 'Maquinarias y Equipos' | 'Vehículos' | 'Edificaciones' | 'Equipos Computacionales' | 'Instalaciones y Muebles';
  fechaAdquisicion: string;
  costoHistorico: number;
  valorResidual: number;
  vidaUtilFinancieraAnos: number; // IFRS
  vidaUtilTributariaNormalAnos: number; // SII Art 31 N°5
  vidaUtilAceleradaAnos: number; // 1/3 vida util normal
  metodoDepreciacion: 'Lineal Financiero (IFRS)' | 'Tributaria Normal (SII)' | 'Tributaria Acelerada (1/3)' | 'Instantánea / Super Acelerada (1/10)';
  depreciacionAcumuladaFinanciera: number;
  depreciacionAcumuladaTributaria: number;
  cuotaDeprFinancieraAnual: number;
  cuotaDeprTributariaAnual: number;
  diferenciaDepreciacion: number; // Tributaria - Financiera
  ubicacionObra?: string;
}

export interface FlujoCajaItem {
  id: string;
  empresaId: string;
  fecha: string;
  mes: string;
  categoria: 'Ingreso Operacional' | 'Egreso Operacional' | 'Inversión' | 'Financiamiento';
  concepto: string;
  montoProyectado: number;
  montoReal: number;
  estado: 'Proyectado' | 'Ejecutado' | 'Vencido';
  contraparte: string;
}

export interface Trabajador {
  id: string;
  empresaId: string;
  rut: string;
  nombres: string;
  apellidos: string;
  cargo: string;
  fechaIngreso: string;
  sueldoBase: number;
  afp: 'Provida' | 'Habitat' | 'Cuprum' | 'Capital' | 'Modelo' | 'PlanVital' | 'Uno';
  saludTipo: 'Fonasa' | 'Isapre Banmédica' | 'Isapre Colmena' | 'Isapre Consalud' | 'Isapre CruzBlanca' | 'Isapre Nueva Masvida';
  saludPactadoUF?: number;
  tipoContrato: 'Indefinido' | 'Plazo Fijo' | 'Por Obra o Faena';
  centroCosto1: string; // Obra o Depto
  centroCosto2: string; // Partida o Cargo
  colacion: number;
  movilizacion: number;
  diasTrabajadosMes: number;
  horasExtras50: number;
  diasLicencia: number;
  diasPermiso: number;
  email: string;
  estado: 'Activo' | 'Con Licencia' | 'Finiquitado';
}

export interface LiquidacionSueldo {
  id: string;
  empresaId: string;
  trabajadorId: string;
  periodo: string; // YYYY-MM
  sueldoBase: number;
  gratificacionLegal: number;
  horasExtrasMonto: number;
  totalImponible: number;
  colacion: number;
  movilizacion: number;
  totalHaberes: number;
  descuentoAFP: number;
  descuentoSalud: number;
  descuentoCesantiaAFC: number;
  descuentoImpuestoUnico: number;
  totalDescuentosLegales: number;
  otrosDescuentos: number;
  totalLiquidoAPagar: number;
  aporteEmpleadorSIS: number;
  aporteEmpleadorAFC: number;
  fechaEmision: string;
  estadoFirma: 'Pendiente' | 'Firmada Digitalmente';
}

export interface ObraConstruccion {
  id: string;
  empresaId: string;
  nombre: string;
  ubicacion: string;
  mandante: string;
  montoContratoTotal: number;
  fechaInicio: string;
  fechaTerminoEstimada: string;
  porcentajeAvanceFisico: number;
  aplicaCEEC: boolean; // Crédito Especial Empresas Constructoras
  retencionGarantiaPorc: number; // e.g. 5%
  partidas: PartidaObra[];
}

export interface PartidaObra {
  id: string;
  codigo: string;
  nombre: string;
  presupuestoAsignado: number;
  costoRealImputado: number;
  avancePorcentaje: number;
}

export interface EstadoDePagoEEPP {
  id: string;
  obraId: string;
  numero: number;
  periodo: string;
  montoAvanceNeto: number;
  montoRetencionGarantia: number;
  montoCEEC: number;
  montoLiquidoACobrar: number;
  fechaAprobacion: string;
  estado: 'Borrador' | 'Enviado a ITO' | 'Aprobado Mandante' | 'Facturado';
  facturaFolio?: number;
}

export interface Bodega {
  id: string;
  empresaId: string;
  nombre: string;
  ubicacion: string;
  responsable: string;
  esObra?: boolean;
}

export interface ProductoSKU {
  id: string;
  empresaId: string;
  sku: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  costoPromedioPonderado: number;
  precioVentaNeto: number;
  bodegaId: string;
  codigoBarra: string;
}

export interface AuditLogItem {
  id: string;
  empresaId: string;
  timestamp: string;
  usuario: string;
  ip: string;
  modulo: string;
  accion: 'Creación' | 'Modificación' | 'Anulación' | 'Centralización' | 'Sincronización' | 'Exportación';
  detalle: string;
  folioAfectado?: string;
}

export interface DeclaracionJurada {
  codigo: string;
  nombre: string;
  vencimiento: string;
  registrosCalculados: number;
  montoTotal: number;
  estado: 'Pendiente' | 'Generada' | 'Validada SII' | 'Enviada';
  archivoNombre: string;
}

export interface CuentaBancaria {
  id: string;
  empresaId: string;
  banco: 'BANCO SANTANDER' | 'BANCO BCI' | 'BANCO SCOTIABANK' | 'BANCO DE CHILE' | 'BANCO ESTADO' | 'BANCO MANUAL';
  numeroCuenta: string;
  moneda: 'CLP' | 'USD' | 'EUR';
  saldo: number;
  ultimaSinc: string;
  estado: 'activa' | 'desconectada' | 'invalida';
}

export interface MovimientoBancario {
  id: string;
  empresaId: string;
  cuentaBancariaId: string;
  banco: string;
  cargo: number; // e.g. -2162848 (if negative) or 0
  abono: number; // e.g. 60000 or 0
  fecha: string; // e.g. "16/10/2026"
  descripcion: string;
  progreso: number; // 0 to 100%
  conciliado: boolean;
  destacado?: boolean;
}

export interface ObligacionDocumento {
  id: string;
  empresaId: string;
  tipo: 'pagar' | 'cobrar';
  categoria: string;
  monto: number; // positive for cobrar, negative for pagar
  fecha: string;
  tipoDocumento: string; // 'DOCUMENTOS TRIBUTARIOS' | 'DTE PENDIENTE POR APROBAR' | 'OTROS PAGOS MENSUALES' | 'BOLETA HONORARIOS';
  descripcion: string;
  progreso: number; // 0 to 100
  pagado: boolean;
  destacado?: boolean;
  folio?: number;
  rutContraparte?: string;
}
