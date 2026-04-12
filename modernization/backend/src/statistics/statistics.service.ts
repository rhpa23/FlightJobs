import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statistics } from './entities/statistics.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
  ) {}

  async getMyStats(userId: string): Promise<any> {
    const stats = await this.statisticsRepository.findOne({
      where: { userId },
      relations: ['customPlaneCapacity'],
    });
    if (!stats) {
      // Retorna stats padrão se não existir
      return {
        id: '0',
        bankBalance: 0,
        pilotScore: 0,
        numberFlights: 0,
        flightTimeTotal: '0',
        payloadTotal: '0',
        weightUnit: 'kg',
        customPlaneCapacity: null,
      };
    }
    return {
      id: stats.id?.toString() || '0',
      bankBalance: stats.bankBalance || 0,
      pilotScore: stats.pilotScore || 0,
      numberFlights: 0,
      flightTimeTotal: '0',
      payloadTotal: '0',
      weightUnit: stats.weightUnit || 'kg',
      customPlaneCapacity: stats.customPlaneCapacity ? {
        id: stats.customPlaneCapacity.id,
        planeName: stats.customPlaneCapacity.planeName,
        paxCapacity: stats.customPlaneCapacity.paxCapacity,
        paxWeight: stats.customPlaneCapacity.paxWeight,
        cargoCapacity: stats.customPlaneCapacity.cargoCapacity,
        imageUrl: stats.customPlaneCapacity.imageUrl,
      } : null,
    };
  }

  async getDashboard(userId: string) {
    const stats = await this.statisticsRepository.findOne({
      where: { userId },
    });
    
    return {
      user: {
        id: userId,
      },
      statistics: stats ? {
        bankBalance: stats.bankBalance || 0,
        pilotScore: stats.pilotScore || 0,
      } : {
        bankBalance: 0,
        pilotScore: 0,
      },
      pendingJobs: [],
      activeJob: null,
    };
  }

  async getLeaderboard(): Promise<any[]> {
    const statsList = await this.statisticsRepository.find({
      order: { pilotScore: 'DESC' },
      take: 100,
    });
    
    return statsList.map((stats, index) => ({
      user: { id: stats.userId },
      statistics: stats,
      rank: index + 1,
    }));
  }
}
