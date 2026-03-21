import prisma from './src/lib/prisma.js'

async function checkData() {
  const comboCount = await prisma.combo.count();
  const productCount = await prisma.comboProduct.count();
  const taxCount = await prisma.comboProductTax.count();
  
  console.log(`Combos: ${comboCount}`);
  console.log(`ComboProducts: ${productCount}`);
  console.log(`ComboProductTaxes: ${taxCount}`);
  
  if (productCount > 0) {
    const products = await prisma.comboProduct.findMany({
      include: { appliedTaxes: true }
    });
    console.log('Sample ComboProduct:', JSON.stringify(products[0], null, 2));
  }
}

checkData().catch(console.error);
