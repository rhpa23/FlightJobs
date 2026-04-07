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
var JobsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_entity_1 = require("./entities/job.entity");
const navdata_service_1 = require("../navdata/navdata.service");
const statistics_entity_1 = require("../statistics/entities/statistics.entity");
const user_entity_1 = require("../users/entities/user.entity");
const pilot_license_expense_user_entity_1 = require("../licenses/entities/pilot-license-expense-user.entity");
const airline_entity_1 = require("../airlines/entities/airline.entity");
const airline_fbo_entity_1 = require("../airlines/entities/airline-fbo.entity");
const job_airline_entity_1 = require("../job-airlines/entities/job-airline.entity");
const data_conversion_util_1 = require("../common/utils/data-conversion.util");
const CHALLENGE_EXPIRED = 'Unfortunately, this Challenge is expired. Take another one.';
const GUEST_EMAIL = 'guest@flightjobs.com';
const PAYLOAD_TOLERANCE = 150;
const MIN_TIME_FACTOR = 11 / 100;
const MIN_FUEL_FACTOR = 0.12 / 1000;
let JobsService = JobsService_1 = class JobsService {
    constructor(jobsRepository, statisticsRepository, usersRepository, pilotLicenseExpenseRepository, airlinesRepository, airlineFboRepository, jobAirlineRepository, navdataService, dataSource) {
        this.jobsRepository = jobsRepository;
        this.statisticsRepository = statisticsRepository;
        this.usersRepository = usersRepository;
        this.pilotLicenseExpenseRepository = pilotLicenseExpenseRepository;
        this.airlinesRepository = airlinesRepository;
        this.airlineFboRepository = airlineFboRepository;
        this.jobAirlineRepository = jobAirlineRepository;
        this.navdataService = navdataService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(JobsService_1.name);
    }
    async findAll() {
        return this.jobsRepository.find();
    }
    async findOne(id) {
        const job = await this.jobsRepository.findOne({
            where: { id },
            relations: ['user']
        });
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID ${id} not found`);
        }
        return job;
    }
    async search(searchDto) {
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
    async findPendingJobs(userId) {
        return this.jobsRepository.find({
            where: { user: { id: userId }, isDone: false, isActivated: false },
        });
    }
    async findActiveJob(userId) {
        return this.jobsRepository.findOne({
            where: { user: { id: userId }, isActivated: true, isDone: false },
        });
    }
    async activateJob(id) {
        const job = await this.findOne(id);
        job.isActivated = true;
        job.startTime = new Date();
        return this.jobsRepository.save(job);
    }
    async completeJob(id, completeDto) {
        const job = await this.findOne(id);
        job.isDone = true;
        job.isActivated = false;
        job.endTime = new Date();
        job.modelName = completeDto.modelName;
        job.modelDescription = completeDto.modelDescription;
        job.startFuelWeight = completeDto.startFuelWeight;
        job.finishFuelWeight = completeDto.finishFuelWeight;
        return this.jobsRepository.save(job);
    }
    async create(jobData) {
        const job = this.jobsRepository.create(jobData);
        return this.jobsRepository.save(job);
    }
    async update(id, jobData) {
        const job = await this.findOne(id);
        Object.assign(job, jobData);
        return this.jobsRepository.save(job);
    }
    async remove(id) {
        const job = await this.findOne(id);
        await this.jobsRepository.remove(job);
    }
    async startJob(userId, dto) {
        try {
            const airport = this.navdataService.getCloseAirport(dto.latitude, dto.longitude);
            if (!airport) {
                throw new common_1.BadRequestException('No airport found near the provided coordinates.');
            }
            return await this.startJobByIcao(userId, airport.ident, dto.payloadKilograms, dto.fuelWeightKilograms);
        }
        catch (error) {
            this.logger.error(`Erro ao iniciar job: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Process error.');
        }
    }
    async startJobByIcao(userId, icaoStr, payloadKg, fuelWeightKg) {
        const job = await this.findActivatedJobByDeparture(userId, icaoStr);
        if (!job) {
            throw new common_1.ForbiddenException("You don't have any job activated for this location.");
        }
        if (job.isChallenge && job.challengeExpirationDate <= new Date()) {
            throw new common_1.ForbiddenException(CHALLENGE_EXPIRED);
        }
        if (job.user && job.user.email === GUEST_EMAIL) {
            throw new common_1.ForbiddenException('Guest accounts cannot start jobs.');
        }
        const payload = Math.round(payloadKg);
        const jobPayload = this.calculateJobPayload(job);
        if (payload >= (jobPayload + PAYLOAD_TOLERANCE) || payload <= (jobPayload - PAYLOAD_TOLERANCE)) {
            const payloadInPounds = data_conversion_util_1.DataConversion.convertKilogramsToPounds(jobPayload);
            throw new common_1.ForbiddenException(`Wrong. Active job payload is: ${jobPayload}kg / ${payloadInPounds}lbs`);
        }
        job.startFuelWeight = Math.round(fuelWeightKg);
        job.inProgress = true;
        job.startTime = new Date();
        await this.jobsRepository.save(job);
        const licenseExpired = await this.isLicenseOverdue(userId);
        const name = job.isChallenge ? 'Challenge' : 'Job';
        let message = `${name} to ${job.arrivalICAO} started at: ${job.startTime.toISOString()} (UTC)`;
        if (licenseExpired) {
            message = `${name} started. Warn: Your pilot license is expired. Check profile page.`;
        }
        return {
            success: true,
            message,
            arrivalIcao: job.arrivalICAO,
            licenseExpired
        };
    }
    async finishJob(userId, dto) {
        try {
            const airport = this.navdataService.getCloseAirport(dto.latitude, dto.longitude);
            if (!airport) {
                throw new common_1.BadRequestException('No airport found near the provided coordinates.');
            }
            return await this.finishJobByIcao(userId, airport.ident, dto.payloadKilograms, dto.fuelWeightKilograms, dto.modelName, dto.modelDescription, dto.resultMessages, dto.resultScore);
        }
        catch (error) {
            this.logger.error(`Erro ao finalizar job: ${error.message}`, error.stack);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException('Process error.');
        }
    }
    async finishJobByIcao(userId, icaoStr, payloadKg, fuelWeightKg, modelName, modelDescription, resultMessages, resultScore) {
        const job = await this.findInProgressJobByArrival(userId, icaoStr);
        if (!job) {
            throw new common_1.ForbiddenException('Wrong destination to finish this job.');
        }
        const name = job.isChallenge ? 'Challenge' : 'Job';
        if (job.isChallenge && job.challengeExpirationDate <= new Date()) {
            throw new common_1.ForbiddenException(CHALLENGE_EXPIRED);
        }
        if (job.user && job.user.email === GUEST_EMAIL) {
            throw new common_1.ForbiddenException('Guest accounts cannot finish jobs.');
        }
        const payload = Math.round(payloadKg);
        const jobPayload = this.calculateJobPayload(job);
        if (payload >= (jobPayload + PAYLOAD_TOLERANCE) || payload <= (jobPayload - PAYLOAD_TOLERANCE)) {
            const payloadInPounds = data_conversion_util_1.DataConversion.convertKilogramsToPounds(jobPayload);
            throw new common_1.ForbiddenException(`Wrong. Active ${name} payload is: ${jobPayload}kg / ${payloadInPounds}lbs`);
        }
        const diffTimeMs = Date.now() - new Date(job.startTime).getTime();
        const diffTimeMinutes = diffTimeMs / (1000 * 60);
        const minTime = (job.distance * 11) / 100;
        if (diffTimeMinutes < minTime) {
            throw new common_1.ForbiddenException('Impossible to arrive at destination in this short time.');
        }
        job.inProgress = false;
        job.endTime = new Date();
        job.isDone = true;
        job.isActivated = false;
        job.modelName = modelName || 'No acf model data';
        job.modelDescription = modelDescription || 'No acf model data';
        job.finishFuelWeight = Math.round(fuelWeightKg);
        if (resultScore != null) {
            job.pilotScore = resultScore;
        }
        const usedFuelWeight = job.startFuelWeight - job.finishFuelWeight;
        const expectedFuelBurned = (job.distance * jobPayload * MIN_FUEL_FACTOR);
        if (usedFuelWeight < expectedFuelBurned) {
            throw new common_1.ForbiddenException(`Impossible to finish this ${name} with ${usedFuelWeight}Kg burned fuel.`);
        }
        const licenseExpired = await this.updateStatistics(job, resultScore);
        await this.updateAirline(job, resultMessages);
        await this.jobsRepository.save(job);
        let message = `${name} finish successfully at: ${job.endTime.toISOString()} (UTC)`;
        if (licenseExpired) {
            message = `${name} finish. Your license is expired. Check Profile page.`;
        }
        const finishedJob = await this.jobsRepository.findOne({
            where: { user: { id: userId }, isDone: true },
            order: { endTime: 'DESC' },
            relations: ['user']
        });
        if (finishedJob) {
            finishedJob.user = null;
        }
        return {
            success: true,
            message,
            finishedJob,
            licenseExpired
        };
    }
    async findActivatedJobByDeparture(userId, icaoStr) {
        const queryBuilder = this.jobsRepository.createQueryBuilder('job')
            .leftJoinAndSelect('job.user', 'user')
            .where('job.user.id = :userId', { userId })
            .andWhere('job.isActivated = :isActivated', { isActivated: true });
        if (icaoStr.length === 3) {
            queryBuilder.andWhere('SUBSTR(job.departureICAO, 2) = :icao', { icao: icaoStr.toLowerCase() });
        }
        else {
            queryBuilder.andWhere('LOWER(job.departureICAO) = :icao', { icao: icaoStr.toLowerCase() });
        }
        return queryBuilder.getOne();
    }
    async findInProgressJobByArrival(userId, icaoStr) {
        const queryBuilder = this.jobsRepository.createQueryBuilder('job')
            .leftJoinAndSelect('job.user', 'user')
            .where('job.user.id = :userId', { userId })
            .andWhere('job.isActivated = :isActivated', { isActivated: true })
            .andWhere('job.inProgress = :inProgress', { inProgress: true });
        if (icaoStr.length === 3) {
            queryBuilder.andWhere('(SUBSTR(job.arrivalICAO, 2) = :icao OR SUBSTR(job.alternativeICAO, 2) = :icao)', { icao: icaoStr.toLowerCase() });
        }
        else {
            queryBuilder.andWhere('(LOWER(job.arrivalICAO) = :icao OR LOWER(job.alternativeICAO) = :icao)', { icao: icaoStr.toLowerCase() });
        }
        return queryBuilder.getOne();
    }
    calculateJobPayload(job) {
        const paxWeight = job.paxWeight > 0 ? job.paxWeight : 84;
        return (job.pax * paxWeight) + job.cargo;
    }
    async isLicenseOverdue(userId) {
        const count = await this.pilotLicenseExpenseRepository.count({
            where: {
                user: { id: userId },
                maturityDate: { $lt: new Date() }
            }
        });
        return count > 0;
    }
    async updateStatistics(job, jobPilotScore) {
        let licenseOverdue = false;
        let statistics = await this.statisticsRepository.findOne({
            where: { user: { id: job.user.id } },
            relations: ['user', 'airline']
        });
        if (statistics) {
            licenseOverdue = await this.isLicenseOverdue(job.user.id);
            if (!licenseOverdue) {
                if (jobPilotScore != null) {
                    statistics.pilotScore += jobPilotScore;
                    job.pilotScore = jobPilotScore;
                }
                else {
                    if (job.aviationType === 1) {
                        statistics.pilotScore += Math.floor(job.distance / 10);
                        job.pilotScore = Math.floor(job.distance / 10);
                    }
                    else {
                        statistics.pilotScore += Math.floor(job.distance / 15);
                        job.pilotScore = Math.floor(job.distance / 10);
                    }
                }
                statistics.bankBalance += job.pay;
            }
        }
        else {
            statistics = this.statisticsRepository.create({
                bankBalance: job.pay,
                pilotScore: job.aviationType === 1 ? Math.floor(job.distance / 10) : Math.floor(job.distance / 15),
                logo: '/Content/img/default.jpg',
                user: job.user
            });
            await this.statisticsRepository.save(statistics);
        }
        return licenseOverdue;
    }
    async updateAirline(job, resultMessages) {
        const statistics = await this.statisticsRepository.findOne({
            where: { user: { id: job.user.id } },
            relations: ['airline']
        });
        if (!statistics || !statistics.airline) {
            return;
        }
        const airline = await this.airlinesRepository.findOne({
            where: { id: statistics.airline.id },
            relations: ['owner']
        });
        if (!airline) {
            return;
        }
        const jobAirline = this.jobAirlineRepository.create({
            airline: airline,
            job: job
        });
        const departureFbo = await this.airlineFboRepository.findOne({
            where: { airline: { id: airline.id }, icao: job.departureICAO }
        });
        jobAirline.calcAirlineJob(departureFbo);
        if (airline.debtValue > 0 && airline.debtMaturityDate < new Date()) {
            airline.bankBalance -= Math.floor(jobAirline.flightIncome / 2);
            if (airline.bankBalance <= 0) {
                airline.bankBalance = 0;
            }
        }
        else {
            airline.airlineScore += Math.floor(job.distance / 14);
            airline.airlineScore += departureFbo ? departureFbo.scoreIncrease : 0;
            airline.bankBalance += Math.floor(jobAirline.revenueEarned);
        }
        if (airline.userId) {
            if (airline.debtValue === 0) {
                airline.debtMaturityDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
            }
            airline.debtValue += Math.floor(jobAirline.totalFlightCost);
            if (airline.debtValue > 0) {
                this.logger.warn(`Airline ${airline.name} has debt: ${airline.debtValue}. Email notification should be sent.`);
            }
        }
        await this.airlinesRepository.save(airline);
        await this.jobAirlineRepository.save(jobAirline);
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = JobsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(1, (0, typeorm_1.InjectRepository)(statistics_entity_1.Statistics)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(pilot_license_expense_user_entity_1.PilotLicenseExpenseUser)),
    __param(4, (0, typeorm_1.InjectRepository)(airline_entity_1.Airline)),
    __param(5, (0, typeorm_1.InjectRepository)(airline_fbo_entity_1.AirlineFbo)),
    __param(6, (0, typeorm_1.InjectRepository)(job_airline_entity_1.JobAirline)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        navdata_service_1.NavdataService,
        typeorm_2.DataSource])
], JobsService);
//# sourceMappingURL=jobs.service.js.map