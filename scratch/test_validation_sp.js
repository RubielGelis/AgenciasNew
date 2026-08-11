const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('--- TEST SP VALIDATION ---');
    
    // 1. Fetch first product
    const product = await prisma.product.findFirst({
        where: { id: 8 } // RENTA DE AUTO
    });
    if (!product) {
        console.error('Product ID 8 not found in database!');
        return;
    }
    
    console.log(`Using product: ID=${product.id}, Description="${product.description}"`);
    const originalMandatoryFields = product.mandatoryFields;
    
    // 2. Set passengers and payments as mandatory fields on this product
    await prisma.product.update({
        where: { id: product.id },
        data: { mandatoryFields: ['QuotationProduct.passengers', 'QuotationProduct.payments'] }
    });
    console.log('Set mandatoryFields to: [passengers, payments]');
    
    // 3. Construct a quotation payload with this product, but NO passengers or payments
    const testQuotationPayload = {
        clientId: 1,
        currency: 'USD',
        exchangeRate: 1.0,
        branchId: 1,
        totalAmount: 100.0,
        items: [
            {
                productId: product.id,
                quantity: 1,
                price: 100.0,
                cost: 80.0,
                mainTaxId: '1', // assume mainTaxId 1
                appliedTaxes: [],
                passengers: [], // EMPTY passengers
                payments: [], // EMPTY payments
                variables: []
            }
        ],
        combos: []
    };

    console.log('Attempting to call spCotizacionCrear...');
    try {
        const results = await prisma.$queryRawUnsafe(
            `CALL public.spCotizacionCrear($1::JSONB, $2::INT, $3::INT, $4::TEXT)`,
            JSON.stringify(testQuotationPayload),
            1, // actingUserId
            0, // p_quotation_id
            '' // p_mensaje_resultado
        );
        
        const message = results[0]?.p_mensaje_resultado || '';
        console.log('SP result message:', message);
        
        if (message.startsWith('ERROR:') && message.includes('requiere registrar al menos un pasajero')) {
            console.log('SUCCESS: Stored Procedure correctly caught the missing passengers field!');
        } else {
            console.error('FAILURE: Stored Procedure did not return the expected validation error message.');
        }
    } catch (err) {
        console.error('SP execution threw error:', err);
    }
    
    // 4. Restore original value
    await prisma.product.update({
        where: { id: product.id },
        data: { mandatoryFields: originalMandatoryFields }
    });
    console.log('Restored original product mandatoryFields.');
}

main()
    .catch(err => {
        console.error('Test encountered error:', err);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
