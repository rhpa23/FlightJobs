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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobAirline = void 0;
const typeorm_1 = require("typeorm");
const airline_entity_1 = require("../../airlines/entities/airline.entity");
const job_entity_1 = require("../../jobs/entities/job.entity");
let JobAirline = class JobAirline {
    calcAirlineJob(departureFbo) {
        this.fuelPrice = this.job.aviationType > 1 ? 5.20 : 5.70;
        this.flightCrewCost = this.job.pay + (this.job.pay * 0.8);
        this.groundCrewCost = this.flightCrewCost * 0.3;
        let grCrewDiscount = 0.0;
        let fuelCostWithoutDiscount = 0.0;
        if (departureFbo) {
            fuelCostWithoutDiscount = (this.job.startFuelWeight - this.job.finishFuelWeight) * this.fuelPrice;
            const fuelDiscount = this.fuelPrice * departureFbo.fuelPriceDiscount;
            this.fuelPrice -= fuelDiscount;
            grCrewDiscount = this.groundCrewCost * departureFbo.groundCrewDiscount;
            this.groundCrewCost -= grCrewDiscount;
        }
        this.fuelCost = (this.job.startFuelWeight - this.job.finishFuelWeight) * this.fuelPrice;
        const flightTimeHours = this.getFlightTimeHours();
        this.flightAttendantCost = (this.job.pax / 60) * (21 * flightTimeHours);
        this.totalCrewCostLabor = this.flightCrewCost + this.flightAttendantCost;
        this.totalFlightCost = this.totalCrewCostLabor + this.fuelCost + this.groundCrewCost;
        this.revenueEarned = this.totalFlightCost * 1.35;
        if (departureFbo) {
            this.revenueEarned += grCrewDiscount;
            this.revenueEarned += (fuelCostWithoutDiscount - this.fuelCost);
        }
        this.flightIncome = this.revenueEarned - this.totalFlightCost;
    }
    getFlightTimeHours() {
        if (!this.job.startTime || !this.job.endTime) {
            return 0;
        }
        const diffMs = new Date(this.job.endTime).getTime() - new Date(this.job.startTime).getTime();
        return diffMs / (1000 * 60 * 60);
    }
};
exports.JobAirline = JobAirline;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'Id' }),
    __metadata("design:type", Number)
], JobAirline.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => airline_entity_1.Airline),
    (0, typeorm_1.JoinColumn)({ name: 'Airline_Id' }),
    __metadata("design:type", airline_entity_1.Airline)
], JobAirline.prototype, "airline", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => job_entity_1.Job),
    (0, typeorm_1.JoinColumn)({ name: 'Job_Id' }),
    __metadata("design:type", job_entity_1.Job)
], JobAirline.prototype, "job", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'JobDebtValue', default: 0 }),
    __metadata("design:type", Number)
], JobAirline.prototype, "jobDebtValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FuelPrice', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], JobAirline.prototype, "fuelPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FuelCost', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], JobAirline.prototype, "fuelCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'GroundCrewCost', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], JobAirline.prototype, "groundCrewCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FlightCrewCost', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], JobAirline.prototype, "flightCrewCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FlightAttendantCost', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], JobAirline.prototype, "flightAttendantCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TotalCrewCostLabor', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], JobAirline.prototype, "totalCrewCostLabor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TotalFlightCost', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], JobAirline.prototype, "totalFlightCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RevenueEarned', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], JobAirline.prototype, "revenueEarned", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FlightIncome', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], JobAirline.prototype, "flightIncome", void 0);
exports.JobAirline = JobAirline = __decorate([
    (0, typeorm_1.Entity)('jobairlinedbmodels')
], JobAirline);
//# sourceMappingURL=job-airline.entity.js.map