import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { exportToCSV, printDocumentView } from '../../utils/export';
import { 
  Boxes, 
  Plus, 
  ArrowRightLeft, 
  Barcode, 
  Download, 
  Search, 
  Warehouse, 
  AlertTriangle,
  Layers,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const LogisticsAndStockModule: React.FC = () => {
  const { 
    empresaActiva, 
    bodegas, 
    productos, 
    addProducto, 
    trasladarStock, 
    activeSubView, 
    setActiveSubView,
    addNotification 
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBodegaFilter, setSelectedBodegaFilter] = useState('todas');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showNewProdModal, setShowNewProdModal] = useState(false);

  // Transfer state
  const [transferProdId, setTransferProdId] = useState('');
  const [transferOrigenId, setTransferOrigenId] = useState('');
  const [transferDestinoId, setTransferDestinoId] = useState('');
  const [transferCantidad, setTransferCantidad] = useState(10);

  // New product state
  const [skuCode, setSkuCode] = useState('');
  const [skuName, setSkuName] = useState('');
  const [skuCategory, setSkuCategory] = useState('Materiales');
  const [skuCost, setSkuCost] = useState(1500);
  const [skuPrice, setSkuPrice] = useState(2500);
  const [skuStock, setSkuStock] = useState(100);
  const [skuBodega, setSkuBodega] = useState(bodegas[0]?.id || '');
  const [skuBarcode, setSkuBarcode] = useState('');

  const filteredBodegas = bodegas.filter(b => b.empresaId === empresaActiva.id);
  
  const filteredProductos = productos.filter(p => {
    if (p.empresaId !== empresaActiva.id) return false;
    if (selectedBodegaFilter !== 'todas' && p.bodegaId !== selectedBodegaFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.sku.toLowerCase().includes(term) ||
      p.nombre.toLowerCase().includes(term) ||
      p.codigoBarra.includes(term)
    );
  });

  const totalStockValorizado = filteredProductos.reduce((sum, p) => sum + (p.stockActual * p.costoPromedioPonderado), 0);
  const totalUnidades = filteredProductos.reduce((sum, p) => sum + p.stockActual, 0);

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProdId || !transferOrigenId || !transferDestinoId) {
      alert('Seleccione producto y bodegas de origen y destino.');
      return;
    }
    if (transferOrigenId === transferDestinoId) {
      alert('La bodega de destino debe ser distinta a la de origen.');
      return;
    }

    trasladarStock(transferProdId, transferOrigenId, transferDestinoId, Number(transferCantidad));
    setShowTransferModal(false);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProducto({
      empresaId: empresaActiva.id,
      sku: skuCode || `SKU-${Date.now().toString().slice(-4)}`,
      nombre: skuName,
      categoria: skuCategory,
      unidadMedida: 'Unidad',
      stockActual: Number(skuStock),
      stockMinimo: 20,
      costoPromedioPonderado: Number(skuCost),
      precioVentaNeto: Number(skuPrice),
      bodegaId: skuBodega,
      codigoBarra: skuBarcode || `780${Date.now().toString().slice(-10)}`,
    });
    setShowNewProdModal(false);
    addNotification({
      type: 'success',
      message: `Producto SKU ${skuCode} creado e ingresado a bodega.`,
    });
  };

  const handleExportStockCSV = () => {
    const headers = ['SKU', 'Nombre del Producto', 'Categoría', 'Bodega', 'Código de Barra', 'Stock Actual', 'Costo PMP ($)', 'Valor Total ($)', 'Precio Venta ($)'];
    const rows = filteredProductos.map(p => {
      const bod = bodegas.find(b => b.id === p.bodegaId)?.nombre || '';
      return [
        p.sku,
        p.nombre,
        p.categoria,
        bod,
        p.codigoBarra,
        p.stockActual,
        p.costoPromedioPonderado,
        p.stockActual * p.costoPromedioPonderado,
        p.precioVentaNeto
      ];
    });
    exportToCSV(`Inventario_Valorizado_${empresaActiva.rut}`, headers, rows);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header and Sub-menu */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Logística, Control de Bodegas e Inventario
          </h1>
          <p className="text-xs text-slate-500">
            Valoración PMP (NIC 2), Guías de Despacho Internas (Tipo 52) y control de existencias
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubView('bodegas')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'bodegas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bodegas & Stock
          </button>
          <button
            onClick={() => setActiveSubView('traslados')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'traslados' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Traslados (Guías 52)
          </button>
          <button
            onClick={() => setActiveSubView('termino_giro')}
            className={`px-3 py-1.5 font-medium rounded transition-colors ${
              activeSubView === 'termino_giro' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inventario Término de Giro
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Valor Total Stock en Bodega</span>
          <p className="text-2xl font-bold font-mono text-[#003366] mt-1">
            ${totalStockValorizado.toLocaleString('es-CL')}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Valuado según NIC 2 Inventarios</span>
        </div>

        <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Productos y SKUs Activos</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{filteredProductos.length} SKUs</p>
          <span className="text-[10px] text-slate-500 font-mono">Total unidades: {totalUnidades.toLocaleString('es-CL')}</span>
        </div>

        <div className="p-4 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Bodegas y Pañoles de Faena</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{filteredBodegas.length} Almacenes</p>
          <span className="text-[10px] text-slate-500">Incluye pañoles de obra</span>
        </div>
      </div>

      {/* Main Stock Table View */}
      {activeSubView === 'bodegas' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por SKU, Nombre o Código de Barra..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-[#003366] focus:outline-none w-64"
                />
              </div>

              <select
                value={selectedBodegaFilter}
                onChange={(e) => setSelectedBodegaFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800"
              >
                <option value="todas">Todas las Bodegas</option>
                {filteredBodegas.map(b => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportStockCSV}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Excel CSV</span>
              </button>

              <button
                onClick={() => setShowTransferModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded flex items-center gap-1.5 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Traslado entre Bodegas</span>
              </button>

              <button
                onClick={() => setShowNewProdModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Producto SKU</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#E0E0E0] rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">SKU</th>
                    <th className="py-2.5 px-3 font-semibold">Descripción del Producto</th>
                    <th className="py-2.5 px-3 font-semibold">Categoría</th>
                    <th className="py-2.5 px-3 font-semibold">Bodega Asignada</th>
                    <th className="py-2.5 px-3 font-semibold font-tabular">Código de Barras</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-tabular">Stock Actual</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-tabular">Costo PMP ($)</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-tabular">Valor Total ($)</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-tabular">Precio Venta ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProductos.map((prod) => {
                    const bod = bodegas.find(b => b.id === prod.bodegaId);
                    return (
                      <tr key={prod.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-[#003366]">{prod.sku}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{prod.nombre}</td>
                        <td className="py-2 px-3 text-slate-600">{prod.categoria}</td>
                        <td className="py-2 px-3 text-slate-700">{bod?.nombre || 'Bodega Central'}</td>
                        <td className="py-2 px-3 font-mono text-slate-500 text-[11px] flex items-center gap-1">
                          <Barcode className="w-3.5 h-3.5 text-slate-400" />
                          <span>{prod.codigoBarra}</span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold font-tabular text-slate-900">
                          {prod.stockActual.toLocaleString('es-CL')}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-tabular text-slate-600">
                          ${prod.costoPromedioPonderado.toLocaleString('es-CL')}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold font-tabular text-emerald-800">
                          ${(prod.stockActual * prod.costoPromedioPonderado).toLocaleString('es-CL')}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-tabular text-slate-900">
                          ${prod.precioVentaNeto.toLocaleString('es-CL')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: Traslados entre Bodegas */}
      {activeSubView === 'traslados' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Guías de Despacho Internas (Tipo 52) y Traslados de Materiales
              </h3>
              <p className="text-xs text-slate-500">
                Emisión de documento tributario electrónico para traslado no constitutivo de venta
              </p>
            </div>
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded shadow-xs"
            >
              Realizar Nuevo Traslado
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700">
            <span className="font-semibold block mb-1">Normativa SII para Guías de Despacho Internas:</span>
            Todo traslado de mercaderías o materiales entre bodegas o faenas de una misma empresa debe ser amparado por una Guía de Despacho Electrónica Tipo 52 con indicador de traslado código 5 (Traslados internos).
          </div>
        </div>
      )}

      {/* SUBVIEW 3: Inventario para Término de Giro SII */}
      {activeSubView === 'termino_giro' && (
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Inventario Valorizado para Procedimiento de Término de Giro (Art. 69 C.T.)
          </h3>
          <p className="text-xs text-slate-500">
            El SII exige tasar a costo de reposición o precio de mercado las existencias finales al momento del cese de actividades
          </p>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Valoración Fiscal de Existencias Residuales:</span>
            </div>
            <p>
              Monto total de existencias computables: <strong>${totalStockValorizado.toLocaleString('es-CL')}</strong>.
              Este valor debe incorporarse a la base imponible del Impuesto Único de Término de Giro (35%).
            </p>
          </div>
        </div>
      )}

      {/* MODAL: Traslado Stock */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Traslado de Existencias entre Bodegas</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Producto a Trasladar</label>
                <select
                  required
                  value={transferProdId}
                  onChange={(e) => setTransferProdId(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                >
                  <option value="">Seleccione Producto...</option>
                  {filteredProductos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stockActual})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bodega Origen</label>
                  <select
                    required
                    value={transferOrigenId}
                    onChange={(e) => setTransferOrigenId(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="">Origen...</option>
                    {filteredBodegas.map(b => (
                      <option key={b.id} value={b.id}>{b.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bodega Destino</label>
                  <select
                    required
                    value={transferDestinoId}
                    onChange={(e) => setTransferDestinoId(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  >
                    <option value="">Destino...</option>
                    {filteredBodegas.map(b => (
                      <option key={b.id} value={b.id}>{b.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cantidad de Unidades</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferCantidad}
                  onChange={(e) => setTransferCantidad(parseFloat(e.target.value) || 1)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#003366] hover:bg-[#0056B3] text-white rounded font-semibold shadow-xs"
                >
                  Emitir Guía 52 y Trasladar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Nuevo Producto */}
      {showNewProdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Registrar Nuevo Producto SKU</h3>
              <button onClick={() => setShowNewProdModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Producto / Insumo</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Saco Hormigón Preparado 25kg"
                  value={skuName}
                  onChange={(e) => setSkuName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código SKU</label>
                  <input
                    type="text"
                    placeholder="MAT-004"
                    value={skuCode}
                    onChange={(e) => setSkuCode(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                  <input
                    type="text"
                    value={skuCategory}
                    onChange={(e) => setSkuCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Costo Unitario ($)</label>
                  <input
                    type="number"
                    value={skuCost}
                    onChange={(e) => setSkuCost(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio Venta ($)</label>
                  <input
                    type="number"
                    value={skuPrice}
                    onChange={(e) => setSkuPrice(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    value={skuStock}
                    onChange={(e) => setSkuStock(parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewProdModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#003366] hover:bg-[#0056B3] text-white rounded font-semibold shadow-xs"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
