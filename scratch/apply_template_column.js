const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public"
});

async function main() {
    try {
        console.log("Adding columns to Branch...");
        try {
            await pool.query(`ALTER TABLE "Branch" ADD COLUMN "template" BYTEA;`);
            console.log("Branch template column added.");
        } catch(e) {
            console.log("Branch template column might already exist: ", e.message);
        }

        try {
            await pool.query(`ALTER TABLE "Branch" ADD COLUMN "templateConfig" JSONB;`);
            console.log("Branch templateConfig column added.");
        } catch(e) {
            console.log("Branch templateConfig column might already exist: ", e.message);
        }

        console.log("Adding columns to Implant...");
        try {
            await pool.query(`ALTER TABLE "Implant" ADD COLUMN "template" BYTEA;`);
            console.log("Implant template column added.");
        } catch(e) {
            console.log("Implant template column might already exist: ", e.message);
        }

        try {
            await pool.query(`ALTER TABLE "Implant" ADD COLUMN "templateConfig" JSONB;`);
            console.log("Implant templateConfig column added.");
        } catch(e) {
            console.log("Implant templateConfig column might already exist: ", e.message);
        }

        console.log("Database schema altered successfully!");

    } catch (e) {
        console.error("Error altering database schema:", e);
    } finally {
        await pool.end();
    }
}

main();
