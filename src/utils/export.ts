/**
 * Universal export utilities for CSV, Excel-compatible tables, and Print-to-PDF
 */

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  // Add UTF-8 BOM so Microsoft Excel correctly displays accents and Spanish characters
  const BOM = '\uFEFF';
  
  const csvContent = rows
    .map(row => 
      row
        .map(cell => {
          const stringCell = cell === null || cell === undefined ? '' : String(cell);
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (stringCell.includes(',') || stringCell.includes('"') || stringCell.includes('\n') || stringCell.includes(';')) {
            return `"${stringCell.replace(/"/g, '""')}"`;
          }
          return stringCell;
        })
        .join(';') // Semicolon is the Chilean and Latin American standard delimiter for Excel
    )
    .join('\r\n');

  const fullContent = BOM + headers.join(';') + '\r\n' + csvContent;
  const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\.csv$/, '')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printDocumentView() {
  window.print();
}

export interface Balance8ExportData {
  empresa: { razonSocial: string; rut: string; giro?: string };
  periodo: string;
  centroCosto: string;
  filas: Array<{
    codigo: string;
    nombre: string;
    tipo: string;
    debitos: number;
    creditos: number;
    saldoDeudor: number;
    saldoAcreedor: number;
    activo: number;
    pasivo: number;
    perdida: number;
    ganancia: number;
  }>;
  totales: {
    sumDebitos: number;
    sumCreditos: number;
    sumSaldoDeudor: number;
    sumSaldoAcreedor: number;
    sumActivo: number;
    sumPasivo: number;
    sumPerdida: number;
    sumGanancia: number;
    resultadoEjercicio: number;
    totalFinalActivo: number;
    totalFinalPasivo: number;
    totalFinalPerdida: number;
    totalFinalGanancia: number;
  };
}

