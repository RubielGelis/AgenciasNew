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
   wmic process where ProcessID=<PID> delete
   ```
