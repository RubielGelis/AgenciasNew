const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', 'SQL', 'SP', 'spFacturacionesCrear_utf8.sql');
const destFile = path.join(__dirname, '..', 'SQL', 'SP', 'spFacturacionesCrear.sql');

try {
  const content = fs.readFileSync(srcFile, 'utf-8');
  
  // Convert string to UTF-16LE buffer
  const leBuf = Buffer.from(content, 'utf16le');
  
  // Swap every pair of bytes to make it UTF-16BE
  const beBuf = Buffer.alloc(leBuf.length);
  for (let i = 0; i < leBuf.length; i += 2) {
    if (i + 1 < leBuf.length) {
      beBuf[i] = leBuf[i + 1];
      beBuf[i + 1] = leBuf[i];
    }
  }
  
  // Add BOM (0xFE, 0xFF) at the beginning of the file
  const bom = Buffer.from([0xFE, 0xFF]);
  const finalBuf = Buffer.concat([bom, beBuf]);
  
  fs.writeFileSync(destFile, finalBuf);
  console.log('Successfully converted back to UTF-16BE. Overwrote:', destFile);
} catch (e) {
  console.error('Error:', e.message);
}
