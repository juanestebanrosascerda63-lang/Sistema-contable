import React from 'react';
import { useERP, RealmType } from '../../context/ERPContext';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const { activeRealm, activeSubView, setActiveRealm, setActiveSubView } = useERP();

  const realmLabels: Record<RealmType, string> = {
    login: 'Inicio de Sesión',
    hub: 'Hub Principal de Ámbitos',
    sii: 'Integración Directa SII',
    gestion_bancaria: 'Gestión Bancaria y Cartolas',
    oblig_pagar: 'Obligaciones por Pagar',
    oblig_cobrar: 'Obligaciones por Cobrar',
    contabilidad: 'Contabilidad y Registros',
    flujo_caja: 'Flujo de Caja y Liquidez',
    activo_fijo: 'Activos Fijos y Depreciación',
    impuestos: 'Impuestos y Cierre Anual',
    eeff: 'Estados Financieros IFRS',
    remuneraciones: 'Remuneraciones y RRHH',
    ventas: 'Ventas y Facturación DTE',
    logistica: 'Logística y Bodegas',
    portal_cliente: 'Portal del Cliente',
    construccion: 'Gestión Obras & Constructoras',
    config_contabilidad: 'Configuración Contable y Cuentas',
  };

  const subViewLabels: Record<string, string> = {
    resumen: 'Resumen General',
    configuracion: 'Configuración y Sincronización',
    compras_ventas: 'Libro de Compras y Ventas',
    libro_diario: 'Libro Diario Contable',
    libro_mayor: 'Libro Mayor',
    balance_8_columnas: 'Balance de 8 Columnas (Tributario)',
    situacion_financiera: 'Estado de Situación Financiera (NIC 1)',
    estado_resultado: 'Estado de Resultados (NIC 1)',
    honorarios: 'Libro de Honorarios (14.5%)',
    tesoreria: 'Tesorería y Pagos',
    conciliacion: 'Conciliación Bancaria',
    cuentas: 'Plan de Cuentas',
    control: 'Control y Métodos de Depreciación',
    comparativa: 'Comparativa Tributaria vs Financiera',
    recuadro10: 'Recuadro 10 F22 Depreciación',
    f29: 'Formulario 29 (Impuestos Mensuales)',
    f3600: 'IVA Exportador F3600',
    renta_f22: 'Renta Anual F22 & RRE',
    ddjj: 'Declaraciones Juradas (DDJJ)',
    correccion: 'Corrección Monetaria Art. 41',
    balance: 'Estado de Situación Financiera (NIC 1)',
    resultado: 'Resultado Integral (NIC 1)',
    flujo: 'Flujo de Efectivo (NIC 7)',
    activos_fijos: 'Activos Fijos (NIC 16)',
    auditoria: 'Auditoría y Audit Trail',
    dashboard: 'Panel de Remuneraciones',
    trabajadores: 'Ficha de Trabajadores',
    asistencia: 'Asistencia y Reloj Biométrico',
    liquidaciones: 'Emisión de Liquidaciones',
    lre_dt: 'Libro Remuneraciones Electrónico DT',
    emision: 'Emisión de DTE (hasta 60 líneas)',
    informes: 'Informes de Ventas y Cobranza',
    ranking: 'Ranking de Clientes y Productos',
    bodegas: 'Control de Bodegas y Stock',
    maestro_sku: 'Maestro de Productos SKU',
    traslados: 'Traslados Internos',
    termino_giro: 'Inventario Término de Giro',
    servicios: 'Servicios Habilitados Extranet',
    alertas: 'Alertas de Vencimiento',
    obras_list: 'Proyectos y Obras',
    avance: 'Estado de Avance vs Presupuesto',
    eepp: 'Estados de Pago y CEEC',
  };

  if (activeRealm === 'login') return null;

  return (
    <nav className="bg-white border-b border-[#E0E0E0] px-4 sm:px-6 lg:px-8 py-2 text-xs no-print">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-slate-500">
        <button
          onClick={() => {
            setActiveRealm('hub');
            setActiveSubView('resumen');
          }}
          className="flex items-center gap-1 hover:text-[#003366] transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Inicio</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

        <button
          onClick={() => setActiveRealm(activeRealm)}
          className={`hover:text-[#003366] transition-colors ${
            !activeSubView || activeSubView === 'resumen' ? 'font-semibold text-slate-800' : ''
          }`}
        >
          {realmLabels[activeRealm]}
        </button>

        {activeSubView && activeSubView !== 'resumen' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="font-semibold text-[#003366]">
              {subViewLabels[activeSubView] || activeSubView}
            </span>
          </>
        )}
      </div>
    </nav>
  );
};
