---
name: master-creation
description: Guía y lista de verificación obligatoria para crear un nuevo Maestro en AgenciasNew evitando fallbacks incorrectos (como 'Implant') y garantizando registro completo en 6 capas.
---

# Guía Obligatoria de Creación de Maestros - AgenciasNew

Esta guía previene errores recurrentes (como botones que muestran "Nuevo Implant" o búsquedas que dicen "Buscar en Implants...") al añadir nuevos maestros o tablas parametrizables al sistema.

---

## 1. Regla de Oro en Frontend (`src/app/dashboard/settings/page.tsx`)

> [!CAUTION]
> **PROHIBIDO USAR TERNARIOS ENCADENADOS CON FALLBACK SILENCIOSO**.
> NUNCA usar ternarios largos que terminen en `'Implants'` o `'/api/config/implants'`.

### Pasos Obligatorios al agregar una pestaña de Maestro:
1. Agregar la clave del nuevo tab al tipo `Tab` en `src/app/dashboard/settings/page.tsx`:
   ```ts
   type Tab = ... | 'nuevo-maestro';
   ```

2. **OBLIGATORIO**: Registrar el nuevo tab en la constante `TAB_CONFIG: Record<Tab, TabConfigItem>`:
   ```ts
   'nuevo-maestro': { 
       endpoint: '/api/config/nuevo-maestro', 
       singular: 'Nuevo Registro', 
       plural: 'Nuevos Registros', 
       article: 'un', // 'un' o 'una'
       newLabel: 'Nuevo Registro' 
   }
   ```
   *TypeScript obligará a definir este objeto; si no se define, el proyecto NO compilará (`tsc`), evitando fallbacks erróneos en runtime.*

3. Registrar el tab en `tabCodeMap` dentro de `isMasterTabEnabled` para el control de roles RBAC.

4. Cargar datos de apoyo/combos en `fetchLookupData` (ej: Sucursales, Implantes, Monedas si los necesita el formulario).

5. Agregar el caso en `setTabListState` para almacenar la lista en el estado correspondiente.

6. Agregar el botón de la pestaña en la barra `TabButton` y el formulario en la sección de modales.

7. **Renderizado de Tabla Independiente**: Definir un bloque `<tr>` independiente en la tabla con la coincidencia exacta de columnas (`<th>` / `<td>`). NUNCA incluirlo dentro del bucle genérico de maestros simples (`code` / `name`), previniendo que los datos se desplacen hacia la derecha.

8. **Inclusión Obligatoria en Tabla `"Master"` (Módulos del Sitio)**: Registrar el código del maestro en `public."Master"` tanto en [`SQL/Table/Alter_New_Columns.sql`](file:///f:/Proyectos/AgenciasNew/SQL/Table/Alter_New_Columns.sql) como en `SQL/Inicial.sql` con `INSERT INTO public."Master" (code, name, "inactivo") VALUES ('CodigoMaestro', 'clave-pestaña', false) ON CONFLICT (code) DO NOTHING;`. Esto garantiza que la tarjeta con el interruptor ON/OFF para habilitar o deshabilitar la pestaña aparezca inmediatamente en la vista `Módulos del Sitio -> Tablas Maestras y Pestañas de Configuración`.

---

## 2. Capa de Base de Datos y Backend (PostgreSQL & Prisma)

1. **Tabla SQL (`SQL/Table/Alter_New_Columns.sql`)**:
   - Definir la tabla con `CREATE TABLE IF NOT EXISTS public."NombreTabla" (...)`.
   - Asignar secuencia autoincremental `DEFAULT nextval('...')` en la columna `id`.
   - Agregar Foreign Keys con `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY`.

2. **Funciones y Stored Procedures (SPs)**:
   - `SQL/Function/fn<Maestro>Listar.sql`: Usar **SIEMPRE `LEFT JOIN`** para tablas relacionables.
   - `SQL/SP/sp<Maestro>Crear.sql`: Recibir parámetros e insetar RETURNING `id`.
   - `SQL/SP/sp<Maestro>Actualizar.sql`: Procedimiento de actualización por ID.
   - `SQL/SP/sp<Maestro>Eliminar.sql`: Procedimiento de borrado.

3. **Ejecución del Validador pre-compilación**:
   - Ejecutar `node deploy/gen_schema_json.js` para compilar SPs, verificar `LEFT JOIN`, regenerar Prisma Client y actualizar `Actualizador.sql`.

4. **API Route Next.js**:
   - Crear `src/app/api/config/<maestro>/route.ts` con métodos `GET`, `POST`, `PUT`, `DELETE` consumiendo los SPs con `prisma.$queryRawUnsafe`.

---

## 3. Manual Operativo Interactivo

- Registrar el procedimiento `MAE-XX` en [`src/data/manual/modules.ts`](file:///f:/Proyectos/AgenciasNew/src/data/manual/modules.ts) con sus campos, concepto, reglas de negocio y pasos visuales.

---

## 4. Verificación de Cierre

- Ejecutar `cmd.exe /c "npx tsc --noEmit"` y asegurar `0` errores de tipos.
- Probar la interfaz visual en `/dashboard/settings` verificando que:
  - El botón superior muestre `+ Nuevo <NombreMaestro>`.
  - El campo de búsqueda diga `Buscar en <NombreMaestroPlural>...`.
  - Al guardar o eliminar, el endpoint corresponda a la API del maestro y no a `/api/config/implants`.
