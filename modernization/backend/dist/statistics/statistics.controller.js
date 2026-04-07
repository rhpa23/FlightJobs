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
exports.StatisticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const statistics_service_1 = require("./statistics.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let StatisticsController = class StatisticsController {
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
    }
    async getDashboard(req) {
        return this.statisticsService.getDashboard(req.user.userId);
    }
    getMyStats(req) {
        return this.statisticsService.getMyStats(req.user.userId);
    }
    getScoreLeaderboard() {
        return this.statisticsService.getLeaderboard();
    }
    getFlightsLeaderboard() {
        return this.statisticsService.getLeaderboard();
    }
    getEarningsLeaderboard() {
        return this.statisticsService.getLeaderboard();
    }
};
exports.StatisticsController = StatisticsController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard data' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('my-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user stats' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getMyStats", null);
__decorate([
    (0, common_1.Get)('leaderboard/score'),
    (0, swagger_1.ApiOperation)({ summary: 'Score leaderboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getScoreLeaderboard", null);
__decorate([
    (0, common_1.Get)('leaderboard/flights'),
    (0, swagger_1.ApiOperation)({ summary: 'Flights leaderboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getFlightsLeaderboard", null);
__decorate([
    (0, common_1.Get)('leaderboard/earnings'),
    (0, swagger_1.ApiOperation)({ summary: 'Earnings leaderboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StatisticsController.prototype, "getEarningsLeaderboard", null);
exports.StatisticsController = StatisticsController = __decorate([
    (0, swagger_1.ApiTags)('statistics'),
    (0, common_1.Controller)('statistics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [statistics_service_1.StatisticsService])
], StatisticsController);
//# sourceMappingURL=statistics.controller.js.map