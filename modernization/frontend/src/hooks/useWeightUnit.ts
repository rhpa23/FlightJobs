import { useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { formatWeight, convertWeight, WeightUnit } from '../utils/weightUtils';

interface UseWeightUnitReturn {
  unit: WeightUnit;
  format: (valueInKg: number | undefined | null, options?: { decimals?: number; showUnit?: boolean }) => string;
  convert: (valueInKg: number) => number;
}

/**
 * Hook para acessar a unidade de peso do usuário e funções de formatação/conversão
 */
export function useWeightUnit(): UseWeightUnitReturn {
  const { myStats } = useAppSelector((state) => state.statistics);
  
  const unit = useMemo<WeightUnit>(() => {
    return myStats?.weightUnit === 'lbs' ? 'lbs' : 'kg';
  }, [myStats?.weightUnit]);
  
  const format = useMemo(() => {
    return (valueInKg: number | undefined | null, options?: { decimals?: number; showUnit?: boolean }) => {
      return formatWeight(valueInKg, unit, options);
    };
  }, [unit]);
  
  const convert = useMemo(() => {
    return (valueInKg: number) => {
      return convertWeight(valueInKg, 'kg', unit);
    };
  }, [unit]);
  
  return {
    unit,
    format,
    convert,
  };
}
