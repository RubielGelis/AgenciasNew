---
name: db-management
description: Workflow and mandatory rules for database-first development using stored procedures, functions and tables in PostgreSQL and SQL Server in AgenciasNew
---

# Procedimientos y Automatización de Base de Datos - AgenciasNew

Esta guía detalla las reglas obligatorias y el flujo de trabajo paso a paso para realizar desarrollos y cambios en la base de datos de AgenciasNew.

---

## 0. REGLA PRIMORDIAL: Desarrollo Basado Prioritariamente en Base de Datos (SPs, Funciones y Tablas)

> [!IMPORTANT]
> **REGLA MANDATORIA DE ARQUITECTURA**:
> Todo desarrollo, cálculo de negocio, proceso, liquidación, validación, inserción o consulta de datos en AgenciasNew **DEBE realizarse obligatoria y prioritariamente a través de Procedimientos Almacenados (SPs), Funciones SQL y Tablas de Base de Datos** (en PostgreSQL local `Korex_colaereo` y SQL Server producción).
>
> **Criterio de Excepción**:
> Únicamente cuando sea **estrictamente e insalvablemente imposible** implementar la lógica dentro de la base de datos (por ejemplo: renderizado estético de interfaz React, manipulación directa del DOM o manejo de cookies HTTP de sesión en Edge Runtime), se permitirá programar dicha lógica en Next.js / TypeScript frontend.

---

## 1. Modificación y Despliegue de Procedimientos Almacenados (SPs)

### Flujo de Desarrollo en PostgreSQL (Base Local):
1. Crear o modificar la función SQL en `SQL/Function/` o el SP en `SQL/SP/`.
2. Las consultas de listado e historial siempre deben implementarse mediante Funciones SQL (`public.fn...()`) retornando `TABLE` o `jsonb`.
3. Las operaciones de creación, edición o eliminación de datos deben implementarse mediante Procedimientos Almacenados (`public.sp...`).
4. Probar localmente conectándote a la BD local:
   ```
   postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo
   ```

### Flujo de Desarrollo en SQL Server (ERP Zeus):
1. Crear o modificar el SP correspondiente en `SQL/SP/` asegurando `SET XACT_ABORT ON;` y control de transacciones estricto.
2. Compilar en el servidor SQL Server ejecutando el script de despliegue automatizado:
   ```bash
   node tmp/deploy_sql.mjs
   ```

---

## 2. Actualización y Sincronización Automática de Actualizadores

Cualquier cambio realizado en Funciones o SPs **debe ser validado y sincronizado automáticamente** ejecutando:

```bash
node deploy/gen_schema_json.js
```

Este script ejecuta la validación pre-compilación de 4 capas:
1. Compila todos los `.sql` en PostgreSQL local.
2. Inyecta `CREATE TABLE IF NOT EXISTS` para tablas referenciadas en [`Alter_New_Columns.sql`](file:///f:/Proyectos/AgenciasNew/SQL/Table/Alter_New_Columns.sql).
3. Verifica la regla obligatoria de `LEFT JOIN` en funciones de consulta.
4. Sincroniza automáticamente los scripts de producción [`SQL/Actualizador/Actualizador.sql`](file:///f:/Proyectos/AgenciasNew/SQL/Actualizador/Actualizador.sql) y [`ActualizadorSERVER.sql`](file:///f:/Proyectos/AgenciasNew/SQL/Actualizador/ActualizadorSERVER.sql).

---

## 3. Regla Crítica: Uso de LEFT JOIN en Funciones de Consulta PostgreSQL

Al escribir o modificar funciones SQL de listado e historial (`fnCotizacionListar`, `fnCotizacionHistorial`, `fnRoleListar`, etc.):

1. **Usar siempre `LEFT JOIN` para tablas relacionables** (`public."Client"`, `public."User"`, `public."Branch"`, `public."Provider"`, `public."Prestadora"`).
2. **NUNCA usar `INNER JOIN` (`JOIN`) en la tabla `Client` o `User`**. 
   - *Causa*: Si una cotización tiene `clientId` nulo o no asignado, un `INNER JOIN` descarta la fila por completo.
   - *Síntoma*: La interfaz muestra **"Total cotizaciones: 0"** en el historial (`/dashboard/quotations/history`), aunque los registros existan en la tabla `Quotation`.
3. **Manejo seguro de Nulos**: Usar `COALESCE` en todas las columnas calculadas.
