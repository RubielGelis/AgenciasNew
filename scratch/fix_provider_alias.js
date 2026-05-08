const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    try {
        const reportName = 'CotizacionValor';
        
        // 1. Fix Columns
        const res1 = await client.query(`
            UPDATE public."ReportColumns" 
            SET table_alias = 't_quotationproduct' 
            WHERE report_id IN (SELECT id FROM public."Report" WHERE name = $1)
            AND column_name IN ('providerId', 'prestadoraId', 'quotationId', 'productId', 'quantity', 'price', 'cost')
            AND table_alias = 't1'
        `, [reportName]);
        console.log('Fixed ReportColumns:', res1.rowCount);

        // 2. Fix Filters
        const res2 = await client.query(`
            UPDATE public."ReportFilters" 
            SET table_alias = 't_quotationproduct' 
            WHERE report_id IN (SELECT id FROM public."Report" WHERE name = $1)
            AND column_name IN ('providerId', 'prestadoraId', 'quotationId', 'productId')
            AND table_alias = 't1'
        `, [reportName]);
        console.log('Fixed ReportFilters:', res2.rowCount);

        // 3. Fix Joins
        const res3 = await client.query(`
            UPDATE public."ReportJoins" 
            SET join_condition = REPLACE(join_condition, 't1."providerId"', 't_quotationproduct."providerId"')
            WHERE report_id IN (SELECT id FROM public."Report" WHERE name = $1)
            AND join_condition LIKE 't1."providerId"%';
        `, [reportName]);
        console.log('Fixed ReportJoins (providerId):', res3.rowCount);

    } finally {
        await client.end();
    }
}

run().catch(console.error);
