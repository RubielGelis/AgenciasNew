require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        const res = await client.query(`SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname='spcotizacionduplicar'`);
        if (res.rows.length > 0) {
            console.log("=== SP DEFINITION IN LOCAL POSTGRES ===");
            console.log(res.rows[0].pg_get_functiondef);
        } else {
            console.log("spcotizacionduplicar DOES NOT EXIST IN LOCAL POSTGRES");
        }
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await client.end();
    }
}

main();
