const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const result = await Promise.all([
            prisma.client.findMany({ select: { id: true, name: true, document: true } }),
            prisma.provider.findMany({ include: { hotels: true } }),
            prisma.branch.findMany(),
            prisma.implant.findMany({ select: { id: true, name: true, branchId: true } }),
            prisma.product.findMany(),
            prisma.chargeAndTax.findMany(),
            prisma.seller.findMany(),
            prisma.ticketPrinter.findMany()
        ]);
        console.log('SUCCESS, fetched counts:', result.map(x => x.length));
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
check();
