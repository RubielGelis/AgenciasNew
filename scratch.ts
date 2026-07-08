import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    let res = await prisma.invoicesProductPayment.findMany();
    console.log("Payments:", res);
}

run().finally(() => process.exit(0));
