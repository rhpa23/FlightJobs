"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const statistics_entity_1 = require("./entities/statistics.entity");
let StatisticsService = class StatisticsService {
    constructor(statisticsRepository) {
        this.statisticsRepository = statisticsRepository;
    }
    async getMyStats(userId) {
        const stats = await this.statisticsRepository.findOne({
            where: { userId },
        });
        if (!stats) {
            return {
                id: '0',
                bankBalance: 0,
                pilotScore: 0,
                numberFlights: 0,
                flightTimeTotal: '0',
                payloadTotal: '0',
                weightUnit: 'kg',
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
        };
    }
    async getDashboard(userId) {
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
    async getLeaderboard() {
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
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(statistics_entity_1.Statistics)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map