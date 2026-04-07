import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';
import { Airport } from './entities/airport.entity';

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
