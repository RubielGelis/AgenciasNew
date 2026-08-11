const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('--- TEST MANDATORY FIELDS DATABASE & PRISMA ---');
    
    // 1. Fetch first product
    const product = await prisma.product.findFirst();
    if (!product) {
        console.error('No products found in database!');
        return;
    }
    
    console.log(`Found product: ID=${product.id}, Description="${product.description}"`);
    const originalMandatoryFields = product.mandatoryFields;
    console.log('Original mandatoryFields:', originalMandatoryFields);
    
    // 2. Update product with test configuration
    const testFields = ['QuotationProduct.passengers', 'QuotationProduct.payments'];
    console.log('Updating product with test mandatory fields:', testFields);
    
    const updated = await prisma.product.update({
        where: { id: product.id },
        data: { mandatoryFields: testFields }
    });
    
    console.log('Updated product from DB:', updated.mandatoryFields);
    
    // Verify
    if (Array.isArray(updated.mandatoryFields) && updated.mandatoryFields.includes('QuotationProduct.passengers')) {
        console.log('SUCCESS: Database and Prisma read/write works correctly!');
    } else {
        console.error('FAILURE: Value was not updated or retrieved correctly.');
    }
    
    // 3. Restore original value
    await prisma.product.update({
        where: { id: product.id },
        data: { mandatoryFields: originalMandatoryFields }
    });
    console.log('Restored original mandatoryFields.');
}

main()
    .catch(err => {
        console.error('Test encountered error:', err);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
