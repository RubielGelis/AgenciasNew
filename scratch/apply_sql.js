require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function main() {
    try {
        console.log("Adding logo to Branch...");
        try {
            await pool.query(`ALTER TABLE "Branch" ADD COLUMN "logo" BYTEA;`);
            console.log("Branch updated.");
        } catch(e) {
            console.log("Branch logo column might already exist: ", e.message);
        }

        console.log("Adding logo to Implant...");
        try {
            await pool.query(`ALTER TABLE "Implant" ADD COLUMN "logo" BYTEA;`);
            console.log("Implant updated.");
        } catch(e) {
            console.log("Implant logo column might already exist: ", e.message);
        }

        const path = require('path');
        const sqlPath = path.join(__dirname, '../SQL/Function/fnRptCotizacion.sql');
        console.log("Dropping existing spRptCotizacion and fnRptCotizacion...");
        await pool.query(`DROP FUNCTION IF EXISTS public."spRptCotizacion"(integer, integer);`);
        await pool.query(`DROP FUNCTION IF EXISTS public."fnRptCotizacion"(integer, integer);`);
        console.log("Applying fnRptCotizacion from:", sqlPath);
        const sql = fs.readFileSync(sqlPath, 'utf-8');
        await pool.query(sql);
        console.log("fnRptCotizacion created successfully!");

    } catch (e) {
        console.error("Error applying SQL:", e);
    } finally {
        await pool.end();
    }
}

main();
