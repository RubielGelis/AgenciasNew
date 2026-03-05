const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });

async function main() {
    const email = 'admin@agencia.com';
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    try {
        // 1. Ensure Role table has the ADMIN role
        await pool.query("INSERT INTO \"Role\" (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;");

        // 2. Get role ID for ADMIN
        const roleResult = await pool.query("SELECT id FROM \"Role\" WHERE name = 'ADMIN';");
        if (roleResult.rows.length === 0) {
            console.error('Role ADMIN still doesnt exist after creation!');
            return;
        }
        const roleId = roleResult.rows[0].id;
        console.log('Role ADMIN ID:', roleId);

        // 3. Create or Update user Administrator
        const userResult = await pool.query(
            "INSERT INTO \"User\" (name, email, \"passwordHash\", \"roleId\") VALUES ($1, $2, $3, $4) " +
            "ON CONFLICT (email) DO UPDATE SET \"passwordHash\" = $3, \"roleId\" = $4 RETURNING id;",
            ['Administrador', email, hash, roleId]
        );

        console.log('User created/updated with ID:', userResult.rows[0].id);

        // 4. Also create Rubiel user just in case he prefers that one
        await pool.query(
            "INSERT INTO \"User\" (name, email, \"passwordHash\", \"roleId\") VALUES ($1, $2, $3, $4) " +
            "ON CONFLICT (email) DO UPDATE SET \"passwordHash\" = $3, \"roleId\" = $4 RETURNING id;",
            ['Rubiel Gelis', 'rubiel1985@gmail.com', hash, roleId]
        );
        console.log('User rubiel1985@gmail.com also created/updated');

    } catch (err) {
        console.error('ERROR during admin creation:', err);
    } finally {
        await pool.end();
    }
}

main();
