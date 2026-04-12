import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';
import { Airport } from './entities/airport.entity';
import { MapInfoDto } from './dto/map-info.dto';
import { ArrivalTipsDto } from './dto/arrival-tips.dto';
import * as https from 'https';

@Injectable()
export class NavdataService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NavdataService.name);
  private db: Database.Database;

  onModuleInit() {
    // Caminho para o navdata.sqlite - ajusta conforme necessário
    const dbPath = process.env.NAVDATA_DB_PATH || path.join(__dirname, '../../../../FlightJobs.Domain.Navdata/navdata.sqlite');
    
    this.logger.log(`Inicializando conexão com navdata: ${dbPath}`);
    this.db = new Database(dbPath, { readonly: true });
  }

  onModuleDestroy() {
    if (this.db) {
      this.db.close();
    }
  }

  /**
   * Encontra o aeroporto mais próximo das coordenadas fornecidas.
   * Lógica equivalente ao GetCloseAirport do legado:
   * - Busca aeroportos num bounding box de ±2 graus
   * - Filtra aeroportos com pelo menos 1 pista (num_runways > 0)
   * - Ordena por distância e retorna o mais próximo dentro de 15000 metros
   */
  getCloseAirport(latitude: number, longitude: number): Airport | null {
    const latDownOffset = latitude - 2;
    const latUpOffset = latitude + 2;
    const lonDownOffset = longitude - 2;
    const lonUpOffset = longitude + 2;
    const minDistance = 15000; // metros

    const query = `
      SELECT * FROM airport 
      WHERE laty > ? AND laty < ? AND lonx > ? AND lonx < ?
    `;

    try {
      const rows = this.db.prepare(query).all(latDownOffset, latUpOffset, lonDownOffset, lonUpOffset);
      
      if (!rows || rows.length === 0) {
        return null;
      }

      // Filtra aeroportos com pelo menos 1 pista e calcula distância
      const airportsWithDistance = rows
        .filter((row: any) => row.num_runways > 0)
        .map((row: any) => ({
          airport: this.mapRowToAirport(row),
          distance: this.haversineDistance(latitude, longitude, row.laty, row.lonx)
        }))
        .filter(item => item.distance < minDistance)
        .sort((a, b) => a.distance - b.distance);

      return airportsWithDistance.length > 0 ? airportsWithDistance[0].airport : null;
    } catch (error) {
      this.logger.error(`Erro ao buscar aeroporto próximo: ${error.message}`);
      return null;
    }
  }

  /**
   * Busca aeroporto por ICAO
   */
  getAirportByIcao(icao: string): Airport | null {
    const query = `SELECT * FROM airport WHERE UPPER(ident) = ?`;
    
    try {
      const row = this.db.prepare(query).get(icao.toUpperCase());
      return row ? this.mapRowToAirport(row) : null;
    } catch (error) {
      this.logger.error(`Erro ao buscar aeroporto por ICAO: ${error.message}`);
      return null;
    }
  }

  /**
   * Busca múltiplos aeroportos por uma lista de ICAOs
   * Equivalente ao GetAirportsByIcaos do legado
   */
  getAirportsByIcaos(icaos: string[]): Airport[] {
    if (!icaos || icaos.length === 0) {
      return [];
    }

    const icaoParams = icaos.map(icao => icao.toUpperCase()).join("','");
    const query = `SELECT * FROM airport WHERE UPPER(ident) in ('${icaoParams}')`;

    try {
      const rows = this.db.prepare(query).all();
      return rows.map((row: any) => this.mapRowToAirport(row));
    } catch (error) {
      this.logger.error(`Erro ao buscar aeroportos por ICAOs: ${error.message}`);
      return [];
    }
  }

  /**
   * Busca todos os aeroportos próximos de um aeroporto
   * Equivalente ao GetAllCloseAirports do legado
   */
  getAllCloseAirports(airport: Airport): Airport[] {
    const latDownOffset = airport.laty - 2;
    const latUpOffset = airport.laty + 2;
    const lonDownOffset = airport.lonx - 2;
    const lonUpOffset = airport.lonx + 2;

    const query = `
      SELECT * FROM airport
      WHERE ident <> '${airport.ident}'
      AND laty > ${latDownOffset} AND laty < ${latUpOffset}
      AND lonx > ${lonDownOffset} AND lonx < ${lonUpOffset}
    `;

    try {
      const rows = this.db.prepare(query).all();
      return rows.map((row: any) => this.mapRowToAirport(row));
    } catch (error) {
      this.logger.error(`Erro ao buscar aeroportos próximos: ${error.message}`);
      return [];
    }
  }

  /**
   * Calcula a distância entre dois aeroportos em milhas
   * Equivalente ao CalcDistance do BaseController.cs
   */
  calcDistance(departure: string, arrival: string): number {
    const departureInfo = this.getAirportByIcao(departure);
    const arrivalInfo = this.getAirportByIcao(arrival);

    if (departureInfo && arrivalInfo) {
      const distMeters = this.haversineDistance(
        departureInfo.laty,
        departureInfo.lonx,
        arrivalInfo.laty,
        arrivalInfo.lonx
      );
      // Converte metros para milhas (1 milha = 1609.344 metros)
      const distMiles = Math.round(distMeters / 1609.344);
      return distMiles;
    }
    return 0;
  }

  /**
   * Retorna informações de aeroportos para o mapa
   * Equivalente ao GetMapInfo do BaseController.cs
   */
  getMapInfo(
    departure: string,
    arrival: string,
    alternative?: string,
    iconsPath: string = '../Content/img/',
    favoriteIcaos?: string[]
  ): MapInfoDto[] {
    const jsonList: MapInfoDto[] = [];

    // Busca aeroporto alternativo se fornecido
    const alternativeInfo = alternative ? this.getAirportByIcao(alternative) : null;

    // Adiciona aeroporto de partida
    if (departure) {
      const departureInfo = this.getAirportByIcao(departure);
      if (departureInfo) {
        jsonList.push({
          isRoute: true,
          isDeparture: true,
          isArrival: false,
          isAlternative: false,
          lat: departureInfo.laty,
          lng: departureInfo.lonx,
          name: departureInfo.name,
          info: 'Departure airport',
          icao: departureInfo.ident,
          runway_size: `${departureInfo.longestRunwayLength}ft`,
          elevation: `${departureInfo.altitude}ft`,
          icon_url: `${iconsPath}departing.png`,
          icon_center_x: 13,
          icon_center_y: 13,
        });
      }
    }

    // Adiciona aeroporto de chegada
    if (arrival) {
      const arrivalInfo = this.getAirportByIcao(arrival);
      if (arrivalInfo) {
        jsonList.push({
          isRoute: true,
          isDeparture: false,
          isArrival: true,
          isAlternative: false,
          lat: arrivalInfo.laty,
          lng: arrivalInfo.lonx,
          name: arrivalInfo.name,
          info: 'Arrival airport',
          icao: arrivalInfo.ident,
          runway_size: `${arrivalInfo.longestRunwayLength}ft`,
          elevation: `${arrivalInfo.altitude}ft`,
          icon_url: `${iconsPath}arrival.png`,
          icon_center_x: 13,
          icon_center_y: 13,
        });

        // Adiciona aeroporto alternativo se fornecido
        if (alternativeInfo) {
          jsonList.push({
            isRoute: true,
            isDeparture: false,
            isArrival: false,
            isAlternative: true,
            lat: alternativeInfo.laty,
            lng: alternativeInfo.lonx,
            name: alternativeInfo.name,
            info: 'Alternative airport',
            icao: alternativeInfo.ident,
            runway_size: `${alternativeInfo.longestRunwayLength}ft`,
            elevation: `${alternativeInfo.altitude}ft`,
            icon_url: `${iconsPath}alternative.png`,
            icon_center_x: 13,
            icon_center_y: 13,
          });
        }
      }
    }

    // Adiciona aeroportos favoritos do usuário
    if (favoriteIcaos && favoriteIcaos.length > 0) {
      const favoriteAirports = this.getAirportsByIcaos(favoriteIcaos);
      for (const favDptInfo of favoriteAirports) {
        jsonList.push({
          isRoute: false,
          isDeparture: false,
          isArrival: false,
          isAlternative: false,
          lat: favDptInfo.laty,
          lng: favDptInfo.lonx,
          name: favDptInfo.name,
          info: favDptInfo.ident,
          icao: favDptInfo.ident,
          runway_size: `${favDptInfo.longestRunwayLength}ft`,
          elevation: `${favDptInfo.altitude}ft`,
          icon_url: `${iconsPath}favorite.png`,
          icon_center_x: 8,
          icon_center_y: 8,
        });
      }
    }

    return jsonList;
  }

  /**
   * Retorna dicas de chegada para um aeroporto de partida
   * Equivalente ao SearchJobTipsViewModels do SearchJobsController.cs
   */
  getArrivalTips(
    departure: string,
    userJobs: any[]
  ): ArrivalTipsDto[] {
    const listTips: ArrivalTipsDto[] = [];

    if (!departure || departure.length <= 2) {
      return listTips;
    }

    const departureInfo = this.getAirportByIcao(departure);
    if (!departureInfo) {
      return listTips;
    }

    // Adiciona arrivals dos jobs do usuário filtrados pelo departure
    const filteredJobs = userJobs.filter(job =>
      job.departureICAO && job.departureICAO.includes(departure)
    );

    for (const job of filteredJobs) {
      const arrivalAirportInfo = this.getAirportByIcao(job.arrivalICAO);
      if (arrivalAirportInfo) {
        listTips.push({
          idJob: job.id,
          airportICAO: job.arrivalICAO,
          cargo: job.cargo,
          pax: job.pax,
          pay: job.pay,
          payload: job.payload,
          airportName: arrivalAirportInfo.name,
          airportElevation: arrivalAirportInfo.altitude,
          airportRunwaySize: arrivalAirportInfo.longestRunwayLength,
          distance: job.distance
        });
      }
    }

    // Adiciona arrivals aleatórios de outros jobs do usuário
    if (userJobs.length > 1) {
      const index = Math.floor(Math.random() * (userJobs.length - 1)) + 1;
      const count = Math.floor(Math.random() * (userJobs.length - index));
      const randomJobs = userJobs.slice(index, index + count).slice(0, 7);

      for (const job of randomJobs) {
        if (!listTips.some(x => x.airportICAO === job.arrivalICAO) &&
            job.arrivalICAO !== departure) {
          const arrivalAirportInfo = this.getAirportByIcao(job.arrivalICAO);
          if (arrivalAirportInfo) {
            const distMeters = this.haversineDistance(
              departureInfo.laty,
              departureInfo.lonx,
              arrivalAirportInfo.laty,
              arrivalAirportInfo.lonx
            );
            const distMiles = Math.round(distMeters / 1609.344);

            listTips.push({
              airportICAO: job.arrivalICAO,
              airportName: arrivalAirportInfo.name,
              distance: distMiles,
              airportElevation: arrivalAirportInfo.altitude,
              airportRunwaySize: arrivalAirportInfo.longestRunwayLength
            });
          }
        }
      }
    }

    // Adiciona aeroportos próximos aleatórios (até 600 milhas)
    const closeAirports = this.getAllCloseAirports(departureInfo);
    const tempTips: ArrivalTipsDto[] = [];

    for (const airport of closeAirports) {
      const distMeters = this.haversineDistance(
        departureInfo.laty,
        departureInfo.lonx,
        airport.laty,
        airport.lonx
      );
      const distMiles = Math.round(distMeters / 1609.344);

      if (distMiles < 600) {
        tempTips.push({
          airportICAO: airport.ident,
          airportName: airport.name,
          distance: distMiles,
          airportElevation: airport.altitude,
          airportRunwaySize: airport.longestRunwayLength
        });
      }
    }

    // Embaralha e adiciona até 10 aeroportos próximos
    const shuffled = tempTips.sort(() => Math.random() - 0.5);
    listTips.push(...shuffled.slice(0, 10));

    return listTips;
  }

  /**
   * Retorna aeroportos alternativos dentro de um range específico
   * Equivalente ao SearchAlternativeTips do SearchJobsController.cs
   */
  getAlternativeTips(arrival: string, range: number): ArrivalTipsDto[] {
    const listTips: ArrivalTipsDto[] = [];

    if (!arrival || arrival.length <= 2) {
      return listTips;
    }

    const destinationInfo = this.getAirportByIcao(arrival);
    if (!destinationInfo) {
      return listTips;
    }

    const closeAirports = this.getAllCloseAirports(destinationInfo);

    for (const airport of closeAirports) {
      const distMeters = this.haversineDistance(
        destinationInfo.laty,
        destinationInfo.lonx,
        airport.laty,
        airport.lonx
      );
      const distMiles = Math.round(distMeters / 1609.344);

      if (distMiles < range) {
        listTips.push({
          airportICAO: airport.ident,
          airportName: airport.name,
          distance: distMiles,
          airportElevation: airport.altitude,
          airportRunwaySize: airport.longestRunwayLength
        });
      }
    }

    return listTips;
  }

  /**
   * Busca dados do Simbrief API
   * Equivalente ao SimbriefLoadAsync do SearchJobsController.cs
   */
  async getSimbriefData(username: string): Promise<any> {
    const url = `https://www.simbrief.com/api/xml.fetcher.php?username=${username}&json=1`;

    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            if (data) {
              const jsonData = JSON.parse(data);
              resolve(jsonData);
            } else {
              resolve(null);
            }
          } catch (error) {
            this.logger.error(`Erro ao parsear JSON do Simbrief: ${error.message}`);
            resolve(null);
          }
        });
      }).on('error', (error) => {
        this.logger.error(`Erro ao buscar dados do Simbrief: ${error.message}`);
        resolve(null);
      });
    });
  }

  private mapRowToAirport(row: any): Airport {
    return {
      airportId: row.airport_id,
      ident: row.ident,
      name: row.name,
      city: row.city,
      state: row.state,
      hasAvgas: row.has_avgas,
      hasJetfuel: row.has_jetfuel,
      isMilitary: row.is_military,
      longestRunwayLength: row.longest_runway_length,
      longestRunwayWidth: row.longest_runway_width,
      longestRunwayHeading: row.longest_runway_heading,
      longestRunwaySurface: row.longest_runway_surface,
      numRunways: row.num_runways,
      magVar: row.mag_var,
      altitude: row.altitude,
      lonx: row.lonx,
      laty: row.laty
    };
  }

  /**
   * Calcula distância entre dois pontos usando fórmula Haversine
   * Equivalente ao GeoCoordinate.GetDistanceTo() do .NET
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Raio da Terra em metros
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
