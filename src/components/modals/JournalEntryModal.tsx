import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { LineaAsiento } from '../../types/erp';
import { Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const JournalEntryModal: React.FC = () => {
  const { modalAsientoOpen, setModalAsientoOpen, empresaActiva, addAsiento, planCuentas } = useERP();

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [tipo, setTipo] = useState<'Ingreso' | 'Egreso' | 'Traspaso' | 'Apertura' | 'Cierre' | 'Ajuste IFRS'>('Traspaso');
  const [glosaGeneral, setGlosaGeneral] = useState('');
  
  const [lineas, setLineas] = useState<LineaAsiento[]>([
    { id: '1', codigoCuenta: '1.1.02', nombreCuenta: 'Banco Estado Cta Cte', debe: 150000, haber: 0, glosa: 'Depósito en cuenta corriente' },
    { id: '2', codigoCuenta: '1.1.01', nombreCuenta: 'Caja Moneda Nacional', debe: 0, haber: 150000, glosa: 'Salida de caja' },
  ]);

  if (!modalAsientoOpen) return null;

  const totalDebe = lineas.reduce((sum, l) => sum + (Number(l.debe) || 0), 0);
  const totalHaber = lineas.reduce((sum, l) => sum + (Number(l.haber) || 0), 0);
  const isCuadrado = totalDebe > 0 && totalDebe === totalHaber;

  const handleAddLinea = () => {
    const nextId = (lineas.length + 1).toString();
    setLineas([
      ...lineas,
      { id: nextId, codigoCuenta: '5.2.03', nombreCuenta: 'Gastos Generales y Servicios Básicos', debe: 0, haber: 0, glosa: glosaGeneral || 'Detalle del asiento' }
    ]);
  };

  const handleUpdateLinea = (index: number, field: keyof LineaAsiento, value: any) => {
    const updated = [...lineas];
    const current = { ...updated[index], [field]: value };

    // If changing account code, auto-fill account name
    if (field === 'codigoCuenta') {
      const match = planCuentas.find(c => c.codigo === value);
      if (match) {
        current.nombreCuenta = match.nombre;
      }
    }

    updated[index] = current;
    setLineas(updated);
  };

  const handleRemoveLinea = (index: number) => {
    if (lineas.length <= 2) {
      alert('Un asiento contable debe tener al menos dos líneas de partida doble.');
      return;
    }
    setLineas(lineas.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCuadrado) {
      alert('El asiento no está cuadrado. La suma del Debe debe ser exactamente igual a la suma del Haber.');
      return;
    }

    addAsiento({
      empresaId: empresaActiva.id,
      fecha,
      tipo,
      glosaGeneral: glosaGeneral || 'Asiento contable manual',
      lineas,
      totalDebe,
      totalHaber,
      creadoPor: 'Usuario Contador',
    });

    setModalAsientoOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full p-6 border border-slate-300 space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Nuevo Asiento Contable (Libro Diario)
          </h3>
          <button onClick={() => setModalAsientoOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha Contable</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Comprobante</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white font-medium"
              >
                <option value="Traspaso">Traspaso</option>
                <option value="Ingreso">Ingreso</option>
                <option value="Egreso">Egreso</option>
                <option value="Ajuste IFRS">Ajuste IFRS</option>
                <option value="Apertura">Apertura</option>
                <option value="Cierre">Cierre</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Glosa General del Asiento</label>
              <input
                type="text"
                required
                placeholder="ej. Pago de honorarios profesionales mes octubre"
                value={glosaGeneral}
                onChange={(e) => setGlosaGeneral(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1.5"
              />
            </div>
          </div>

          {/* Lines Table */}
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] text-slate-600">
                <tr>
                  <th className="py-2 px-2 w-32">Cuenta</th>
                  <th className="py-2 px-2">Nombre Cuenta</th>
                  <th className="py-2 px-2">Glosa de Detalle</th>
                  <th className="py-2 px-2 text-right w-28">Debe ($)</th>
                  <th className="py-2 px-2 text-right w-28">Haber ($)</th>
                  <th className="py-2 px-2 w-8 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineas.map((linea, idx) => (
                  <tr key={linea.id} className="hover:bg-slate-50">
                    <td className="py-1.5 px-2">
                      <select
                        value={linea.codigoCuenta}
                        onChange={(e) => handleUpdateLinea(idx, 'codigoCuenta', e.target.value)}
                        className="w-full border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                      >
                        {planCuentas.map(c => (
                          <option key={c.codigo} value={c.codigo}>{c.codigo}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        readOnly
                        value={linea.nombreCuenta}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        value={linea.glosa}
                        onChange={(e) => handleUpdateLinea(idx, 'glosa', e.target.value)}
                        className="w-full border border-slate-300 rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="number"
                        min="0"
                        value={linea.debe}
                        onChange={(e) => handleUpdateLinea(idx, 'debe', parseFloat(e.target.value) || 0)}
                        className="w-full border border-slate-300 rounded px-2 py-1 text-right font-mono font-tabular"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <input
                        type="number"
                        min="0"
                        value={linea.haber}
                        onChange={(e) => handleUpdateLinea(idx, 'haber', parseFloat(e.target.value) || 0)}
                        className="w-full border border-slate-300 rounded px-2 py-1 text-right font-mono font-tabular"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLinea(idx)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold font-mono">
                <tr>
                  <td colSpan={3} className="py-2 px-3 text-right font-sans">Sumas Iguales:</td>
                  <td className="py-2 px-2 text-right font-tabular text-[#003366]">${totalDebe.toLocaleString('es-CL')}</td>
                  <td className="py-2 px-2 text-right font-tabular text-[#003366]">${totalHaber.toLocaleString('es-CL')}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleAddLinea}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Línea</span>
            </button>

            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 font-semibold ${isCuadrado ? 'text-emerald-700' : 'text-red-600'}`}>
                {isCuadrado ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Asiento Cuadrado (Debe = Haber)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Descuadre: ${Math.abs(totalDebe - totalHaber).toLocaleString('es-CL')}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalAsientoOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isCuadrado}
              className="px-4 py-1.5 bg-[#003366] hover:bg-[#0056B3] text-white rounded font-semibold disabled:opacity-50 shadow-xs"
            >
              Guardar y Contabilizar Asiento
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
