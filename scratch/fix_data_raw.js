const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    try {
        const res = await client.query(`
            UPDATE public."ReportColumns" 
            SET table_alias = 't_quotationproduct' 
            WHERE column_name = 'prestadoraId' 
            AND (table_alias = 't1' OR table_alias IS NULL)
            AND report_id IN (SELECT id FROM public."Report" WHERE base_table = 'QuotationProductTax');
        `);
        console.log('Fixed ReportColumns:', res.rowCount);
        
        const res2 = await client.query(`
            UPDATE public."ReportFilters" 
            SET table_alias = 't_quotationproduct' 
            WHERE column_name = 'prestadoraId' 
            AND (table_alias = 't1' OR table_alias IS NULL)
            AND report_id IN (SELECT id FROM public."Report" WHERE base_table = 'QuotationProductTax');
        `);
        console.log('Fixed ReportFilters:', res2.rowCount);

        const res3 = await client.query(`
            UPDATE public."ReportSorts" 
            SET column_expr = 't_quotationproduct."prestadoraId"'
            WHERE column_expr LIKE '%prestadoraId%'
            AND report_id IN (SELECT id FROM public."Report" WHERE base_table = 'QuotationProductTax');
        `);
        console.log('Fixed ReportSorts:', res3.rowCount);

    } finally {
        await client.end();
    }
}

run().catch(console.error);
