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
exports.Statistics = void 0;
const typeorm_1 = require("typeorm");
const airline_entity_1 = require("../../airlines/entities/airline.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let Statistics = class Statistics {
};
exports.Statistics = Statistics;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'Id' }),
    __metadata("design:type", Number)
], Statistics.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'User_Id' }),
    __metadata("design:type", user_entity_1.User)
], Statistics.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BankBalance', default: 0 }),
    __metadata("design:type", Number)
], Statistics.prototype, "bankBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PilotScore', default: 0 }),
    __metadata("design:type", Number)
], Statistics.prototype, "pilotScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Logo', nullable: true }),
    __metadata("design:type", String)
], Statistics.prototype, "logo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SendLicenseWarning', default: 0 }),
    __metadata("design:type", Boolean)
], Statistics.prototype, "sendLicenseWarning", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SendAirlineBillsWarning', default: 0 }),
    __metadata("design:type", Boolean)
], Statistics.prototype, "sendAirlineBillsWarning", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LicenseWarningSent', default: 0 }),
    __metadata("design:type", Boolean)
], Statistics.prototype, "licenseWarningSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AirlineBillsWarningSent', default: 0 }),
    __metadata("design:type", Boolean)
], Statistics.prototype, "airlineBillsWarningSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UseCustomPlaneCapacity', default: 0 }),
    __metadata("design:type", Boolean)
], Statistics.prototype, "useCustomPlaneCapacity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WeightUnit', nullable: true }),
    __metadata("design:type", String)
], Statistics.prototype, "weightUnit", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => airline_entity_1.Airline, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'Airline_Id' }),
    __metadata("design:type", airline_entity_1.Airline)
], Statistics.prototype, "airline", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CustomPlaneCapacity_Id', nullable: true }),
    __metadata("design:type", Number)
], Statistics.prototype, "customPlaneCapacityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'User_Id', nullable: true }),
    __metadata("design:type", String)
], Statistics.prototype, "userId", void 0);
exports.Statistics = Statistics = __decorate([
    (0, typeorm_1.Entity)('statisticsdbmodels')
], Statistics);
//# sourceMappingURL=statistics.entity.js.map