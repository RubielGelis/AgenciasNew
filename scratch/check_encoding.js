const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
    const buf = fs.readFileSync(filePath);
    // Check if it looks like UTF-16 (starts with BOM or has lots of null bytes)
    let isUtf16 = false;
    if (buf.length >= 2) {
        if ((buf[0] === 0xFF && buf[1] === 0xFE) || (buf[0] === 0xFE && buf[1] === 0xFF)) {
            isUtf16 = true;
        }
    }
    // Also check for null bytes which indicate UTF-16 without BOM
    if (!isUtf16) {
        let nulls = 0;
        const checkLen = Math.min(buf.length, 1000);
        for (let i = 0; i < checkLen; i++) {
            if (buf[i] === 0) nulls++;
        }
        if (nulls > 50) isUtf16 = true;
    }
    console.log(`${filePath}: size=${buf.length} bytes, isUtf16=${isUtf16}`);
}

checkFile('SQL/Table/TABLEINI.sql');
checkFile('SQL/Actualizador/Actualizador.SQL');

// Check all files in Function and SP
const funcDir = 'SQL/Function';
fs.readdirSync(funcDir).forEach(f => {
    checkFile(path.join(funcDir, f));
});

const spDir = 'SQL/SP';
fs.readdirSync(spDir).forEach(f => {
    checkFile(path.join(spDir, f));
});
