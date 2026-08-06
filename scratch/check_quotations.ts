import prisma from '../src/lib/prisma';

async function main() {
    try {
        console.log("Checking quotations in the DB...");
        const count = await prisma.quotation.count();
        console.log(`Total quotations count: ${count}`);
        
        if (count > 0) {
            const list = await prisma.quotation.findMany({
                take: 5,
                include: {
                    client: true,
                    products: true
                }
            });
            console.log("Sample quotations:", JSON.stringify(list, null, 2));
        }

        // Call the database function to see what it returns
        console.log("Calling public.fnCotizacionListar()...");
        const fnResult = await prisma.$queryRawUnsafe(`SELECT * FROM public.fnCotizacionListar()`);
        console.log("fnCotizacionListar result count:", (fnResult as any).length);
        if ((fnResult as any).length > 0) {
            console.log("Sample fnCotizacionListar result:", JSON.stringify((fnResult as any)[0], null, 2));
        }
    } catch (error) {
        console.error("Error checking quotations:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
