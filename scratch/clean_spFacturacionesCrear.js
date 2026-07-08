const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'SQL', 'SP', 'spFacturacionesCrear_utf8.sql');

try {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Replace double commas with single comma
  // We want to make sure we replace ,, or ,, with spaces to just ,
  content = content.replace(/,,/g, ',');
  
  fs.writeFileSync(file, content, 'utf-8');
  console.log('Successfully cleaned double commas in spFacturacionesCrear_utf8.sql');
} catch (e) {
  console.error('Error:', e.message);
}
