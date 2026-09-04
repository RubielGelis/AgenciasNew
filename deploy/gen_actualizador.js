const fs = require('fs');
const path = require('path');

function readClean(file) {
    let t = fs.readFileSync(file, 'utf8');
    return t.replace(/^\uFEFF/, '').trim();
}

try {
    const root = path.join(__dirname, '..', 'SQL');
    const actFile = path.join(root, 'Actualizador', 'Actualizador.SQL');

    console.log("Generando Actualizador.SQL...");

    let content = '-- ==========================================================\n';
    content += '-- ARCHIVO ACTUALIZADOR COMPLETO: TABLAS + FUNCIONES + SPS\n';
    content += '-- Generado Automáticamente\n';
    content += '-- ==========================================================\n\n';

    // 1. TABLEINI (Mantenemos exactamente el archivo manual del usuario)
    content += '-- >>> 1. CREACIÓN DE TABLAS E ÍNDICES (TABLEINI) <<<\n\n';
    const tableIni = readClean(path.join(root, 'Table', 'TABLEINI.sql'));
    content += tableIni + '\n\n';

    // 1.1 ALTER COLUMNS
    content += '-- >>> 1.1. ADICIÓN DE COLUMNAS A TABLAS EXISTENTES (ALTER COLUMNS) <<<\n\n';
    const alterFile = path.join(root, 'Table', 'Alter_New_Columns.sql');
    if (fs.existsSync(alterFile)) {
        content += readClean(alterFile) + '\n\n';
    }

    // 1.2 OTRAS TABLAS Y ESQUEMAS
    content += '-- >>> 1.2. OTRAS TABLAS Y ESQUEMAS <<<\n\n';
    const tableDir = path.join(root, 'Table');
    if (fs.existsSync(tableDir)) {
        const tableFiles = fs.readdirSync(tableDir).filter(f => f.endsWith('.sql') && f !== 'TABLEINI.sql' && f !== 'Alter_New_Columns.sql');
        for (const f of tableFiles) {
            content += `-- Archivo: ${f}\n`;
            content += readClean(path.join(tableDir, f)) + '\n\n';
        }
    }

    let contentServer = '-- ==========================================================\n';
    contentServer += '-- ARCHIVO ACTUALIZADOR COMPLETO: FUNCIONES + SPS (SQL SERVER)\n';
    contentServer += '-- Generado Automáticamente\n';
    contentServer += '-- ==========================================================\n\n';

    // 2. Functions
    content += '-- >>> 2. FUNCIONES (POSTGRESQL) <<<\n\n';
    contentServer += '-- >>> 2. FUNCIONES (SQL SERVER) <<<\n\n';
    const fnDir = path.join(root, 'Function');
    if (fs.existsSync(fnDir)) {
        const fns = fs.readdirSync(fnDir).filter(f => f.endsWith('.sql'));
        for (const f of fns) {
            const fnContent = readClean(path.join(fnDir, f));
            if (fnContent.toLowerCase().includes('plpgsql')) {
                content += `-- Archivo: ${f}\n`;
                content += fnContent + '\n\n';
            } else {
                contentServer += `-- Archivo: ${f}\n`;
                contentServer += fnContent + '\n\n';
            }
        }
    }

    // 3. Stored Procedures
    content += '-- >>> 3. PROCEDIMIENTOS ALMACENADOS (POSTGRESQL) <<<\n\n';
    contentServer += '-- >>> 3. PROCEDIMIENTOS ALMACENADOS (SQL SERVER) <<<\n\n';

    const spDir = path.join(root, 'SP');
    if (fs.existsSync(spDir)) {
        const sps = fs.readdirSync(spDir).filter(f => f.endsWith('.sql'));
        for (const sp of sps) {
            const fileContent = readClean(path.join(spDir, sp));
            if (fileContent.toLowerCase().includes('plpgsql')) {
                content += `-- Archivo: ${sp}\n`;
                content += fileContent + '\n\n';
            } else {
                contentServer += `-- Archivo: ${sp}\n`;
                contentServer += fileContent + '\n\n';
            }
        }
    }

    // Guardar en SQL/Actualizador/ y también en SQL/ para compatibilidad total
    fs.writeFileSync(actFile, content, 'utf8');
    fs.writeFileSync(path.join(root, 'Actualizador.SQL'), content, 'utf8');
    console.log('Actualizador.SQL (PostgreSQL) regenerado con éxito (' + content.length + ' bytes).');

    const serverActFile = path.join(root, 'Actualizador', 'ActualizadorSERVER.SQL');
    fs.writeFileSync(serverActFile, contentServer, 'utf8');
    fs.writeFileSync(path.join(root, 'ActualizadorSERVER.SQL'), contentServer, 'utf8');
    console.log('ActualizadorSERVER.SQL (SQL Server) regenerado con éxito (' + contentServer.length + ' bytes).');
} catch (e) {
    console.error("Error construyendo Actualizador:", e);
}

