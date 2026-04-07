import { StatisticsService } from './statistics.service';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getDashboard(req: any): Promise<{
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
    getMyStats(req: any): Promise<any>;
    getScoreLeaderboard(): Promise<any[]>;
    getFlightsLeaderboard(): Promise<any[]>;
    getEarningsLeaderboard(): Promise<any[]>;
}
