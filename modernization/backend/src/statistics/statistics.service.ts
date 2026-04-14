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

  async getMonthlyEarnings(userId: string): Promise<any> {
    // Data de 6 meses atrás
    const tempDate = new Date();
    tempDate.setMonth(tempDate.getMonth() - 6);
    const dateFilter = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1);

    // Busca jobs concluídos dos últimos 6 meses usando QueryBuilder
    const completedJobs = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('job.isDone = :isDone', { isDone: true })
      .andWhere('job.startTime > :dateFilter', { dateFilter })
      .getMany();

    // Agrupa por mês e soma os pagamentos
    const monthlyData: Record<string, number> = {};
    let totalEarnings = 0;

    for (const job of completedJobs) {
      if (!job.startTime) continue;

      // Formata o mês como "MMM/yyyy" (ex: "Jan/2026")
      const monthKey = this.formatMonthKey(job.startTime);

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += job.pay || 0;
      totalEarnings += job.pay || 0;
    }

    // Calcula a meta do mês atual (máximo dos meses anteriores + 1000)
    let monthGoal = 0;
    const currentMonthKey = this.formatMonthKey(new Date());
    const previousMonths = Object.entries(monthlyData).filter(([key]) => key !== currentMonthKey);

    if (previousMonths.length > 0) {
      const maxPrevious = Math.max(...previousMonths.map(([, value]) => value));
      monthGoal = maxPrevious + 1000;
    } else if (Object.keys(monthlyData).length > 0) {
      monthGoal = Math.max(...Object.values(monthlyData)) + 1000;
    }

    // Ordena os meses cronologicamente
    const sortedMonths = Object.entries(monthlyData).sort((a, b) => {
      return this.parseMonthKey(a[0]).getTime() - this.parseMonthKey(b[0]).getTime();
    });

    return {
      labels: sortedMonths.map(([month]) => month),
      data: sortedMonths.map(([, value]) => value),
      totalSixMonths: totalEarnings,
      monthGoal,
    };
  }

  private formatMonthKey(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]}/${date.getFullYear()}`;
  }

  private parseMonthKey(monthKey: string): Date {
    const months: Record<string, number> = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
    };
    const [month, year] = monthKey.split('/');
    return new Date(parseInt(year), months[month] || 0, 1);
  }
}
