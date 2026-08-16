import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Prisma } from '../../generated/prisma/client.ts';
import prisma from '../config/db.ts';
import validateEmailAndPassword from '../middleware/validation.ts';

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
      { expiresIn: '5m' },
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

export default router;