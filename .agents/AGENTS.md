# Reglas de Codificación y Desarrollo - Proyecto AgenciasNew

Este documento contiene las directrices, estándares y reglas del proyecto para guiar la asistencia en programación y despliegue del sistema AgenciasNew.

---

## 1. Reglas de Base de Datos y SQL

- **REGLA PRIMORDIAL DE ARQUITECTURA (Lógica en Base de Datos)**: Todo desarrollo, cálculo, proceso de negocio, liquidación, consulta de listado, validación o mutación de datos en AgenciasNew **DEBE realizarse obligatoria y prioritariamente a través de Procedimientos Almacenados (SPs), Funciones SQL y Tablas de Base de Datos** (PostgreSQL local `Korex_colaereo` y SQL Server producción).
  - **Excepción Única**: Únicamente cuando sea técnicamente imposible realizar el procesamiento dentro de la base de datos (por ejemplo: renderizado estético de interfaz React, manipulación directa del DOM o manejo de cookies HTTP de sesión en Edge Runtime), se permitirá implementar dicha lógica en el sitio web / frontend (Next.js).

### PostgreSQL (Base Local - Korex_colaereo)
- **Mayúsculas en Nombres de Tablas/Relaciones**: Las tablas del sistema local usan PascalCase y deben ser referenciadas exactamente igual con comillas dobles si es necesario (`public."Quotation"`, `public."Client"`, `public."QuotationProduct"`, `public."Role"`).
- **Tratamiento de Nulos y Joins**: 
  - Utilizar siempre `COALESCE` al realizar consultas para evitar valores inesperados de tipo `NULL`.
  - **Uso obligatorio de `LEFT JOIN`**: En funciones de listado/historial (`fnCotizacionListar`, `fnCotizacionHistorial`, `fnRoleListar`, `fnCotizacion`), usar **SIEMPRE `LEFT JOIN`** para las tablas relacionables (`Client`, `User`, `Branch`, etc.). NUNCA usar `INNER JOIN` (`JOIN`) al relacionar `Client` o `User` para evitar ocultar cotizaciones con clientes no asignados o descalzados en servidores externos.
  - En las cláusulas `WHERE`, asegurar que las búsquedas por texto soporten clientes o usuarios nulos: `(p_cliente IS NULL OR TRIM(p_cliente) = '' OR (c.name IS NOT NULL AND c.name ILIKE '%' || TRIM(p_cliente) || '%'))`.
- **Tratamiento de XML**: 
  - Al generar el XML de exportación en `spExportQuotation`, los nombres de las etiquetas deben ser coherentes (minúsculas).
  - Al agregar tablas secundarias como detalles, verificar la FK correcta usando el ID de referencia del producto/servicio (`orig_id_ref`) y no el ID de la cotización.