export function exportBalance8ToExcel(data: Balance8ExportData, format: 'csv' | 'xls' = 'xls') {
  const { empresa, periodo, centroCosto, filas, totales } = data;
  const fechaGeneracion = new Date().toLocaleString('es-CL');
  const esUtilidad = totales.resultadoEjercicio >= 0;
  const labelResultado = esUtilidad ? 'UTILIDAD DEL EJERCICIO' : 'PÉRDIDA DEL EJERCICIO';
  const valResultado = Math.abs(totales.resultadoEjercicio);

  if (format === 'csv') {
    const BOM = '\uFEFF';
    const lines: string[] = [
      `"BALANCE GENERAL TRIBUTARIO Y FINANCIERO DE 8 COLUMNAS"`,
      `"Empresa:";"${empresa.razonSocial}";"RUT:";"${empresa.rut}"`,
      `"Giro:";"${empresa.giro || 'Actividades de Contabilidad y Gestión'}";"Moneda:";"Pesos Chilenos (CLP)"`,
      `"Período:";"${periodo}";"Centro de Costos:";"${centroCosto}"`,
      `"Fecha Emisión:";"${fechaGeneracion}";"Normativa:";"SII / IFRS / NIC 1"`,
      `""`,
      [
        'Código',
        'Cuentas Contables',
        'Tipo de Cuenta',
        '1. Débitos',
        '1. Créditos',
        '2. Saldo Deudor',
        '2. Saldo Acreedor',
        '3. Inventario Activo',
        '3. Inventario Pasivo',
        '4. Resultado Pérdida',
        '4. Resultado Ganancia'
      ].map(h => `"${h}"`).join(';'),
      ...filas.map(r => [
        `"${r.codigo}"`,
        `"${r.nombre.replace(/"/g, '""')}"`,
        `"${r.tipo}"`,
        r.debitos,
        r.creditos,
        r.saldoDeudor,
        r.saldoAcreedor,
        r.activo,
        r.pasivo,
        r.perdida,
        r.ganancia
      ].join(';')),
      `""`,
      [
        `"SUBTOTALES"`,
        `""`,
        `""`,
        totales.sumDebitos,
        totales.sumCreditos,
        totales.sumSaldoDeudor,
        totales.sumSaldoAcreedor,
        totales.sumActivo,
        totales.sumPasivo,
        totales.sumPerdida,
        totales.sumGanancia
      ].join(';'),
      [
        `"${labelResultado}"`,
        `"(Activo - Pasivo = Ganancia - Pérdida)"`,
        `""`,
        0,
        0,
        0,
        0,
        esUtilidad ? 0 : valResultado,
        esUtilidad ? valResultado : 0,
        esUtilidad ? valResultado : 0,
        esUtilidad ? 0 : valResultado
      ].join(';'),
      [
        `"TOTALES IGUALES"`,
        `""`,
        `""`,
        totales.sumDebitos,
        totales.sumCreditos,
        totales.sumSaldoDeudor,
        totales.sumSaldoAcreedor,
        totales.totalFinalActivo,
        totales.totalFinalPasivo,
        totales.totalFinalPerdida,
        totales.totalFinalGanancia
      ].join(';')
    ];

    const content = BOM + lines.join('\r\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Balance_8_Columnas_${empresa.rut}_${periodo.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  // Format: Native HTML Spreadsheet for Excel (.xls)
  const template = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Balance 8 Columnas</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
          .header-title { font-size: 16pt; font-weight: bold; color: #003366; }
          .meta-label { font-weight: bold; color: #475569; }
          .meta-value { color: #0f172a; }
          th { background-color: #003366; color: #ffffff; font-weight: bold; border: 1px solid #002244; text-align: center; }
          th.subhead { background-color: #0f4c81; font-size: 9pt; }
          td { border: 1px solid #cbd5e1; padding: 4px; vertical-align: middle; }
          .num { text-align: right; mso-number-format:"\\$#,##0"; }
          .code { font-family: Consolas, monospace; text-align: left; }
          .total-sub { background-color: #f1f5f9; font-weight: bold; }
          .total-result { background-color: #fef3c7; font-weight: bold; color: #78350f; }
          .total-equal { background-color: #0f172a; color: #ffffff; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="11" class="header-title">BALANCE GENERAL TRIBUTARIO Y FINANCIERO DE 8 COLUMNAS</td>
          </tr>
          <tr>
            <td colspan="2" class="meta-label">Razón Social:</td>
            <td colspan="4" class="meta-value">${empresa.razonSocial}</td>
            <td colspan="2" class="meta-label">RUT:</td>
            <td colspan="3" class="meta-value">${empresa.rut}</td>
          </tr>
          <tr>
            <td colspan="2" class="meta-label">Período:</td>
            <td colspan="4" class="meta-value">${periodo}</td>
            <td colspan="2" class="meta-label">Centro de Costos:</td>
            <td colspan="3" class="meta-value">${centroCosto}</td>
          </tr>
          <tr>
            <td colspan="2" class="meta-label">Fecha Emisión:</td>
            <td colspan="4" class="meta-value">${fechaGeneracion}</td>
            <td colspan="2" class="meta-label">Moneda:</td>
            <td colspan="3" class="meta-value">Pesos Chilenos (CLP)</td>
          </tr>
          <tr><td colspan="11"></td></tr>
          <thead>
            <tr>
              <th rowspan="2">Código</th>
              <th rowspan="2">Cuentas Contables</th>
              <th rowspan="2">Tipo</th>
              <th colspan="2">1. Débitos / Créditos</th>
              <th colspan="2">2. Saldos</th>
              <th colspan="2">3. Inventario</th>
              <th colspan="2">4. Resultado</th>
            </tr>
            <tr>
              <th class="subhead">Débito</th>
              <th class="subhead">Crédito</th>
              <th class="subhead">Deudor</th>
              <th class="subhead">Acreedor</th>
              <th class="subhead">Activo</th>
              <th class="subhead">Pasivo</th>
              <th class="subhead">Pérdida</th>
              <th class="subhead">Ganancia</th>
            </tr>
          </thead>
          <tbody>
            ${filas.map(r => `
              <tr>
                <td class="code">${r.codigo}</td>
                <td>${r.nombre}</td>
                <td>${r.tipo}</td>
                <td class="num">${r.debitos > 0 ? r.debitos : '-'}</td>
                <td class="num">${r.creditos > 0 ? r.creditos : '-'}</td>
                <td class="num">${r.saldoDeudor > 0 ? r.saldoDeudor : '-'}</td>
                <td class="num">${r.saldoAcreedor > 0 ? r.saldoAcreedor : '-'}</td>
                <td class="num">${r.activo > 0 ? r.activo : '-'}</td>
                <td class="num">${r.pasivo > 0 ? r.pasivo : '-'}</td>
                <td class="num">${r.perdida > 0 ? r.perdida : '-'}</td>
                <td class="num">${r.ganancia > 0 ? r.ganancia : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-sub">
              <td colspan="3">SUBTOTALES</td>
              <td class="num">${totales.sumDebitos}</td>
              <td class="num">${totales.sumCreditos}</td>
              <td class="num">${totales.sumSaldoDeudor}</td>
              <td class="num">${totales.sumSaldoAcreedor}</td>
              <td class="num">${totales.sumActivo}</td>
              <td class="num">${totales.sumPasivo}</td>
              <td class="num">${totales.sumPerdida}</td>
              <td class="num">${totales.sumGanancia}</td>
            </tr>
            <tr class="total-result">
              <td colspan="3">${labelResultado} (Activo - Pasivo = Ganancia - Pérdida)</td>
              <td class="num">-</td>
              <td class="num">-</td>
              <td class="num">-</td>
              <td class="num">-</td>
              <td class="num">${esUtilidad ? '-' : valResultado}</td>
              <td class="num">${esUtilidad ? valResultado : '-'}</td>
              <td class="num">${esUtilidad ? valResultado : '-'}</td>
              <td class="num">${esUtilidad ? '-' : valResultado}</td>
            </tr>
            <tr class="total-equal">
              <td colspan="3">TOTALES IGUALES</td>
              <td class="num">${totales.sumDebitos}</td>
              <td class="num">${totales.sumCreditos}</td>
              <td class="num">${totales.sumSaldoDeudor}</td>
              <td class="num">${totales.sumSaldoAcreedor}</td>
              <td class="num">${totales.totalFinalActivo}</td>
              <td class="num">${totales.totalFinalPasivo}</td>
              <td class="num">${totales.totalFinalPerdida}</td>
              <td class="num">${totales.totalFinalGanancia}</td>
            </tr>
          </tfoot>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([template], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Balance_8_Columnas_${empresa.rut}_${periodo.replace(/\s+/g, '_')}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
