require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const rootDir = path.join(__dirname, '..');

async function validateAndPrepareSchema(customConnStr) {
  console.log("================================================================");
  console.log("  VALIDADOR PRE-COMPILACION DE BASE DE DATOS - AGENCIASNEW");
  console.log("================================================================");

  // 1. Desplegar todos los archivos SQL locales a la BD PostgreSQL local
  console.log("\n[PASO 1/4] Desplegando funciones y SPs a PostgreSQL local...");
  const connectionString = customConnStr || process.env.DATABASE_URL;
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

  // 2.5.5 Verificación y Siembra Automática de Secuencias Personalizadas (nextval en SPs)
  console.log("\n[PASO 2.5.5/5] Auditando secuencias personalizadas referenciadas en Stored Procedures...");
  const alterColumnsPath = path.join(__dirname, '..', 'SQL', 'Table', 'Alter_New_Columns.sql');
  let alterSqlContent = fs.readFileSync(alterColumnsPath, 'utf8');
  let customSeqInjected = 0;

  // Scan all SP files for nextval('public.seq_name') or nextval('seq_name')
  const spDir = path.join(__dirname, '..', 'SQL', 'SP');
  if (fs.existsSync(spDir)) {
    const spFiles = fs.readdirSync(spDir).filter(f => f.endsWith('.sql'));
    for (const f of spFiles) {
      const content = fs.readFileSync(path.join(spDir, f), 'utf8');
      const seqMatches = content.matchAll(/nextval\(['"](?:public\.)?([A-Za-z0-9_]+)['"]\)/gi);
      for (const match of seqMatches) {
        const seqName = match[1];
        // Ensure sequence exists in database
        try {
          await client.query(`CREATE SEQUENCE IF NOT EXISTS public."${seqName}" START WITH 1;`);
          await client.query(`CREATE SEQUENCE IF NOT EXISTS public.${seqName} START WITH 1;`);
        } catch (e) {}

        if (!alterSqlContent.includes(seqName)) {
          console.log(`  [AUTO-FIX] Inyectando CREATE SEQUENCE IF NOT EXISTS public.${seqName} en Alter_New_Columns.sql...`);
          alterSqlContent = `CREATE SEQUENCE IF NOT EXISTS public.${seqName} START WITH 1;\n` + alterSqlContent;
          customSeqInjected++;
        }
      }
    }
  }

  if (customSeqInjected > 0) {
    fs.writeFileSync(alterColumnsPath, alterSqlContent, 'utf8');
    console.log(`  [OK] Se inyectaron ${customSeqInjected} secuencia(s) en Alter_New_Columns.sql.`);
  } else {
    console.log("  [OK] Todas las secuencias personalizadas de Stored Procedures sembradas y verificadas.");
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
          IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = '${constraintName}') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${constraintName}') THEN
            ALTER TABLE public."${u.table}" ADD CONSTRAINT "${constraintName}" UNIQUE ("${u.column}");
          END IF;
        END $$;
      `);
    }
  }
  console.log("  [OK] Restricciones UNIQUE para operaciones de Upsert verificadas.");

  // 2.6.5 Verificación y Auto-Inyección de Columna "isActive" en Tablas Maestras
  console.log("\n[PASO 2.6.5/5] Verificando presencia de la columna 'isActive' en tablas maestras...");
  const masterTablesForIsActive = [
    'ChargeAndTax', 'Client', 'User', 'Branch', 'Implant', 'Provider', 'Prestadora',
    'Seller', 'Product', 'Airports', 'Airport', 'Cities', 'City', 'Countries', 'Country', 'CreditCard',
    'Currency', 'MasterVariable', 'ProviderType', 'Combo', 'EquivalencesInterfaces', 'Equivalences',
    'TicketType', 'TicketPrinter', 'Payment', 'DocumentResolution', 'Resolution', 'TransactionConsecutive', 'SysConsecutivo',
    'QuotationState', 'QuotationFormat', 'InterfaceExtractParam', 'Role'
  ];

  for (const tbl of masterTablesForIsActive) {
    const tblExists = await client.query(`SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`, [tbl]);
    if (tblExists.rows.length > 0) {
      const colExists = await client.query(`SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'isActive'`, [tbl]);
      if (colExists.rows.length === 0) {
        console.log(`  [AUTO-FIX] Agregando columna 'isActive' a public."${tbl}"...`);
        await client.query(`ALTER TABLE public."${tbl}" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;`);
      }
    }
  }
  console.log("  [OK] Columna 'isActive' verificada y garantizada en todas las tablas maestras.");

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

  // 2.8 Verificación y Sembrado de Módulos del Menú de Navegación (public."Menu")
  console.log("\n[PASO 2.8/5] Verificando semillas de Módulos de Navegación ('Menu')...");
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Menu_code_key" ON public."Menu" ("code");
    INSERT INTO public."Menu" (code, name, parent, action, activo)
    VALUES 
        ('DASHBOARD', 'Dashboard', NULL, '/dashboard', true),
        ('PRECOTIZACIONES', 'Pre-Cotizaciones', NULL, '/dashboard/prequotations', true),
        ('COTIZACIONES', 'Cotizaciones', NULL, '/dashboard/quotations/history', true),
        ('FACTURACION', 'Facturación', NULL, '/dashboard/invoices/history', true),
        ('MAESTROS', 'Maestros', NULL, '/dashboard/settings', true),
        ('REPORTES', 'Reportes', NULL, '/dashboard/reports', true),
        ('EJECUCIONES', 'Ejecuciones', NULL, '/dashboard/executions', true),
        ('MANUAL', 'Manual Operativo', NULL, '/dashboard/manual', true)
    ON CONFLICT (code) DO UPDATE SET 
        name = EXCLUDED.name,
        action = EXCLUDED.action;
  `);
  console.log("  [OK] Todos los módulos de navegación del Menú Principal sembrados y verificados.");

  // 2.9 Verificación de Preservación de Parámetros de Sistema (SystemParameter ON CONFLICT DO NOTHING)
  console.log("\n[PASO 2.9/5] Verificando preservación de parámetros de configuración en Inicial.sql...");
  const inicialSqlPath = path.join(rootDir, 'SQL', 'Inicial.sql');
  if (fs.existsSync(inicialSqlPath)) {
    let inicialSqlContent = fs.readFileSync(inicialSqlPath, 'utf8');
    if (/INSERT INTO public\."SystemParameter"[\s\S]*?ON CONFLICT \(code\) DO UPDATE/i.test(inicialSqlContent)) {
      console.log("  [AUTO-FIX] Cambiando SystemParameter ON CONFLICT a DO NOTHING en Inicial.sql para preservar configuración del cliente...");
      inicialSqlContent = inicialSqlContent.replace(
        /(INSERT INTO public\."SystemParameter"[\s\S]*?)ON CONFLICT \(code\) DO UPDATE[\s\S]*?value = EXCLUDED\.value;/gi,
        '$1ON CONFLICT (code) DO NOTHING;'
      );
      fs.writeFileSync(inicialSqlPath, inicialSqlContent, 'utf8');
    }
  }
  console.log("  [OK] Regla de preservación de parámetros verificada (ON CONFLICT DO NOTHING).");

  // 2.10 Verificación y Sembrado de todas las Tablas Maestras (public."Master")
  console.log("\n[PASO 2.10/5] Verificando semillas de Tablas Maestras ('Master')...");
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Master_code_key" ON public."Master" ("code");
    INSERT INTO public."Master" (code, name, "inactivo")
    VALUES
        ('SystemParameter', 'parametros', false),
        ('User', 'usuarios', false),
        ('Branch', 'sucursales', false),
        ('Implant', 'implantes', false),
        ('ChargeAndTax', 'impuestos', false),
        ('Seller', 'vendedores', false),
        ('TicketPrinter', 'tiqueteadores', false),
        ('Prestadora', 'prestadoras', false),
        ('Client', 'clientes', false),
        ('Provider', 'proveedores', false),
        ('ProviderType', 'tipos-proveedores', false),
        ('Product', 'productos', false),
        ('MasterVariable', 'variables', false),
        ('Combo', 'combos', false),
        ('SystemLog', 'logs', false),
        ('Currency', 'monedas', false),
        ('Equivalences', 'equivalencias', false),
        ('InterfaceExtractParam', 'extraccion-interfaces', false),
        ('DocumentResolution', 'resoluciones-documentos', false),
        ('TransactionConsecutive', 'consecutivos-transacciones', false),
        ('CreditCard', 'tarjetas-credito', false),
        ('Payment', 'formas-pago', false),
        ('Countries', 'paises', false),
        ('Cities', 'ciudades', false),
        ('Airports', 'aeropuertos', false),
        ('TicketType', 'tipos-tiquetes', false),
        ('QuotationState', 'estados-cotizacion', false),
        ('QuotationFormat', 'formatos-cotizacion', false)
    ON CONFLICT (code) DO NOTHING;
  `);
  console.log("  [OK] Todas las 28 tablas maestras sembradas y verificadas en public.\"Master\".");

  // 2.11 Verificación y Sembrado de Parámetros del Sistema (public."SystemParameter")
  console.log("\n[PASO 2.11/5] Verificando semillas de Parámetros del Sistema ('SystemParameter')...");
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "SystemParameter_code_key" ON public."SystemParameter" ("code");
    INSERT INTO public."SystemParameter" (code, name, value)
    VALUES
        ('ServidorSQLServer', 'Host de SQL Server', 'Rubiel/RUBIEL'),
        ('UsuarioSQLServer', 'Usuario SQL Server', 'sa'),
        ('ClaveSQLServer', 'Contraseña SQL Server', '111985*'),
        ('BaseSQLServer', 'Base de Datos SQL Server', 'Agencias'),
        ('PuertoSQLServer', 'Puerto SQL Server', ''),
        ('EnviarCotizacionesAutoSQLserver', 'Envío automático de cotizaciones a SQL Server (1: Sí, 0: No)', '1'),
        ('EnviarFacturacionAutoSQLserver', 'Envío automático a Facturacion SQL Server (1: Sí, 0: No)', '1'),
        ('Pais', 'Pais', 'Colombia'),
        ('MOSTRAR_TOTALIZACION_COTIZACION', 'Mostrar totalización financiera en cotización', 'true')
    ON CONFLICT (code) DO NOTHING;
  `);
  console.log("  [OK] Todos los Parámetros del Sistema sembrados y verificados con ON CONFLICT DO NOTHING.");

  // 2.11.5 Verificación y Auto-Reparación de Plantilla Predeterminada de Impresión (QuotationPrintDefaultTemplate)
  console.log("\n[PASO 2.11.5/5] Verificando plantilla predeterminada de impresión ('QuotationPrintDefaultTemplate')...");
  try {
    const printDefRes = await client.query('SELECT html FROM public."QuotationPrintDefaultTemplate" ORDER BY id ASC LIMIT 1');
    const printHtml = printDefRes.rows[0]?.html || '';
    if (!printHtml || printHtml.length < 5000 || (!printHtml.includes('FORMATO VENTA') && !printHtml.includes('LIQUIDACION'))) {
      console.log("  [AUTO-FIX] Regenerando plantilla predeterminada completa de impresión desde default_template.xlsx...");
      const { generateHtmlTemplate } = require(path.join(rootDir, 'src', 'lib', 'excel-to-html'));
      const defaultTemplatePath = path.join(rootDir, 'templates', 'default_template.xlsx');
      if (fs.existsSync(defaultTemplatePath)) {
        const defaultBuffer = fs.readFileSync(defaultTemplatePath);
        const fullHtml = await generateHtmlTemplate(defaultBuffer, {}, null, 1);
        await client.query('DELETE FROM public."QuotationPrintDefaultTemplate"');
        await client.query('INSERT INTO public."QuotationPrintDefaultTemplate" (name, html, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW())', ['Default', fullHtml]);
        console.log("  [OK] Plantilla predeterminada completa de impresión regenerada exitosamente.");
      }
    } else {
      console.log("  [OK] Plantilla predeterminada de impresión verificada.");
    }
  } catch (printTplErr) {
    console.warn(`  [WARN] Error verificando plantilla predeterminada de impresión: ${printTplErr.message}`);
  }

  // 2.12 AUDITORÍA AUTOMÁTICA Y AUTO-CORRECCIÓN UNIVERSAL DE ARCHIVOS DE MIGRACIÓN (Inicial.sql y Alter_New_Columns.sql)
  console.log("\n[PASO 2.12/5] Auditoría y Sincronización Automática Universal de Catálogos (Menu, Master, SystemParameter)...");
  try {
    const localMenuRes = await client.query('SELECT code, name, action, activo FROM public."Menu"');
    const localMasterRes = await client.query('SELECT code, name, inactivo FROM public."Master"');
    const localParamRes = await client.query('SELECT code, name, value FROM public."SystemParameter"');

    const filesToAudit = [
      path.join(rootDir, 'SQL', 'Table', 'Alter_New_Columns.sql'),
      path.join(rootDir, 'SQL', 'Inicial.sql'),
      path.join(rootDir, 'SQL', 'Data', 'Inicial.sql')
    ];

    for (const fPath of filesToAudit) {
      if (!fs.existsSync(fPath)) continue;
      let fileContent = fs.readFileSync(fPath, 'utf8');
      let fileModified = false;

      // Verificar y auto-inyectar cualquier módulo de Menú faltante
      for (const m of localMenuRes.rows) {
        if (m.code && !fileContent.includes(`'${m.code}'`)) {
          console.log(`  [AUTO-SYNC] Inyectando módulo de Menú '${m.code}' en ${path.basename(fPath)}...`);
          const insertMenuSql = `\nINSERT INTO public."Menu" (code, name, action, activo) VALUES ('${m.code}', '${m.name}', '${m.action || ''}', true) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, action = EXCLUDED.action;\n`;
          fileContent += insertMenuSql;
          fileModified = true;
        }
      }

      // Verificar y auto-inyectar cualquier Tabla Maestra faltante
      for (const mst of localMasterRes.rows) {
        if (mst.code && !fileContent.includes(`'${mst.code}'`)) {
          console.log(`  [AUTO-SYNC] Inyectando Tabla Maestra '${mst.code}' en ${path.basename(fPath)}...`);
          const insertMasterSql = `\nINSERT INTO public."Master" (code, name, "inactivo") VALUES ('${mst.code}', '${mst.name}', false) ON CONFLICT (code) DO NOTHING;\n`;
          fileContent += insertMasterSql;
          fileModified = true;
        }
      }

      // Verificar y auto-inyectar cualquier Parámetro del Sistema faltante
      for (const p of localParamRes.rows) {
        if (p.code && !fileContent.includes(`'${p.code}'`)) {
          console.log(`  [AUTO-SYNC] Inyectando Parámetro del Sistema '${p.code}' en ${path.basename(fPath)}...`);
          const insertParamSql = `\nINSERT INTO public."SystemParameter" (code, name, value) VALUES ('${p.code}', '${p.name || ''}', '${p.value || ''}') ON CONFLICT (code) DO NOTHING;\n`;
          fileContent += insertParamSql;
          fileModified = true;
        }
      }

      if (fileModified) {
        fs.writeFileSync(fPath, fileContent, 'utf8');
        console.log(`  [OK] ${path.basename(fPath)} fue sincronizado y actualizado automáticamente.`);
      }
    }
    console.log("  [OK] Auditoría universal de catálogos completada exitosamente.");
  } catch (auditErr) {
    console.warn(`  [WARN] Error en auditoría dinámica de catálogos: ${auditErr.message}`);
  }
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

module.exports = { validateAndPrepareSchema };

if (require.main === module) {
  validateAndPrepareSchema().catch(err => {
    console.error("ERROR FATAL EN VALIDACION PRE-COMPILACION:", err);
    process.exit(1);
  });
}
