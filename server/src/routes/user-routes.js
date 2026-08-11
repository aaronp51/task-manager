const express = require('express');
const jwt = require('jsonwebtoken');
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

// login route: request -> get data -> compare email and password -> verify credentials -> create token -> send token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        const correctPassword = await brcypt.compare(password, passwordHash);
        if(!correctPassword) {
            res.status(401).json("Invliad email or password");
        }
        const token = jwt.sign(
            { userId: existingUser.id },
            process.env.JWT_SECRET,
            { expiresIn : '5m' }
        );
        res.json({ token });
    } catch (e) {
        console.log("Internal server error");
        res.status(500).json("Internal server error");
    }
});

// POST route: request -> get data -> hash password -> create record -> send response
router.post('/register', async (req, res) => {
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