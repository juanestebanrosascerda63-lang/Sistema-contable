import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ActivoFijo } from '../../types/erp';
import { exportToCSV, printDocumentView } from '../../utils/export';
import { 
  Building2, 
  Plus, 
  Download, 
  Printer, 
  Calculator, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  Layers,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';

export const FixedAssetsModule: React.FC = () => {
  const { empresaActiva, activosFijos, addActivoFijo, addAsiento, addNotification, setActiveRealm, setActiveSubView } = useERP();

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'control' | 'comparativa' | 'recuadro10'>('control');
  const [selectedAno, setSelectedAno] = useState('2026');
  const [selectedPeriodicidad, setSelectedPeriodicidad] = useState<'Anual' | 'Mensual'>('Anual');
  const [activeSubTab, setActiveSubTab] = useState<'trib_normal' | 'trib_acelerada' | 'financiero'>('trib_normal');
  const [categoriasConfiguradas, setCategoriasConfiguradas] = useState(true);

  // Form State for new asset
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<ActivoFijo['categoria']>('Maquinarias y Equipos');
  const [fechaAdq, setFechaAdq] = useState(new Date().toISOString().split('T')[0]);
  const [costoHist, setCostoHist] = useState(25000000);
  const [valResidual, setValResidual] = useState(2500000);
  const [vidaFinanciera, setVidaFinanciera] = useState(10);
  const [vidaTribNormal, setVidaTribNormal] = useState(6);
  const [metodo, setMetodo] = useState<ActivoFijo['metodoDepreciacion']>('Tributaria Acelerada (1/3)');
  const [ubicacion, setUbicacion] = useState(empresaActiva.sucursalActiva);

  const filteredActivos = activosFijos.filter(af => af.empresaId === empresaActiva.id || activosFijos.length > 0);

  const totalCostoHistorico = filteredActivos.reduce((s, a) => s + a.costoHistorico, 0);
  const totalDeprFinanciera = filteredActivos.reduce((s, a) => s + a.cuotaDeprFinancieraAnual, 0);
  const totalDeprTributaria = filteredActivos.reduce((s, a) => s + a.cuotaDeprTributariaAnual, 0);
  const totalDiferenciaTemporaria = totalDeprTributaria - totalDeprFinanciera;
  // Efecto Impuesto Diferido Pasivo (27% tasa corporativa chilena)
  const impuestoDiferidoEstimado = Math.round(totalDiferenciaTemporaria * 0.27);

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();

    const vidaAcel = Math.max(1, Math.floor(vidaTribNormal / 3));
    const cuotaFin = Math.round((costoHist - valResidual) / Math.max(1, vidaFinanciera));
    let cuotaTrib = Math.round(costoHist / Math.max(1, vidaTribNormal));

    if (metodo === 'Tributaria Acelerada (1/3)') {
      cuotaTrib = Math.round(costoHist / vidaAcel);
    } else if (metodo === 'Instantánea / Super Acelerada (1/10)') {
      cuotaTrib = costoHist; // 100% en el año o 1/10
    }

    addActivoFijo({
      empresaId: empresaActiva.id,
      codigo: codigo || `AF-${Date.now().toString().slice(-4)}`,
      nombre,
      categoria,
      fechaAdquisicion: fechaAdq,
      costoHistorico: Number(costoHist),
      valorResidual: Number(valResidual),
      vidaUtilFinancieraAnos: Number(vidaFinanciera),
      vidaUtilTributariaNormalAnos: Number(vidaTribNormal),
      vidaUtilAceleradaAnos: vidaAcel,
      metodoDepreciacion: metodo,
      depreciacionAcumuladaFinanciera: cuotaFin,
      depreciacionAcumuladaTributaria: cuotaTrib,
      cuotaDeprFinancieraAnual: cuotaFin,
      cuotaDeprTributariaAnual: cuotaTrib,
      diferenciaDepreciacion: cuotaTrib - cuotaFin,
      ubicacionObra: ubicacion,
    });

    setShowAddModal(false);
  };

  const handleGenerarAsientoDepreciacion = () => {
    addAsiento({
      empresaId: empresaActiva.id,
      fecha: '2026-10-16',
      tipo: 'Ajuste IFRS',
      glosaGeneral: `Contabilización Depreciación Financiera del Ejercicio y Ajuste Impuesto Diferido (NIC 12)`,
      totalDebe: totalDeprFinanciera + impuestoDiferidoEstimado,
      totalHaber: totalDeprFinanciera + impuestoDiferidoEstimado,
      creadoPor: 'Módulo de Activos Fijos',
      lineas: [
        {
          id: `dep-l1-${Date.now()}`,
          codigoCuenta: '5.2.02',
          nombreCuenta: 'Gasto por Depreciación del Ejercicio (IFRS)',
          debe: totalDeprFinanciera,
          haber: 0,
          glosa: 'Cuota de depreciación económica anual de maquinarias y equipos'
        },
        {
          id: `dep-l2-${Date.now()}`,
          codigoCuenta: '1.2.05',
          nombreCuenta: '(-) Depreciación Acumulada IFRS',
          debe: 0,
          haber: totalDeprFinanciera,
          glosa: 'Amortización acumulada según vida útil económica'
        },
        {
          id: `dep-l3-${Date.now()}`,
          codigoCuenta: '5.2.03',
          nombreCuenta: 'Gasto por Impuesto Diferido (NIC 12)',
          debe: impuestoDiferidoEstimado,
          haber: 0,
          glosa: 'Efecto tributario de depreciación acelerada Art. 31 LIR'
        },
        {
          id: `dep-l4-${Date.now()}`,
          codigoCuenta: '2.2.02',
          nombreCuenta: 'Pasivo por Impuesto Diferido a Largo Plazo',
          debe: 0,
          haber: impuestoDiferidoEstimado,
          glosa: 'Pasivo por diferencia temporaria deducible en ejercicios futuros'
        }
      ]
    });

    addNotification({
      type: 'success',
      message: `Asiento de depreciación contable e impuesto diferido generado con éxito en el Libro Diario.`,
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'Código',
      'Activo Fijo',
      'Categoría',
      'Fecha Adq.',
      'Costo Histórico ($)',
      'V.U. IFRS',
      'Depr. Financiera Anual ($)',
      'V.U. SII Normal',
      'V.U. Acelerada (1/3)',
      'Depr. Tributaria Anual ($)',
      'Diferencia Temporaria ($)'
    ];

    const rows = filteredActivos.map(a => [
      a.codigo,
      a.nombre,
      a.categoria,
      a.fechaAdquisicion,
      a.costoHistorico,
      `${a.vidaUtilFinancieraAnos} años`,
      a.cuotaDeprFinancieraAnual,
      `${a.vidaUtilTributariaNormalAnos} años`,
      `${a.vidaUtilAceleradaAnos} años`,
      a.cuotaDeprTributariaAnual,
      a.diferenciaDepreciacion
    ]);

    exportToCSV(`Control_Activo_Fijo_Depreciacion_${empresaActiva.rut}`, headers, rows);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Top Header matching Image 3 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3 no-print">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#003366] text-white rounded">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Libro de Activo Fijo</span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold">Beta</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de depreciación y corrección monetaria · {empresaActiva.razonSocial}
          </p>
        </div>

        {/* Top Controls: 2026, Anual, Descargar, + Agregar, Settings */}
        <div className="flex items-center gap-2 text-xs">
          <select 
            value={selectedAno} 
            onChange={(e) => setSelectedAno(e.target.value)}
            className="border border-slate-300 rounded px-2.5 py-1.5 bg-white font-mono text-slate-700 font-semibold"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>

          <select 
            value={selectedPeriodicidad} 
            onChange={(e) => setSelectedPeriodicidad(e.target.value as any)}
            className="border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-700"
          >
            <option value="Anual">Anual</option>
            <option value="Mensual">Mensual</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-700 font-medium flex items-center gap-1.5"
            title="Descargar Planilla Activo Fijo"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-[#F5A623] hover:bg-[#E09612] text-white font-bold rounded flex items-center gap-1 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar</span>
          </button>

          <button 
            onClick={() => setCategoriasConfiguradas(prev => !prev)}
            className="p-1.5 border border-slate-300 hover:bg-slate-100 rounded text-slate-600 transition-colors"
            title="Configurar Cuentas / Alternar Vista"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Metric Cards matching Image 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">VALOR LIBRO</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            ${(totalCostoHistorico - totalDeprFinanciera).toLocaleString('es-CL')}
          </p>
          <span className="text-[10px] text-slate-400">Valor neto contable</span>
        </div>

        <div className="p-3.5 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CORRECCIÓN MONETARIA</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            ${Math.round(totalCostoHistorico * 0.042).toLocaleString('es-CL')}
          </p>
          <span className="text-[10px] text-slate-400">Revalorización IPC SII (4.2%)</span>
        </div>

        <div className="p-3.5 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DEPRECIACIÓN ACUMULADA</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            ${totalDeprFinanciera.toLocaleString('es-CL')}
          </p>
          <span className="text-[10px] text-slate-400">Ajuste dep. acumulada</span>
        </div>

        <div className="p-3.5 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DEPRECIACIÓN PERÍODO</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">
            ${totalDeprTributaria.toLocaleString('es-CL')}
          </p>
          <span className="text-[10px] text-slate-400">Gasto del ejercicio</span>
        </div>
      </div>

      {/* Vista Banner matching Image 3 */}
      <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider">
        VISTA: {activeSubTab === 'trib_normal' ? 'TRIB. NORMAL' : activeSubTab === 'trib_acelerada' ? 'TRIB. ACELERADA' : 'FINANCIERO'} · Año completo {selectedAno}
      </div>

      {/* Tabs and Action buttons matching Image 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-center gap-1 border-b border-slate-200 pb-1">
          <button
            onClick={() => { setActiveSubTab('trib_normal'); setActiveTab('control'); }}
            className={`px-3 py-1.5 font-bold transition-colors ${
              activeSubTab === 'trib_normal' && activeTab === 'control'
                ? 'text-[#003366] border-b-2 border-[#003366]' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Trib. Normal
          </button>
          <button
            onClick={() => { setActiveSubTab('trib_acelerada'); setActiveTab('control'); }}
            className={`px-3 py-1.5 font-bold transition-colors ${
              activeSubTab === 'trib_acelerada' && activeTab === 'control'
                ? 'text-[#003366] border-b-2 border-[#003366]' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Trib. Acelerada
          </button>
          <button
            onClick={() => { setActiveSubTab('financiero'); setActiveTab('comparativa'); }}
            className={`px-3 py-1.5 font-bold transition-colors ${
              activeSubTab === 'financiero' || activeTab === 'comparativa'
                ? 'text-[#003366] border-b-2 border-[#003366]' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Financiero
          </button>
          <button
            onClick={() => setActiveTab('recuadro10')}
            className={`px-3 py-1.5 font-bold transition-colors ml-2 ${
              activeTab === 'recuadro10' 
                ? 'text-[#003366] border-b-2 border-[#003366]' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Recuadro N° 10 F22
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveRealm('contabilidad'); setActiveSubView('libro_diario'); }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded transition-colors"
          >
            Ver Asientos
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded transition-colors"
          >
            Filtrar
          </button>
          <button
            onClick={handleGenerarAsientoDepreciacion}
            className="px-3 py-1.5 bg-[#003366] hover:bg-[#0056B3] text-white font-semibold rounded shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Hacer asiento general</span>
          </button>
        </div>
      </div>

      {/* If categories are unconfigured, show box from Image 3 */}
      {!categoriasConfiguradas && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-12 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto text-xl font-serif font-bold">
            i
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Configura tus categorías para registrar tus activos
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Con esto listo, el sistema va a poder calcular y registrar solo la depreciación de cada activo, sin que tengas que hacer los cálculos a mano.
            </p>
          </div>
          <button
            onClick={() => setCategoriasConfiguradas(true)}
            className="px-4 py-2 bg-[#F5A623] hover:bg-[#E09612] text-white font-bold rounded shadow-xs transition-colors text-xs"
          >
            + Configurar cuentas
          </button>
        </div>
      )}

      {/* TAB 1: Maestro de Activos */}
      {activeTab === 'control' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Inventario Físico y Contable de Bienes de Uso
              </h3>
              <p className="text-xs text-slate-500">
                Registro con método de depreciación, ubicación en obra o planta y valores netos
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
                <span>Imprimir Fichas</span>
              </button>

              <button
                onClick={handleGenerarAsientoDepreciacion}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded flex items-center gap-1.5 shadow-xs"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Generar Asiento Contable</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold font-tabular">Código</th>
                  <th className="py-2.5 px-3 font-semibold">Bien / Descripción</th>
                  <th className="py-2.5 px-3 font-semibold">Categoría</th>
                  <th className="py-2.5 px-3 font-semibold font-tabular">Fecha Adquisición</th>
                  <th className="py-2.5 px-3 font-semibold text-right font-tabular">Costo Histórico ($)</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Método Aplicado</th>
                  <th className="py-2.5 px-3 font-semibold text-right font-tabular">Depr. Acum. IFRS ($)</th>
                  <th className="py-2.5 px-3 font-semibold text-right font-tabular">Depr. Acum. SII ($)</th>
                  <th className="py-2.5 px-3 font-semibold">Ubicación / Obra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActivos.map((af) => (
                  <tr key={af.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-[#003366]">{af.codigo}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{af.nombre}</td>
                    <td className="py-2 px-3 text-slate-600">{af.categoria}</td>
                    <td className="py-2 px-3 font-tabular text-slate-600">{af.fechaAdquisicion}</td>
                    <td className="py-2 px-3 text-right font-mono font-tabular font-bold text-slate-900">
                      ${af.costoHistorico.toLocaleString('es-CL')}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#003366] border border-blue-200">
                        {af.metodoDepreciacion}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-tabular text-slate-700">
                      ${af.depreciacionAcumuladaFinanciera.toLocaleString('es-CL')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-tabular text-emerald-800 font-semibold">
                      ${af.depreciacionAcumuladaTributaria.toLocaleString('es-CL')}
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[11px]">{af.ubicacionObra || 'Central'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Comparativa de Métodos */}
      {activeTab === 'comparativa' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Conciliación: Depreciación Financiera (NIC 16) vs. Depreciación Tributaria (Art. 31 LIR)
            </h3>
            <p className="text-xs text-slate-500">
              Análisis de diferencias temporarias a trasladar al Recuadro N° 12 (RLI) y Recuadro N° 10 del F22
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Activo</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Costo ($)</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Vida Útil IFRS</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Cuota Financiera Anual</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Vida Útil Normal SII</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Vida Útil Acelerada (1/3)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Cuota Tributaria Anual</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Diferencia Anual</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Impuesto Diferido (27%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredActivos.map((af) => (
                  <tr key={af.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-sans font-semibold text-slate-800">{af.nombre}</td>
                    <td className="py-2 px-3 text-right font-tabular">${af.costoHistorico.toLocaleString('es-CL')}</td>
                    <td className="py-2 px-3 text-center font-tabular">{af.vidaUtilFinancieraAnos} años</td>
                    <td className="py-2 px-3 text-right font-tabular text-slate-700">${af.cuotaDeprFinancieraAnual.toLocaleString('es-CL')}</td>
                    <td className="py-2 px-3 text-center font-tabular">{af.vidaUtilTributariaNormalAnos} años</td>
                    <td className="py-2 px-3 text-center font-tabular font-bold text-[#003366]">{af.vidaUtilAceleradaAnos} años</td>
                    <td className="py-2 px-3 text-right font-tabular text-emerald-800 font-bold">${af.cuotaDeprTributariaAnual.toLocaleString('es-CL')}</td>
                    <td className="py-2 px-3 text-right font-tabular font-bold text-amber-700">+${af.diferenciaDepreciacion.toLocaleString('es-CL')}</td>
                    <td className="py-2 px-3 text-right font-tabular text-purple-700">${Math.round(af.diferenciaDepreciacion * 0.27).toLocaleString('es-CL')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs text-slate-900">
                <tr>
                  <td colSpan={3} className="py-2.5 px-3 text-right font-sans">Totales Cuotas Anuales:</td>
                  <td className="py-2.5 px-3 text-right font-mono font-tabular">${totalDeprFinanciera.toLocaleString('es-CL')}</td>
                  <td colSpan={2}></td>
                  <td className="py-2.5 px-3 text-right font-mono font-tabular text-emerald-800">${totalDeprTributaria.toLocaleString('es-CL')}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-tabular text-amber-700">+${totalDiferenciaTemporaria.toLocaleString('es-CL')}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-tabular text-purple-700">${impuestoDiferidoEstimado.toLocaleString('es-CL')}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
            <span className="font-semibold block text-slate-900 mb-1">Efecto en la Renta Líquida Imponible (RLI):</span>
            En la determinación de la RLI de Primera Categoría (Art. 14 A), se debe agregar al resultado financiero la depreciación IFRS (${totalDeprFinanciera.toLocaleString('es-CL')} en Cód. [1675]) y deducir la depreciación tributaria (${totalDeprTributaria.toLocaleString('es-CL')} en Cód. [1680]).
          </div>
        </div>
      )}

      {/* TAB 3: Recuadro N° 10 F22 Oficial (Páginas del PDF suministrado) */}
      {activeTab === 'recuadro10' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <div>
              <span className="text-xs font-mono text-[#003366] font-bold block">FORMULARIO 22 / AÑO TRIBUTARIO 2026</span>
              <h3 className="text-base font-bold text-slate-900">
                RECUADRO N° 10: DEPRECIACIÓN (ART. 31 N° 5 Y 5 BIS LIR)
              </h3>
            </div>
            <button
              onClick={() => {
                setActiveRealm('impuestos');
                setActiveSubView('renta_f22');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-[#003366] bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 flex items-center gap-1"
            >
              <span>Ver F22 Completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase text-[10px] text-slate-700 font-bold">
                <tr>
                  <th className="py-2.5 px-4">Concepto Recuadro N° 10 F22</th>
                  <th className="py-2.5 px-4 text-center w-28">Código SII</th>
                  <th className="py-2.5 px-4 text-right w-44 font-tabular">Valor Declarado ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-800">Cantidad de bienes del activo inmovilizado</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-[#003366]">[940]</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{filteredActivos.length}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-800">Depreciación acelerada en 1/3 vida útil, del ejercicio (art. 31 N° 5 LIR)</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-[#003366]">[938]</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800">${totalDeprTributaria.toLocaleString('es-CL')}</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-800">Depreciación acelerada en 1/10 vida útil, del ejercicio (art. 31 N° 5 bis LIR)</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-[#003366]">[949]</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-600">$0</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-800">Total depreciación normal de los bienes con depreciación acelerada informada en los códigos 938, 949</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-[#003366]">[950]</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700">${Math.round(totalDeprTributaria / 3).toLocaleString('es-CL')}</td>
                </tr>
                <tr className="hover:bg-slate-50 bg-slate-50/70 font-bold">
                  <td className="py-2.5 px-4 text-slate-900">Diferencia entre depreciaciones aceleradas y normales del ejercicio, anteriores (traslado a DDAN / RRE)</td>
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-[#003366]">[1066]</td>
                  <td className="py-2.5 px-4 text-right font-mono font-tabular text-[#003366]">
                    ${(totalDeprTributaria - Math.round(totalDeprTributaria / 3)).toLocaleString('es-CL')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Nuevo Activo Fijo */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Incorporar Nuevo Activo Fijo</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código del Bien</label>
                  <input
                    type="text"
                    required
                    placeholder="AF-EQ-05"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="Maquinarias y Equipos">Maquinarias y Equipos</option>
                    <option value="Vehículos">Vehículos</option>
                    <option value="Edificaciones">Edificaciones</option>
                    <option value="Equipos Computacionales">Equipos Computacionales</option>
                    <option value="Instalaciones y Muebles">Instalaciones y Muebles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción del Activo Fijo</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Excavadora Oruga Caterpillar 320D"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Costo Histórico ($)</label>
                  <input
                    type="number"
                    required
                    value={costoHist}
                    onChange={(e) => setCostoHist(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor Residual ($)</label>
                  <input
                    type="number"
                    value={valResidual}
                    onChange={(e) => setValResidual(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fecha Adquisición</label>
                  <input
                    type="date"
                    value={fechaAdq}
                    onChange={(e) => setFechaAdq(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vida Útil Financiera IFRS (Años)</label>
                  <input
                    type="number"
                    min="1"
                    value={vidaFinanciera}
                    onChange={(e) => setVidaFinanciera(parseInt(e.target.value, 10) || 1)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vida Útil Normal SII (Años)</label>
                  <input
                    type="number"
                    min="1"
                    value={vidaTribNormal}
                    onChange={(e) => setVidaTribNormal(parseInt(e.target.value, 10) || 1)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Método de Depreciación</label>
                  <select
                    value={metodo}
                    onChange={(e) => setMetodo(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="Tributaria Acelerada (1/3)">Tributaria Acelerada (1/3)</option>
                    <option value="Tributaria Normal (SII)">Tributaria Normal (SII)</option>
                    <option value="Lineal Financiero (IFRS)">Lineal Financiero (IFRS)</option>
                    <option value="Instantánea / Super Acelerada (1/10)">Instantánea / ProPyme (100%)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ubicación / Obra Asignada</label>
                  <input
                    type="text"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
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
                  Registrar Activo Fijo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
