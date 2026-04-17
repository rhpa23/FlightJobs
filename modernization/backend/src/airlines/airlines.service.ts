import { Injectable, NotFoundException, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    // Check if user has sufficient balance
    if (statistics.bankBalance < airline.debtValue) {
      throw new HttpException('Insufficient balance to pay debt', HttpStatus.BAD_REQUEST);
    }

    // Pay debt
    statistics.bankBalance = statistics.bankBalance - airline.debtValue;
    airline.debtValue = 0;
    airline.debtMaturityDate = new Date();

    await this.statisticsRepository.save(statistics);
    await this.airlinesRepository.save(airline);

    return true;
  }

  async getAirlineLedger(
    airlineId: number,
    pageNumber: number,
    jobFilter: JobFilterDto
  ): Promise<PaginatedAirlineJobsDto> {
    const pageSize = 40;
    const actualPageNumber = pageNumber || 1;

    // Build query for jobs related to this airline
    const queryBuilder = this.jobsRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.user', 'user')
      .where('job.user IN (SELECT User_Id FROM statisticsdbmodels WHERE Airline_Id = :airlineId)', { airlineId });

    // Apply filters if provided
    if (jobFilter.icao) {
      queryBuilder.andWhere('(job.departureICAO = :icao OR job.arrivalICAO = :icao)', { icao: jobFilter.icao });
    }

    // Get total count
    const totalItemCount = await queryBuilder.getCount();

    // Get paginated results
    const jobs = await queryBuilder
      .orderBy('job.startTime', 'DESC')
      .skip((actualPageNumber - 1) * pageSize)
      .take(pageSize)
      .getMany();

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
      airlineJobs: jobs
    };
  }

  async getFOBs(icao: string, airlineId: number): Promise<any[]> {
    // Check if airline already has this FBO hired
    const existingHire = await this.airlineFboRepository.findOne({
      where: { 
        airline: { id: airlineId },
        icao: icao.toUpperCase()
      }
    });

    // Return FBO information based on ICAO (no separate FBO entity)
    return [{
      icao: icao.toUpperCase(),
      name: icao.toUpperCase(), // Use ICAO as name since no separate FBO entity
      runwaySize: 0,
      elevation: 0,
      hasFuel: true,
      hasGroundCrew: true,
      fuelPrice: 1.0,
      groundCrewPrice: 100.0,
      isHired: !!existingHire,
      existingHireId: existingHire?.id || null
    }];
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

    // Check if airline already hired this FBO
    const existingHire = await this.airlineFboRepository.findOne({
      where: { 
        airline: { id: userStatistics.airline.id },
        icao: hireFboTo.icao.toUpperCase()
      }
    });

    if (existingHire) {
      throw new HttpException('FBO already hired by this airline', HttpStatus.BAD_REQUEST);
    }

    // Set default FBO price (no separate FBO entity)
    const fboPrice = 50000; // Default price
    if (userStatistics.bankBalance < fboPrice) {
      throw new HttpException('Insufficient balance to hire FBO', HttpStatus.BAD_REQUEST);
    }

    // Create airline FBO record
    const airlineFbo = this.airlineFboRepository.create({
      icao: hireFboTo.icao.toUpperCase(),
      airline: userStatistics.airline,
      availability: 100,
      scoreIncrease: 10,
      fuelPriceDiscount: 0.1,
      groundCrewDiscount: 0.15,
      price: fboPrice
    });

    const savedAirlineFbo = await this.airlineFboRepository.save(airlineFbo);

    // Update user balance
    userStatistics.bankBalance = userStatistics.bankBalance - fboPrice;
    await this.statisticsRepository.save(userStatistics);

    return {
      data: {
        fboHired: {
          id: savedAirlineFbo.id,
          icao: savedAirlineFbo.icao,
          name: savedAirlineFbo.icao, // Use ICAO as name
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
      bankDebt: airline.debtValue,
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
