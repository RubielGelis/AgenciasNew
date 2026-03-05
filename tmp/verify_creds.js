const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });

async function verify() {
    const email = 'admin@agencia.com';
    const password = 'admin123';

    const res = await pool.query("SELECT \"passwordHash\" FROM \"User\" WHERE email = $1;", [email]);
    if (res.rows.length === 0) {
        console.log('User not found!');
    } else {
        const hash = res.rows[0].passwordHash;
        const isValid = await bcrypt.compare(password, hash);
        console.log(`Password 'admin123' for ${email} is: ${isValid ? 'VALID' : 'INVALID'}`);
    }
    await pool.end();
}

verify();
