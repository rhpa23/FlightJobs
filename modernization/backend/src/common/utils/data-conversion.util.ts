/**
 * Utilitário de conversão de dados
 * Equivalente ao DataConversion.cs do legado
 */
export class DataConversion {
  static readonly WeightPounds = 'Pounds';
  static readonly WeightKilograms = 'Kilograms';
  static readonly UnitPounds = ' lbs';
  static readonly UnitKilograms = ' kg';

  /**
   * Converte metros para milhas náuticas (NM)
   */
  static convertMetersToMiles(meters: number): number {
    return meters / 1852;
  }

  /**
   * Converte quilogramas para libras
   */
  static convertKilogramsToPounds(kg: number): number {
    return Math.round(kg * 2.20462);
  }

  /**
   * Converte libras para quilogramas
   */
  static convertPoundsToKilograms(lbs: number): number {
    return Math.round(lbs / 2.20462);
  }
}
