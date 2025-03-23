"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ message: 'No authorization header provided' });
            return;
        }
        const token = authHeader.split(' ')[1]; // Bearer TOKEN format
        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        // Get the user from the database
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Add the user to the request object
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        res.status(500).json({ message: 'Server error' });
        return;
    }
};
exports.authenticateJWT = authenticateJWT;
// Optional auth middleware - will attach user to req if token is valid, but will not block request if no token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next();
        }
        const token = authHeader.split(' ')[1]; // Bearer TOKEN format
        if (!token) {
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        // Get the user from the database
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.id },
        });
        if (user) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        // Just continue if there's an error with the token
        next();
    }
};
exports.optionalAuth = optionalAuth;
