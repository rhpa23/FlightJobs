/**
 * Utilitários para conversão e formatação de peso
 */

export type WeightUnit = 'kg' | 'lbs';

export const WEIGHT_UNITS = {
  KG: 'kg' as WeightUnit,
  LBS: 'lbs' as WeightUnit,
};

/**
 * Converte quilogramas para libras
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462);
}

/**
 * Converte libras para quilogramas
 */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462);
}

/**
 * Converte um valor de peso de uma unidade para outra
 */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  
  if (from === 'kg' && to === 'lbs') {
    return kgToLbs(value);
  }
  
  if (from === 'lbs' && to === 'kg') {
    return lbsToKg(value);
  }
  
  return value;
}

/**
 * Formata um valor de peso com a unidade apropriada
 * Os valores no banco são sempre armazenados em kg
 */
export function formatWeight(
  valueInKg: number | undefined | null,
  unit: WeightUnit = 'kg',
  options: { decimals?: number; showUnit?: boolean } = {}
): string {
  const { decimals = 0, showUnit = true } = options;
  
  if (valueInKg === undefined || valueInKg === null || isNaN(valueInKg)) {
    return showUnit ? `0 ${unit}` : '0';
  }
  
  let displayValue = valueInKg;
  
  if (unit === 'lbs') {
    displayValue = kgToLbs(valueInKg);
  }
  
  const formattedValue = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.round(displayValue).toString();
  
  return showUnit ? `${formattedValue} ${unit}` : formattedValue;
}

/**
 * Retorna o rótulo da unidade de peso
 */
export function getWeightUnitLabel(unit: WeightUnit): string {
  return unit === 'kg' ? 'Kilograms' : 'Pounds';
}

/**
 * Retorna o símbolo da unidade de peso
 */
export function getWeightUnitSymbol(unit: WeightUnit): string {
  return unit === 'kg' ? 'kg' : 'lbs';
}
