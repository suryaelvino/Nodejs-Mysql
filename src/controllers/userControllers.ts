import { Request, Response } from 'express';
import User from '../models/userModels';
import logs from "../logging/log"
import UserService from '../services/userServices';
const myService = 'User Service';
const logger = logs(myService);

class UserController {

    async createUser(req: Request, res: Response) {
        try {
            const { name, email, phonenumber, password, role } = req.body;
            if (!name || !email || !phonenumber || !password || !role) {
                return res.status(400).json({ error: 'Request body is incomplete' });
            }
            const newUser = await UserService.createUserWithTimeout(name, email, phonenumber, password, role);
            logger.info(`Success create users ${email}`);
            return res.status(201).json(newUser);
        } catch (error) {
            if (error.message === 'Request timed out') {
                return res.status(408).json({ error: 'Request timed out' });
            }
            if (error.message === 'Email already exists' || error.message === 'Phonenumber already exists') {
                return res.status(409).json({ error: error.message });
            }
            logger.error(`Internal server error create users`);
            return res.status(500).json({ error: 'Internal server error' });
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
            logger.info(`Success get list users`);
            return res.status(200).json({
                totalUsers: count,
                totalPages,
                currentPage: page,
                users: rows
            });
        } catch (error) {
            if (error.message === 'Request timed out') {
                logger.error(`Failed with RTO`);
                return res.status(408).json({ error: 'Request timed out' });
            }
            logger.error(`Internal server error With getAllUsers`);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    async getUserById(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const user = await UserService.getUserByIdWithTimeout(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            logger.info(`Success get detail users ${userId}`);
            return res.status(200).json(user);
        } catch (error) {
            if (error.message === 'Request timed out') {
                logger.error(`Request timed out while fetching user ${req.params.id}`);
                return res.status(408).json({ error: 'Request timed out' });
            } else {
                logger.error(`Failed get detail users ${req.params.id}`);
                return res.status(500).json({ error: 'Internal server error' });
            }
        }
    }    

    async updateUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const { name, email, phonenumber, password } = req.body;
            const user = await UserService.updateUserWithTimeout(userId, { name, email, phonenumber, password });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            logger.info(`Success update users ${userId}`);
            return res.status(200).json(user);
        } catch (error) {
            if (error.message === 'Request timed out') {
                return res.status(408).json({ error: 'Request timed out' });
            }
            logger.error(`Failed update users ${req.params.id}`);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updatePwUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const { password } = req.body;
            const user = await UserService.getUserByIdWithTimeout(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const result = await UserService.updatePwUserWithTimeout(userId, password);
            logger.info(`Success update password for user ${userId}`);
            return res.status(200).json(result);
        } catch (error) {
            if (error.message === 'Request timed out') {
                return res.status(408).json({ error: 'Request timed out' });
            }
            logger.error(`Failed update password for user ${req.params.id}`);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    async deleteUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const user = await UserService.getUserByIdWithTimeout(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const result = await UserService.deleteUserWithTimeout(userId);
            logger.info(`Success delete users ${userId}`);
            return res.status(200).json(result);
        } catch (error) {
            if (error.message === 'Request timed out') {
                return res.status(408).json({ error: 'Request timed out' });
            }
            logger.error(`Failed delete users ${req.params.id}`);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default new UserController();