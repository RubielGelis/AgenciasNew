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

## 3. Pruebas de Integración y Diagnóstico

Para validar el flujo completo de exportación de cotizaciones y facturas, puedes hacer uso de los scripts de prueba en `tmp/`:
- **Exportar e importar cotización 3 de Postgres a SQL Server**:
  ```bash
  node tmp/test_q3_full.mjs
  ```
- **Verificar que la cotización e inserciones en SQL Server sean correctas**:
  ```bash
  node tmp/verify_q3_inserted.mjs
  ```
