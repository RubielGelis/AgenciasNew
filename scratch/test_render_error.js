const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { format } = require('date-fns');
require('dotenv').config();

async function main() {
    const connectionString = process.env.DATABASE_URL || "postgresql://postgres:zzeusagencias@localhost:5432/Korex_test?schema=public";
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        const results = await prisma.$queryRawUnsafe('SELECT * FROM public.fnCotizacionListar()');
        const quotations = results.map(row => row.fncotizacionlistar);
        console.log(`Testing rendering for ${quotations.length} quotations...`);

        quotations.forEach((q, idx) => {
            try {
                // Mimic the filter/map code from page.tsx:
                const mainProd = q.products.find((p) => p.mainTaxId) || (q.products && q.products.length > 0 ? q.products[0] : null);
                const firstProd = mainProd;
                const firstPaxName = firstProd?.passengers && Array.isArray(firstProd.passengers) && firstProd.passengers.length > 0 ? firstProd.passengers[0].name : '';
                
                // date formatting
                const formattedDate = format(new Date(q.date), 'dd MMM, yyyy');
                
                // pax name
                const paxText = (firstProd?.passengers && Array.isArray(firstProd.passengers) && firstProd.passengers.length > 0) ? firstProd.passengers[0].name : 'Mismo titular';
                
                // checkin/checkout formatting
                const checkInText = firstProd?.checkInDate ? format(new Date(firstProd.checkInDate), 'dd/MM/yy') : '-';
                const checkOutText = firstProd?.checkOutDate ? format(new Date(firstProd.checkOutDate), 'dd/MM/yy') : '-';
                
                // totalAmount formatting
                const formattedTotal = q.totalAmount.toLocaleString();
            } catch (err) {
                console.error(`CRASH on quotation index ${idx}, ID ${q.id}:`, err.message);
                console.log(JSON.stringify(q, null, 2));
            }
        });
        console.log("Rendering test done!");
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
main();
