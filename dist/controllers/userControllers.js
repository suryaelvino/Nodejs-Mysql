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
const log_1 = __importDefault(require("../logging/log"));
const userServices_1 = __importDefault(require("../services/userServices"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const myService = 'User Service';
const logger = (0, log_1.default)(myService);
class UserController {
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, phonenumber, password, role } = req.body;
                console.log(req.body);
                if (!name || !email || !phonenumber || !password || !role) {
                    return res.status(http_status_codes_1.default.BAD_REQUEST).json({
                        message: 'Request body is incomplete',
                        code: http_status_codes_1.default.BAD_REQUEST
                    });
                }
                const newUser = yield userServices_1.default.createUserWithTimeout(name, email, phonenumber, password, role);
                logger.info(`Success create users ${email}`);
                return res.status(http_status_codes_1.default.CREATED).json({
                    message: "Success created user",
                    code: http_status_codes_1.default.CREATED,
                    data: newUser
                });
            }
            catch (error) {
                if (error.message === 'Request timed out') {
                    return res.status(http_status_codes_1.default.REQUEST_TIMEOUT).json({
                        message: 'Request timed out',
                        code: http_status_codes_1.default.REQUEST_TIMEOUT
                    });
                }
                if (error.message === 'Email already exists' || error.message === 'Phonenumber already exists') {
                    return res.status(http_status_codes_1.default.CONFLICT).json({
                        message: error.message,
                        code: http_status_codes_1.default.CONFLICT
                    });
                }
                logger.error(`Internal server error create users: ${error.message}`);
                return res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({
                    message: 'Internal server error',
                    code: http_status_codes_1.default.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pageString = req.query.page;
                const limitString = req.query.limit;
                const page = parseInt(pageString) || 1;
                const limit = parseInt(limitString) || 10;
                const { count, rows } = yield userServices_1.default.getAllUsersWithTimeout(page, limit);
                const totalPages = Math.ceil(count / limit);
                if (rows.length === 0) {
                    logger.info(`No users found ${page} and limit ${limit}`);
                    return res.status(http_status_codes_1.default.NOT_FOUND).json({
                        total_users: count,
                        total_pages: totalPages,
                        current_page: page,
                        message: `No users found in page ${page} and limit ${limit}`,
                        code: http_status_codes_1.default.NOT_FOUND,
                        data: null,
                    });
                }
                logger.info(`Success get list users`);
                return res.status(http_status_codes_1.default.OK).json({
                    total_users: count,
                    total_pages: totalPages,
                    current_page: page,
                    message: `success get all user in page ${page} and limit ${limit}`,
                    code: http_status_codes_1.default.OK,
                    data: rows
                });
            }
            catch (error) {
                if (error.message === 'Request timed out') {
                    logger.error(`Failed get list users with RTO`);
                    return res.status(http_status_codes_1.default.REQUEST_TIMEOUT).json({
                        message: 'Request timed out',
                        code: http_status_codes_1.default.REQUEST_TIMEOUT,
                    });
                }
                logger.error(`Internal server error With get list users`);
                return res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({
                    message: 'Internal server error',
                    code: http_status_codes_1.default.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const user = yield userServices_1.default.getUserByIdWithTimeout(userId);
                if (!user) {
                    return res.status(http_status_codes_1.default.NOT_FOUND).json({
                        message: `User not found with ${userId}`,
                        code: http_status_codes_1.default.NOT_FOUND
                    });
                }
                logger.info(`Success get detail users ${userId}`);
                return res.status(http_status_codes_1.default.OK).json({
                    message: `Success get detail user with ${userId}`,
                    code: http_status_codes_1.default.OK,
                    data: user,
                });
            }
            catch (error) {
                if (error.message === 'Request timed out') {
                    logger.error(`Request timed out while fetching user ${req.params.id}`);
                    return res.status(http_status_codes_1.default.REQUEST_TIMEOUT).json({
                        message: 'Request timed out',
                        code: http_status_codes_1.default.REQUEST_TIMEOUT
                    });
                }
                else {
                    logger.error(`Failed get detail users ${req.params.id}`);
                    return res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({
                        message: 'Internal server error',
                        code: http_status_codes_1.default.INTERNAL_SERVER_ERROR
                    });
                }
            }
        });
    }
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const { name, email, phonenumber, password } = req.body;
                const user = yield userServices_1.default.updateUserWithTimeout(userId, { name, email, phonenumber, password });
                if (!user) {
                    return res.status(http_status_codes_1.default.NOT_FOUND).json({
                        message: `User not found with ${userId}`,
                        code: http_status_codes_1.default.NOT_FOUND
                    });
                }
                logger.info(`Success update users ${userId}`);
                return res.status(http_status_codes_1.default.OK).json({
                    message: `Success update user with ${userId}`,
                    code: http_status_codes_1.default.OK,
                    data: user
                });
            }
            catch (error) {
                if (error.message === 'Request timed out') {
                    return res.status(http_status_codes_1.default.REQUEST_TIMEOUT).json({
                        message: 'Request timed out',
                        code: http_status_codes_1.default.REQUEST_TIMEOUT
                    });
                }
                logger.error(`Failed update users ${req.params.id}`);
                return res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({
                    message: 'Internal server error',
                    code: http_status_codes_1.default.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    updatePwUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const { password } = req.body;
                const user = yield userServices_1.default.updatePwUserWithTimeout(userId, password);
                if (!user) {
                    return res.status(http_status_codes_1.default.NOT_FOUND).json({
                        message: `User not found with ${userId}`,
                        code: http_status_codes_1.default.NOT_FOUND
                    });
                }
                logger.info(`Success update password for user ${userId}`);
                return res.status(http_status_codes_1.default.OK).json({
                    message: `Success update password users with ${userId}`,
                    code: http_status_codes_1.default.OK
                });
            }
            catch (error) {
                if (error.message === 'Request timed out') {
                    return res.status(http_status_codes_1.default.REQUEST_TIMEOUT).json({
                        message: 'Request timed out',
                        code: http_status_codes_1.default.REQUEST_TIMEOUT
                    });
                }
                logger.error(`Failed update password for user ${req.params.id}`);
                return res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({
                    message: 'Internal server error',
                    code: http_status_codes_1.default.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const user = yield userServices_1.default.deleteUserWithTimeout(userId);
                if (!user) {
                    return res.status(http_status_codes_1.default.NOT_FOUND).json({
                        message: `User not found with ${userId}`,
                        code: http_status_codes_1.default.NOT_FOUND
                    });
                }
                logger.info(`Success delete users ${userId}`);
                return res.status(http_status_codes_1.default.OK).json({
                    message: `Success delete user with ${userId}`,
                    code: http_status_codes_1.default.OK
                });
            }
            catch (error) {
                if (error.message === 'Request timed out') {
                    return res.status(http_status_codes_1.default.REQUEST_TIMEOUT).json({
                        message: 'Request timed out',
                        code: http_status_codes_1.default.REQUEST_TIMEOUT
                    });
                }
                logger.error(`Failed delete users ${req.params.id}`);
                return res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({
                    message: 'Internal server error',
                    code: http_status_codes_1.default.INTERNAL_SERVER_ERROR
                });
            }
        });
    }
}
exports.default = new UserController();
//# sourceMappingURL=userControllers.js.map