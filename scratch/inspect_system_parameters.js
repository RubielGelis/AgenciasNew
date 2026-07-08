const { Client } = require('pg');

async function main() {
    const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_db";
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query('SELECT * FROM public."SystemParameter"');
        console.log("SystemParameters in agencias_db:");
        for (const r of res.rows) {
            console.log(`- code: ${r.code}, value: ${r.value}`);
        }
        
        console.log("\nCalling fnGetSQLServerConfig()...");
        const res2 = await client.query('SELECT * FROM public."fnGetSQLServerConfig"()');
        console.log("Config returned:", res2.rows);
    } catch (e) {
        console.error(e.message);
    } finally {
        await client.end();
    }
}
main();
