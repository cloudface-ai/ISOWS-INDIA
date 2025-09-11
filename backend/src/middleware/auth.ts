import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization header' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    const user = await authService.verifyToken(idToken);
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
