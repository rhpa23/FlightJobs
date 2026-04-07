import { Repository } from 'typeorm';
import { Statistics } from './entities/statistics.entity';
export declare class StatisticsService {
    private statisticsRepository;
    constructor(statisticsRepository: Repository<Statistics>);
    getMyStats(userId: string): Promise<any>;
    getDashboard(userId: string): Promise<{
        user: {
            id: string;
        };
        statistics: {
            bankBalance: number;
            pilotScore: number;
        };
        pendingJobs: any[];
        activeJob: any;
    }>;
    getLeaderboard(): Promise<any[]>;
}
