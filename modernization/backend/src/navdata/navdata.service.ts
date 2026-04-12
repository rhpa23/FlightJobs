import { Injectable, OnModuleInit, OnModuleDestroy, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';
import { Airport } from './entities/airport.entity';
import { MapInfoDto } from './dto/map-info.dto';
import { ArrivalTipsDto } from './dto/arrival-tips.dto';
import { GenerateJobsDto, GeneratedJobDto } from './dto/generate-jobs.dto';
import { ConfirmJobsDto } from './dto/confirm-jobs.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../jobs/entities/job.entity';
import { User } from '../users/entities/user.entity';
import { Statistics } from '../statistics/entities/statistics.entity';
import { CustomPlaneCapacity } from '../users/entities/custom-plane-capacity.entity';
import { CreateJobDto } from '../jobs/dto/create-job.dto';
import { CustomCapacityService } from '../users/custom-capacity.service';
import * as https from 'https';

@Injectable()
export class NavdataService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NavdataService.name);
  private db: Database.Database;

  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
    @InjectRepository(CustomPlaneCapacity)
    private customCapacityRepository: Repository<CustomPlaneCapacity>,
    private readonly customCapacityService: CustomCapacityService,
  ) {}

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

  /**
   * Gera opções de jobs baseadas nos parâmetros de busca
   * Equivalente ao GenerateBoardJobs do BaseController.cs
   */
  async generateJobs(generateDto: GenerateJobsDto, userId?: string): Promise<GeneratedJobDto[]> {
    const { departure, arrival, alternative, aviationType, passengers, paxWeight, cargoWeight, capacityId } = generateDto;

    const departureInfo = this.getAirportByIcao(departure);
    const arrivalInfo = this.getAirportByIcao(arrival);

    if (!departureInfo || !arrivalInfo) {
      throw new BadRequestException('Invalid departure or arrival airport');
    }

    // Verifica se arrival != departure e arrival == model.Arrival
    if (arrivalInfo.ident.toUpperCase() === departureInfo.ident.toUpperCase() ||
        arrivalInfo.ident.toUpperCase() !== arrival.toUpperCase()) {
      return [];
    }

    const distance = this.calcDistance(departure, arrival);
    const jobs: GeneratedJobDto[] = [];

    // Taxas equivalentes às do BaseController
    const taxEcon = 0.008; // por NM
    const taxFirstC = 0.012; // por NM
    const taxCargo = 0.0004; // por NM

    const taxEconGE = 0.165; // por NM
    const taxFirstGE = 0.175; // por NM
    const taxCargoGE = 0.0041; // por NM

    const paxW = paxWeight || 84;
    let customPassengerCapacity = passengers || 180;
    let customCargoCapacityWeight = cargoWeight || 2000;

    // Se capacityId for fornecido, busca a capacidade personalizada do usuário
    if (capacityId) {
      const customCapacity = await this.customCapacityRepository.findOne({ where: { id: capacityId } });
      if (customCapacity) {
        customPassengerCapacity = customCapacity.paxCapacity || customPassengerCapacity;
        customCargoCapacityWeight = customCapacity.cargoCapacity || customCargoCapacityWeight;

        // Salva a customPlaneCapacity selecionada nas Statistics do usuário antes de ir para a tela de confirmação
        if (userId) {
          try {
            await this.customCapacityService.selectCapacity(capacityId, userId);
          } catch (error) {
            this.logger.warn(`Não foi possível salvar a capacidade selecionada nas Statistics: ${error.message}`);
          }
        }
      }
    }

    // Busca estatísticas do usuário para verificar unidade de peso
    let statistics: Statistics | null = null;
    if (userId) {
      statistics = await this.statisticsRepository.findOne({
        where: { user: { id: userId } }
      });
    }

    // Converte de pounds para kg se necessário
    if (statistics && statistics.weightUnit === 'pounds') {
      customCargoCapacityWeight = Math.round(customCargoCapacityWeight / 2.20462);
    }

    const randomPob = Math.random;
    const randomCargo = Math.random;
    let id = 0;
    let validGaProfit = false;

    const flightType = aviationType.trim();
    const index = Math.floor(randomPob() * (25 - 14 + 1)) + 14; // Next(14, 25)

    if (flightType === 'GeneralAviation') {
      validGaProfit = customCargoCapacityWeight < 3000 && customPassengerCapacity < 30;
    }

    let gePobCount = 0;
    let auxCargoCount = 0;

    for (let i = 0; i < index; i++) {
      let pob = 0;
      let cargo = 0;
      let profit = 0;
      const isFisrtClass = Math.floor(randomPob() * 2) === 1; // Next(2)

      const alternateCargo = Math.floor(randomPob() * 2); // Next(2)
      const isCargo = alternateCargo === 0 || flightType === 'Cargo';

      if (isCargo) {
        let minCargo = 5;
        let maxCargo = 160;
        if (flightType === 'AirTransport') { minCargo = 0; maxCargo = 3000; }
        if (flightType === 'Cargo') { minCargo = 10; maxCargo = 3500; }
        if (flightType === 'HeavyAirTransport') { minCargo = 0; maxCargo = 6000; }

        let cargoCapacity = customCargoCapacityWeight;
        if (cargoCapacity < minCargo) cargoCapacity = minCargo + 1;
        cargo = Math.floor(randomCargo() * (cargoCapacity - minCargo + 1)) + minCargo; // Next(minCargo, cargoCapacity)

        if (auxCargoCount + cargo > cargoCapacity) {
          cargo = cargoCapacity - auxCargoCount;
          auxCargoCount = cargoCapacity;
        } else {
          auxCargoCount += cargo;
        }

        if (cargo === 0) continue;

        if (flightType === 'GeneralAviation') {
          if (validGaProfit) {
            profit = Math.round(taxCargoGE * distance * cargo);
            profit += Math.round(140 / customCargoCapacityWeight);
          } else {
            profit = Math.round(taxCargo * distance * cargo);
          }
        } else if (flightType === 'AirTransport') {
          profit = Math.round(taxCargo * distance * cargo);
        } else if (flightType === 'Cargo') {
          profit = Math.round((taxCargo + 0.0005) * distance * cargo);
        } else { // HeavyAirTransport
          profit = Math.round(taxCargo * distance * cargo);
        }
      } else {
        let minPob = 1;
        let maxPob = 12;
        if (flightType === 'AirTransport') { minPob = 10; maxPob = 80; }
        if (flightType === 'HeavyAirTransport') { minPob = 50; maxPob = 140; }

        let passengerCapacity = customPassengerCapacity;
        if (passengerCapacity < minPob) passengerCapacity = minPob + 1;
        pob = Math.floor(randomPob() * (passengerCapacity - minPob + 1)) + minPob; // Next(minPob, passengerCapacity)

        if (gePobCount + pob > passengerCapacity) {
          pob = passengerCapacity - gePobCount;
          if (pob === 0) continue;
          gePobCount = passengerCapacity;
        } else {
          gePobCount += pob;
        }

        if (flightType === 'GeneralAviation') {
          // Always premium for GA
          if (validGaProfit) {
            profit = Math.round(taxFirstGE * distance * pob);
            profit += Math.round((distance * 2) / passengerCapacity);
          } else {
            profit = Math.round(taxFirstC * distance * pob);
          }
        } else if (flightType === 'AirTransport') {
          profit = isFisrtClass ? Math.round(taxFirstC * distance * pob) : Math.round(taxEcon * distance * pob);
        } else { // HeavyAirTransport
          profit = isFisrtClass ? Math.round(taxFirstC * distance * pob) : Math.round(taxEcon * distance * pob);
        }
      }

      // Converte cargo para a unidade de peso do usuário
      let convertedCargo = cargo;
      if (statistics && statistics.weightUnit === 'pounds') {
        convertedCargo = Math.round(cargo * 2.20462);
      }

      const weightUnit = statistics?.weightUnit === 'pounds' ? 'lbs' : 'kg';

      jobs.push({
        id: id++,
        type: isCargo ? '[Cargo] ' : (isFisrtClass ? '[Full price] ' : '[On sale] '),
        typeCategory: isCargo ? 'cargo' : 'passenger',
        payload: isCargo ? `${convertedCargo} ${weightUnit}` : `${pob} Pax`,
        pay: `F$${profit}`,
        departureICAO: departure,
        arrivalICAO: arrival,
        alternativeICAO: alternative,
        distance,
        pax: pob,
        cargo: convertedCargo,
        payAmount: profit,
        aviationType: this.getAviationTypeId(aviationType),
        firstClass: isFisrtClass,
        paxWeight: paxW,
      });
    }

    // Ordena por Arrival e PayloadLabel
    return jobs.sort((a, b) => {
      if (a.arrivalICAO !== b.arrivalICAO) {
        return a.arrivalICAO.localeCompare(b.arrivalICAO);
      }
      return a.type.localeCompare(b.type);
    });
  }

  /**
   * Retorna o ID do tipo de aviação
   * Equivalente ao GetAviationTypeId do BaseController.cs
   */
  private getAviationTypeId(aviationType: string): number {
    switch (aviationType) {
      case 'GeneralAviation':
        return 1;
      case 'AirTransport':
        return 2;
      case 'HeavyAirTransport':
        return 3;
      case 'Cargo':
        return 4;
      default:
        return 0;
    }
  }

  /**
   * Confirma e cria os jobs selecionados
   * Equivalente ao Confirm do SearchJobsController.cs
   */
  async confirmJobs(confirmDto: ConfirmJobsDto, userId: string): Promise<{ message: string }> {
    const { jobs: jobsToConfirm } = confirmDto;

    // Buscar usuário para validar existência
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar se usuário não é GUEST
    if (user.email === 'guest@flightjobs.com') {
      throw new ForbiddenException('Guest accounts cannot save jobs.');
    }

    // Buscar estatísticas do usuário
    const statistics = await this.statisticsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['customPlaneCapacity']
    });

    const paxWeight = statistics?.customPlaneCapacity?.paxWeight || 84;

    const uniqueList = new Map<string, CreateJobDto>();

    // Criar jobs
    for (const jobData of jobsToConfirm) {

      if (!uniqueList.has(jobData.arrivalICAO)) {
        const createJobDto: CreateJobDto = {
          departureICAO: jobData.departureICAO,
          arrivalICAO: jobData.arrivalICAO,
          alternativeICAO: jobData.alternativeICAO,
          distance: jobData.distance,
          pax: jobData.pax || 0,
          cargo: jobData.cargo || 0,
          pay: jobData.pay,
          aviationType: jobData.aviationType || 1,
          firstClass: jobData.firstClass || false,
          paxWeight: jobData.paxWeight || paxWeight,
        };

        uniqueList.set(jobData.arrivalICAO, createJobDto);
        
      } else {
        const existingJob = uniqueList.get(jobData.arrivalICAO);
        existingJob.pax += jobData.pax;
        existingJob.cargo += jobData.cargo;
        existingJob.pay += jobData.pay;
      }
    }
    // jobList.FirstOrDefault()
    const jobToSave = uniqueList.values().next().value;

    await this.jobsRepository.save({
        ...jobToSave,
        user: { id: userId } as User,
        startTime: new Date(),
        endTime: new Date(),
        challengeExpirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ontem
      });

    // Ativar o último job criado e desativar os outros
    const userJobs = await this.jobsRepository.find({
      where: { 
        user: { id: userId }, 
        isDone: false,
        isChallenge: false
      },
      order: { id: 'DESC' }
    });

    if (userJobs.length > 0) {
      for (const job of userJobs) {
        job.isActivated = job.id === userJobs[0].id;
      }
      await this.jobsRepository.save(userJobs);
    }

    return { message: 'Saved' };
  }
}
