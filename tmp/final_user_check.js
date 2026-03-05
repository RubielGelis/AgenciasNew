const { Pool } = require('pg');
const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });

async function check() {
    const adminRes = await pool.query("SELECT * FROM \"User\" WHERE email = 'admin@agencia.com';");
    console.log('Result for admin@agencia.com:', adminRes.rows);

    const allRes = await pool.query("SELECT * FROM \"User\";");
    console.log('ALL USERS:', allRes.rows.map(u => ({ id: u.id, email: u.email, name: u.name, hash: u.passwordHash?.substring(0, 10) + '...' })));

    await pool.end();
}

check();
