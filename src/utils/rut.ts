/**
 * Chilean RUT Utilities (Validation, Formatting, Clean)
 */

export function cleanRut(rut: string): string {
  return typeof rut === 'string'
    ? rut.replace(/[^0-9kK]/g, '').toUpperCase()
    : '';
}

export function formatRut(rut: string): string {
  const clean = cleanRut(rut);
  if (!clean) return '';
  if (clean.length < 2) return clean;

  const dv = clean.slice(-1);
  const cuerpo = clean.slice(0, -1);

  // Format with thousand separators
  let formattedCuerpo = '';
  let count = 0;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    formattedCuerpo = cuerpo.charAt(i) + formattedCuerpo;
    count++;
    if (count % 3 === 0 && i !== 0) {
      formattedCuerpo = '.' + formattedCuerpo;
    }
  }

  return `${formattedCuerpo}-${dv}`;
}

export function validateRut(rut: string): boolean {
  const clean = cleanRut(rut);
  if (clean.length < 7 || clean.length > 9) return false;

  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);

  // Calculate verification digit using Modulo 11
  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const resto = suma % 11;
  const digitoCalculado = 11 - resto;

  let dvEsperado = '';
  if (digitoCalculado === 11) {
    dvEsperado = '0';
  } else if (digitoCalculado === 10) {
    dvEsperado = 'K';
  } else {
    dvEsperado = digitoCalculado.toString();
  }

  return dv === dvEsperado;
}

export function formatCurrencyCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumberCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 0,
  }).format(amount);
}
