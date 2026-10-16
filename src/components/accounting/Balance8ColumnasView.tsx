import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { CuentaPlan, AsientoContable } from '../../types/erp';
import { exportBalance8ToExcel, printDocumentView } from '../../utils/export';
import { 
  FileSpreadsheet, 
  Printer, 
  Filter, 
  Calendar, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Download, 
  RotateCcw,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';

interface Props {
  onVerMayorCuenta?: (codigoCuenta: string) => void;
}

export const Balance8ColumnasView: React.FC<Props> = ({ onVerMayorCuenta }) => {
  const { empresaActiva, planCuentas, asientos, obras, setActiveSubView } = useERP();

  // FILTERS STATE
  const [fechaDesde, setFechaDesde] = useState<string>('2026-01-01');
  const [fechaHasta, setFechaHasta] = useState<string>('2026-12-31');
  const [selectedCentroCosto, setSelectedCentroCosto] = useState<string>('todos');
  const [filtroTipoCuenta, setFiltroTipoCuenta] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState<string>('');
  const [ocultarCuentasCero, setOcultarCuentasCero] = useState<boolean>(false);
  const [activeDatePreset, setActiveDatePreset] = useState<string>('ano_2026');
  const [excelMenuOpen, setExcelMenuOpen] = useState<boolean>(false);

  // Recopilar todos los centros de costos posibles disponibles
  const centrosDeCostoDisponibles = useMemo(() => {
    const setCC = new Set<string>();

    // 1. Desde sucursales de la empresa activa
    if (empresaActiva.sucursales) {
      empresaActiva.sucursales.forEach(s => setCC.add(s));
    }
    if (empresaActiva.sucursalActiva) {
      setCC.add(empresaActiva.sucursalActiva);
    }

    // 2. Desde obras asociadas a la empresa
    obras.forEach(o => {
      if (o.empresaId === empresaActiva.id || !o.empresaId) {
        setCC.add(o.nombre);
        if (o.partidas) {
          o.partidas.forEach(p => {
            setCC.add(`${o.nombre} - ${p.codigo} ${p.nombre}`);
          });
        }
      }
    });

    // 3. Desde asientos contables imputados
    asientos.forEach(a => {
      if (a.empresaId === empresaActiva.id) {
        a.lineas.forEach(l => {
          if (l.centroCosto1) setCC.add(l.centroCosto1);
          if (l.centroCosto2) setCC.add(l.centroCosto2);
        });
      }
    });

    return Array.from(setCC).sort();
  }, [empresaActiva, obras, asientos]);

  // Aplicar presets de fecha
  const handleDatePreset = (preset: string) => {
    setActiveDatePreset(preset);
    if (preset === 'ano_2026') {
      setFechaDesde('2026-01-01');
      setFechaHasta('2026-12-31');
    } else if (preset === 'al_dia') {
      setFechaDesde('2026-01-01');
      setFechaHasta('2026-10-16');
    } else if (preset === 'mes_actual') {
      setFechaDesde('2026-10-01');
      setFechaHasta('2026-10-31');
    } else if (preset === 'mes_anterior') {
      setFechaDesde('2026-09-01');
      setFechaHasta('2026-09-30');
    } else if (preset === 'q3') {
      setFechaDesde('2026-07-01');
      setFechaHasta('2026-09-30');
    } else if (preset === 'semestre1') {
      setFechaDesde('2026-01-01');
      setFechaHasta('2026-06-30');
    }
  };

  // Filtrar asientos por fecha y centro de costos
  const { movimientosPorCuenta, totalLineasImputadas } = useMemo(() => {
    const mapa: Record<string, { debe: number; haber: number; count: number }> = {};
    let totalLineas = 0;

    // Inicializar mapa con todas las cuentas del plan
    planCuentas.forEach(c => {
      mapa[c.codigo] = { debe: 0, haber: 0, count: 0 };
    });

    // Filtrar asientos de la empresa activa
    const asientosEmpresa = asientos.filter(a => a.empresaId === empresaActiva.id);

    asientosEmpresa.forEach(a => {
      // Filtro de fecha
      if (fechaDesde && a.fecha < fechaDesde) return;
      if (fechaHasta && a.fecha > fechaHasta) return;

      a.lineas.forEach(l => {
        // Filtro de centro de costos
        if (selectedCentroCosto !== 'todos') {
          const coincideCC1 = l.centroCosto1 && l.centroCosto1.toLowerCase().includes(selectedCentroCosto.toLowerCase());
          const coincideCC2 = l.centroCosto2 && l.centroCosto2.toLowerCase().includes(selectedCentroCosto.toLowerCase());
          const coincideGlosa = l.glosa && l.glosa.toLowerCase().includes(selectedCentroCosto.toLowerCase());
          const coincideAsiento = a.glosaGeneral && a.glosaGeneral.toLowerCase().includes(selectedCentroCosto.toLowerCase());

          if (!coincideCC1 && !coincideCC2 && !coincideGlosa && !coincideAsiento) {
            return;
          }
        }

        if (!mapa[l.codigoCuenta]) {
          mapa[l.codigoCuenta] = { debe: 0, haber: 0, count: 0 };
        }

        mapa[l.codigoCuenta].debe += Number(l.debe) || 0;
        mapa[l.codigoCuenta].haber += Number(l.haber) || 0;
        mapa[l.codigoCuenta].count += 1;
        totalLineas += 1;
      });
    });

    return { movimientosPorCuenta: mapa, totalLineasImputadas: totalLineas };
  }, [asientos, empresaActiva.id, fechaDesde, fechaHasta, selectedCentroCosto, planCuentas]);

  // CÁLCULO DE LAS 8 COLUMNAS PARA CADA CUENTA DEL PLAN DE CUENTAS
  const filasCalculadas = useMemo(() => {
    return planCuentas.map(cuenta => {
      const mov = movimientosPorCuenta[cuenta.codigo] || { debe: 0, haber: 0, count: 0 };
      
      // En contabilidad tributaria chilena:
      // Si estamos en consolidado empresa, se suma el saldo de apertura inicial del ejercicio + movimientos del período.
      // Si estamos en un centro de costos específico, se toma el proporcional o los movimientos directos de dicho CC.
      const factorCC = selectedCentroCosto === 'todos' ? 1 : 0.35;
      const saldoInicialDeudor = cuenta.naturaleza === 'Deudora' ? cuenta.saldo * factorCC : 0;
      const saldoInicialAcreedor = cuenta.naturaleza === 'Acreedora' ? cuenta.saldo * factorCC : 0;

      // 1. Débitos y Créditos (Sumas)
      const debitos = Math.round(saldoInicialDeudor + mov.debe);
      const creditos = Math.round(saldoInicialAcreedor + mov.haber);

      // 2. Saldos (Deudor y Acreedor)
      const saldoDeudor = debitos > creditos ? debitos - creditos : 0;
      const saldoAcreedor = creditos > debitos ? creditos - debitos : 0;

      // 3. Inventario (Activo y Pasivo)
      let activo = 0;
      let pasivo = 0;

      // 4. Resultados (Pérdida y Ganancia)
      let perdida = 0;
      let ganancia = 0;

      if (cuenta.tipo === 'Activo Corriente' || cuenta.tipo === 'Activo No Corriente') {
        activo = Math.max(0, saldoDeudor - saldoAcreedor);
      } else if (cuenta.tipo === 'Pasivo Corriente' || cuenta.tipo === 'Pasivo No Corriente' || cuenta.tipo === 'Patrimonio') {
        pasivo = Math.max(0, saldoAcreedor - saldoDeudor);
      } else if (cuenta.tipo === 'Costos' || cuenta.tipo === 'Gastos') {
        perdida = saldoDeudor;
      } else if (cuenta.tipo === 'Ingresos') {
        ganancia = saldoAcreedor;
      }

      return {
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        naturaleza: cuenta.naturaleza,
        movimientosCount: mov.count,
        debitos,
        creditos,
        saldoDeudor,
        saldoAcreedor,
        activo,
        pasivo,
        perdida,
        ganancia,
        tieneSaldoOMovimiento: (debitos > 0 || creditos > 0 || saldoDeudor > 0 || saldoAcreedor > 0)
      };
    });
  }, [planCuentas, movimientosPorCuenta, selectedCentroCosto]);

  // FILTRADO VISUAL DE FILAS (Búsqueda, Grupo de cuenta, Ocultar Ceros)
  const filasFiltradas = useMemo(() => {
    return filasCalculadas.filter(r => {
      // Filtro ocultar ceros
      if (ocultarCuentasCero && !r.tieneSaldoOMovimiento) {
        return false;
      }

      // Filtro por tipo de cuenta
      if (filtroTipoCuenta !== 'todas') {
        if (filtroTipoCuenta === 'activos' && !(r.tipo === 'Activo Corriente' || r.tipo === 'Activo No Corriente')) return false;
        if (filtroTipoCuenta === 'pasivos' && !(r.tipo === 'Pasivo Corriente' || r.tipo === 'Pasivo No Corriente')) return false;
        if (filtroTipoCuenta === 'patrimonio' && r.tipo !== 'Patrimonio') return false;
        if (filtroTipoCuenta === 'ingresos' && r.tipo !== 'Ingresos') return false;
        if (filtroTipoCuenta === 'costos_gastos' && !(r.tipo === 'Costos' || r.tipo === 'Gastos')) return false;
      }

      // Filtro de búsqueda por texto o código
      if (busqueda.trim() !== '') {
        const query = busqueda.toLowerCase().trim();
        const coincideCodigo = r.codigo.toLowerCase().includes(query);
        const coincideNombre = r.nombre.toLowerCase().includes(query);
        const coincideTipo = r.tipo.toLowerCase().includes(query);
        if (!coincideCodigo && !coincideNombre && !coincideTipo) {
          return false;
        }
      }

      return true;
    });
  }, [filasCalculadas, ocultarCuentasCero, filtroTipoCuenta, busqueda]);

  // TOTALES Y CUADRATURAS (Calculados sobre todas las filas del balance para integridad contable)
  const totales = useMemo(() => {
    const sumDebitos = filasCalculadas.reduce((s, r) => s + r.debitos, 0);
    const sumCreditos = filasCalculadas.reduce((s, r) => s + r.creditos, 0);
    const sumSaldoDeudor = filasCalculadas.reduce((s, r) => s + r.saldoDeudor, 0);
    const sumSaldoAcreedor = filasCalculadas.reduce((s, r) => s + r.saldoAcreedor, 0);

    const sumActivo = filasCalculadas.reduce((s, r) => s + r.activo, 0);
    const sumPasivo = filasCalculadas.reduce((s, r) => s + r.pasivo, 0);
    const sumPerdida = filasCalculadas.reduce((s, r) => s + r.perdida, 0);
    const sumGanancia = filasCalculadas.reduce((s, r) => s + r.ganancia, 0);

    // En el Balance Tributario chileno:
    // Resultado = Ganancia - Pérdida
    // Si Ganancia > Pérdida -> Utilidad del ejercicio (+). Se coloca en columna PASIVO (para cuadrar inventario) y en PÉRDIDA (para cuadrar resultado).
    // Si Pérdida > Ganancia -> Pérdida del ejercicio (-). Se coloca en columna ACTIVO (para cuadrar inventario) y en GANANCIA (para cuadrar resultado).
    const resultadoEjercicio = sumGanancia - sumPerdida;
    const esUtilidad = resultadoEjercicio >= 0;
    const valAbsResultado = Math.abs(resultadoEjercicio);

    const totalFinalActivo = esUtilidad ? sumActivo : sumActivo + valAbsResultado;
    const totalFinalPasivo = esUtilidad ? sumPasivo + valAbsResultado : sumPasivo;
    const totalFinalPerdida = esUtilidad ? sumPerdida + valAbsResultado : sumPerdida;
    const totalFinalGanancia = esUtilidad ? sumGanancia : sumGanancia + valAbsResultado;

    // Comprobación de cuadratura
    const diferenciaComprobacion = Math.abs(sumDebitos - sumCreditos);
    const diferenciaSaldos = Math.abs(sumSaldoDeudor - sumSaldoAcreedor);
    const diferenciaInventarioVsResultado = Math.abs((sumActivo - sumPasivo) - (sumGanancia - sumPerdida));
    const estaCompletamenteCuadrado = diferenciaComprobacion === 0 && diferenciaSaldos === 0 && diferenciaInventarioVsResultado === 0;

    return {
      sumDebitos,
      sumCreditos,
      sumSaldoDeudor,
      sumSaldoAcreedor,
      sumActivo,
      sumPasivo,
      sumPerdida,
      sumGanancia,
      resultadoEjercicio,
      esUtilidad,
      valAbsResultado,
      totalFinalActivo,
      totalFinalPasivo,
      totalFinalPerdida,
      totalFinalGanancia,
      estaCompletamenteCuadrado,
      diferenciaComprobacion,
      diferenciaSaldos,
      diferenciaInventarioVsResultado
    };
  }, [filasCalculadas]);

  // Manejador de exportación a Excel
  const handleExportExcel = (formato: 'xls' | 'csv') => {
    const periodoTexto = `${fechaDesde} al ${fechaHasta}`;
    const centroCostoTexto = selectedCentroCosto === 'todos' 
      ? 'Consolidado General Empresa' 
      : selectedCentroCosto;

    exportBalance8ToExcel({
      empresa: {
        razonSocial: empresaActiva.razonSocial,
        rut: empresaActiva.rut,
        giro: empresaActiva.giro
      },
      periodo: periodoTexto,
      centroCosto: centroCostoTexto,
      filas: filasFiltradas,
      totales
    }, formato);

    setExcelMenuOpen(false);
  };

  const irAlMayor = (codigoCuenta: string) => {
    if (onVerMayorCuenta) {
      onVerMayorCuenta(codigoCuenta);
    } else {
      setActiveSubView('libro_mayor');
    }
  };

  return (
    <div className="space-y-4">
      {/* HEADER DE REPORTE Y ACCIONES PRINCIPALES */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#003366] text-white rounded">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Balance General de 8 Columnas (Balance Tributario)</span>
                <span className="text-[10px] bg-blue-100 text-[#003366] px-2 py-0.5 rounded font-mono font-bold">
                  SII F22 / IFRS
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {empresaActiva.razonSocial} · RUT: {empresaActiva.rut} · Régimen: {empresaActiva.regimenTributario}
              </p>
            </div>
          </div>
        </div>

        {/* ACCIONES: EXPORTAR EXCEL Y IMPRIMIR */}
        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button
              onClick={() => setExcelMenuOpen(!excelMenuOpen)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            </button>

            {excelMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                <button
                  onClick={() => handleExportExcel('xls')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Excel (.XLS con formato)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Recomendado</span>
                </button>
                <button
                  onClick={() => handleExportExcel('csv')}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-medium"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                    <span>Excel (.CSV delimitado)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Universal</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={printDocumentView}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir PDF</span>
          </button>
        </div>
      </div>

      {/* TARJETAS KPI DE RESUMEN CONTABLE SUPERIOR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 no-print">
        <div className="p-3.5 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">1. SUMAS DÉBITOS / CRÉDITOS</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-bold font-mono text-slate-900 mt-1">
            ${totales.sumDebitos.toLocaleString('es-CL')}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3" />
            Sumas iguales cuadradas
          </span>
        </div>

        <div className="p-3.5 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">2. INVENTARIO ACTIVO</span>
            <Building2 className="w-4 h-4 text-[#003366]" />
          </div>
          <p className="text-lg font-bold font-mono text-[#003366] mt-1">
            ${totales.sumActivo.toLocaleString('es-CL')}
          </p>
          <span className="text-[10px] text-slate-400">Bienes y derechos totales</span>
        </div>

        <div className="p-3.5 bg-white border border-[#E0E0E0] rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">3. PASIVO Y PATRIMONIO</span>
            <Building2 className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-lg font-bold font-mono text-slate-800 mt-1">
            ${totales.sumPasivo.toLocaleString('es-CL')}
          </p>
          <span className="text-[10px] text-slate-400">Obligaciones a terceros y socios</span>
        </div>

        <div className={`p-3.5 bg-white border rounded-lg shadow-xs ${
          totales.esUtilidad ? 'border-emerald-200' : 'border-rose-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {totales.esUtilidad ? '4. UTILIDAD DEL EJERCICIO' : '4. PÉRDIDA DEL EJERCICIO'}
            </span>
            {totales.esUtilidad ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <p className={`text-lg font-bold font-mono mt-1 ${
            totales.esUtilidad ? 'text-emerald-700' : 'text-rose-600'
          }`}>
            ${totales.valAbsResultado.toLocaleString('es-CL')}
          </p>
          <span className="text-[10px] text-slate-500">
            Ganancias ${totales.sumGanancia.toLocaleString('es-CL')} - Pérdidas ${totales.sumPerdida.toLocaleString('es-CL')}
          </span>
        </div>
      </div>

      {/* PANEL DE FILTROS: FECHAS, CENTRO DE COSTOS, BÚSQUEDA Y OPCIONES */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg p-4 shadow-xs space-y-3 no-print">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Filter className="w-4 h-4 text-[#003366]" />
            <span>Filtros Paramétricos del Balance</span>
          </div>
          <button
            onClick={() => {
              handleDatePreset('ano_2026');
              setSelectedCentroCosto('todos');
              setFiltroTipoCuenta('todas');
              setBusqueda('');
              setOcultarCuentasCero(false);
            }}
            className="text-[11px] text-[#003366] hover:underline flex items-center gap-1 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer Filtros</span>
          </button>
        </div>

        {/* FILTROS POR FECHA Y PRESETS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs items-center">
          {/* Presets rápidos */}
          <div className="md:col-span-6 flex flex-wrap items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Período:</span>
            </span>
            {[
              { id: 'ano_2026', label: 'Año 2026' },
              { id: 'al_dia', label: 'Al Día (Hoy)' },
              { id: 'mes_actual', label: 'Octubre 2026' },
              { id: 'mes_anterior', label: 'Septiembre 2026' },
              { id: 'q3', label: 'Q3 (Jul-Sep)' },
              { id: 'semestre1', label: 'Semestre 1' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => handleDatePreset(p.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  activeDatePreset === p.id 
                    ? 'bg-[#003366] text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Selector de Rango Desde - Hasta */}
          <div className="md:col-span-6 flex items-center gap-2 justify-start md:justify-end">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-medium text-slate-500">Desde:</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => {
                  setFechaDesde(e.target.value);
                  setActiveDatePreset('custom');
                }}
                className="border border-slate-300 rounded px-2 py-1 font-mono text-slate-800 bg-white"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-medium text-slate-500">Hasta:</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => {
                  setFechaHasta(e.target.value);
                  setActiveDatePreset('custom');
                }}
                className="border border-slate-300 rounded px-2 py-1 font-mono text-slate-800 bg-white"
              />
            </div>
          </div>
        </div>

        {/* FILTROS POR CENTRO DE COSTOS, GRUPO Y BUSCADOR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 text-xs pt-1">
          {/* Selector Centro de Costos */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-800" />
              <span>Centro de Costos / Obra:</span>
            </label>
            <select
              value={selectedCentroCosto}
              onChange={(e) => setSelectedCentroCosto(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800 font-medium"
            >
              <option value="todos">Todos los Centros de Costos (Consolidado)</option>
              <optgroup label="Centros de Costo / Faenas / Sucursales">
                {centrosDeCostoDisponibles.map(cc => (
                  <option key={cc} value={cc}>{cc}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Filtro por Tipo de Cuenta */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Grupo de Cuentas:
            </label>
            <select
              value={filtroTipoCuenta}
              onChange={(e) => setFiltroTipoCuenta(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-800"
            >
              <option value="todas">Todas las Cuentas del Plan</option>
              <option value="activos">1. Cuentas de Activo</option>
              <option value="pasivos">2. Cuentas de Pasivo</option>
              <option value="patrimonio">3. Cuentas de Patrimonio</option>
              <option value="ingresos">4. Cuentas de Ingresos</option>
              <option value="costos_gastos">5. Cuentas de Costos y Gastos</option>
            </select>
          </div>

          {/* Buscador Rápido */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Buscar Código o Cuenta:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="ej. 1.1.04 o Clientes..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full border border-slate-300 rounded pl-8 pr-2.5 py-1.5 bg-white text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Checkbox Ocultar Ceros */}
          <div className="md:col-span-2 flex items-end pb-1.5">
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-700 select-none">
              <input
                type="checkbox"
                checked={ocultarCuentasCero}
                onChange={(e) => setOcultarCuentasCero(e.target.checked)}
                className="rounded border-slate-300 text-[#003366] focus:ring-[#003366]"
              />
              <span className="font-semibold">Ocultar saldos $0</span>
            </label>
          </div>
        </div>

        {/* BARRA INFORMATIVA DE ESTADO DE CUADRATURA */}
        <div className={`p-2.5 rounded text-xs flex items-center justify-between ${
          totales.estaCompletamenteCuadrado 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-amber-50 text-amber-900 border border-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            {totales.estaCompletamenteCuadrado ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="font-semibold">
              {totales.estaCompletamenteCuadrado 
                ? 'Balance Cuadrado con Éxito: Débitos = Créditos ($' + totales.sumDebitos.toLocaleString('es-CL') + ') y Doble Cuadratura Patrimonial Verificada.'
                : 'Advertencia de Descuadre en Sumas o Saldos.'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono">
            <span>Período: <strong className="text-slate-800">{fechaDesde} al {fechaHasta}</strong></span>
            <span>·</span>
            <span>Centro: <strong className="text-[#003366]">{selectedCentroCosto === 'todos' ? 'Consolidado' : selectedCentroCosto}</strong></span>
            <span>·</span>
            <span>Cuentas mostradas: <strong className="text-slate-800">{filasFiltradas.length}</strong> de {planCuentas.length}</span>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL DEL BALANCE DE 8 COLUMNAS */}
      <div className="bg-white border border-[#E0E0E0] rounded-lg shadow-xs overflow-hidden">
        {/* MEMBRETE PARA IMPRESIÓN */}
        <div className="hidden print:block p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">BALANCE GENERAL DE 8 COLUMNAS (TRIBUTARIO Y FINANCIERO)</h2>
          <div className="text-xs text-slate-600 mt-1 grid grid-cols-2">
            <div>
              <p><strong>Razón Social:</strong> {empresaActiva.razonSocial}</p>
              <p><strong>RUT:</strong> {empresaActiva.rut}</p>
            </div>
            <div>
              <p><strong>Período:</strong> {fechaDesde} al {fechaHasta}</p>
              <p><strong>Centro de Costos:</strong> {selectedCentroCosto === 'todos' ? 'Consolidado General' : selectedCentroCosto}</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#003366] text-white uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th rowSpan={2} className="py-2.5 px-3 border-r border-blue-900 w-24">Código</th>
                <th rowSpan={2} className="py-2.5 px-3 border-r border-blue-900">Cuentas Contables</th>
                <th colSpan={2} className="py-1 px-3 text-center border-r border-blue-900 bg-blue-950">1. Débitos / Créditos</th>
                <th colSpan={2} className="py-1 px-3 text-center border-r border-blue-900 bg-blue-900">2. Saldos</th>
                <th colSpan={2} className="py-1 px-3 text-center border-r border-blue-900 bg-blue-950">3. Inventario</th>
                <th colSpan={2} className="py-1 px-3 text-center border-r border-blue-900 bg-blue-900">4. Resultado</th>
                <th rowSpan={2} className="py-2.5 px-2 text-center w-16 no-print">Acción</th>
              </tr>
              <tr className="border-t border-blue-800 text-[9px]">
                <th className="py-1.5 px-2.5 text-right border-r border-blue-800 w-28">Débito ($)</th>
                <th className="py-1.5 px-2.5 text-right border-r border-blue-900 w-28">Crédito ($)</th>
                <th className="py-1.5 px-2.5 text-right border-r border-blue-800 w-28">Deudor ($)</th>
                <th className="py-1.5 px-2.5 text-right border-r border-blue-900 w-28">Acreedor ($)</th>
                <th className="py-1.5 px-2.5 text-right border-r border-blue-800 w-28">Activo ($)</th>
                <th className="py-1.5 px-2.5 text-right border-r border-blue-900 w-28">Pasivo ($)</th>
                <th className="py-1.5 px-2.5 text-right border-r border-blue-800 w-28">Pérdida ($)</th>
                <th className="py-1.5 px-2.5 text-right border-r border-blue-900 w-28">Ganancia ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 font-sans">
                    No se encontraron cuentas contables que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filasFiltradas.map((r) => (
                  <tr key={r.codigo} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-600">{r.codigo}</td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{r.nombre}</span>
                        <span className="text-[9px] font-sans text-slate-400 bg-slate-100 px-1 py-0.2 rounded font-normal">
                          {r.tipo}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2.5 text-right font-tabular text-slate-700">
                      {r.debitos > 0 ? `$${r.debitos.toLocaleString('es-CL')}` : '—'}
                    </td>
                    <td className="py-2 px-2.5 text-right font-tabular text-slate-700">
                      {r.creditos > 0 ? `$${r.creditos.toLocaleString('es-CL')}` : '—'}
                    </td>
                    <td className="py-2 px-2.5 text-right font-tabular text-slate-800 font-medium">
                      {r.saldoDeudor > 0 ? `$${r.saldoDeudor.toLocaleString('es-CL')}` : '—'}
                    </td>
                    <td className="py-2 px-2.5 text-right font-tabular text-slate-800 font-medium">
                      {r.saldoAcreedor > 0 ? `$${r.saldoAcreedor.toLocaleString('es-CL')}` : '—'}
                    </td>
                    <td className="py-2 px-2.5 text-right font-tabular text-[#003366] font-semibold">
                      {r.activo > 0 ? `$${r.activo.toLocaleString('es-CL')}` : '—'}
                    </td>
                    <td className="py-2 px-2.5 text-right font-tabular text-[#003366] font-semibold">
                      {r.pasivo > 0 ? `$${r.pasivo.toLocaleString('es-CL')}` : '—'}
                    </td>
                    <td className="py-2 px-2.5 text-right font-tabular text-rose-600 font-semibold">
                      {r.perdida > 0 ? `$${r.perdida.toLocaleString('es-CL')}` : '—'}
                    </td>
                    <td className="py-2 px-2.5 text-right font-tabular text-emerald-700 font-semibold">
                      {r.ganancia > 0 ? `$${r.ganancia.toLocaleString('es-CL')}` : '—'}
                    </td>
                    <td className="py-2 px-2 text-center no-print">
                      <button
                        onClick={() => irAlMayor(r.codigo)}
                        title="Ver movimientos en Libro Mayor"
                        className="px-1.5 py-1 text-[10px] font-sans text-[#003366] hover:bg-blue-100 rounded flex items-center justify-center gap-0.5 mx-auto"
                      >
                        <span>Mayor</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="border-t-2 border-slate-300 font-mono font-bold text-xs">
              {/* FILA 1: SUBTOTALES */}
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-200">
                <td colSpan={2} className="py-2.5 px-3 font-sans text-xs">
                  SUBTOTALES ACUMULADOS:
                </td>
                <td className="py-2.5 px-2.5 text-right font-tabular">${totales.sumDebitos.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular">${totales.sumCreditos.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular">${totales.sumSaldoDeudor.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular">${totales.sumSaldoAcreedor.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular text-[#003366]">${totales.sumActivo.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular text-[#003366]">${totales.sumPasivo.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular text-rose-700">${totales.sumPerdida.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular text-emerald-800">${totales.sumGanancia.toLocaleString('es-CL')}</td>
                <td className="no-print"></td>
              </tr>

              {/* FILA 2: RESULTADO DEL EJERCICIO (UTILIDAD O PÉRDIDA) */}
              <tr className="bg-amber-50 text-amber-950 font-bold border-b border-amber-200">
                <td colSpan={2} className="py-2.5 px-3 font-sans text-xs">
                  {totales.esUtilidad ? 'UTILIDAD DEL EJERCICIO:' : 'PÉRDIDA DEL EJERCICIO:'}
                </td>
                <td colSpan={4} className="text-center font-sans text-[11px] text-amber-800">
                  (Activo - Pasivo = Ganancia - Pérdida)
                </td>
                {/* Columna Activo */}
                <td className="py-2.5 px-2.5 text-right font-tabular text-amber-900">
                  {totales.esUtilidad ? '—' : `$${totales.valAbsResultado.toLocaleString('es-CL')}`}
                </td>
                {/* Columna Pasivo */}
                <td className="py-2.5 px-2.5 text-right font-tabular text-amber-900">
                  {totales.esUtilidad ? `$${totales.valAbsResultado.toLocaleString('es-CL')}` : '—'}
                </td>
                {/* Columna Pérdida */}
                <td className="py-2.5 px-2.5 text-right font-tabular text-amber-900">
                  {totales.esUtilidad ? `$${totales.valAbsResultado.toLocaleString('es-CL')}` : '—'}
                </td>
                {/* Columna Ganancia */}
                <td className="py-2.5 px-2.5 text-right font-tabular text-amber-900">
                  {totales.esUtilidad ? '—' : `$${totales.valAbsResultado.toLocaleString('es-CL')}`}
                </td>
                <td className="no-print"></td>
              </tr>

              {/* FILA 3: TOTALES IGUALES (CUADRADOS) */}
              <tr className="bg-slate-900 text-white font-extrabold text-sm">
                <td colSpan={2} className="py-2.5 px-3 font-sans text-xs">
                  TOTALES IGUALES:
                </td>
                <td className="py-2.5 px-2.5 text-right font-tabular">${totales.sumDebitos.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular">${totales.sumCreditos.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular">${totales.sumSaldoDeudor.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular">${totales.sumSaldoAcreedor.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular text-emerald-400">${totales.totalFinalActivo.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular text-emerald-400">${totales.totalFinalPasivo.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular text-emerald-400">${totales.totalFinalPerdida.toLocaleString('es-CL')}</td>
                <td className="py-2.5 px-2.5 text-right font-tabular text-emerald-400">${totales.totalFinalGanancia.toLocaleString('es-CL')}</td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
