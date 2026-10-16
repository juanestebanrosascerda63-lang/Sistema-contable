import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Key, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  DownloadCloud,
  Layers,
  Database
} from 'lucide-react';

export const SIISyncModule: React.FC = () => {
  const { 
    empresaActiva, 
    updateEmpresaSettings, 
    siiSyncing, 
    triggerSIISync, 
    auditLogs,
    dtes 
  } = useERP();

  const [selectedMes, setSelectedMes] = useState('10');
  const [selectedAno, setSelectedAno] = useState('2026');
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [certPassword, setCertPassword] = useState('');
  const [certFileUploaded, setCertFileUploaded] = useState(true);

  const meses = [
    { num: '01', nombre: 'Enero' },
    { num: '02', nombre: 'Febrero' },
    { num: '03', nombre: 'Marzo' },
    { num: '04', nombre: 'Abril' },
    { num: '05', nombre: 'Mayo' },
    { num: '06', nombre: 'Junio' },
    { num: '07', nombre: 'Julio' },
    { num: '08', nombre: 'Agosto' },
    { num: '09', nombre: 'Septiembre' },
    { num: '10', nombre: 'Octubre' },
    { num: '11', nombre: 'Noviembre' },
    { num: '12', nombre: 'Diciembre' },
  ];

  const anosHistorial = ['2026', '2025', '2024']; // 3 years of history

  const handleManualSync = () => {
    const periodo = `${selectedAno}-${selectedMes}`;
    triggerSIISync(periodo);
  };

  const handleToggleAutoSync = (checked: boolean) => {
    updateEmpresaSettings({ autoSinc6Horas: checked });
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmpresaSettings({ siiCertificadoEstado: 'Conectada' });
    setShowCredentialsModal(false);
  };

  const syncLogs = auditLogs.filter(l => l.modulo.includes('SII') || l.accion === 'Sincronización');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title & Introduction */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Integración Directa y Automática con el SII
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Sincronización periódica programada cada 6 horas del Registro de Compras y Ventas (RCV), DTEs emitidos y recibidos con hasta 3 años de historial.
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#003366]" />
            <h2 className="text-sm font-bold text-slate-900">
              Estado de Enlace con Servicios Web del SII
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded ${
              empresaActiva.siiCertificadoEstado === 'Conectada' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${empresaActiva.siiCertificadoEstado === 'Conectada' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              Conexión SII: {empresaActiva.siiCertificadoEstado}
            </span>
          </div>
        </div>

        {/* 4 Data Grid Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              RUT Configurado
            </span>
            <span className="text-sm font-mono font-bold text-slate-900 mt-1 block">
              {empresaActiva.rut}
            </span>
            <span className="text-[10px] text-slate-500 truncate block mt-0.5">
              {empresaActiva.razonSocial}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Última Sinc. Exitosa
            </span>
            <span className="text-sm font-mono font-bold text-slate-900 mt-1 block">
              {empresaActiva.siiUltimaSinc}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
              ✓ DTEs y RCV actualizados
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Ciclo Automático
            </span>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="autoSinc"
                checked={empresaActiva.autoSinc6Horas}
                onChange={(e) => handleToggleAutoSync(e.target.checked)}
                className="rounded border-slate-300 text-[#003366] focus:ring-[#003366] h-4 w-4"
              />
              <label htmlFor="autoSinc" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Cada 6 Horas
              </label>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              00:00, 06:00, 12:00, 18:00 hrs
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">
              Historial Tributario
            </span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">
              3 Años en Custodia
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Periodos 2024, 2025 y 2026
            </span>
          </div>
        </div>

        {/* Sync Controls Section */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">Período a consultar:</span>
            </div>

            <select
              value={selectedMes}
              onChange={(e) => setSelectedMes(e.target.value)}
              className="text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
            >
              {meses.map(m => (
                <option key={m.num} value={m.num}>{m.nombre}</option>
              ))}
            </select>

            <select
              value={selectedAno}
              onChange={(e) => setSelectedAno(e.target.value)}
              className="text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
            >
              {anosHistorial.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={siiSyncing}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${siiSyncing ? 'animate-spin' : ''}`} />
              <span>{siiSyncing ? 'Sincronizando con SII...' : 'Sincronizar'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCredentialsModal(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded transition-colors flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>Cambiar Credenciales / Certificado</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('¿Desea restablecer el contador mínimo de sincronización para forzar una descarga completa?')) {
                  triggerSIISync(`${selectedAno}-${selectedMes}`);
                }
              }}
              className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>Eliminar mín. sincronización</span>
            </button>
          </div>
        </div>

      </div>

      {/* Sync Status & 3 Years RCV History Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: DTEs in Current Period */}
        <div className="lg:col-span-2 bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                DTEs Sincronizados del Período ({selectedMes}/{selectedAno})
              </h3>
              <p className="text-xs text-slate-500">
                Documentos tributarios registrados en el RCV del SII para {empresaActiva.nombreFantasia}
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Total: {dtes.length} documentos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3 font-semibold">Tipo DTE</th>
                  <th className="py-2 px-3 font-semibold font-tabular">Folio</th>
                  <th className="py-2 px-3 font-semibold">Fecha</th>
                  <th className="py-2 px-3 font-semibold">RUT Contraparte</th>
                  <th className="py-2 px-3 font-semibold">Razón Social</th>
                  <th className="py-2 px-3 font-semibold text-right">Total ($)</th>
                  <th className="py-2 px-3 font-semibold text-center">Estado SII</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dtes.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 font-medium text-slate-800">
                      {d.tipo.split('-')[0].trim()}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">
                      {d.folio}
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-tabular">
                      {d.fechaEmision}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600">
                      {d.rutContraparte}
                    </td>
                    <td className="py-2 px-3 text-slate-700 truncate max-w-[180px]">
                      {d.razonSocialContraparte}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900 font-tabular">
                      ${d.montoTotal.toLocaleString('es-CL')}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        d.estadoSII === 'Aceptado por SII' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {d.estadoSII}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Sync Audit Trail */}
        <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Historial de Sincronizaciones</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Daemon 6h</span>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {syncLogs.length > 0 ? (
              syncLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                    <span>{log.timestamp}</span>
                    <span className="text-emerald-700 font-medium">{log.accion}</span>
                  </div>
                  <p className="text-slate-800 text-[11px] leading-relaxed">
                    {log.detalle}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Usuario: {log.usuario}</span>
                    <span className="font-mono">{log.ip}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                Sin registros previos de sincronización.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Change Credentials / Digital Certificate Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#003366]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Credenciales SII y Certificado Digital
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCredentialsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  RUT del Representante / Titular del Certificado
                </label>
                <input
                  type="text"
                  value={empresaActiva.representanteRut}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-2 font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Certificado Digital (.pfx / .p12)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                  <DownloadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="font-semibold text-slate-700">
                    Certificado_Digital_Christopher_Velasquez_2026.pfx
                  </p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">
                    ✓ Certificado vigente emitido por E-Sign / Acepta (Vence 2027-11-20)
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contraseña del Certificado Digital
                </label>
                <input
                  type="password"
                  value={certPassword}
                  onChange={(e) => setCertPassword(e.target.value)}
                  placeholder="Ingrese contraseña privada del certificado"
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clave Tributaria SII (Opcional para consultas manuales)
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCredentialsModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003366] hover:bg-[#0056B3] text-white rounded font-semibold shadow-xs"
                >
                  Guardar y Probar Conexión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
