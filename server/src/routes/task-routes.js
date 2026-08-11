const express = require('express');
const prisma = require('../config/db');
const authenticateToken = require('../middleware/auth.js');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({ // tasks belonging to a specific user
            where: { userId: req.user.userId },
        });
        res.json( { tasks: tasks, message: "Get all tasks of a certain user" });
    } catch (e) {
        res.status(500).json("Internal server error");
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { userId, title, description, dueDate } = req.body;
    try {
        const newTask = await prisma.task.create({
            data: {
                userId: req.user.userId, // this is temporary (implement user authentication)
                title: title,
                description: description ?? undefined,
                dueDate: dueDate ?? undefined,
            },
        });
        res.json( { task: newTask, message: "Task created" });
    } catch (e) {
        console.log("Internal server error");
        res.status(500).json("Internal server error");
    }
});

// when user wants to update a task
router.patch('/:id', authenticateToken, async (req, res) => {
    try {
        const taskId = Number(req.params.id);
        const userId = req.user.userId;
        const { title, description, status, dueDate } = req.body;
        await prisma.task.updateMany({ // updateMany used because id + userId is not explicitly stated to be a unique combination
            where: { taskId, userId },
            data: {
                title: title,
                description: description ?? undefined,
                status: status,
                dueDate: dueDate ?? undefined,
                updatedAt: new Date(),
            }
        })
    } catch (e) {
        res.status(404).json("Task not found");
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const taskId = Number(req.params.id); // wrap with Number (route parameters are given as strings)
        const userId = req.user.userId;
        await prisma.task.deleteMany({
            where: { taskId, userId },
        });
        res.json("Task deleted");
    } catch (e) {
        res.status(404).json("Task not found");
    }
});

module.exports = router;