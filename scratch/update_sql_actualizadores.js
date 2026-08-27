const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function syncAllSqlToActualizadores() {
  console.log("================================================================");
  console.log("  SINCRONIZADOR DINÁMICO DE ACTUALIZADORES (Actualizador.sql)");
  console.log("================================================================");

  const targetFiles = [
    'SQL/Actualizador.SQL',
    'SQL/Actualizador/Actualizador.sql',
    'actualizado.sql',
    'RELEASE_KOREX/SQL/Actualizador.SQL'
  ];

  // Collect all DDLs from SQL/Function, SQL/SP, SQL/Procedure, SQL/Table
  const sqlFolders = ['SQL/Function', 'SQL/SP', 'SQL/Procedure'];
  const allSqlBlocks = [];

  for (const folder of sqlFolders) {
    const dirPath = path.join(rootDir, folder);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.sql'));
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8').trim();
      if (sqlContent) {
        allSqlBlocks.push({ file, folder, sql: sqlContent });
      }
    }
  }

  for (const relPath of targetFiles) {
    const filePath = path.join(rootDir, relPath);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    console.log(`\nSincronizando ${relPath}...`);
    let replacedCount = 0;
    let appendedCount = 0;

    for (const item of allSqlBlocks) {
      // Extract function or procedure name (e.g. fnCotizacionHistorial, spCotizacionActualizar)
      const nameMatch = item.sql.match(/CREATE\s+(?:OR\s+REPLACE\s+)?(?:FUNCTION|PROCEDURE)\s+(?:public\.)?([A-Za-z0-9_]+)/i);
      if (!nameMatch) continue;

      const objectName = nameMatch[1];
      const isProc = /CREATE\s+(?:OR\s+REPLACE\s+)?PROCEDURE/i.test(item.sql);

      // Dynamic cleanup block to remove any older overloaded signatures from existing client databases
      const dropBlock = `DO $$\nDECLARE r RECORD;\nBEGIN\n    FOR r IN SELECT oid::regprocedure AS proc_name FROM pg_proc WHERE proname ILIKE '${objectName}' LOOP\n        BEGIN\n            EXECUTE 'DROP ${isProc ? 'PROCEDURE' : 'FUNCTION'} IF EXISTS ' || r.proc_name || ' CASCADE';\n        EXCEPTION WHEN OTHERS THEN NULL;\n        END;\n    END LOOP;\nEND $$;\n\n`;

      let fullBlock = item.sql.trim();
      if (!fullBlock.toLowerCase().includes(`proname ilike '${objectName.toLowerCase()}'`)) {
        fullBlock = dropBlock + fullBlock;
      }

      // Regex pattern to replace existing block in Actualizador.sql
      const objRegex = new RegExp(`(?:DO\\s*\\$\\$[\\s\\S]*?END\\s*\\$\\$;\\s*)?CREATE\\s+(?:OR\\s+REPLACE\\s+)?(?:FUNCTION|PROCEDURE)\\s+(?:public\\.)?${objectName}\\s*\\([\\s\\S]*?\\);`, 'gi');

      if (content.match(objRegex)) {
        content = content.replace(objRegex, () => fullBlock + ';');
        replacedCount++;
      } else {
        // If not found in Actualizador.sql, append it at the end
        content += `\n\n-- Inyectado automáticamente: ${item.file}\n` + fullBlock + `;`;
        appendedCount++;
      }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  -> Finalizado ${relPath}: ${replacedCount} reemplazados, ${appendedCount} inyectados.`);
  }

  console.log("================================================================\n");
}

syncAllSqlToActualizadores();
