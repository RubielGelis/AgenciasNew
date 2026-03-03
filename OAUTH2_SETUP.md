# Guía de Configuración OAuth2 para Outlook/MSN

Para que la aplicación pueda enviar correos de forma segura, necesitamos configurar OAuth2. Sigue estos pasos:

## 1. Crear el Registro de Aplicación en Azure
1. Ve al [Portal de Aplicaciones de Microsoft Azure](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade).
2. Haz clic en **Nueva solicitud** (New Registration).
3. **Nombre**: `AgenciasNew-Email`.
4. **Tipos de cuenta**: *"Cuentas en cualquier directorio organizativo y cuentas Microsoft personales"* (**MUY IMPORTANTE**).
5. **URI de redirección**: Elige **Web** y pon: `http://localhost:3000`.
6. Haz clic en **Registrar**.

## 2. Obtener Credenciales
1. Copia el **ID de aplicación (cliente)** y pégalo en el archivo `.env` en `SMTP_CLIENT_ID`.
2. Ve a **Certificados y secretos** > **Nuevo secreto de cliente**.
3. Copia el **Valor** del secreto y pégalo en `.env` en `SMTP_CLIENT_SECRET`.

## 3. Configurar Permisos
1. Ve a **Permisos de API** > **Agregar un permiso**.
2. Selecciona **Microsoft Graph** > **Permisos delegados**.
3. Busca y marca: `SMTP.Send`, `Mail.Send` y `offline_access`.
4. Haz clic en **Agregar permisos**.

## 4. Obtener el Refresh Token
Para obtener el `SMTP_REFRESH_TOKEN`, he creado un script sencillo en tu proyecto.
Ejecución:
1. Abre tu terminal.
2. Ejecuta: `node src/scripts/auth-outlook.js` (Te daré el código de este script a continuación).

---
**Cuando tengas el Client ID y el Client Secret, envíamelos o pégalos en el .env.**
