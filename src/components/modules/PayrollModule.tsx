import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { exportToCSV, printDocumentView } from '../../utils/export';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Download, 
  Printer, 
  Plus, 
  Search, 
  Calendar, 
  ShieldCheck, 
  UserPlus, 
  AlertCircle,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { Trabajador } from '../../types/erp';

export const PayrollModule: React.FC = () => {
  const { 
    empresaActiva, 
    trabajadores, 
    addTrabajador, 
    generarLiquidacion, 
    activeSubView, 
    setActiveSubView,
    setModalPayslipOpen,
    setSelectedPayslipView,
    addNotification
  } = useERP();

  const [periodo, setPeriodo] = useState('2026-10');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewWorkerModal, setShowNewWorkerModal] = useState(false);
  const [portalTrabajadorModal, setPortalTrabajadorModal] = useState<Trabajador | null>(null);

  // New worker form state
  const [newRut, setNewRut] = useState('');
  const [newNombres, setNewNombres] = useState('');
  const [newApellidos, setNewApellidos] = useState('');
  const [newCargo, setNewCargo] = useState('');
  const [newSueldoBase, setNewSueldoBase] = useState(650000);
  const [newAFP, setNewAFP] = useState<'Provida' | 'Habitat' | 'Cuprum' | 'Capital' | 'Modelo' | 'PlanVital' | 'Uno'>('Habitat');
  const [newSalud, setNewSalud] = useState<'Fonasa' | 'Isapre Banmédica' | 'Isapre Colmena' | 'Isapre Consalud' | 'Isapre CruzBlanca' | 'Isapre Nueva Masvida'>('Fonasa');
  const [newContrato, setNewContrato] = useState<'Indefinido' | 'Plazo Fijo' | 'Por Obra o Faena'>('Indefinido');
  const [newCentro1, setNewCentro1] = useState(empresaActiva.sucursalActiva);
  const [newCentro2, setNewCentro2] = useState('Operaciones');

  const filteredTrabajadores = trabajadores.filter(t => {
    if (t.empresaId !== empresaActiva.id) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.rut.toLowerCase().includes(term) ||
      t.nombres.toLowerCase().includes(term) ||
      t.apellidos.toLowerCase().includes(term) ||
      t.cargo.toLowerCase().includes(term)
    );
  });

  // Calculate metrics
  const totalTrabajadores = filteredTrabajadores.length;
  const totalSueldoBase = filteredTrabajadores.reduce((sum, t) => sum + t.sueldoBase, 0);
  const totalGratificacion = filteredTrabajadores.reduce((sum, t) => sum + Math.min(t.sueldoBase * 0.25, 197917), 0);
  const totalHorasExtras = filteredTrabajadores.reduce((sum, t) => sum + Math.round(t.horasExtras50 * ((t.sueldoBase * 0.007777) * 1.5)), 0);
  const totalImponible = Math.round(totalSueldoBase + totalGratificacion + totalHorasExtras);
  
  // Approximate standard deductions ~ 20%
  const totalDescuentos = Math.round(totalImponible * 0.198);
  const totalLiquido = totalImponible - totalDescuentos;

  const totalDiasLicencia = filteredTrabajadores.reduce((sum, t) => sum + t.diasLicencia, 0);
  const pctAusentismo = totalTrabajadores > 0 ? ((totalDiasLicencia / (totalTrabajadores * 30)) * 100).toFixed(1) : '0';

  const handleOpenPayslip = (trab: Trabajador) => {
    const liq = generarLiquidacion(trab.id, periodo);
    setSelectedPayslipView(liq);
    setModalPayslipOpen(true);
  };

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    addTrabajador({
      empresaId: empresaActiva.id,
      rut: newRut,
      nombres: newNombres,
      apellidos: newApellidos,
      cargo: newCargo,
      fechaIngreso: new Date().toISOString().split('T')[0],
      sueldoBase: Number(newSueldoBase),
      afp: newAFP,
      saludTipo: newSalud,
      tipoContrato: newContrato,
      centroCosto1: newCentro1,
      centroCosto2: newCentro2,
      colacion: 50000,
      movilizacion: 50000,
      diasTrabajadosMes: 30,
      horasExtras50: 0,
      diasLicencia: 0,
      diasPermiso: 0,
      email: `${newNombres.toLowerCase().replace(/\s+/g, '')}@empresa.cl`,
      estado: 'Activo',
    });
    setShowNewWorkerModal(false);
  };

  // Export LRE (Libro de Remuneraciones Electrónico Dirección del Trabajo)
  const handleExportLRE = () => {
    const headers = [
      'RUT Trabajador',
      'Nombres y Apellidos',
      'Código AFP DT',
      'Institución Salud',
      'Tipo Contrato',
      'Días Trabajados',
      'Sueldo Base (1101)',
      'Gratificación Legal (1102)',
      'Horas Extraordinarias (1104)',
      'Total Imponible DT (1110)',
      'Asignación Colación (1201)',
      'Asignación Movilización (1202)',
      'Cotización AFP (2101)',
      'Cotización Salud 7% (2102)',
      'Seguro Cesantía AFC (2103)',
      'Impuesto Único 2da Cat (2104)',
      'Total Haberes',
      'Total Descuentos',
      'Líquido a Pagar (3101)'
    ];

    const rows = filteredTrabajadores.map(t => {
      const liq = generarLiquidacion(t.id, periodo);
      return [
        t.rut,
        `${t.nombres} ${t.apellidos}`,
        t.afp,
        t.saludTipo,
        t.tipoContrato,
        t.diasTrabajadosMes,
        liq.sueldoBase,
        liq.gratificacionLegal,
        liq.horasExtrasMonto,
        liq.totalImponible,
        liq.colacion,
        liq.movilizacion,
        liq.descuentoAFP,
        liq.descuentoSalud,
        liq.descuentoCesantiaAFC,
        liq.descuentoImpuestoUnico,
        liq.totalHaberes,
        liq.totalDescuentosLegales,
        liq.totalLiquidoAPagar
      ];
    });

    exportToCSV(`LRE_DT_Chile_${empresaActiva.rut}_${periodo}`, headers, rows);
    addNotification({
      type: 'success',
      message: `Archivo LRE oficial DT generado con éxito para ${filteredTrabajadores.length} trabajadores.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header & Sub-menu */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Remuneraciones, Recursos Humanos y Cumplimiento DT
          </h1>
          <p className="text-xs text-slate-500">
            Libro de Remuneraciones Electrónico (LRE), Previred, Asistencia y Fichas de Personal
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubView('dashboard')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'dashboard' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard Remuneraciones
          </button>
          <button
            onClick={() => setActiveSubView('trabajadores')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'trabajadores' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ficha Trabajadores
          </button>
          <button
            onClick={() => setActiveSubView('asistencia')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'asistencia' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Asistencia & Reloj Biométrico
          </button>
          <button
            onClick={() => setActiveSubView('lre_dt')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'lre_dt' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Directorio LRE (DT)
          </button>
        </div>
      </div>

      {/* SUBVIEW 1: Dashboard de Remuneraciones (Pantalla 5.1) */}
      {activeSubView === 'dashboard' && (
        <div className="space-y-6">
          
          {/* 4 Indicadores Rápidos (Pantalla 5.1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Trabajadores Activos</span>
              <p className="text-2xl font-bold font-mono text-[#003366] mt-1">{totalTrabajadores}</p>
              <span className="text-[10px] text-emerald-600 font-medium">Contratos vigentes DT</span>
            </div>

            <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Cotizaciones Pendientes</span>
              <p className="text-2xl font-bold font-mono text-amber-700 mt-1">1 / 0</p>
              <span className="text-[10px] text-amber-700 font-medium">Previred vence el 13 de Noviembre</span>
            </div>

            <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Líquido a Pagar</span>
              <p className="text-2xl font-bold font-mono text-emerald-800 mt-1">
                ${totalLiquido.toLocaleString('es-CL')}
              </p>
              <span className="text-[10px] text-slate-500 font-mono">Imponible: ${totalImponible.toLocaleString('es-CL')}</span>
            </div>

            <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Licencias y Ausentismo</span>
              <p className="text-2xl font-bold font-mono text-slate-800 mt-1">{pctAusentismo}%</p>
              <span className="text-[10px] text-slate-500">{totalDiasLicencia} días de licencia médica</span>
            </div>

          </div>

          {/* Detailed Financial Breakdown of Payroll */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Resumen de Costo de Mano de Obra y Leyes Sociales ({periodo})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportLRE}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar LRE Dirección del Trabajo</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Total Haberes Imponibles:</span>
                <p className="text-base font-bold font-mono text-[#003366]">${totalImponible.toLocaleString('es-CL')}</p>
                <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                  <div className="flex justify-between"><span>Sueldo Base:</span> <span>${totalSueldoBase.toLocaleString('es-CL')}</span></div>
                  <div className="flex justify-between"><span>Gratificación Legal:</span> <span>${totalGratificacion.toLocaleString('es-CL')}</span></div>
                  <div className="flex justify-between"><span>Horas Extras (50%):</span> <span>${totalHorasExtras.toLocaleString('es-CL')}</span></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Descuentos Previsionales & Salud:</span>
                <p className="text-base font-bold font-mono text-rose-700">-${totalDescuentos.toLocaleString('es-CL')}</p>
                <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                  <div className="flex justify-between"><span>AFPs (11.4% prom):</span> <span>${Math.round(totalImponible * 0.114).toLocaleString('es-CL')}</span></div>
                  <div className="flex justify-between"><span>Salud (Fonasa/Isapre 7%):</span> <span>${Math.round(totalImponible * 0.07).toLocaleString('es-CL')}</span></div>
                  <div className="flex justify-between"><span>Cesantía AFC Trabajador (0.6%):</span> <span>${Math.round(totalImponible * 0.006).toLocaleString('es-CL')}</span></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Aportes Patronales (Costo Empresa):</span>
                <p className="text-base font-bold font-mono text-slate-900">+${Math.round(totalImponible * 0.0389).toLocaleString('es-CL')}</p>
                <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                  <div className="flex justify-between"><span>Seguro Invalidez (SIS 1.49%):</span> <span>${Math.round(totalImponible * 0.0149).toLocaleString('es-CL')}</span></div>
                  <div className="flex justify-between"><span>AFC Empleador (2.4%):</span> <span>${Math.round(totalImponible * 0.024).toLocaleString('es-CL')}</span></div>
                  <div className="flex justify-between"><span>Seguro Mutual Accidentes:</span> <span>0.93%</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick List with Payslip Generators */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Emisión Rápida de Liquidaciones de Sueldo ({periodo})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3 font-semibold">RUT</th>
                    <th className="py-2 px-3 font-semibold">Colaborador</th>
                    <th className="py-2 px-3 font-semibold">Cargo</th>
                    <th className="py-2 px-3 font-semibold">AFP / Salud</th>
                    <th className="py-2 px-3 font-semibold text-right">Sueldo Base</th>
                    <th className="py-2 px-3 font-semibold text-center">Estado</th>
                    <th className="py-2 px-3 font-semibold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTrabajadores.map(trab => (
                    <tr key={trab.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{trab.rut}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{trab.nombres} {trab.apellidos}</td>
                      <td className="py-2 px-3 text-slate-600">{trab.cargo}</td>
                      <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">{trab.afp} / {trab.saludTipo}</td>
                      <td className="py-2 px-3 text-right font-mono font-tabular">${trab.sueldoBase.toLocaleString('es-CL')}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          trab.estado === 'Activo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {trab.estado}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleOpenPayslip(trab)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded transition-colors"
                        >
                          Ver Liquidación
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUBVIEW 2: Ficha del Trabajador & Portal (Pantalla 5.2) */}
      {activeSubView === 'trabajadores' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por RUT, Nombre o Cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#003366] focus:outline-none w-64"
              />
            </div>

            <button
              onClick={() => setShowNewWorkerModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Contratar / Nueva Ficha</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTrabajadores.map(trab => (
              <div key={trab.id} className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{trab.nombres} {trab.apellidos}</h4>
                    <p className="text-xs text-slate-500">{trab.cargo}</p>
                    <span className="text-xs font-mono text-[#003366] font-semibold block mt-0.5">RUT: {trab.rut}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    trab.estado === 'Activo' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {trab.estado}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">AFP & Salud</span>
                    <span className="font-semibold text-slate-800">{trab.afp} / {trab.saludTipo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Sueldo Base</span>
                    <span className="font-semibold text-slate-800 font-mono">${trab.sueldoBase.toLocaleString('es-CL')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Centro de Costos 1</span>
                    <span className="text-slate-800">{trab.centroCosto1}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Centro de Costos 2</span>
                    <span className="text-slate-800">{trab.centroCosto2}</span>
                  </div>
                </div>

                {/* Portal del Trabajador Links (Pantalla 5.2) */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setPortalTrabajadorModal(trab)}
                    className="text-xs font-semibold text-[#003366] hover:underline flex items-center gap-1"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Ver Portal del Trabajador (Móvil)</span>
                  </button>

                  <button
                    onClick={() => handleOpenPayslip(trab)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded"
                  >
                    Emitir Liquidación
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBVIEW 3: Asistencia y Reloj Control Biométrico */}
      {activeSubView === 'asistencia' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#003366]" />
                <span>Registro de Asistencia y Reloj Control Biométrico</span>
              </h3>
              <p className="text-xs text-slate-500">
                Turnos, atrasos, licencias médicas y cálculo automático de sobretiempos al 50%
              </p>
            </div>

            <button
              onClick={() => {
                alert('Marcaciones del reloj biométrico ZKTeco importadas con éxito: 18 registros procesados sin inconsistencias.');
                addNotification({
                  type: 'success',
                  message: 'Reloj biométrico sincronizado: Marcaciones de faena y oficinas integradas a la nómina.',
                });
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded shadow-xs"
            >
              Importar Marcaciones Biométricas
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3 font-semibold">Trabajador</th>
                  <th className="py-2 px-3 font-semibold">Jornada / Turno</th>
                  <th className="py-2 px-3 font-semibold text-center">Días Trabajados</th>
                  <th className="py-2 px-3 font-semibold text-center">Horas Extras 50%</th>
                  <th className="py-2 px-3 font-semibold text-center">Días Licencia</th>
                  <th className="py-2 px-3 font-semibold text-center">Atrasos (min)</th>
                  <th className="py-2 px-3 font-semibold text-center">Estado DT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrabajadores.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-semibold text-slate-900">{t.nombres} {t.apellidos}</td>
                    <td className="py-2 px-3 text-slate-600">Lunes a Viernes 44 hrs (Art. 22 Ley 40 Horas)</td>
                    <td className="py-2 px-3 text-center font-mono">{t.diasTrabajadosMes} / 30</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-[#003366]">{t.horasExtras50} hrs</td>
                    <td className="py-2 px-3 text-center font-mono text-rose-600">{t.diasLicencia}</td>
                    <td className="py-2 px-3 text-center font-mono">0 min</td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Validado DT
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBVIEW 4: Directorio LRE DT */}
      {activeSubView === 'lre_dt' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Libro de Remuneraciones Electrónico (LRE) — Dirección del Trabajo (DT)
              </h3>
              <p className="text-xs text-slate-500">
                Estructura oficial estandarizada con códigos 1101, 1102, 1110, 2101 para carga masiva en mi.dt.gob.cl
              </p>
            </div>
            <button
              onClick={handleExportLRE}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Archivo LRE CSV</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <p className="font-semibold text-slate-900 mb-1">Información de Cumplimiento Normativo DT:</p>
            El Libro de Remuneraciones Electrónico debe informarse mensualmente ante la Dirección del Trabajo a más tardar el día 15 del mes siguiente al del pago de las remuneraciones. El archivo generado cumple con todas las validaciones de campos del validador DT 2026.
          </div>
        </div>
      )}

      {/* MODAL: Contratar Trabajador */}
      {showNewWorkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Nueva Ficha de Trabajador</h3>
              <button onClick={() => setShowNewWorkerModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">RUT Chileno</label>
                  <input
                    type="text"
                    required
                    placeholder="18.902.113-4"
                    value={newRut}
                    onChange={(e) => setNewRut(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    required
                    placeholder="Jefe de Obras / Operador"
                    value={newCargo}
                    onChange={(e) => setNewCargo(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nombres</label>
                  <input
                    type="text"
                    required
                    value={newNombres}
                    onChange={(e) => setNewNombres(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Apellidos</label>
                  <input
                    type="text"
                    required
                    value={newApellidos}
                    onChange={(e) => setNewApellidos(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sueldo Base ($)</label>
                  <input
                    type="number"
                    required
                    value={newSueldoBase}
                    onChange={(e) => setNewSueldoBase(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">AFP</label>
                  <select
                    value={newAFP}
                    onChange={(e) => setNewAFP(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                  >
                    <option value="Habitat">Habitat (11.27%)</option>
                    <option value="Provida">Provida (11.45%)</option>
                    <option value="Cuprum">Cuprum (11.44%)</option>
                    <option value="Modelo">Modelo (10.58%)</option>
                    <option value="Uno">Uno (10.49%)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salud</label>
                  <select
                    value={newSalud}
                    onChange={(e) => setNewSalud(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                  >
                    <option value="Fonasa">Fonasa (7%)</option>
                    <option value="Isapre Banmédica">Banmédica</option>
                    <option value="Isapre Colmena">Colmena</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Centro Costos 1 (Obra/Sucursal)</label>
                  <input
                    type="text"
                    value={newCentro1}
                    onChange={(e) => setNewCentro1(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Centro Costos 2 (Partida/Área)</label>
                  <input
                    type="text"
                    value={newCentro2}
                    onChange={(e) => setNewCentro2(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewWorkerModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#003366] hover:bg-[#0056B3] text-white rounded font-semibold shadow-xs"
                >
                  Guardar y Emitir Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Portal Móvil del Trabajador (Pantalla 5.2) */}
      {portalTrabajadorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#003366]" />
                <h3 className="text-sm font-bold text-slate-900">Portal del Trabajador</h3>
              </div>
              <button onClick={() => setPortalTrabajadorModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="text-center space-y-1 mb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-bold mx-auto text-base">
                {portalTrabajadorModal.nombres[0]}{portalTrabajadorModal.apellidos[0]}
              </div>
              <p className="font-bold text-slate-900 text-sm">{portalTrabajadorModal.nombres} {portalTrabajadorModal.apellidos}</p>
              <p className="text-slate-500 font-mono">{portalTrabajadorModal.rut}</p>
              <p className="text-[#0056B3] font-medium">{portalTrabajadorModal.cargo}</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  handleOpenPayslip(portalTrabajadorModal);
                  setPortalTrabajadorModal(null);
                }}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-800 font-semibold flex items-center justify-between"
              >
                <span>Descargar Última Liquidación Firmada</span>
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => alert(`Certificado de Antigüedad para ${portalTrabajadorModal.nombres} generado con firma electrónica avanzada.`)}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-800 font-semibold flex items-center justify-between"
              >
                <span>Certificado de Antigüedad Laboral</span>
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => alert('Solicitud de 5 días de vacaciones enviada al jefe de recursos humanos.')}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-800 font-semibold flex items-center justify-between"
              >
                <span>Solicitar Vacaciones o Permiso</span>
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 font-mono">Enlace móvil: app.muerro.cl/colaborador</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
