import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  Globe, 
  CheckSquare, 
  Bell, 
  UserPlus, 
  FileText, 
  Download, 
  ExternalLink, 
  Clock, 
  ShieldCheck,
  Eye,
  Settings,
  Mail
} from 'lucide-react';

export const ClientPortalModule: React.FC = () => {
  const { empresaActiva, dtes, addNotification } = useERP();

  // Checkboxes configuration for consulting firm
  const [enabledServices, setEnabledServices] = useState({
    f29: true,
    remuneraciones: true,
    contabilidad: true,
    rentaF22: true,
    cuentasCobrar: true,
  });

  // Client view toggle mode
  const [previewMode, setPreviewMode] = useState(false);

  // Invite user modal
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Administrador' | 'Solo Lectura'>('Solo Lectura');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [portalUsers, setPortalUsers] = useState([
    { id: 'u1', nombre: 'Christopher Velásquez', email: 'c.velasquez@aquavelasquez.cl', rol: 'Administrador', ultimoAcceso: 'Hoy 11:20 hrs', estado: 'Activo' },
    { id: 'u2', nombre: 'Andrea Soto (Finanzas)', email: 'finanzas@aquavelasquez.cl', rol: 'Solo Lectura', ultimoAcceso: 'Ayer 16:45 hrs', estado: 'Activo' },
  ]);

  const handleToggle = (key: keyof typeof enabledServices) => {
    setEnabledServices(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSendInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setPortalUsers(prev => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        nombre: inviteEmail.split('@')[0],
        email: inviteEmail,
        rol: inviteRole,
        ultimoAcceso: 'Invitación Pendiente',
        estado: 'Pendiente'
      }
    ]);

    setShowInviteModal(false);
    setInviteEmail('');
    addNotification({
      type: 'success',
      message: `Invitación de acceso al Portal de Clientes enviada a ${inviteEmail} con rol ${inviteRole}.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Portal del Cliente (Extranet de Servicios Contables)
          </h1>
          <p className="text-xs text-slate-500">
            Administración de accesos para el cliente final ({empresaActiva.nombreFantasia})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors shadow-xs ${
              previewMode 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-[#003366] hover:bg-[#0056B3] text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'Volver a Configuración de Consultor' : 'Ver como Cliente (Preview)'}</span>
          </button>
        </div>
      </div>

      {/* MODE 1: Client Preview (What the Client sees) */}
      {previewMode ? (
        <div className="bg-white border-2 border-dashed border-[#003366] rounded-xl p-6 shadow-sm space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs text-blue-900 flex items-center justify-between">
            <span className="font-semibold">
              Modo Previsualización: Estás navegando como el cliente {empresaActiva.razonSocial}
            </span>
            <span className="font-mono text-[11px] text-blue-700">portal.muerro.cl/{empresaActiva.rut}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {enabledServices.f29 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-xs font-bold text-[#003366] block">Impuestos Mensuales (F29)</span>
                <p className="text-xs text-slate-600">Declaración de Septiembre 2026 pagada. F29 de Octubre en preparación.</p>
                <button 
                  onClick={() => alert('Descargando F29 oficial SII timbrado...')} 
                  className="text-xs text-[#0056B3] font-semibold flex items-center gap-1 hover:underline"
                >
                  <Download className="w-3 h-3" /> Descargar F29 Folio #941052
                </button>
              </div>
            )}

            {enabledServices.remuneraciones && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-xs font-bold text-[#003366] block">Remuneraciones y Leyes Sociales</span>
                <p className="text-xs text-slate-600">Planilla Previred cancelada. Liquidaciones firmadas disponibles.</p>
                <button 
                  onClick={() => alert('Descargando comprobante de Previred...')}
                  className="text-xs text-[#0056B3] font-semibold flex items-center gap-1 hover:underline"
                >
                  <Download className="w-3 h-3" /> Certificado Previred
                </button>
              </div>
            )}

            {enabledServices.contabilidad && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-xs font-bold text-[#003366] block">Estados Financieros IFRS</span>
                <p className="text-xs text-slate-600">Balance clasificado y Estado de Resultados al 30 de Septiembre 2026.</p>
                <button 
                  onClick={() => alert('Descargando Balance Clasificado IFRS en PDF...')}
                  className="text-xs text-[#0056B3] font-semibold flex items-center gap-1 hover:underline"
                >
                  <Download className="w-3 h-3" /> Descargar Balance IFRS (PDF)
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* MODE 2: Consultant Configuration (Pantalla 8.1) */
        <div className="space-y-6">
          
          {/* Services Enabled Checkboxes (Pantalla 8.1) */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Servicios y Módulos Habilitados al Cliente
              </h3>
              <p className="text-xs text-slate-500">
                Seleccione las carpetas e informes que el cliente podrá visualizar y descargar desde su acceso
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={enabledServices.f29}
                  onChange={() => handleToggle('f29')}
                  className="mt-0.5 rounded border-slate-300 text-[#003366] h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Impuestos Mensuales — F29, PPM y retenciones
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Permite descargar el certificado de pago del F29 emitido por la Tesorería General de la República (TGR) y el SII.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={enabledServices.remuneraciones}
                  onChange={() => handleToggle('remuneraciones')}
                  className="mt-0.5 rounded border-slate-300 text-[#003366] h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Remuneraciones — Liquidaciones, contratos y certificados
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Acceso para entrega de liquidaciones firmadas y nómina de cotizaciones previsionales de los trabajadores.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={enabledServices.contabilidad}
                  onChange={() => handleToggle('contabilidad')}
                  className="mt-0.5 rounded border-slate-300 text-[#003366] h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Contabilidad — Estado de resultados y balances
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Visualización de Estados Financieros clasificados (NIC 1) para bancos y licitaciones.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={enabledServices.rentaF22}
                  onChange={() => handleToggle('rentaF22')}
                  className="mt-0.5 rounded border-slate-300 text-[#003366] h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Renta Anual — Declaración de renta F22
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Formulario 22 compactado, certificados de retiros de socios y registros empresariales SAC/RAP.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded cursor-pointer hover:bg-slate-100/70 transition-colors md:col-span-2">
                <input
                  type="checkbox"
                  checked={enabledServices.cuentasCobrar}
                  onChange={() => handleToggle('cuentasCobrar')}
                  className="mt-0.5 rounded border-slate-300 text-[#003366] h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Cuentas por Cobrar — Facturas pendientes de cobro a sus clientes
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Módulo interactivo de cobranza donde el cliente puede consultar qué facturas están impagas o vencidas.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Alertas de Vencimiento de Impuestos */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Notificaciones y Alertas Automáticas de Vencimiento al Cliente</span>
            </h3>
            <p className="text-xs text-slate-500">
              Notificaciones push y correos programados para evitar multas del SII y Dirección del Trabajo
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">1. Alerta Previred (Día 10 y 13)</span>
                  <span className="text-emerald-700 font-semibold">Activa</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Aviso automático 48 hrs antes del plazo legal para el pago electrónico de imposiciones (AFP, Fonasa, Isapre).
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">2. Alerta F29 SII (Día 18 y 20)</span>
                  <span className="text-emerald-700 font-semibold">Activa</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Recordatorio con el monto exacto determinado de IVA y PPM a transferir a la cuenta bancaria de la TGR.
                </p>
              </div>
            </div>
          </div>

          {/* Gestión de Usuarios del Cliente (Pantalla 8.1) */}
          <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Usuarios del Cliente y Permisos de Acceso
                </h3>
                <p className="text-xs text-slate-500">
                  Control de roles (Administrador / Solo Lectura)
                </p>
              </div>

              <button
                onClick={() => setShowInviteModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] rounded flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invitar Usuario</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Nombre</th>
                    <th className="py-2 px-3 font-semibold">Correo Electrónico</th>
                    <th className="py-2 px-3 font-semibold">Rol Asignado</th>
                    <th className="py-2 px-3 font-semibold">Último Acceso</th>
                    <th className="py-2 px-3 font-semibold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {portalUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-900">{u.nombre}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{u.email}</td>
                      <td className="py-2 px-3 text-slate-700 font-medium">{u.rol}</td>
                      <td className="py-2 px-3 font-tabular text-slate-500">{u.ultimoAcceso}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          u.estado === 'Activo' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {u.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL: Invitar Usuario */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Invitar Nuevo Usuario al Portal</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSendInvitation} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="ej. socio@empresa.cl"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rol de Acceso</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                >
                  <option value="Solo Lectura">Solo Lectura (Consultar F29 y Balances)</option>
                  <option value="Administrador">Administrador (Puede invitar y descargar nóminas)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#003366] hover:bg-[#0056B3] text-white rounded font-semibold shadow-xs"
                >
                  Enviar Invitación por Correo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
