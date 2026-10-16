import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { formatRut, validateRut } from '../../utils/rut';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthLogin: React.FC = () => {
  const { loginUser, empresaActiva } = useERP();
  const [rut, setRut] = useState('15.420.318-7');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rutIsValid, setRutIsValid] = useState(true);

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatRut(rawVal);
    setRut(formatted);
    if (formatted.length >= 8) {
      const isValid = validateRut(formatted);
      setRutIsValid(isValid);
      if (!isValid) {
        setErrorMsg('El RUT ingresado no es válido o su dígito verificador es incorrecto.');
      } else {
        setErrorMsg('');
      }
    } else {
      setErrorMsg('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRut(rut)) {
      setErrorMsg('Por favor ingrese un RUT chileno válido (ej. 15.420.318-7).');
      return;
    }
    loginUser(rut);
  };

  const handleQuickLogin = (demoRut: string) => {
    setRut(demoRut);
    setRutIsValid(true);
    setErrorMsg('');
    loginUser(demoRut);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg bg-[#003366] text-white flex items-center justify-center font-bold text-2xl tracking-wider shadow-md">
            M
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          MUERRO ERP Contable
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Plataforma de Contabilidad, Tributación SII, Remuneraciones DT y Gestión Empresarial
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-[#E0E0E0] sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* RUT Field */}
            <div>
              <label htmlFor="rut" className="block text-xs font-semibold text-slate-700">
                Código de usuario / RUT Chileno
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <input
                  id="rut"
                  name="rut"
                  type="text"
                  required
                  value={rut}
                  onChange={handleRutChange}
                  placeholder="12.345.678-5"
                  className={`block w-full rounded border px-3 py-2 text-xs font-mono placeholder-slate-400 focus:outline-none focus:ring-1 ${
                    errorMsg 
                      ? 'border-red-400 focus:ring-red-500 text-red-900' 
                      : 'border-slate-300 focus:ring-[#003366] focus:border-[#003366]'
                  }`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {rut.length >= 8 && (
                    rutIsValid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )
                  )}
                </div>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Formato con puntos y guión (ej. 15.420.318-7 o 76.845.120-K)
              </p>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Contraseña
                </label>
                <a href="#recuperar" onClick={(e) => { e.preventDefault(); alert('Se ha enviado un enlace de recuperación a su correo asociado.'); }} className="text-[11px] text-[#0056B3] hover:underline">
                  Última contraseña
                </a>
              </div>
              <div className="mt-1 relative rounded-md shadow-xs">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded border border-slate-300 px-3 py-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#003366] focus:border-[#003366] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded text-xs font-semibold text-white bg-[#003366] hover:bg-[#0056B3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] shadow-xs transition-colors"
              >
                Ingresar a la Plataforma
              </button>
            </div>
          </form>

          {/* Quick Demo Logins for Instant Evaluation */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider text-center">
              Acceso Rápido con Empresas Preconfiguradas
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('15.420.318-7')}
                className="w-full text-left px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-800 block">Christopher Velásquez EIRL</span>
                  <span className="text-[10px] text-slate-500 font-mono">Aqua Purificada · ProPyme 14 D3</span>
                </div>
                <span className="text-[11px] text-[#0056B3] font-medium">Entrar →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('11.834.902-5')}
                className="w-full text-left px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-800 block">Constructora Aconcagua Sur S.A.</span>
                  <span className="text-[10px] text-slate-500 font-mono">Obras & Partidas · Régimen 14 A</span>
                </div>
                <span className="text-[11px] text-[#0056B3] font-medium">Entrar →</span>
              </button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2 text-[11px] text-slate-500">
            <div>
              ¿No tienes cuenta?{' '}
              <a href="#crear" onClick={(e) => { e.preventDefault(); handleQuickLogin('16.789.012-4'); }} className="font-medium text-[#0056B3] hover:underline">
                Crea tu primera versión
              </a>
            </div>
            <div className="flex justify-center gap-3 text-slate-400">
              <a href="#terminos" onClick={(e) => { e.preventDefault(); alert('Términos del Servicio de MUERRO / Tributa Educa adaptados a la ley chilena.'); }} className="hover:underline">
                Términos del Servicio
              </a>
              <span>·</span>
              <a href="#privacidad" onClick={(e) => { e.preventDefault(); alert('Política de Privacidad y custodia de datos tributarios cifrados.'); }} className="hover:underline">
                Política de Privacidad
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
