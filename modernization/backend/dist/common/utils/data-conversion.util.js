"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataConversion = void 0;
class DataConversion {
    static convertMetersToMiles(meters) {
        return meters / 1852;
    }
    static convertKilogramsToPounds(kg) {
        return Math.round(kg * 2.20462);
    }
    static convertPoundsToKilograms(lbs) {
        return Math.round(lbs / 2.20462);
    }
}
exports.DataConversion = DataConversion;
DataConversion.WeightPounds = 'Pounds';
DataConversion.WeightKilograms = 'Kilograms';
DataConversion.UnitPounds = ' lbs';
DataConversion.UnitKilograms = ' kg';
//# sourceMappingURL=data-conversion.util.js.map