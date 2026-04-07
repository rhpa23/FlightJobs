"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAspNetPassword = verifyAspNetPassword;
exports.hashAspNetPassword = hashAspNetPassword;
const crypto_1 = require("crypto");
function verifyAspNetPassword(password, storedHash) {
    try {
        const hashBuffer = Buffer.from(storedHash, 'base64');
        if (hashBuffer.length !== 49 || hashBuffer[0] !== 0x00) {
            return false;
        }
        const salt = hashBuffer.subarray(1, 17);
        const storedKey = hashBuffer.subarray(17, 49);
        const key = (0, crypto_1.pbkdf2Sync)(password, salt, 1000, 32, 'sha1');
        return (0, crypto_1.timingSafeEqual)(key, storedKey);
    }
    catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
}
function hashAspNetPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16);
    const key = (0, crypto_1.pbkdf2Sync)(password, salt, 1000, 32, 'sha1');
    const hashBuffer = Buffer.concat([
        Buffer.from([0x00]),
        salt,
        key
    ]);
    return hashBuffer.toString('base64');
}
//# sourceMappingURL=password.util.js.map