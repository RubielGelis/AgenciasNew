const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public"
});

async function testDefaultTemplateFlow() {
    console.log("=== INICIANDO PRUEBA DE BASE DE DATOS Y TABLA DE FORMATO PREDETERMINADO ===");
    try {
        const res = await pool.query('SELECT * FROM public."QuotationPrintDefaultTemplate"');
        console.log("Registros en QuotationPrintDefaultTemplate:", res.rows.length);
        console.log("=== PRUEBA DE BASE DE DATOS COMPLETADA EXITOSAMENTE ===");
    } catch (err) {
        console.error("Error en test:", err);
    } finally {
        await pool.end();
    }
}

testDefaultTemplateFlow();
