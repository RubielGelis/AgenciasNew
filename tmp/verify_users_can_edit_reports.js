const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public"
});

async function main() {
    try {
        console.log("=== VERIFICANDO COLUMNA CANEDITREPORTS EN USUARIOS ===");
        const res = await pool.query('SELECT id, name, email, "canEditReports" FROM public."User" LIMIT 5');
        console.log("Usuarios en base de datos:");
        console.table(res.rows);
        console.log("=== PRUEBA DE BASE DE DATOS COMPLETADA ===");
    } catch (e) {
        console.error("PG Error:", e);
    } finally {
        await pool.end();
    }
}

main();
