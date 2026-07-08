const fs = require('fs');
let content = fs.readFileSync('SQL/Table/TABLEINI.sql', 'utf8');

const additions = `
ALTER TABLE public."Branch" ADD COLUMN IF NOT EXISTS "logo" bytea;
ALTER TABLE public."Implant" ADD COLUMN IF NOT EXISTS "logo" bytea;
`;

content += '\n' + additions;

fs.writeFileSync('SQL/Table/TABLEINI.sql', content);

// Regenerate Actualizador.sql
let output = '-- ==========================================================\n';
output += '-- ARCHIVO ACTUALIZADOR COMPLETO: TABLAS + FUNCIONES + SPS\n';
output += '-- Generado Automáticamente\n';
output += '-- ==========================================================\n\n';

output += '-- >>> 1. CREACIÓN DE TABLAS E ÍNDICES (TABLEINI) <<<\n\n';
output += fs.readFileSync('SQL/Table/TABLEINI.sql', 'utf8') + '\n\n';

output += '-- >>> 2. FUNCIONES (PostgreSQL) <<<\n\n';
const funcDir = 'SQL/Function';
if (fs.existsSync(funcDir)) {
    const files = fs.readdirSync(funcDir).filter(f => f.endsWith('.sql'));
    for (const f of files) {
        output += fs.readFileSync('SQL/Function/' + f, 'utf8') + '\n\n';
    }
}

output += '-- >>> 3. STORED PROCEDURES (PostgreSQL) <<<\n\n';
const spDir = 'SQL/SP';
if (fs.existsSync(spDir)) {
    const files = fs.readdirSync(spDir).filter(f => f.endsWith('.sql'));
    for (const f of files) {
        output += fs.readFileSync('SQL/SP/' + f, 'utf8') + '\n\n';
    }
}

fs.writeFileSync('SQL/Actualizador/Actualizador.SQL', output);
console.log('Fixed TABLEINI.sql and regenerated Actualizador.SQL for Logo');
