import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-readynest-key-change-me';

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No authentication token, access denied' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = verified.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};
