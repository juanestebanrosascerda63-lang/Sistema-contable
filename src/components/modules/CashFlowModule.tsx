import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { FlujoCajaItem } from '../../types/erp';
import { exportToCSV, printDocumentView } from '../../utils/export';
import { 
  DollarSign, 
  Plus, 
  Download, 
  Printer, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Calendar,
  Wallet,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';

export const CashFlowModule: React.FC = () => {
  const { empresaActiva, flujoCaja, addFlujoCajaItem } = useERP();

  const [selectedMes, setSelectedMes] = useState('2026-10');
  const [filterCat, setFilterCat] = useState<'todos' | 'Ingreso Operacional' | 'Egreso Operacional' | 'Inversión' | 'Financiamiento'>('todos');
  const [showAddModal, setShowAddModal] = useState(false);

  // New cash flow item state
  const [concepto, setConcepto] = useState('');
  const [categoria, setCategoria] = useState<FlujoCajaItem['categoria']>('Ingreso Operacional');
  const [monto, setMonto] = useState(1500000);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [contraparte, setContraparte] = useState('');
  const [estado, setEstado] = useState<FlujoCajaItem['estado']>('Proyectado');

  const filteredItems = flujoCaja.filter(item => {
    if (item.empresaId !== empresaActiva.id && flujoCaja.length > 4) return false;
    if (filterCat !== 'todos' && item.categoria !== filterCat) return false;
    return true;
  });

  // Calculate totals
  const totalIngresos = filteredItems
    .filter(i => i.categoria === 'Ingreso Operacional')
    .reduce((s, i) => s + (i.montoReal > 0 ? i.montoReal : i.montoProyectado), 0);

  const totalEgresosOperacionales = filteredItems
    .filter(i => i.categoria === 'Egreso Operacional')
    .reduce((s, i) => s + (i.montoReal > 0 ? i.montoReal : i.montoProyectado), 0);

  const totalInversiones = filteredItems
    .filter(i => i.categoria === 'Inversión')
    .reduce((s, i) => s + (i.montoReal > 0 ? i.montoReal : i.montoProyectado), 0);

  const totalFinanciamiento = filteredItems
    .filter(i => i.categoria === 'Financiamiento')
    .reduce((s, i) => s + (i.montoReal > 0 ? i.montoReal : i.montoProyectado), 0);

  const saldoInicialBanco = 28450000;
  const flujoNetoOperacional = totalIngresos - totalEgresosOperacionales;
  const saldoFinalProyectado = saldoInicialBanco + totalIngresos - totalEgresosOperacionales - totalInversiones - totalFinanciamiento;

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    addFlujoCajaItem({
      empresaId: empresaActiva.id,
      fecha,
      mes: selectedMes,
      categoria,
      concepto,
      montoProyectado: Number(monto),
      montoReal: estado === 'Ejecutado' ? Number(monto) : 0,
      estado,
      contraparte: contraparte || 'Cliente / Proveedor General',
    });
    setShowAddModal(false);
    setConcepto('');
    setContraparte('');
  };

  const handleExportCSV = () => {
    const headers = ['Fecha', 'Categoría', 'Concepto', 'Contraparte', 'Monto Proyectado ($)', 'Monto Real ($)', 'Estado'];
    const rows = filteredItems.map(i => [
      i.fecha,
      i.categoria,
      i.concepto,
      i.contraparte,
      i.montoProyectado,
      i.montoReal,
      i.estado
    ]);
    exportToCSV(`Flujo_de_Caja_${empresaActiva.rut}_${selectedMes}`, headers, rows);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3 no-print">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#003366]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Flujo de Caja (Cash Flow Proyectado y Real)
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            {empresaActiva.razonSocial} · Monitoreo de liquidez, recaudación y compromisos financieros
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={printDocumentView}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Informe</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Movimiento de Caja</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Saldo Inicial Cuentas Corrientes</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            ${saldoInicialBanco.toLocaleString('es-CL')}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Banco Estado + Santander</span>
        </div>

        <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Ingresos Operacionales (Cobranzas)</span>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
            +${totalIngresos.toLocaleString('es-CL')}
          </p>
          <span className="text-[10px] text-slate-500">Recaudación DTE y EEPP</span>
        </div>

        <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Egresos Operacionales (Pagos)</span>
          <p className="text-xl font-bold font-mono text-rose-600 mt-1">
            -${totalEgresosOperacionales.toLocaleString('es-CL')}
          </p>
          <span className="text-[10px] text-slate-500">Proveedores, Sueldos e Impuestos</span>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-lg shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Saldo Final Estimado en Caja</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
            ${saldoFinalProyectado.toLocaleString('es-CL')}
          </p>
          <span className="text-[10px] text-slate-300">Flujo Neto: ${flujoNetoOperacional.toLocaleString('es-CL')}</span>
        </div>
      </div>

      {/* Filter and Category Bar */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setFilterCat('todos')}
            className={`px-3 py-1 font-medium rounded ${filterCat === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
          >
            Todos ({flujoCaja.length})
          </button>
          <button
            onClick={() => setFilterCat('Ingreso Operacional')}
            className={`px-3 py-1 font-medium rounded ${filterCat === 'Ingreso Operacional' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
          >
            Ingresos Operacionales
          </button>
          <button
            onClick={() => setFilterCat('Egreso Operacional')}
            className={`px-3 py-1 font-medium rounded ${filterCat === 'Egreso Operacional' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
          >
            Egresos Operacionales
          </button>
          <button
            onClick={() => setFilterCat('Inversión')}
            className={`px-3 py-1 font-medium rounded ${filterCat === 'Inversión' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
          >
            Inversiones (Activo Fijo)
          </button>
          <button
            onClick={() => setFilterCat('Financiamiento')}
            className={`px-3 py-1 font-medium rounded ${filterCat === 'Financiamiento' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
          >
            Financiamiento
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-700">Período:</span>
          <select
            value={selectedMes}
            onChange={(e) => setSelectedMes(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1 bg-white text-slate-800"
          >
            <option value="2026-10">Octubre 2026</option>
            <option value="2026-11">Noviembre 2026</option>
            <option value="2026-12">Diciembre 2026</option>
          </select>
        </div>
      </div>

      {/* Table of Movements */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3 font-semibold font-tabular">Fecha</th>
                <th className="py-2.5 px-3 font-semibold">Categoría de Flujo</th>
                <th className="py-2.5 px-3 font-semibold">Concepto / Glosa</th>
                <th className="py-2.5 px-3 font-semibold">Contraparte</th>
                <th className="py-2.5 px-3 font-semibold text-right font-tabular">Monto Proyectado ($)</th>
                <th className="py-2.5 px-3 font-semibold text-right font-tabular">Monto Real ($)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isIngreso = item.categoria === 'Ingreso Operacional';
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-tabular text-slate-600 whitespace-nowrap">{item.fecha}</td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isIngreso ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {item.categoria}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{item.concepto}</td>
                    <td className="py-2 px-3 text-slate-600">{item.contraparte}</td>
                    <td className={`py-2 px-3 text-right font-mono font-tabular ${isIngreso ? 'text-emerald-700' : 'text-slate-800'}`}>
                      ${item.montoProyectado.toLocaleString('es-CL')}
                    </td>
                    <td className={`py-2 px-3 text-right font-mono font-bold font-tabular ${isIngreso ? 'text-emerald-800' : 'text-rose-700'}`}>
                      {item.montoReal > 0 ? `$${item.montoReal.toLocaleString('es-CL')}` : '—'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        item.estado === 'Ejecutado' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.estado}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Nuevo Movimiento de Flujo */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Registrar Movimiento de Flujo de Caja</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Concepto / Glosa</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Cobranza F.E. 1850 Cliente Mayorista"
                  value={concepto}
                  onChange={(e) => setConcepto(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="Ingreso Operacional">Ingreso Operacional</option>
                    <option value="Egreso Operacional">Egreso Operacional</option>
                    <option value="Inversión">Inversión (Activo Fijo)</option>
                    <option value="Financiamiento">Financiamiento</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monto ($)</label>
                  <input
                    type="number"
                    required
                    value={monto}
                    onChange={(e) => setMonto(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="Proyectado">Proyectado</option>
                    <option value="Ejecutado">Ejecutado (Cobrado/Pagado)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contraparte (Cliente / Proveedor / Banco)</label>
                <input
                  type="text"
                  placeholder="ej. Sodimac S.A."
                  value={contraparte}
                  onChange={(e) => setContraparte(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#003366] hover:bg-[#0056B3] text-white rounded font-semibold shadow-xs"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
