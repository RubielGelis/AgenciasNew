const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const combos = await prisma.combo.findMany({
      include: {
        products: {
          include: {
            appliedTaxes: true
          }
        }
      },
      orderBy: { id: 'desc' },
      take: 5
    });
    
    console.log('Last 5 Combos:');
    combos.forEach(c => {
      console.log(`ID: ${c.id}, Code: ${c.code}, Name: ${c.name}, Products Count: ${c.products.length}`);
      c.products.forEach(p => {
        console.log(`  - ProductID: ${p.productId}, Qty: ${p.quantity}, Taxes: ${p.appliedTaxes.length}`);
      });
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
