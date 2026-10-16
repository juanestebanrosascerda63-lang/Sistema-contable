import React, { useState } from 'react';
import { useERP, RealmType } from '../../context/ERPContext';
import { 
  Building2, 
  ChevronDown, 
  RefreshCw, 
  HelpCircle, 
  User, 
  LogOut, 
  ShieldCheck, 
  HardHat, 
  Check, 
  FileText,
  Calculator,
  PieChart,
  Users,
  ShoppingBag,
  Boxes,
  Globe,
  Radio
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const { 
    empresaActiva, 
    empresas, 
    setEmpresaActiva, 
    activeRealm, 
    setActiveRealm, 
    setActiveSubView,
    logoutUser,
    siiSyncing,
    triggerSIISync 
  } = useERP();

  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [contabilidadMenuOpen, setContabilidadMenuOpen] = useState(false);
  const [impuestosMenuOpen, setImpuestosMenuOpen] = useState(false);

  const navigateTo = (realm: RealmType, subView?: string) => {
    setActiveRealm(realm);
    if (subView) {
      setActiveSubView(subView);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#E0E0E0] shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Zone 1: Brand & Company Selector */}
            <div className="flex items-center gap-4 shrink-0">
              <button 
                onClick={() => navigateTo('hub', 'resumen')}
                className="flex items-center gap-2 text-left group"
                title="Ir al Hub Principal"
              >
                <div className="w-9 h-9 rounded bg-[#003366] text-white flex items-center justify-center font-bold text-lg tracking-wider shadow-xs">
                  M
                </div>
                <div>
                  <div className="text-base font-bold text-[#003366] tracking-tight leading-none group-hover:text-[#0056B3] transition-colors">
                    MUERRO
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">
                    Tributa Educa ERP
                  </div>
                </div>
              </button>

              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">|</span>

              {/* Company Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors max-w-[280px] sm:max-w-xs"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold text-slate-800 block truncate">
                      {empresaActiva.nombreFantasia}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      RUT: {empresaActiva.rut}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-auto" />
                </button>

                {companyDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-80 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50">
                    <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Seleccionar Empresa Activa
                    </div>
                    {empresas.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          setEmpresaActiva(emp);
                          setCompanyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2 hover:bg-slate-50 transition-colors ${
                          emp.id === empresaActiva.id ? 'bg-blue-50/60 text-[#003366]' : 'text-slate-700'
                        }`}
                      >
                        <div className="mt-0.5">
                          {emp.id === empresaActiva.id ? (
                            <Check className="w-3.5 h-3.5 text-[#003366]" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{emp.razonSocial}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            RUT: {emp.rut} · {emp.regimenTributario}
                          </p>
                          {emp.isConstructora && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-medium mt-0.5">
                              <HardHat className="w-2.5 h-2.5" /> Módulo Constructor Habilitado
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Zone 2: Navigation Links (Domain Categories) */}
            <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-slate-600">
              <button
                onClick={() => navigateTo('hub', 'resumen')}
                className={`hover:text-[#003366] transition-colors whitespace-nowrap py-1 ${
                  activeRealm === 'hub' ? 'text-[#003366] font-semibold border-b-2 border-[#003366]' : ''
                }`}
              >
                Hub Ámbitos
              </button>

              <button
                onClick={() => navigateTo('sii', 'configuracion')}
                className={`hover:text-[#003366] transition-colors whitespace-nowrap py-1 ${
                  activeRealm === 'sii' ? 'text-[#003366] font-semibold border-b-2 border-[#003366]' : ''
                }`}
              >
                SII Directo
              </button>

              {/* Contabilidad with dropdown for Mayor, Balance 8 col, Situación, Resultados */}
              <div 
                className="relative"
                onMouseEnter={() => setContabilidadMenuOpen(true)}
                onMouseLeave={() => setContabilidadMenuOpen(false)}
              >
                <button
                  onClick={() => navigateTo('contabilidad', 'compras_ventas')}
                  className={`hover:text-[#003366] transition-colors whitespace-nowrap py-1 flex items-center gap-1 ${
                    activeRealm === 'contabilidad' ? 'text-[#003366] font-semibold border-b-2 border-[#003366]' : ''
                  }`}
                >
                  Contabilidad
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {contabilidadMenuOpen && (
                  <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-md shadow-lg py-1.5 z-50">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Libros y Registros Oficiales
                    </div>
                    <button
                      onClick={() => { navigateTo('contabilidad', 'compras_ventas'); setContabilidadMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#003366]"
                    >
                      Libro de Compras y Ventas
                    </button>
                    <button
                      onClick={() => { navigateTo('contabilidad', 'libro_diario'); setContabilidadMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#003366]"
                    >
                      Libro Diario
                    </button>
                    <button
                      onClick={() => { navigateTo('contabilidad', 'libro_mayor'); setContabilidadMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#003366] hover:bg-blue-50 flex items-center justify-between"
                    >
                      <span>Libro Mayor</span>
                      <span className="text-[10px] bg-blue-100 text-[#003366] px-1.5 py-0.5 rounded font-mono">Oficial</span>
                    </button>
                    <button
                      onClick={() => { navigateTo('contabilidad', 'balance_8_columnas'); setContabilidadMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#003366] hover:bg-blue-50 flex items-center justify-between"
                    >
                      <span>Balance de 8 Columnas</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">Tributario</span>
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Estados Financieros
                    </div>
                    <button
                      onClick={() => { navigateTo('contabilidad', 'situacion_financiera'); setContabilidadMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#003366]"
                    >
                      Estado de Situación Financiera
                    </button>
                    <button
                      onClick={() => { navigateTo('contabilidad', 'estado_resultado'); setContabilidadMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#003366]"
                    >
                      Estado de Resultados
                    </button>
                    <button
                      onClick={() => { navigateTo('contabilidad', 'cuentas'); setContabilidadMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#003366]"
                    >
                      Plan de Cuentas IFRS
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Link to Flujo de Caja */}
              <button
                onClick={() => navigateTo('flujo_caja')}
                className={`hover:text-[#003366] transition-colors whitespace-nowrap py-1 ${
                  activeRealm === 'flujo_caja' ? 'text-[#003366] font-semibold border-b-2 border-[#003366]' : ''
                }`}
              >
                Flujo de Caja
              </button>

              {/* Direct Link to Activos Fijos */}
              <button
                onClick={() => navigateTo('activo_fijo')}
                className={`hover:text-[#003366] transition-colors whitespace-nowrap py-1 ${
                  activeRealm === 'activo_fijo' ? 'text-[#003366] font-semibold border-b-2 border-[#003366]' : ''
                }`}
              >
                Activos Fijos
              </button>

              {/* Impuestos & Operación Renta F22 with dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setImpuestosMenuOpen(true)}
                onMouseLeave={() => setImpuestosMenuOpen(false)}
              >
                <button
                  onClick={() => navigateTo('impuestos', 'renta_f22')}
                  className={`hover:text-[#003366] transition-colors whitespace-nowrap py-1 flex items-center gap-1 ${
                    activeRealm === 'impuestos' ? 'text-[#003366] font-semibold border-b-2 border-[#003366]' : ''
                  }`}
                >
                  Impuestos & F22
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {impuestosMenuOpen && (
                  <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-md shadow-lg py-1.5 z-50">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      Tributación Mensual y Anual
                    </div>
                    <button
                      onClick={() => { navigateTo('impuestos', 'f29'); setImpuestosMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#003366]"
                    >
                      F29 Mensual (IVA & PPM)
                    </button>
                    <button
                      onClick={() => { navigateTo('impuestos', 'renta_f22'); setImpuestosMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-[#003366] hover:bg-blue-50 flex items-center justify-between"
                    >
                      <span>Operación Renta F22 (AT 2026)</span>
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono">SII</span>
                    </button>
                    <button
                      onClick={() => { navigateTo('impuestos', 'ddjj'); setImpuestosMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#003366]"
                    >
                      Declaraciones Juradas (1887/1879/1948)
                    </button>
                    <button
                      onClick={() => { navigateTo('impuestos', 'correccion'); setImpuestosMenuOpen(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#003366]"
                    >
                      Corrección Monetaria Art. 41
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigateTo('eeff', 'balance')}
                className={`hover:text-[#003366] transition-colors whitespace-nowrap py-1 ${
                  activeRealm === 'eeff' ? 'text-[#003366] font-semibold border-b-2 border-[#003366]' : ''
                }`}
              >
                EEFF IFRS
              </button>

              <button
                onClick={() => navigateTo('remuneraciones', 'dashboard')}
                className={`hover:text-[#003366] transition-colors whitespace-nowrap py-1 ${
                  activeRealm === 'remuneraciones' ? 'text-[#003366] font-semibold border-b-2 border-[#003366]' : ''
                }`}
              >
                Remuneraciones DT
              </button>

              <button
                onClick={() => navigateTo('ventas', 'emision')}
                className={`hover:text-[#003366] transition-colors whitespace-nowrap py-1 ${
                  activeRealm === 'ventas' ? 'text-[#003366] font-semibold border-b-2 border-[#003366]' : ''
                }`}
              >
                Ventas DTE
              </button>

              <button
                onClick={() => navigateTo('logistica', 'bodegas')}
                className={`hover:text-[#003366] transition-colors whitespace-nowrap py-1 ${
                  activeRealm === 'logistica' ? 'text-[#003366] font-semibold border-b-2 border-[#003366]' : ''
                }`}
              >
                Bodega
              </button>

              {empresaActiva.isConstructora && (
                <button
                  onClick={() => navigateTo('construccion', 'avance')}
                  className={`hover:text-[#003366] transition-colors whitespace-nowrap py-1 flex items-center gap-1 ${
                    activeRealm === 'construccion' ? 'text-[#003366] font-semibold border-b-2 border-[#003366]' : 'text-amber-800'
                  }`}
                >
                  <HardHat className="w-3.5 h-3.5 text-amber-600" />
                  Constructoras
                </button>
              )}

              <button
                onClick={() => navigateTo('portal_cliente', 'servicios')}
                className={`hover:text-[#003366] transition-colors whitespace-nowrap py-1 ${
                  activeRealm === 'portal_cliente' ? 'text-[#003366] font-semibold border-b-2 border-[#003366]' : ''
                }`}
              >
                Portal Cliente
              </button>
            </nav>

            {/* Zone 3: SII Status, Sincronizar Button, User Menu */}
            <div className="flex items-center gap-3 shrink-0">
              
              {/* SII Connection Status */}
              <button
                onClick={() => navigateTo('sii', 'configuracion')}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-700 transition-colors"
                title="Sincronización SII cada 6h"
              >
                <Radio className={`w-3 h-3 ${empresaActiva.siiCertificadoEstado === 'Conectada' ? 'text-[#28A745]' : 'text-[#DC3545]'}`} />
                <span className="font-medium">SII:</span>
                <span className="text-slate-600">{empresaActiva.siiCertificadoEstado}</span>
              </button>

              {/* Instant Sincronizar Button */}
              <button
                type="button"
                onClick={() => triggerSIISync('2026-10')}
                disabled={siiSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded transition-colors whitespace-nowrap disabled:opacity-50 shadow-xs"
                title="Sincronizar DTEs emitidos y recibidos con el SII"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${siiSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sincronizar SII</span>
              </button>

              {/* Help Button */}
              <button
                type="button"
                onClick={() => setHelpModalOpen(true)}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                title="Ayuda y Normativa SII / DT"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                    CV
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-800">Christopher Velásquez</p>
                      <p className="text-[11px] text-slate-500 font-mono">RUT: 15.420.318-7</p>
                      <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Rol: Administrador General</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigateTo('sii', 'configuracion');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                        Certificado Digital SII
                      </button>
                      <button
                        onClick={() => {
                          navigateTo('portal_cliente', 'servicios');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        Configurar Extranet Clientes
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logoutUser();
                        }}
                        className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Help & Technical Normative Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#003366]" />
                <h3 className="text-base font-bold text-slate-900">Normativa y Ayuda de la Suite MUERRO</h3>
              </div>
              <button 
                onClick={() => setHelpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <p className="font-semibold text-slate-800">1. Sincronización Automática SII cada 6 Horas</p>
                <p>El sistema descarga DTEs del Registro de Compras y Ventas (RCV) automáticamente cada 6 horas y permite centralizarlos con un clic en el Libro Diario.</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <p className="font-semibold text-slate-800">2. Facturación Electrónica hasta 60 Líneas</p>
                <p>A diferencia del portal gratuito del SII limitado a 10 líneas, MUERRO permite emitir documentos con hasta 60 líneas de ítems con generación de Timbre Electrónico (TED).</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <p className="font-semibold text-slate-800">3. Constructoras y Multi-Centro de Costos Simultáneos</p>
                <p>Permite asignar cada gasto, factura y sueldo a dos centros de costos: Centro 1 (Obra/Proyecto) y Centro 2 (Partida/Etapa), con control de Avance Físico vs Presupuesto y retenciones de garantía / CEEC.</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <p className="font-semibold text-slate-800">4. Cumplimiento Dirección del Trabajo (LRE DT)</p>
                <p>Liquidaciones calculadas según normativa con exportador directo para el Libro de Remuneraciones Electrónico exigido por la DT.</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
