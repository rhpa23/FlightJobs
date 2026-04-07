import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { CompleteJobDto } from './dto/complete-job.dto';
import { StartJobDto } from './dto/start-job.dto';
import { FinishJobDto } from './dto/finish-job.dto';
import { StartJobResponseDto } from './dto/start-job-response.dto';
import { FinishJobResponseDto } from './dto/finish-job-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'List all jobs' })
  findAll() {
    return this.jobsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search jobs' })
  search(@Query() searchDto: SearchJobsDto) {
    return this.jobsService.search(searchDto);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending jobs for current user' })
  findPendingJobs(@Request() req) {
    return this.jobsService.findPendingJobs(req.user.userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active job for current user' })
  findActiveJob(@Request() req) {
    return this.jobsService.findActiveJob(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  findOne(@Param('id') id: number) {
    return this.jobsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create job' })
  create(@Body() jobData: Partial<Job>) {
    return this.jobsService.create(jobData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update job' })
  update(@Param('id') id: number, @Body() jobData: Partial<Job>) {
    return this.jobsService.update(id, jobData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job' })
  remove(@Param('id') id: number) {
    return this.jobsService.remove(id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate job' })
  activateJob(@Param('id') id: number) {
    return this.jobsService.activateJob(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete job' })
  completeJob(@Param('id') id: number, @Body() completeDto: CompleteJobDto) {
    return this.jobsService.completeJob(id, completeDto);
  }

  // ============================================================================
  // NOVOS ENDPOINTS - StartJob e FinishJob (equivalentes ao legado)
  // ============================================================================

  @Post('start')
  @ApiOperation({ summary: 'Start a job by coordinates (equivalent to StartJobMSFS)' })
  async startJob(@Request() req, @Body() startDto: StartJobDto): Promise<StartJobResponseDto> {
    return this.jobsService.startJob(req.user.userId, startDto);
  }

  @Post('finish')
  @ApiOperation({ summary: 'Finish a job by coordinates (equivalent to FinishJobMsfsPost)' })
  async finishJob(@Request() req, @Body() finishDto: FinishJobDto): Promise<FinishJobResponseDto> {
    return this.jobsService.finishJob(req.user.userId, finishDto);
  }
}
