import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
    const logs = await prisma.systemLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
    });
    console.log(JSON.stringify(logs, null, 2));
    process.exit(0);
}
run();
