const { Client } = require('pg');

async function main() {
    const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_db";
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'public'
            ORDER BY routine_name;
        `);
        console.log("Functions in agencias_db:");
        for (const r of res.rows) {
            console.log(`- ${r.routine_name}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
main();
