"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// user.service.ts
const sequelize_1 = require("sequelize");
const userModels_1 = __importDefault(require("../models/userModels"));
const bcrypt_1 = require("../helpers/bcrypt");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class UserService {
    constructor() {
        this.timeout = parseInt(process.env.TIMEOUT_RESPONSE) || 15000;
    }
    findExistingUser(email, phonenumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModels_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [{ email }, { phonenumber }]
                }
            });
        });
    }
    handleExistingUser(existingUser, email, phonenumber) {
        if (existingUser.email === email) {
            throw new Error('Email already exists');
        }
        if (existingUser.phonenumber === phonenumber) {
            throw new Error('Phonenumber already exists');
        }
    }
    createNewUser(name, email, phonenumber, password, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPassword = (0, bcrypt_1.hashPassword)(password);
            const newUser = yield userModels_1.default.create({
                name,
                email,
                phonenumber,
                password: hashedPassword,
                role,
                status: 'ACTIVATE',
                created_at: new Date().valueOf(),
                updated_at: new Date().valueOf()
            });
            return newUser;
        });
    }
    createUserWithTimeout(name, email, phonenumber, password, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUserPromise = this.findExistingUser(email, phonenumber);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Request timed out'));
                }, this.timeout);
            });
            try {
                const result = yield Promise.race([existingUserPromise, timeoutPromise]);
                if (result && result.timeout) {
                    throw new Error('Request timed out');
                }
                if (result) {
                    this.handleExistingUser(result, email, phonenumber);
                }
                return yield this.createNewUser(name, email, phonenumber, password, role);
            }
            catch (error) {
                throw error;
            }
        });
    }
    getAllUsersWithTimeout(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersPromise = userModels_1.default.findAndCountAll({
                order: [['created_at', 'DESC']],
                limit,
                offset: (page - 1) * limit
            });
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Request timed out'));
                }, this.timeout);
            });
            const result = yield Promise.race([usersPromise, timeoutPromise]);
            return result;
        });
    }
    parsePageAndLimit(pageString, limitString) {
        const page = parseInt(pageString) || 1;
        const limit = parseInt(limitString) || 10;
        return { page, limit };
    }
}
exports.default = new UserService();
//# sourceMappingURL=userServices.js.map