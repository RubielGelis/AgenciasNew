const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        await prisma.$connect();
        const runtime = prisma._runtimeDataModel;
        if (runtime) {
            console.log('QuotationProduct fields:');
            runtime.models.QuotationProduct.fields.forEach(f => {
                if (f.kind === 'scalar') {
                    console.log(f.name);
                }
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
