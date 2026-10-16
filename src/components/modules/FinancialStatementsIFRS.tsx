import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { exportToCSV, printDocumentView } from '../../utils/export';
import { 
  PieChart, 
  Download, 
  Printer, 
  FileCheck, 
  Clock, 
  Building, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert,
  Search,
  BookOpen
} from 'lucide-react';

export const FinancialStatementsIFRS: React.FC = () => {
  const { empresaActiva, planCuentas, auditLogs, activeSubView, setActiveSubView } = useERP();
  const [auditSearch, setAuditSearch] = useState('');

  // Group accounts by classified IFRS categories (NIC 1)
  const activosCorrientes = planCuentas.filter(c => c.tipo === 'Activo Corriente');
  const activosNoCorrientes = planCuentas.filter(c => c.tipo === 'Activo No Corriente');
  const pasivosCorrientes = planCuentas.filter(c => c.tipo === 'Pasivo Corriente');
  const pasivosNoCorrientes = planCuentas.filter(c => c.tipo === 'Pasivo No Corriente');
  const patrimonio = planCuentas.filter(c => c.tipo === 'Patrimonio');

  const totalActivosCorrientes = activosCorrientes.reduce((sum, c) => sum + c.saldo, 0);
  const totalActivosNoCorrientes = activosNoCorrientes.reduce((sum, c) => sum + c.saldo, 0);
  const totalActivos = totalActivosCorrientes + totalActivosNoCorrientes;

  const totalPasivosCorrientes = pasivosCorrientes.reduce((sum, c) => sum + c.saldo, 0);
  const totalPasivosNoCorrientes = pasivosNoCorrientes.reduce((sum, c) => sum + c.saldo, 0);
  const totalPasivos = totalPasivosCorrientes + totalPasivosNoCorrientes;

  const totalPatrimonio = patrimonio.reduce((sum, c) => sum + c.saldo, 0);
  const totalPasivoMasPatrimonio = totalPasivos + totalPatrimonio;
  const descuadreBalance = totalActivos - totalPasivoMasPatrimonio;

  // Estado de Resultado Integral
  const cuentasIngresos = planCuentas.filter(c => c.tipo === 'Ingresos');
  const cuentasCostos = planCuentas.filter(c => c.tipo === 'Costos');
  const cuentasGastos = planCuentas.filter(c => c.tipo === 'Gastos');

  const totalIngresos = cuentasIngresos.reduce((sum, c) => sum + c.saldo, 0);
  const totalCostos = cuentasCostos.reduce((sum, c) => sum + c.saldo, 0);
  const margenBruto = totalIngresos - totalCostos;
  const totalGastos = cuentasGastos.reduce((sum, c) => sum + c.saldo, 0);
  const resultadoOperacional = margenBruto - totalGastos;

  const handleExportBalanceExcel = () => {
    const headers = ['Clasificación NIC 1', 'Código Cuenta', 'Nombre de la Cuenta', 'Saldo ($)'];
    const rows: (string | number)[][] = [];

    rows.push(['ACTIVOS CORRIENTES', '', '', '']);
    activosCorrientes.forEach(c => rows.push(['Activo Corriente', c.codigo, c.nombre, c.saldo]));
    rows.push(['Total Activos Corrientes', '', '', totalActivosCorrientes]);

    rows.push(['ACTIVOS NO CORRIENTES', '', '', '']);
    activosNoCorrientes.forEach(c => rows.push(['Activo No Corriente', c.codigo, c.nombre, c.saldo]));
    rows.push(['Total Activos No Corrientes', '', '', totalActivosNoCorrientes]);
    rows.push(['TOTAL ACTIVOS', '', '', totalActivos]);

    rows.push(['PASIVOS CORRIENTES', '', '', '']);
    pasivosCorrientes.forEach(c => rows.push(['Pasivo Corriente', c.codigo, c.nombre, c.saldo]));
    rows.push(['Total Pasivos Corrientes', '', '', totalPasivosCorrientes]);

    rows.push(['PASIVOS NO CORRIENTES', '', '', '']);
    pasivosNoCorrientes.forEach(c => rows.push(['Pasivo No Corriente', c.codigo, c.nombre, c.saldo]));
    rows.push(['Total Pasivos No Corrientes', '', '', totalPasivosNoCorrientes]);

    rows.push(['PATRIMONIO NETO', '', '', '']);
    patrimonio.forEach(c => rows.push(['Patrimonio', c.codigo, c.nombre, c.saldo]));
    rows.push(['Total Patrimonio', '', '', totalPatrimonio]);
    rows.push(['TOTAL PASIVO + PATRIMONIO', '', '', totalPasivoMasPatrimonio]);

    exportToCSV(`Estado_Situacion_Financiera_${empresaActiva.rut}_NIC1`, headers, rows);
  };

  const filteredLogs = auditLogs.filter(l => {
    if (!auditSearch) return true;
    const term = auditSearch.toLowerCase();
    return (
      l.usuario.toLowerCase().includes(term) ||
      l.detalle.toLowerCase().includes(term) ||
      l.modulo.toLowerCase().includes(term) ||
      (l.folioAfectado && l.folioAfectado.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header and IFRS Sub-menu */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Estados Financieros bajo Normas IFRS / NIC y Auditoría
          </h1>
          <p className="text-xs text-slate-500">
            {empresaActiva.razonSocial} · Moneda Funcional: Peso Chileno (CLP)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubView('balance')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'balance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Situación Financiera (NIC 1)
          </button>
          <button
            onClick={() => setActiveSubView('resultado')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'resultado' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resultado Integral (NIC 1)
          </button>
          <button
            onClick={() => setActiveSubView('flujo')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'flujo' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flujo Efectivo (NIC 7)
          </button>
          <button
            onClick={() => setActiveSubView('activos_fijos')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'activos_fijos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Activos Fijos (NIC 16)
          </button>
          <button
            onClick={() => setActiveSubView('auditoria')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'auditoria' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Trail (RAI/RDA)
          </button>
        </div>
      </div>

      {/* SUBVIEW 1: Estado de Situación Financiera Clasificado (NIC 1) */}
      {activeSubView === 'balance' && (
        <div className="space-y-6">
          
          {/* Action Buttons & Cuadre Status */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded bg-blue-50 text-[#003366] border border-blue-100">
                <PieChart className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Estado de Situación Financiera Clasificado (NIC 1)
                </h2>
                <p className="text-xs text-slate-500">
                  Al 16 de Octubre de 2026 · Expresado en pesos chilenos ($)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportBalanceExcel}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Excel</span>
              </button>

              <button
                onClick={printDocumentView}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </button>
            </div>
          </div>

          {/* Balance Grid: 2 Columns (Activos vs Pasivos + Patrimonio) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print-sheet">
            
            {/* Left Column: ACTIVOS */}
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-5">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold text-[#003366] uppercase tracking-wider">
                  Activos
                </h3>
              </div>

              {/* Activos Corrientes */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded">
                  <span>ACTIVOS CORRIENTES (CIRCULANTE)</span>
                  <span className="font-mono font-tabular">${totalActivosCorrientes.toLocaleString('es-CL')}</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {activosCorrientes.map(c => (
                    <div key={c.codigo} className="py-1.5 flex justify-between items-center text-slate-700">
                      <span>{c.nombre}</span>
                      <span className="font-mono font-tabular">${c.saldo.toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activos No Corrientes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded">
                  <span>ACTIVOS NO CORRIENTES (PROPIEDADES, PLANTA Y EQUIPO)</span>
                  <span className="font-mono font-tabular">${totalActivosNoCorrientes.toLocaleString('es-CL')}</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {activosNoCorrientes.map(c => (
                    <div key={c.codigo} className="py-1.5 flex justify-between items-center text-slate-700">
                      <span>{c.nombre}</span>
                      <span className={`font-mono font-tabular ${c.saldo < 0 ? 'text-rose-600' : ''}`}>
                        ${c.saldo.toLocaleString('es-CL')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Activos */}
              <div className="p-3 bg-[#003366] text-white rounded flex justify-between items-center font-bold text-sm">
                <span>TOTAL ACTIVOS</span>
                <span className="font-mono font-tabular">${totalActivos.toLocaleString('es-CL')}</span>
              </div>
            </div>

            {/* Right Column: PASIVOS Y PATRIMONIO */}
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-5">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold text-[#003366] uppercase tracking-wider">
                  Pasivos y Patrimonio Neto
                </h3>
              </div>

              {/* Pasivos Corrientes */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded">
                  <span>PASIVOS CORRIENTES (A CORTO PLAZO)</span>
                  <span className="font-mono font-tabular">${totalPasivosCorrientes.toLocaleString('es-CL')}</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {pasivosCorrientes.map(c => (
                    <div key={c.codigo} className="py-1.5 flex justify-between items-center text-slate-700">
                      <span>{c.nombre}</span>
                      <span className="font-mono font-tabular">${c.saldo.toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pasivos No Corrientes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded">
                  <span>PASIVOS NO CORRIENTES (A LARGO PLAZO)</span>
                  <span className="font-mono font-tabular">${totalPasivosNoCorrientes.toLocaleString('es-CL')}</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {pasivosNoCorrientes.map(c => (
                    <div key={c.codigo} className="py-1.5 flex justify-between items-center text-slate-700">
                      <span>{c.nombre}</span>
                      <span className="font-mono font-tabular">${c.saldo.toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patrimonio Neto */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded">
                  <span>PATRIMONIO NETO</span>
                  <span className="font-mono font-tabular">${totalPatrimonio.toLocaleString('es-CL')}</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {patrimonio.map(c => (
                    <div key={c.codigo} className="py-1.5 flex justify-between items-center text-slate-700">
                      <span>{c.nombre}</span>
                      <span className="font-mono font-tabular">${c.saldo.toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Pasivo y Patrimonio */}
              <div className="p-3 bg-[#003366] text-white rounded flex justify-between items-center font-bold text-sm">
                <span>TOTAL PASIVOS Y PATRIMONIO</span>
                <span className="font-mono font-tabular">${totalPasivoMasPatrimonio.toLocaleString('es-CL')}</span>
              </div>
            </div>

          </div>

          {/* Cuadre Indicator Bar */}
          <div className="p-3 bg-white border border-[#E0E0E0] rounded-lg text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${descuadreBalance === 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="font-semibold text-slate-800">
                {descuadreBalance === 0 ? 'Balance Cuadrado y Verificado según NIC 1' : 'Advertencia de Descuadre'}
              </span>
            </div>
            <div className="font-mono text-slate-600">
              Diferencia: ${Math.abs(descuadreBalance).toLocaleString('es-CL')}
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: Estado de Resultado Integral (NIC 1) */}
      {activeSubView === 'resultado' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Estado de Resultado Integral por Función (NIC 1)
              </h3>
              <p className="text-xs text-slate-500">
                Desde el 01 de Enero al 16 de Octubre de 2026
              </p>
            </div>
            <button
              onClick={printDocumentView}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Resultado</span>
            </button>
          </div>

          <div className="space-y-3 text-xs max-w-3xl">
            <div className="flex justify-between py-2 border-b border-slate-100 font-semibold text-slate-900">
              <span>Ingresos de Actividades Ordinarias (Ventas Netas)</span>
              <span className="font-mono font-tabular text-[#003366]">${totalIngresos.toLocaleString('es-CL')}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 pl-4">
              <span>(-) Costo Directo de Materiales, Mano de Obra y Faena</span>
              <span className="font-mono font-tabular text-rose-600">-${totalCostos.toLocaleString('es-CL')}</span>
            </div>

            <div className="flex justify-between py-2 bg-slate-50 px-3 rounded font-bold text-slate-900">
              <span>GANANCIA BRUTA (MARGEN COMERCIAL)</span>
              <span className="font-mono font-tabular text-emerald-800">${margenBruto.toLocaleString('es-CL')}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100 text-slate-600 pl-4">
              <span>(-) Gastos de Administración y Ventas</span>
              <span className="font-mono font-tabular text-rose-600">-${totalGastos.toLocaleString('es-CL')}</span>
            </div>

            <div className="flex justify-between py-3 bg-[#003366] text-white px-4 rounded font-bold text-sm">
              <span>GANANCIA (PÉRDIDA) DEL EJERCICIO</span>
              <span className="font-mono font-tabular">${resultadoOperacional.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: Flujo de Efectivo (NIC 7) */}
      {activeSubView === 'flujo' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Estado de Flujos de Efectivo Método Directo (NIC 7)
          </h3>
          <p className="text-xs text-slate-500">
            Clasificación de flujos operacionales, de inversión y de financiamiento
          </p>

          <div className="space-y-4 pt-2 text-xs max-w-3xl">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span>1. Flujos de Efectivo procedentes de Actividades de Operación</span>
                <span className="font-mono font-tabular text-emerald-700">+$34.200.000</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Cobranza a clientes por ventas ($185M) menos pagos a proveedores ($112M) y pago a trabajadores ($38.8M).
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span>2. Flujos de Efectivo usados en Actividades de Inversión</span>
                <span className="font-mono font-tabular text-rose-600">-$12.500.000</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Adquisición de maquinaria pesada y mejoras de infraestructura en plantas y bodegas.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
              <div className="flex justify-between font-bold text-slate-800">
                <span>3. Flujos de Efectivo por Actividades de Financiación</span>
                <span className="font-mono font-tabular text-slate-700">-$4.800.000</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Amortización de préstamos bancarios a largo plazo y pago de cuotas leasing IFRS 16.
              </p>
            </div>

            <div className="p-3 bg-slate-900 text-white rounded flex justify-between font-bold">
              <span>INCREMENTO NETO DE EFECTIVO Y EQUIVALENTES</span>
              <span className="font-mono font-tabular text-emerald-400">+$16.900.000</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 4: Activos Fijos (NIC 16) */}
      {activeSubView === 'activos_fijos' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Cuadro de Activos Fijos, Depreciación IFRS vs. Tributaria (NIC 16)
          </h3>
          <p className="text-xs text-slate-500">
            Control de vida útil económica (IFRS) frente a depreciación acelerada permitida por el Art. 31 LIR
          </p>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3 font-semibold">Bien / Maquinaria</th>
                  <th className="py-2 px-3 font-semibold text-right">Valor Adquisición</th>
                  <th className="py-2 px-3 font-semibold text-center">Vida Útil IFRS</th>
                  <th className="py-2 px-3 font-semibold text-right">Depr. Acumulada IFRS</th>
                  <th className="py-2 px-3 font-semibold text-center">Vida Útil SII</th>
                  <th className="py-2 px-3 font-semibold text-right">Depr. Acelerada SII</th>
                  <th className="py-2 px-3 font-semibold text-right">Efecto Imp. Diferido (NIC 12)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-800">Grúa Torre Potain 45m (Obra Central)</td>
                  <td className="py-2 px-3 text-right font-mono font-tabular">$64.200.000</td>
                  <td className="py-2 px-3 text-center">15 años</td>
                  <td className="py-2 px-3 text-right font-mono font-tabular text-rose-600">-$8.560.000</td>
                  <td className="py-2 px-3 text-center">5 años</td>
                  <td className="py-2 px-3 text-right font-mono font-tabular text-rose-600">-$25.680.000</td>
                  <td className="py-2 px-3 text-right font-mono font-tabular text-amber-700">+$4.622.400</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-800">Camión Mixer Mercedes Actros 3336</td>
                  <td className="py-2 px-3 text-right font-mono font-tabular">$28.900.000</td>
                  <td className="py-2 px-3 text-center">10 años</td>
                  <td className="py-2 px-3 text-right font-mono font-tabular text-rose-600">-$5.780.000</td>
                  <td className="py-2 px-3 text-center">3 años</td>
                  <td className="py-2 px-3 text-right font-mono font-tabular text-rose-600">-$19.266.666</td>
                  <td className="py-2 px-3 text-right font-mono font-tabular text-amber-700">+$3.641.400</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBVIEW 5: Audit Trail Indeleble (Seguridad y Auditoría) */}
      {activeSubView === 'auditoria' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#003366]" />
                <span>Registro de Auditoría Indeleble (Audit Trail)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Bitácora de seguridad con fecha, hora, IP, usuario y detalle de cada comprobante creado o modificado
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar en el log de auditoría..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#003366] focus:outline-none w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold font-tabular">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Usuario</th>
                  <th className="py-2.5 px-3 font-semibold">Dirección IP</th>
                  <th className="py-2.5 px-3 font-semibold">Módulo</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Acción</th>
                  <th className="py-2.5 px-3 font-semibold">Detalle de la Operación</th>
                  <th className="py-2.5 px-3 font-semibold font-tabular">Folio Afectado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 font-mono text-[11px]">
                    <td className="py-2 px-3 text-slate-600 font-tabular whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2 px-3 font-semibold font-sans text-slate-800">
                      {log.usuario}
                    </td>
                    <td className="py-2 px-3 text-slate-500">
                      {log.ip}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-700">
                      {log.modulo}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {log.accion}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-800 max-w-md">
                      {log.detalle}
                    </td>
                    <td className="py-2 px-3 text-slate-700">
                      {log.folioAfectado || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
