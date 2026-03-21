const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    // Try to find if isMain is in the metadata of the model
    const metadata = prisma._baseDmmf.datamodel.models.find(m => m.name === 'ComboProductTax');
    console.log('ComboProductTax fields:', metadata.fields.map(f => f.name));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
