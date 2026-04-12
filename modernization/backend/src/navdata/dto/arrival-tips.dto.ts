export interface ArrivalTipsDto {
  idJob?: number;
  airportICAO: string;
  airportName: string;
  distance: number;
  airportElevation: number;
  airportRunwaySize: number;
  cargo?: number;
  pax?: number;
  pay?: number;
  payload?: number;
}
