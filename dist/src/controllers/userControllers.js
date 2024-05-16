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
const userModels_1 = __importDefault(require("../models/userModels"));
const log_1 = __importDefault(require("../logging/log"));
const userServices_1 = __importDefault(require("../services/userServices"));
const myService = 'User Service';
const logger = (0, log_1.default)(myService);
class UserController {
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, phonenumber, password, role } = req.body;
                const newUser = yield userServices_1.default.createUserWithTimeout(name, email, phonenumber, password, role);
                logger.info(`Success register ${email}`);
                return res.status(201).json(newUser);
            }
            catch (error) {
                if (error.message === 'Request timed out') {
                    logger.error(`Failed with RTO`);
                    return res.status(408).json({ error: 'Request timed out' });
                }
                logger.error(`Internal server error`);
                console.error('Error creating user:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, limit } = userServices_1.default.parsePageAndLimit(req.query.page, req.query.limit);
                const { count, rows } = yield userServices_1.default.getAllUsersWithTimeout(page, limit);
                const totalPages = Math.ceil(count / limit);
                logger.info(`Success get list users`);
                return res.status(200).json({
                    totalUsers: count,
                    totalPages,
                    currentPage: page,
                    users: rows
                });
            }
            catch (error) {
                console.error('Error fetching users:', error);
                logger.error(`Internal server error`);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const user = yield userModels_1.default.findOne({ where: { id: userId }, limit: 1 });
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                return res.status(200).json(user);
            }
            catch (error) {
                console.error('Error fetching user:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const { name, email, phonenumber, password } = req.body;
                const user = yield userModels_1.default.findByPk(userId);
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                yield user.update({ name, email, phonenumber, password });
                return res.status(200).json(user);
            }
            catch (error) {
                console.error('Error updating user:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const user = yield userModels_1.default.findByPk(userId);
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }
                yield user.destroy();
                return res.status(200).json({ message: `Success delete ${userId} ` });
            }
            catch (error) {
                console.error('Error deleting user:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
}
exports.default = new UserController();
//# sourceMappingURL=userControllers.js.map