import React from 'react';
import { useERP } from '../../context/ERPContext';
import { printDocumentView } from '../../utils/export';
import { Printer, Download, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

export const DTEModal: React.FC = () => {
  const { modalDTEOpen, setModalDTEOpen, selectedDTEView, empresaActiva } = useERP();

  if (!modalDTEOpen || !selectedDTEView) return null;

  const dte = selectedDTEView;
  const isVenta = dte.direccionOperacion === 'emitido';
  const emisorNombre = isVenta ? empresaActiva.razonSocial : dte.razonSocialContraparte;
  const emisorRut = isVenta ? empresaActiva.rut : dte.rutContraparte;
  const emisorGiro = isVenta ? empresaActiva.giro : dte.giroContraparte;
  const emisorDireccion = isVenta ? empresaActiva.direccion : 'Av. Central 500, Santiago';

  const receptorNombre = isVenta ? dte.razonSocialContraparte : empresaActiva.razonSocial;
  const receptorRut = isVenta ? dte.rutContraparte : empresaActiva.rut;
  const receptorGiro = isVenta ? dte.giroContraparte : empresaActiva.giro;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full p-6 border border-slate-300 print-sheet space-y-6">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-slate-800">
              Documento Tributario Electrónico (DTE) Certificado por SII
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
              onClick={() => setModalDTEOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-lg px-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Official Chilean DTE Layout */}
        <div className="border border-slate-300 p-6 rounded bg-white space-y-6">
          
          {/* Header Split: Left Emisor / Right SII Red Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            
            {/* Left: Emisor Info */}
            <div className="space-y-1 max-w-md">
              <h2 className="text-base font-bold text-[#003366] uppercase leading-tight">
                {emisorNombre}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                {emisorGiro}
              </p>
              <p className="text-xs text-slate-500">
                Casa Matriz: {emisorDireccion}
              </p>
              <p className="text-xs text-slate-500">
                Santiago · Chile
              </p>
            </div>

            {/* Right: Traditional Red Chilean Tax Box */}
            <div className="border-2 border-red-600 text-red-600 p-4 rounded text-center shrink-0 w-64 bg-red-50/20">
              <p className="font-mono font-bold text-sm">R.U.T.: {emisorRut}</p>
              <h3 className="font-bold text-sm uppercase my-1 tracking-wide">
                {dte.tipo.split('-')[1]?.trim() || dte.tipo}
              </h3>
              <p className="font-mono font-extrabold text-base text-red-700">
                N° {dte.folio}
              </p>
              <p className="text-[10px] uppercase font-semibold text-red-800 mt-1 border-t border-red-300 pt-1">
                S.I.I. — SANTIAGO ORIENTE
              </p>
            </div>

          </div>

          {/* Receptor Info Box */}
          <div className="border border-slate-200 rounded p-3 text-xs bg-slate-50/60 space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="font-bold text-slate-700">SEÑOR(ES): </span>
                <span className="text-slate-900">{receptorNombre}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">R.U.T.: </span>
                <span className="font-mono font-bold text-slate-900">{receptorRut}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="font-bold text-slate-700">GIRO: </span>
                <span className="text-slate-800">{receptorGiro}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">FECHA EMISIÓN: </span>
                <span className="font-mono text-slate-800">{dte.fechaEmision}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="font-bold text-slate-700">FORMA DE PAGO: </span>
                <span className="text-slate-800 font-semibold">{dte.formaPago}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">VENCIMIENTO: </span>
                <span className="font-mono text-slate-800">{dte.fechaVencimiento}</span>
              </div>
            </div>
          </div>

          {/* Items Detail Table */}
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2 px-3 border-r border-slate-200">Código</th>
                <th className="py-2 px-3 border-r border-slate-200">Descripción del Producto o Servicio</th>
                <th className="py-2 px-2 text-center border-r border-slate-200 w-16">Cant.</th>
                <th className="py-2 px-3 text-right border-r border-slate-200 w-24">Precio ($)</th>
                <th className="py-2 px-3 text-right w-28">Total ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dte.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-3 font-mono text-slate-600 border-r border-slate-200">{it.codigo}</td>
                  <td className="py-2 px-3 text-slate-900 font-medium border-r border-slate-200">{it.descripcion}</td>
                  <td className="py-2 px-2 text-center font-mono font-tabular border-r border-slate-200">{it.cantidad}</td>
                  <td className="py-2 px-3 text-right font-mono font-tabular border-r border-slate-200">${it.precioUnitario.toLocaleString('es-CL')}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold font-tabular text-slate-900">${it.totalLinea.toLocaleString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bottom Split: Timbre Electrónico TED vs Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-end gap-6 pt-2">
            
            {/* Timbre Electrónico DTE (TED) Representation */}
            <div className="border border-slate-300 p-3 rounded text-center w-full sm:w-80 bg-slate-50 space-y-2">
              <div className="h-16 bg-slate-900 text-white font-mono text-[9px] flex items-center justify-center p-2 rounded tracking-tighter overflow-hidden break-all">
                &lt;TED version=&quot;1.0&quot;&gt;&lt;DD&gt;&lt;RE&gt;{emisorRut}&lt;/RE&gt;&lt;TD&gt;{dte.tipoCodigo}&lt;/TD&gt;&lt;F&gt;{dte.folio}&lt;/F&gt;&lt;FE&gt;{dte.fechaEmision}&lt;/FE&gt;&lt;RR&gt;{receptorRut}&lt;/RR&gt;&lt;RSR&gt;{receptorNombre.slice(0, 15)}&lt;/RSR&gt;&lt;MNT&gt;{dte.montoTotal}&lt;/MNT&gt;&lt;FRMT algoritmo=&quot;SHA1withRSA&quot;&gt;a8f89c09...&lt;/FRMT&gt;&lt;/DD&gt;&lt;/TED&gt;
              </div>
              <p className="font-bold text-[10px] text-slate-800 uppercase tracking-tight">
                Timbre Electrónico D.T.E.
              </p>
              <p className="text-[9px] text-slate-500">
                Res. 80 de 2014 - Verifique documento: www.sii.cl
              </p>
            </div>

            {/* Totals */}
            <div className="w-full sm:w-64 border border-slate-200 rounded divide-y divide-slate-100 text-xs bg-slate-50/50">
              <div className="p-2 flex justify-between">
                <span className="font-semibold text-slate-600">Monto Exento:</span>
                <span className="font-mono font-tabular">${dte.montoExento.toLocaleString('es-CL')}</span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="font-semibold text-slate-600">Monto Neto:</span>
                <span className="font-mono font-tabular">${dte.montoNeto.toLocaleString('es-CL')}</span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="font-semibold text-slate-600">I.V.A. (19%):</span>
                <span className="font-mono font-tabular">${dte.montoIVA.toLocaleString('es-CL')}</span>
              </div>
              <div className="p-2.5 flex justify-between font-bold text-sm bg-slate-100 text-slate-900">
                <span>TOTAL:</span>
                <span className="font-mono font-tabular text-[#003366]">${dte.montoTotal.toLocaleString('es-CL')}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
