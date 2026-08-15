import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type AuthenticatedRequest = Request & {
  user?: {
    userId: number;
    iat?: number;
    exp?: number;
  };
};

// used to authenticate JWT before giving access to routes
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization; // authHeader expected value should be "Bearer abc123..."
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json('Authentication required');
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET ?? 'dev-secret') as {
      userId: number;
    };

    req.user = decodedToken;
    return next();
  } catch (error) {
    return res.status(403).json('Invalid or expired token');
  }
}

export default authenticateToken;