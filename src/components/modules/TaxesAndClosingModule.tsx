import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { exportToCSV, printDocumentView } from '../../utils/export';
import { 
  FileSpreadsheet, 
  Calculator, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Landmark,
  FileText,
  ShieldCheck,
  RefreshCw,
  FolderLock,
  Building,
  Check
} from 'lucide-react';

export const TaxesAndClosingModule: React.FC = () => {
  const { 
    empresaActiva, 
    dtes, 
    declaracionesJuradas, 
    calcularDDJJ, 
    activeSubView, 
    setActiveSubView,
    addAsiento,
    addNotification,
    activosFijos
  } = useERP();

  const [selectedPeriodo, setSelectedPeriodo] = useState('2026-09');
  const [selectedRecuadroF22, setSelectedRecuadroF22] = useState<string>('anverso');
  const [cmAno, setCmAno] = useState('2026');
  const [cmVariacionIPC, setCmVariacionIPC] = useState(4.2); // 4.2% IPC

  // F22 State
  const [tipoCuentaBancaria, setTipoCuentaBancaria] = useState<'Cuenta corriente' | 'Cuenta vista' | 'Cuenta RUT' | 'Cuenta de ahorro'>('Cuenta corriente');
  const [bancoNombre, setBancoNombre] = useState('Banco del Estado de Chile (301)');
  const [numeroCuenta, setNumeroCuenta] = useState('00-12345678-9');

  // Calculations from DTEs
  const ventasEmitidas = dtes.filter(d => d.empresaId === empresaActiva.id && d.direccionOperacion === 'emitido');
  const comprasRecibidas = dtes.filter(d => d.empresaId === empresaActiva.id && d.direccionOperacion === 'recibido');

  const baseVentasAfectas = ventasEmitidas.reduce((sum, d) => sum + d.montoNeto, 0);
  const ivaDebitoFiscal = ventasEmitidas.reduce((sum, d) => sum + d.montoIVA, 0); // Codigo 538

  const baseComprasAfectas = comprasRecibidas.reduce((sum, d) => sum + d.montoNeto, 0);
  const ivaCreditoFiscal = comprasRecibidas.reduce((sum, d) => sum + d.montoIVA, 0); // Codigo 511

  const remanenteMesAnterior = 1450000;
  const retencionHonorarios = 439350; // Código 151 (14.5%)
  const retencionSegundaCat = 185000; // Código 152

  const tasaPPM = empresaActiva.tasaPPM;
  const montoPPM = Math.round(baseVentasAfectas * (tasaPPM / 100)); // Código 062

  const saldoIVA = ivaDebitoFiscal - (ivaCreditoFiscal + remanenteMesAnterior);
  const ivaAPagar = Math.max(0, saldoIVA);
  const remanenteSiguienteMes = saldoIVA < 0 ? Math.abs(saldoIVA) : 0;
  const totalAPagarF29 = ivaAPagar + retencionHonorarios + retencionSegundaCat + montoPPM;

  // F22 AT 2026 Determinations
  const baseImponibleProPyme = baseVentasAfectas - baseComprasAfectas;
  const tasaIDPC = empresaActiva.regimenTributario === '14 A Régimen General' ? 0.27 : 0.10;
  const impuestoPrimeraCategoriaCalculado = Math.max(0, Math.round(baseImponibleProPyme * tasaIDPC));
  const ppmAcumuladoAno = montoPPM * 12; // Anualizado
  const resultadoF22 = impuestoPrimeraCategoriaCalculado - ppmAcumuladoAno;
  const saldoAFavorF22 = resultadoF22 < 0 ? Math.abs(resultadoF22) : 0;
  const impuestoAPagarF22 = resultadoF22 > 0 ? resultadoF22 : 0;

  // Activos fijos totals for Recuadro 10
  const totalDeprAcelerada = activosFijos.reduce((s, a) => s + a.cuotaDeprTributariaAnual, 0);
  const totalDeprNormal = Math.round(totalDeprAcelerada / 3);
  const diferenciaRecuadro10 = totalDeprAcelerada - totalDeprNormal;

  const handleExportF22CSV = () => {
    const headers = ['Línea / Recuadro F22', 'Código SII', 'Descripción del Concepto', 'Monto ($)'];
    const rows = [
      ['Línea 1', 'Cód. 1592', 'Retiros o remesas afectos al IGC o IA', 42100000],
      ['Línea 14', 'Cód. 159', 'Incremento por IDPC con derecho a devolución', Math.round(42100000 * 0.10)],
      ['Línea 21', 'Cód. 750', 'Intereses pagados por créditos hipotecarios (Art. 55 bis)', 4500000],
      ['Línea 24', 'Cód. 170', 'BASE IMPONIBLE ANUAL DE IGC', 37600000],
      ['Línea 54', 'Cód. 18 / 19', 'IDPC Régimen Pro Pyme (14 D N° 3)', impuestoPrimeraCategoriaCalculado],
      ['Línea 85', 'Cód. 85 / 848', 'PPM Pagos Provisionales Mensuales deducibles', ppmAcumuladoAno],
      ['Línea 109', 'Cód. 305', 'RESULTADO LIQUIDACIÓN ANUAL IMPUESTO A LA RENTA', resultadoF22],
      ['Línea 110', 'Cód. 110', 'SALDO A FAVOR DEL CONTRIBUYENTE', saldoAFavorF22],
      ['Línea 112', 'Cód. 780', `DEVOLUCIÓN SOLICITADA EN ${tipoCuentaBancaria.toUpperCase()}`, saldoAFavorF22],
    ];
    exportToCSV(`F22_AT2026_${empresaActiva.rut}`, headers, rows);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Impuestos Mensuales (F29), Operación Renta (F22) y Declaraciones Juradas
          </h1>
          <p className="text-xs text-slate-500">
            {empresaActiva.razonSocial} · Formularios oficiales SII Año Tributario 2026
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubView('f29')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'f29' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            F29 Mensual
          </button>
          <button
            onClick={() => setActiveSubView('renta_f22')}
            className={`px-3 py-1.5 font-bold rounded transition-colors ${
              activeSubView === 'renta_f22' ? 'bg-[#003366] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Operación Renta F22 (AT 2026)
          </button>
          <button
            onClick={() => setActiveSubView('ddjj')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'ddjj' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Declaraciones Juradas (DDJJ)
          </button>
          <button
            onClick={() => setActiveSubView('correccion')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'correccion' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Corrección Monetaria Art. 41
          </button>
        </div>
      </div>

      {/* SUBVIEW 1: OPERACIÓN RENTA F22 (AÑO TRIBUTARIO 2026) */}
      {activeSubView === 'renta_f22' && (
        <div className="space-y-6">
          
          {/* Top Selector of F22 Sections */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#003366]" />
                <h2 className="text-base font-bold text-slate-900">
                  Formulario 22 — Impuestos Anuales a la Renta (Año Tributario 2026)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Formato oficial con códigos tributarios, recuadros informativos y liquidación anual del impuesto
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportF22CSV}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar F22 CSV</span>
              </button>

              <button
                onClick={printDocumentView}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir F22</span>
              </button>
            </div>
          </div>

          {/* Sub-Tabs for F22 Anverso vs Recuadros */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs no-print">
            <button
              onClick={() => setSelectedRecuadroF22('anverso')}
              className={`px-3 py-1.5 font-bold rounded ${selectedRecuadroF22 === 'anverso' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Anverso F22 (Rentas, Rebajas y Liquidación)
            </button>
            <button
              onClick={() => setSelectedRecuadroF22('recuadro10')}
              className={`px-3 py-1.5 font-bold rounded ${selectedRecuadroF22 === 'recuadro10' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Recuadro 10: Depreciación
            </button>
            <button
              onClick={() => setSelectedRecuadroF22('recuadro12')}
              className={`px-3 py-1.5 font-bold rounded ${selectedRecuadroF22 === 'recuadro12' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Recuadro 12: RLI 14 A
            </button>
            <button
              onClick={() => setSelectedRecuadroF22('recuadro17')}
              className={`px-3 py-1.5 font-bold rounded ${selectedRecuadroF22 === 'recuadro17' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Recuadro 17: Base Pro Pyme (14 D3)
            </button>
            <button
              onClick={() => setSelectedRecuadroF22('recuadro19')}
              className={`px-3 py-1.5 font-bold rounded ${selectedRecuadroF22 === 'recuadro19' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Recuadro 19: CPTS Pro Pyme
            </button>
            <button
              onClick={() => setSelectedRecuadroF22('tabla_igc')}
              className={`px-3 py-1.5 font-bold rounded ${selectedRecuadroF22 === 'tabla_igc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Tabla IGC AT 2026 (UTM / UTA)
            </button>
          </div>

          {/* SECTION: ANVERSO F22 AT 2026 */}
          {selectedRecuadroF22 === 'anverso' && (
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-6">
              
              {/* Header Box */}
              <div className="border-b border-slate-200 pb-3 flex justify-between items-center text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    SERVICIO DE IMPUESTOS INTERNOS — AÑO TRIBUTARIO 2026
                  </h3>
                  <p className="font-mono text-slate-500">
                    Contribuyente: {empresaActiva.razonSocial} · RUT: {empresaActiva.rut}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#003366] text-xs">F-22 AT 2026</span>
                  <span className="text-[10px] text-slate-400 block">Fuente: sii.cl/ayudas/formularios/f22_at2026.pdf</span>
                </div>
              </div>

              {/* 1. Rentas Brutas Afectas */}
              <div className="space-y-2 text-xs">
                <div className="bg-[#003366] text-white p-2 rounded font-bold uppercase text-[11px]">
                  I. RENTAS BRUTAS AFECTAS
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-800 w-16 font-bold">[Línea 1]</td>
                        <td className="py-2 px-3 text-slate-700">Retiros o remesas afectos al IGC o IA, según art. 14 letras A) y/o D) N° 3 LIR</td>
                        <td className="py-2 px-3 text-center font-mono text-[#003366] font-bold w-24">Cód. [1592]</td>
                        <td className="py-2 px-3 text-right font-mono font-tabular w-40">$42.100.000</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-800 w-16 font-bold">[Línea 2]</td>
                        <td className="py-2 px-3 text-slate-700">Dividendos afectos al IGC o IA, según art. 14 letras A) y/o D) N° 3 LIR</td>
                        <td className="py-2 px-3 text-center font-mono text-[#003366] font-bold w-24">Cód. [1594]</td>
                        <td className="py-2 px-3 text-right font-mono font-tabular w-40">$0</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-800 w-16 font-bold">[Línea 7]</td>
                        <td className="py-2 px-3 text-slate-700">Rentas percibidas de los arts. 42 N° 2 (honorarios) y 48 (rem. directores S.A.) LIR</td>
                        <td className="py-2 px-3 text-center font-mono text-[#003366] font-bold w-24">Cód. [461]</td>
                        <td className="py-2 px-3 text-right font-mono font-tabular w-40">$3.030.000</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-800 w-16 font-bold">[Línea 14]</td>
                        <td className="py-2 px-3 text-slate-700">Incremento por IDPC, según arts. 54 N° 1 y 62 LIR</td>
                        <td className="py-2 px-3 text-center font-mono text-[#003366] font-bold w-24">Cód. [159]</td>
                        <td className="py-2 px-3 text-right font-mono font-tabular w-40">$4.210.000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Rebajas a la Renta */}
              <div className="space-y-2 text-xs">
                <div className="bg-slate-100 text-slate-800 p-2 rounded font-bold uppercase text-[11px]">
                  II. REBAJAS A LA RENTA
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-800 w-16 font-bold">[Línea 15]</td>
                        <td className="py-2 px-3 text-slate-700">Impuesto Territorial pagado en el año 2025, según art. 55 letra a) LIR</td>
                        <td className="py-2 px-3 text-center font-mono text-[#003366] font-bold w-24">Cód. [15]</td>
                        <td className="py-2 px-3 text-right font-mono font-tabular w-40 text-rose-600">-$650.000</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-800 w-16 font-bold">[Línea 21]</td>
                        <td className="py-2 px-3 text-slate-700">Intereses pagados por créditos con garantía hipotecaria (art. 55 bis LIR)</td>
                        <td className="py-2 px-3 text-center font-mono text-[#003366] font-bold w-24">Cód. [750]</td>
                        <td className="py-2 px-3 text-right font-mono font-tabular w-40 text-rose-600">-$4.500.000</td>
                      </tr>
                      <tr className="hover:bg-slate-50 bg-slate-50 font-bold">
                        <td className="py-2 px-3 text-[#003366] w-16">[Línea 24]</td>
                        <td className="py-2 px-3 text-slate-900">BASE IMPONIBLE ANUAL DE IGC (Código [170] / [158])</td>
                        <td className="py-2 px-3 text-center font-mono text-[#003366]">[170]</td>
                        <td className="py-2 px-3 text-right font-mono font-tabular text-[#003366]">$44.190.000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Impuestos Determinados */}
              <div className="space-y-2 text-xs">
                <div className="bg-slate-100 text-slate-800 p-2 rounded font-bold uppercase text-[11px]">
                  III. IMPUESTOS DETERMINADOS Y DEDUCCIONES (IDPC / PPM)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-800 w-16 font-bold">[Línea 54]</td>
                        <td className="py-2 px-3 text-slate-700">IDPC de empresas acogidas al régimen Pro Pyme (art. 14 letra D) N° 3 LIR)</td>
                        <td className="py-2 px-3 text-center font-mono text-[#003366] font-bold w-24">Cód. [18] / [19]</td>
                        <td className="py-2 px-3 text-right font-mono font-tabular w-40">${impuestoPrimeraCategoriaCalculado.toLocaleString('es-CL')}</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-800 w-16 font-bold">[Línea 85]</td>
                        <td className="py-2 px-3 text-slate-700">PPM y remanente del IEAM (art. 84 letras a, c, e y 14 D N° 3 LIR)</td>
                        <td className="py-2 px-3 text-center font-mono text-[#003366] font-bold w-24">Cód. [85] / [848]</td>
                        <td className="py-2 px-3 text-right font-mono font-tabular w-40 text-rose-600">-${ppmAcumuladoAno.toLocaleString('es-CL')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Liquidación Anual y Devolución Solicitada */}
              <div className="p-4 bg-slate-900 text-white rounded-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-bold block uppercase">
                      Línea 109 — Código [305]: RESULTADO LIQUIDACIÓN ANUAL IMPUESTO A LA RENTA
                    </span>
                    <span className="text-xs text-slate-300">
                      {saldoAFavorF22 > 0 ? 'Saldo a favor del contribuyente (Devolución)' : 'Impuesto adeudado a pagar'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono font-tabular text-emerald-400 block">
                      ${(saldoAFavorF22 > 0 ? saldoAFavorF22 : impuestoAPagarF22).toLocaleString('es-CL')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {saldoAFavorF22 > 0 ? 'Código [110] Saldo a Favor' : 'Código [91] Impuesto Adeudado'}
                    </span>
                  </div>
                </div>

                {/* Bank Account Form for Tax Return Deposit (Página 5 F22) */}
                <div className="pt-3 border-t border-slate-700 space-y-3">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    SOLICITO DEPOSITAR REMANENTE EN CUENTA CORRIENTE O DE AHORRO BANCARIA
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Institución Bancaria (Cód. [301])</label>
                      <input
                        type="text"
                        value={bancoNombre}
                        onChange={(e) => setBancoNombre(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Número de Cuenta (Cód. [306])</label>
                      <input
                        type="text"
                        value={numeroCuenta}
                        onChange={(e) => setNumeroCuenta(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2.5 py-1.5 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Tipo de Cuenta (Cód. [780])</label>
                      <select
                        value={tipoCuentaBancaria}
                        onChange={(e) => setTipoCuentaBancaria(e.target.value as any)}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2.5 py-1.5 text-white"
                      >
                        <option value="Cuenta corriente">Cuenta corriente</option>
                        <option value="Cuenta vista">Cuenta vista</option>
                        <option value="Cuenta RUT">Cuenta RUT</option>
                        <option value="Cuenta de ahorro">Cuenta de ahorro</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SECTION: RECUADRO N° 10 DEPRECIACIÓN */}
          {selectedRecuadroF22 === 'recuadro10' && (
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                RECUADRO N° 10: DEPRECIACIÓN (Página 102 del F22 AT 2026)
              </h3>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-600">
                  <tr>
                    <th className="py-2.5 px-4">Concepto</th>
                    <th className="py-2.5 px-4 text-center w-28">Código SII</th>
                    <th className="py-2.5 px-4 text-right w-44">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2.5 px-4 font-sans">Cantidad de bienes del activo inmovilizado</td>
                    <td className="py-2.5 px-4 text-center font-bold text-[#003366]">[940]</td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">{activosFijos.length}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans">Depreciación acelerada en 1/3 vida útil, del ejercicio (art. 31 N° 5 LIR)</td>
                    <td className="py-2.5 px-4 text-center font-bold text-[#003366]">[938]</td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-800">${totalDeprAcelerada.toLocaleString('es-CL')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-sans">Total depreciación normal de los bienes informados en 938</td>
                    <td className="py-2.5 px-4 text-center font-bold text-[#003366]">[950]</td>
                    <td className="py-2.5 px-4 text-right">${totalDeprNormal.toLocaleString('es-CL')}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-2.5 px-4 font-sans text-slate-900">Diferencia entre depreciaciones aceleradas y normales del ejercicio</td>
                    <td className="py-2.5 px-4 text-center text-[#003366]">[1066]</td>
                    <td className="py-2.5 px-4 text-right text-[#003366]">${diferenciaRecuadro10.toLocaleString('es-CL')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* SECTION: RECUADRO 17 PRO PYME */}
          {selectedRecuadroF22 === 'recuadro17' && (
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    RECUADRO N° 17: BASE IMPONIBLE RÉGIMEN PRO PYME (ART. 14 LETRA D) N° 3 LIR) (Página 260)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Determinación en base a ingresos efectivamente percibidos y gastos devengados/pagados
                  </p>
                </div>
              </div>
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Línea del Recuadro</th>
                    <th className="py-2 px-3 text-center w-28">Código</th>
                    <th className="py-2 px-3 text-right w-44">Monto Percibido/Pagado ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2 px-3 font-sans">Ingresos del giro percibidos</td>
                    <td className="py-2 px-3 text-center text-[#003366] font-bold">[1400]</td>
                    <td className="py-2 px-3 text-right font-bold">${baseVentasAfectas.toLocaleString('es-CL')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">Total de ingresos anuales</td>
                    <td className="py-2 px-3 text-center text-[#003366] font-bold">[1410]</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-800">${baseVentasAfectas.toLocaleString('es-CL')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">Existencias, insumos y servicios del negocio, pagados</td>
                    <td className="py-2 px-3 text-center text-[#003366] font-bold">[1409]</td>
                    <td className="py-2 px-3 text-right text-rose-600">-${baseComprasAfectas.toLocaleString('es-CL')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">Remuneraciones pagadas</td>
                    <td className="py-2 px-3 text-center text-[#003366] font-bold">[1411]</td>
                    <td className="py-2 px-3 text-right text-rose-600">-$38.800.000</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">Depreciación instantánea según art. 31 N° 5 bis</td>
                    <td className="py-2 px-3 text-center text-[#003366] font-bold">[1415]</td>
                    <td className="py-2 px-3 text-right text-rose-600">-${totalDeprAcelerada.toLocaleString('es-CL')}</td>
                  </tr>
                  <tr className="bg-slate-100 font-bold font-sans">
                    <td className="py-2.5 px-3">Base Imponible afecta a IDPC o pérdida tributaria del ejercicio</td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#003366]">[1440]</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#003366]">
                      ${Math.max(0, baseVentasAfectas - baseComprasAfectas - 38800000 - totalDeprAcelerada).toLocaleString('es-CL')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* SECTION: RECUADRO 12 RLI 14 A */}
          {selectedRecuadroF22 === 'recuadro12' && (
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    RECUADRO N° 12: BASE IMPONIBLE DE PRIMERA CATEGORÍA — RÉGIMEN GENERAL (ART. 14 LETRA A) LIR) (Página 140)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Conciliación tributaria desde el resultado según balance 8 columnas hasta la Renta Líquida Imponible (RLI)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 font-mono">Tasa IDPC: 27%</span>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Concepto RLI</th>
                    <th className="py-2 px-3 text-center w-28">Código SII</th>
                    <th className="py-2 px-3 text-right w-44">Monto ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="bg-slate-50/50 font-bold">
                    <td className="py-2 px-3 font-sans">Resultado según balance o estado financiero (Utilidad/Pérdida)</td>
                    <td className="py-2 px-3 text-center text-[#003366]">[1079]</td>
                    <td className="py-2 px-3 text-right font-bold text-[#003366]">$18.450.000</td>
                  </tr>
                  
                  {/* Agregados */}
                  <tr className="bg-rose-50/50 text-[11px] font-semibold text-rose-900">
                    <td colSpan={3} className="py-1 px-3 uppercase text-[10px] font-sans">
                      (+) Agregados a la Renta Líquida Imponible
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans pl-4">(+) Gastos rechazados no afectos a la tributación del art. 21</td>
                    <td className="py-2 px-3 text-center text-[#003366]">[1081]</td>
                    <td className="py-2 px-3 text-right text-slate-900">+$850.000</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans pl-4">(+) Provisiones y estimaciones no aceptadas tributariamente</td>
                    <td className="py-2 px-3 text-center text-[#003366]">[1082]</td>
                    <td className="py-2 px-3 text-right text-slate-900">+$1.400.000</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans pl-4">(+) Depreciación financiera contabilizada en el ejercicio (NIC 16)</td>
                    <td className="py-2 px-3 text-center text-[#003366]">[1087]</td>
                    <td className="py-2 px-3 text-right text-slate-900">+$5.000.000</td>
                  </tr>

                  {/* Deducciones */}
                  <tr className="bg-emerald-50/50 text-[11px] font-semibold text-emerald-900">
                    <td colSpan={3} className="py-1 px-3 uppercase text-[10px] font-sans">
                      (-) Deducciones de la Renta Líquida Imponible
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans pl-4">(-) Depreciación tributaria (normal o acelerada) del ejercicio</td>
                    <td className="py-2 px-3 text-center text-[#003366]">[1092]</td>
                    <td className="py-2 px-3 text-right text-rose-600">-$11.000.000</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans pl-4">(-) Dividendos percibidos de otras sociedades domiciliadas en Chile</td>
                    <td className="py-2 px-3 text-center text-[#003366]">[1095]</td>
                    <td className="py-2 px-3 text-right text-rose-600">-$1.500.000</td>
                  </tr>

                  {/* RLI Final */}
                  <tr className="bg-[#003366] text-white font-bold font-sans">
                    <td className="py-2.5 px-3">RENTA LÍQUIDA IMPONIBLE AFECTA A IDPC (TASA 27%)</td>
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-300">[1109]</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-300">
                      $13.200.000
                    </td>
                  </tr>
                  <tr className="bg-slate-100 font-bold">
                    <td className="py-2 px-3 font-sans">Impuesto de Primera Categoría Determinado (27% s/ $13.200.000)</td>
                    <td className="py-2 px-3 text-center font-mono text-[#003366]">[1110]</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-900">$3.564.000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* SECTION: RECUADRO 19 CPTS PRO PYME */}
          {selectedRecuadroF22 === 'recuadro19' && (
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    RECUADRO N° 19: CAPITAL PROPIO TRIBUTARIO SIMPLIFICADO (CPTS) — ART. 14 LETRA D) N° 3 LIR (Página 285)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Determinación del CPT simplificado al 31 de diciembre con método de acumulación de flujos
                  </p>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Línea del Recuadro</th>
                    <th className="py-2 px-3 text-center w-28">Código</th>
                    <th className="py-2 px-3 text-right w-44">Valor Tributario ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2 px-3 font-sans">Capital efectivamente aportado reajustado</td>
                    <td className="py-2 px-3 text-center text-[#003366] font-bold">[1445]</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">$35.000.000</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">(+) Bases imponibles positivas acumuladas de ejercicios anteriores</td>
                    <td className="py-2 px-3 text-center text-[#003366] font-bold">[1446]</td>
                    <td className="py-2 px-3 text-right text-emerald-800">+$24.500.000</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">(+) Base imponible determinada en el ejercicio (según Recuadro 17)</td>
                    <td className="py-2 px-3 text-center text-[#003366] font-bold">[1447]</td>
                    <td className="py-2 px-3 text-right text-emerald-800">+$12.350.000</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">(+) Rentas percibidas con motivo de participaciones sociales en otras empresas</td>
                    <td className="py-2 px-3 text-center text-[#003366] font-bold">[1448]</td>
                    <td className="py-2 px-3 text-right text-slate-900">+$2.100.000</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">(-) Disminuciones efectivas de capital social efectuadas en el ejercicio</td>
                    <td className="py-2 px-3 text-center text-[#003366] font-bold">[1451]</td>
                    <td className="py-2 px-3 text-right text-rose-600">-$0</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans">(-) Retiros o remesas efectuados por los propietarios en el ejercicio</td>
                    <td className="py-2 px-3 text-center text-[#003366] font-bold">[1452]</td>
                    <td className="py-2 px-3 text-right text-rose-600">-$8.500.000</td>
                  </tr>
                  <tr className="bg-[#003366] text-white font-bold font-sans">
                    <td className="py-2.5 px-3">CAPITAL PROPIO TRIBUTARIO SIMPLIFICADO AL 31 DE DICIEMBRE</td>
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-300">[1455]</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-300">
                      $65.450.000
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* SECTION: TABLA IGC AT 2026 */}
          {selectedRecuadroF22 === 'tabla_igc' && (
            <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    TABLA DE IMPUESTO GLOBAL COMPLEMENTARIO (AÑO TRIBUTARIO 2026)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculada con UTM Diciembre 2025: $69.542 · UTA Diciembre 2025: $834.504 (Página 273)
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-[#003366] text-white uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2 px-3 text-center w-16">N° Tramo</th>
                      <th className="py-2 px-3 text-right font-tabular">Desde Renta ($)</th>
                      <th className="py-2 px-3 text-right font-tabular">Hasta Renta ($)</th>
                      <th className="py-2 px-3 text-center">Tasa %</th>
                      <th className="py-2 px-3 text-center font-tabular">Factor</th>
                      <th className="py-2 px-3 text-right font-tabular">Cantidad a Rebajar ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {[
                      { tramo: 1, desde: 0, hasta: 11265804, tasa: '0.0%', factor: '0.000', rebaja: 0 },
                      { tramo: 2, desde: 11265804.01, hasta: 25035120, tasa: '4.0%', factor: '0.040', rebaja: 450632.16 },
                      { tramo: 3, desde: 25035120.01, hasta: 41725200, tasa: '8.0%', factor: '0.080', rebaja: 1452036.96 },
                      { tramo: 4, desde: 41725200.01, hasta: 58415280, tasa: '13.5%', factor: '0.135', rebaja: 3746922.96 },
                      { tramo: 5, desde: 58415280.01, hasta: 75105360, tasa: '23.0%', factor: '0.230', rebaja: 9296374.56 },
                      { tramo: 6, desde: 75105360.01, hasta: 100140480, tasa: '30.4%', factor: '0.304', rebaja: 14854171.20 },
                      { tramo: 7, desde: 100140480.01, hasta: 258696240, tasa: '35.0%', factor: '0.350', rebaja: 19460633.28 },
                      { tramo: 8, desde: 258696240.01, hasta: 'Y MÁS', tasa: '40.0%', factor: '0.400', rebaja: 32395445.28 },
                    ].map((t) => (
                      <tr key={t.tramo} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center font-bold text-[#003366]">{t.tramo}</td>
                        <td className="py-2 px-3 text-right font-tabular">${typeof t.desde === 'number' ? t.desde.toLocaleString('es-CL') : t.desde}</td>
                        <td className="py-2 px-3 text-right font-tabular">${typeof t.hasta === 'number' ? t.hasta.toLocaleString('es-CL') : t.hasta}</td>
                        <td className="py-2 px-3 text-center font-bold text-slate-800">{t.tasa}</td>
                        <td className="py-2 px-3 text-center text-slate-600">{t.factor}</td>
                        <td className="py-2 px-3 text-right font-tabular text-rose-700">${typeof t.rebaja === 'number' ? t.rebaja.toLocaleString('es-CL', { minimumFractionDigits: 2 }) : t.rebaja}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SUBVIEW 2: FORMULARIO 29 */}
      {activeSubView === 'f29' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-base font-bold text-slate-900">Formulario 29 — Impuestos Mensuales</h3>
            <button onClick={printDocumentView} className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] rounded">
              Imprimir F29
            </button>
          </div>
          <div className="p-4 bg-slate-900 text-white rounded flex justify-between items-center">
            <span>TOTAL DETERMINADO A PAGAR (CÓDIGO [91]):</span>
            <span className="text-2xl font-mono font-bold text-emerald-400">${totalAPagarF29.toLocaleString('es-CL')}</span>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: DDJJ */}
      {activeSubView === 'ddjj' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Declaraciones Juradas Anuales (Operación Renta)</h3>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-2 px-3 font-semibold">Código</th>
                <th className="py-2 px-3 font-semibold">Declaración</th>
                <th className="py-2 px-3 font-semibold text-center">Registros</th>
                <th className="py-2 px-3 font-semibold text-right">Monto</th>
                <th className="py-2 px-3 font-semibold text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {declaracionesJuradas.map(dj => (
                <tr key={dj.codigo}>
                  <td className="py-2 px-3 font-bold font-mono text-[#003366]">{dj.codigo}</td>
                  <td className="py-2 px-3">{dj.nombre}</td>
                  <td className="py-2 px-3 text-center font-mono">{dj.registrosCalculados}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold">${dj.montoTotal.toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => calcularDDJJ(dj.codigo)}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded"
                    >
                      Calcular y Validar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBVIEW 4: CORRECCIÓN MONETARIA */}
      {activeSubView === 'correccion' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Corrección Monetaria Art. 41 LIR (IPC Acumulado)</h3>
          <p className="text-xs text-slate-500">Ajuste anual sobre Capital Propio Tributario y Activos No Monetarios</p>
        </div>
      )}

    </div>
  );
};
