"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePasswords = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hashPassword = (plainPassword) => {
    try {
        const saltRounds = 10;
        const salt = bcrypt_1.default.genSaltSync(saltRounds);
        const hashedPassword = bcrypt_1.default.hashSync(plainPassword, salt);
        return hashedPassword;
    }
    catch (error) {
        throw error;
    }
};
exports.hashPassword = hashPassword;
const comparePasswords = (plainPassword, hashedPasswordFromDatabase) => {
    try {
        const match = bcrypt_1.default.compare(plainPassword, hashedPasswordFromDatabase);
        return match;
    }
    catch (error) {
        throw error;
    }
};
exports.comparePasswords = comparePasswords;
//# sourceMappingURL=bcrypt.js.map