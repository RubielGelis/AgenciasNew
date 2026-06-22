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
            SELECT id, code, name
            FROM public."MasterVariable"
        `);
        console.log('--- MasterVariable Records ---');
        res.rows.forEach(r => {
            console.log(`ID: ${r.id}, Code: ${r.code}, Name: ${r.name}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
