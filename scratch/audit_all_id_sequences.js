require('dotenv').config();
const { Client } = require('pg');

async function auditIdSequences() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name, column_name, data_type, column_default 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND column_name = 'id' 
              AND data_type IN ('integer', 'bigint');
        `);

        console.log("=== AUDIT OF ALL 'id' COLUMNS IN POSTGRES ===");
        let missingDefaults = 0;
        for (const row of res.rows) {
            const hasNextval = row.column_default && row.column_default.includes('nextval');
            console.log(`Table: public."${row.table_name}" | Column: id | Default: ${row.column_default || 'NONE'} | Has Nextval: ${hasNextval}`);
            if (!hasNextval) {
                missingDefaults++;
            }
        }
        console.log(`\nTotal tables with 'id' column: ${res.rows.length}. Missing default sequence: ${missingDefaults}`);
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await client.end();
    }
}

auditIdSequences();
