import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Job } from '../jobs/entities/job.entity';
import { CreateChallengeDto } from './dto/create-challenge.dto';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,
  ) {}

  async findAll(): Promise<Job[]> {
    // Return all challenge jobs that are not expired
    return this.jobsRepository.find({
      where: { 
        isChallenge: true,
        isDone: false,
        challengeExpirationDate: MoreThan(new Date())
      },
      order: { challengeExpirationDate: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Job> {
    const challenge = await this.jobsRepository.findOne({ 
      where: { id, isChallenge: true }
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID ${id} not found`);
    }
    return challenge;
  }

  async create(createChallengeDto: CreateChallengeDto): Promise<Job> {
    const challenge = this.jobsRepository.create({
      ...createChallengeDto,
      isChallenge: true,
      challengeExpirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isDone: false,
      isActivated: false,
      inProgress: false
    });
    
    return this.jobsRepository.save(challenge);
  }

  async remove(id: number): Promise<void> {
    const challenge = await this.findOne(id);
    await this.jobsRepository.remove(challenge);
  }
}
