const fs = require('fs');
const path = require('path');

// 1. Update TABLEINI.sql
let content = fs.readFileSync('SQL/Table/TABLEINI.sql', 'utf8');

const extraBlocks = `
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'GDS_pkey') THEN 
        ALTER TABLE public."GDS" ADD CONSTRAINT "GDS_pkey" PRIMARY KEY (id); 
    END IF; 
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'interfaces_pkey') THEN 
        ALTER TABLE public."Interfaces" ADD CONSTRAINT "interfaces_pkey" PRIMARY KEY (id); 
    END IF; 
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'master_pkey') THEN 
        ALTER TABLE public."Master" ADD CONSTRAINT "master_pkey" PRIMARY KEY (id); 
    END IF; 
END $$;
`;

if (!content.includes('GDS_pkey')) {
    content += '\n' + extraBlocks;
    fs.writeFileSync('SQL/Table/TABLEINI.sql', content, 'utf8');
}

// 2. Regenerate Actualizador.SQL (PostgreSQL)
let outputPg = '-- ==========================================================\n';
outputPg += '-- ARCHIVO ACTUALIZADOR COMPLETO: TABLAS + FUNCIONES + SPS (POSTGRES)\n';
outputPg += '-- Generado Automáticamente\n';
outputPg += '-- ==========================================================\n\n';

outputPg += '-- >>> 1. CREACIÓN DE TABLAS E ÍNDICES (TABLEINI) <<<\n\n';
outputPg += fs.readFileSync('SQL/Table/TABLEINI.sql', 'utf8') + '\n\n';

outputPg += '-- >>> 2. FUNCIONES (PostgreSQL) <<<\n\n';
const funcDir = 'SQL/Function';
if (fs.existsSync(funcDir)) {
    const files = fs.readdirSync(funcDir).filter(f => f.endsWith('.sql'));
    for (const f of files) {
        outputPg += fs.readFileSync('SQL/Function/' + f, 'utf8') + '\n\n';
    }
}

outputPg += '-- >>> 3. STORED PROCEDURES (PostgreSQL) <<<\n\n';
const spDir = 'SQL/SP';
let outputSqlserver = '-- ==========================================================\n';
outputSqlserver += '-- ARCHIVO ACTUALIZADOR COMPLETO: SPS (SQL SERVER)\n';
outputSqlserver += '-- Generado Automáticamente\n';
outputSqlserver += '-- ==========================================================\n\n';

outputSqlserver += '-- >>> PROCEDIMIENTOS ALMACENADOS (SQL SERVER) <<<\n\n';

if (fs.existsSync(spDir)) {
    const files = fs.readdirSync(spDir).filter(f => f.endsWith('.sql'));
    for (const f of files) {
        const fileContent = fs.readFileSync('SQL/SP/' + f, 'utf8');
        if (fileContent.toLowerCase().includes('plpgsql')) {
            outputPg += `-- Archivo: ${f}\n`;
            outputPg += fileContent + '\n\n';
        } else {
            outputSqlserver += `-- Archivo: ${f}\n`;
            outputSqlserver += fileContent + '\n\n';
        }
    }
}

fs.writeFileSync('SQL/Actualizador/Actualizador.SQL', outputPg, 'utf8');
fs.writeFileSync('SQL/Actualizador.SQL', outputPg, 'utf8');
fs.writeFileSync('SQL/Actualizador/ActualizadorSERVER.SQL', outputSqlserver, 'utf8');
console.log('Regenerated Actualizador.SQL (PostgreSQL) and ActualizadorSERVER.SQL (SQL Server) successfully.');
