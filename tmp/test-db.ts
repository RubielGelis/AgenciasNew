import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const combos = await prisma.combo.findMany({
    include: {
        products: {
            include: {
                product: true,
                appliedTaxes: {
                    include: {
                        chargeAndTax: true
                    }
                }
            }
        }
    },
    orderBy: { createdAt: 'desc' },
    take: 1
  })
  console.log(JSON.stringify(combos, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
