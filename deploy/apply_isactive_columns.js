require('dotenv').config();
const { Client } = require('pg');
const { execSync } = require('child_process');

async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    const tables = [
        'Implant', 'Branch', 'Seller', 'TicketPrinter', 'MasterVariable', 
        'Combo', 'QuotationState', 'ChargeAndTax', 'Product', 'Provider', 
        'Prestadora', 'Currency', 'CreditCard', 'Payment', 'Client', 'User',
        'Airport', 'City', 'Country', 'ProviderType', 'QuotationFormat',
        'InterfaceExtractParam', 'DocumentResolution', 'TransactionConsecutive'
    ];

    for (const t of tables) {
        try {
            await client.query(`ALTER TABLE public."${t}" ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true;`);
            await client.query(`UPDATE public."${t}" SET "isActive" = true WHERE "isActive" IS NULL;`);
            console.log(`[OK] Table ${t} updated with isActive.`);
        } catch (e) {
            console.error(`[WARN] Table ${t}:`, e.message);
        }
    }

    await client.end();

    console.log('\nRunning npx prisma db pull...');
    execSync('npx prisma db pull', { stdio: 'inherit' });

    console.log('\nRunning npx prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('\nSUCCESS! Prisma Client updated.');
}

main();
