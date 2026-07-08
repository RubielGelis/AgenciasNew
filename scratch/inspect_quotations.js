const { Client } = require('pg');

async function main() {
    const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_db";
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query('SELECT id, "clientId", "sellerId", state FROM public."Quotation"');
        console.log("Quotations in agencias_db:", res.rows);
    } catch (e) {
        console.error(e.message);
    } finally {
        await client.end();
    }
}
main();
