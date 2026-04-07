"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAirlineDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_airline_dto_1 = require("./create-airline.dto");
class UpdateAirlineDto extends (0, swagger_1.PartialType)(create_airline_dto_1.CreateAirlineDto) {
}
exports.UpdateAirlineDto = UpdateAirlineDto;
//# sourceMappingURL=update-airline.dto.js.map