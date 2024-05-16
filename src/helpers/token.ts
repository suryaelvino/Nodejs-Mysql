import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const secretKey = process.env.SECRET_KEY;
const secretKeyAdmin = process.env.SECRET_KEY_ADMIN;

function createToken(payload: object, key: string, expiresIn: string): string {
    if (!key) {
        throw new Error('Secret key not found');
    }
    return jwt.sign(payload, key, {
        expiresIn: expiresIn,
        algorithm: 'HS256'
    });
}

function verifyToken(token: string, key: string): any | null {
    if (!key) {
        throw new Error('Secret key not found');
    }
    try {
        return jwt.verify(token, key);
    } catch (err) {
        console.error('Invalid token');
        return null;
    }
}

export const authenticateAdmin = (req: any, res: any, next: any) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token not provided' });
    }
    const bearerToken = token.split(' ')[1] || token;
    const decodedAdmin = verifyToken(bearerToken, secretKeyAdmin);
    if (!decodedAdmin) {
        return res.status(401).json({ message: 'Unauthorized: Invalid admin token' });
    }
    req.admin = decodedAdmin;
    next();
};

export const authenticateUser = (req: any, res: any, next: any) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token not provided' });
    }
    const bearerToken = token.split(' ')[1] || token;
    const decodedUser = verifyToken(bearerToken, secretKey);
    if (!decodedUser) {
        return res.status(401).json({ message: 'Unauthorized: Invalid user token' });
    }
    req.user = decodedUser;
    next();
};

export function createTokenUser(payload: object): string {
    return createToken(payload, secretKey, '7d');
}

export function createTokenAdmin(payload: object): string {
    return createToken(payload, secretKeyAdmin, '12h');
}