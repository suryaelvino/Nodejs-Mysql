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
            const newUser = await UserService.createUserWithTimeout(name, email, phonenumber, password, role);
            logger.info(`Success register ${email}`);
            return res.status(201).json(newUser);
        } catch (error) {
            if (error.message === 'Request timed out') {
                logger.error(`Failed with RTO`);
                return res.status(408).json({ error: 'Request timed out' });
            }
            logger.error(`Internal server error`);
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const { page, limit } = UserService.parsePageAndLimit(req.query.page as string, req.query.limit as string);
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
            console.error('Error fetching users:', error);
            logger.error(`Internal server error`);
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
            console.error('Error fetching user:', error);
            logger.error(`Failed get detail users ${req.params.id}`);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const { name, email, phonenumber, password } = req.body;
            const updatedUser = await UserService.updateUserWithTimeout(userId, { name, email, phonenumber, password });
            logger.info(`Success update users ${userId}`);
            return res.status(200).json(updatedUser);
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({ error: 'User not found' });
            }
            console.error('Error updating user:', error);
            logger.error(`Failed update users ${req.params.id}`);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updatePwUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const { password } = req.body;
            const result = await UserService.updatePwUserWithTimeout(userId, password);
            logger.info(`Success update password for user ${userId}`);
            return res.status(200).json(result);
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({ error: 'User not found' });
            }
            console.error('Error updating password:', error);
            logger.error(`Failed update password for user ${req.params.id}`);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const result = await UserService.deleteUserWithTimeout(userId);
            logger.info(`Success delete users ${userId}`);
            return res.status(200).json(result);
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({ error: 'User not found' });
            }
            console.error('Error deleting user:', error);
            logger.error(`Failed delete users ${req.params.id}`);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default new UserController();