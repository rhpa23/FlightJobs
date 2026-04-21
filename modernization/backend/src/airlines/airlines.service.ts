import { Injectable, NotFoundException, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Airline } from './entities/airline.entity';
import { AirlineFbo } from './entities/airline-fbo.entity';
import { Statistics } from '../statistics/entities/statistics.entity';
import { User } from '../users/entities/user.entity';
import { Job } from '../jobs/entities/job.entity';
import { PaginatedAirlineFilterDto } from './dto/paginated-airline-filter.dto';
import { AirlineToDto } from './dto/airline-to.dto';
import { PayDebtDto } from './dto/pay-debt.dto';
import { HireFboDto } from './dto/hire-fbo.dto';
import { JobFilterDto } from './dto/job-filter.dto';
import { PaginatedAirlinesDto } from './dto/paginated-airlines.dto';
import { PaginatedAirlineJobsDto } from './dto/paginated-airline-jobs.dto';
import { UserSimpleDto } from './dto/user-simple.dto';
import { CreateAirlineDto } from './dto';
import { NavdataService } from '../navdata/navdata.service';

@Injectable()
export class AirlinesService {
  constructor(
    @InjectRepository(Airline)
    private airlinesRepository: Repository<Airline>,
    @InjectRepository(AirlineFbo)
    private airlineFboRepository: Repository<AirlineFbo>,
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
    @Inject(forwardRef(() => NavdataService))
    private navdataService: NavdataService,
  ) {}

