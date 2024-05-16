import { Request, Response } from 'express';
import User from '../models/userModels';
import { hashPassword } from '../helpers/bcrypt';
import { Op } from 'sequelize';
class UserController {

    async createUser(req:Request, res:Response) {
        try {
            const { name, email, phonenumber, password, role } = req.body;
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [{ email }, { phonenumber }]
                }
            });
            if (existingUser) {
                if (existingUser.email === email) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                if (existingUser.phonenumber === phonenumber) {
                    return res.status(400).json({ error: 'Phonenumber already exists' });
                }
            }
            const hashedPassword = hashPassword(password);
            const newUser = await User.create({
                name,
                email,
                phonenumber,
                password: hashedPassword,
                role,
                status: 'ACTIVATE',
                created_at: new Date().valueOf(),
                updated_at: new Date().valueOf()
            });
            return res.status(201).json(newUser);
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }


    async getAllUsers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const offset = (page - 1) * limit;
            const { count, rows } = await User.findAndCountAll({
                order: [['created_at', 'DESC']],
                limit,
                offset
            });
            const totalPages = Math.ceil(count / limit);
            return res.status(200).json({
                totalUsers: count,
                totalPages,
                currentPage: page,
                users: rows
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const user = await User.findOne({ where: { id: userId }, limit: 1 });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(200).json(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const { name, email, phonenumber, password } = req.body;
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            await user.update({ name, email, phonenumber, password });
            return res.status(200).json(user);
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            await user.destroy();
            return res.status(200).json({message: `Success delete ${userId} `});
        } catch (error) {
            console.error('Error deleting user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default new UserController();