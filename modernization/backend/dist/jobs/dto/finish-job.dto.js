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
exports.FinishJobDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class FinishJobDto {
}
exports.FinishJobDto = FinishJobDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Latitude da posição atual da aeronave (aeroporto de chegada)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FinishJobDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Longitude da posição atual da aeronave (aeroporto de chegada)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FinishJobDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Payload em quilogramas (kg)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FinishJobDto.prototype, "payloadKilograms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Peso do combustível restante em quilogramas (kg)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FinishJobDto.prototype, "fuelWeightKilograms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Número de registro da aeronave (tail number)', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishJobDto.prototype, "modelName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Descrição do modelo da aeronave', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishJobDto.prototype, "modelDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Mensagens de resultado do voo', required: false, type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], FinishJobDto.prototype, "resultMessages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pontuação de resultado do voo', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FinishJobDto.prototype, "resultScore", void 0);
//# sourceMappingURL=finish-job.dto.js.map