"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokenAdmin = exports.createTokenUser = exports.authenticateUser = exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secretKey = process.env.SECRET_KEY;
const secretKeyAdmin = process.env.SECRET_KEY_ADMIN;
function createToken(payload, key, expiresIn) {
    if (!key) {
        throw new Error('Secret key not found');
    }
    return jsonwebtoken_1.default.sign(payload, key, {
        expiresIn: expiresIn,
        algorithm: 'HS256'
    });
}
function verifyToken(token, key) {
    if (!key) {
        throw new Error('Secret key not found');
    }
    try {
        return jsonwebtoken_1.default.verify(token, key);
    }
    catch (err) {
        console.error('Invalid token');
        return null;
    }
}
const authenticateAdmin = (req, res, next) => {
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
exports.authenticateAdmin = authenticateAdmin;
const authenticateUser = (req, res, next) => {
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
exports.authenticateUser = authenticateUser;
function createTokenUser(payload) {
    return createToken(payload, secretKey, '7d');
}
exports.createTokenUser = createTokenUser;
function createTokenAdmin(payload) {
    return createToken(payload, secretKeyAdmin, '12h');
}
exports.createTokenAdmin = createTokenAdmin;
//# sourceMappingURL=token.js.map