  async getAirliners(
    sortOrder: string,
    currentSort: string,
    pageNumber: number,
    airlineFilter: PaginatedAirlineFilterDto
  ): Promise<PaginatedAirlinesDto> {
    const pageSize = 40;
    const actualPageNumber = pageNumber || 1;

    // Build query with filters
    const queryBuilder = this.airlinesRepository.createQueryBuilder('airline')
      .where(
        '(LOWER(airline.name) = LOWER(:name) OR :name IS NULL) AND ' +
        '(LOWER(airline.country) = LOWER(:country) OR :country IS NULL)',
        {
          name: airlineFilter.name || null,
          country: airlineFilter.country || null
        }
      )
      .orderBy('airline.airlineScore', 'DESC');

    // Get total count
    const totalItemCount = await queryBuilder.getCount();

    // Get user statistics to check if user has an airline
    const userStatistics = await this.statisticsRepository.findOne({
      where: { userId: airlineFilter.userId.toString() },
      relations: ['airline']
    });

    // Get paginated results
    let airlines = await queryBuilder
      .skip((actualPageNumber - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // Remove user's airline from list if they have one
    if (userStatistics?.airline) {
      airlines = airlines.filter(airline => airline.id !== userStatistics.airline.id);
    }

    // Add pilots count for each airline
    const airlinesWithPilotsCount = await Promise.all(
      airlines.map(async (airline) => {
        const pilotCount = await this.statisticsRepository
          .createQueryBuilder('stats')
          .where('stats.Airline_Id = :airlineId', { airlineId: airline.id })
          .getCount();
        return {
          ...airline,
          pilots: Array(pilotCount).fill(null), // Create array with pilot count for frontend compatibility
          pilotsCount: pilotCount
        };
      })
    );

    const pageCount = Math.ceil(totalItemCount / pageSize);

    return {
      hasNextPage: actualPageNumber < pageCount,
      hasPreviousPage: actualPageNumber > 1,
      isFirstPage: actualPageNumber === 1,
      isLastPage: actualPageNumber === pageCount,
      pageCount,
      pageNumber: actualPageNumber,
      pageSize,
      totalItemCount,
      airlines: airlinesWithPilotsCount
    };
  }

  async getPilotsHired(id: number): Promise<UserSimpleDto[]> {
    // Get all users who have this airline assigned in their statistics
    const userStatistics = await this.statisticsRepository.find({
      where: { airline: { id } },
      relations: ['user']
    });

    return userStatistics.map(stat => ({
      id: parseInt(stat.user.id),
      userName: stat.user.userName || '',
      email: stat.user.email || ''
    }));
  }

  async getAirlineFBOs(id: number): Promise<any[]> {
    // Get all FBOs hired by this airline
    const airlineFbos = await this.airlineFboRepository.find({
      where: { airline: { id } },
      relations: ['airline']
    });

    // Return AirlineFbo data directly (no separate FBO entity exists)
    return airlineFbos.map(airlineFbo => ({
      id: airlineFbo.id,
      icao: airlineFbo.icao,
      name: airlineFbo.icao, // Use ICAO as name since no separate FBO entity
      runwaySize: 0,
      elevation: 0,
      availability: airlineFbo.availability,
      scoreIncrease: airlineFbo.scoreIncrease,
      fuelPriceDiscount: airlineFbo.fuelPriceDiscount,
      groundCrewDiscount: airlineFbo.groundCrewDiscount,
      price: airlineFbo.price
    }));
  }

  async createAirline(airlineTo: CreateAirlineDto, userId: string): Promise<any> {
    const AIRLINE_PRICE = 40000; // From C# AirlinesController.AIRLINE_PRICE

    // Get user statistics
    const statistics = await this.statisticsRepository.findOne({
      where: { userId },
      relations: ['user']
    });

    if (!statistics || statistics.bankBalance < AIRLINE_PRICE) {
      throw new HttpException('Insufficient balance to create airline', HttpStatus.NO_CONTENT);
    }

    // Create airline
    const airline = this.airlinesRepository.create({
      name: airlineTo.name,
      description: airlineTo.description,
      country: airlineTo.country,
      salary: 20,
      score: airlineTo.score,
      userId: userId,
      debtMaturityDate: new Date(),
      bankBalance: 1000,
      logo: airlineTo.logo || null
    });

    const savedAirline = await this.airlinesRepository.save(airline);

    // Update user statistics - deduct balance and assign airline
    statistics.bankBalance = statistics.bankBalance - AIRLINE_PRICE;
    statistics.airline = savedAirline;
    await this.statisticsRepository.save(statistics);

    return savedAirline;
  }

  async updateAirline(airlineTo: AirlineToDto, userId: string): Promise<boolean> {
    const GUEST_EMAIL = 'rhpa23@yahoo.com.br'; // From C# AccountController.GuestEmail

    // Check if user is guest
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (user && user.email === GUEST_EMAIL) {
      throw new NotFoundException('Guest users cannot update airlines');
    }

    const airline = await this.airlinesRepository.findOne({
      where: { 
        id: airlineTo.id, 
        userId: userId
      }
    });

    if (!airline) {
      throw new NotFoundException('Airline not found or access denied');
    }

    // Update airline fields
    airline.name = airlineTo.name;
    airline.description = airlineTo.description;
    airline.country = airlineTo.country;
    airline.score = airlineTo.score;
    airline.logo = airlineTo.logo;

    await this.airlinesRepository.save(airline);

    return true;
  }

  async payAirlineDebts(payDebtDto: PayDebtDto, userId: string): Promise<boolean> {
    // Get airline
    const airline = await this.airlinesRepository.findOne({
      where: { id: payDebtDto.id }
    });

    if (!airline) {
      throw new NotFoundException('Airline not found');
    }

    // Get user statistics
    const statistics = await this.statisticsRepository.findOne({
      where: { userId }
    });

    if (!statistics) {
      throw new NotFoundException('User statistics not found');
    }

    // Check if airline has debt
    if (airline.debtValue <= 0) {
      throw new HttpException('No debt to pay', HttpStatus.BAD_REQUEST);
    }

    // Check if airline has sufficient balance
    if (airline.bankBalance < airline.debtValue) {
      throw new HttpException('Airline doesn\'t have enough bank balance to pay debt', HttpStatus.BAD_REQUEST);
    }

    // Pay debt - deduct from airline bank balance
    airline.bankBalance = airline.bankBalance - airline.debtValue;
    airline.debtValue = 0;
    airline.debtMaturityDate = new Date();

    await this.airlinesRepository.save(airline);

    return true;
  }

  async getAirlineLedger(
    airlineId: number,
    pageNumber: number,
    jobFilter: JobFilterDto
  ): Promise<PaginatedAirlineJobsDto> {
    const pageSize = 6;
    const actualPageNumber = pageNumber || 1;

    // Get user IDs in this airline
    const userStats = await this.statisticsRepository.find({
      where: { airline: { id: airlineId } },
      select: ['userId']
    });
    const userIds = userStats.map(stat => stat.userId);

    if (userIds.length === 0) {
      return {
        hasNextPage: false,
        hasPreviousPage: false,
        isFirstPage: true,
        isLastPage: true,
        pageCount: 0,
        pageNumber: 1,
        pageSize,
        totalItemCount: 0,
        airlineJobs: []
      };
    }

    // Build query for jobs related to this airline
    // Select dates as raw strings to avoid timezone conversion issues
    const queryBuilder = this.jobsRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.user', 'user')
      .select([
        'job.id',
        'job.paxWeight',
        'job.departureICAO',
        'job.arrivalICAO',
        'job.distance',
        'job.pax',
        'job.cargo',
        'job.pay',
        'job.isDone',
        'job.startTime',
        'job.endTime',
        'job.modelName',
        'job.modelDescription',
        'job.startFuelWeight',
        'job.finishFuelWeight',
        'job.aviationType',
        'user.id',
        'user.userName',
      ])
      .where('job.user.id IN (:...userIds)', { userIds })
      .andWhere('job.isDone = :isDone', { isDone: true });

    // Apply departure filter if provided
    if (jobFilter.departure && jobFilter.departure.length === 4) {
      queryBuilder.andWhere('job.departureICAO = :departure', { departure: jobFilter.departure.toUpperCase() });
    }

    // Apply arrival filter if provided
    if (jobFilter.arrival && jobFilter.arrival.length === 4) {
      queryBuilder.andWhere('job.arrivalICAO = :arrival', { arrival: jobFilter.arrival.toUpperCase() });
    }

    // Clone for count query
    const countQuery = queryBuilder.clone();

    // Get total count
    const totalItemCount = await countQuery.getCount();

    // Get paginated results
    const jobs = await queryBuilder
      .orderBy('job.startTime', 'DESC')
      .addOrderBy('job.id', 'DESC')
      .skip((actualPageNumber - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // Get airline FBOs for fuel discount calculation
    const airlineFbos = await this.airlineFboRepository.find({
      where: { airline: { id: airlineId } }
    });

    // Calculate ledger data for each job
    const airlineJobs = jobs.map(job => {
      const departureFbo = airlineFbos.find(fbo => fbo.icao === job.departureICAO);

      // FuelPrice based on AviationType (legado: AviationType > 1 ? 5.20 : 5.70)
      const fuelPrice = job.aviationType > 1 ? 5.20 : 5.70;

      // FlightCrewCost = JobPay + (JobPay * 0.8) = JobPay * 1.8
      const flightCrewCost = job.pay + (job.pay * 0.8);

      // GroundCrewCost = FlightCrewCost * 0.3
      let groundCrewCost = flightCrewCost * 0.3;

      // Calculate fuel cost with discount (legado logic)
      const fuelBurned = job.startFuelWeight - job.finishFuelWeight;
      let fuelCostWithoutDiscount = fuelBurned * fuelPrice;
      let fuelCost = fuelCostWithoutDiscount;

      let grCrewDiscount = 0.0;
      if (departureFbo) {
        // Apply fuel discount to fuel price (legado: this.FuelPrice -= fuelDiscount)
        const fuelDiscount = fuelPrice * departureFbo.fuelPriceDiscount;
        const fuelPriceWithDiscount = fuelPrice - fuelDiscount;

        // Recalculate fuel cost with discounted price
        fuelCost = fuelBurned * fuelPriceWithDiscount;

        // Apply ground crew discount (legado: this.GroundCrewCost -= grCrewDiscount)
        grCrewDiscount = groundCrewCost * departureFbo.groundCrewDiscount;
        groundCrewCost -= grCrewDiscount;
      }

      // FuelCostPerNM = FuelCost / Dist
      const fuelCostPerNm = fuelCost / (job.distance || 1);

      // FlightAttendantCost = (JobPax / 60) * (21 * JobFlightTimeHours)
      const flightTimeHours = this.calculateFlightTimeHours(job.startTime, job.endTime);
      const flightAttendantCost = (job.pax / 60) * (21 * flightTimeHours);

      // TotalCrewCostLabor = FlightCrewCost + FlightAttendantCost
      const totalCrewCostLabor = flightCrewCost + flightAttendantCost;

      // TotalFlightCost = TotalCrewCostLabor + FuelCost + GroundCrewCost
      const totalFlightCost = totalCrewCostLabor + fuelCost + groundCrewCost;

      // RevenueEarned = TotalFlightCost * 1.35
      let revenueEarned = totalFlightCost * 1.35;

      // If has FBO, add back the discounts to revenue
      if (departureFbo) {
        revenueEarned += grCrewDiscount;
        revenueEarned += (fuelCostWithoutDiscount - fuelCost);
      }

      // FlightIncome = RevenueEarned - TotalFlightCost
      const flightIncome = revenueEarned - totalFlightCost;

      return {
        id: job.id,
        departureICAO: job.departureICAO,
        arrivalICAO: job.arrivalICAO,
        modelDescription: job.modelDescription,
        modelName: job.modelName,
        distance: job.distance,
        flightTime: this.calculateFlightTime(job.startTime, job.endTime),
        pax: job.pax,
        payload: (job.pax * (job.paxWeight > 0 ? job.paxWeight : 84)) + job.cargo,
        fuelLoaded: job.startFuelWeight,
        fuelBurned: fuelBurned,
        fuelPricePerKg: fuelPrice,
        fuelCost: fuelCost,
        fuelCostPerNm: fuelCostPerNm,
        groundCrewCost: groundCrewCost,
        flightCrewCost: flightCrewCost,
        flightAttendantCost: flightAttendantCost,
        totalCrewCost: totalCrewCostLabor,
        totalFlightCost: totalFlightCost,
        revenue: revenueEarned,
        flightIncome: flightIncome,
        userName: job.user?.userName || 'Unknown',
        startTime: job.startTime,
        endTime: job.endTime
      };
    });

    const pageCount = Math.ceil(totalItemCount / pageSize) || 1;

    return {
      hasNextPage: actualPageNumber < pageCount,
      hasPreviousPage: actualPageNumber > 1,
      isFirstPage: actualPageNumber === 1,
      isLastPage: actualPageNumber === pageCount,
      pageCount,
      pageNumber: actualPageNumber,
      pageSize,
      totalItemCount,
      airlineJobs
    };
  }

  private calculateFlightTime(startTime: Date, endTime: Date): string {
    if (!startTime || !endTime) return '00:00';
    const start = this.parseDateAsUTC(startTime);
    const end = this.parseDateAsUTC(endTime);
    const diff = end.getTime() - start.getTime();
    if (diff < 0) return '00:00';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private calculateFlightTimeHours(startTime: Date, endTime: Date): number {
    if (!startTime || !endTime) return 0;
    const start = this.parseDateAsUTC(startTime);
    const end = this.parseDateAsUTC(endTime);
    const diff = end.getTime() - start.getTime();
    if (diff < 0) return 0;
    return diff / (1000 * 60 * 60);
  }

  /**
   * Parse date treating it as UTC to avoid timezone conversion issues.
   * SQLite stores dates without timezone, so we need to treat them as UTC
   * and calculate the difference directly.
   */
  private parseDateAsUTC(dateValue: Date | string): Date {
    if (!dateValue) return null;
    
    // If it's already a Date, extract the ISO string and re-parse as UTC
    const dateStr = dateValue instanceof Date ? dateValue.toISOString() : String(dateValue);
    
    // Parse as UTC by appending Z
    const utcDate = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z');
    
    return utcDate;
  }

  async getFOBs(icao: string, airlineId: number): Promise<any[]> {
    let airports: any[] = [];

    if (!icao || icao.trim() === '') {
      // Get top 8 arrival airports from completed jobs
      const jobsDone = await this.jobsRepository.find({
        where: { isDone: true },
        select: ['arrivalICAO']
      });

      // Count arrivals per airport
      const arrivalCounts = new Map<string, number>();
      jobsDone.forEach(job => {
        const jobIcao = job.arrivalICAO?.toUpperCase();
        if (jobIcao) {
          arrivalCounts.set(jobIcao, (arrivalCounts.get(jobIcao) || 0) + 1);
        }
      });

      // Get top 5 airports
      const topArrivals = Array.from(arrivalCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);

      // Fetch airport data from navdata using NavdataService
      airports = this.navdataService.getAirportsByIcaos(topArrivals);
    } else {
      // Search airports by ICAO term
      airports = this.navdataService.getAirportsByTerm(icao);
    }

    // Get existing FBO hires for these airports
    const airportIcaos = airports.map(a => a.ident);
    const existingHires = await this.airlineFboRepository.find({
      where: { 
        airline: { id: airlineId },
        icao: In(airportIcaos)
      }
    });

    // Calculate FBO data for each airport
    const fboResults = airports.map(airport => {
      const countFbosInDB = existingHires.filter(f => f.icao === airport.ident).length;
      const runwaySize = airport.longestRunwayLength || 0;

      return {
        icao: airport.ident,
        name: airport.name,
        elevation: airport.altitude || 0,
        runwaySize: runwaySize,
        availability: 15 - countFbosInDB,
        scoreIncrease: Math.floor(runwaySize / 1123),
        fuelPriceDiscount: Math.round((runwaySize / 62423) * 100) / 100,
        groundCrewDiscount: Math.round((runwaySize / 41093) * 100) / 100,
        price: runwaySize * 78,
        isHired: existingHires.some(f => f.icao === airport.ident)
      };
    });

    return fboResults;
  }

  async hireAirlineFbo(hireFboTo: HireFboDto, userId: string): Promise<any> {
    // Get user statistics to find their airline
    const userStatistics = await this.statisticsRepository.findOne({
      where: { userId },
      relations: ['airline']
    });

    if (!userStatistics?.airline) {
      throw new HttpException('User does not have an airline', HttpStatus.BAD_REQUEST);
    }

    // Check if user is the owner of the airline
    const airline = await this.airlinesRepository.findOne({
      where: { 
        id: userStatistics.airline.id,
        userId: userId
      }
    });

    if (!airline) {
      throw new HttpException('Only the owner can hire FBOs for the airline', HttpStatus.BAD_REQUEST);
    }

    // Check if FBO already has 15 contracts
    const existingFboCount = await this.airlineFboRepository.count({
      where: { icao: hireFboTo.icao.toUpperCase() }
    });

    if (existingFboCount >= 15) {
      throw new HttpException('This FBO is not available. All contracts were hired.', HttpStatus.BAD_REQUEST);
    }

    // Check if airline already hired this FBO
    const existingHire = await this.airlineFboRepository.findOne({
      where: { 
        airline: { id: userStatistics.airline.id },
        icao: hireFboTo.icao.toUpperCase()
      }
    });

    if (existingHire) {
      throw new HttpException('This airline already hired this FBO', HttpStatus.BAD_REQUEST);
    }

    // Get airport data to calculate FBO price
    const airport = this.navdataService.getAirportByIcao(hireFboTo.icao);
    if (!airport) {
      throw new HttpException('Airport not found', HttpStatus.NOT_FOUND);
    }

    const runwaySize = airport.longestRunwayLength || 0;
    const fboPrice = runwaySize * 78;

    // Check if airline has sufficient balance
    if (airline.bankBalance < fboPrice) {
      throw new HttpException('Your airline doesn\'t have enough money to hire this FBO', HttpStatus.BAD_REQUEST);
    }

    // Create airline FBO record with calculated values
    const airlineFbo = this.airlineFboRepository.create({
      icao: hireFboTo.icao.toUpperCase(),
      airline: airline,
      availability: 15 - existingFboCount,
      scoreIncrease: Math.floor(runwaySize / 1123),
      fuelPriceDiscount: Math.round((runwaySize / 62423) * 100) / 100,
      groundCrewDiscount: Math.round((runwaySize / 41093) * 100) / 100,
      price: fboPrice
    });

    const savedAirlineFbo = await this.airlineFboRepository.save(airlineFbo);

    // Deduct from airline bank balance (not user balance)
    airline.bankBalance = airline.bankBalance - fboPrice;
    await this.airlinesRepository.save(airline);

    return {
      data: {
        fboHired: {
          id: savedAirlineFbo.id,
          icao: savedAirlineFbo.icao,
          name: airport.name,
          price: savedAirlineFbo.price,
          fuelPriceDiscount: savedAirlineFbo.fuelPriceDiscount,
          groundCrewDiscount: savedAirlineFbo.groundCrewDiscount
        }
      }
    };
  }

  async joinAirline(airlineId: number, userId: string): Promise<string> {
    const airline = await this.airlinesRepository.findOne({
      where: { id: airlineId }
    });

    if (!airline) {
      throw new NotFoundException('Airline not found');
    }

    // Get user statistics
    const statistics = await this.statisticsRepository.findOne({
      where: { userId },
      relations: ['airline']
    });

    if (!statistics) {
      throw new NotFoundException('User statistics not found');
    }

    // Check if user already has an airline
    if (statistics.airline) {
      throw new HttpException('You are already in an airline', HttpStatus.BAD_REQUEST);
    }

    // Check if user has sufficient pilot score
    const userPilotScore = statistics.pilotScore;
    const requiredScore = airline.score;

    if (userPilotScore >= requiredScore) {
      // Update user statistics to assign airline
      statistics.airline = airline;
      await this.statisticsRepository.save(statistics);

      return `Congratulations, you signed contract with ${airline.name} airline in Brazil.`;
    } else {
      throw new HttpException(
        `You need ${requiredScore} scores to join with ${airline.name}. *** Your current score is: ${userPilotScore} ***`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async exitAirline(airlineId: number, userId: string): Promise<void> {
    // Get user statistics
    const statistics = await this.statisticsRepository.findOne({
      where: { userId },
      relations: ['airline']
    });

    if (!statistics) {
      throw new NotFoundException('User statistics not found');
    }

    // Check if user is actually in the specified airline
    if (!statistics.airline || statistics.airline.id !== airlineId) {
      throw new NotFoundException('User not found in specified airline');
    }

    // Check if user is the airline owner (they cannot exit their own airline)
    const airline = await this.airlinesRepository.findOne({
      where: { id: airlineId }
    });

    if (airline && airline.userId === userId) {
      throw new HttpException('Airline owners cannot exit their own airline', HttpStatus.BAD_REQUEST);
    }

    // Update user statistics to set airline to null
    statistics.airline = null;
    await this.statisticsRepository.save(statistics);
  }

  async getRanking(): Promise<any[]> {
    const airlines = await this.airlinesRepository.find({
      order: { airlineScore: 'DESC' },
      take: 5
    });

    return airlines;
  }

  async getMyAirline(userId: string): Promise<any> {
    // Get user statistics to find their airline
    const userStatistics = await this.statisticsRepository.findOne({
      where: { userId },
      relations: ['airline']
    });

    if (!userStatistics?.airline) {
      return null;
    }

    // Get full airline data with owner relation
    const airline = await this.airlinesRepository.findOne({
      where: { id: userStatistics.airline.id },
      relations: ['owner']
    });

    if (!airline) {
      return null;
    }

    // Get FBO count for this airline
    const fboCount = await this.airlineFboRepository.count({
      where: { airline: { id: airline.id } }
    });

    // Determine if user is the owner
    const isOwner = airline.userId === userId;

    // Return enriched airline data
    return {
      ...airline,
      bankDebt: airline.debtValue > 0 ? airline.debtValue : null,
      fboCount: fboCount,
      alowEdit: isOwner,
      alowExit: !isOwner
    };
  }

  async getStatistics(id: number): Promise<any> {
    // Get airline to verify it exists
    const airline = await this.airlinesRepository.findOne({ where: { id } });
    if (!airline) {
      throw new NotFoundException(`Airline with ID ${id} not found`);
    }

    // Get all users in this airline
    const userStatistics = await this.statisticsRepository.find({
      where: { airline: { id } },
      relations: ['user']
    });

    const userIds = userStatistics.map(stat => stat.userId);

    // Calculate monthly earnings for the last 3 months
    const now = new Date();
    const months: string[] = [];
    const earnings: number[] = [];

    for (let i = 2; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      months.push(monthName);

      const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

      let monthEarnings = 0;

      // Get completed jobs for all users in this airline in this month
      if (userIds.length > 0) {
        const jobsQuery = this.jobsRepository.createQueryBuilder('job')
          .where('job.isDone = :isDone', { isDone: true })
          .andWhere('job.endTime >= :startOfMonth', { startOfMonth: startOfMonth.toISOString() })
          .andWhere('job.endTime <= :endOfMonth', { endOfMonth: endOfMonth.toISOString() })
          .andWhere('job.User_Id IN (:...userIds)', { userIds });

        const jobsInMonth = await jobsQuery.getMany();
        monthEarnings = jobsInMonth.reduce((sum, job) => sum + (job.pay || 0), 0);
      }

      earnings.push(monthEarnings);
    }

    const totalEarnings = earnings.reduce((sum, val) => sum + val, 0);

    return {
      monthlyEarnings: {
        labels: months,
        data: earnings,
        total: totalEarnings
      }
    };
  }

  // Keep existing methods for backward compatibility
  async findAll(): Promise<Airline[]> {
    const airlines = await this.airlinesRepository.find();

    // Add pilots count for each airline
    const airlinesWithPilotsCount = await Promise.all(
      airlines.map(async (airline) => {
        const pilotCount = await this.statisticsRepository
          .createQueryBuilder('stats')
          .where('stats.Airline_Id = :airlineId', { airlineId: airline.id })
          .getCount();
        return {
          ...airline,
          pilots: Array(pilotCount).fill(null), // Create array with pilot count for frontend compatibility
          pilotsCount: pilotCount
        };
      })
    );

    return airlinesWithPilotsCount;
  }

  async findOne(id: number): Promise<Airline> {
    const airline = await this.airlinesRepository.findOne({ where: { id } });
    if (!airline) {
      throw new NotFoundException(`Airline with ID ${id} not found`);
    }
    return airline;
  }

  async remove(id: number): Promise<void> {
    const airline = await this.findOne(id);
    await this.airlinesRepository.remove(airline);
  }
}
