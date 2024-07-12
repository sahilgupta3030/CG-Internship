import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import mysqlpool from '../config/db';
import { blacklistToken } from '../middlewares/auth';
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY;


export const registerUser = async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    try {
        const [rows]: any = await mysqlpool.query('SELECT * FROM login WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result]: any = await mysqlpool.query('INSERT INTO login (email, password) VALUES (?, ?)', [email, hashedPassword]);

        return res.status(201).json({ success: true, message: 'User registered successfully.' });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};


export const loginUser = async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    try {
        const [rows]: any = await mysqlpool.query('SELECT * FROM login WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, secretKey as string, { expiresIn: '1h' });

        return res.status(200).json({ success: true, message: 'Login successful', data: { token } });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};


export const logoutUser = (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        blacklistToken(token);
        return res.status(200).json({ success: true, message: 'Logged out successfully.' });
    }

    return res.status(400).json({ success: false, message: 'No token provided.' });
};

const userController = {
    registerUser,
    loginUser,
    logoutUser
};

export default userController;
