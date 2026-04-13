import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statistics } from './entities/statistics.entity';
import { Job } from '../jobs/entities/job.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Statistics)
    private statisticsRepository: Repository<Statistics>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async getMyStats(userId: string): Promise<any> {
    const stats = await this.statisticsRepository.findOne({
      where: { userId },
      relations: ['customPlaneCapacity'],
    });

    // Busca todos os jobs concluídos do usuário para calcular estatísticas
    const completedJobs = await this.jobRepository.find({
      where: { user: { id: userId }, isDone: true },
    });

    // Calcula estatísticas dos voos
    const numberFlights = completedJobs.length;
    let totalFlightMinutes = 0;
    let totalPayload = 0;

    for (const job of completedJobs) {
      // Calcula tempo de voo em minutos
      if (job.startTime && job.endTime) {
        const diffMs = new Date(job.endTime).getTime() - new Date(job.startTime).getTime();
        totalFlightMinutes += Math.floor(diffMs / (1000 * 60));
      }
      // Soma payload (pax + cargo)
      totalPayload += (job.pax || 0) + (job.cargo || 0);
    }

    // Formata tempo total como hh:mm
    const hours = Math.floor(totalFlightMinutes / 60);
    const minutes = totalFlightMinutes % 60;
    const flightTimeTotal = `${hours}:${minutes.toString().padStart(2, '0')}`;

    if (!stats) {
      // Retorna stats padrão se não existir
      return {
        id: '0',
        bankBalance: 0,
        pilotScore: 0,
        numberFlights,
        flightTimeTotal,
        payloadTotal: totalPayload.toString(),
        weightUnit: 'kg',
        customPlaneCapacity: null,
      };
    }
    return {
      id: stats.id?.toString() || '0',
      bankBalance: stats.bankBalance || 0,
      pilotScore: stats.pilotScore || 0,
      numberFlights,
      flightTimeTotal,
      payloadTotal: totalPayload.toString(),
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
