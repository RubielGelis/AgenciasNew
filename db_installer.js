const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const host = process.argv[2] && process.argv[2] !== '' ? process.argv[2] : 'localhost';
const port = process.argv[3] && process.argv[3] !== '' ? process.argv[3] : '5432';
const database = process.argv[4] && process.argv[4] !== '' ? process.argv[4] : 'agencias_new';
const user = process.argv[5] && process.argv[5] !== '' ? process.argv[5] : 'postgres';
const password = process.argv[6] || '';

async function run() {
    console.log(`\n  >> Preparando inyección Postgres en ${host}:${port}...`);
    
    // 1. Validar/Crear Base de Datos conectándonos a 'postgres' base
    const adminClient = new Client({ connectionString: `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/postgres` });
    try {
        await adminClient.connect();
        const res = await adminClient.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${database}';`);
        if (res.rowCount === 0) {
            console.log(`  >> Creando base de datos '${database}'...`);
            await adminClient.query(`CREATE DATABASE "${database}";`);
        } else {
            console.log(`  >> La BD '${database}' ya existe, actualizando esquemas...`);
        }
        await adminClient.end();
    } catch (e) {
        console.error("  >> [ERROR] Fallo al conectarse al servicio PostgreSQL maestro. Verifica la contraseña o puerto.");
        console.error("  DETALLE: " + e.message);
        process.exit(1);
    }

    // 2. Inyectar Scripts SQL (Actualizador y Datos) en la BD correcta
    const dbClient = new Client({ connectionString: `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}` });
    try {
        await dbClient.connect();

        const actFile = path.join(__dirname, 'SQL', 'Actualizador.SQL');
        if (fs.existsSync(actFile)) {
            console.log("  >> Escaneando e Inyectando Estructuras Maestras (Actualizador.SQL)...");
            const sql = fs.readFileSync(actFile, 'utf8');
            await dbClient.query(sql);
            console.log("     Estructuras Cargadas Correctamente.");
        } else {
            console.log(`  >> [ALERTA] No se encontró el Actualizador.SQL en ${actFile}`);
        }

        const dataFile = path.join(__dirname, 'SQL', 'Inicial.sql');
        if (fs.existsSync(dataFile)) {
            console.log("  >> Poblando catálogos iniciales de la empresa (Inicial.sql)...");
            const sqlInit = fs.readFileSync(dataFile, 'utf8');
            await dbClient.query(sqlInit).catch(e => {
                 console.log("     [!] Aviso de Semilla de Datos (Quizás ya existen): " + e.message);
            });
            console.log("     Datos Iniciales Procesados.");
        }

        await dbClient.end();
    } catch (e) {
        console.error("  >> [ERROR FATAL] Problema inyectando scripts SQL:", e.message);
        if (e.position) console.error("     En Posición:", e.position);
        process.exit(1);
    }
}

run();
