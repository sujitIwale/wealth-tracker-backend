import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Add the user to the request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
    return;
  }
};

// Optional auth middleware - will attach user to req if token is valid, but will not block request if no token
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN format
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Just continue if there's an error with the token
    next();
  }
};