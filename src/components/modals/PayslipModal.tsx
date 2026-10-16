import React from 'react';
import { useERP } from '../../context/ERPContext';
import { printDocumentView } from '../../utils/export';
import { Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';

export const PayslipModal: React.FC = () => {
  const { modalPayslipOpen, setModalPayslipOpen, selectedPayslipView, empresaActiva, trabajadores } = useERP();

  if (!modalPayslipOpen || !selectedPayslipView) return null;

  const liq = selectedPayslipView;
  const trab = trabajadores.find(t => t.id === liq.trabajadorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full p-6 border border-slate-300 print-sheet space-y-6">
        
        {/* Top Controls (Hidden in print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-slate-800">
              Liquidación de Remuneraciones — Formato Oficial DT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={printDocumentView}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setModalPayslipOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-lg px-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Chilean Payslip Sheet */}
        <div className="border border-slate-300 p-6 rounded bg-white space-y-5 text-xs">
          
          {/* Header */}
          <div className="border-b border-slate-200 pb-3 flex justify-between items-start">
            <div>
              <h2 className="text-sm font-bold text-[#003366] uppercase">{empresaActiva.razonSocial}</h2>
              <p className="font-mono text-slate-600">R.U.T.: {empresaActiva.rut}</p>
              <p className="text-slate-500">{empresaActiva.direccion} · {empresaActiva.comuna}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold text-sm uppercase text-slate-900">Liquidación de Sueldo</h3>
              <p className="font-mono font-bold text-[#003366]">Período: {liq.periodo}</p>
              <p className="text-slate-500 text-[11px]">Fecha Emisión: {liq.fechaEmision}</p>
            </div>
          </div>

          {/* Worker Info */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Trabajador(a)</span>
              <span className="font-bold text-slate-800">{trab?.nombres} {trab?.apellidos}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">R.U.T.</span>
              <span className="font-mono font-bold text-slate-800">{trab?.rut}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Cargo</span>
              <span className="text-slate-800 font-medium">{trab?.cargo}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Institución Previsional (AFP)</span>
              <span className="font-semibold text-slate-800">AFP {trab?.afp}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Salud</span>
              <span className="font-semibold text-slate-800">{trab?.saludTipo}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Días Trabajados</span>
              <span className="font-mono font-bold text-slate-800">{trab?.diasTrabajadosMes} días</span>
            </div>
          </div>

          {/* 2-Column Split: Haberes vs Descuentos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 rounded overflow-hidden">
            
            {/* Haberes Column */}
            <div className="divide-y divide-slate-100">
              <div className="bg-slate-100 p-2 font-bold text-slate-800 uppercase text-[10px]">
                I. Haberes Imponibles y No Imponibles
              </div>
              <div className="p-2 flex justify-between">
                <span className="text-slate-700">Sueldo Base</span>
                <span className="font-mono font-tabular">${liq.sueldoBase.toLocaleString('es-CL')}</span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="text-slate-700">Gratificación Legal (Art. 50 CT)</span>
                <span className="font-mono font-tabular">${liq.gratificacionLegal.toLocaleString('es-CL')}</span>
              </div>
              {liq.horasExtrasMonto > 0 && (
                <div className="p-2 flex justify-between">
                  <span className="text-slate-700">Horas Extraordinarias (50%)</span>
                  <span className="font-mono font-tabular">${liq.horasExtrasMonto.toLocaleString('es-CL')}</span>
                </div>
              )}
              <div className="p-2 bg-slate-50 flex justify-between font-bold text-slate-900">
                <span>TOTAL IMPONIBLE:</span>
                <span className="font-mono font-tabular">${liq.totalImponible.toLocaleString('es-CL')}</span>
              </div>
              <div className="p-2 flex justify-between text-slate-600">
                <span>Asignación de Colación (No Imponible)</span>
                <span className="font-mono font-tabular">${liq.colacion.toLocaleString('es-CL')}</span>
              </div>
              <div className="p-2 flex justify-between text-slate-600">
                <span>Asignación de Movilización (No Imponible)</span>
                <span className="font-mono font-tabular">${liq.movilizacion.toLocaleString('es-CL')}</span>
              </div>
              <div className="p-2.5 bg-slate-100 font-bold flex justify-between text-slate-900 border-t border-slate-200">
                <span>TOTAL HABERES:</span>
                <span className="font-mono font-tabular text-[#003366]">${liq.totalHaberes.toLocaleString('es-CL')}</span>
              </div>
            </div>

            {/* Descuentos Column */}
            <div className="divide-y divide-slate-100 border-t sm:border-t-0 sm:border-l border-slate-200">
              <div className="bg-slate-100 p-2 font-bold text-slate-800 uppercase text-[10px]">
                II. Descuentos Previsionales y Tributarios
              </div>
              <div className="p-2 flex justify-between">
                <span className="text-slate-700">Fondo Pensiones AFP {trab?.afp}</span>
                <span className="font-mono font-tabular text-rose-600">-${liq.descuentoAFP.toLocaleString('es-CL')}</span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="text-slate-700">Salud {trab?.saludTipo} (7%)</span>
                <span className="font-mono font-tabular text-rose-600">-${liq.descuentoSalud.toLocaleString('es-CL')}</span>
              </div>
              {liq.descuentoCesantiaAFC > 0 && (
                <div className="p-2 flex justify-between">
                  <span className="text-slate-700">Seguro de Cesantía AFC (0.6%)</span>
                  <span className="font-mono font-tabular text-rose-600">-${liq.descuentoCesantiaAFC.toLocaleString('es-CL')}</span>
                </div>
              )}
              {liq.descuentoImpuestoUnico > 0 && (
                <div className="p-2 flex justify-between">
                  <span className="text-slate-700">Impuesto Único Segunda Categoría</span>
                  <span className="font-mono font-tabular text-rose-600">-${liq.descuentoImpuestoUnico.toLocaleString('es-CL')}</span>
                </div>
              )}
              <div className="p-2.5 bg-slate-100 font-bold flex justify-between text-slate-900 border-t border-slate-200 mt-auto">
                <span>TOTAL DESCUENTOS LEGALES:</span>
                <span className="font-mono font-tabular text-rose-700">-${liq.totalDescuentosLegales.toLocaleString('es-CL')}</span>
              </div>
            </div>

          </div>

          {/* Líquido a Pagar Strip */}
          <div className="p-4 bg-slate-900 text-white rounded flex justify-between items-center font-bold">
            <span className="text-sm">ALCANCE LÍQUIDO A PAGAR (SUELDO NETO):</span>
            <span className="text-xl font-mono font-tabular text-emerald-400">
              ${liq.totalLiquidoAPagar.toLocaleString('es-CL')}
            </span>
          </div>

          {/* Legal Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-800">{empresaActiva.representanteNombre}</p>
              <p className="text-[11px] text-slate-500">Por la Empresa Empleadora</p>
              <p className="font-mono text-[10px] text-slate-400">R.U.T. {empresaActiva.representanteRut}</p>
            </div>

            <div className="border-t border-slate-400 pt-2">
              <p className="font-bold text-slate-800">{trab?.nombres} {trab?.apellidos}</p>
              <p className="text-[11px] text-slate-500">Firma del Trabajador en Conformidad</p>
              <p className="font-mono text-[10px] text-slate-400">R.U.T. {trab?.rut}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
