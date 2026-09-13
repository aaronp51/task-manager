import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import { Prisma } from '../generated/prisma/client.js';
import validateEmailAndPassword from '../middleware/validation.js';
import authenticateToken from '../middleware/auth.js';

// 1. Extend the Express Request type to include your custom user payload
interface AuthenticatedRequest extends Request {
    user?: {
        userId: number; // Change to string if your IDs are UUIDs/strings
    };
}

const saltRounds = 10;
const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ users, message: 'Get all users' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: String(error) });
  }
});

// login route: request -> get data -> compare email and password -> verify credentials -> create token -> send token
router.post('/login', validateEmailAndPassword, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return res.status(401).json('Invalid email or password');
    }

    const correctPassword = await bcrypt.compare(password, existingUser.passwordHash);
    if (!correctPassword) {
      return res.status(401).json('Invalid email or password');
    }

    const token = jwt.sign(
      { userId: existingUser.id },
      process.env.JWT_SECRET ?? 'dev-secret',
      { expiresIn: '15m' },
    );

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

// POST route: request -> get data -> hash password -> create record -> send response
router.post('/register', validateEmailAndPassword, async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    return res.json({ user: newUser, message: 'User created' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      console.log('unique constraint violation');
      return res.status(409).json('Email is already registered');
    }

    return next(error);
  }
});

// Get the currently logged-in user's account information
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.user?.userId;

        if (userId === undefined) {
            return res.status(401).json('Authentication required');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json('User not found');
        }

        return res.json({ user });
    }
    catch (error) {
        return next(error);
    }
});


// Change email
router.patch('/me/email', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.user?.userId;
        const { newEmail, password } = req.body;

        if (userId === undefined) {
            return res.status(401).json('Authentication required');
        }

        if (!newEmail || !password) {
            return res.status(400).json(
                'New email and current password are required'
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json('User not found');
        }

        const correctPassword = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!correctPassword) {
            return res.status(401).json('Current password is incorrect');
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                email: newEmail,
            },
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        });

        return res.json({
            user: updatedUser,
            message: 'Email updated successfully',
        });
    }
    catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            return res.status(409).json('Email is already registered');
        }

        return next(error);
    }
});


// Change password
router.patch('/me/password', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.user?.userId;
        const { currentPassword, newPassword } = req.body;

        if (userId === undefined) {
            return res.status(401).json('Authentication required');
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json(
                'Current password and new password are required'
            );
        }

        if (newPassword.length < 8) {
            return res.status(400).json(
                'New password must be at least 8 characters'
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json('User not found');
        }

        const correctPassword = await bcrypt.compare(
            currentPassword,
            user.passwordHash
        );

        if (!correctPassword) {
            return res.status(401).json('Current password is incorrect');
        }

        const passwordHash = await bcrypt.hash(
            newPassword,
            saltRounds
        );

        await prisma.user.update({
            where: { id: userId },
            data: {
                passwordHash,
            },
        });

        return res.json({
            message: 'Password updated successfully',
        });
    }
    catch (error) {
        return next(error);
    }
});


// Delete account
router.delete('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.user?.userId;
        const { password } = req.body;

        if (userId === undefined) {
            return res.status(401).json('Authentication required');
        }

        if (!password) {
            return res.status(400).json(
                'Current password is required'
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json('User not found');
        }

        const correctPassword = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!correctPassword) {
            return res.status(401).json('Current password is incorrect');
        }

        /*
         * Delete the user's tasks first.
         *
         * This avoids depending on a database-level cascade rule.
         */
        await prisma.$transaction([
            prisma.task.deleteMany({
                where: { userId },
            }),

            prisma.user.delete({
                where: { id: userId },
            }),
        ]);

        return res.json({
            message: 'Account deleted successfully',
        });
    }
    catch (error) {
        return next(error);
    }
});

export default router;