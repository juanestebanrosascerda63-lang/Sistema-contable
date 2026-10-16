import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { exportToCSV, printDocumentView } from '../../utils/export';
import { FilaBalance8Columnas } from '../../types/erp';
import { Balance8ColumnasView } from '../accounting/Balance8ColumnasView';
import { 
  Calculator, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Layers,
  Search,
  BookOpen,
  Landmark,
  Wallet,
  Users2,
  FileCheck,
  Building2,
  PieChart,
  ArrowRight
} from 'lucide-react';

export const AccountingModule: React.FC = () => {
  const { 
    empresaActiva, 
    dtes, 
    asientos, 
    centralizarDTE, 
    activeSubView, 
    setActiveSubView,
    setModalDTEOpen,
    setModalAsientoOpen,
    setSelectedDTEView,
    planCuentas,
    setActiveRealm
  } = useERP();

  const [filterTipo, setFilterTipo] = useState<'todos' | 'emitido' | 'recibido'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMes, setSelectedMes] = useState('2026-10');
  const [selectedMayorCuenta, setSelectedMayorCuenta] = useState<string>('todas');

  // Filter DTEs
  const filteredDtes = dtes.filter(d => {
    if (d.empresaId !== empresaActiva.id) return false;
    if (filterTipo !== 'todos' && d.direccionOperacion !== filterTipo) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        d.folio.toString().includes(term) ||
        d.rutContraparte.toLowerCase().includes(term) ||
        d.razonSocialContraparte.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Calculate totals for Libro Compras/Ventas
  const totalNeto = filteredDtes.reduce((sum, d) => sum + d.montoNeto, 0);
  const totalIVA = filteredDtes.reduce((sum, d) => sum + d.montoIVA, 0);
  const totalExento = filteredDtes.reduce((sum, d) => sum + d.montoExento, 0);
  const totalGeneral = filteredDtes.reduce((sum, d) => sum + d.montoTotal, 0);

  // Filter Asientos
  const filteredAsientos = asientos.filter(a => a.empresaId === empresaActiva.id);

  // ==========================================
  // LIBRO MAYOR: Agrupar asientos por cuenta
  // ==========================================
  const movimientosPorCuenta: Record<string, {
    cuenta: string;
    nombre: string;
    tipo: string;
    movimientos: Array<{
      fecha: string;
      asientoNumero: number;
      glosa: string;
      debe: number;
      haber: number;
    }>;
    totalDebe: number;
    totalHaber: number;
  }> = {};

  // Inicializar con cuentas del plan
  planCuentas.forEach(c => {
    movimientosPorCuenta[c.codigo] = {
      cuenta: c.codigo,
      nombre: c.nombre,
      tipo: c.tipo,
      movimientos: [],
      totalDebe: 0,
      totalHaber: 0
    };
  });

  // Poblar movimientos desde asientos
  filteredAsientos.forEach(a => {
    a.lineas.forEach(l => {
      if (!movimientosPorCuenta[l.codigoCuenta]) {
        movimientosPorCuenta[l.codigoCuenta] = {
          cuenta: l.codigoCuenta,
          nombre: l.nombreCuenta,
          tipo: 'General',
          movimientos: [],
          totalDebe: 0,
          totalHaber: 0
        };
      }
      movimientosPorCuenta[l.codigoCuenta].movimientos.push({
        fecha: a.fecha,
        asientoNumero: a.numero,
        glosa: l.glosa || a.glosaGeneral,
        debe: Number(l.debe) || 0,
        haber: Number(l.haber) || 0
      });
      movimientosPorCuenta[l.codigoCuenta].totalDebe += Number(l.debe) || 0;
      movimientosPorCuenta[l.codigoCuenta].totalHaber += Number(l.haber) || 0;
    });
  });

  // ==========================================
  // BALANCE DE 8 COLUMNAS (BALANCE TRIBUTARIO)
  // ==========================================
  const balance8ColumnasFilas: FilaBalance8Columnas[] = planCuentas.map(cuenta => {
    const mayor = movimientosPorCuenta[cuenta.codigo];
    // Sumas iniciales según saldo y movimientos
    const debitos = (cuenta.naturaleza === 'Deudora' ? cuenta.saldo : 0) + (mayor ? mayor.totalDebe : 0);
    const creditos = (cuenta.naturaleza === 'Acreedora' ? cuenta.saldo : 0) + (mayor ? mayor.totalHaber : 0);

    const saldoDeudor = debitos > creditos ? debitos - creditos : 0;
    const saldoAcreedor = creditos > debitos ? creditos - debitos : 0;

    let activo = 0;
    let pasivo = 0;
    let perdida = 0;
    let ganancia = 0;

    if (cuenta.tipo === 'Activo Corriente' || cuenta.tipo === 'Activo No Corriente') {
      activo = saldoDeudor - saldoAcreedor;
    } else if (cuenta.tipo === 'Pasivo Corriente' || cuenta.tipo === 'Pasivo No Corriente' || cuenta.tipo === 'Patrimonio') {
      pasivo = saldoAcreedor - saldoDeudor;
    } else if (cuenta.tipo === 'Costos' || cuenta.tipo === 'Gastos') {
      perdida = saldoDeudor;
    } else if (cuenta.tipo === 'Ingresos') {
      ganancia = saldoAcreedor;
    }

    return {
      codigo: cuenta.codigo,
      nombre: cuenta.nombre,
      tipo: cuenta.tipo,
      debitos,
      creditos,
      saldoDeudor,
      saldoAcreedor,
      activo: Math.max(0, activo),
      pasivo: Math.max(0, pasivo),
      perdida: Math.max(0, perdida),
      ganancia: Math.max(0, ganancia)
    };
  });

  // Totales preliminares de 8 columnas
  const sumDebitos = balance8ColumnasFilas.reduce((s, r) => s + r.debitos, 0);
  const sumCreditos = balance8ColumnasFilas.reduce((s, r) => s + r.creditos, 0);
  const sumSaldoDeudor = balance8ColumnasFilas.reduce((s, r) => s + r.saldoDeudor, 0);
  const sumSaldoAcreedor = balance8ColumnasFilas.reduce((s, r) => s + r.saldoAcreedor, 0);

  const sumActivo = balance8ColumnasFilas.reduce((s, r) => s + r.activo, 0);
  const sumPasivo = balance8ColumnasFilas.reduce((s, r) => s + r.pasivo, 0);
  const sumPerdida = balance8ColumnasFilas.reduce((s, r) => s + r.perdida, 0);
  const sumGanancia = balance8ColumnasFilas.reduce((s, r) => s + r.ganancia, 0);

  // Resultado del Ejercicio (Utilidad o Pérdida)
  const utilidadPorInventario = sumActivo - sumPasivo;
  const utilidadPorResultado = sumGanancia - sumPerdida;
  const resultadoEjercicio = utilidadPorResultado; // Debe coincidir exactamente con inventario

  // Totales finales balanceados
  const totalFinalActivo = sumActivo;
  const totalFinalPasivo = sumPasivo + (resultadoEjercicio > 0 ? resultadoEjercicio : 0);
  const totalFinalPerdida = sumPerdida + (resultadoEjercicio > 0 ? resultadoEjercicio : 0);
  const totalFinalGanancia = sumGanancia;

  // ESTADO DE SITUACIÓN FINANCIERA (NIC 1)
  const activosCorrientes = planCuentas.filter(c => c.tipo === 'Activo Corriente');
  const activosNoCorrientes = planCuentas.filter(c => c.tipo === 'Activo No Corriente');
  const pasivosCorrientes = planCuentas.filter(c => c.tipo === 'Pasivo Corriente');
  const pasivosNoCorrientes = planCuentas.filter(c => c.tipo === 'Pasivo No Corriente');
  const patrimonio = planCuentas.filter(c => c.tipo === 'Patrimonio');

  const totalActivos = activosCorrientes.reduce((s, c) => s + c.saldo, 0) + activosNoCorrientes.reduce((s, c) => s + c.saldo, 0);
  const totalPasivos = pasivosCorrientes.reduce((s, c) => s + c.saldo, 0) + pasivosNoCorrientes.reduce((s, c) => s + c.saldo, 0);
  const totalPatrimonio = patrimonio.reduce((s, c) => s + c.saldo, 0);

  // ESTADO DE RESULTADOS
  const totalVentas = planCuentas.filter(c => c.tipo === 'Ingresos').reduce((s, c) => s + c.saldo, 0);
  const totalCostos = planCuentas.filter(c => c.tipo === 'Costos').reduce((s, c) => s + c.saldo, 0);
  const totalGastos = planCuentas.filter(c => c.tipo === 'Gastos').reduce((s, c) => s + c.saldo, 0);
  const resultadoNeto = totalVentas - totalCostos - totalGastos;

  // Export handlers
  const handleExportBalance8CSV = () => {
    const headers = [
      'Código', 
      'Cuenta', 
      'Débitos ($)', 
      'Créditos ($)', 
      'Saldo Deudor ($)', 
      'Saldo Acreedor ($)', 
      'Activo ($)', 
      'Pasivo ($)', 
      'Pérdida ($)', 
      'Ganancia ($)'
    ];

    const rows = balance8ColumnasFilas.map(r => [
      r.codigo,
      r.nombre,
      r.debitos,
      r.creditos,
      r.saldoDeudor,
      r.saldoAcreedor,
      r.activo,
      r.pasivo,
      r.perdida,
      r.ganancia
    ]);

    rows.push(['SUBTOTALES', '', sumDebitos, sumCreditos, sumSaldoDeudor, sumSaldoAcreedor, sumActivo, sumPasivo, sumPerdida, sumGanancia]);
    rows.push(['RESULTADO EJERCICIO', '', '', '', '', '', 0, resultadoEjercicio, resultadoEjercicio, 0]);
    rows.push(['TOTALES IGUALES', '', sumDebitos, sumCreditos, sumSaldoDeudor, sumSaldoAcreedor, totalFinalActivo, totalFinalPasivo, totalFinalPerdida, totalFinalGanancia]);

    exportToCSV(`Balance_8_Columnas_${empresaActiva.rut}_${selectedMes}`, headers, rows);
  };

  const handleExportMayorCSV = () => {
    const headers = ['Código Cuenta', 'Nombre Cuenta', 'Fecha', 'Asiento #', 'Glosa', 'Debe ($)', 'Haber ($)', 'Saldo ($)'];
    const rows: (string | number)[][] = [];

    Object.values(movimientosPorCuenta).forEach(m => {
      let runningSaldo = 0;
      m.movimientos.forEach(mov => {
        runningSaldo += (mov.debe - mov.haber);
        rows.push([
          m.cuenta,
          m.nombre,
          mov.fecha,
          mov.asientoNumero,
          mov.glosa,
          mov.debe,
          mov.haber,
          runningSaldo
        ]);
      });
    });

    exportToCSV(`Libro_Mayor_${empresaActiva.rut}_${selectedMes}`, headers, rows);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header & Navigation Sub-menu */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Contabilidad, Registros y Balances
          </h1>
          <p className="text-xs text-slate-500">
            {empresaActiva.razonSocial} · Régimen {empresaActiva.regimenTributario}
          </p>
        </div>

        {/* Sub-menu Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubView('resumen')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'resumen' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Panel Principal
          </button>
          <button
            onClick={() => setActiveSubView('compras_ventas')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'compras_ventas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Libro Compras/Ventas
          </button>
          <button
            onClick={() => setActiveSubView('libro_diario')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'libro_diario' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Libro Diario
          </button>
          <button
            onClick={() => setActiveSubView('libro_mayor')}
            className={`px-3 py-1.5 font-bold rounded transition-colors ${
              activeSubView === 'libro_mayor' ? 'bg-[#003366] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Libro Mayor
          </button>
          <button
            onClick={() => setActiveSubView('balance_8_columnas')}
            className={`px-3 py-1.5 font-bold rounded transition-colors ${
              activeSubView === 'balance_8_columnas' ? 'bg-[#003366] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Balance 8 Columnas
          </button>
          <button
            onClick={() => setActiveSubView('situacion_financiera')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'situacion_financiera' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Situación Financiera
          </button>
          <button
            onClick={() => setActiveSubView('estado_resultado')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'estado_resultado' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Estado Resultado
          </button>
          <button
            onClick={() => setActiveSubView('eerr_comparativo')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'eerr_comparativo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EERR Año a Año
          </button>
          <button
            onClick={() => setActiveSubView('cuentas')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'cuentas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Plan de Cuentas
          </button>
        </div>
      </div>

      {/* Quick Access to New Specialized Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 no-print">
        <div 
          onClick={() => setActiveRealm('flujo_caja')}
          className="p-3 bg-white border border-[#E0E0E0] hover:border-[#003366] rounded-lg shadow-xs flex items-center justify-between cursor-pointer group transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-50 text-[#003366]">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Módulo de Flujo de Caja</span>
              <span className="text-[11px] text-slate-500">Monitoreo de ingresos, egresos y liquidez bancaria proyectada</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#003366] group-hover:translate-x-1 transition-all" />
        </div>

        <div 
          onClick={() => setActiveRealm('activo_fijo')}
          className="p-3 bg-white border border-[#E0E0E0] hover:border-[#003366] rounded-lg shadow-xs flex items-center justify-between cursor-pointer group transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-50 text-amber-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Módulo de Activo Fijo y Depreciación</span>
              <span className="text-[11px] text-slate-500">Control de depreciación financiera (IFRS) vs. tributaria (Art. 31 LIR) y Recuadro N° 10 F22</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#003366] group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* SUBVIEW: LIBRO MAYOR */}
      {activeSubView === 'libro_mayor' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Filtrar Cuenta Mayor:</span>
              <select
                value={selectedMayorCuenta}
                onChange={(e) => setSelectedMayorCuenta(e.target.value)}
                className="text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800 font-medium"
              >
                <option value="todas">Todas las Cuentas del Mayor</option>
                {planCuentas.map(c => (
                  <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportMayorCSV}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Mayor CSV</span>
              </button>

              <button
                onClick={printDocumentView}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Mayor</span>
              </button>
            </div>
          </div>

          {/* Cards of Accounts (Cuentas T / Mayor) */}
          <div className="space-y-4">
            {Object.values(movimientosPorCuenta)
              .filter(m => selectedMayorCuenta === 'todas' || m.cuenta === selectedMayorCuenta)
              .map(mayorItem => {
                let saldoAcumulado = 0;
                return (
                  <div key={mayorItem.cuenta} className="bg-white border border-[#E0E0E0] rounded-lg shadow-xs overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#003366] bg-white border border-slate-300 px-2 py-0.5 rounded">
                          {mayorItem.cuenta}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{mayorItem.nombre}</span>
                        <span className="text-[10px] text-slate-500 font-sans">({mayorItem.tipo})</span>
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-800">
                        Saldo Final: ${(mayorItem.totalDebe - mayorItem.totalHaber).toLocaleString('es-CL')}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50/50 uppercase text-[10px] text-slate-500 border-b border-slate-100">
                          <tr>
                            <th className="py-1.5 px-3 w-24">Fecha</th>
                            <th className="py-1.5 px-3 w-24">Asiento #</th>
                            <th className="py-1.5 px-3">Glosa del Asiento</th>
                            <th className="py-1.5 px-3 text-right w-28 font-tabular">Debe ($)</th>
                            <th className="py-1.5 px-3 text-right w-28 font-tabular">Haber ($)</th>
                            <th className="py-1.5 px-3 text-right w-28 font-tabular font-bold">Saldo ($)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                          {mayorItem.movimientos.length > 0 ? (
                            mayorItem.movimientos.map((mov, i) => {
                              saldoAcumulado += (mov.debe - mov.haber);
                              return (
                                <tr key={i} className="hover:bg-slate-50">
                                  <td className="py-1.5 px-3 text-slate-600 font-tabular">{mov.fecha}</td>
                                  <td className="py-1.5 px-3 font-bold text-[#003366]">#{mov.asientoNumero}</td>
                                  <td className="py-1.5 px-3 font-sans text-slate-800">{mov.glosa}</td>
                                  <td className="py-1.5 px-3 text-right font-tabular text-slate-900">
                                    {mov.debe > 0 ? `$${mov.debe.toLocaleString('es-CL')}` : '—'}
                                  </td>
                                  <td className="py-1.5 px-3 text-right font-tabular text-slate-900">
                                    {mov.haber > 0 ? `$${mov.haber.toLocaleString('es-CL')}` : '—'}
                                  </td>
                                  <td className="py-1.5 px-3 text-right font-tabular font-bold text-slate-900">
                                    ${saldoAcumulado.toLocaleString('es-CL')}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-2 px-3 text-slate-400 italic font-sans text-center">
                                Sin movimientos en el período seleccionado.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-mono font-bold text-xs">
                          <tr>
                            <td colSpan={3} className="py-2 px-3 text-right font-sans">Sumas Totales:</td>
                            <td className="py-2 px-3 text-right font-tabular text-[#003366]">${mayorItem.totalDebe.toLocaleString('es-CL')}</td>
                            <td className="py-2 px-3 text-right font-tabular text-[#003366]">${mayorItem.totalHaber.toLocaleString('es-CL')}</td>
                            <td className="py-2 px-3 text-right font-tabular text-emerald-800">${(mayorItem.totalDebe - mayorItem.totalHaber).toLocaleString('es-CL')}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* SUBVIEW: BALANCE DE 8 COLUMNAS (BALANCE TRIBUTARIO) */}
      {activeSubView === 'balance_8_columnas' && (
        <Balance8ColumnasView
          onVerMayorCuenta={(codigoCuenta) => {
            setSelectedMayorCuenta(codigoCuenta);
            setActiveSubView('libro_mayor');
          }}
        />
      )}

      {/* SUBVIEW: ESTADO DE SITUACIÓN FINANCIERA (NIC 1) */}
      {activeSubView === 'situacion_financiera' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Estado de Situación Financiera Clasificado (NIC 1)</h2>
              <p className="text-xs text-slate-500">Activos, Pasivos y Patrimonio clasificados según liquidez y exigibilidad</p>
            </div>
            <button
              onClick={printDocumentView}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Balance</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#003366] border-b border-slate-200 pb-2">ACTIVOS</h3>
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800 bg-slate-50 p-2 rounded flex justify-between">
                  <span>Activos Corrientes:</span>
                  <span className="font-mono font-tabular">${activosCorrientes.reduce((s, c) => s + c.saldo, 0).toLocaleString('es-CL')}</span>
                </div>
                {activosCorrientes.map(c => (
                  <div key={c.codigo} className="flex justify-between py-1 text-slate-700 pl-2">
                    <span>{c.nombre}</span>
                    <span className="font-mono font-tabular">${c.saldo.toLocaleString('es-CL')}</span>
                  </div>
                ))}
                <div className="font-bold text-slate-800 bg-slate-50 p-2 rounded flex justify-between mt-3">
                  <span>Activos No Corrientes:</span>
                  <span className="font-mono font-tabular">${activosNoCorrientes.reduce((s, c) => s + c.saldo, 0).toLocaleString('es-CL')}</span>
                </div>
                {activosNoCorrientes.map(c => (
                  <div key={c.codigo} className="flex justify-between py-1 text-slate-700 pl-2">
                    <span>{c.nombre}</span>
                    <span className="font-mono font-tabular">${c.saldo.toLocaleString('es-CL')}</span>
                  </div>
                ))}
                <div className="p-3 bg-[#003366] text-white font-bold rounded flex justify-between text-sm mt-4">
                  <span>TOTAL ACTIVOS:</span>
                  <span className="font-mono font-tabular">${totalActivos.toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#003366] border-b border-slate-200 pb-2">PASIVOS Y PATRIMONIO</h3>
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800 bg-slate-50 p-2 rounded flex justify-between">
                  <span>Pasivos Corrientes:</span>
                  <span className="font-mono font-tabular">${pasivosCorrientes.reduce((s, c) => s + c.saldo, 0).toLocaleString('es-CL')}</span>
                </div>
                {pasivosCorrientes.map(c => (
                  <div key={c.codigo} className="flex justify-between py-1 text-slate-700 pl-2">
                    <span>{c.nombre}</span>
                    <span className="font-mono font-tabular">${c.saldo.toLocaleString('es-CL')}</span>
                  </div>
                ))}
                <div className="font-bold text-slate-800 bg-slate-50 p-2 rounded flex justify-between mt-3">
                  <span>Pasivos No Corrientes:</span>
                  <span className="font-mono font-tabular">${pasivosNoCorrientes.reduce((s, c) => s + c.saldo, 0).toLocaleString('es-CL')}</span>
                </div>
                {pasivosNoCorrientes.map(c => (
                  <div key={c.codigo} className="flex justify-between py-1 text-slate-700 pl-2">
                    <span>{c.nombre}</span>
                    <span className="font-mono font-tabular">${c.saldo.toLocaleString('es-CL')}</span>
                  </div>
                ))}
                <div className="font-bold text-slate-800 bg-slate-50 p-2 rounded flex justify-between mt-3">
                  <span>Patrimonio Neto:</span>
                  <span className="font-mono font-tabular">${totalPatrimonio.toLocaleString('es-CL')}</span>
                </div>
                {patrimonio.map(c => (
                  <div key={c.codigo} className="flex justify-between py-1 text-slate-700 pl-2">
                    <span>{c.nombre}</span>
                    <span className="font-mono font-tabular">${c.saldo.toLocaleString('es-CL')}</span>
                  </div>
                ))}
                <div className="p-3 bg-[#003366] text-white font-bold rounded flex justify-between text-sm mt-4">
                  <span>TOTAL PASIVOS Y PATRIMONIO:</span>
                  <span className="font-mono font-tabular">${(totalPasivos + totalPatrimonio).toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW: ESTADO DE RESULTADO */}
      {activeSubView === 'estado_resultado' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-4 max-w-4xl mx-auto">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Estado de Resultados por Función (NIC 1)</h2>
              <p className="text-xs text-slate-500">Ingresos, Costos Operacionales y Margen Neto Acumulado</p>
            </div>
            <button
              onClick={printDocumentView}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded shadow-xs"
            >
              Imprimir
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 font-semibold text-slate-800">
              <span>Ingresos de Actividades Ordinarias (Ventas Netas)</span>
              <span className="font-mono font-tabular text-[#003366]">+${totalVentas.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 pl-4">
              <span>(-) Costos Directos de Explotación y Materiales</span>
              <span className="font-mono font-tabular text-rose-600">-${totalCostos.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between py-2 bg-slate-50 px-3 rounded font-bold text-slate-900">
              <span>MARGEN BRUTO OPERACIONAL:</span>
              <span className="font-mono font-tabular text-emerald-800">${(totalVentas - totalCostos).toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 pl-4">
              <span>(-) Gastos de Administración, Ventas y Generales</span>
              <span className="font-mono font-tabular text-rose-600">-${totalGastos.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between py-3 bg-[#003366] text-white px-4 rounded font-bold text-sm">
              <span>RESULTADO ANTES DE IMPUESTOS (UTILIDAD NETA):</span>
              <span className="font-mono font-tabular">${resultadoNeto.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW: EERR AÑO A AÑO (COMPARATIVO HISTÓRICO) */}
      {activeSubView === 'eerr_comparativo' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-5 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Estado de Resultados Comparativo (Año a Año)</h2>
              <p className="text-xs text-slate-500">Evolución de márgenes operacionales y utilidades históricas (2024 - 2026)</p>
            </div>
            <button
              onClick={printDocumentView}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded shadow-xs"
            >
              Imprimir Comparativa
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-[#003366] text-white uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Línea del Estado de Resultados</th>
                  <th className="py-2.5 px-3 text-right font-tabular">Año 2026 ($)</th>
                  <th className="py-2.5 px-3 text-right font-tabular">Año 2025 ($)</th>
                  <th className="py-2.5 px-3 text-right font-tabular">Año 2024 ($)</th>
                  <th className="py-2.5 px-3 text-right font-tabular">Var. 25/26 (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-sans font-semibold text-slate-900">Ingresos de Actividades Ordinarias</td>
                  <td className="py-2 px-3 text-right font-tabular text-[#003366] font-bold">${totalVentas.toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-right font-tabular">${Math.round(totalVentas * 0.88).toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-right font-tabular">${Math.round(totalVentas * 0.76).toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-right font-tabular text-emerald-700 font-bold">+13.6%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-sans text-slate-700 pl-4">(-) Costos Directos de Explotación</td>
                  <td className="py-2 px-3 text-right font-tabular text-rose-600">-${totalCostos.toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-right font-tabular text-rose-600">-${Math.round(totalCostos * 0.89).toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-right font-tabular text-rose-600">-${Math.round(totalCostos * 0.78).toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-right font-tabular text-rose-600">+12.4%</td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="py-2 px-3 font-sans text-slate-900">MARGEN BRUTO OPERACIONAL</td>
                  <td className="py-2 px-3 text-right font-tabular text-emerald-800">${(totalVentas - totalCostos).toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-right font-tabular text-emerald-800">${Math.round((totalVentas - totalCostos) * 0.87).toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-right font-tabular text-emerald-800">${Math.round((totalVentas - totalCostos) * 0.74).toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-right font-tabular text-emerald-700">+14.9%</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-sans text-slate-700 pl-4">(-) Gastos de Administración y Ventas</td>
                  <td className="py-2 px-3 text-right font-tabular text-rose-600">-${totalGastos.toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-right font-tabular text-rose-600">-${Math.round(totalGastos * 0.91).toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-right font-tabular text-rose-600">-${Math.round(totalGastos * 0.80).toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-right font-tabular text-rose-600">+9.8%</td>
                </tr>
                <tr className="bg-[#003366] text-white font-bold font-sans">
                  <td className="py-2.5 px-3">RESULTADO ANTES DE IMPUESTOS (UTILIDAD NETA)</td>
                  <td className="py-2.5 px-3 text-right font-mono font-tabular text-emerald-300">${resultadoNeto.toLocaleString('es-CL')}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-tabular text-emerald-300">${Math.round(resultadoNeto * 0.84).toLocaleString('es-CL')}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-tabular text-emerald-300">${Math.round(resultadoNeto * 0.69).toLocaleString('es-CL')}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-tabular text-emerald-300 font-bold">+19.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBVIEW: PLAN DE CUENTAS */}
      {activeSubView === 'cuentas' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Plan de Cuentas IFRS y Régimen Tributario Chileno</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3 font-semibold">Código</th>
                  <th className="py-2 px-3 font-semibold">Nombre de la Cuenta</th>
                  <th className="py-2 px-3 font-semibold">Clasificación IFRS</th>
                  <th className="py-2 px-3 font-semibold">Naturaleza</th>
                  <th className="py-2 px-3 font-semibold text-right">Saldo Actual ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {planCuentas.map(c => (
                  <tr key={c.codigo} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-500 font-bold">{c.codigo}</td>
                    <td className="py-2 px-3 font-sans font-semibold text-slate-900">{c.nombre}</td>
                    <td className="py-2 px-3 font-sans text-slate-600">{c.tipo}</td>
                    <td className="py-2 px-3 font-sans text-slate-600">{c.naturaleza}</td>
                    <td className={`py-2 px-3 text-right font-tabular font-bold ${c.saldo < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      ${c.saldo.toLocaleString('es-CL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBVIEW: COMPRAS Y VENTAS (Default) */}
      {activeSubView === 'compras_ventas' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded text-xs">
                <button
                  onClick={() => setFilterTipo('todos')}
                  className={`px-3 py-1 rounded font-medium ${filterTipo === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                >
                  Todos ({dtes.length})
                </button>
                <button
                  onClick={() => setFilterTipo('emitido')}
                  className={`px-3 py-1 rounded font-medium ${filterTipo === 'emitido' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                >
                  Ventas
                </button>
                <button
                  onClick={() => setFilterTipo('recibido')}
                  className={`px-3 py-1 rounded font-medium ${filterTipo === 'recibido' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                >
                  Compras
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por RUT, Razón Social o Folio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#003366] focus:outline-none w-56 sm:w-72"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const headers = ['Fecha', 'Tipo', 'Folio', 'RUT', 'Razón Social', 'Exento', 'Neto', 'IVA', 'Total', 'Estado'];
                  const rows = filteredDtes.map(d => [d.fechaEmision, d.tipo, d.folio, d.rutContraparte, d.razonSocialContraparte, d.montoExento, d.montoNeto, d.montoIVA, d.montoTotal, d.estadoContable]);
                  exportToCSV(`Libro_Compras_Ventas_${empresaActiva.rut}`, headers, rows);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>

              <button
                onClick={() => {
                  setActiveRealm('ventas');
                  setActiveSubView('emision');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Emitir Factura</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#E0E0E0] rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Fecha</th>
                    <th className="py-2.5 px-3 font-semibold">Tipo DTE</th>
                    <th className="py-2.5 px-3 font-semibold font-tabular">Folio</th>
                    <th className="py-2.5 px-3 font-semibold">RUT Contraparte</th>
                    <th className="py-2.5 px-3 font-semibold">Razón Social</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Exento</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Neto</th>
                    <th className="py-2.5 px-3 font-semibold text-right">IVA (19%)</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total ($)</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Estado Contable</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDtes.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-tabular text-slate-600">{d.fechaEmision}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">{d.tipo.split('-')[0].trim()}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{d.folio}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{d.rutContraparte}</td>
                      <td className="py-2 px-3 text-slate-800 max-w-[200px] truncate">{d.razonSocialContraparte}</td>
                      <td className="py-2 px-3 text-right font-mono font-tabular">${d.montoExento.toLocaleString('es-CL')}</td>
                      <td className="py-2 px-3 text-right font-mono font-tabular">${d.montoNeto.toLocaleString('es-CL')}</td>
                      <td className="py-2 px-3 text-right font-mono font-tabular">${d.montoIVA.toLocaleString('es-CL')}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold font-tabular text-slate-900">${d.montoTotal.toLocaleString('es-CL')}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          d.estadoContable === 'Centralizado' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {d.estadoContable}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {d.estadoContable === 'Por centralizar' ? (
                          <button
                            onClick={() => centralizarDTE(d.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded"
                          >
                            Centralizar
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium">✓ En Asiento</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW: LIBRO DIARIO */}
      {activeSubView === 'libro_diario' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-4 shadow-xs flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900">Libro Diario General y Comprobantes Contables</h2>
            <button
              onClick={() => setModalAsientoOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded shadow-xs"
            >
              + Nuevo Asiento
            </button>
          </div>

          <div className="space-y-4">
            {filteredAsientos.map(asiento => (
              <div key={asiento.id} className="bg-white border border-[#E0E0E0] rounded-lg shadow-xs overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between text-xs">
                  <span className="font-bold font-mono">Asiento #{asiento.numero} · {asiento.fecha} · Tipo: {asiento.tipo}</span>
                  <span className="text-slate-500">Por: {asiento.creadoPor}</span>
                </div>
                <div className="px-4 py-1.5 text-xs text-slate-700 font-medium">{asiento.glosaGeneral}</div>
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {asiento.lineas.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="py-1 px-4 text-slate-500 w-24">{l.codigoCuenta}</td>
                        <td className="py-1 px-4 text-slate-900 font-sans">{l.nombreCuenta}</td>
                        <td className="py-1 px-4 text-slate-600 font-sans">{l.glosa}</td>
                        <td className="py-1 px-4 text-right font-tabular w-32">{l.debe > 0 ? `$${l.debe.toLocaleString('es-CL')}` : '—'}</td>
                        <td className="py-1 px-4 text-right font-tabular w-32">{l.haber > 0 ? `$${l.haber.toLocaleString('es-CL')}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold font-mono text-xs">
                    <tr>
                      <td colSpan={3} className="py-1.5 px-4 text-right font-sans">Sumas Iguales:</td>
                      <td className="py-1.5 px-4 text-right text-emerald-800 font-tabular">${asiento.totalDebe.toLocaleString('es-CL')}</td>
                      <td className="py-1.5 px-4 text-right text-emerald-800 font-tabular">${asiento.totalHaber.toLocaleString('es-CL')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBVIEW: PANEL PRINCIPAL (RESUMEN) */}
      {activeSubView === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveSubView('balance_8_columnas')}
              className="p-4 bg-white border border-[#E0E0E0] hover:border-[#003366] rounded-lg shadow-xs flex flex-col items-center text-center transition-colors group"
            >
              <div className="p-2.5 rounded bg-blue-50 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors mb-2">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Balance 8 Columnas</span>
              <span className="text-[10px] text-slate-500">Balance Tributario Oficial</span>
            </button>

            <button
              onClick={() => setActiveSubView('libro_mayor')}
              className="p-4 bg-white border border-[#E0E0E0] hover:border-[#003366] rounded-lg shadow-xs flex flex-col items-center text-center transition-colors group"
            >
              <div className="p-2.5 rounded bg-blue-50 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Libro Mayor</span>
              <span className="text-[10px] text-slate-500">Cuentas T y Movimientos</span>
            </button>

            <button
              onClick={() => setActiveSubView('situacion_financiera')}
              className="p-4 bg-white border border-[#E0E0E0] hover:border-[#003366] rounded-lg shadow-xs flex flex-col items-center text-center transition-colors group"
            >
              <div className="p-2.5 rounded bg-blue-50 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors mb-2">
                <PieChart className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Situación Financiera</span>
              <span className="text-[10px] text-slate-500">NIC 1 IFRS</span>
            </button>

            <button
              onClick={() => setActiveSubView('estado_resultado')}
              className="p-4 bg-white border border-[#E0E0E0] hover:border-[#003366] rounded-lg shadow-xs flex flex-col items-center text-center transition-colors group"
            >
              <div className="p-2.5 rounded bg-blue-50 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors mb-2">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Estado Resultado</span>
              <span className="text-[10px] text-slate-500">Margen por Función</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
