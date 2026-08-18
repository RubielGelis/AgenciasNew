require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
    try {
        const procs = await prisma.executionProcedure.findMany();
        console.log('ExecutionProcedures count:', procs.length);
        if (procs.length > 0) {
            console.log('First procedure:', procs[0].name, '| SP:', procs[0].spName);
            console.log('Parameters count:', Array.isArray(procs[0].parameters) ? procs[0].parameters.length : 0);
        }
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
