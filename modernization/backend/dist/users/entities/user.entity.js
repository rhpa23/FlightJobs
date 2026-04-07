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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const job_entity_1 = require("../../jobs/entities/job.entity");
const airline_entity_1 = require("../../airlines/entities/airline.entity");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'Id', type: 'varchar' }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Email', unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PasswordHash', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UserName', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "userName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SecurityStamp', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "securityStamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PhoneNumber', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PhoneNumberConfirmed', default: 0 }),
    __metadata("design:type", Boolean)
], User.prototype, "phoneNumberConfirmed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TwoFactorEnabled', default: 0 }),
    __metadata("design:type", Boolean)
], User.prototype, "twoFactorEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LockoutEndDateUtc', type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lockoutEnd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LockoutEnabled', default: 1 }),
    __metadata("design:type", Boolean)
], User.prototype, "lockoutEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccessFailedCount', default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "accessFailedCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EmailConfirmed', default: 0 }),
    __metadata("design:type", Boolean)
], User.prototype, "emailConfirmed", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_entity_1.Job, job => job.user),
    __metadata("design:type", Array)
], User.prototype, "jobs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => airline_entity_1.Airline, airline => airline.owner),
    __metadata("design:type", Array)
], User.prototype, "airlines", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('aspnetusers')
], User);
//# sourceMappingURL=user.entity.js.map