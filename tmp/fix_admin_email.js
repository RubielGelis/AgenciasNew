const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });

async function main() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    try {
        // 1. Ensure ADMIN role exists
        await pool.query("INSERT INTO \"Role\" (name) VALUES ('ADMIN') ON CONFLICT (name) DO NOTHING;");
        const roleResult = await pool.query("SELECT id FROM \"Role\" WHERE name = 'ADMIN';");
        const roleId = roleResult.rows[0].id;

        // 2. Create the plural version the user is likely typing
        await pool.query(
            "INSERT INTO \"User\" (name, email, \"passwordHash\", \"roleId\") VALUES ($1, $2, $3, $4) " +
            "ON CONFLICT (email) DO UPDATE SET \"passwordHash\" = $3, \"roleId\" = $4;",
            ['Administrador', 'admin@agencias.com', hash, roleId]
        );

        // 3. Keep the singular version just in case
        await pool.query(
            "INSERT INTO \"User\" (name, email, \"passwordHash\", \"roleId\") VALUES ($1, $2, $3, $4) " +
            "ON CONFLICT (email) DO UPDATE SET \"passwordHash\" = $3, \"roleId\" = $4;",
            ['Administrador', 'admin@agencia.com', hash, roleId]
        );

        console.log('Successfully created both variants: admin@agencia.com and admin@agencias.com');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

main();
