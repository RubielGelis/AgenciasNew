---
name: post-development-test
description: Guía y flujo de trabajo para desplegar y verificar cambios locales en base de datos y sitio Next.js tras finalizar un desarrollo.
---

# Flujo de Despliegue y Pruebas Post-Desarrollo

Este Skill provee las instrucciones necesarias para desplegar cambios de base de datos Postgres, validar tipos de TypeScript, actualizar Prisma ORM y arrancar el servidor Next.js localmente para asegurar el correcto funcionamiento del desarrollo.

## Flujo de Trabajo

### Paso 1: Desplegar Procedimientos Almacenados y Funciones
Cada vez que se modifique o cree una función o procedimiento almacenado SQL (en la carpeta `SQL/Function` o `SQL/SP`), se debe ejecutar el actualizador correspondiente en la base de datos de pruebas local.
- **Script actualizador**: Ejecuta el siguiente comando para compilar e inyectar las funciones y procedimientos almacenados en la base de datos PostgreSQL activa:
  ```powershell
  node scratch/deploy_both_sps.js
  ```

### Paso 2: Sincronizar Prisma ORM (Si hay cambios en tablas/columnas)
Si el desarrollo implicó modificaciones en la estructura de tablas o columnas de la base de datos de Postgres:
1. Sincroniza el esquema local de Prisma con la base de datos:
   ```powershell
   npx prisma db pull
   ```
2. Regenera el cliente de Prisma para TypeScript:
   ```powershell
   npx prisma generate
   ```

### Paso 3: Validar Compilación y Tipado de TypeScript
Antes de dar por concluido un desarrollo, realiza una validación rigurosa de errores de tipado e importación en Next.js:
- **Verificación rápida**:
  ```powershell
  node node_modules/typescript/bin/tsc --noEmit
  ```
- **Verificación completa (Build)**:
  ```powershell
  npm run build
  ```

### Paso 4: Levantar y Probar el Sitio Localmente
Para probar el sitio web Next.js con los cambios aplicados:
1. Corre el script de inicio completo para producción local en el puerto `3001`:
   ```powershell
   cmd /c iniciar-next.bat
   ```
2. Alternativamente, para desarrollo rápido y depuración en caliente, inicia Next.js en modo desarrollo:
   ```powershell
   npm run dev
   ```
3. Realiza las pruebas manuales ingresando a: `http://localhost:3000/dashboard` o `http://localhost:3001/dashboard` según el modo seleccionado.
