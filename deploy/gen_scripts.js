const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
    const rootPath = path.join(__dirname, '..');
    const sqlPath = path.join(rootPath, 'SQL');
    const tablePath = path.join(sqlPath, 'Table');
    const updatePath = path.join(sqlPath, 'Actualizador');
    
    // Configura paths
    const tableIniFile = path.join(tablePath, 'TABLEINI.sql');
    const actFile = path.join(updatePath, 'Actualizador.SQL');
    
    if (!fs.existsSync(updatePath)) {
        fs.mkdirSync(updatePath, { recursive: true });
    }

    console.log("Extrayendo volcado de PostgreSQL...");
    let fullDump = '';
    try {
        process.env.PGPASSWORD = "111985";
        fullDump = execSync('"C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe" -h localhost -p 5432 -U postgres -d agencias_new --schema-only --no-owner --no-privileges', { encoding: 'utf8' });
    } catch(e) {
        console.error("Fallo ejecutando pg_dump", e.message);
        process.exit(1);
    }

    console.log("Formateando rigurosamente en formato DO $$ BEGIN... para el TABLEINI.sql...");
    const lines = fullDump.split(/\r?\n/);
    let tableOnlySql = 'do $$\nBEGIN\n\n';
    let isSkipping = false;
    
    // Lista de sentencias válidas dentro de DO block
    for(let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Saltarse basura de pg_dump o funciones
        if (line.match(/^CREATE (OR REPLACE )?(FUNCTION|PROCEDURE|TRIGGER|VIEW)/i) || 
            line.includes('--') || 
            line.startsWith('SET ') || 
            line.startsWith('\\') ||
            line.startsWith('COMMENT ON') ||
            line.startsWith('SELECT pg_catalog')) {
            isSkipping = true;
            continue;
        }

        if (isSkipping) {
            if (line.trim() === '$$;' || line.trim() === '$_$;' || line.includes('$function$;') || line.includes('$procedure$;') || line.trim() === '') {
                isSkipping = false;
            }
            continue;
        }

        if (line.trim() === '') continue;

        // Formatear IF NOT EXISTS en CREATE TABLE
        if (line.startsWith('CREATE TABLE public.')) {
            line = line.replace('CREATE TABLE public.', 'CREATE TABLE IF NOT EXISTS public.');
        }

        tableOnlySql += "    " + line + "\n";
    }

    tableOnlySql += "\nEND $$; \n";

    fs.writeFileSync(tableIniFile, tableOnlySql.trim());
    console.log(`[+] TABLEINI.sql re-formateado y guardado. (Tamaño: ${tableOnlySql.length} bytes)`);

    // 3. Generar el Actualizador Global
    console.log("Ensamblando Actualizador.SQL global...");
    let resultActualizador = `-- ==========================================================\n`;
    resultActualizador += `-- ARCHIVO ACTUALIZADOR COMPLETO: TABLAS + FUNCIONES + SPS\n`;
    resultActualizador += `-- Generado Automáticamente\n`;
    resultActualizador += `-- ==========================================================\n\n`;

    // A. Sumar Tables
    resultActualizador += `-- >>> 1. CREACIÓN DE TABLAS E ÍNDICES (TABLEINI) <<<\n\n`;
    resultActualizador += tableOnlySql + "\n\n";

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

    // C. Sumar Stored Procedures
    resultActualizador += `-- >>> 3. PROCEDIMIENTOS ALMACENADOS (SP) <<<\n\n`;
    const spDir = path.join(sqlPath, 'SP');
    if (fs.existsSync(spDir)) {
        const sps = fs.readdirSync(spDir).filter(f => f.endsWith('.sql'));
        for(const sp of sps) {
            resultActualizador += `-- Archivo: ${sp}\n`;
            resultActualizador += fs.readFileSync(path.join(spDir, sp), 'utf8') + "\n\n";
        }
    }

    fs.writeFileSync(actFile, resultActualizador);
    console.log(`[+] Actualizador.SQL guardado con éxito. (Tamaño: ${resultActualizador.length} bytes)`);

} catch (e) {
    console.error("Error fatal procesando: ", e);
}
