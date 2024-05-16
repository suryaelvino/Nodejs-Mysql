// user.service.ts
import { Op } from 'sequelize';
import User from '../models/userModels';
import { hashPassword } from '../helpers/bcrypt';
import dotenv from 'dotenv';

dotenv.config();

class UserService {

    timeout: number = parseInt(process.env.TIMEOUT_RESPONSE) || 15000;

    async findExistingUser(email: string, phonenumber: string) {
        return await User.findOne({
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
        const existingUserPromise = this.findExistingUser(email, phonenumber);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Request timed out'));
            }, this.timeout);
        });

        try {
            const result:any = await Promise.race([existingUserPromise, timeoutPromise]);
            if (result && result.timeout) {
                throw new Error('Request timed out');
            }
            if (result) {
                this.handleExistingUser(result, email, phonenumber);
            }
            return await this.createNewUser(name, email, phonenumber, password, role);
        } catch (error) {
            throw error;
        }
    }

    async getAllUsersWithTimeout(page: number, limit: number) {
        const usersPromise = User.findAndCountAll({
            order: [['created_at', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error('Request timed out'));
            }, this.timeout);
        });

        const result = await Promise.race([usersPromise, timeoutPromise]);
        return result;
    }

    parsePageAndLimit(pageString: string, limitString: string) {
        const page = parseInt(pageString) || 1;
        const limit = parseInt(limitString) || 10;
        return { page, limit };
    }
}

export default new UserService();
