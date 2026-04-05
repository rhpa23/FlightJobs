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

  async getMyStats(userId: string): Promise<Statistics> {
    const stats = await this.statisticsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!stats) {
      throw new NotFoundException('Statistics not found');
    }
    return stats;
  }

  async getLeaderboard(): Promise<Statistics[]> {
    return this.statisticsRepository.find({
      order: { pilotScore: 'DESC' },
      take: 100,
    });
  }
}
