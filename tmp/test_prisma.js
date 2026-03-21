
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const combo = await prisma.combo.create({
            data: {
                code: 'TEST_SCRIPT_' + Date.now(),
                name: 'Test Script Combo',
                products: {
                    create: [
                        {
                            productId: 1, // Assumes product 1 exists
                            quantity: 1,
                            price: 100,
                            providerId: null,
                            hotelId: null,
                            paxAdults: 2,
                            paxChildren: 0
                        }
                    ]
                }
            }
        })
        console.log('Combo created successfully:', combo)
    } catch (error) {
        console.error('FAILED to create combo:')
        console.error(error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
