const fs = require('fs');
const path = require('path');

try {
    const root = 'C:/Proyectos/AgenciasNew/SQL';
    const actFile = path.join(root, 'Actualizador', 'Actualizador.SQL');

    console.log("Generando Actualizador.SQL...");

    let content = '-- ==========================================================\n';
    content += '-- ARCHIVO ACTUALIZADOR COMPLETO: TABLAS + FUNCIONES + SPS\n';
    content += '-- Generado Automáticamente\n';
    content += '-- ==========================================================\n\n';

    // 1. TABLEINI (Mantenemos exactamente el archivo manual del usuario)
    content += '-- >>> 1. CREACIÓN DE TABLAS E ÍNDICES (TABLEINI) <<<\n\n';
    const tableIni = fs.readFileSync(path.join(root, 'Table', 'TABLEINI.sql'), 'utf8');
    content += tableIni + '\n\n';

    // 2. Functions
    content += '-- >>> 2. FUNCIONES <<<\n\n';
    const fnDir = path.join(root, 'Function');
    if (fs.existsSync(fnDir)) {
        const fns = fs.readdirSync(fnDir).filter(f => f.endsWith('.sql'));
        for (const f of fns) {
            content += `-- Archivo: ${f}\n`;
            content += fs.readFileSync(path.join(fnDir, f), 'utf8') + '\n\n';
        }
    }

    // 3. Stored Procedures
    content += '-- >>> 3. PROCEDIMIENTOS ALMACENADOS (SP) <<<\n\n';
    const spDir = path.join(root, 'SP');
    if (fs.existsSync(spDir)) {
        const sps = fs.readdirSync(spDir).filter(f => f.endsWith('.sql'));
        for (const sp of sps) {
            content += `-- Archivo: ${sp}\n`;
            content += fs.readFileSync(path.join(spDir, sp), 'utf8') + '\n\n';
        }
    }

    fs.writeFileSync(actFile, content, 'utf8');
    console.log('Actualizador.SQL regenerado con éxito respetando tu TABLEINI.sql (' + content.length + ' bytes).');
} catch (e) {
    console.error("Error construyendo Actualizador:", e);
}
