import { Controller, Get, Delete, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { GetLogbookDto } from './dto/logbook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('logbook')
  @ApiOperation({ summary: 'Get user flight logbook with pagination and filters' })
  getLogbook(@Request() req, @Query() dto: GetLogbookDto) {
    return this.profileService.getLogbook(req.user.userId, dto);
  }

  @Delete('logbook/:jobId')
  @ApiOperation({ summary: 'Delete a job from user logbook' })
  deleteLogbookJob(@Request() req, @Param('jobId') jobId: number) {
    return this.profileService.deleteLogbookJob(req.user.userId, jobId);
  }

  @Get('licenses')
  @ApiOperation({ summary: 'Get user pilot licenses' })
  getLicenses(@Request() req) {
    return this.profileService.getLicenses(req.user.userId);
  }

  @Get('licenses/:licenseExpenseId/items')
  @ApiOperation({ summary: 'Get items for a specific license' })
  getLicenseItems(@Request() req, @Param('licenseExpenseId') licenseExpenseId: number) {
    return this.profileService.getLicenseItems(req.user.userId, licenseExpenseId);
  }

  @Post('licenses/items/:licenseItemId/buy')
  @ApiOperation({ summary: 'Buy a license item' })
  buyLicenseItem(@Request() req, @Param('licenseItemId') licenseItemId: number) {
    return this.profileService.buyLicenseItem(req.user.userId, licenseItemId);
  }

  @Get('graduations')
  @ApiOperation({ summary: 'Get available pilot graduations' })
  getGraduations() {
    return this.profileService.getGraduations();
  }
}
