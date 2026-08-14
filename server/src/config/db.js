import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

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

export default prisma;