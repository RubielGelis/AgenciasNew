const fs = require('fs');

async function main() {
    const raw = fs.readFileSync('SQL/SP/spFacturacionesCrear.sql');
    console.log("Raw size:", raw.length, "bytes");
    console.log("First 10 bytes:", Array.from(raw.slice(0, 10)).map(x => x.toString(16)));

    let text = '';
    if (raw[0] === 0xFF && raw[1] === 0xFE) {
        console.log("Encoding is UTF-16 LE");
        text = raw.slice(2).toString('utf16le');
    } else if (raw[0] === 0xFE && raw[1] === 0xFF) {
        console.log("Encoding is UTF-16 BE");
        const swapped = Buffer.alloc(raw.length);
        for (let i = 0; i < raw.length; i += 2) {
            if (i + 1 < raw.length) {
                swapped[i] = raw[i+1];
                swapped[i+1] = raw[i];
            }
        }
        text = swapped.slice(2).toString('utf16le');
    } else {
        // Fallback: check if there are nulls which imply UTF-16 LE
        let nulls = 0;
        for (let i = 0; i < Math.min(raw.length, 100); i++) {
            if (raw[i] === 0) nulls++;
        }
        if (nulls > 20) {
            console.log("Encoding is UTF-16 LE (no BOM)");
            text = raw.toString('utf16le');
        } else {
            console.log("Encoding seems to be UTF-8 or ASCII already.");
            return;
        }
    }

    // Strip remaining BOM if any
    if (text.charCodeAt(0) === 0xFEFF || text.charCodeAt(0) === 0xFFFE) {
        text = text.slice(1);
    }

    console.log("Writing SQL/SP/spFacturacionesCrear.sql as UTF-8...");
    fs.writeFileSync('SQL/SP/spFacturacionesCrear.sql', text, 'utf8');
    console.log("New size:", fs.readFileSync('SQL/SP/spFacturacionesCrear.sql').length, "bytes");
}
main();
