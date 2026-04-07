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
exports.Job = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let Job = class Job {
};
exports.Job = Job;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'Id' }),
    __metadata("design:type", Number)
], Job.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PaxWeight', default: 84 }),
    __metadata("design:type", Number)
], Job.prototype, "paxWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DepartureICAO', length: 4, nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "departureICAO", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ArrivalICAO', length: 4, nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "arrivalICAO", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AlternativeICAO', length: 4, nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "alternativeICAO", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Dist', default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "distance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Pax', default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "pax", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Cargo', default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "cargo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Pay', default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "pay", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FirstClass', type: 'simple-enum', default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "firstClass", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsDone', type: 'simple-enum', default: 0 }),
    __metadata("design:type", Boolean)
], Job.prototype, "isDone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActivated', type: 'simple-enum', default: 0 }),
    __metadata("design:type", Boolean)
], Job.prototype, "isActivated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'InProgress', type: 'simple-enum', default: 0 }),
    __metadata("design:type", Boolean)
], Job.prototype, "inProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'StartTime', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Job.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EndTime', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Job.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ModelName', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "modelName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ModelDescription', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "modelDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'StartFuelWeight', default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "startFuelWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FinishFuelWeight', default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "finishFuelWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AviationType', default: 1 }),
    __metadata("design:type", Number)
], Job.prototype, "aviationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'VideoUrl', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "videoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'VideoDescription', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "videoDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ChallengeCreatorUserId', nullable: true }),
    __metadata("design:type", String)
], Job.prototype, "challengeCreatorUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsChallenge', type: 'simple-enum', default: 0 }),
    __metadata("design:type", Boolean)
], Job.prototype, "isChallenge", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ChallengeExpirationDate', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], Job.prototype, "challengeExpirationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ChallengeType', default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "challengeType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'User_Id' }),
    __metadata("design:type", user_entity_1.User)
], Job.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PilotScore', default: 0 }),
    __metadata("design:type", Number)
], Job.prototype, "pilotScore", void 0);
exports.Job = Job = __decorate([
    (0, typeorm_1.Entity)('jobdbmodels')
], Job);
//# sourceMappingURL=job.entity.js.map