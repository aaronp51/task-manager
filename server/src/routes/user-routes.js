const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const authenticateToken = require('../middleware/auth.js');
const validateEmailAndPassword = require('../middleware/validation.js');

const saltRounds = 10;
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json( { users: users, message: "Get all users" });
    } catch (e) {
        next(err);
    }
});

// login route: request -> get data -> compare email and password -> verify credentials -> create token -> send token
router.post('/login', validateEmailAndPassword, async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        const correctPassword = await bcrypt.compare(password, existingUser.passwordHash);
        if(!correctPassword) {
            res.status(401).json("Invalid email or password");
        }
        const token = jwt.sign( // used to create a token with HEADER.PAYLOAD.SIGNATURE (decoded later in authenticateToken function)
            { userId: existingUser.id },
            process.env.JWT_SECRET,
            { expiresIn : '5m' }
        );
        res.json({ token });
    } catch (e) {
        next(err);
    }
});

// POST route: request -> get data -> hash password -> create record -> send response
router.post('/register', validateEmailAndPassword, async (req, res) => {
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
        next(err);
    }
});

module.exports = router;