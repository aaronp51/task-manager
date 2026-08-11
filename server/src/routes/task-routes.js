const express = require('express');
const prisma = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const tasks = await prisma.task.findMany();
        res.json( { tasks: tasks, message: "Get all tasks" });
    } catch (e) {
        res.status(500).json("Internal server error");
    }
});

router.post('/', async (req, res) => {
    const { userId, title, description, dueDate } = req.body;
    try {
        const newTask = await prisma.task.create({
            data: {
                userId: userId, // this is temporary (implement user authentication)
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

// when user wants to complete a task
router.patch('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { title, description, status, dueDate } = req.body;
        await prisma.task.update({
            where: { id },
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

router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id); // wrap with Number (route parameters are given as strings)
        await prisma.task.delete({
            where: { id },
        });
        res.json("Task deleted");
    } catch (e) {
        res.status(404).json("Task not found");
    }
});

module.exports = router;