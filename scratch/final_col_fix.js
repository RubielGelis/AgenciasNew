const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();
    try {
        const reportName = 'CotizacionValor';
        const validT1Columns = ['id', 'quotationProductId', 'chargeAndTaxId', 'valueSnapshot', 'valueTypeSnapshot', 'explicitAmount', 'isMain'];
        
        const res = await client.query(`
            UPDATE public."ReportColumns" 
            SET table_alias = 't_quotationproduct' 
            WHERE report_id IN (SELECT id FROM public."Report" WHERE name = $1)
            AND table_alias = 't1'
            AND column_name NOT IN ('id', 'quotationProductId', 'chargeAndTaxId', 'valueSnapshot', 'valueTypeSnapshot', 'explicitAmount', 'isMain')
        `, [reportName]);
        console.log('Misplaced Columns Fixed:', res.rowCount);
    } finally {
        await client.end();
    }
}

run().catch(console.error);
