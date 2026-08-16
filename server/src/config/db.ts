import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});
// can't omit the passwordHash since it's needed for authentication
const prisma = new PrismaClient({
    adapter: adapter,
});

export default prisma;