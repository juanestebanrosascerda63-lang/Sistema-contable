import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { exportToCSV, printDocumentView } from '../../utils/export';
import { 
  Landmark, 
  Search, 
  Calendar, 
  Download, 
  Star, 
  CheckSquare, 
  AlertTriangle, 
  Trash2, 
  MessageSquare, 
  FileText, 
  PieChart, 
  Check, 
  Plus, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const BankingModule: React.FC = () => {
  const { 
    empresaActiva, 
    cuentasBancarias, 
    movimientosBancarios, 
    toggleConciliadoBancario, 
    toggleDestacadoBancario,
    setActiveRealm
  } = useERP();

  const [selectedCuentaId, setSelectedCuentaId] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaDesde, setFechaDesde] = useState('2026-01-01');
  const [fechaHasta, setFechaHasta] = useState('2026-10-31');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'cargos' | 'abonos' | 'pendientes'>('todos');

  // Filtered movements
  const filteredMovimientos = movimientosBancarios.filter(m => {
    if (selectedCuentaId !== 'todas' && m.cuentaBancariaId !== selectedCuentaId) return false;
    if (filtroTipo === 'cargos' && m.cargo >= 0) return false;
    if (filtroTipo === 'abonos' && m.abono <= 0) return false;
    if (filtroTipo === 'pendientes' && m.conciliado) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        m.descripcion.toLowerCase().includes(term) ||
        m.banco.toLowerCase().includes(term) ||
        m.fecha.includes(term)
      );
    }
    return true;
  });

  const totalCargos = movimientosBancarios.reduce((sum, m) => sum + Math.abs(m.cargo), 0);
  const totalAbonos = movimientosBancarios.reduce((sum, m) => sum + m.abono, 0);

  // Total balance matching screenshot
  const saldoDisponible = 2103149008;
  const saldoContable = 2103149008;

  const handleExportCSV = () => {
    const headers = ['Banco', 'Fecha', 'Descripción', 'Cargo ($)', 'Abono ($)', 'Progreso Conciliación (%)', 'Estado'];
    const rows = filteredMovimientos.map(m => [
      m.banco,
      m.fecha,
      m.descripcion,
      m.cargo < 0 ? Math.abs(m.cargo) : 0,
      m.abono > 0 ? m.abono : 0,
      `${m.progreso}%`,
      m.conciliado ? 'Conciliado' : 'Pendiente'
    ]);
    exportToCSV(`Cartola_Bancaria_${empresaActiva.rut}`, headers, rows);
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
        
        {/* Left Accounts Sidebar matching Image 6 */}
        <aside className="w-full lg:w-64 bg-[#EAF0F6] border-r border-[#D9E2EC] p-3 space-y-4 shrink-0 text-xs">
          <div className="flex items-center justify-between border-b border-slate-300 pb-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-rose-600" />
              Gestión Bancaria
            </span>
            <button 
              onClick={() => setSelectedCuentaId('todas')}
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${selectedCuentaId === 'todas' ? 'bg-[#003366] text-white' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Todas
            </button>
          </div>

          {/* Banco Santander */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-800 font-bold text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] font-black">S</span>
                <span>BANCO SANTANDER</span>
              </div>
              <Plus className="w-3 h-3 text-slate-500 cursor-pointer hover:text-slate-900" />
            </div>

            <div 
              onClick={() => setSelectedCuentaId('cta-santander-clp')}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                selectedCuentaId === 'cta-santander-clp' 
                  ? 'bg-white border-[#003366] shadow-xs' 
                  : 'bg-white/60 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1 rounded font-mono">CLP</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800">0-000-5080284-1</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                <span>Banco Santander</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Hace 1 min
                </span>
              </div>
            </div>

            <div 
              onClick={() => setSelectedCuentaId('cta-santander-eur')}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                selectedCuentaId === 'cta-santander-eur' 
                  ? 'bg-white border-[#003366] shadow-xs' 
                  : 'bg-white/60 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1 rounded font-mono">EUR</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800">0-051-0033634-2</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                <span>Banco Santander</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Hace 2 min
                </span>
              </div>
            </div>

            <div 
              onClick={() => setSelectedCuentaId('cta-santander-usd')}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                selectedCuentaId === 'cta-santander-usd' 
                  ? 'bg-white border-[#003366] shadow-xs' 
                  : 'bg-white/60 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1 rounded font-mono">USD</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800">0-051-0033633-4</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                <span>Banco Santander USD</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Hace 1 min
                </span>
              </div>
            </div>
          </div>

          {/* Banco Scotiabank */}
          <div className="space-y-1.5 pt-2 border-t border-slate-300">
            <div className="flex items-center justify-between text-slate-800 font-bold text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 bg-red-700 text-white rounded-full flex items-center justify-center text-[9px] font-black">S</span>
                <span>BANCO SCOTIABANK</span>
              </div>
              <Plus className="w-3 h-3 text-slate-500 cursor-pointer hover:text-slate-900" />
            </div>
            <div 
              onClick={() => setSelectedCuentaId('cta-scotiabank-clp')}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                selectedCuentaId === 'cta-scotiabank-clp' 
                  ? 'bg-white border-[#003366] shadow-xs' 
                  : 'bg-white/60 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1 rounded font-mono">CLP</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800">97-123450-8</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                <span>Scotiabank Azul</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Hace 15 min
                </span>
              </div>
            </div>
          </div>

          {/* Banco BCI */}
          <div className="space-y-1.5 pt-2 border-t border-slate-300">
            <div className="flex items-center justify-between text-slate-800 font-bold text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[9px] font-black">B</span>
                <span>BANCO BCI</span>
              </div>
              <Plus className="w-3 h-3 text-slate-500 cursor-pointer hover:text-slate-900" />
            </div>
            <div 
              onClick={() => setSelectedCuentaId('cta-bci-clp')}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                selectedCuentaId === 'cta-bci-clp' 
                  ? 'bg-white border-[#003366] shadow-xs' 
                  : 'bg-white/60 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1 rounded font-mono">CLP</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800">66078237</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                <span>Banco BCI</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Hace 1 h
                </span>
              </div>
            </div>
          </div>

          {/* Banco Manual */}
          <div className="space-y-1.5 pt-2 border-t border-slate-300">
            <div className="flex items-center justify-between text-slate-800 font-bold text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 bg-blue-700 text-white rounded-full flex items-center justify-center text-[9px] font-black">M</span>
                <span>BANCO MANUAL</span>
              </div>
              <Plus className="w-3 h-3 text-slate-500 cursor-pointer hover:text-slate-900" />
            </div>
            <div 
              onClick={() => setSelectedCuentaId('cta-chile-eur')}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                selectedCuentaId === 'cta-chile-eur' 
                  ? 'bg-white border-rose-500 shadow-xs' 
                  : 'bg-white/60 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1 rounded font-mono">EUR</span>
                <span className="font-mono text-[11px] font-semibold text-slate-800">111666059</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                <span>Banco Chile Euro</span>
                <span className="text-rose-600 font-medium">Inválida</span>
              </div>
            </div>
          </div>

        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 space-y-4 overflow-x-hidden">
          
          {/* Header Balance Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-[#E0E0E0] shadow-xs">
            <div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="font-bold text-slate-700 uppercase tracking-wide">
                  SALDO DISPONIBLE:
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ${saldoDisponible.toLocaleString('es-CL')}
                </span>
                <span className="text-slate-300">/</span>
                <span className="font-bold text-slate-700 uppercase tracking-wide">
                  SALDO CONTABLE:
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ${saldoContable.toLocaleString('es-CL')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-slate-700 font-medium flex items-center gap-1.5"
                title="Descargar Cartola CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
              <button
                onClick={printDocumentView}
                className="px-2.5 py-1.5 bg-[#003366] hover:bg-[#0056B3] text-white rounded font-medium shadow-xs flex items-center gap-1.5"
              >
                Imprimir
              </button>
            </div>
          </div>

          {/* Search, Date Range and Toolbar matching Image 6 */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-3 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar movimiento, contraparte, glosa o RUT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:border-[#003366] focus:outline-hidden"
                />
              </div>

              {/* Date range picker */}
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

            {/* Sub toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFiltroTipo('todos')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    filtroTipo === 'todos' ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Todos ({movimientosBancarios.length})
                </button>
                <button
                  onClick={() => setFiltroTipo('abonos')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    filtroTipo === 'abonos' ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Abonos
                </button>
                <button
                  onClick={() => setFiltroTipo('cargos')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    filtroTipo === 'cargos' ? 'bg-rose-100 text-rose-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cargos
                </button>
                <button
                  onClick={() => setFiltroTipo('pendientes')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    filtroTipo === 'pendientes' ? 'bg-amber-100 text-amber-800 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Por Conciliar
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
                <span>1 - {filteredMovimientos.length} de 3636</span>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-600"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <button className="p-1 hover:bg-slate-100 rounded text-slate-600"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>

          {/* Cartola Table matching Image 6 */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3 w-8">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </th>
                    <th className="py-2.5 px-2 w-8 text-center">★</th>
                    <th className="py-2.5 px-2 w-8 text-center">Banco</th>
                    <th className="py-2.5 px-3 text-right font-tabular w-32">CARGO ($)</th>
                    <th className="py-2.5 px-3 text-right font-tabular w-32">ABONO ($)</th>
                    <th className="py-2.5 px-3 w-28 text-center font-tabular">FECHA</th>
                    <th className="py-2.5 px-3">DESCRIPCIÓN</th>
                    <th className="py-2.5 px-3 w-24 text-center">PROGRESO</th>
                    <th className="py-2.5 px-3 w-24 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {filteredMovimientos.map((m) => {
                    const isSantander = m.banco.includes('SANTANDER');
                    const isBCI = m.banco.includes('BCI');
                    const isScotia = m.banco.includes('SCOTIA');

                    return (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3">
                          <input 
                            type="checkbox" 
                            checked={m.conciliado}
                            onChange={() => toggleConciliadoBancario(m.id)}
                            className="rounded border-slate-300 cursor-pointer"
                            title="Marcar como conciliado"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button 
                            onClick={() => toggleDestacadoBancario(m.id)}
                            className="text-slate-300 hover:text-amber-500 cursor-pointer"
                          >
                            <Star className={`w-3.5 h-3.5 ${m.destacado ? 'text-amber-400 fill-amber-400' : ''}`} />
                          </button>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {isSantander && (
                            <span className="w-4 h-4 bg-red-600 text-white rounded-full inline-flex items-center justify-center text-[9px] font-black" title="Santander">S</span>
                          )}
                          {isBCI && (
                            <span className="w-4 h-4 bg-emerald-600 text-white rounded-full inline-flex items-center justify-center text-[9px] font-black" title="BCI">B</span>
                          )}
                          {isScotia && (
                            <span className="w-4 h-4 bg-red-800 text-white rounded-full inline-flex items-center justify-center text-[9px] font-black" title="Scotiabank">S</span>
                          )}
                          {!isSantander && !isBCI && !isScotia && (
                            <span className="w-4 h-4 bg-blue-700 text-white rounded-full inline-flex items-center justify-center text-[9px] font-black" title="Manual">M</span>
                          )}
                        </td>
                        
                        {/* Cargo */}
                        <td className="py-2.5 px-3 text-right font-mono font-tabular">
                          {m.cargo < 0 ? (
                            <span className="text-slate-700 font-semibold">
                              (${Math.abs(m.cargo).toLocaleString('es-CL')})
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        {/* Abono */}
                        <td className="py-2.5 px-3 text-right font-mono font-tabular">
                          {m.abono > 0 ? (
                            <span className="text-emerald-700 font-bold">
                              ${m.abono.toLocaleString('es-CL')}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        {/* Fecha */}
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600 font-tabular whitespace-nowrap">
                          {m.fecha}
                        </td>

                        {/* Descripción */}
                        <td className="py-2.5 px-3 text-slate-800 font-sans max-w-md">
                          <p className="line-clamp-2 leading-relaxed">{m.descripcion}</p>
                        </td>

                        {/* Progreso bar */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="w-16 mx-auto bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full ${m.conciliado ? 'bg-emerald-500' : 'bg-slate-400'}`} 
                              style={{ width: `${m.progreso}%` }}
                            ></div>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 mt-0.5 block">{m.progreso}%</span>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-slate-400">
                            <button 
                              onClick={() => toggleConciliadoBancario(m.id)}
                              className={`p-1 rounded hover:bg-slate-100 ${m.conciliado ? 'text-emerald-600' : 'hover:text-slate-600'}`}
                              title={m.conciliado ? "Conciliado" : "Pendiente de conciliación"}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 rounded hover:bg-slate-100 hover:text-slate-600" title="Ver Documento">
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 rounded hover:bg-slate-100 hover:text-slate-600" title="Imputar a Flujo / Centro de Costo">
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
