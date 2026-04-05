import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { CompleteJobDto } from './dto/complete-job.dto';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  async findAll(): Promise<Job[]> {
    return this.jobsRepository.find();
  }

  async findOne(id: number): Promise<Job> {
    const job = await this.jobsRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async search(searchDto: SearchJobsDto): Promise<Job[]> {
    const queryBuilder = this.jobsRepository.createQueryBuilder('job')
      .where('job.isDone = :isDone', { isDone: false })
      .andWhere('job.isActivated = :isActivated', { isActivated: false });

    if (searchDto.departure) {
      queryBuilder.andWhere('job.departureICAO = :departure', { departure: searchDto.departure });
    }
    if (searchDto.arrival) {
      queryBuilder.andWhere('job.arrivalICAO = :arrival', { arrival: searchDto.arrival });
    }
    if (searchDto.aviationType) {
      queryBuilder.andWhere('job.aviationType = :aviationType', { aviationType: searchDto.aviationType });
    }

    return queryBuilder.getMany();
  }

  async findPendingJobs(userId: string): Promise<Job[]> {
    return this.jobsRepository.find({
      where: { user: { id: userId }, isDone: false, isActivated: false },
    });
  }

  async findActiveJob(userId: string): Promise<Job | null> {
    return this.jobsRepository.findOne({
      where: { user: { id: userId }, isActivated: true, isDone: false },
    });
  }

  async activateJob(id: number): Promise<Job> {
    const job = await this.findOne(id);
    job.isActivated = true;
    job.startTime = new Date();
    return this.jobsRepository.save(job);
  }

  async completeJob(id: number, completeDto: CompleteJobDto): Promise<Job> {
    const job = await this.findOne(id);
    job.isDone = true;
    job.isActivated = false;
    job.endTime = new Date();
    job.modelName = completeDto.modelName;
    job.modelDescription = completeDto.modelDescription;
    job.startFuelWeight = completeDto.startFuelWeight;
    job.finishFuelWeight = completeDto.finishFuelWeight;
    job.usedFuelWeight = completeDto.usedFuelWeight;
    return this.jobsRepository.save(job);
  }

  async create(jobData: Partial<Job>): Promise<Job> {
    const job = this.jobsRepository.create(jobData);
    return this.jobsRepository.save(job);
  }

  async update(id: number, jobData: Partial<Job>): Promise<Job> {
    const job = await this.findOne(id);
    Object.assign(job, jobData);
    return this.jobsRepository.save(job);
  }

  async remove(id: number): Promise<void> {
    const job = await this.findOne(id);
    await this.jobsRepository.remove(job);
  }
}
