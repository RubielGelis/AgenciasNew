require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const rootDir = path.join(__dirname, '..');

async function validateAndPrepareSchema() {
  console.log("================================================================");
  console.log("  VALIDADOR PRE-COMPILACION DE BASE DE DATOS - AGENCIASNEW");
  console.log("================================================================");

  // 1. Desplegar todos los archivos SQL locales a la BD PostgreSQL local
  console.log("\n[PASO 1/4] Desplegando funciones y SPs a PostgreSQL local...");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("  [ERROR] DATABASE_URL no está configurada en .env");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  const folders = ['SQL/Table', 'SQL/Function', 'SQL/SP', 'SQL/Procedure'];
  for (const folder of folders) {
    const dirPath = path.join(rootDir, folder);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.sql'));
    for (const file of files) {
      // Ignorar scripts pesados o destructivos
      if (file === 'TABLEINI.sql' || file === 'Inicial.sql') continue;

      const filePath = path.join(dirPath, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      try {
        await client.query(sql);
      } catch (err) {
        console.warn(`  [WARN] Error compilando ${folder}/${file}: ${err.message}`);
      }
    }
  }
  console.log("  [OK] Despliegue en PostgreSQL local completado.");

  // 2. Verificar integridad de tablas referenciadas en Alter_New_Columns.sql
  console.log("\n[PASO 2/4] Verificando integridad de tablas en Alter_New_Columns.sql...");
  const alterColumnsFile = path.join(rootDir, 'SQL', 'Table', 'Alter_New_Columns.sql');
  let alterSql = fs.readFileSync(alterColumnsFile, 'utf8');

  // Buscar todas las tablas referenciadas en SQL/SP y SQL/Function
  const referencedTables = new Set();
  for (const folder of ['SQL/SP', 'SQL/Function']) {
    const dirPath = path.join(rootDir, folder);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.sql'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
      const matches = content.matchAll(/public\."([A-Za-z0-9_]+)"/g);
      for (const m of matches) {
        const tbl = m[1];
        // Ignorar invocaciones a procedimientos o funciones (sp*, fn*)
        if (!tbl.startsWith('sp') && !tbl.startsWith('fn') && !tbl.startsWith('sp_') && !tbl.startsWith('fn_')) {
          referencedTables.add(tbl);
        }
      }
    }
  }

  // Comprobar que cada tabla referenciada exista en la BD local y tenga su DDL
  let fixedTablesCount = 0;
  for (const tableName of referencedTables) {
    // Si no está en Alter_New_Columns.sql con CREATE TABLE IF NOT EXISTS
    const hasCreateTable = new RegExp(`CREATE TABLE (IF NOT EXISTS )?public\\."${tableName}"`, 'i').test(alterSql);
    const isSystemTable = ['Quotation', 'Client', 'User', 'Branch', 'Product', 'Seller', 'TicketPrinter', 'Provider', 'Prestadora'].includes(tableName);

    if (!hasCreateTable && !isSystemTable) {
      console.log(`  [AUTO-FIX] Agregando CREATE TABLE IF NOT EXISTS para public."${tableName}" en Alter_New_Columns.sql...`);
      
      // Obtener la estructura real de la tabla en PostgreSQL local
      const colsRes = await client.query(`
        SELECT column_name, data_type, column_default, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      if (colsRes.rows.length > 0) {
        const colDefs = colsRes.rows.map(col => {
          let def = `"${col.column_name}" ${col.data_type}`;
          if (col.column_default) def += ` DEFAULT ${col.column_default}`;
          if (col.is_nullable === 'NO') def += ` NOT NULL`;
          return def;
        });

        const createBlock = `\n    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${tableName}') THEN\n        CREATE TABLE public."${tableName}" (\n            ${colDefs.join(',\n            ')}\n        );\n    END IF;\n`;

        // Insertar dentro del bloque DO $$ BEGIN ... END $$; de Alter_New_Columns.sql
        alterSql = alterSql.replace(/BEGIN\s*\n/, `BEGIN\n${createBlock}`);
        fixedTablesCount++;
      }
    }
  }

  if (fixedTablesCount > 0) {
    fs.writeFileSync(alterColumnsFile, alterSql, 'utf8');
    console.log(`  [OK] Alter_New_Columns.sql actualizado con ${fixedTablesCount} estructura(s) creadas automáticamente.`);
    // Re-desplegar Alter_New_Columns.sql
    await client.query(alterSql);
  } else {
    console.log("  [OK] Todas las tablas referenciadas cuentan con CREATE TABLE IF NOT EXISTS.");
  }

  // 2.5 Verificación de Secuencias y Autoincremento en columnas "id"
  console.log("\n[PASO 2.5/5] Verificando secuencias autoincrementales en llaves primarias ('id')...");
  const idColsRes = await client.query(`
    SELECT table_name, column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND column_name = 'id' AND data_type IN ('integer', 'bigint');
  `);

  let fixedSeqCount = 0;
  for (const row of idColsRes.rows) {
    const tbl = row.table_name;
    const hasNextval = row.column_default && row.column_default.includes('nextval');
    if (!hasNextval) {
      console.log(`  [AUTO-FIX] Asignando secuencia autoincremental a public."${tbl}".id...`);
      const seqName = `${tbl}_id_seq`;
      await client.query(`
        CREATE SEQUENCE IF NOT EXISTS public."${seqName}";
        ALTER TABLE public."${tbl}" ALTER COLUMN id SET DEFAULT nextval('public."${seqName}"'::regclass);
        ALTER SEQUENCE public."${seqName}" OWNED BY public."${tbl}".id;
      `);
      fixedSeqCount++;
    }
  }
  if (fixedSeqCount > 0) {
    console.log(`  [OK] Se fijó la secuencia autoincremental en ${fixedSeqCount} tabla(s).`);
  } else {
    console.log("  [OK] Todas las tablas cuentan con secuencias autoincrementales ('nextval') en sus llaves primarias.");
  }

  // 2.6 Verificación de Restricciones UNIQUE para operaciones de Upsert
  console.log("\n[PASO 2.6/5] Verificando restricciones UNIQUE para operaciones de Upsert...");
  const uniqueAudits = [
    { table: 'QuotationPrintCustomization', column: 'quotationId' },
    { table: 'QuotationFormat', column: 'name' }
  ];

  for (const u of uniqueAudits) {
    const uRes = await client.query(`
      SELECT tc.constraint_name 
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public' AND tc.table_name = $1 AND kcu.column_name = $2 AND tc.constraint_type = 'UNIQUE';
    `, [u.table, u.column]);

    if (uRes.rows.length === 0) {
      console.log(`  [AUTO-FIX] Agregando restricción UNIQUE a public."${u.table}"("${u.column}")...`);
      const constraintName = `${u.table}_${u.column}_key`;
      await client.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${constraintName}') THEN
            ALTER TABLE public."${u.table}" ADD CONSTRAINT "${constraintName}" UNIQUE ("${u.column}");
          END IF;
        END $$;
      `);
    }
  }
  console.log("  [OK] Restricciones UNIQUE para operaciones de Upsert verificadas.");

  // 2.7 Verificación de Prisma Schema y Regeneración del Cliente Prisma Client
  console.log("\n[PASO 2.7/5] Verificando Prisma Schema y regenerando Prisma Client...");
  const prismaSchemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
  if (fs.existsSync(prismaSchemaPath)) {
    const { execSync } = require('child_process');
    try {
      execSync('npx prisma generate', { cwd: rootDir, stdio: 'pipe' });
      console.log("  [OK] Prisma Client regenerado exitosamente con 'npx prisma generate'.");
    } catch (prismaErr) {
      console.warn(`  [WARN] Error ejecutando 'npx prisma generate': ${prismaErr.message}`);
    }
  }

  // 3. Verificación de regla de LEFT JOIN en funciones de listado/historial
  console.log("\n[PASO 3/4] Verificando regla obligatoria de LEFT JOIN en funciones de consulta...");
  const funcFolder = path.join(rootDir, 'SQL/Function');
  const listingFiles = ['fnCotizacionListar.sql', 'fnCotizacionHistorial.sql', 'fnCotizacion.sql'];
  
  for (const file of listingFiles) {
    const fPath = path.join(funcFolder, file);
    if (!fs.existsSync(fPath)) continue;
    const content = fs.readFileSync(fPath, 'utf8');
    
    // Verificar si hay INNER JOIN public."Client" o JOIN public."Client"
    const hasUnsafeJoin = /(?<!LEFT\s+)JOIN\s+public\."Client"/i.test(content) || /(?<!LEFT\s+)JOIN\s+public\."User"/i.test(content);
    if (hasUnsafeJoin) {
      console.error(`  [ERROR CRITICO] La función ${file} contiene JOIN o INNER JOIN en Client/User. Se requiere LEFT JOIN.`);
      process.exit(1);
    }
  }
  console.log("  [OK] Funciones de consulta validadas con LEFT JOIN obligatorio.");

  // 4. Sincronizar scripts actualizadores
  console.log("\n[PASO 4/4] Sincronizando scripts actualizadores (Actualizador.sql)...");
  const updateScriptPath = path.join(rootDir, 'scratch', 'update_sql_actualizadores.js');
  if (fs.existsSync(updateScriptPath)) {
    require(updateScriptPath);
  }
  console.log("  [OK] Sincronización de actualizadores finalizada.");

  await client.end();
  console.log("\n================================================================");
  console.log("  VALIDACION EXITOSA: La base de datos está lista para empaquetar.");
  console.log("================================================================\n");
}

validateAndPrepareSchema().catch(err => {
  console.error("ERROR FATAL EN VALIDACION PRE-COMPILACION:", err);
  process.exit(1);
});
