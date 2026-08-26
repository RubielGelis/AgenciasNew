---
name: updater-verification
description: Protocolo y script de validación automatizada pre-compilación para garantizar actualizadores e instaladores 100% limpios y sin fallas al pasar de desarrollo a producción.
---

# Protocolo y Validación Automatizada Pre-Empaquetado - AgenciasNew

Este Skill define el protocolo de control de calidad y validación automatizada que debe ejecutarse **antes de generar cualquier ejecutable instalador (`Korex_Setup.exe`) o actualizador (`Korex_Update_Setup.exe`)** para entornos de prueba o producción.

---

## 1. Reglas de Validación de Base de Datos (PostgreSQL)

### A. Integridad de Tablas Nuevas y Extensiones
Cualquier tabla creada o referenciada en SPs (ejemplo: `QuotationManualService`, `QuotationFormat`, `QuotationPrintCustomization`, `QuotationCombo`) **debe contar con un bloque `CREATE TABLE IF NOT EXISTS`** dentro de [`SQL/Table/Alter_New_Columns.sql`](file:///f:/Proyectos/AgenciasNew/SQL/Table/Alter_New_Columns.sql).
- *Razón*: Si la tabla no existe en el servidor remoto del cliente, una sentencia `ALTER TABLE` fallará rompiendo la ejecución del script actualizador.

### A.1. Verificación de Columnas Referenciadas en SPs (Prevención de Error 42703)
Toda columna de tabla referenciada en un SP o vista (ejemplo: `InvoicesProduct.ticketCode`) **debe contar obligatoriamente con su bloque `ALTER TABLE public."Tabla" ADD COLUMN IF NOT EXISTS "columna" tipo;`** en [`SQL/Table/Alter_New_Columns.sql`](file:///f:/Proyectos/AgenciasNew/SQL/Table/Alter_New_Columns.sql) y estar declarada en `prisma/schema.prisma`.

### B. Obligatoriedad de `LEFT JOIN` en Consultas
Todas las funciones de listado e historial (`fnCotizacionListar`, `fnCotizacionHistorial`, `fnCotizacion`, `spExportQuotation`) deben relacionar las tablas maestras (`Client`, `User`, `Branch`, `Provider`, `Prestadora`) mediante **`LEFT JOIN`**.
- *Razón*: El uso de `INNER JOIN` o `JOIN` oculta registros cuando las cotizaciones tienen clientes o usuarios nulos o no coincidentes en bases externas.

### C. Duplicación Completa en `spCotizacionDuplicar`
El procedimiento almacenado de duplicación debe copiar tanto la cabecera como **todas** sus tablas hijas:
1. `QuotationCombo`
2. `QuotationManualService`
3. `QuotationProduct`
4. `QuotationProductPassenger`
5. `QuotationProductTax`
6. `QuotationProductVariable`
7. `QuotationProductPayment`

### D. Integridad de Secuencias Autoincrementales (`SERIAL / nextval`)
Toda columna `id` de tipo entero en cualquier tabla debe contar con una secuencia asignada como valor por defecto (`DEFAULT nextval('public."<Tabla>_id_seq"'::regclass)`).
- *Razón*: Si la columna `id` se crea o migra como `integer NOT NULL` sin secuencia por defecto, cualquier operación de `INSERT` que omita el parámetro `id` fallará con el error `null value in column "id" violates not-null constraint`.

### F. Siembra Obligatoria de Módulos de Navegación (`public."Menu"`)
Todo nuevo módulo de navegación agregado a la barra lateral o al menú del sitio (`PRECOTIZACIONES`, `EJECUCIONES`, `MANUAL`, etc.) **DEBE ser sembrado e inyectado con `CREATE UNIQUE INDEX IF NOT EXISTS "Menu_code_key"` y `INSERT ... ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, action = EXCLUDED.action;`** dentro de [`SQL/Table/Alter_New_Columns.sql`](file:///f:/Proyectos/AgenciasNew/SQL/Table/Alter_New_Columns.sql) y [`SQL/Data/Menu.sql`](file:///f:/Proyectos/AgenciasNew/SQL/Data/Menu.sql).
- *Razón*: Si la inyección no se incluye en `Alter_New_Columns.sql`, las bases de datos de clientes existentes no recibirán los nuevos módulos en su menú de navegación tras ejecutar el actualizador.

### G. Preservación Estricta de Parámetros del Sistema (`SystemParameter`)
En sentencias de siembra de datos de parámetros del sistema (`SystemParameter`), se debe usar **SIEMPRE `ON CONFLICT (code) DO NOTHING;`**. Queda estrictamente prohibido usar `ON CONFLICT (code) DO UPDATE SET value = EXCLUDED.value;`.
- *Razón*: Si se utiliza `DO UPDATE SET value`, cada actualización ejecutada en el cliente reemplazará las credenciales y servidores configurados por la agencia (SQL Server host, usuario, clave, puerto) restableciéndolos a los valores por defecto del entorno de desarrollo.

---

## 2. Reglas de API y Frontend (Next.js)

### A. Inclusión de Relaciones Maestras en Endpoints por ID
En endpoints de consulta única por ID (`/api/quotations/[id]`), la consulta Prisma `findUnique` debe incluir explícitamente todas las entidades maestras asociadas:
```typescript
include: {
    client: true,
    seller: true,
    branch: true,
    implant: true,
    ticketPrinter: true,
    manualServices: true,
    products: { ... }
}
```

### B. Fusión de Objetos Maestros en Formularios
En el componente de formulario (`quotation-form.tsx`), la carga de datos por ID debe fusionar los objetos devueltos (`qData.client`, `qData.seller`, `qData.branch`, `qData.implant`, `qData.ticketPrinter`) en el estado global para que los controles `SearchSelect` desplieguen inmediatamente el nombre y código de las entidades.

### C. Verificación de Relaciones en Prisma Schema (`prisma/schema.prisma`)
Cualquier modelo o tabla agregada o modificada en `prisma/schema.prisma` que contenga una relación `@relation(fields: [foreignKey], references: [id])` **DEBE contar con su campo relacional correspondiente en el modelo destino** (ej. `Interfaces` debe incluir `InterfaceExtractParam InterfaceExtractParam[]`).
- *Razón*: Si la relación inversa falta en la entidad principal, las consultas con `include: { TargetModel: true }` en las API Routes fallan en tiempo de compilación TypeScript con el error: `Type '{ TargetModel: ... }' is not assignable to type 'never'`.
### D. Visibilidad del Componente de Licenciamiento (`<LicenseStatusCard />`)
La vista principal de Configuración del Sistema (`src/app/dashboard/settings/page.tsx`) debe incluir de forma fija e inamovible el componente `<LicenseStatusCard />` para garantizar que los administradores tengan visibilidad inmediata del estado de vigencia de la licencia, NIT de la empresa, días restantes y el panel para renovar/activar claves cifradas (`KOR1`).

---

## 3. Validador Automatizado Integrado (`deploy/validate_schema_before_package.js`)

El script de validación automatizada [`deploy/validate_schema_before_package.js`](file:///f:/Proyectos/AgenciasNew/deploy/validate_schema_before_package.js) está integrado directamente en [`deploy/gen_schema_json.js`](file:///f:/Proyectos/AgenciasNew/deploy/gen_schema_json.js) y ejecuta de forma transparente 6 capas de seguridad:

1. **Despliegue Local**: Compila todos los scripts de `SQL/Function/`, `SQL/SP/` y `SQL/Procedure/` en PostgreSQL local.
2. **Auto-Inyección de Tablas**: Detecta tablas referenciadas en SPs e inyecta bloques `CREATE TABLE IF NOT EXISTS` en `Alter_New_Columns.sql` si faltan.
3. **Inyección de Secuencias**: Verifica que toda columna `id` tenga secuencia por defecto (`DEFAULT nextval(...)`) y auto-corrige si falta.
4. **Verificación de Restricciones UNIQUE**: Garantiza las llaves de unicidad requeridas para operaciones `UPSERT` / `ON CONFLICT`.
5. **Verificación de `LEFT JOIN`**: Revisa sintácticamente que no existan `INNER JOIN` en tablas maestras.
6. **Sincronización Dinámica de Actualizadores**: Sincroniza e inyecta los 125+ scripts SQL en [`Actualizador.sql`](file:///f:/Proyectos/AgenciasNew/SQL/Actualizador/Actualizador.sql) y [`Actualizador.SQL`](file:///f:/Proyectos/AgenciasNew/SQL/Actualizador.SQL).

---

## 4. Secuencia de Empaquetado para Producción

Para generar un paquete limpio de producción, ejecutar en orden:

```bash
# Paso 1: Ejecutar la validación automatizada y generación del descriptor de esquemas
node deploy/gen_schema_json.js

# Paso 2: Generar el build standalone de producción de Next.js
powershell.exe -ExecutionPolicy Bypass -File deploy/Generar_Empaquetado.ps1

# Paso 3: Compilar los ejecutables de Inno Setup
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" deploy/Korex_Update.iss
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" deploy/Korex.iss
```
