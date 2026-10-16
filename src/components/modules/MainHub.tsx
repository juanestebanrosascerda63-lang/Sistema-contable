import React from 'react';
import { useERP, RealmType } from '../../context/ERPContext';
import { 
  Calculator, 
  ShoppingBag, 
  Boxes, 
  Users, 
  Globe, 
  HardHat, 
  RefreshCw, 
  FileSpreadsheet, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Building2,
  PieChart
} from 'lucide-react';

export const MainHub: React.FC = () => {
  const { empresaActiva, setActiveRealm, setActiveSubView, dtes, trabajadores, obras, activosFijos, flujoCaja } = useERP();

  const dtesPendientesCentralizar = dtes.filter(d => d.estadoContable === 'Por centralizar').length;
  const trabajadoresActivos = trabajadores.filter(t => t.estado === 'Activo').length;
  const obrasActivas = obras.length;

  const navigateTo = (realm: RealmType, subView: string) => {
    setActiveRealm(realm);
    setActiveSubView(subView);
  };

  const cards = [
    {
      id: 'contabilidad',
      title: '1. Contabilidad, Mayor y Balances',
      description: 'Libro Mayor clasificado, Balance de 8 Columnas tributario, Estado de Situación Financiera, Estado de Resultados, Libro Diario y Libro de Compras/Ventas.',
      icon: <Calculator className="w-6 h-6 text-[#003366]" />,
      realm: 'contabilidad' as RealmType,
      defaultSubView: 'balance_8_columnas',
      badges: [
        'Libro Mayor', 
        'Balance 8 Columnas', 
        'Situación Financiera', 
        'Estado Resultados'
      ],
      stats: `${dtesPendientesCentralizar} DTEs por centralizar`,
      statsAlert: dtesPendientesCentralizar > 0,
      highlightColor: 'hover:border-[#003366]',
    },
    {
      id: 'flujo_caja',
      title: '2. Flujo de Caja y Liquidez',
      description: 'Control de flujo de caja directo e indirecto, conciliación de tesorería, proyección de ingresos operacionales, egresos, inversiones y financiamiento.',
      icon: <Wallet className="w-6 h-6 text-emerald-700" />,
      realm: 'flujo_caja' as RealmType,
      defaultSubView: 'resumen',
      badges: [
        'Flujo Operacional', 
        'Inversión & Financiamiento', 
        'Proyección Mensual', 
        'Saldo Bancario'
      ],
      stats: `${flujoCaja.length} Partidas registradas`,
      statsAlert: false,
      highlightColor: 'hover:border-emerald-600',
    },
    {
      id: 'activo_fijo',
      title: '3. Activos Fijos y Depreciación',
      description: 'Control de depreciación financiera (NIC 16 lineal/unidades) vs tributaria (Normal, Acelerada 1/3, Instantánea 1/10) y Recuadro 10 F22 Operación Renta.',
      icon: <Building2 className="w-6 h-6 text-amber-700" />,
      realm: 'activo_fijo' as RealmType,
      defaultSubView: 'control',
      badges: [
        'Depr. Acelerada 1/3', 
        'Depr. Financiera NIC 16', 
        'Impuesto Diferido', 
        'Recuadro 10 F22'
      ],
      stats: `${activosFijos.length} Activos en control`,
      statsAlert: false,
      highlightColor: 'hover:border-amber-600',
    },
    {
      id: 'impuestos',
      title: '4. Operación Renta F22, F29 y DDJJ',
      description: 'Formulario 22 Año Tributario 2026 oficial (Recuadros 10, 12 RLI, 17 Pro Pyme, 19 CPTS, RRE), F29 IVA/PPM y Declaraciones Juradas 1887/1879/1948.',
      icon: <FileSpreadsheet className="w-6 h-6 text-rose-700" />,
      realm: 'impuestos' as RealmType,
      defaultSubView: 'renta_f22',
      badges: [
        'F22 Renta AT 2026', 
        'Recuadros 10, 12, 17, 19', 
        'DDJJ 1879 / 1887 / 1948', 
        'F29 Mensual'
      ],
      stats: 'Formularios SII oficiales',
      statsAlert: false,
      highlightColor: 'hover:border-rose-600',
    },
    {
      id: 'ventas',
      title: '5. Ventas y Facturación DTE',
      description: 'Facturación Electrónica masiva y recurrente con soporte de hasta 60 líneas de detalle, gestión de Clientes, CRM y Timbre Electrónico (TED) certificado.',
      icon: <ShoppingBag className="w-6 h-6 text-blue-700" />,
      realm: 'ventas' as RealmType,
      defaultSubView: 'emision',
      badges: [
        'DTE 60 Líneas', 
        'Facturación Recurrente', 
        'Facturas 33 / 34', 
        'Boletas 39'
      ],
      stats: 'Soporte hasta 60 líneas',
      statsAlert: false,
      highlightColor: 'hover:border-blue-600',
    },
    {
      id: 'remuneraciones',
      title: '6. Remuneraciones y RRHH',
      description: 'Cálculo de liquidaciones de sueldo con normas laborales chilenas (AFP, Fonasa/Isapre, AFC), asistencia, reloj control biométrico y exportador oficial LRE Dirección del Trabajo.',
      icon: <Users className="w-6 h-6 text-purple-700" />,
      realm: 'remuneraciones' as RealmType,
      defaultSubView: 'dashboard',
      badges: [
        'Liquidaciones Sueldo', 
        'Directorio LRE DT', 
        'Reloj Control', 
        'Previred'
      ],
      stats: `${trabajadoresActivos} Colaboradores activos`,
      statsAlert: false,
      highlightColor: 'hover:border-purple-600',
    },
    {
      id: 'construccion',
      title: '7. Módulo Especial Constructoras',
      description: 'Multi-centro de costos avanzado simultáneo (Obra + Partida), seguimiento de Estado de Avance vs Presupuesto, Estados de Pago (EEPP), CEEC y retenciones de garantía.',
      icon: <HardHat className="w-6 h-6 text-orange-700" />,
      realm: 'construccion' as RealmType,
      defaultSubView: 'avance',
      badges: [
        'Doble Centro Costo', 
        'Avance vs Presupuesto', 
        'EEPP Mandante', 
        'Crédito CEEC'
      ],
      stats: `${obrasActivas} Obras en ejecución`,
      statsAlert: false,
      highlightColor: 'hover:border-orange-600',
    },
    {
      id: 'logistica',
      title: '8. Logística e Inventarios',
      description: 'Control multi-bodega, stock valorizado PMP, compras a proveedores, guías de traslado interno y control de inventario especializado para Término de Giro SII.',
      icon: <Boxes className="w-6 h-6 text-indigo-700" />,
      realm: 'logistica' as RealmType,
      defaultSubView: 'bodegas',
      badges: [
        'Multi-Bodega', 
        'Maestro SKU', 
        'Guías Tipo 52', 
        'Término de Giro'
      ],
      stats: '4 Bodegas registradas',
      statsAlert: false,
      highlightColor: 'hover:border-indigo-600',
    },
    {
      id: 'portal_cliente',
      title: '9. Portal del Cliente (Extranet)',
      description: 'Extranet para clientes finales y consultoras. Entrega controlada de F29, balances IFRS, liquidaciones firmadas, alertas de vencimientos y cuentas por cobrar.',
      icon: <Globe className="w-6 h-6 text-cyan-700" />,
      realm: 'portal_cliente' as RealmType,
      defaultSubView: 'servicios',
      badges: [
        'Extranet 24/7', 
        'Descarga F29 / Balances', 
        'Alertas Plazos', 
        'Seguridad Rol'
      ],
      stats: '5 Módulos habilitados',
      statsAlert: false,
      highlightColor: 'hover:border-cyan-600',
    },
    {
      id: 'sii',
      title: '10. Integración Directa con SII',
      description: 'Conexión automática cada 6 horas con el Servicio de Impuestos Internos. Descarga y sincronización de compras, ventas, guías y consulta de hasta 3 años de historial tributario.',
      icon: <RefreshCw className="w-6 h-6 text-[#0056B3]" />,
      realm: 'sii' as RealmType,
      defaultSubView: 'configuracion',
      badges: [
        'Ciclo Automático 6 Horas', 
        'Historial 3 Años', 
        'Certificado Digital', 
        'Descarga RCV'
      ],
      stats: `Última sinc: ${empresaActiva.siiUltimaSinc.split(' ')[0]}`,
      statsAlert: false,
      highlightColor: 'hover:border-[#0056B3]',
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Empresa Activa</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-700">{empresaActiva.rut}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#0056B3] font-medium">{empresaActiva.regimenTributario}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {empresaActiva.razonSocial}
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              {empresaActiva.giro}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => navigateTo('sii', 'configuracion')}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SII: {empresaActiva.siiCertificadoEstado}</span>
            </button>

            <button
              onClick={() => navigateTo('contabilidad', 'compras_ventas')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded shadow-xs flex items-center gap-2 transition-colors"
            >
              <span>Ir a Contabilidad</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hub Realm Selection Grid */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Selección de Ámbito de Trabajo
        </h2>
        <p className="text-xs text-slate-500">
          Seleccione el módulo operativo para iniciar la gestión contable, tributaria o administrativa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.id}
            onClick={() => navigateTo(c.realm, c.defaultSubView)}
            className={`bg-white border border-[#E0E0E0] rounded-lg p-5 cursor-pointer shadow-xs transition-all duration-150 flex flex-col justify-between ${c.highlightColor} hover:shadow-md group`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                  {c.icon}
                </div>
                <span className={`text-[11px] font-medium font-tabular ${c.statsAlert ? 'text-red-600' : 'text-slate-500'}`}>
                  {c.stats}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#003366] transition-colors mb-2">
                {c.title}
              </h3>

              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                {c.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {c.badges.map((b, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#003366] group-hover:text-[#0056B3]">
              <span>Ingresar al Módulo</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
