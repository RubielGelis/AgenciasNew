const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const client = new Client({ connectionString: 'postgresql://postgres:111985@localhost:5432/agencias_new' });

async function fix() {
    try {
        await client.connect();
        const pass = '111985';
        const hash = bcrypt.hashSync(pass, 10);
        console.log('UPDATING rubiel1985@msn.com WITH HASH:', hash);
        
        await client.query('UPDATE public."User" SET "passwordHash" = $1 WHERE email = $2', [hash, 'rubiel1985@msn.com']);
        
        // Verify immediately
        const res = await client.query('SELECT "passwordHash" FROM public."User" WHERE email = $1', ['rubiel1985@msn.com']);
        const dbHash = res.rows[0].passwordHash;
        const match = await bcrypt.compare(pass, dbHash);
        console.log('VERIFICATION IN DB:', match ? 'SUCCESS' : 'FAILURE');
        console.log('FINAL HASH IN DB:', dbHash);
        
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}
fix();
