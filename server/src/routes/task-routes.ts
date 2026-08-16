import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import prisma from '../config/db.ts';
import authenticateToken, { type AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user?.userId ?? 0 },
    });
    return res.json({ tasks, message: 'Get all tasks of a certain user' });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const taskId = Number(req.params.id);
    const userId = req.user?.userId;

    if (userId === undefined) {
      return res.status(401).json('Authentication required');
    }

    const task = await prisma.task.findFirst({
      where: { taskId, userId },
    });

    if (!task) {
      return res.status(404).json('Task not found');
    }

    return res.json({ task, message: 'Get a specific task of a certain user' });
  } catch (error) {
    return next(error);
  }
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, description, dueDate } = req.body as {
    title: string;
    description?: string;
    dueDate?: Date | string;
  };

  try {
    const newTask = await prisma.task.create({
      data: {
        userId: req.user?.userId ?? 0,
        title,
        description: description ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return res.json({ task: newTask, message: 'Task created' });
  } catch (error) {
    return next(error);
  }
});

// when user wants to update a task
router.patch('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const taskId = Number(req.params.id);
    const userId = req.user?.userId;
    const { title, description, status, dueDate } = req.body as {
      title?: string;
      description?: string;
      status?: string;
      dueDate?: Date | string;
    };

    if (userId === undefined) {
      return res.status(401).json('Authentication required');
    }
    // if a field in data contains null, Prisma actually overwrites the original with null
    // if a field in data is undefined, Prisma ignores it and keeps the original value
    // otherwrise, Prisma overwrites the original with the new value
    const updatedTask = await prisma.task.updateMany({
      where: { 
        id: taskId, 
        userId 
      },
      data: {
        title,
        description,
        status,
        dueDate: (dueDate === null ? null : (dueDate ? new Date(dueDate) : undefined)), // check if dueDate is null explicitly
        updatedAt: new Date(),
      },
    });

    return res.json({ updatedTask, message: 'Task updated' });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const taskId = Number(req.params.id);
    const userId = req.user?.userId;

    if (userId === undefined) {
      return res.status(401).json('Authentication required');
    }

    await prisma.task.deleteMany({
      where: { id: taskId, userId },
    });

    return res.json('Task deleted');
  } catch (error) {
    return next(error);
  }
});

export default router;