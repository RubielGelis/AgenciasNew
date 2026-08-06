const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Read the new definitions
const newFnListar = fs.readFileSync(path.join(rootDir, 'SQL/Function/fnCotizacionListar.sql'), 'utf8');
const newFnHistorial = fs.readFileSync(path.join(rootDir, 'SQL/Function/fnCotizacionHistorial.sql'), 'utf8');

const targetFiles = [
  'SQL/Actualizador.SQL',
  'SQL/Actualizador/Actualizador.sql',
  'actualizado.sql'
];

targetFiles.forEach(relPath => {
  const filePath = path.join(rootDir, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping non-existent file: ${relPath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  console.log(`Processing ${relPath}...`);
  
  // Match functions including signature with parenthesis
  const fnListarRegex = /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.fnCotizacionListar\s*\([\s\S]*?END;\s*\$\$;/gi;
  const fnHistorialRegex = /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.fnCotizacionHistorial\s*\([\s\S]*?END;\s*\$\$;/gi;
  
  let replaced = false;
  if (content.match(fnListarRegex)) {
    content = content.replace(fnListarRegex, newFnListar);
    replaced = true;
    console.log(`  -> Replaced fnCotizacionListar in ${relPath}`);
  } else {
    console.log(`  -> Warning: Could not find fnCotizacionListar in ${relPath}`);
  }
  
  if (content.match(fnHistorialRegex)) {
    content = content.replace(fnHistorialRegex, newFnHistorial);
    replaced = true;
    console.log(`  -> Replaced fnCotizacionHistorial in ${relPath}`);
  } else {
    console.log(`  -> Warning: Could not find fnCotizacionHistorial in ${relPath}`);
  }
  
  if (replaced) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  -> Saved ${relPath}`);
  }
});
