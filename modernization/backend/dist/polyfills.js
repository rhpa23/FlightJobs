"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = { randomUUID: crypto_1.randomUUID };
}
//# sourceMappingURL=polyfills.js.map