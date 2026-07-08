const { Client } = require('pg');

async function main() {
    const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_db";
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("Running INSERT ON CONFLICT on Role...");
        const res = await client.query(`
            INSERT INTO public."Role" (name)
            VALUES ('Admin')
            ON CONFLICT (name) DO NOTHING;
        `);
        console.log("Success! Result:", res.rowCount);
    } catch (e) {
        console.error("Error details:", {
            message: e.message,
            code: e.code,
            detail: e.detail,
            constraint: e.constraint
        });
    } finally {
        await client.end();
    }
}
main();
