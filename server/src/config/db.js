const fs = require('fs');
const path = require('path');

console.log('__dirname:', __dirname);
console.log('cwd:', process.cwd());

console.log(
    'Generated Prisma exists:',
    fs.existsSync(path.resolve(__dirname, '../../generated/prisma'))
);

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