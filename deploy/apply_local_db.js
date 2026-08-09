const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootPath = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(rootPath, '.env') });

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m"
};

async function applyLocalDb() {
    console.log(`${colors.bright}${colors.cyan}======================================================`);
    console.log(` APLICANDO CAMBIOS AUTOMÁTICOS A BASE DE DATOS LOCAL`);
    console.log(`======================================================${colors.reset}\n`);

    // 1. Validar variables de entorno
    if (!process.env.DATABASE_URL) {
        console.error(`${colors.red}[ERROR] No se encontró la variable DATABASE_URL en el archivo .env.${colors.reset}`);
        process.exit(1);
    }

    let host = 'localhost';
    let port = '5432';
    let database = 'korex_db';
    let user = 'postgres';
    let password = '';

    try {
        const parsedUrl = new URL(process.env.DATABASE_URL);
        host = parsedUrl.hostname || 'localhost';
        port = parsedUrl.port || '5432';
        database = parsedUrl.pathname.replace(/^\//, '') || 'korex_db';
        user = parsedUrl.username || 'postgres';
        password = decodeURIComponent(parsedUrl.password || '');
    } catch (e) {
        const match = process.env.DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]*)@([^:]+):([0-9]+)\/([^?]+)/);
        if (match) {
            user = match[1];
            password = decodeURIComponent(match[2]);
            host = match[3];
            port = match[4];
            database = match[5];
        }
    }

    // 2. Compilar los archivos SQL individuales (sps, tablas, funciones) en el Actualizador.SQL
    console.log(`${colors.bright}[Paso 1/2] Compilando e integrando cambios SQL (gen_actualizador.js)...${colors.reset}`);
    try {
        const genActualizadorPath = path.join(__dirname, 'gen_actualizador.js');
        execSync(`node "${genActualizadorPath}"`, { stdio: 'inherit', cwd: rootPath });
        console.log(`${colors.green}[OK] compilación de scripts SQL finalizada.${colors.reset}\n`);
    } catch (err) {
        console.error(`${colors.red}[ERROR] Falló la compilación de scripts SQL.${colors.reset}`);
        process.exit(1);
    }

    // 3. Ejecutar el db_installer.js localmente contra la base de datos configurada en el .env
    console.log(`${colors.bright}[Paso 2/2] Sincronizando base de datos local con comparador inteligente...${colors.reset}`);
    try {
        const dbInstallerPath = path.join(__dirname, 'db_installer.js');
        execSync(`node "${dbInstallerPath}" "${host}" "${port}" "${database}" "${user}" "${password}"`, { stdio: 'inherit', cwd: rootPath });
        console.log(`${colors.green}[OK] Sincronización local completada con éxito.${colors.reset}\n`);
    } catch (err) {
        console.error(`${colors.red}[ERROR] Falló la inyección y sincronización en la base de datos local.${colors.reset}`);
        process.exit(1);
    }

    console.log(`${colors.bright}${colors.green}>>> TODOS LOS CAMBIOS APLICADOS Y VERIFICADOS EN TU BASE LOCAL <<<${colors.reset}\n`);
}

applyLocalDb();
