const { Pool } = require('pg');
const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });

async function queryUsers() {
    const res = await pool.query("SELECT id, name, email FROM \"User\";");
    console.log('Registered Users:', res.rows);
    await pool.end();
}

queryUsers();
