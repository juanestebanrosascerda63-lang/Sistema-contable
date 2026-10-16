import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { TipoDTE, DTEDetalleItem } from '../../types/erp';
import { exportToCSV, printDocumentView } from '../../utils/export';
import { formatRut, validateRut } from '../../utils/rut';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  FileCheck, 
  Printer, 
  Download, 
  Search, 
  Layers, 
  TrendingUp, 
  Users, 
  QrCode, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Receipt
} from 'lucide-react';

export const SalesAndDTEModule: React.FC = () => {
  const { 
    empresaActiva, 
    dtes, 
    addDTE, 
    activeSubView, 
    setActiveSubView,
    addNotification,
    setSelectedDTEView,
    setModalDTEOpen
  } = useERP();

  // DTE Form State
  const [tipoDoc, setTipoDoc] = useState<TipoDTE>('33 - Factura Electrónica');
  const [formaPago, setFormaPago] = useState<'Contado' | 'Crédito 30 días' | 'Crédito 60 días' | 'Crédito 90 días'>('Crédito 30 días');
  const [rutReceptor, setRutReceptor] = useState('77.102.340-9');
  const [razonSocialReceptor, setRazonSocialReceptor] = useState('COMERCIAL Y SERVICIOS TRIBUTA EDUCA SpA');
  const [giroReceptor, setGiroReceptor] = useState('Asesoría tributaria y capacitación profesional');
  const [direccionReceptor, setDireccionReceptor] = useState('Av. Apoquindo 4700');
  const [comunaReceptor, setComunaReceptor] = useState('Las Condes');
  const [emailReceptor, setEmailReceptor] = useState('facturas@tributaeduca.cl');
  const [isRecurrente, setIsRecurrente] = useState(false);

  // Dynamic items supporting up to 60 lines!
  const [items, setItems] = useState<DTEDetalleItem[]>([
    {
      id: 'it-1',
      codigo: 'SRV-ASES-01',
      descripcion: 'Servicios de Asesoría Contable y Auditoría Mensual',
      cantidad: 1,
      precioUnitario: 450000,
      exento: false,
      descuentoPorc: 0,
      totalLinea: 450000,
      centroCosto1: empresaActiva.sucursalActiva,
      centroCosto2: 'Servicios Contables'
    },
    {
      id: 'it-2',
      codigo: 'CAP-IFRS-02',
      descripcion: 'Capacitación en Normas Internacionales NIC 1 y NIC 16 (8 hrs)',
      cantidad: 2,
      precioUnitario: 180000,
      exento: false,
      descuentoPorc: 10,
      totalLinea: 324000,
      centroCosto1: empresaActiva.sucursalActiva,
      centroCosto2: 'Capacitación'
    }
  ]);

  // Calculations
  const totalExento = items.reduce((sum, it) => it.exento ? sum + it.totalLinea : sum, 0);
  const totalNeto = items.reduce((sum, it) => !it.exento ? sum + it.totalLinea : sum, 0);
  const totalIVA = Math.round(totalNeto * 0.19);
  const totalDTE = totalExento + totalNeto + totalIVA;

  const handleAddItem = () => {
    if (items.length >= 60) {
      alert('Ha alcanzado el límite máximo de 60 líneas de detalle por DTE.');
      return;
    }
    const nextIndex = items.length + 1;
    const newItem: DTEDetalleItem = {
      id: `it-${Date.now()}-${nextIndex}`,
      codigo: `ART-00${nextIndex}`,
      descripcion: `Ítem de facturación N° ${nextIndex}`,
      cantidad: 1,
      precioUnitario: 10000,
      exento: false,
      descuentoPorc: 0,
      totalLinea: 10000,
      centroCosto1: empresaActiva.sucursalActiva,
      centroCosto2: 'General'
    };
    setItems([...items, newItem]);
  };

  const handleAddBatchItems = (count: number) => {
    const remaining = 60 - items.length;
    const toAdd = Math.min(count, remaining);
    if (toAdd <= 0) return;

    const newBatch: DTEDetalleItem[] = [];
    for (let i = 0; i < toAdd; i++) {
      const idx = items.length + i + 1;
      newBatch.push({
        id: `it-batch-${Date.now()}-${idx}`,
        codigo: `LINEA-${idx}`,
        descripcion: `Partida / Material de suministro continuo línea ${idx}`,
        cantidad: 10,
        precioUnitario: 5000 + (idx * 500),
        exento: false,
        descuentoPorc: 0,
        totalLinea: (10) * (5000 + (idx * 500)),
        centroCosto1: empresaActiva.sucursalActiva,
        centroCosto2: 'Línea de Suministro'
      });
    }
    setItems([...items, ...newBatch]);
  };

  const handleUpdateItem = (index: number, field: keyof DTEDetalleItem, val: any) => {
    const updated = [...items];
    const it = { ...updated[index], [field]: val };

    const cant = Number(it.cantidad) || 0;
    const precio = Number(it.precioUnitario) || 0;
    const desc = Number(it.descuentoPorc) || 0;
    const bruto = cant * precio;
    it.totalLinea = Math.round(bruto - (bruto * (desc / 100)));

    updated[index] = it;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('El documento debe contener al menos 1 línea de detalle.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleEmitirDTE = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRut(rutReceptor)) {
      alert('Por favor ingrese un RUT chileno válido para el receptor.');
      return;
    }

    const nextFolio = Math.floor(1850 + Math.random() * 500);
    const tipoCodigo = parseInt(tipoDoc.split(' - ')[0], 10);

    const createdDTE = addDTE({
      empresaId: empresaActiva.id,
      tipo: tipoDoc,
      tipoCodigo,
      folio: nextFolio,
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      direccionOperacion: 'emitido',
      rutContraparte: rutReceptor,
      razonSocialContraparte: razonSocialReceptor,
      giroContraparte: giroReceptor,
      formaPago,
      items,
      montoExento: totalExento,
      montoNeto: totalNeto,
      montoIVA: totalIVA,
      montoTotal: totalDTE,
      estadoContable: 'Centralizado',
      estadoSII: 'Aceptado por SII',
    });

    setSelectedDTEView(createdDTE);
    setModalDTEOpen(true);
  };

  const ventasEmitidas = dtes.filter(d => d.empresaId === empresaActiva.id && d.direccionOperacion === 'emitido');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header and Sub-menu */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Ventas, Facturación Electrónica (DTE) y CRM
          </h1>
          <p className="text-xs text-slate-500">
            Emisión con soporte de hasta 60 líneas de detalle, Timbre Electrónico TED y facturación recurrente
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubView('emision')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'emision' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Emitir DTE (hasta 60 líneas)
          </button>
          <button
            onClick={() => setActiveSubView('informes')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'informes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard e Informes
          </button>
          <button
            onClick={() => setActiveSubView('ranking')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'ranking' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ranking Clientes / Productos
          </button>
        </div>
      </div>

      {/* SUBVIEW 1: Emisión de DTE (Pantalla 6.1) */}
      {activeSubView === 'emision' && (
        <form onSubmit={handleEmitirDTE} className="space-y-6">
          
          {/* Top Configuration & Limits Notice */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#003366]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Emisor: {empresaActiva.razonSocial} (RUT: {empresaActiva.rut})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-50 text-[#003366] font-semibold px-2.5 py-1 rounded border border-blue-200">
                  Capacidad de Detalle: {items.length} / 60 Líneas
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  ✓ Supera límite gratuito SII (10 líneas)
                </span>
              </div>
            </div>

            {/* Document Types and Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Documento DTE</label>
                <select
                  value={tipoDoc}
                  onChange={(e) => setTipoDoc(e.target.value as TipoDTE)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white font-medium text-slate-800"
                >
                  <option value="33 - Factura Electrónica">33 - Factura Electrónica</option>
                  <option value="34 - Factura No Afecta o Exenta Electrónica">34 - Factura No Afecta o Exenta</option>
                  <option value="39 - Boleta Electrónica">39 - Boleta Electrónica</option>
                  <option value="61 - Nota de Crédito Electrónica">61 - Nota de Crédito</option>
                  <option value="56 - Nota de Débito Electrónica">56 - Nota de Débito</option>
                  <option value="52 - Guía de Despacho Electrónica">52 - Guía de Despacho</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Forma de Pago</label>
                <select
                  value={formaPago}
                  onChange={(e) => setFormaPago(e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800"
                >
                  <option value="Contado">Contado</option>
                  <option value="Crédito 30 días">Crédito 30 días</option>
                  <option value="Crédito 60 días">Crédito 60 días</option>
                  <option value="Crédito 90 días">Crédito 90 días</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facturación Recurrente</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="rec"
                    checked={isRecurrente}
                    onChange={(e) => setIsRecurrente(e.target.checked)}
                    className="rounded border-slate-300 text-[#003366] h-4 w-4"
                  />
                  <label htmlFor="rec" className="text-xs text-slate-700 cursor-pointer">
                    Emitir mensualmente para contratos fijos
                  </label>
                </div>
              </div>
            </div>

            {/* Receptor Data */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Datos del Receptor / Cliente
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">RUT Receptor</label>
                  <input
                    type="text"
                    required
                    value={rutReceptor}
                    onChange={(e) => setRutReceptor(formatRut(e.target.value))}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-1">Razón Social</label>
                  <input
                    type="text"
                    required
                    value={razonSocialReceptor}
                    onChange={(e) => setRazonSocialReceptor(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Giro Comercial</label>
                  <input
                    type="text"
                    value={giroReceptor}
                    onChange={(e) => setGiroReceptor(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Dirección y Comuna</label>
                  <input
                    type="text"
                    value={`${direccionReceptor}, ${comunaReceptor}`}
                    onChange={(e) => setDireccionReceptor(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Correo Electrónico DTE</label>
                  <input
                    type="email"
                    value={emailReceptor}
                    onChange={(e) => setEmailReceptor(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Dynamic Items Table (Up to 60 Lines) */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Detalle de Ítems y Servicios ({items.length} líneas)
                </h3>
                <p className="text-xs text-slate-500">
                  Agregue hasta 60 líneas de detalle con cálculo en tiempo real
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+1 Línea</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBatchItems(5)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>+5 Líneas</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBatchItems(20)}
                  className="px-2.5 py-1 text-xs font-semibold text-[#003366] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Llenar Lote Masivo (hasta 60)</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-2 text-center w-8">#</th>
                    <th className="py-2 px-3 font-semibold w-24">Código</th>
                    <th className="py-2 px-3 font-semibold">Descripción del Producto o Servicio</th>
                    <th className="py-2 px-2 font-semibold text-center w-20">Cantidad</th>
                    <th className="py-2 px-3 font-semibold text-right w-28">Precio ($)</th>
                    <th className="py-2 px-2 font-semibold text-center w-16">Exento</th>
                    <th className="py-2 px-2 font-semibold text-center w-16">Desc %</th>
                    <th className="py-2 px-3 font-semibold text-right w-32">Total ($)</th>
                    <th className="py-2 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 text-center font-mono text-slate-400 font-tabular text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={it.codigo}
                          onChange={(e) => handleUpdateItem(idx, 'codigo', e.target.value)}
                          className="w-full border border-slate-300 rounded px-1.5 py-1 font-mono text-[11px]"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={it.descripcion}
                          onChange={(e) => handleUpdateItem(idx, 'descripcion', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          min="1"
                          value={it.cantidad}
                          onChange={(e) => handleUpdateItem(idx, 'cantidad', parseFloat(e.target.value) || 0)}
                          className="w-full border border-slate-300 rounded px-1.5 py-1 text-center font-mono font-tabular text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          min="0"
                          value={it.precioUnitario}
                          onChange={(e) => handleUpdateItem(idx, 'precioUnitario', parseFloat(e.target.value) || 0)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-right font-mono font-tabular text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={it.exento}
                          onChange={(e) => handleUpdateItem(idx, 'exento', e.target.checked)}
                          className="rounded border-slate-300 text-[#003366] h-3.5 w-3.5"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={it.descuentoPorc}
                          onChange={(e) => handleUpdateItem(idx, 'descuentoPorc', parseFloat(e.target.value) || 0)}
                          className="w-full border border-slate-300 rounded px-1 py-1 text-center font-mono font-tabular text-[11px]"
                        />
                      </td>
                      <td className="py-1.5 px-3 text-right font-mono font-bold font-tabular text-slate-800">
                        ${it.totalLinea.toLocaleString('es-CL')}
                      </td>
                      <td className="py-1.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded"
                          title="Eliminar fila"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown Strip */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Normativa SII: </span>
                Documento firmado electrónicamente con Certificado Digital y Timbre Electrónico TED.
              </div>

              <div className="w-full sm:w-72 space-y-1.5 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Monto Exento:</span>
                  <span className="font-mono font-tabular">${totalExento.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Monto Neto Afecto:</span>
                  <span className="font-mono font-tabular">${totalNeto.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA Débito (19%):</span>
                  <span className="font-mono font-tabular">${totalIVA.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#003366] pt-1 border-t border-slate-200">
                  <span>TOTAL A PAGAR:</span>
                  <span className="font-mono font-tabular">${totalDTE.toLocaleString('es-CL')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#003366] hover:bg-[#0056B3] rounded shadow-xs transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Firmar Electrónicamente y Emitir al SII</span>
              </button>
            </div>

          </div>

        </form>
      )}

      {/* SUBVIEW 2: Dashboard e Informes (Pantalla 6.2) */}
      {activeSubView === 'informes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Facturación del Mes</span>
              <p className="text-xl font-bold font-mono text-[#003366] mt-1">
                ${ventasEmitidas.reduce((s, d) => s + d.montoTotal, 0).toLocaleString('es-CL')}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">✓ DTEs aceptados por SII</span>
            </div>

            <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Cuentas por Cobrar Pendientes</span>
              <p className="text-xl font-bold font-mono text-amber-700 mt-1">$42.150.000</p>
              <span className="text-[10px] text-slate-500">Crédito 30 y 60 días</span>
            </div>

            <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">DTEs Emitidos</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">{ventasEmitidas.length} Documentos</p>
              <span className="text-[10px] text-slate-500">Folios 1845 a 1846</span>
            </div>
          </div>

          {/* Gráfico evolución últimos 6 meses */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#003366]" />
              <span>Evolución Histórica de Ventas (Últimos 6 Meses)</span>
            </h3>

            <div className="grid grid-cols-6 gap-3 pt-4 items-end h-48 border-b border-slate-200 pb-2">
              {[
                { mes: 'Mayo', val: 18.4, display: '$18.4M' },
                { mes: 'Junio', val: 24.5, display: '$24.5M' },
                { mes: 'Julio', val: 21.9, display: '$21.9M' },
                { mes: 'Agosto', val: 31.2, display: '$31.2M' },
                { mes: 'Septiembre', val: 38.4, display: '$38.4M' },
                { mes: 'Octubre', val: 48.5, display: '$48.5M' },
              ].map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">{m.display}</span>
                  <div
                    className="w-full bg-[#003366] hover:bg-[#0056B3] rounded-t transition-all"
                    style={{ height: `${(m.val / 55) * 100}%` }}
                  />
                  <span className="text-[11px] font-semibold text-slate-700">{m.mes}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: Ranking Clientes y Productos */}
      {activeSubView === 'ranking' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Top 5 Clientes por Volumen de Facturación</h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">1. INMOBILIARIA PARQUE CENTRAL SPA</p>
                  <p className="text-[10px] text-slate-500 font-mono">RUT: 76.998.410-5</p>
                </div>
                <span className="font-mono font-bold text-[#003366]">$57.715.000</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">2. DISTRIBUIDORA DE ALIMENTOS CENTRAL LTDA.</p>
                  <p className="text-[10px] text-slate-500 font-mono">RUT: 77.345.910-4</p>
                </div>
                <span className="font-mono font-bold text-[#003366]">$1.694.560</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">3. CLÍNICA ODONTOLÓGICA SAN CRISTÓBAL S.A.</p>
                  <p className="text-[10px] text-slate-500 font-mono">RUT: 96.554.890-2</p>
                </div>
                <span className="font-mono font-bold text-[#003366]">$276.080</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Top Productos y Servicios Vendidos</h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">1. Avance Obra Gruesa y Losas (EEPP)</p>
                  <p className="text-[10px] text-slate-500">Construcción y edificación</p>
                </div>
                <span className="font-mono font-bold text-emerald-800">$48.500.000</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">2. Bidón 20L Agua Purificada Osmosis</p>
                  <p className="text-[10px] text-slate-500">430 unidades entregadas</p>
                </div>
                <span className="font-mono font-bold text-emerald-800">$1.296.000</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-800">3. Dispensador Frío / Caliente Premium</p>
                  <p className="text-[10px] text-slate-500">8 unidades instaladas</p>
                </div>
                <span className="font-mono font-bold text-emerald-800">$360.000</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
