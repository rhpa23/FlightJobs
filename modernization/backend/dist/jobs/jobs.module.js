"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const job_entity_1 = require("./entities/job.entity");
const jobs_service_1 = require("./jobs.service");
const jobs_controller_1 = require("./jobs.controller");
const distance_calculator_service_1 = require("./services/distance-calculator.service");
const payment_calculator_service_1 = require("./services/payment-calculator.service");
const statistics_entity_1 = require("../statistics/entities/statistics.entity");
const user_entity_1 = require("../users/entities/user.entity");
const pilot_license_expense_user_entity_1 = require("../licenses/entities/pilot-license-expense-user.entity");
const airline_entity_1 = require("../airlines/entities/airline.entity");
const airline_fbo_entity_1 = require("../airlines/entities/airline-fbo.entity");
const job_airline_entity_1 = require("../job-airlines/entities/job-airline.entity");
const navdata_module_1 = require("../navdata/navdata.module");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                job_entity_1.Job,
                statistics_entity_1.Statistics,
                user_entity_1.User,
                pilot_license_expense_user_entity_1.PilotLicenseExpenseUser,
                airline_entity_1.Airline,
                airline_fbo_entity_1.AirlineFbo,
                job_airline_entity_1.JobAirline
            ]),
            navdata_module_1.NavdataModule
        ],
        providers: [
            jobs_service_1.JobsService,
            distance_calculator_service_1.DistanceCalculatorService,
            payment_calculator_service_1.PaymentCalculatorService
        ],
        controllers: [jobs_controller_1.JobsController],
        exports: [jobs_service_1.JobsService],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map