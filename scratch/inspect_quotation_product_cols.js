const { Client } = require('pg');

async function main() {
    const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_db";
    const client = new Client({ connectionString });
    try {
        await client.connect();
        
        console.log("Columns of QuotationProduct table in agencias_db:");
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'QuotationProduct';
        `);
        for (const r of res.rows) {
            console.log(`- ${r.column_name}: ${r.data_type}`);
        }
    } catch (e) {
        console.error(e.message);
    } finally {
        await client.end();
    }
}
main();
