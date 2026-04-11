import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Job } from './entities/job.entity';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { CompleteJobDto } from './dto/complete-job.dto';
import { StartJobDto } from './dto/start-job.dto';
import { FinishJobDto } from './dto/finish-job.dto';
import { StartJobResponseDto } from './dto/start-job-response.dto';
import { FinishJobResponseDto } from './dto/finish-job-response.dto';
import { NavdataService } from '../navdata/navdata.service';
import { Statistics } from '../statistics/entities/statistics.entity';
import { User } from '../users/entities/user.entity';
import { PilotLicenseExpenseUser } from '../licenses/entities/pilot-license-expense-user.entity';
import { Airline } from '../airlines/entities/airline.entity';
import { AirlineFbo } from '../airlines/entities/airline-fbo.entity';
import { JobAirline } from '../job-airlines/entities/job-airline.entity';
import { DataConversion } from '../common/utils/data-conversion.util';

// Constantes do legado
const CHALLENGE_EXPIRED = 'Unfortunately, this Challenge is expired. Take another one.';
const GUEST_EMAIL = 'guest@flightjobs.com'; // Ajustar conforme configuração real
const PAYLOAD_TOLERANCE = 150; // kg
const MIN_TIME_FACTOR = 11 / 100; // minutos por NM
const MIN_FUEL_FACTOR = 0.12 / 1000; // kg por NM * payload

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(PilotLicenseExpenseUser)
    private pilotLicenseExpenseRepository: Repository<PilotLicenseExpenseUser>,
    @InjectRepository(Airline)
    private airlinesRepository: Repository<Airline>,
    @InjectRepository(AirlineFbo)
    private airlineFboRepository: Repository<AirlineFbo>,
    @InjectRepository(JobAirline)
    private jobAirlineRepository: Repository<JobAirline>,
    private navdataService: NavdataService,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<Job[]> {
    return this.jobsRepository.find();
  }

  async findOne(id: number): Promise<Job> {
    const job = await this.jobsRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async search(searchDto: SearchJobsDto): Promise<Job[]> {
    const queryBuilder = this.jobsRepository.createQueryBuilder('job')
      .where('job.isDone = :isDone', { isDone: false })
      .andWhere('job.isActivated = :isActivated', { isActivated: false });

    if (searchDto.departure) {
      queryBuilder.andWhere('job.departureICAO = :departure', { departure: searchDto.departure });
    }
    if (searchDto.arrival) {
      queryBuilder.andWhere('job.arrivalICAO = :arrival', { arrival: searchDto.arrival });
    }
    if (searchDto.aviationType) {
      queryBuilder.andWhere('job.aviationType = :aviationType', { aviationType: searchDto.aviationType });
    }

    return queryBuilder.getMany();
  }

  async findPendingJobs(userId: string): Promise<Job[]> {
    return this.jobsRepository.find({
      where: { user: { id: userId }, isDone: false, isActivated: false },
    });
  }

  async findActiveJob(userId: string): Promise<Job | null> {
    return this.jobsRepository.findOne({
      where: { user: { id: userId }, isActivated: true, isDone: false },
    });
  }

  async activateJob(id: number): Promise<Job> {
    const job = await this.findOne(id);
    job.isActivated = true;
    job.startTime = new Date();
    return this.jobsRepository.save(job);
  }

  async completeJob(id: number, completeDto: CompleteJobDto): Promise<Job> {
    const job = await this.findOne(id);
    job.isDone = true;
    job.isActivated = false;
    job.endTime = new Date();
    job.modelName = completeDto.modelName;
    job.modelDescription = completeDto.modelDescription;
    job.startFuelWeight = completeDto.startFuelWeight;
    job.finishFuelWeight = completeDto.finishFuelWeight;
    return this.jobsRepository.save(job);
  }

  async create(jobData: Partial<Job>): Promise<Job> {
    const job = this.jobsRepository.create(jobData);
    return this.jobsRepository.save(job);
  }

  async update(id: number, jobData: Partial<Job>): Promise<Job> {
    const job = await this.findOne(id);
    Object.assign(job, jobData);
    return this.jobsRepository.save(job);
  }

  async remove(id: number): Promise<void> {
    const job = await this.findOne(id);
    await this.jobsRepository.remove(job);
  }

  // ============================================================================
  // START JOB - Lógica equivalente ao StartJobMSFS do legado
  // ============================================================================

  /**
   * Inicia um job baseado nas coordenadas da aeronave.
   * Encontra o aeroporto mais próximo e valida o job ativado do usuário.
   */
  async startJob(userId: string, dto: StartJobDto): Promise<StartJobResponseDto> {
    try {
      // 1. Encontrar aeroporto mais próximo pelas coordenadas
      const airport = this.navdataService.getCloseAirport(dto.latitude, dto.longitude);
      
      if (!airport) {
        throw new BadRequestException('No airport found near the provided coordinates.');
      }

      return await this.startJobByIcao(userId, airport.ident, dto.payloadKilograms, dto.fuelWeightKilograms);
    } catch (error) {
      this.logger.error(`Erro ao iniciar job: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Process error.');
    }
  }

  /**
   * Inicia um job pelo ICAO diretamente.
   */
  async startJobByIcao(
    userId: string, 
    icaoStr: string, 
    payloadKg: number, 
    fuelWeightKg: number
  ): Promise<StartJobResponseDto> {
    // 1. Buscar job ativado do usuário
    const job = await this.findActivatedJobByDeparture(userId, icaoStr);

    if (!job) {
      throw new ForbiddenException("You don't have any job activated for this location.");
    }

    // 2. Verificar se challenge não expirou
    if (job.isChallenge && job.challengeExpirationDate <= new Date()) {
      throw new ForbiddenException(CHALLENGE_EXPIRED);
    }

    // 3. Verificar se usuário não é GUEST
    if (job.user && job.user.email === GUEST_EMAIL) {
      throw new ForbiddenException('Guest accounts cannot start jobs.');
    }

    // 4. Validar payload ±150kg
    const payload = Math.round(payloadKg);
    const jobPayload = this.calculateJobPayload(job);
    
    if (payload >= (jobPayload + PAYLOAD_TOLERANCE) || payload <= (jobPayload - PAYLOAD_TOLERANCE)) {
      const payloadInPounds = DataConversion.convertKilogramsToPounds(jobPayload);
      throw new ForbiddenException(`Wrong. Active job payload is: ${jobPayload}kg / ${payloadInPounds}lbs`);
    }

    // 5. Atualizar job
    job.startFuelWeight = Math.round(fuelWeightKg);
    job.inProgress = true;
    job.startTime = new Date();
    await this.jobsRepository.save(job);

    // 6. Verificar licença do piloto
    const licenseExpired = await this.isLicenseOverdue(userId);

    // 7. Montar resposta
    const name = job.isChallenge ? 'Challenge' : 'Job';
    let message = `${name} to ${job.arrivalICAO} started at: ${job.startTime.toISOString()} (UTC)`;
    if (licenseExpired) {
      message = `${name} started. Warn: Your pilot license is expired. Check profile page.`;
    }

    return {
      success: true,
      message,
      arrivalIcao: job.arrivalICAO,
      licenseExpired
    };
  }

  // ============================================================================
  // FINISH JOB - Lógica equivalente ao FinishJobMsfsPost do legado
  // ============================================================================

  /**
   * Finaliza um job baseado nas coordenadas da aeronave.
   * Encontra o aeroporto mais próximo e valida o job em progresso do usuário.
   */
  async finishJob(userId: string, dto: FinishJobDto): Promise<FinishJobResponseDto> {
    try {
      // 1. Encontrar aeroporto mais próximo pelas coordenadas
      const airport = this.navdataService.getCloseAirport(dto.latitude, dto.longitude);

      if (!airport) {
        throw new BadRequestException('No airport found near the provided coordinates.');
      }

      return await this.finishJobByIcao(
        userId, 
        airport.ident, 
        dto.payloadKilograms, 
        dto.fuelWeightKilograms, 
        dto.modelName, 
        dto.modelDescription,
        dto.resultMessages,
        dto.resultScore
      );
    } catch (error) {
      this.logger.error(`Erro ao finalizar job: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException('Process error.');
    }
  }

  /**
   * Finaliza um job pelo ICAO diretamente.
   */
  async finishJobByIcao(
    userId: string,
    icaoStr: string,
    payloadKg: number,
    fuelWeightKg: number,
    modelName?: string,
    modelDescription?: string,
    resultMessages?: string[],
    resultScore?: number
  ): Promise<FinishJobResponseDto> {
    // 1. Buscar job em progresso do usuário pelo ICAO de chegada ou alternativo
    const job = await this.findInProgressJobByArrival(userId, icaoStr);

    if (!job) {
      throw new ForbiddenException('Wrong destination to finish this job.');
    }

    const name = job.isChallenge ? 'Challenge' : 'Job';

    // 2. Verificar se challenge não expirou
    if (job.isChallenge && job.challengeExpirationDate <= new Date()) {
      throw new ForbiddenException(CHALLENGE_EXPIRED);
    }

    // 3. Verificar se usuário não é GUEST
    if (job.user && job.user.email === GUEST_EMAIL) {
      throw new ForbiddenException('Guest accounts cannot finish jobs.');
    }

    // 4. Validar payload ±150kg
    const payload = Math.round(payloadKg);
    const jobPayload = this.calculateJobPayload(job);
    
    if (payload >= (jobPayload + PAYLOAD_TOLERANCE) || payload <= (jobPayload - PAYLOAD_TOLERANCE)) {
      const payloadInPounds = DataConversion.convertKilogramsToPounds(jobPayload);
      throw new ForbiddenException(`Wrong. Active ${name} payload is: ${jobPayload}kg / ${payloadInPounds}lbs`);
    }

    // 5. Validar tempo mínimo de voo
    const diffTimeMs = Date.now() - new Date(job.startTime).getTime();
    const diffTimeMinutes = diffTimeMs / (1000 * 60);
    const minTime = (job.distance * 11) / 100;

    if (diffTimeMinutes < minTime) {
      throw new ForbiddenException('Impossible to arrive at destination in this short time.');
    }

    // 6. Atualizar job com dados de finalização
    job.inProgress = false;
    job.endTime = new Date();
    job.isDone = true;
    job.isActivated = false;
    job.modelName = modelName || 'No acf model data';
    job.modelDescription = modelDescription || 'No acf model data';
    job.finishFuelWeight = Math.round(fuelWeightKg);

    if (resultScore != null) {
      job.pilotScore = resultScore;
    }

    // 7. Validar combustível queimado
    const usedFuelWeight = job.startFuelWeight - job.finishFuelWeight;
    const expectedFuelBurned = (job.distance * jobPayload * MIN_FUEL_FACTOR);

    if (usedFuelWeight < expectedFuelBurned) {
      throw new ForbiddenException(`Impossible to finish this ${name} with ${usedFuelWeight}Kg burned fuel.`);
    }

    // 8. Atualizar estatísticas do piloto
    const licenseExpired = await this.updateStatistics(job, resultScore);

    // 9. Atualizar dados da airline
    await this.updateAirline(job, resultMessages);

    // 10. Salvar job
    await this.jobsRepository.save(job);

    // 11. Montar resposta
    let message = `${name} finish successfully at: ${job.endTime.toISOString()} (UTC)`;
    if (licenseExpired) {
      message = `${name} finish. Your license is expired. Check Profile page.`;
    }

    // Buscar job finalizado para retornar
    const finishedJob = await this.jobsRepository.findOne({
      where: { user: { id: userId }, isDone: true },
      order: { endTime: 'DESC' },
      relations: ['user']
    });
    
    // Remover user do response para segurança
    if (finishedJob) {
      finishedJob.user = null;
    }

    return {
      success: true,
      message,
      finishedJob,
      licenseExpired
    };
  }

  // ============================================================================
  // MÉTODOS AUXILIARES - Lógica equivalente aos métodos privados do legado
  // ============================================================================

  /**
   * Busca job ativado do usuário pelo ICAO de partida.
   * Suporta ICAO de 3 caracteres (match parcial) ou 4 caracteres (match exato).
   */
  private async findActivatedJobByDeparture(userId: string, icaoStr: string): Promise<Job | null> {
    const queryBuilder = this.jobsRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.user', 'user')
      .where('job.user.id = :userId', { userId })
      .andWhere('job.isActivated = :isActivated', { isActivated: 1 });

    if (icaoStr.length === 3) {
      // Match parcial: últimos 3 caracteres do departureICAO
      queryBuilder.andWhere('SUBSTR(job.departureICAO, 2) = :icao', { icao: icaoStr.toLowerCase() });
    } else {
      // Match exato
      queryBuilder.andWhere('LOWER(job.departureICAO) = :icao', { icao: icaoStr.toLowerCase() });
    }

    return queryBuilder.getOne();
  }

  /**
   * Busca job em progresso do usuário pelo ICAO de chegada ou alternativo.
   * Suporta ICAO de 3 caracteres (match parcial) ou 4 caracteres (match exato).
   */
  private async findInProgressJobByArrival(userId: string, icaoStr: string): Promise<Job | null> {
    const queryBuilder = this.jobsRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.user', 'user')
      .where('job.user.id = :userId', { userId })
      .andWhere('job.isActivated = :isActivated', { isActivated: 1 })
      .andWhere('job.inProgress = :inProgress', { inProgress: 1 });

    if (icaoStr.length === 3) {
      // Match parcial: últimos 3 caracteres
      queryBuilder.andWhere(
        '(SUBSTR(job.arrivalICAO, 2) = :icao OR SUBSTR(job.alternativeICAO, 2) = :icao)',
        { icao: icaoStr.toLowerCase() }
      );
    } else {
      // Match exato
      queryBuilder.andWhere(
        '(LOWER(job.arrivalICAO) = :icao OR LOWER(job.alternativeICAO) = :icao)',
        { icao: icaoStr.toLowerCase() }
      );
    }

    return queryBuilder.getOne();
  }

  /**
   * Calcula o payload real do job considerando PaxWeight.
   */
  private calculateJobPayload(job: Job): number {
    const paxWeight = job.paxWeight > 0 ? job.paxWeight : 84;
    return (job.pax * paxWeight) + job.cargo;
  }

  /**
   * Verifica se a licença do piloto está expirada.
   * Equivalente ao IsLicenseOverdue do legado.
   */
  private async isLicenseOverdue(userId: string): Promise<boolean> {
    const count = await this.pilotLicenseExpenseRepository.count({
      where: {
        user: { id: userId },
        maturityDate: LessThan(new Date())
      }
    });
    return count > 0;
  }

  /**
   * Atualiza estatísticas do piloto após completar um job.
   * Equivalente ao UpdateStatistics do legado.
   */
  private async updateStatistics(job: Job, jobPilotScore?: number): Promise<boolean> {
    let licenseOverdue = false;
    
    // Buscar estatísticas do usuário
    let statistics = await this.statisticsRepository.findOne({
      where: { user: { id: job.user.id } },
      relations: ['user', 'airline']
    });

    if (statistics) {
      licenseOverdue = await this.isLicenseOverdue(job.user.id);
      
      if (!licenseOverdue) {
        if (jobPilotScore != null) {
          statistics.pilotScore += jobPilotScore;
          job.pilotScore = jobPilotScore;
        } else {
          if (job.aviationType === 1) {
            statistics.pilotScore += Math.floor(job.distance / 10);
            job.pilotScore = Math.floor(job.distance / 10);
          } else {
            statistics.pilotScore += Math.floor(job.distance / 15);
            job.pilotScore = Math.floor(job.distance / 10);
          }
        }
        
        statistics.bankBalance += job.pay;
        await this.statisticsRepository.update({ id: statistics.id }, statistics);
      }
    } else {
      // Criar novas estatísticas
      statistics = this.statisticsRepository.create({
        bankBalance: job.pay,
        pilotScore: job.aviationType === 1 ? Math.floor(job.distance / 10) : Math.floor(job.distance / 15),
        logo: '/Content/img/default.jpg',
        user: job.user
      });
      await this.statisticsRepository.save(statistics);
    }

    return licenseOverdue;
  }

  /**
   * Atualiza dados da airline após completar um job.
   * Equivalente ao UpdateAirline do legado.
   */
  private async updateAirline(job: Job, resultMessages?: string[]): Promise<void> {
    // Buscar estatísticas do usuário com airline
    const statistics = await this.statisticsRepository.findOne({
      where: { user: { id: job.user.id } },
      relations: ['airline']
    });

    if (!statistics || !statistics.airline) {
      return;
    }

    // Buscar airline completa com owner
    const airline = await this.airlinesRepository.findOne({
      where: { id: statistics.airline.id },
      relations: ['owner']
    });

    if (!airline) {
      return;
    }

    // Criar JobAirline e calcular valores
    const jobAirline = this.jobAirlineRepository.create({
      airline: airline,
      job: job
    });

    // Buscar FBO de partida
    const departureFbo = await this.airlineFboRepository.findOne({
      where: { airline: { id: airline.id }, icao: job.departureICAO }
    });

    // Calcular valores do job da airline
    jobAirline.calcAirlineJob(departureFbo);

    // Verificar se airline tem dívida vencida
    if (airline.debtValue > 0 && airline.debtMaturityDate < new Date()) {
      // Tem dívida, não pontua e perde dinheiro
      airline.bankBalance -= Math.floor(jobAirline.flightIncome / 2);
      
      if (airline.bankBalance <= 0) {
        airline.bankBalance = 0;
      }
    } else {
      // Pontua e ganha
      airline.airlineScore += Math.floor(job.distance / 14);
      airline.airlineScore += departureFbo ? departureFbo.scoreIncrease : 0;
      airline.bankBalance += Math.floor(jobAirline.revenueEarned);
    }

    // Aplicar débitos somente para airlines compradas (userId não vazio)
    if (airline.userId) {
      if (airline.debtValue === 0) {
        // Aplicar o vencimento (5 dias)
        airline.debtMaturityDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      }

      // Aplicar o débito
      airline.debtValue += Math.floor(jobAirline.totalFlightCost);

      // TODO: Enviar email de alerta se airline.debtValue > 0
      // Isso deve ser feito via fila/buffer para não bloquear a resposta
      if (airline.debtValue > 0) {
        this.logger.warn(`Airline ${airline.name} has debt: ${airline.debtValue}. Email notification should be sent.`);
      }
    }

    // Salvar alterações
    await this.airlinesRepository.save(airline);
    await this.jobAirlineRepository.save(jobAirline);
  }
}
