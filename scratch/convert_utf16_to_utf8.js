const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', 'SQL', 'SP', 'spFacturacionesCrear.sql');
const destFile = path.join(__dirname, '..', 'SQL', 'SP', 'spFacturacionesCrear_utf8.sql');

try {
  const buf = fs.readFileSync(srcFile);
  console.log('Original BOM:', buf.slice(0, 10).toString('hex'));
  
  let convertedBuf;
  if (buf[0] === 0xfe && buf[1] === 0xff) {
    // UTF-16BE: swap every pair of bytes to make it UTF-16LE
    convertedBuf = Buffer.alloc(buf.length);
    for (let i = 0; i < buf.length; i += 2) {
      if (i + 1 < buf.length) {
        convertedBuf[i] = buf[i + 1];
        convertedBuf[i + 1] = buf[i];
      }
    }
  } else {
    convertedBuf = buf;
  }
  
  // Now convertedBuf is in UTF-16LE format, convert to string and save in UTF-8
  const str = convertedBuf.toString('utf16le');
  fs.writeFileSync(destFile, str, 'utf-8');
  console.log('Successfully converted to UTF-8. Saved as:', destFile);
} catch (e) {
  console.error('Error:', e.message);
}
