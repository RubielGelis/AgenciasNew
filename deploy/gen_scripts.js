const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootPath = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(rootPath, '.env') });

let host = 'localhost';
let port = '5432';
let database = 'agencias_new';
let user = 'postgres';
let password = '';

if (process.env.DATABASE_URL) {
    try {
        const parsedUrl = new URL(process.env.DATABASE_URL);
        host = parsedUrl.hostname || 'localhost';
        port = parsedUrl.port || '5432';
        database = parsedUrl.pathname.replace(/^\//, '') || 'agencias_new';
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
}

try {
    const sqlPath = path.join(rootPath, 'SQL');
    const tablePath = path.join(sqlPath, 'Table');
    const updatePath = path.join(sqlPath, 'Actualizador');
    
    // Configura paths
    const tableIniFile = path.join(tablePath, 'TABLEINI.sql');
    const actFile = path.join(updatePath, 'Actualizador.SQL');
    
    if (!fs.existsSync(updatePath)) {
        fs.mkdirSync(updatePath, { recursive: true });
    }

    console.log(`Extrayendo volcado de PostgreSQL desde la base de datos: ${database}...`);
    let fullDump = '';
    try {
        process.env.PGPASSWORD = password;
        fullDump = execSync(`"C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe" -h ${host} -p ${port} -U ${user} -d ${database} --schema-only --no-owner --no-privileges`, { encoding: 'utf8' });
    } catch(e) {
        console.error("Fallo ejecutando pg_dump", e.message);
        process.exit(1);
    }

    console.log("Formateando rigurosamente en formato DO $$ BEGIN... para el TABLEINI.sql...");
    const lines = fullDump.split(/\r?\n/);
    let tableOnlySql = 'do $$\nBEGIN\n\n';
    let isSkipping = false;
    let skipType = null;
    let skipDelimiter = null;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let trimmed = line.trim();

        if (isSkipping) {
            let foundEnd = false;
            if (skipType === 'FUNCTION') {
                if (!skipDelimiter) {
                    const dollarMatch = trimmed.match(/\$[a-zA-Z_]*\$/);
                    if (dollarMatch) {
                        skipDelimiter = dollarMatch[0] + ';';
                    }
                } else {
                    if (trimmed.includes(skipDelimiter)) {
                        foundEnd = true;
                    }
                }
            } else {
                if (trimmed.endsWith(';')) {
                    foundEnd = true;
                }
            }
            
            if (foundEnd) {
                isSkipping = false;
                skipType = null;
                skipDelimiter = null;
            }
            continue;
        }

        // Descartar comentarios y metadatos del dump
        if (trimmed.startsWith('--') || 
            trimmed.startsWith('SET ') || 
            trimmed.startsWith('\\') ||
            trimmed.startsWith('COMMENT ON') ||
            trimmed.startsWith('SELECT pg_catalog')) {
            continue;
        }

        // Descartar alteración de funciones/vistas/etc
        if (trimmed.startsWith('ALTER FUNCTION') || 
            trimmed.startsWith('ALTER VIEW') || 
            trimmed.startsWith('ALTER TRIGGER') || 
            trimmed.startsWith('ALTER PROCEDURE')) {
            continue;
        }

        // Omitir definiciones de funciones, sps, vistas, etc.
        const functionMatch = trimmed.match(/^CREATE\s+(OR\s+REPLACE\s+)?(FUNCTION|PROCEDURE)/i);
        const viewTriggerMatch = trimmed.match(/^CREATE\s+(OR\s+REPLACE\s+)?(TRIGGER|VIEW|MATERIALIZED\s+VIEW)/i);

        if (functionMatch) {
            isSkipping = true;
            skipType = 'FUNCTION';
            
            const dollarMatch = trimmed.match(/\$[a-zA-Z_]*\$/);
            if (dollarMatch) {
                skipDelimiter = dollarMatch[0] + ';';
                if (trimmed.includes(skipDelimiter)) {
                    isSkipping = false;
                    skipType = null;
                    skipDelimiter = null;
                }
            } else {
                skipDelimiter = null;
            }
            continue;
        }

        if (viewTriggerMatch) {
            isSkipping = true;
            skipType = 'VIEW';
            skipDelimiter = ';';
            if (trimmed.endsWith(';')) {
                isSkipping = false;
                skipType = null;
                skipDelimiter = null;
            }
            continue;
        }

        if (trimmed === '') continue;

        // Formatear IF NOT EXISTS en CREATE TABLE
        if (line.startsWith('CREATE TABLE public.')) {
            line = line.replace('CREATE TABLE public.', 'CREATE TABLE IF NOT EXISTS public.');
        }
        
        // Formatear IF NOT EXISTS en CREATE SEQUENCE
        if (line.startsWith('CREATE SEQUENCE public.')) {
            line = line.replace('CREATE SEQUENCE public.', 'CREATE SEQUENCE IF NOT EXISTS public.');
        }

        // Formatear IF NOT EXISTS en CREATE INDEX
        if (line.startsWith('CREATE INDEX ')) {
            line = line.replace('CREATE INDEX ', 'CREATE INDEX IF NOT EXISTS ');
        }
        if (line.startsWith('CREATE UNIQUE INDEX ')) {
            line = line.replace('CREATE UNIQUE INDEX ', 'CREATE UNIQUE INDEX IF NOT EXISTS ');
        }

        tableOnlySql += "    " + line + "\n";
    }

    tableOnlySql += "\nEND $$; \n";

    // Formatear constraints de ALTER TABLE envolviéndolas en bloque DO
    tableOnlySql = tableOnlySql.replace(
        /ALTER TABLE ONLY public\."?([^"\s]+)"?\s*\r?\n\s+ADD CONSTRAINT "?([a-zA-Z0-9_]+)"?([\s\S]*?);/gi,
        (match, tableName, constraintName, rest) => {
            return `DO $con$\n    BEGIN\n        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${constraintName}') THEN\n            ALTER TABLE ONLY public."${tableName}" ADD CONSTRAINT "${constraintName}"${rest};\n        END IF;\n    END $con$;`;
        }
    );

    fs.writeFileSync(tableIniFile, tableOnlySql.trim());
    console.log(`[+] TABLEINI.sql re-formateado y guardado. (Tamaño: ${tableOnlySql.length} bytes)`);

    // Generar el script de adición de columnas a tablas existentes
    console.log("Generando Alter_New_Columns.sql...");
    let altersSql = 'DO $$\nBEGIN\n\n';
    let hasAlters = false;

    const tableRegex = /CREATE TABLE IF NOT EXISTS public\."?([^"\s\)]+)"?\s*\(([\s\S]*?)\);/gi;
    let tableMatch;
    while ((tableMatch = tableRegex.exec(tableOnlySql)) !== null) {
        const tableName = tableMatch[1];
        const body = tableMatch[2];
        const bodyLines = body.split('\n');
        
        for (let rawLine of bodyLines) {
            let line = rawLine.trim();
            if (line.endsWith(',')) {
                line = line.slice(0, -1).trim();
            }
            if (!line) continue;
            
            const upperLine = line.toUpperCase();
            if (upperLine.startsWith('CONSTRAINT') || 
                upperLine.startsWith('PRIMARY KEY') || 
                upperLine.startsWith('FOREIGN KEY') || 
                upperLine.startsWith('UNIQUE') ||
                upperLine.startsWith('CHECK')) {
                continue;
            }
            
            let columnName = '';
            let colDef = '';
            
            if (line.startsWith('"')) {
                const closeQuoteIndex = line.indexOf('"', 1);
                if (closeQuoteIndex !== -1) {
                    columnName = line.substring(1, closeQuoteIndex);
                    colDef = line.substring(closeQuoteIndex + 1).trim();
                }
            } else {
                const spaceIndex = line.indexOf(' ');
                if (spaceIndex !== -1) {
                    columnName = line.substring(0, spaceIndex);
                    colDef = line.substring(spaceIndex + 1).trim();
                } else {
                    columnName = line;
                }
            }
            
            if (columnName) {
                hasAlters = true;
                altersSql += `    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tableName}' AND column_name = '${columnName}') THEN\n`;
                altersSql += `        ALTER TABLE public."${tableName}" ADD COLUMN "${columnName}" ${colDef};\n`;
                altersSql += `    END IF;\n`;
            }
        }
    }
    altersSql += '\nEND $$;';

    const alterColumnsFile = path.join(tablePath, 'Alter_New_Columns.sql');
    fs.writeFileSync(alterColumnsFile, altersSql);
    console.log(`[+] Alter_New_Columns.sql generado y guardado.`);

    // 3. Generar el Actualizador Global
    console.log("Ensamblando Actualizador.SQL global...");
    let resultActualizador = `-- ==========================================================\n`;
    resultActualizador += `-- ARCHIVO ACTUALIZADOR COMPLETO: TABLAS + FUNCIONES + SPS\n`;
    resultActualizador += `-- Generado Automáticamente\n`;
    resultActualizador += `-- ==========================================================\n\n`;

    // A. Sumar Tables
    resultActualizador += `-- >>> 1. CREACIÓN DE TABLAS E ÍNDICES (TABLEINI) <<<\n\n`;
    resultActualizador += tableOnlySql + "\n\n";

    // A.1. Sumar Alter Columns
    resultActualizador += `-- >>> 1.1. ADICIÓN DE COLUMNAS A TABLAS EXISTENTES (ALTER COLUMNS) <<<\n\n`;
    resultActualizador += altersSql + "\n\n";

    // B. Sumar Functions
    resultActualizador += `-- >>> 2. FUNCIONES <<<\n\n`;
    const fnDir = path.join(sqlPath, 'Function');
    if (fs.existsSync(fnDir)) {
        const fns = fs.readdirSync(fnDir).filter(f => f.endsWith('.sql'));
        for(const f of fns) {
            resultActualizador += `-- Archivo: ${f}\n`;
            resultActualizador += fs.readFileSync(path.join(fnDir, f), 'utf8') + "\n\n";
        }
    }

    // C. Sumar Stored Procedures (Separar por tecnología)
    resultActualizador += `-- >>> 3. PROCEDIMIENTOS ALMACENADOS (SP) <<<\n\n`;
    
    let resultActualizadorServer = `-- ==========================================================\n`;
    resultActualizadorServer += `-- ARCHIVO ACTUALIZADOR COMPLETO: SPS (SQL SERVER)\n`;
    resultActualizadorServer += `-- Generado Automáticamente\n`;
    resultActualizadorServer += `-- ==========================================================\n\n`;
    resultActualizadorServer += `-- >>> PROCEDIMIENTOS ALMACENADOS (SQL SERVER) <<<\n\n`;

    const spDir = path.join(sqlPath, 'SP');
    if (fs.existsSync(spDir)) {
        const sps = fs.readdirSync(spDir).filter(f => f.endsWith('.sql'));
        for(const sp of sps) {
            const fileContent = fs.readFileSync(path.join(spDir, sp), 'utf8');
            if (fileContent.toLowerCase().includes('plpgsql')) {
                resultActualizador += `-- Archivo: ${sp}\n`;
                resultActualizador += fileContent + "\n\n";
            } else {
                resultActualizadorServer += `-- Archivo: ${sp}\n`;
                resultActualizadorServer += fileContent + "\n\n";
            }
        }
    }

    fs.writeFileSync(actFile, resultActualizador);
    console.log(`[+] Actualizador.SQL (PostgreSQL) guardado con éxito. (Tamaño: ${resultActualizador.length} bytes)`);

    const serverActFile = path.join(updatePath, 'ActualizadorSERVER.SQL');
    fs.writeFileSync(serverActFile, resultActualizadorServer);
    console.log(`[+] ActualizadorSERVER.SQL (SQL Server) guardado con éxito. (Tamaño: ${resultActualizadorServer.length} bytes)`);

    // Guardar copia en actualizado.sql en la raíz
    const rootActFile = path.join(rootPath, 'actualizado.sql');
    fs.writeFileSync(rootActFile, resultActualizador);
    console.log(`[+] actualizado.sql (raíz) actualizado con éxito.`);

    // Guardar copia en SQL/Actualizador.SQL directamente si existe
    const sqlFolderActFile = path.join(sqlPath, 'Actualizador.SQL');
    if (fs.existsSync(sqlFolderActFile)) {
        fs.writeFileSync(sqlFolderActFile, resultActualizador);
        console.log(`[+] SQL/Actualizador.SQL actualizado con éxito.`);
    }

} catch (e) {
    console.error("Error fatal procesando: ", e);
}
