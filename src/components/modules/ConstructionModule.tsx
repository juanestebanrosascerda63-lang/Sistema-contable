import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { ObraConstruccion, PartidaObra, EstadoDePagoEEPP } from '../../types/erp';
import { exportToCSV, printDocumentView } from '../../utils/export';
import { 
  HardHat, 
  Plus, 
  Layers, 
  TrendingUp, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  Building,
  DollarSign,
  PieChart,
  FileText
} from 'lucide-react';

export const ConstructionModule: React.FC = () => {
  const { 
    empresaActiva, 
    obras, 
    addObra, 
    eeppList, 
    addEEPP, 
    addDTE, 
    activeSubView, 
    setActiveSubView,
    addNotification 
  } = useERP();

  const [selectedObraId, setSelectedObraId] = useState<string>(obras[0]?.id || '');
  const [showNewObraModal, setShowNewObraModal] = useState(false);
  const [showNewEEPPModal, setShowNewEEPPModal] = useState(false);

  // New EEPP State
  const [eeppAvanceNeto, setEeppAvanceNeto] = useState<number>(35000000);
  const [eeppRetencionPorc, setEeppRetencionPorc] = useState<number>(5.0);
  const [eeppPeriodo, setEeppPeriodo] = useState<string>('2026-10');

  // New Obra State
  const [newObraNombre, setNewObraNombre] = useState('');
  const [newObraUbicacion, setNewObraUbicacion] = useState('');
  const [newObraMandante, setNewObraMandante] = useState('');
  const [newObraContrato, setNewObraContrato] = useState(1200000000);
  const [newObraCEEC, setNewObraCEEC] = useState(true);

  const selectedObra = obras.find(o => o.id === selectedObraId) || obras[0];
  const obrasEmpresa = obras.filter(o => o.empresaId === empresaActiva.id || empresaActiva.isConstructora);

  // EEPP Calculations
  const ivaCalculado = Math.round(eeppAvanceNeto * 0.19);
  // CEEC = 0.65 * IVA si aplica franquicia habitacional
  const ceecCalculado = selectedObra?.aplicaCEEC ? Math.round(ivaCalculado * 0.65) : 0;
  const retencionMonto = Math.round(eeppAvanceNeto * (eeppRetencionPorc / 100));
  // Total líquido a cobrar al mandante = Neto + IVA - Retención Garantía - CEEC (o según factura)
  const totalLiquidoCobrar = eeppAvanceNeto + ivaCalculado - retencionMonto - ceecCalculado;

  const handleCreateEEPP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObra) return;

    const nextNumero = eeppList.filter(ep => ep.obraId === selectedObra.id).length + 1;
    const nextFolioDTE = Math.floor(450 + Math.random() * 50);

    // Create EEPP
    addEEPP({
      obraId: selectedObra.id,
      numero: nextNumero,
      periodo: eeppPeriodo,
      montoAvanceNeto: eeppAvanceNeto,
      montoRetencionGarantia: retencionMonto,
      montoCEEC: ceecCalculado,
      montoLiquidoACobrar: totalLiquidoCobrar,
      fechaAprobacion: new Date().toISOString().split('T')[0],
      estado: 'Facturado',
      facturaFolio: nextFolioDTE,
    });

    // Auto-generate Factura Electrónica DTE
    addDTE({
      empresaId: empresaActiva.id,
      tipo: '33 - Factura Electrónica',
      tipoCodigo: 33,
      folio: nextFolioDTE,
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      direccionOperacion: 'emitido',
      rutContraparte: '76.998.410-5',
      razonSocialContraparte: selectedObra.mandante,
      giroContraparte: 'Desarrollo de proyectos inmobiliarios',
      formaPago: 'Crédito 30 días',
      obraId: selectedObra.id,
      items: [
        {
          id: `item-eepp-${nextNumero}`,
          codigo: `EEPP-0${nextNumero}`,
          descripcion: `Estado de Pago N° ${nextNumero} Obra "${selectedObra.nombre}" - Avance de Partidas (Retención ${eeppRetencionPorc}% y CEEC aplicado)`,
          cantidad: 1,
          precioUnitario: eeppAvanceNeto,
          exento: false,
          descuentoPorc: 0,
          totalLinea: eeppAvanceNeto,
          centroCosto1: selectedObra.nombre,
          centroCosto2: '01.02 Obra Gruesa / Hormigones'
        }
      ],
      montoExento: 0,
      montoNeto: eeppAvanceNeto,
      montoIVA: ivaCalculado,
      montoTotal: eeppAvanceNeto + ivaCalculado,
      estadoContable: 'Centralizado',
      estadoSII: 'Aceptado por SII',
    });

    setShowNewEEPPModal(false);
  };

  const handleCreateObra = (e: React.FormEvent) => {
    e.preventDefault();
    addObra({
      empresaId: empresaActiva.id,
      nombre: newObraNombre,
      ubicacion: newObraUbicacion,
      mandante: newObraMandante,
      montoContratoTotal: Number(newObraContrato),
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaTerminoEstimada: '2027-12-31',
      porcentajeAvanceFisico: 0,
      aplicaCEEC: newObraCEEC,
      retencionGarantiaPorc: 5.0,
      partidas: [
        { id: 'p-1', codigo: '01.01', nombre: 'Instalación de Faenas y Trazados', presupuestoAsignado: Math.round(newObraContrato * 0.05), costoRealImputado: 0, avancePorcentaje: 0 },
        { id: 'p-2', codigo: '01.02', nombre: 'Movimiento de Tierras y Excavaciones', presupuestoAsignado: Math.round(newObraContrato * 0.15), costoRealImputado: 0, avancePorcentaje: 0 },
        { id: 'p-3', codigo: '02.01', nombre: 'Obra Gruesa y Hormigón Armado', presupuestoAsignado: Math.round(newObraContrato * 0.45), costoRealImputado: 0, avancePorcentaje: 0 },
        { id: 'p-4', codigo: '03.01', nombre: 'Terminaciones y Revestimientos', presupuestoAsignado: Math.round(newObraContrato * 0.25), costoRealImputado: 0, avancePorcentaje: 0 },
        { id: 'p-5', codigo: '04.01', nombre: 'Instalaciones Especiales (Sanitaria/Eléctrica)', presupuestoAsignado: Math.round(newObraContrato * 0.10), costoRealImputado: 0, avancePorcentaje: 0 },
      ]
    });
    setShowNewObraModal(false);
  };

  const totalPresupuestoObra = selectedObra?.partidas.reduce((s, p) => s + p.presupuestoAsignado, 0) || 0;
  const totalCostoRealObra = selectedObra?.partidas.reduce((s, p) => s + p.costoRealImputado, 0) || 0;
  const saldoPorEjecutar = totalPresupuestoObra - totalCostoRealObra;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header and Sub-menu */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 no-print">
        <div>
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Módulo Especializado para Empresas Constructoras
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Doble Centro de Costos (Obra + Partida), Avance Físico vs. Presupuesto, EEPP y Franquicia CEEC
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubView('avance')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'avance' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Avance de Obra vs. Presupuesto
          </button>
          <button
            onClick={() => setActiveSubView('eepp')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'eepp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Estados de Pago & CEEC
          </button>
          <button
            onClick={() => setActiveSubView('obras_list')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'obras_list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Maestro de Obras
          </button>
        </div>
      </div>

      {/* Obra Selector Strip */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Proyecto / Obra Activa:</span>
          <select
            value={selectedObraId}
            onChange={(e) => setSelectedObraId(e.target.value)}
            className="text-xs font-bold text-[#003366] border border-slate-300 rounded px-3 py-1.5 bg-slate-50 focus:outline-none"
          >
            {obras.map(o => (
              <option key={o.id} value={o.id}>{o.nombre} ({o.mandante})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewEEPPModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Emitir Estado de Pago (EEPP)</span>
          </button>

          <button
            onClick={() => setShowNewObraModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Obra</span>
          </button>
        </div>
      </div>

      {/* SUBVIEW 1: Estado de Avance vs Presupuesto (Funcionalidad 1 y 2) */}
      {activeSubView === 'avance' && selectedObra && (
        <div className="space-y-6">
          
          {/* Obra Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Monto Total Contrato</span>
              <p className="text-xl font-bold font-mono text-[#003366] mt-1">
                ${selectedObra.montoContratoTotal.toLocaleString('es-CL')}
              </p>
              <span className="text-[10px] text-slate-500">Mandante: {selectedObra.mandante}</span>
            </div>

            <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Costo Real Imputado (Facturas + RRHH)</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                ${totalCostoRealObra.toLocaleString('es-CL')}
              </p>
              <span className="text-[10px] text-slate-500">
                {((totalCostoRealObra / totalPresupuestoObra) * 100).toFixed(1)}% del presupuesto consumido
              </span>
            </div>

            <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Avance Físico Certificado ITO</span>
              <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
                {selectedObra.porcentajeAvanceFisico}%
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Obra según carta Gantt</span>
            </div>

            <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Franquicia Tributaria CEEC</span>
              <p className="text-xl font-bold font-mono text-amber-700 mt-1">
                {selectedObra.aplicaCEEC ? '0.65 x IVA (Activo)' : 'No Aplica'}
              </p>
              <span className="text-[10px] text-slate-500">Retención Garantía: {selectedObra.retencionGarantiaPorc}%</span>
            </div>
          </div>

          {/* Partidas Table with Cost Centers (Funcionalidad 1 y 2) */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Desglose por Centro de Costos 2 (Partidas de Obra) vs. Costo Real Imputado
                </h3>
                <p className="text-xs text-slate-500">
                  Asignación automática desde facturas de compras de hormigón/acero y sueldos de faena
                </p>
              </div>

              <button
                onClick={() => {
                  const headers = ['Código Partida', 'Nombre Partida', 'Presupuesto Asignado ($)', 'Costo Real Imputado ($)', 'Saldo ($)', '% Avance Físico'];
                  const rows = selectedObra.partidas.map(p => [
                    p.codigo,
                    p.nombre,
                    p.presupuestoAsignado,
                    p.costoRealImputado,
                    p.presupuestoAsignado - p.costoRealImputado,
                    `${p.avancePorcentaje}%`
                  ]);
                  exportToCSV(`Avance_Obra_${selectedObra.nombre}`, headers, rows);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Informe de Avance CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold font-tabular">Partida</th>
                    <th className="py-2.5 px-3 font-semibold">Descripción de la Partida</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-tabular">Presupuesto ($)</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-tabular">Costo Real ($)</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-tabular">Saldo Disponible ($)</th>
                    <th className="py-2.5 px-3 font-semibold text-center">% Avance</th>
                    <th className="py-2.5 px-3 font-semibold">Semáforo de Desviación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedObra.partidas.map((part) => {
                    const saldo = part.presupuestoAsignado - part.costoRealImputado;
                    const pctGasto = part.presupuestoAsignado > 0 ? (part.costoRealImputado / part.presupuestoAsignado) * 100 : 0;
                    const isDesviado = pctGasto > 100;

                    return (
                      <tr key={part.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-[#003366]">{part.codigo}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{part.nombre}</td>
                        <td className="py-2 px-3 text-right font-mono font-tabular">${part.presupuestoAsignado.toLocaleString('es-CL')}</td>
                        <td className="py-2 px-3 text-right font-mono font-tabular font-bold text-slate-900">${part.costoRealImputado.toLocaleString('es-CL')}</td>
                        <td className={`py-2 px-3 text-right font-mono font-tabular ${saldo < 0 ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                          ${saldo.toLocaleString('es-CL')}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold">{part.avancePorcentaje}%</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded overflow-hidden">
                              <div
                                className={`h-full rounded ${isDesviado ? 'bg-rose-500' : 'bg-emerald-600'}`}
                                style={{ width: `${Math.min(pctGasto, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 w-12 text-right">
                              {pctGasto.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-xs text-slate-900">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 text-right">Totales Acumulados Obra:</td>
                    <td className="py-2.5 px-3 text-right font-mono font-tabular">${totalPresupuestoObra.toLocaleString('es-CL')}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-tabular">${totalCostoRealObra.toLocaleString('es-CL')}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-tabular text-[#003366]">${saldoPorEjecutar.toLocaleString('es-CL')}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{selectedObra.porcentajeAvanceFisico}%</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUBVIEW 2: Estados de Pago & CEEC (Funcionalidad 3) */}
      {activeSubView === 'eepp' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Estados de Pago (EEPP), Retenciones de Garantía y Crédito Especial CEEC
              </h3>
              <p className="text-xs text-slate-500">
                Facturación por hitos de avance con descuento del 65% del débito fiscal IVA (CEEC DL 910)
              </p>
            </div>

            <button
              onClick={() => setShowNewEEPPModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded shadow-xs"
            >
              Nuevo Estado de Pago
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3 font-semibold">N° EEPP</th>
                  <th className="py-2 px-3 font-semibold">Periodo</th>
                  <th className="py-2 px-3 font-semibold text-right">Monto Neto Avance</th>
                  <th className="py-2 px-3 font-semibold text-right">Retención Garantía (5%)</th>
                  <th className="py-2 px-3 font-semibold text-right">Crédito CEEC (0.65xIVA)</th>
                  <th className="py-2 px-3 font-semibold text-right font-bold">Líquido a Cobrar Mandante</th>
                  <th className="py-2 px-3 font-semibold text-center">Estado</th>
                  <th className="py-2 px-3 font-semibold text-center font-tabular">Factura DTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eeppList.map((ep) => (
                  <tr key={ep.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-[#003366]">EEPP #{ep.numero}</td>
                    <td className="py-2 px-3 font-tabular text-slate-600">{ep.periodo}</td>
                    <td className="py-2 px-3 text-right font-mono font-tabular">${ep.montoAvanceNeto.toLocaleString('es-CL')}</td>
                    <td className="py-2 px-3 text-right font-mono font-tabular text-rose-600">-${ep.montoRetencionGarantia.toLocaleString('es-CL')}</td>
                    <td className="py-2 px-3 text-right font-mono font-tabular text-amber-700">-${ep.montoCEEC.toLocaleString('es-CL')}</td>
                    <td className="py-2 px-3 text-right font-mono font-tabular font-bold text-slate-900">${ep.montoLiquidoACobrar.toLocaleString('es-CL')}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {ep.estado}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                      {ep.facturaFolio ? `F.E. ${ep.facturaFolio}` : 'Pendiente'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: Maestro de Obras */}
      {activeSubView === 'obras_list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {obras.map(o => (
            <div key={o.id} className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{o.nombre}</h4>
                  <p className="text-xs text-slate-500">{o.ubicacion}</p>
                  <p className="text-xs text-[#003366] font-semibold mt-0.5">Mandante: {o.mandante}</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                  Avance: {o.porcentajeAvanceFisico}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Monto Contrato</span>
                  <span className="font-mono font-semibold">${o.montoContratoTotal.toLocaleString('es-CL')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Franquicia CEEC</span>
                  <span className="font-semibold text-slate-800">{o.aplicaCEEC ? 'Habilitada (0.65xIVA)' : 'Deshabilitada'}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedObraId(o.id);
                    setActiveSubView('avance');
                  }}
                  className="text-xs font-semibold text-[#003366] hover:underline"
                >
                  Ver Control de Partidas →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Nuevo Estado de Pago (EEPP) con Retención y CEEC */}
      {showNewEEPPModal && selectedObra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Emisión de Estado de Pago (EEPP)</h3>
                <p className="text-xs text-slate-500">Obra: {selectedObra.nombre} · Mandante: {selectedObra.mandante}</p>
              </div>
              <button onClick={() => setShowNewEEPPModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateEEPP} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monto Avance Neto ($)</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={eeppAvanceNeto}
                    onChange={(e) => setEeppAvanceNeto(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Período de Facturación</label>
                  <input
                    type="text"
                    value={eeppPeriodo}
                    onChange={(e) => setEeppPeriodo(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Monto Neto Afecto:</span>
                  <span className="font-mono font-tabular">${eeppAvanceNeto.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>IVA Débito Fiscal (19%):</span>
                  <span className="font-mono font-tabular">${ivaCalculado.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>(-) Retención de Garantía ({eeppRetencionPorc}%):</span>
                  <span className="font-mono font-tabular">-${retencionMonto.toLocaleString('es-CL')}</span>
                </div>
                {selectedObra.aplicaCEEC && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>(-) Franquicia CEEC (0.65 x IVA):</span>
                    <span className="font-mono font-tabular">-${ceecCalculado.toLocaleString('es-CL')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-[#003366] pt-1 border-t border-slate-200">
                  <span>LÍQUIDO A COBRAR MANDANTE:</span>
                  <span className="font-mono font-tabular">${totalLiquidoCobrar.toLocaleString('es-CL')}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewEEPPModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold shadow-xs"
                >
                  Aprobar EEPP y Emitir Factura Electrónica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Nueva Obra */}
      {showNewObraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Crear Nuevo Proyecto / Obra</h3>
              <button onClick={() => setShowNewObraModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateObra} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre de la Obra (Centro Costo 1)</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Edificio Parque Los Dominicos"
                  value={newObraNombre}
                  onChange={(e) => setNewObraNombre(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mandante / Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Inmobiliaria Los Dominicos SpA"
                  value={newObraMandante}
                  onChange={(e) => setNewObraMandante(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monto Contrato ($)</label>
                  <input
                    type="number"
                    value={newObraContrato}
                    onChange={(e) => setNewObraContrato(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Comuna / Ubicación</label>
                  <input
                    type="text"
                    placeholder="Las Condes, Santiago"
                    value={newObraUbicacion}
                    onChange={(e) => setNewObraUbicacion(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ceecCheck"
                  checked={newObraCEEC}
                  onChange={(e) => setNewObraCEEC(e.target.checked)}
                  className="rounded border-slate-300 text-[#003366] h-4 w-4"
                />
                <label htmlFor="ceecCheck" className="font-semibold text-slate-800 cursor-pointer">
                  Aplica Franquicia CEEC (0.65 x IVA)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewObraModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#003366] hover:bg-[#0056B3] text-white rounded font-semibold shadow-xs"
                >
                  Guardar Obra y Generar Partidas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
