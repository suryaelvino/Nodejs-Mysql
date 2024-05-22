import { Request, Response } from 'express';
import User from '../models/userModels';
import logs from "../logging/log"
import UserService from '../services/userServices';
import code from 'http-status-codes';
const myService = 'User Service';
const logger = logs(myService);

class UserController {

    async createUser(req: Request, res: Response) {
        try {
            const { name, email, phonenumber, password, role } = req.body;
            console.log(req.body);
            if (!name || !email || !phonenumber || !password || !role) {
                return res.status(code.BAD_REQUEST).json({ 
                    message: 'Request body is incomplete',
                    code : code.BAD_REQUEST
                });
            }
            const newUser = await UserService.createUserWithTimeout(name, email, phonenumber, password, role);
            logger.info(`Success create users ${email}`);
            return res.status(code.CREATED).json({
                message     : "Success created user",
                code        : code.CREATED,
                data        : newUser
            });
        } catch (error) {
            if (error.message === 'Request timed out') {
                return res.status(code.REQUEST_TIMEOUT).json({ 
                    message: 'Request timed out',
                    code : code.REQUEST_TIMEOUT 
                });
            }
            if (error.message === 'Email already exists' || error.message === 'Phonenumber already exists') {
                return res.status(code.CONFLICT).json({ 
                    message: error.message,
                    code : code.CONFLICT
                 });
            }
            logger.error(`Internal server error create users: ${error.message}`);
            return res.status(code.INTERNAL_SERVER_ERROR).json({ 
                message: 'Internal server error',
                code : code.INTERNAL_SERVER_ERROR
            });
        }
    }    
    
    
    async getAllUsers(req: Request, res: Response) {
        try {
            const pageString = req.query.page as string;
            const limitString = req.query.limit as string;
            const page = parseInt(pageString) || 1;
            const limit = parseInt(limitString) || 10;
            const { count, rows } = await UserService.getAllUsersWithTimeout(page, limit);
            const totalPages = Math.ceil(count / limit);
            if (rows.length === 0) {
                logger.info(`No users found ${page} and limit ${limit}`);
                return res.status(code.NOT_FOUND).json({
                    total_users     : count,
                    total_pages     : totalPages,
                    current_page    : page,
                    message         : `No users found in page ${page} and limit ${limit}`,
                    code            : code.NOT_FOUND,
                    data            : null,
                });
            }
            logger.info(`Success get list users`);
            return res.status(code.OK).json({
                total_users     : count,
                total_pages     : totalPages,
                current_page    : page,
                message         : `success get all user in page ${page} and limit ${limit}`,
                code            : code.OK,
                data            : rows
            });
        } catch (error) {
            if (error.message === 'Request timed out') {
                logger.error(`Failed get list users with RTO`);
                return res.status(code.REQUEST_TIMEOUT).json({
                    message : 'Request timed out', 
                    code    : code.REQUEST_TIMEOUT,
                });
            }
            logger.error(`Internal server error With get list users`);
            return res.status(code.INTERNAL_SERVER_ERROR).json({ 
                message : 'Internal server error',
                code    : code.INTERNAL_SERVER_ERROR 
            });
        }
    }
    
    async getUserById(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const user = await UserService.getUserByIdWithTimeout(userId);
            if (!user) {
                return res.status(code.NOT_FOUND).json({ 
                    message : `User not found with ${userId}`,
                    code    : code.NOT_FOUND 
                });
            }
            logger.info(`Success get detail users ${userId}`);
            return res.status(code.OK).json({
                message : `Success get detail user with ${userId}`,
                code    : code.OK, 
                data    : user,
            });
        } catch (error) {
            if (error.message === 'Request timed out') {
                logger.error(`Request timed out while fetching user ${req.params.id}`);
                return res.status(code.REQUEST_TIMEOUT).json({
                    message : 'Request timed out',
                    code    : code.REQUEST_TIMEOUT 
                });
            } else {
                logger.error(`Failed get detail users ${req.params.id}`);
                return res.status(code.INTERNAL_SERVER_ERROR).json({ 
                    message : 'Internal server error',
                    code    : code.INTERNAL_SERVER_ERROR 
                });
            }
        }
    }    

    async updateUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const { name, email, phonenumber, password } = req.body;
            const user = await UserService.updateUserWithTimeout(userId, { name, email, phonenumber, password });
            if (!user) {
                return res.status(code.NOT_FOUND).json({
                    message : `User not found with ${userId}`,
                    code    : code.NOT_FOUND 
                });
            }
            logger.info(`Success update users ${userId}`);
            return res.status(code.OK).json({
                message : `Success update user with ${userId}`,
                code    : code.OK,
                data    : user
            });
        } catch (error) {
            if (error.message === 'Request timed out') {
                return res.status(code.REQUEST_TIMEOUT).json({ 
                    message : 'Request timed out', 
                    code    : code.REQUEST_TIMEOUT
                });
            }
            logger.error(`Failed update users ${req.params.id}`);
            return res.status(code.INTERNAL_SERVER_ERROR).json({ 
                message : 'Internal server error',
                code    : code.INTERNAL_SERVER_ERROR 
            });
        }
    }

    async updatePwUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const { password } = req.body;
            const user = await UserService.updatePwUserWithTimeout(userId, password);
            if (!user) {
                return res.status(code.NOT_FOUND).json({ 
                    message : `User not found with ${userId}`,
                    code    : code.NOT_FOUND
             });
            }
            logger.info(`Success update password for user ${userId}`);
            return res.status(code.OK).json({
                message : `Success update password users with ${userId}`,
                code    : code.OK
            });
        } catch (error) {
            if (error.message === 'Request timed out') {
                return res.status(code.REQUEST_TIMEOUT).json({ 
                    message : 'Request timed out',
                    code    : code.REQUEST_TIMEOUT
                });
            }
            logger.error(`Failed update password for user ${req.params.id}`);
            return res.status(code.INTERNAL_SERVER_ERROR).json({ 
                message : 'Internal server error',
                code    : code.INTERNAL_SERVER_ERROR 
            });
        }
    }
    
    async deleteUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const user = await UserService.deleteUserWithTimeout(userId);
            if (!user) {
                return res.status(code.NOT_FOUND).json({ 
                    message : `User not found with ${userId}`,
                    code    : code.NOT_FOUND
                 });
            }
            logger.info(`Success delete users ${userId}`);
            return res.status(code.OK).json({
                message : `Success delete user with ${userId}`,
                code    : code.OK
            });
        } catch (error) {
            if (error.message === 'Request timed out') {
                return res.status(code.REQUEST_TIMEOUT).json({ 
                    message : 'Request timed out', 
                    code    : code.REQUEST_TIMEOUT
                });
            }
            logger.error(`Failed delete users ${req.params.id}`);
            return res.status(code.INTERNAL_SERVER_ERROR).json({ 
                message : 'Internal server error',
                code    : code.INTERNAL_SERVER_ERROR
            });
        }
    }
}

export default new UserController();