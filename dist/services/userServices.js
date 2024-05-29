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
        this.timeout = parseInt(process.env.TIMEOUT_RESPONSE) || 10000;
    }
    findExistingUser(email, phonenumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModels_1.default.findOne({
                attributes: ['email', 'phonenumber'],
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
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new Error('Request timed out'));
                    }, this.timeout);
                });
                const existingUserPromise = this.findExistingUser(email, phonenumber);
                const result = yield Promise.race([existingUserPromise, timeoutPromise]);
                if (result && result.timeout) {
                    throw new Error('Request timed out');
                }
                if (result) {
                    this.handleExistingUser(result, email, phonenumber);
                }
                const hashedPassword = (0, bcrypt_1.hashPassword)(password);
                const newUser = yield this.createNewUser(name, email, phonenumber, hashedPassword, role);
                return newUser;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getAllUsersWithTimeout(page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersPromise = userModels_1.default.findAndCountAll({
                attributes: ['id', 'name', 'email', 'phonenumber'],
                order: [['created_at', 'DESC']],
                limit,
                offset: (page - 1) * limit
            });
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Request timed out'));
                }, this.timeout);
            });
            try {
                const result = yield Promise.race([usersPromise, timeoutPromise]);
                return result;
            }
            catch (error) {
                throw error;
            }
        });
    }
    getUserByIdWithTimeout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userPromise = userModels_1.default.findOne({ where: { id: userId }, limit: 1 });
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Request timed out'));
                }, this.timeout);
            });
            const result = yield Promise.race([userPromise, timeoutPromise]);
            return result;
        });
    }
    updateUserWithTimeout(userId, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModels_1.default.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const updatePromise = user.update(userData);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Request timed out'));
                }, this.timeout);
            });
            yield Promise.race([updatePromise, timeoutPromise]);
            return user;
        });
    }
    updatePwUserWithTimeout(userId, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModels_1.default.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const updatePromise = user.update({ password: (0, bcrypt_1.hashPassword)(newPassword) });
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Request timed out'));
                }, this.timeout);
            });
            yield Promise.race([updatePromise, timeoutPromise]);
            return { message: `Password updated for user ${userId}` };
        });
    }
    deleteUserWithTimeout(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userModels_1.default.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const deletePromise = user.destroy();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Request timed out'));
                }, this.timeout);
            });
            yield Promise.race([deletePromise, timeoutPromise]);
            return { message: `Success delete ${userId}` };
        });
    }
}
exports.default = new UserService();
//# sourceMappingURL=userServices.js.map