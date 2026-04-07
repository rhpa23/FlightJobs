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
exports.FinishJobResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const job_entity_1 = require("../entities/job.entity");
class FinishJobResponseDto {
}
exports.FinishJobResponseDto = FinishJobResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], FinishJobResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], FinishJobResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Job finalizado', type: job_entity_1.Job, required: false }),
    __metadata("design:type", job_entity_1.Job)
], FinishJobResponseDto.prototype, "finishedJob", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Indica se a licença do piloto está expirada' }),
    __metadata("design:type", Boolean)
], FinishJobResponseDto.prototype, "licenseExpired", void 0);
//# sourceMappingURL=finish-job-response.dto.js.map