- **Flujo Obligatorio al modificar Funciones SQL / SPs**:
  1. Ejecutar validador y generador de esquema: `node deploy/gen_schema_json.js` (Ejecuta la validación de 4 capas de `updater-verification`).
  2. Consultar al usuario en español si desea generar el instalador y actualizador automáticamente o si prefiere realizarlo manualmente (Skill [`installer-decision`](file:///f:/Proyectos/AgenciasNew/.agents/skills/installer-decision/SKILL.md)).
  3. Si aprueba automático: Generar el empaquetado standalone (`powershell.exe -ExecutionPolicy Bypass -File deploy/Generar_Empaquetado.ps1`) y compilar con `GenerarSetup.bat` / `GenerarActualizador.bat`.
  4. Si prefiere manual: Entregar instrucciones y scripts para compilación manual por parte del usuario.

### SQL Server (Base de Producción/Agencias)
- **Estructura Zeus ERP**: Las tablas del ERP Zeus tienen nombres de columna heredados específicos. Evitar el uso de nombres genéricos:
  - En `dbo.CLIENTES`, usar `IDCLIENTE`, `RAZONCIAL`, `DIRECCION`, `TELEFONO`, `CIUDAD`, `EMAIL`.
  - En `dbo.MAEVENDE`, usar `IDVENDE`, `NOMBVENDE`.
  - En `dbo.PROVEEDORES`, usar `IDPROVE`, `RAZONCIAL`, `CODICTA`.
- **Sensibilidad a Mayúsculas en XML XPath**: Al procesar el XML importado en `spCotizacionesCrear`, utilizar exactamente las etiquetas generadas en Postgres (minúsculas como `cd_cotizacion`, `ds_fpnm`, `am_valor_me`, etc.) ya que la función `.value()` de SQL Server es strictly Case-Sensitive.
- **Control de Transacciones**: 
  - Evitar transacciones huérfanas o bloqueos. Las validaciones lógicas de llaves maestras (cliente, vendedor, sucursal o proveedor inexistente) deben realizarse **antes** de abrir el `BEGIN TRANSACTION` o asegurar un `ROLLBACK TRANSACTION` explícito antes de cualquier retorno con error (`RETURN 1`).
  - Utilizar `SET XACT_ABORT ON;` al inicio de los SPs para abortar automáticamente la transacción ante cualquier error fatal.
- **Sincronización del Actualizador**: Cualquier cambio realizado en los Procedimientos Almacenados (ej. `spCotizacionesCrear.sql` o `spFacturacionesCrear.sql`) **debe ser replicado obligatoriamente** en el archivo del script actualizador `SQL/Actualizador/ActualizadorSERVER.sql` y `SQL/Actualizador/Actualizador.sql`.

---

## 2. Reglas de Next.js y TypeScript (Frontend)

- **Puerto del Servidor**: El servidor local de desarrollo y producción de Next.js se arranca por defecto en el puerto **`3001`** (configurado en `iniciar-next.bat`).
- **Prisma ORM**: 
  - Al realizar modificaciones de base de datos en Postgres, ejecutar siempre `npx prisma db pull` seguido de `npx prisma generate` para sincronizar los modelos locales.
  - Asegurar la detención y el reinicio correcto del servidor Next.js cuando se modifique el esquema de la base de datos o variables de entorno.
- **Acceso a Datos**: Usar las relaciones de Prisma de forma segura y tipada en TypeScript, manejando correctamente los posibles nulos.

---

## 3. Reglas de Control de Cambios y Git

- **Pruebas y Despliegue Local**: Todo desarrollo, modificación de base de datos o cambio en la interfaz debe ser generado y probado de manera strictly local.
- **Subida Completa del Proyecto Local**: Cuando el usuario indique **"subir a git"** (o equivalentes), se debe subir **todo el estado del proyecto local** (`git add .`), incluyendo nuevos scripts, modales, endpoints, componentes, funciones SQL y actualizadores creados, respetando únicamente el `.gitignore`.
- **Autorización para Git**: Bajo ninguna circunstancia se deben subir cambios a Git o realizar commits en ramas remotas sin la previa verificación de pruebas locales y la autorización explícita del usuario.
- **Descargas y Actualizaciones de Git**: No se deben realizar descargas automáticas, actualizaciones, clonaciones o `git pull` de ramas remotas de forma automática. Cualquier descarga o actualización de código desde Git debe realizarse única y exclusivamente cuando el usuario lo solicite de manera explícita.

---

## 4. Regla de Actualización Continua del Manual Operativo Interactivo

- **Actualización Obligatoria**: Cada vez que se agregue o modifique un desarrollo en la plataforma (nuevo SP, API route, modal o pantalla), se DEBE actualizar obligatoriamente el archivo [`src/data/manual/modules.ts`](file:///f:/Proyectos/AgenciasNew/src/data/manual/modules.ts) siguiendo la guía del Skill [`manual-updater`](file:///f:/Proyectos/AgenciasNew/.agents/skills/manual-updater/SKILL.md).
- **Mantenimiento**: La documentación interactiva disponible en la ruta `/dashboard/manual` debe acumular y reflejar de manera continua e incremental todas las funcionalidades activas del sistema.
