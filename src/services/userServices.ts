// user.service.ts
import { Op, Transaction } from 'sequelize';
import User from '../models/userModels';
import { hashPassword } from '../helpers/bcrypt';
import dotenv from 'dotenv';
import {sequelize} from '../database/db'
dotenv.config();

class UserService {

    timeout: number = parseInt(process.env.TIMEOUT_RESPONSE) || 10000;

    async findExistingUser(email: string, phonenumber: string) {
        return await User.findOne({
            attributes: ['email', 'phonenumber'],
            where: {
                [Op.or]: [{ email }, { phonenumber }]
            }
        });
    }

    handleExistingUser(existingUser: any, email: string, phonenumber: string) {
        if (existingUser.email === email) {
            throw new Error('Email already exists');
        }
        if (existingUser.phonenumber === phonenumber) {
            throw new Error('Phonenumber already exists');
        }
    }

    async createNewUser(name: string, email: string, phonenumber: string, password: string, role: string) {
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
        return newUser;
    }

    async createUserWithTimeout(name: string, email: string, phonenumber: string, password: string, role: string) {
        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Request timed out'));
                }, this.timeout);
            });
            const existingUser = await this.findExistingUser(email, phonenumber);
            if (existingUser) {
                if (existingUser.email === email) {
                    throw new Error('Email already exists');
                }
                if (existingUser.phonenumber === phonenumber) {
                    throw new Error('Phonenumber already exists');
                }
            }
            const hashedPassword = hashPassword(password);
            const newUser = await this.createNewUser(name, email, phonenumber, hashedPassword, role);
            return newUser;
        } catch (error) {
            if (error.message === 'Request timed out') {
                throw error;
            }
            throw new Error('Internal server error');
        }
    }
    
    
    
    async getAllUsersWithTimeout(page: number, limit: number) {
        const usersPromise = User.findAndCountAll({
            attributes: ['id', 'name', 'email'],
            order: [['created_at', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });
    
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error('Request timed out'));
            }, this.timeout);
        });
    
        try {
            const result = await Promise.race([usersPromise, timeoutPromise]);
            return result;
        } catch (error) {
            throw error;
        }
    }
    
    async getUserByIdWithTimeout(userId: string) {
        const userPromise = User.findOne({ where: { id: userId }, limit: 1 });
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error('Request timed out'));
            }, this.timeout);
        });
        const result:any = await Promise.race([userPromise, timeoutPromise]);
        return result;
    }

    async updateUserWithTimeout(userId: string, userData: any) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const updatePromise = user.update(userData);
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error('Request timed out'));
            }, this.timeout);
        });
        await Promise.race([updatePromise, timeoutPromise]);
        return user;
    }

    async updatePwUserWithTimeout(userId: string, newPassword: string) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const updatePromise = user.update({ password: hashPassword(newPassword) });
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error('Request timed out'));
            }, this.timeout);
        });
        await Promise.race([updatePromise, timeoutPromise]);
        return { message: `Password updated for user ${userId}` };
    }

    async deleteUserWithTimeout(userId: string) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const deletePromise = user.destroy();
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error('Request timed out'));
            }, this.timeout);
        });
        await Promise.race([deletePromise, timeoutPromise]);
        return { message: `Success delete ${userId}` };
    }
}

export default new UserService();
