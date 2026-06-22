const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    await client.connect();
    try {
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'Quotation'
            ORDER BY ordinal_position
        `);
        console.log('--- Quotation Columns in DB ---');
        res.rows.forEach(r => {
            console.log(`${r.column_name}: ${r.data_type}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
