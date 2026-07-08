const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, '..', 'scratch', 'spza_FacturaJOB_Crear.sql');
const destFile = path.join(__dirname, '..', 'SQL', 'SP', 'spFacturaCrear.sql');

try {
  let content = fs.readFileSync(srcFile, 'utf-8');
  
  // Replace procedure name
  content = content.replace(/CREATE PROCEDURE \[dbo\]\.\[spza_FacturaJOB_Crear\]/i, 'CREATE PROCEDURE [dbo].[spFacturaCrear]');
  content = content.replace(/spza_FacturaJOB_Crear/g, 'spFacturaCrear');
  
  // Write to destFile
  fs.writeFileSync(destFile, content, 'utf-8');
  console.log('Successfully created SQL/SP/spFacturaCrear.sql');
} catch (e) {
  console.error('Error:', e.message);
}
