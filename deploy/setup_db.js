const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Client } = require('pg');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (question, defaultVal = '') => new Promise((resolve) => {
    rl.question(`${question}${defaultVal ? ` [${defaultVal}]` : ''}: `, (answer) => {
        resolve(answer.trim() || defaultVal);
    });
});

async function runSetup() {
    console.log("\n========================================================");
    console.log("   ASISTENTE DE CONFIGURACION DE BASE DE DATOS (PostgreSQL)  ");
    console.log("========================================================\n");
    console.log("Por favor, ingrese los datos de conexión al servidor PostgreSQL.");

    const host = await ask("1. Servidor/Host", "localhost");
    const port = await ask("2. Puerto", "5432");
    const database = await ask("3. Nombre de Base de Datos", "agencias_new");
    const user = await ask("4. Usuario", "postgres");
    
    // Para contraseñas, idealmente ocultaríamos, pero para simplicidad de Windows:
    const password = await ask("5. Contraseña", "111985"); 

    const databaseUrl = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}?schema=public`;

    console.log("\n[+] Probando conexión a la base de datos...");
    
    // Base de datos destino para asegurar que exista o conectarnos a la default para crearla
    const adminClient = new Client({ connectionString: `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/postgres` });
    
    try {
        await adminClient.connect();
        // Intentar crear la base de datos si no existe
        const res = await adminClient.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${database}';`);
        if (res.rowCount === 0) {
            console.log(`[+] Creando base de datos '${database}' por primera vez...`);
            await adminClient.query(`CREATE DATABASE "${database}";`);
        } else {
            console.log(`[!] La base de datos '${database}' ya existe. Procediendo a sincronizar esquemas.`);
        }
        await adminClient.end();
    } catch (e) {
        console.error("\n[ERROR CRITICO] No se pudo conectar al servidor Postgres:", e.message);
        console.log("Por favor revise el usuario, contraseña o que el servicio de PostgreSQL esté encendido.");
        rl.close();
        return;
    }

    // Escribir archivo .env corporativo
    const envPath = path.join(__dirname, '..', '.env');
    fs.writeFileSync(envPath, `DATABASE_URL="${databaseUrl}"\n`);
    console.log(`\n[+] Archivo maestro de configuración (.env) generado con éxito.`);

    console.log("\n[+] Instalando la estructura maestra usando Actualizador.SQL...");
    const appClient = new Client({ connectionString: databaseUrl });
    try {
        await appClient.connect();
        
        const actFilePath = path.join(__dirname, '..', 'SQL', 'Actualizador', 'Actualizador.SQL');
        if (fs.existsSync(actFilePath)) {
            const actSql = fs.readFileSync(actFilePath, 'utf8');
            process.stdout.write(`  -> Ejecutando Actualizador Maestro... `);
            await appClient.query(actSql);
            console.log("OK");
        } else {
            console.warn("  [!] No se encontró Actualizador.SQL. Omitiendo paso de estructura.");
        }

        const dataFilePath = path.join(__dirname, '..', 'SQL', 'Data', 'Inicial.sql');
        if (fs.existsSync(dataFilePath)) {
            console.log("  -> Insertando Catálogos y Semillas de Datos (Inicial.sql)...");
            const dataSql = fs.readFileSync(dataFilePath, 'utf8');
            await appClient.query(dataSql).catch(e => {
                 console.log("     [!] Aviso de datos: " + e.message);
            }); 
            console.log("     Finalizado OK.");
        }

        await appClient.end();
        console.log("\n========================================================");
        console.log(" ¡CONFIGURACIÓN DE LA BASE DE DATOS COMPLETADA CON ÉXITO! ");
        console.log("========================================================\n");
    } catch(e) {
        console.error("\n[ERROR] Falló la ejecución del instalador SQL:", e.message);
        if (e.position) console.error("Posición del error en el SQL:", e.position);
    }

    rl.close();
}

runSetup();
