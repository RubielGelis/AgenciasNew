---
name: nextjs-management
description: Workflows for Next.js, TypeScript and Prisma in AgenciasNew, including database pulling, client generation, and server management
---

# Gestión y Desarrollo en Next.js y Prisma - AgenciasNew

Esta guía contiene los runbooks y flujos para administrar el backend y frontend de Next.js.

---

## 1. Sincronización del Schema de Base de Datos (Prisma)

Si realizas cambios en las tablas de PostgreSQL local, debes sincronizar el esquema del ORM Prisma para que TypeScript reconozca las nuevas columnas y relaciones:

1. **Pull del esquema de la Base de Datos**:
   ```bash
   npx prisma db pull
   ```
2. **Generar el Cliente Prisma actualizado**:
   ```bash
   npx prisma generate
   ```

---

## 2. Iniciar y Detener el Servidor Next.js

El sitio corre localmente por defecto en el puerto **`3001`**.

### Iniciar el Servidor:
Puedes ejecutar el script por lotes provisto en el proyecto:
```bash
iniciar-next.bat
```
O iniciarlo manualmente desde la consola:
```bash
npm run start -- -p 3001
```

### Detener el Servidor (Bajar el sitio):
Si el servidor corre en segundo plano y el puerto `3001` está ocupado, podemos liberar el puerto localizando y matando el proceso de Node.js correspondiente:
1. Buscar el PID del proceso escuchando en el puerto `3001`:
   ```cmd
   netstat -ano | findstr :3001
   ```
2. Finalizar el proceso por PID utilizando `wmic` para omitir limitaciones de privilegios de usuario estándar:
   ```cmd
   cmd.exe /c wmic process where ProcessID=<PID> delete
   ```

---

## 3. Checklist Obligatorio al Crear o Modificar Maestros (`src/app/dashboard/settings/page.tsx`)

> [!IMPORTANT]
> **PREVENCIÓN DE ERRORES DE INTERFAZ (BOTÓN INCORRECTO / MODAL DESCUADRADO / ENDPOINT INCORRECTO)**:
> Cada vez que se agregue o modifique un Maestro en `/dashboard/settings`, se DEBE verificar la presencia del tab en las siguientes **10 ubicaciones clave** de `src/app/dashboard/settings/page.tsx`:

1. **Unión de Tipos (`type Tab = ...`)**: Incluir el identificador exacto del tab (ej. `'tipos-proveedores'`).
2. **Botonera de Pestañas (`TabButton`)**: Registrar el tab con un ícono monocromático limpio (sin clases de colores aislados).
3. **Consulta de Datos (`fetchActiveTabData`)**: Incluir el endpoint `/api/...` correspondiente en el `switch (tab)`.
4. **Estado Inicial del Formulario (`handleOpenModal`)**: Definir la estructura por defecto de `setFormData({ ... })` al presionar `+ Nuevo...`.
5. **Resolución de Endpoint de Guardado (`handleSubmit`)**: Mapear `activeTab === '...' ? '/api/endpoint' :` en la variable `endpoint`.
6. **Resolución de Endpoint de Eliminación (`handleDelete`)**: Mapear `activeTab === '...' ? '/api/endpoint' :` en la variable `endpoint`.
7. **Título del Encabezado Modal (`formData.id ? 'Editar' : 'Nuevo'`)**: Incluir la etiqueta de texto visible (ej. `activeTab === 'tipos-proveedores' ? 'Tipo de Proveedor' :`).
8. **Texto del Botón Principal (`+ Nuevo...`)**: Incluir el texto del botón (ej. `activeTab === 'tipos-proveedores' ? 'Nuevo Tipo de Proveedor' :`).
9. **Placeholder de Búsqueda (`Buscar en...`)**: Incluir el nombre del maestro en el placeholder.
10. **Renderizado de Filas y Modal**: Verificar los campos `<th />`, `<td />` y las cajas de texto dentro del modal.

