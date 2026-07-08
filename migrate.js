const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Adding columns to InvoicesProductPayment...");
        await prisma.$executeRawUnsafe(`
            ALTER TABLE public."InvoicesProductPayment"
            ADD COLUMN IF NOT EXISTS "creditCardId" INT,
            ADD COLUMN IF NOT EXISTS "cardNumber" VARCHAR(20),
            ADD COLUMN IF NOT EXISTS "authorizationCode" VARCHAR(50),
            ADD COLUMN IF NOT EXISTS "voucher" VARCHAR(50),
            ADD COLUMN IF NOT EXISTS "expirationDate" VARCHAR(10);
        `);
        console.log("Columns added successfully!");
    } catch (e) {
        console.error("Error updating schema:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
