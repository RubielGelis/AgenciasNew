const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });

async function main() {
    const email = 'admin@agencia.com';
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    try {
        // 1. Ensure ADMIN role exists
        await pool.query("INSERT INTO \"Role\" (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;");

        // 2. Get role ID
        const roleRes = await pool.query("SELECT id FROM \"Role\" WHERE name = 'ADMIN';");
        const roleId = roleRes.rows[0].id;

        // 3. Create or Update user
        const userRes = await pool.query(
            "INSERT INTO \"User\" (name, email, \"passwordHash\", \"roleId\") VALUES ($1, $2, $3, $4) " +
            "ON CONFLICT (email) DO UPDATE SET \"passwordHash\" = $3, \"roleId\" = $4 RETURNING id;",
            ['Administrador', email, hash, roleId]
        );

        console.log('User created/updated with ID:', userRes.rows[0].id);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();
