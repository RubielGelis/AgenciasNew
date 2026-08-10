# Reglas de Codificación y Desarrollo - Proyecto AgenciasNew

Este documento contiene las directrices, estándares y reglas del proyecto para guiar la asistencia en programación y despliegue del sistema AgenciasNew.

---

## 1. Reglas de Base de Datos y SQL

### PostgreSQL (Base Local - Korex_colaereo)
- **Mayúsculas en Nombres de Tablas/Relaciones**: Las tablas del sistema local usan PascalCase y deben ser referenciadas exactamente igual con comillas dobles si es necesario (`public."Quotation"`, `public."Client"`, `public."QuotationProduct"`).
- **Tratamiento de Nulos**: Utilizar siempre `COALESCE` al realizar consultas para evitar valores inesperados de tipo `NULL` en los XML generados.
- **Tratamiento de XML**: 
  - Al generar el XML de exportación en `spExportQuotation`, los nombres de las etiquetas deben ser coherentes (minúsculas).
  - Al agregar tablas secundarias como detalles, verificar la FK correcta usando el ID de referencia del producto/servicio (`orig_id_ref`) y no el ID de la cotización.

### SQL Server (Base de Producción/Agencias)
- **Estructura Zeus ERP**: Las tablas del ERP Zeus tienen nombres de columna heredados específicos. Evitar el uso de nombres genéricos:
  - En `dbo.CLIENTES`, usar `IDCLIENTE`, `RAZONCIAL`, `DIRECCION`, `TELEFONO`, `CIUDAD`, `EMAIL`.
  - En `dbo.MAEVENDE`, usar `IDVENDE`, `NOMBVENDE`.
  - En `dbo.PROVEEDORES`, usar `IDPROVE`, `RAZONCIAL`, `CODICTA`.
- **Sensibilidad a Mayúsculas en XML XPath**: Al procesar el XML importado en `spCotizacionesCrear`, utilizar exactamente las etiquetas generadas en Postgres (minúsculas como `cd_cotizacion`, `ds_fpnm`, `am_valor_me`, etc.) ya que la función `.value()` de SQL Server es estrictamente Case-Sensitive.
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
