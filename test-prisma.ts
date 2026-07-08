import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    try {
        const res = await prisma.$queryRawUnsafe('SELECT * FROM public."fnAirportListar"()');
        console.log(res);
    } catch (e) {
        console.error("Prisma error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
