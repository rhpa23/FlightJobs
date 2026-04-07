import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';
import { SearchJobsDto } from './dto/search-jobs.dto';
import { CompleteJobDto } from './dto/complete-job.dto';
import { StartJobDto } from './dto/start-job.dto';
import { FinishJobDto } from './dto/finish-job.dto';
import { StartJobResponseDto } from './dto/start-job-response.dto';
import { FinishJobResponseDto } from './dto/finish-job-response.dto';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    findAll(): Promise<Job[]>;
    search(searchDto: SearchJobsDto): Promise<Job[]>;
    findPendingJobs(req: any): Promise<Job[]>;
    findActiveJob(req: any): Promise<Job>;
    findOne(id: number): Promise<Job>;
    create(jobData: Partial<Job>): Promise<Job>;
    update(id: number, jobData: Partial<Job>): Promise<Job>;
    remove(id: number): Promise<void>;
    activateJob(id: number): Promise<Job>;
    completeJob(id: number, completeDto: CompleteJobDto): Promise<Job>;
    startJob(req: any, startDto: StartJobDto): Promise<StartJobResponseDto>;
    finishJob(req: any, finishDto: FinishJobDto): Promise<FinishJobResponseDto>;
}
