const { PrismaClient, Prisma } = require('../../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});
const prisma = new PrismaClient({
    omit: {
        user: {
            passwordHash: true,
        },
    },
    adapter: adapter,
});

module.exports = prisma;