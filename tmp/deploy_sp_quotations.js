const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public"
});

async function main() {
    try {
        const sqlCrear = fs.readFileSync(path.join(__dirname, '../SQL/SP/spCotizacionCrear.sql'), 'utf8');
        await pool.query(sqlCrear);
        console.log("spCotizacionCrear.sql compilado exitosamente.");

        const sqlActualizar = fs.readFileSync(path.join(__dirname, '../SQL/SP/spCotizacionActualizar.sql'), 'utf8');
        await pool.query(sqlActualizar);
        console.log("spCotizacionActualizar.sql compilado exitosamente.");
    } catch (e) {
        console.error("Error al desplegar SPs:", e);
    } finally {
        await pool.end();
    }
}

main();
