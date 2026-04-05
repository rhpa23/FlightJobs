import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('statistics')
@Controller('statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('my-stats')
  @ApiOperation({ summary: 'Get current user stats' })
  getMyStats(@Request() req) {
    return this.statisticsService.getMyStats(req.user.userId);
  }

  @Get('leaderboard/score')
  @ApiOperation({ summary: 'Score leaderboard' })
  getScoreLeaderboard() {
    return this.statisticsService.getLeaderboard();
  }

  @Get('leaderboard/flights')
  @ApiOperation({ summary: 'Flights leaderboard' })
  getFlightsLeaderboard() {
    return this.statisticsService.getLeaderboard();
  }

  @Get('leaderboard/earnings')
  @ApiOperation({ summary: 'Earnings leaderboard' })
  getEarningsLeaderboard() {
    return this.statisticsService.getLeaderboard();
  }
}
