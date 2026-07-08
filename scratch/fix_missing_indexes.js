const { Client } = require('pg');

async function main() {
    const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_db";
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("Creating unique indexes in agencias_db...");
        
        await client.query('CREATE UNIQUE INDEX IF NOT EXISTS countries_code_key ON public."Countries"(code);');
        console.log("- Created countries_code_key");
        
        await client.query('CREATE UNIQUE INDEX IF NOT EXISTS cities_code_key ON public."Cities"(code);');
        console.log("- Created cities_code_key");
        
        await client.query('CREATE UNIQUE INDEX IF NOT EXISTS airports_code_key ON public."Airports"(code);');
        console.log("- Created airports_code_key");
        
        console.log("Success!");
    } catch (e) {
        console.error("Error creating indexes:", e.message);
    } finally {
        await client.end();
    }
}
main();
