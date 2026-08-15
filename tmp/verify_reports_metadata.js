const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public"
});

async function testMetadataApi() {
    console.log("=== VERIFICANDO RESPUESTA DE METADATA DE REPORTES ===");
    try {
        // En Node.js puro ejecutamos la lógica del backend
        const ALLOWED_TABLES = [
            'Quotation',
            'QuotationProduct',
            'QuotationManualService',
            'Client',
            'Seller',
            'TicketPrinter',
            'Branch',
            'Implant',
            'Provider',
            'Prestadora',
            'Product',
            'User'
        ];

        const resTables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name IN (${ALLOWED_TABLES.map(t => `'${t}'`).join(',')})
        `);

        console.log("Tablas autorizadas devueltas por la consulta:", resTables.rows.map(r => r.table_name));
        console.log("Total de tablas expuestas:", resTables.rows.length);
        console.log("=== PRUEBA COMPLETADA CON ÉXITO ===");
    } catch (e) {
        console.error("PG Error:", e);
    } finally {
        await pool.end();
    }
}

testMetadataApi();
