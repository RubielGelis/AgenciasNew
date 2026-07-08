const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public"
});

async function main() {
    const sql = `
    CREATE OR REPLACE FUNCTION public."fnAirportListar"()
    RETURNS TABLE(id integer, code text, name text, "citiesId" integer, "cityName" text)
    LANGUAGE plpgsql AS $function$
    BEGIN
        RETURN QUERY SELECT a.id, a.code::text, a.name::text, a."citiesId", c.name::text 
        FROM public."Airports" a 
        LEFT JOIN public."Cities" c ON a."citiesId" = c.id 
        ORDER BY a.name ASC;
    END; $function$;
    `;
    try {
        await pool.query(sql);
        console.log("Function created successfully.");
        const res = await pool.query('SELECT * FROM public."fnAirportListar"()');
        console.log(res.rows);
    } catch (e) {
        console.error("PG error:", e);
    } finally {
        await pool.end();
    }
}

main();
