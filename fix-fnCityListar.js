const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public"
});

async function main() {
    const sqlCity = `
    CREATE OR REPLACE FUNCTION public."fnCityListar"()
    RETURNS TABLE(id integer, code text, name text, "countriesId" integer, statecode text, iata text, "countryName" text)
    LANGUAGE plpgsql AS $function$
    BEGIN
        RETURN QUERY SELECT c.id, c.code::text, c.name::text, c."countriesId", c.statecode::text, c.iata::text, co.name::text 
        FROM public."Cities" c 
        LEFT JOIN public."Countries" co ON c."countriesId" = co.id 
        ORDER BY c.name ASC;
    END; $function$;
    `;
    
    const sqlCountry = `
    CREATE OR REPLACE FUNCTION public."fnCountryListar"()
    RETURNS TABLE(id integer, code text, name text, dane text, region text, prefix text, "curencyId" integer)
    LANGUAGE plpgsql AS $function$
    BEGIN
        RETURN QUERY SELECT c.id, c.code::text, c.name::text, c.dane::text, c.region::text, c.prefix::text, c."curencyId" 
        FROM public."Countries" c 
        ORDER BY c.id ASC;
    END; $function$;
    `;

    try {
        await pool.query(sqlCity);
        console.log("fnCityListar updated successfully.");
        await pool.query(sqlCountry);
        console.log("fnCountryListar updated successfully.");
    } catch (e) {
        console.error("PG error:", e);
    } finally {
        await pool.end();
    }
}

main();
