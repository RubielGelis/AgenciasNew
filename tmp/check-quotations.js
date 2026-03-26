const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new' });

async function main() {
    const prods = await pool.query(`
        SELECT qp.id, qp."quotationId", qp."productId", qp."providerId", qp."prestadoraId", 
               qp.price, qp.quantity, qp."mainTaxId",
               p.description as product_name,
               prov.name as provider_name
        FROM public."QuotationProduct" qp
        LEFT JOIN public."Product" p ON qp."productId" = p.id
        LEFT JOIN public."Provider" prov ON qp."providerId" = prov.id
        LIMIT 5
    `);
    console.log('QuotationProduct rows:');
    prods.rows.forEach(r => console.log(JSON.stringify(r)));

    // Check taxes
    const taxes = await pool.query(`SELECT * FROM public."QuotationProductTax" LIMIT 5`);
    console.log('\nQuotationProductTax rows:', taxes.rows.length);
    taxes.rows.forEach(r => console.log(JSON.stringify(r)));
}

main().catch(console.error).finally(() => pool.end());
