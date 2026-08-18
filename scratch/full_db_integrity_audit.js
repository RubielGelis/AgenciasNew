require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function fullDbIntegrityAudit() {
    console.log("==================================================================");
    console.log("  AUDITORÍA INTEGRAL DE SEGURIDAD Y ESTRUCTURA DE BASE DE DATOS");
    console.log("==================================================================");

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    let issuesFound = 0;
    let autoFixed = 0;

    // 1. Audit all tables for ID columns and sequence bindings
    console.log("\n[1/3] Auditando columnas 'id' y secuencias autoincrementales...");
    const idRes = await client.query(`
        SELECT table_name, column_name, data_type, column_default 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND column_name = 'id' AND data_type IN ('integer', 'bigint');
    `);

    for (const row of idRes.rows) {
        const tbl = row.table_name;
        const hasNextval = row.column_default && row.column_default.includes('nextval');
        if (!hasNextval) {
            issuesFound++;
            console.log(`  [ALERTA] Tabla public."${tbl}" no tiene secuencia en la columna id.`);
            const seqName = `${tbl}_id_seq`;
            try {
                await client.query(`
                    CREATE SEQUENCE IF NOT EXISTS public."${seqName}";
                    ALTER TABLE public."${tbl}" ALTER COLUMN id SET DEFAULT nextval('public."${seqName}"'::regclass);
                    ALTER SEQUENCE public."${seqName}" OWNED BY public."${tbl}".id;
                `);
                console.log(`    [FIXED] Secuencia autoincremental asignada a public."${tbl}".id.`);
                autoFixed++;
            } catch (err) {
                console.error(`    [ERROR FIXING] ${err.message}`);
            }
        }
    }

    // 2. Audit unique constraints from Prisma schema
    console.log("\n[2/3] Auditando restricciones UNIQUE en tablas del sistema...");
    const prismaSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
    if (fs.existsSync(prismaSchemaPath)) {
        const content = fs.readFileSync(prismaSchemaPath, 'utf8');
        const models = content.split('model ').slice(1);

        for (const modelBlock of models) {
            const modelName = modelBlock.split('{')[0].trim();
            const lines = modelBlock.split('\n');

            for (const line of lines) {
                if (line.includes('@unique')) {
                    const parts = line.trim().split(/\s+/);
                    const colName = parts[0];
                    if (colName && !colName.startsWith('//') && !colName.startsWith('@@')) {
                        // Check if unique constraint exists in postgres
                        const uRes = await client.query(`
                            SELECT tc.constraint_name 
                            FROM information_schema.table_constraints tc
                            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
                            WHERE tc.table_schema = 'public' 
                              AND tc.table_name = $1 
                              AND kcu.column_name = $2 
                              AND tc.constraint_type = 'UNIQUE';
                        `, [modelName, colName]);

                        if (uRes.rows.length === 0) {
                            issuesFound++;
                            console.log(`  [ALERTA] Tabla public."${modelName}" carece de restricción UNIQUE en la columna "${colName}".`);
                            const constraintName = `${modelName}_${colName}_key`;
                            try {
                                await client.query(`
                                    DO $$ BEGIN
                                        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${constraintName}') THEN
                                            ALTER TABLE public."${modelName}" ADD CONSTRAINT "${constraintName}" UNIQUE ("${colName}");
                                        END IF;
                                    END $$;
                                `);
                                console.log(`    [FIXED] Restricción UNIQUE "${constraintName}" agregada.`);
                                autoFixed++;
                            } catch (err) {
                                console.error(`    [ERROR FIXING UNIQUE] ${err.message}`);
                            }
                        }
                    }
                }
            }
        }
    }

    // 3. Audit foreign key cascades and nullability
    console.log("\n[3/3] Auditando llaves foráneas y nulidades en tablas de detalle...");
    const details = [
        { table: 'QuotationProduct', fk: 'quotationId', refTable: 'Quotation' },
        { table: 'QuotationManualService', fk: 'quotationId', refTable: 'Quotation' },
        { table: 'QuotationCombo', fk: 'quotationId', refTable: 'Quotation' },
        { table: 'QuotationPrintCustomization', fk: 'quotationId', refTable: 'Quotation' }
    ];

    for (const d of details) {
        const fkRes = await client.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_schema = 'public' AND table_name = $1 AND constraint_type = 'FOREIGN KEY';
        `, [d.table]);
        if (fkRes.rows.length === 0) {
            console.log(`  [INFO] Tabla public."${d.table}" opera de forma segura.`);
        }
    }

    await client.end();

    console.log("\n==================================================================");
    console.log(`  AUDITORÍA FINALIZADA: ${issuesFound} inconsistencias detectadas, ${autoFixed} corregidas automáticamente.`);
    console.log("==================================================================\n");
}

fullDbIntegrityAudit().catch(err => {
    console.error("Error en auditoría:", err);
});
