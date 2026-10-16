import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { exportToCSV, printDocumentView } from '../../utils/export';
import { 
  Receipt, 
  DollarSign, 
  Search, 
  Calendar, 
  Download, 
  Star, 
  CheckSquare, 
  Trash2, 
  MessageSquare, 
  FileText, 
  PieChart, 
  Check, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  AlertTriangle,
  FolderSync
} from 'lucide-react';

interface ObligationsModuleProps {
  tipo: 'pagar' | 'cobrar';
}

export const ObligationsModule: React.FC<ObligationsModuleProps> = ({ tipo }) => {
  const { 
    empresaActiva, 
    obligacionesCobrar, 
    obligacionesPagar, 
    togglePagadoObligacion, 
    toggleDestacadoObligacion,
    setActiveRealm
  } = useERP();

  const isPagar = tipo === 'pagar';
  const rawList = isPagar ? obligacionesPagar : obligacionesCobrar;

  const [selectedCategory, setSelectedCategory] = useState<string>('Todas las Categorías');
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaDesde, setFechaDesde] = useState('2026-01-01');
  const [fechaHasta, setFechaHasta] = useState('2026-10-31');

  // Categories list matching Image 4 (Cobrar) vs Image 5 (Pagar)
  const categoriesPagar = [
    'Todas las Categorías',
    'Boleta de Honorarios',
    'Otros Pagos/Cobros',
    'Tarjeta de Crédito',
    'Documentos Tributarios',
    'Créditos y Cuotas',
    'Cuenta Corriente Mercantil',
    'Otros Pagos Mensuales',
    'Recaudación por Cuenta de Terceros',
    'Rendiciones',
    'Obligación Tributaria'
  ];

  const categoriesCobrar = [
    'Todas las Categorías',
    'Otros Pagos/Cobros',
    'Documentos Tributarios',
    'Créditos y Cuotas',
    'Otros Pagos Mensuales',
    'Reparto de Utilidad',
    'Rendiciones',
    'Obligación Tributaria'
  ];

  const categories = isPagar ? categoriesPagar : categoriesCobrar;

  const filteredList = rawList.filter(item => {
    if (selectedCategory !== 'Todas las Categorías' && item.categoria !== selectedCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.descripcion.toLowerCase().includes(term) ||
        item.tipoDocumento.toLowerCase().includes(term) ||
        item.fecha.includes(term)
      );
    }
    return true;
  });

  const totalSum = filteredList.reduce((sum, item) => sum + Math.abs(item.monto), 0);

  const handleExportCSV = () => {
    const headers = ['Tipo', 'Fecha', 'Tipo Documento', 'Descripción', 'Monto ($)', 'Progreso (%)', 'Estado'];
    const rows = filteredList.map(item => [
      item.categoria,
      item.fecha,
      item.tipoDocumento,
      item.descripcion,
      item.monto,
      `${item.progreso}%`,
      item.pagado ? 'Pagado/Cobrado' : 'Pendiente'
    ]);
    exportToCSV(`Obligaciones_${isPagar ? 'Pagar' : 'Cobrar'}_${empresaActiva.rut}`, headers, rows);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA] min-h-[calc(100vh-56px)]">
      
      {/* Top Warning Banner matching screenshots */}
      <div className="bg-[#FEECEB] border-b border-[#F8D7DA] px-4 py-2.5 flex items-center gap-2.5 text-xs text-[#721C24] shrink-0 no-print">
        <div className="p-1 rounded bg-[#F5C6CB] text-[#721C24] shrink-0">
          <AlertTriangle className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1">
          <span>Una de tus conexiones bancarias dejó de funcionar. </span>
          <button 
            onClick={() => setActiveRealm('sii')} 
            className="font-bold underline hover:text-black cursor-pointer"
          >
            Ir a revisar.
          </button>
          <span> No incluimos estos saldos en tu </span>
          <button 
            onClick={() => setActiveRealm('flujo_caja')} 
            className="font-bold underline hover:text-black cursor-pointer"
          >
            flujo de caja.
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Category Sidebar matching Image 4 & 5 */}
        <aside className="w-full lg:w-64 bg-[#EAF0F6] border-r border-[#D9E2EC] p-3 space-y-1.5 shrink-0 text-xs select-none">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-300 pb-2 mb-2 flex items-center gap-2">
            {isPagar ? (
              <>
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>Oblig. por Pagar</span>
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 text-teal-700" />
                <span>Oblig. por Cobrar</span>
              </>
            )}
          </div>

          <div className="space-y-0.5">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const isDocTrib = cat === 'Documentos Tributarios';

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between text-xs transition-colors ${
                    isSelected 
                      ? 'bg-white text-slate-900 font-bold shadow-xs border-l-2 border-[#003366]' 
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span className="truncate">{cat}</span>
                  </div>
                  {isDocTrib && (
                    <RefreshCw className="w-3 h-3 text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-300">
            <div className="bg-white p-2.5 rounded border border-slate-200 shadow-xs text-xs space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Seleccionado:</span>
              <p className={`font-mono font-bold text-sm ${isPagar ? 'text-rose-700' : 'text-emerald-700'}`}>
                {isPagar ? `($${totalSum.toLocaleString('es-CL')})` : `$${totalSum.toLocaleString('es-CL')}`}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Obligations Table Area */}
        <main className="flex-1 p-4 lg:p-6 space-y-4 overflow-x-hidden">
          
          {/* Header Controls & Actions matching Image 4 & 5 */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-3.5 shadow-xs space-y-3">
            
            {/* Top row: Search & Date Range */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:border-[#003366] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Calendar className="w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="border border-slate-300 rounded px-2 py-1 text-slate-700 font-mono text-[11px]"
                />
                <span className="text-slate-400">→</span>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="border border-slate-300 rounded px-2 py-1 text-slate-700 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Second row: Status Counter & Icon Bar matching screenshots */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {isPagar ? `OBLIGACIONES POR PAGAR: ${filteredList.length}` : `OBLIGACIONES POR COBRAR: ${filteredList.length}`}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200 rounded text-slate-600">
                  <button onClick={handleExportCSV} className="p-1 hover:bg-slate-200 rounded" title="Descargar CSV">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={printDocumentView} className="p-1 hover:bg-slate-200 rounded" title="Imprimir">
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 hover:bg-slate-200 rounded" title="Conciliar automáticamente">
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono ml-2">
                  <span>1 - {filteredList.length} de {isPagar ? '5102' : '906'}</span>
                  <button className="p-1 hover:bg-slate-100 rounded text-slate-600"><ChevronLeft className="w-3.5 h-3.5" /></button>
                  <button className="p-1 hover:bg-slate-100 rounded text-slate-600"><ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Table matching Images 4 & 5 */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-8">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </th>
                    <th className="py-2.5 px-2 w-8 text-center">★</th>
                    <th className="py-2.5 px-3 text-right font-tabular w-36">MONTO ($)</th>
                    <th className="py-2.5 px-3 w-28 text-center font-tabular">FECHA</th>
                    <th className="py-2.5 px-3 w-48">TIPO DOCUMENTO</th>
                    <th className="py-2.5 px-3">DESCRIPCIÓN</th>
                    <th className="py-2.5 px-3 w-28 text-center">PROGRESO</th>
                    <th className="py-2.5 px-3 w-24 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredList.map((item) => {
                    const isNegativo = item.monto < 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3">
                          <input 
                            type="checkbox" 
                            checked={item.pagado}
                            onChange={() => togglePagadoObligacion(item.id, tipo)}
                            className="rounded border-slate-300 cursor-pointer"
                            title="Marcar como procesado"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button 
                            onClick={() => toggleDestacadoObligacion(item.id, tipo)}
                            className="text-slate-300 hover:text-amber-500 cursor-pointer"
                          >
                            <Star className={`w-3.5 h-3.5 ${item.destacado ? 'text-amber-400 fill-amber-400' : ''}`} />
                          </button>
                        </td>

                        {/* Monto with Briefcase icon */}
                        <td className="py-2.5 px-3 text-right font-mono font-tabular">
                          <div className="flex items-center justify-end gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className={`font-semibold ${isNegativo ? 'text-slate-800' : 'text-emerald-800'}`}>
                              {isNegativo ? `($${Math.abs(item.monto).toLocaleString('es-CL')})` : `$${item.monto.toLocaleString('es-CL')}`}
                            </span>
                          </div>
                        </td>

                        {/* Fecha */}
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600 font-tabular whitespace-nowrap">
                          {item.fecha}
                        </td>

                        {/* Tipo Documento */}
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono ${
                            item.tipoDocumento === 'DTE PENDIENTE POR APROBAR' 
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.tipoDocumento}
                          </span>
                        </td>

                        {/* Descripción */}
                        <td className="py-2.5 px-3 text-slate-800 font-sans max-w-md">
                          <p className="line-clamp-2 leading-relaxed">{item.descripcion}</p>
                        </td>

                        {/* Progreso bar */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="w-20 mx-auto bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full ${item.pagado ? 'bg-emerald-500' : 'bg-slate-400'}`} 
                              style={{ width: `${item.progreso}%` }}
                            ></div>
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-slate-400">
                            <button 
                              onClick={() => togglePagadoObligacion(item.id, tipo)}
                              className={`p-1 rounded hover:bg-slate-100 ${item.pagado ? 'text-emerald-600' : 'hover:text-slate-600'}`}
                              title={item.pagado ? "Completado" : "Pendiente"}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 rounded hover:bg-slate-100 hover:text-slate-600" title="Ver Documento">
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 rounded hover:bg-slate-100 hover:text-slate-600" title="Asociar a Centro de Costo">
                              <PieChart className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
};
