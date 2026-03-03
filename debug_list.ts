import prisma from './src/lib/prisma'

async function main() {
    try {
        const quotations = await prisma.quotation.findMany({
            include: {
                client: true,
                products: {
                    include: {
                        product: true,
                        provider: true,
                        hotel: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        })
        console.log("Success! Fetched", quotations.length);
    } catch (error) {
        console.error("PRISMA ERROR:", error);
    }
}
main()
