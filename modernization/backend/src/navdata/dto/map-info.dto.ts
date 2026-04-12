export interface MapInfoDto {
  isRoute: boolean;
  isDeparture: boolean;
  isArrival: boolean;
  isAlternative: boolean;
  lat: number;
  lng: number;
  name: string;
  info: string;
  icao: string;
  runway_size: string;
  elevation: string;
  icon_url: string;
  icon_center_x: number;
  icon_center_y: number;
}
