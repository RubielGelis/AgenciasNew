const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new' });

async function update() {
    try {
        await client.connect();
        const hash = '$2b$10$EZtfgaRfxSCXi7skcvH07GJi5Zws5KZKUD/goAINKQpjSmuv';
        await client.query('UPDATE public."User" SET "passwordHash" = $1 WHERE email = $2', [hash, 'rubiel1985@msn.com']);
        console.log('Password hash updated successfully');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}
update();
