const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../config/db');

const saltRounds = 10;
const router = express.Router();

router.get('/', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json( { users: users, message: "Get all users"});
});

// POST route: request -> get data -> hash password -> create record -> send response
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
        data: {
            email: email,
            passwordHash: passwordHash,
        },
    });
    res.json( { user: newUser, message: "User created"});
});

module.exports = {
    router,
    prisma,
    saltRounds
};