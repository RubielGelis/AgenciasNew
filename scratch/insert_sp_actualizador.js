const fs = require('fs');
const path = require('path');

function insertProcedure(filePath, spContent) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('spExportEnvoices')) {
        console.log(`spExportEnvoices already exists in ${filePath}`);
        return;
    }
    
    const targetString = '-- Archivo: spImportQuotation.sql';
    const index = content.indexOf(targetString);
    if (index === -1) {
        console.error(`Could not find insertion target in ${filePath}`);
        return;
    }
    
    const before = content.substring(0, index);
    const after = content.substring(index);
    
    const newContent = before + "\n\n-- Archivo: spExportEnvoices.sql\n" + spContent + "\n\n" + after;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Successfully inserted spExportEnvoices into ${filePath}`);
}

function main() {
    const spPath = path.join(__dirname, '..', 'SQL', 'SP', 'spExportEnvoices.sql');
    if (!fs.existsSync(spPath)) {
        console.error("spExportEnvoices.sql not found!");
        return;
    }
    const spContent = fs.readFileSync(spPath, 'utf8');
    
    const targets = [
        path.join(__dirname, '..', 'SQL', 'Actualizador', 'Actualizador.SQL'),
        path.join(__dirname, '..', 'actualizado.sql'),
        "C:\\AgenciasNew\\SQL\\Actualizador.SQL"
    ];
    
    for (const t of targets) {
        insertProcedure(t, spContent);
    }
}
main();
