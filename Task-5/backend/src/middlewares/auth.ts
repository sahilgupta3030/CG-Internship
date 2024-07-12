import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY as string;
let tokenBlacklist: Set<string> = new Set();

export interface CustomRequest extends Request {
    user?: JwtPayload & { id?: number };
}

export const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ message: 'Token is blacklisted.' });
    }

    try {
        const decoded = jwt.verify(token, secretKey) as JwtPayload & { id?: number };
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

export const blacklistToken = (token: string) => {
    tokenBlacklist.add(token);
};

export default authMiddleware;
