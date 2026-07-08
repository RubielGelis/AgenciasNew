const fs = require('fs');
let content = fs.readFileSync('SQL/Table/TABLEINI.sql', 'utf8');

content = content.replace(/^do \$\$\r?\nBEGIN\r?\n/m, '');
content = content.replace(/END \$\$;\r?\n?$/m, '');

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

content += extraBlocks;
fs.writeFileSync('SQL/Table/TABLEINI.sql', content);

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
console.log('Fixed TABLEINI.sql completely and regenerated Actualizador.SQL');
