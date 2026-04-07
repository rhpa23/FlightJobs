import { Job } from '../entities/job.entity';
export declare class FinishJobResponseDto {
    success: boolean;
    message: string;
    finishedJob?: Job;
    licenseExpired: boolean;
}
