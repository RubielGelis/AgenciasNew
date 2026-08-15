const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function resolvePath(subFolder, filename) {
    const paths = [
        path.join(__dirname, subFolder, filename),
        path.join(__dirname, '..', subFolder, filename),
        path.join(__dirname, '..', filename)
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return paths[0]; // fallback
}

const host = process.argv[2] && process.argv[2] !== '' ? process.argv[2] : 'localhost';
const port = process.argv[3] && process.argv[3] !== '' ? process.argv[3] : '5432';
const database = process.argv[4] && process.argv[4] !== '' ? process.argv[4] : 'korex_db';
const user = process.argv[5] && process.argv[5] !== '' ? process.argv[5] : 'postgres';
const password = process.argv[6] || '';

// Colores de consola para mejor visualización de diagnóstico
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    gray: "\x1b[90m"
};

async function run() {
    console.log(`\n${colors.bright}${colors.cyan}======================================================`);
    console.log(`  SISTEMA DE DIAGNÓSTICO Y COMPARACIÓN DE BASE DE DATOS`);
    console.log(`======================================================${colors.reset}`);
    console.log(`Conexión destino: ${user}@${host}:${port}/${database}\n`);
    
    // 1. Validar / Crear base de datos
    const adminClient = new Client({ 
        connectionString: `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/postgres` 
    });
    
    try {
        await adminClient.connect();
        const res = await adminClient.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = $1;`, [database]);
        if (res.rowCount === 0) {
            console.log(`${colors.yellow}[+] Creando la base de datos '${database}' por primera vez...${colors.reset}`);
            await adminClient.query(`CREATE DATABASE "${database}";`);
        } else {
            console.log(`${colors.green}[OK] La base de datos '${database}' existe.${colors.reset}`);
        }
        await adminClient.end();
    } catch (e) {
        console.error(`${colors.red}[ERROR CRÍTICO] Falló la conexión al servicio PostgreSQL maestro.${colors.reset}`);
        console.error(`DETALLE: ${e.message}`);
        process.exit(1);
    }

    // 2. Conectarse a la BD de trabajo
    const dbClient = new Client({ 
        connectionString: `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}` 
    });
    
    try {
        await dbClient.connect();
    } catch (e) {
        console.error(`${colors.red}[ERROR CRÍTICO] No se pudo conectar a la base de datos '${database}' recién creada/verificada.${colors.reset}`);
        console.error(e.message);
        process.exit(1);
    }

    // 3. Ejecutar Actualizador.SQL (si existe) para inicializar/actualizar la estructura base
    const actFile = resolvePath('SQL', 'Actualizador.SQL');
    if (fs.existsSync(actFile)) {
        console.log(`\n${colors.bright}[1/4] Inyectando esquema estructural base (Actualizador.SQL)...${colors.reset}`);
        try {
            const sql = fs.readFileSync(actFile, 'utf8');
            await dbClient.query(sql);
            console.log(`  ${colors.green}[OK] Estructuras cargadas correctamente.${colors.reset}`);
        } catch (e) {
            console.warn(`  ${colors.yellow}[!] Advertencia ejecutando Actualizador.SQL: ${e.message}${colors.reset}`);
            if (e.position) console.warn(`      Posición aproximada: ${e.position}`);
        }
    } else {
        console.log(`\n${colors.yellow}[!] No se encontró Actualizador.SQL. Se omitió la inyección estructural inicial.${colors.reset}`);
    }

    // 4. Comparador de Esquemas Inteligente (schema_reference.json)
    const schemaFile = resolvePath('SQL', 'schema_reference.json');
    if (fs.existsSync(schemaFile)) {
        console.log(`\n${colors.bright}[2/4] Iniciando comparación de esquemas con el perfil de desarrollo...${colors.reset}`);
        try {
            const refSchema = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
            
            // A. Consultar la estructura actual del cliente
            const liveCols = await dbClient.query(`
                SELECT 
                    table_name,
                    column_name,
                    data_type,
                    character_maximum_length,
                    is_nullable,
                    column_default
                FROM information_schema.columns
                WHERE table_schema = 'public';
            `);
            
            const liveSchema = {};
            for (const row of liveCols.rows) {
                const tbl = row.table_name;
                if (!liveSchema[tbl]) {
                    liveSchema[tbl] = { columns: {} };
                }
                liveSchema[tbl].columns[row.column_name] = {
                    dataType: row.data_type,
                    maxLength: row.character_maximum_length,
                    isNullable: row.is_nullable,
                    columnDefault: row.column_default
                };
            }

            let changesApplied = 0;
            let warningsCount = 0;

            // B. Comparar tabla por tabla y columna por columna
            for (const [tblName, tblMeta] of Object.entries(refSchema.tables)) {
                // Si la tabla no existe en el cliente
                if (!liveSchema[tblName]) {
                    console.log(`  ${colors.yellow}[ADD TABLE] Creando tabla faltante: public."${tblName}"...${colors.reset}`);
                    
                    // Reconstruir CREATE TABLE desde el descriptor
                    const colDefs = [];
                    for (const [colName, colMeta] of Object.entries(tblMeta.columns)) {
                        colDefs.push(getColumnSqlDefinition(colName, colMeta));
                    }
                    
                    // Añadir llaves primarias
                    if (tblMeta.primaryKey && tblMeta.primaryKey.length > 0) {
                        const pkCols = tblMeta.primaryKey.map(pk => `"${pk}"`).join(', ');
                        colDefs.push(`CONSTRAINT "${tblName}_pkey" PRIMARY KEY (${pkCols})`);
                    }
                    
                    const createTableSql = `CREATE TABLE public."${tblName}" (\n  ${colDefs.join(',\n  ')}\n);`;
                    try {
                        await dbClient.query(createTableSql);
                        console.log(`    ${colors.green}[OK] Tabla "${tblName}" creada con éxito.${colors.reset}`);
                        changesApplied++;
                    } catch (err) {
                        console.error(`    ${colors.red}[ERROR] Falló crear la tabla "${tblName}": ${err.message}${colors.reset}`);
                        warningsCount++;
                    }
                    continue;
                }

                // Si la tabla existe, comparar columnas
                for (const [colName, colMeta] of Object.entries(tblMeta.columns)) {
                    const liveCol = liveSchema[tblName].columns[colName];
                    
                    // Si la columna no existe en el cliente
                    if (!liveCol) {
                        const colDefSql = getColumnSqlDefinition(colName, colMeta);
                        const addColSql = `ALTER TABLE public."${tblName}" ADD COLUMN ${colDefSql};`;
                        console.log(`  ${colors.yellow}[ADD COLUMN] Tabla "${tblName}": agregando campo faltante "${colName}"...${colors.reset}`);
                        try {
                            await dbClient.query(addColSql);
                            console.log(`    ${colors.green}[OK] Columna "${colName}" agregada.${colors.reset}`);
                            changesApplied++;
                        } catch (err) {
                            console.error(`    ${colors.red}[ERROR] Falló agregar columna "${colName}": ${err.message}${colors.reset}`);
                            warningsCount++;
                        }
                        continue;
                    }

                    // Comparar tipo de datos, nullability y valor por defecto
                    let needsAlterType = false;
                    let needsAlterNull = false;
                    let needsAlterDefault = false;

                    // Normalizar tipos comunes para evitar falsos positivos
                    const refType = normalizeDataType(colMeta.dataType);
                    const curType = normalizeDataType(liveCol.dataType);

                    if (refType !== curType || (colMeta.maxLength && colMeta.maxLength !== liveCol.maxLength)) {
                        needsAlterType = true;
                    }
                    if (colMeta.isNullable !== liveCol.isNullable) {
                        needsAlterNull = true;
                    }

                    if (needsAlterType) {
                        let typeSql = colMeta.dataType;
                        if (colMeta.maxLength && colMeta.dataType.includes('char')) {
                            typeSql += `(${colMeta.maxLength})`;
                        }
                        const alterTypeSql = `ALTER TABLE public."${tblName}" ALTER COLUMN "${colName}" TYPE ${typeSql} USING "${colName}"::${colMeta.dataType};`;
                        console.log(`  ${colors.cyan}[MODIFY TYPE] Tabla "${tblName}": cambiando tipo de "${colName}" de [${liveCol.dataType}] a [${colMeta.dataType}]...${colors.reset}`);
                        try {
                            await dbClient.query(alterTypeSql);
                            console.log(`    ${colors.green}[OK] Tipo actualizado.${colors.reset}`);
                            changesApplied++;
                        } catch (err) {
                            console.error(`    ${colors.red}[AVISO] No se pudo cambiar tipo automáticamente en "${tblName}.${colName}": ${err.message}${colors.reset}`);
                            console.log(`      ${colors.gray}Consola SQL sugerida: ${alterTypeSql}${colors.reset}`);
                            warningsCount++;
                        }
                    }

                    if (needsAlterNull) {
                        const nullSql = colMeta.isNullable === 'NO' ? 'SET NOT NULL' : 'DROP NOT NULL';
                        const alterNullSql = `ALTER TABLE public."${tblName}" ALTER COLUMN "${colName}" ${nullSql};`;
                        console.log(`  ${colors.cyan}[MODIFY NULL] Tabla "${tblName}": cambiando nulidad de "${colName}" a ${colMeta.isNullable === 'NO' ? 'NOT NULL' : 'NULL'}...${colors.reset}`);
                        try {
                            await dbClient.query(alterNullSql);
                            console.log(`    ${colors.green}[OK] Nulidad actualizada.${colors.reset}`);
                            changesApplied++;
                        } catch (err) {
                            console.error(`    ${colors.red}[ERROR] Falló cambiar nulidad en "${tblName}.${colName}": ${err.message}${colors.reset}`);
                            warningsCount++;
                        }
                    }
                }
            }

            // C. Sincronizar Routines (Funciones y Procedimientos)
            console.log(`\n${colors.bright}[3/4] Sincronizando Funciones y Procedimientos Almacenados...${colors.reset}`);
            for (const [rtName, rtMeta] of Object.entries(refSchema.routines)) {
                try {
                    await dbClient.query(rtMeta.definition);
                    // Log silencioso o sutil para no saturar pantalla
                    process.stdout.write(`${colors.gray}.`);
                } catch (err) {
                    process.stdout.write(`\n`);
                    console.error(`  ${colors.red}[ERROR SP] Error al recrear routine "${rtName}": ${err.message}${colors.reset}`);
                    warningsCount++;
                }
            }
            console.log(`\n  ${colors.green}[OK] Funciones y SPs procesados.${colors.reset}`);

            // Reporte final de comparación
            console.log(`\n${colors.bright}Resultado de la comparación de esquemas:`);
            console.log(`  - Cambios automáticos aplicados con éxito: ${colors.green}${changesApplied}${colors.reset}`);
            console.log(`  - Advertencias / Errores que requieren validación manual: ${warningsCount > 0 ? colors.red : colors.green}${warningsCount}${colors.reset}`);
            
            if (warningsCount > 0) {
                console.log(`  ${colors.yellow}[!] Alerta: Se detectaron advertencias de inconsistencias de datos que impidieron cambios de tipos automáticos.`);
                console.log(`      Por favor revise los errores detallados arriba y el archivo 'install_log.txt'.${colors.reset}`);
            } else {
                console.log(`  ${colors.green}[OK] Esquema de la base de datos perfectamente sincronizado con el modelo de desarrollo.${colors.reset}`);
            }

        } catch (schemaErr) {
            console.error(`${colors.red}[ERROR COMPARADOR] Falló la lectura o parsing de schema_reference.json:${colors.reset}`, schemaErr.message);
            warningsCount++;
        }
    } else {
        console.log(`\n${colors.yellow}[!] No se detectó 'schema_reference.json'. El comparador avanzado de campos y tipos fue omitido.${colors.reset}`);
    }

    // 5. Insertar Semilla Inicial (Inicial.sql)
    const dataFile = resolvePath('SQL', 'Inicial.sql');
    if (fs.existsSync(dataFile)) {
        console.log(`\n${colors.bright}[4/4] Sembrando catálogos y datos iniciales requeridos (Inicial.sql)...${colors.reset}`);
        try {
            const sqlInit = fs.readFileSync(dataFile, 'utf8');
            // Ejecutar la semilla inicial. Si ya existen registros (Duplicate Key) el Catch del cliente lo ignorará
            await dbClient.query(sqlInit);
            console.log(`  ${colors.green}[OK] Semilla de datos procesada con éxito.${colors.reset}`);
        } catch (e) {
            // Ignorar errores típicos de "ya existe la clave" (duplicate key) ya que es un actualizador
            if (e.code === '23505') {
                console.log(`  ${colors.gray}[INFO] Los catálogos ya contienen los datos semilla (Claves duplicadas omitidas).${colors.reset}`);
            } else {
                console.warn(`  ${colors.yellow}[!] Aviso poblando datos iniciales: ${e.message}${colors.reset}`);
            }
        }
    }

    await dbClient.end();
    console.log(`\n${colors.bright}${colors.green}>> PROCESAMIENTO DE BASE DE DATOS FINALIZADO EXITOSAMENTE <<\n${colors.reset}`);
}

// Función auxiliar para reconstruir definición de columna
function getColumnSqlDefinition(colName, colMeta) {
    let sql = `"${colName}" ${colMeta.dataType}`;
    
    // Si contiene longitud máxima (varchar/char/etc)
    if (colMeta.maxLength && colMeta.dataType.includes('char')) {
        sql += `(${colMeta.maxLength})`;
    }
    
    // Nulidad
    if (colMeta.isNullable === 'NO') {
        sql += ' NOT NULL';
    } else {
        sql += ' NULL';
    }
    
    // Valor por defecto
    if (colMeta.columnDefault !== null && colMeta.columnDefault !== undefined) {
        // El default de postgres a veces viene con casts como: '3'::integer, 'text'::text
        sql += ` DEFAULT ${colMeta.columnDefault}`;
    }
    
    return sql;
}

// Normalización de tipos de datos de Postgres para comparar equivalencias lógicas y evitar falsos positivos
function normalizeDataType(type) {
    if (!type) return '';
    const t = type.toLowerCase();
    if (t === 'character varying' || t === 'varchar') return 'varchar';
    if (t === 'character' || t === 'char') return 'char';
    if (t === 'integer' || t === 'int' || t === 'int4') return 'integer';
    if (t === 'double precision' || t === 'float' || t === 'float8') return 'double precision';
    if (t === 'boolean' || t === 'bool') return 'boolean';
    if (t === 'timestamp without time zone' || t === 'timestamp') return 'timestamp';
    if (t === 'timestamp with time zone' || t === 'timestamptz') return 'timestamptz';
    return t;
}

run();
