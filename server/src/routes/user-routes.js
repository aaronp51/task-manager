const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../config/db');

const saltRounds = 10;
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json( { users: users, message: "Get all users"});
    } catch (e) {
        console.log("internal server error");
        res.status(500).json("internal server error");
    }
});

// POST route: request -> get data -> hash password -> create record -> send response
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    try {
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const newUser = await prisma.user.create({
            data: {
                email: email,
                passwordHash: passwordHash,
            },
        });
        res.json( { user: newUser, message: "User created"});
    } catch (e) {
        if(e instanceof Prisma.PrismaClientKnownRequestError) {
            if(e.code === "P2002") {
                console.log("unique constraint violation");
                res.status(409).json("Email is already registered");
            }
        }
        throw e;
    }
});

module.exports = router;