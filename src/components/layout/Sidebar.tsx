import React, { useState } from 'react';
import { useERP, RealmType } from '../../context/ERPContext';
import { 
  Landmark, 
  Receipt, 
  DollarSign, 
  Mail, 
  Building2, 
  Calculator, 
  Scale, 
  Wrench, 
  Sliders, 
  ChevronDown, 
  ChevronRight, 
  HardHat, 
  RefreshCw,
  ShoppingBag,
  Users,
  Boxes,
  Globe,
  CheckCircle2,
  AlertTriangle,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeRealm, 
    setActiveRealm, 
    activeSubView, 
    setActiveSubView,
    empresaActiva,
    sidebarCollapsed,
    setSidebarCollapsed
  } = useERP();

  const [contableOpen, setContableOpen] = useState(true);
  const [tributariaOpen, setTributariaOpen] = useState(true);

  const navigateTo = (realm: RealmType, subView: string) => {
    setActiveRealm(realm);
    setActiveSubView(subView);
  };

  if (activeRealm === 'login') return null;

  return (
    <aside 
      className={`${
        sidebarCollapsed ? 'w-14' : 'w-64'
      } bg-[#F4F7F9] border-r border-[#E2E8F0] flex flex-col shrink-0 transition-all duration-200 select-none no-print min-h-[calc(100vh-56px)]`}
    >
      {/* Top Toggle Collapse Bar */}
      <div className="p-2 border-b border-slate-200 flex items-center justify-between text-slate-500">
        {!sidebarCollapsed && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-2">
            Módulos del Sistema
          </span>
        )}
        <button
          onClick={() => setSidebarCollapsed(prev => !prev)}
          className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors ml-auto"
          title={sidebarCollapsed ? "Expandir Menú" : "Colapsar Menú"}
        >
          {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5 text-xs">
        
        {/* 1. Gestión Bancaria */}
        <button
          onClick={() => navigateTo('gestion_bancaria', 'resumen')}
          className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
            activeRealm === 'gestion_bancaria' 
              ? 'bg-[#E3EBF3] text-[#003366] font-bold border-l-3 border-[#003366]' 
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
          title="Gestión Bancaria y Cartolas"
        >
          <div className="text-rose-500 shrink-0">
            <Landmark className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && <span>Gestión Bancaria</span>}
        </button>

        {/* 2. Oblig. por Pagar */}
        <button
          onClick={() => navigateTo('oblig_pagar', 'todas')}
          className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
            activeRealm === 'oblig_pagar' 
              ? 'bg-[#E3EBF3] text-[#003366] font-bold border-l-3 border-[#003366]' 
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
          title="Obligaciones por Pagar (Proveedores / DTE)"
        >
          <div className="text-emerald-600 shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && <span>Oblig. por Pagar</span>}
        </button>

        {/* 3. Oblig. por Cobrar */}
        <button
          onClick={() => navigateTo('oblig_cobrar', 'todas')}
          className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
            activeRealm === 'oblig_cobrar' 
              ? 'bg-[#E3EBF3] text-[#003366] font-bold border-l-3 border-[#003366]' 
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
          title="Obligaciones por Cobrar (Clientes / DTE)"
        >
          <div className="text-teal-600 shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && <span>Oblig. por Cobrar</span>}
        </button>

        {/* 4. Oficina de Partes */}
        <button
          onClick={() => navigateTo('portal_cliente', 'servicios')}
          className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
            activeRealm === 'portal_cliente' 
              ? 'bg-[#E3EBF3] text-[#003366] font-bold border-l-3 border-[#003366]' 
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
          title="Oficina de Partes & Extranet"
        >
          <div className="text-orange-500 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && <span>Oficina de Partes</span>}
        </button>

        {/* 5. Gestión Activo Fijo (Beta) */}
        <button
          onClick={() => navigateTo('activo_fijo', 'control')}
          className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
            activeRealm === 'activo_fijo' 
              ? 'bg-[#E3EBF3] text-[#003366] font-bold border-l-3 border-[#003366]' 
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
          title="Libro de Activo Fijo & Depreciación"
        >
          <div className="text-pink-600 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between flex-1">
              <span>Gestión Activo Fijo</span>
              <span className="text-[9px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded font-medium">Beta</span>
            </div>
          )}
        </button>

        <div className="border-t border-slate-200 my-1"></div>

        {/* 6. GESTIÓN CONTABLE (Collapsible Section matching Image 1) */}
        <div>
          <button
            onClick={() => {
              if (sidebarCollapsed) {
                setSidebarCollapsed(false);
                setContableOpen(true);
              } else {
                setContableOpen(prev => !prev);
              }
            }}
            className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
              activeRealm === 'contabilidad' ? 'text-[#003366] font-bold' : 'text-slate-800 font-semibold hover:bg-slate-200/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="text-pink-500 shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              {!sidebarCollapsed && <span>Gestión Contable</span>}
            </div>
            {!sidebarCollapsed && (
              contableOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Submenu matching Image 1 */}
          {(!sidebarCollapsed && contableOpen) && (
            <div className="pl-7 pr-2 py-0.5 space-y-0.5 text-[11px] text-slate-600">
              <button
                onClick={() => navigateTo('contabilidad', 'balance_8_columnas')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'contabilidad' && activeSubView === 'balance_8_columnas'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <Landmark className="w-3 h-3 text-slate-500 shrink-0" />
                <span>Balance 8 Columnas</span>
              </button>

              <button
                onClick={() => navigateTo('contabilidad', 'situacion_financiera')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'contabilidad' && activeSubView === 'situacion_financiera'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                <span>Balance Clasificado</span>
              </button>

              <button
                onClick={() => navigateTo('contabilidad', 'estado_resultado')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'contabilidad' && activeSubView === 'estado_resultado'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <Sliders className="w-3 h-3 text-slate-500 shrink-0" />
                <span>Estado de Resultados</span>
              </button>

              <button
                onClick={() => navigateTo('contabilidad', 'eerr_comparativo')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'contabilidad' && activeSubView === 'eerr_comparativo'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <Sliders className="w-3 h-3 text-slate-500 shrink-0" />
                <span>EERR Año a Año</span>
              </button>

              <button
                onClick={() => navigateTo('contabilidad', 'libro_diario')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'contabilidad' && activeSubView === 'libro_diario'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <Receipt className="w-3 h-3 text-slate-500 shrink-0" />
                <span>Asientos</span>
              </button>

              <button
                onClick={() => navigateTo('contabilidad', 'libro_mayor')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'contabilidad' && activeSubView === 'libro_mayor'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <div className="w-3 h-3 border border-slate-500 rounded-xs shrink-0 flex items-center justify-center text-[8px] font-bold">M</div>
                <span>Libro Mayor</span>
              </button>

              <button
                onClick={() => navigateTo('contabilidad', 'libro_diario')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'contabilidad' && activeSubView === 'libro_diario'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <div className="w-3 h-3 border border-slate-500 rounded-xs shrink-0 flex items-center justify-center text-[8px] font-bold">D</div>
                <span>Libro Diario</span>
              </button>

              <button
                onClick={() => navigateTo('contabilidad', 'cuentas')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'contabilidad' && activeSubView === 'cuentas'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <div className="w-3 h-3 flex flex-col justify-center gap-0.5 shrink-0">
                  <div className="h-0.5 bg-slate-500 w-full rounded"></div>
                  <div className="h-0.5 bg-slate-500 w-full rounded"></div>
                  <div className="h-0.5 bg-slate-500 w-full rounded"></div>
                </div>
                <span>Plan de Cuentas</span>
              </button>
            </div>
          )}
        </div>

        {/* 7. GESTIÓN TRIBUTARIA (Collapsible Section matching Image 2) */}
        <div>
          <button
            onClick={() => {
              if (sidebarCollapsed) {
                setSidebarCollapsed(false);
                setTributariaOpen(true);
              } else {
                setTributariaOpen(prev => !prev);
              }
            }}
            className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
              activeRealm === 'impuestos' ? 'text-[#003366] font-bold' : 'text-slate-800 font-semibold hover:bg-slate-200/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="text-pink-500 shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              {!sidebarCollapsed && <span>Gestión Tributaria</span>}
            </div>
            {!sidebarCollapsed && (
              tributariaOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Submenu matching Image 2 */}
          {(!sidebarCollapsed && tributariaOpen) && (
            <div className="pl-7 pr-2 py-0.5 space-y-0.5 text-[11px] text-slate-600">
              <button
                onClick={() => navigateTo('impuestos', 'f29')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'impuestos' && activeSubView === 'f29'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <div className="w-3 h-3 border border-slate-500 rounded-xs shrink-0 flex items-center justify-center text-[7px] font-bold">29</div>
                <span>Propuesta F29</span>
              </button>

              <button
                onClick={() => navigateTo('contabilidad', 'compras_ventas')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'contabilidad' && activeSubView === 'compras_ventas'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <div className="w-3 h-3 border border-slate-500 rounded-xs shrink-0 flex items-center justify-center text-[7px] font-bold">CV</div>
                <span>Libro Compra / Venta</span>
              </button>

              <button
                onClick={() => navigateTo('sii', 'configuracion')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'sii' && activeSubView === 'configuracion'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <div className="w-3 h-3 border border-slate-500 rounded-xs shrink-0 flex items-center justify-center text-[7px] font-bold">RC</div>
                <span>Auditor tributario (RCV)</span>
              </button>

              <button
                onClick={() => navigateTo('contabilidad', 'honorarios')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'contabilidad' && activeSubView === 'honorarios'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <div className="w-3 h-3 border border-slate-500 rounded-xs shrink-0 flex items-center justify-center text-[7px] font-bold">BH</div>
                <span>Libro de Honorarios</span>
              </button>

              <button
                onClick={() => navigateTo('impuestos', 'renta_f22')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'impuestos' && activeSubView === 'renta_f22'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <div className="w-3 h-3 bg-blue-100 text-[#003366] rounded-xs shrink-0 flex items-center justify-center text-[7px] font-bold">RLI</div>
                <span>Propuesta RLI</span>
              </button>

              <button
                onClick={() => navigateTo('impuestos', 'renta_f22')}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 transition-colors ${
                  activeRealm === 'impuestos' && activeSubView === 'renta_f22'
                    ? 'bg-blue-50 text-[#003366] font-bold'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <div className="w-3 h-3 bg-rose-100 text-rose-800 rounded-xs shrink-0 flex items-center justify-center text-[7px] font-bold">F22</div>
                <span>Propuesta recuadro F22</span>
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 my-1"></div>

        {/* 8. Sincronizaciones SII & Talana (Image 7) */}
        <button
          onClick={() => navigateTo('sii', 'configuracion')}
          className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
            activeRealm === 'sii' 
              ? 'bg-[#E3EBF3] text-[#003366] font-bold border-l-3 border-[#003366]' 
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
          title="Sincronizaciones SII & Talana"
        >
          <div className="text-blue-600 shrink-0">
            <RefreshCw className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && <span>Conexiones & Sincronización</span>}
        </button>

        {/* 9. Ventas DTE */}
        <button
          onClick={() => navigateTo('ventas', 'emision')}
          className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
            activeRealm === 'ventas' 
              ? 'bg-[#E3EBF3] text-[#003366] font-bold border-l-3 border-[#003366]' 
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
          title="Facturación y Ventas DTE"
        >
          <div className="text-indigo-600 shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && <span>Ventas y DTE</span>}
        </button>

        {/* 10. Remuneraciones DT */}
        <button
          onClick={() => navigateTo('remuneraciones', 'dashboard')}
          className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
            activeRealm === 'remuneraciones' 
              ? 'bg-[#E3EBF3] text-[#003366] font-bold border-l-3 border-[#003366]' 
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
          title="Remuneraciones y LRE DT"
        >
          <div className="text-purple-600 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && <span>Remuneraciones</span>}
        </button>

        {/* 11. Bodega e Inventario */}
        <button
          onClick={() => navigateTo('logistica', 'bodegas')}
          className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
            activeRealm === 'logistica' 
              ? 'bg-[#E3EBF3] text-[#003366] font-bold border-l-3 border-[#003366]' 
              : 'text-slate-700 hover:bg-slate-200/60'
          }`}
          title="Bodegas e Inventario SKU"
        >
          <div className="text-amber-600 shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && <span>Inventarios & Bodega</span>}
        </button>

        {/* 12. Constructoras (si aplica) */}
        {empresaActiva.isConstructora && (
          <button
            onClick={() => navigateTo('construccion', 'avance')}
            className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${
              activeRealm === 'construccion' 
                ? 'bg-[#E3EBF3] text-[#003366] font-bold border-l-3 border-[#003366]' 
                : 'text-slate-700 hover:bg-slate-200/60'
            }`}
            title="Gestión de Obras & Constructoras"
          >
            <div className="text-orange-600 shrink-0">
              <HardHat className="w-4 h-4" />
            </div>
            {!sidebarCollapsed && <span>Obras & Constructoras</span>}
          </button>
        )}

        {/* 13. Config. Contabilidad */}
        <button
          onClick={() => navigateTo('contabilidad', 'cuentas')}
          className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-200/60 transition-colors"
          title="Configuración de Cuentas Contables"
        >
          <div className="text-pink-600 shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && <span>Config. Contabilidad</span>}
        </button>

        {/* 14. Ajustes Generales con dot */}
        <button
          onClick={() => navigateTo('sii', 'configuracion')}
          className="w-full text-left px-3 py-2 flex items-center justify-between text-slate-700 hover:bg-slate-200/60 transition-colors"
          title="Ajustes Generales del Sistema"
        >
          <div className="flex items-center gap-2.5">
            <div className="text-emerald-600 shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            {!sidebarCollapsed && <span>Ajustes Generales</span>}
          </div>
          {!sidebarCollapsed && (
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          )}
        </button>

      </div>
    </aside>
  );
};
