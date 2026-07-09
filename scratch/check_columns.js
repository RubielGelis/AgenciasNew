const fs = require('fs');
const path = require('path');

function main() {
    const spPath = path.join(__dirname, '../SQL/SP/spFacturacionesCrear_utf8.sql');
    const content = fs.readFileSync(spPath, 'utf8');
    
    // Find the INSERT INTO #Facturacion block
    const insertStartIndex = content.indexOf('INSERT INTO #Facturacion(');
    if (insertStartIndex === -1) {
        console.error("Could not find INSERT INTO #Facturacion");
        return;
    }
    
    const insertEndIndex = content.indexOf(')', insertStartIndex);
    const insertColsText = content.substring(insertStartIndex + 25, insertEndIndex);
    const insertCols = insertColsText.split(',').map(s => s.trim().replace(/\s+/g, ' ')).filter(Boolean);
    
    // Find the SELECT block
    const selectStartIndex = content.indexOf('SELECT', insertEndIndex);
    const selectEndIndex = content.indexOf('FROM @xmlData.nodes', selectStartIndex);
    const selectColsText = content.substring(selectStartIndex + 6, selectEndIndex);
    
    // Parse select columns. T-SQL select columns might be like "col = expr" or "expr AS col" or just "expr"
    // Let's split by comma, but be careful with functions like ISNULL(a, b) containing commas.
    // We can use a simple parentheses-aware split.
    const selectCols = [];
    let current = '';
    let parenDepth = 0;
    for (let i = 0; i < selectColsText.length; i++) {
        const char = selectColsText[i];
        if (char === '(') parenDepth++;
        else if (char === ')') parenDepth--;
        
        if (char === ',' && parenDepth === 0) {
            selectCols.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    if (current.trim()) {
        selectCols.push(current.trim());
    }
    
    // Clean up selectCols comments and format them
    const cleanSelectCols = selectCols.map(c => {
        // remove single line comments
        const clean = c.replace(/--.*/g, '').trim();
        return clean;
    }).filter(Boolean);
    
    console.log(`INSERT columns: ${insertCols.length}`);
    console.log(`SELECT columns: ${cleanSelectCols.length}`);
    
    let mismatchCount = 0;
    const outputLines = [];
    outputLines.push(`INSERT columns: ${insertCols.length}`);
    outputLines.push(`SELECT columns: ${cleanSelectCols.length}`);
    
    for (let i = 0; i < Math.max(insertCols.length, cleanSelectCols.length); i++) {
        const ins = insertCols[i] || '';
        const sel = cleanSelectCols[i] || '';
        let selName = sel;
        if (sel.includes('=')) selName = sel.split('=')[0].trim();
        else if (sel.toLowerCase().includes(' as ')) selName = sel.split(/\s+as\s+/i)[1].trim();
        
        if (ins !== selName) {
            mismatchCount++;
            outputLines.push(`Mismatch at index ${i + 1}: INSERT column [${ins}] vs SELECT expression [${sel}] (extracted: [${selName}])`);
        }
    }
    outputLines.push(`Total mismatches found: ${mismatchCount}`);
    
    fs.writeFileSync(path.join(__dirname, 'mismatches.txt'), outputLines.join('\n'), 'utf8');
    console.log(`Wrote ${mismatchCount} mismatches to scratch/mismatches.txt`);
}

main();
