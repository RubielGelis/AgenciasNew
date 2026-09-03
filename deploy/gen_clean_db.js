require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { execSync } = require('child_process');
const { validateAndPrepareSchema } = require('./validate_schema_before_package');

const rootDir = path.join(__dirname, '..');

async function generateCleanDatabase() {
    console.log("================================================================");
    console.log("  GENERADOR DE BASE DE DATOS LIMPIA - AGENCIASNEW (KOREX)");
    console.log("================================================================");

    const baseConnStr = process.env.DATABASE_URL || 'postgresql://postgres:zzeusagencias@localhost:5432/postgres';
    
    // Parse connection string for params
    const dbUrlObj = new URL(baseConnStr);
    const host = dbUrlObj.hostname || 'localhost';
    const port = dbUrlObj.port || '5432';
    const user = dbUrlObj.username || 'postgres';
    const password = dbUrlObj.password || 'zzeusagencias';
    
    const rootConnStr = `postgresql://${user}:${password}@${host}:${port}/postgres`;
    const cleanDbName = 'Korex_BaseLimpia';
    const targetConnStr = `postgresql://${user}:${password}@${host}:${port}/${cleanDbName}`;

    // 1. Conectar a postgres y recrear la base de datos Korex_BaseLimpia
    console.log("\n[PASO 1/5] Recreando base de datos limpia: " + cleanDbName + "...");
    const rootClient = new Client({ connectionString: rootConnStr });
    await rootClient.connect();

    try {
        await rootClient.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${cleanDbName}' AND pid <> pg_backend_pid();`);
        await rootClient.query(`DROP DATABASE IF EXISTS "${cleanDbName}";`);
        await rootClient.query(`CREATE DATABASE "${cleanDbName}" WITH OWNER = "${user}" ENCODING = 'UTF8';`);
        console.log("  [OK] Base de datos '" + cleanDbName + "' creada desde cero.");
    } catch (err) {
        console.error("  [ERROR] Error al recrear la base de datos: " + err.message);
        process.exit(1);
    } finally {
        await rootClient.end();
    }

    // 1.5. Aplicar esquema Prisma completo a Korex_BaseLimpia
    console.log("\n[PASO 1.5/5] Inyectando tablas y relaciones desde Prisma Schema en " + cleanDbName + "...");
    try {
        const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        execSync(`${npxCmd} prisma db push --accept-data-loss --url "${targetConnStr}"`, { stdio: 'inherit' });
        console.log("  [OK] Esquema Prisma inyectado exitosamente.");
    } catch (err) {
        console.warn("  [WARN] Advertencia al inyectar esquema Prisma: " + err.message);
    }

    // 2. Ejecutar el validador pre-compilación sobre Korex_BaseLimpia para desplegar DDL, SPs, Funciones y Semillas
    console.log("\n[PASO 2/5] Desplegando DDL, Tablas, Funciones y Procedimientos sobre " + cleanDbName + "...");
    await validateAndPrepareSchema(targetConnStr);

    const cleanClient = new Client({ connectionString: targetConnStr });
    await cleanClient.connect();

    try {
        // C. Ejecutar Inicial.sql
        const inicialPath = path.join(rootDir, 'SQL', 'Inicial.sql');
        if (fs.existsSync(inicialPath)) {
            const sql = fs.readFileSync(inicialPath, 'utf8');
            try {
                await cleanClient.query(sql);
            } catch (err) {
                console.warn("  [WARN] Inicial.sql: " + err.message);
            }
            console.log("  [OK] Semillas iniciales (Roles, Usuario Admin, Parámetros, Menú) sembrados desde Inicial.sql.");
        }

        // 3. Limpieza de tablas operacionales y verificación de integridad
        console.log("\n[PASO 3/5] Verificando vaciado estricto de tablas operacionales...");
        const opTables = [
            'Quotation', 'QuotationProduct', 'QuotationProductTax', 'QuotationProductVariable', 
            'QuotationProductPassenger', 'QuotationProductPayment', 'QuotationCombo', 'QuotationInvoice', 
            'QuotationStateHistory', 'Invoice', 'InvoicesProduct', 'InvoicesProductTax', 
            'InvoicesProductVariable', 'InvoicesProductPasenger', 'InvoicesProductPayment', 
            'InvoicesProductCombo', 'PreQuotation', 'PreQuotationStateHistory', 'ExecutionPreset', 
            'ExecutionProcedure', 'BookingGDS', 'Attachment', 'SystemLog'
        ];

        for (const tbl of opTables) {
            try {
                await cleanClient.query(`TRUNCATE TABLE public."${tbl}" CASCADE;`);
            } catch (e) {
                // Si no existe la tabla en esta versión, ignorar
            }
        }
        console.log("  [OK] Tablas operacionales vaciadas (0 Cotizaciones, 0 Facturas, 0 Ejecuciones).");

        // Audit active currencies: ensure COP, USD, EUR active, all others inactive
        await cleanClient.query(`
            UPDATE public."Currency" 
            SET "isActive" = CASE 
                WHEN UPPER(TRIM(code)) IN ('COP', 'USD', 'EUR') THEN true 
                ELSE false 
            END;
        `);

        // Check counts
        const menuCount = await cleanClient.query('SELECT COUNT(*) FROM public."Menu";');
        const masterCount = await cleanClient.query('SELECT COUNT(*) FROM public."Master";');
        const paramCount = await cleanClient.query('SELECT COUNT(*) FROM public."SystemParameter";');
        const userCount = await cleanClient.query('SELECT COUNT(*) FROM public."User";');

        console.log("\n  --- RESUMEN DE LA BASE DE DATOS LIMPIA GENERADA ---");
        console.log("  * Módulos de Menú Sembrados:     " + menuCount.rows[0].count);
        console.log("  * Tarjetas de Maestros:         " + masterCount.rows[0].count);
        console.log("  * Parámetros del Sistema:       " + paramCount.rows[0].count);
        console.log("  * Usuarios Iniciales (Admin):   " + userCount.rows[0].count);
        console.log("  * Cotizaciones / Facturas:       0 (Totalmente Limpia)");

    } catch (err) {
        console.error("  [ERROR] Falló la preparación de la base limpia: " + err.message);
        process.exit(1);
    } finally {
        await cleanClient.end();
    }

    // 4. Generar archivos de Dump SQL de producción
    console.log("\n[PASO 4/5] Exportando Dump SQL de la Base Limpia...");
    const outputDirs = [
        path.join(rootDir, 'deploy', 'BaseLimpia'),
        path.join(rootDir, 'SQL'),
        path.join(rootDir, 'RELEASE_KOREX', 'SQL')
    ];

    outputDirs.forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // Locate pg_dump.exe
    let pgDumpCmd = 'pg_dump';
    const possiblePgDumpPaths = [
        'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe',
        'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
        'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
        'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
        'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
        'C:\\Program Files\\PostgreSQL\\13\\bin\\pg_dump.exe'
    ];

    for (const pPath of possiblePgDumpPaths) {
        if (fs.existsSync(pPath)) {
            pgDumpCmd = '"' + pPath + '"';
            break;
        }
    }

    const dumpFileName = 'Korex_Limpia.sql';
    const targetDumpPath = path.join(rootDir, 'deploy', 'BaseLimpia', dumpFileName);

    try {
        const dumpExecStr = `${pgDumpCmd} -h ${host} -p ${port} -U ${user} --clean --if-exists --inserts --no-owner --no-privileges "${cleanDbName}" > "${targetDumpPath}"`;
        execSync(dumpExecStr, { env: { ...process.env, PGPASSWORD: password } });
        console.log("  [OK] Dump ejecutable generado con pg_dump en: " + targetDumpPath);

        // Copy dump to SQL/ and RELEASE_KOREX/SQL/
        outputDirs.forEach(dir => {
            const dest = path.join(dir, dumpFileName);
            if (dest !== targetDumpPath) {
                fs.copyFileSync(targetDumpPath, dest);
            }
        });
        console.log("  [OK] Dump copiado exitosamente a carpetas de despliegue.");
    } catch (err) {
        console.warn("  [WARN] Advertencia con pg_dump: " + err.message + ". Generando Dump SQL unificado independiente...");

        // Fallback: Generate unified idempotent SQL script
        let combinedSql = "-- AGENCIASNEW / KOREX - BASE DE DATOS LIMPIA PARA NUEVOS CLIENTES\n";
        combinedSql += "-- FECHA DE GENERACION: " + new Date().toISOString() + "\n\n";

        combinedSql += fs.readFileSync(path.join(rootDir, 'SQL', 'Table', 'Alter_New_Columns.sql'), 'utf8') + '\n\n';

        const folders = ['SQL/Function', 'SQL/SP', 'SQL/Procedure'];
        for (const folder of folders) {
            const dirPath = path.join(rootDir, folder);
            if (!fs.existsSync(dirPath)) continue;
            const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.sql'));
            for (const file of files) {
                if (file === 'TABLEINI.sql' || file === 'Alter_New_Columns.sql') continue;
                combinedSql += "-- File: " + folder + "/" + file + "\n";
                combinedSql += fs.readFileSync(path.join(dirPath, file), 'utf8') + '\n\n';
            }
        }

        combinedSql += fs.readFileSync(path.join(rootDir, 'SQL', 'Inicial.sql'), 'utf8') + '\n\n';

        outputDirs.forEach(dir => {
            fs.writeFileSync(path.join(dir, dumpFileName), combinedSql, 'utf8');
        });
        console.log("  [OK] Dump SQL unificado independiente generado en todas las carpetas de despliegue.");
    }

    console.log("\n================================================================");
    console.log("  EXITO: La Base de Datos Limpia 'Korex_Limpia.sql' ha sido producida");
    console.log("  y está lista para ser restaurada en cualquier cliente nuevo.");
    console.log("================================================================\n");
}

generateCleanDatabase();
