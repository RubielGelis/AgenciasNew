const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public"
});

async function main() {
    let sql = fs.readFileSync('c:/Proyectos/AgenciasNew/SQL/Sp/spInvoicesCrear.sql', 'utf8');
    
    // Modify jsonb_to_recordset columns
    sql = sql.replace('"class" TEXT, "ticketTypeId" INT, "payments" JSONB', '"class" TEXT, "airline" TEXT, "ticketTypeId" INT, "payments" JSONB');
    
    // Modify INSERT columns
    sql = sql.replace('"servicios", "descripcion", "itinerary", "class", "ticketTypeId"', '"servicios", "descripcion", "itinerary", "class", "airline", "ticketTypeId"');
    
    // Modify VALUES
    sql = sql.replace('v_item."itinerary", v_item."class", v_item."ticketTypeId"', 'v_item."itinerary", v_item."class", v_item."airline", v_item."ticketTypeId"');
    
    try {
        await pool.query(sql);
        fs.writeFileSync('c:/Proyectos/AgenciasNew/SQL/Sp/spInvoicesCrear.sql', sql);
        console.log("SP modified and applied successfully.");
    } catch (e) {
        console.error("PG error:", e);
    } finally {
        await pool.end();
    }
}

main();
