---
name: db-management
description: Workflow for writing, deploying and updating stored procedures in SQL Server and PostgreSQL, including synchronization with ActualizadorSERVER.sql
---

# Procedimientos y Automatización de Base de Datos - AgenciasNew

Esta guía detalla el flujo de trabajo paso a paso para realizar cambios eficientes en la base de datos de AgenciasNew.

---

## 1. Modificación y Despliegue de Procedimientos Almacenados (SPs)

### Flujo de Desarrollo en SQL Server:
1. Abrir o modificar el archivo `.sql` correspondiente en la ruta `SQL/SP/`.
2. Una vez modificado el archivo local, compilarlo en el servidor de pruebas SQL Server ejecutando el script de despliegue automatizado:
   ```bash
   node tmp/deploy_sql.mjs
   ```
3. Si la compilación falla con errores sintácticos, corregir en el archivo `.sql` de origen y volver a desplegar.

### Flujo de Desarrollo en PostgreSQL:
1. Las consultas SQL y procedimientos se almacenan en el esquema local.
2. Tras realizar cambios, probar localmente conectándote a la base de datos Postgres local:
   ```javascript
   postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo
   ```

---

## 2. Actualización del Script Actualizador (ActualizadorSERVER.sql)

Cualquier cambio realizado en los SPs principales (`spCotizacionesCrear.sql`, `spFacturacionesCrear.sql`, etc.) **debe replicarse manualmente** en `SQL/Actualizador/ActualizadorSERVER.sql` para que las actualizaciones se desplieguen correctamente en los servidores de producción de los clientes.

### Instrucciones para sincronizar:
1. Buscar el bloque correspondiente al procedimiento almacenado modificado dentro de `ActualizadorSERVER.sql`.
2. Copiar el bloque de código actualizado del archivo de origen en `SQL/SP/`.
3. Validar que las variables temporales y rutas de ejecución no tengan discrepancias.

---

## 4. Regla Crítica: Uso de LEFT JOIN en Funciones de Consulta PostgreSQL

Al escribir o modificar funciones SQL de listado e historial (`fnCotizacionListar`, `fnCotizacionHistorial`, `fnCotizacion`, `spExportQuotation`, etc.):

1. **Usar siempre `LEFT JOIN` para tablas maestras relacionables** (`public."Client"`, `public."User"`, `public."Branch"`, `public."Provider"`, `public."Prestadora"`).
2. **NUNCA usar `INNER JOIN` (`JOIN`) en la tabla `Client` o `User`**. 
   - *Causa*: Si una cotización tiene `clientId` nulo, no asignado o con un ID no coincidente en la tabla `Client` (común tras restauraciones de base de datos o migraciones externas), un `INNER JOIN` descarta la fila por completo.
   - *Síntoma*: La interfaz muestra **"Total cotizaciones: 0"** o **"No hay cotizaciones"** en la vista de historial (`/dashboard/quotations/history`), a pesar de que los registros sí existen en la tabla `Quotation`.
3. **Manejo seguro de Nulos en JSON**: Formatear el objeto JSON retornado usando `CASE WHEN c.id IS NOT NULL THEN jsonb_build_object(...) ELSE jsonb_build_object('id', null, 'name', 'Cliente desconocido', 'document', '') END` o `COALESCE(c.name, 'Cliente desconocido')`.

---

## 5. Sincronización Completa del Actualizador Local y Remoto

Tras escribir o modificar cualquier función o SP en PostgreSQL:

1. **Ejecutar la generación de esquemas (que incluye el validador automático)**:
   ```bash
   node deploy/gen_schema_json.js
   ```

2. **Compilar el actualizador o instalador**:
   ```bash
   powershell.exe -ExecutionPolicy Bypass -File deploy/Generar_Empaquetado.ps1 -SkipBuild
   "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" deploy/Korex_Update.iss
   ```

---

## 6. Validación Automatizada Pre-Compilación (`validate_schema_before_package.js`)

El generador de esquema ([`deploy/gen_schema_json.js`](file:///f:/Proyectos/AgenciasNew/deploy/gen_schema_json.js)) ejecuta automáticamente el script de validación pre-compilación ([`deploy/validate_schema_before_package.js`](file:///f:/Proyectos/AgenciasNew/deploy/validate_schema_before_package.js)) **antes de empaquetar o regenerar cualquier versión**, realizando las siguientes tareas automáticamente:

1. **Despliegue Automático en Postgres Local**: Compila todos los `.sql` de `SQL/Function/` y `SQL/SP/` en la BD local para asegurar que las DDL extraídas a `schema_reference.json` sean 100% actuales.
2. **Inspección de Tablas Referenciadas (`CREATE TABLE IF NOT EXISTS`)**: Escanea todos los SPs y funciones buscando tablas referenciadas (p. ej. `QuotationManualService`, `QuotationPrintCustomization`, etc.). Si falta la sentencia `CREATE TABLE IF NOT EXISTS` en [`Alter_New_Columns.sql`](file:///f:/Proyectos/AgenciasNew/SQL/Table/Alter_New_Columns.sql), **la crea e inyecta de forma automática**, previniendo errores de `relation "public.TableName" does not exist` en clientes.
3. **Verificación de `LEFT JOIN` Obligatorio**: Escanea las funciones de consulta e historial y valida que relacionen `Client` y `User` mediante `LEFT JOIN`.
4. **Sincronización de Actualizadores**: Actualiza automáticamente los archivos de texto [`Actualizador.sql`](file:///f:/Proyectos/AgenciasNew/SQL/Actualizador/Actualizador.sql) y [`Actualizador.SQL`](file:///f:/Proyectos/AgenciasNew/SQL/Actualizador.SQL).

