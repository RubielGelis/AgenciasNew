<#
.SYNOPSIS
    Script Automatizado para desplegar AgenciasNew en IIS.
    NOTA: Requiere ser ejecutado como Administrador. IIS y "URL Rewrite" deben estar preinstalados.
#>

Write-Host "Iniciando instalación y despliegue del proyecto..." -ForegroundColor Cyan

# 1. Compilar Next.js en Modo Standalone
Write-Host "1. Compilando aplicación Next.js... (Esto puede tardar varios minutos)" -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: La compilación de NPM falló." -ForegroundColor Red
    exit 1
}

# 2. Configurar la carpeta Standalone (producción optimizada)
Write-Host "2. Preparando directorios Standalone..." -ForegroundColor Yellow
$StandalonePath = ".\.next\standalone"

# Next.jsStandalone requiere la copia manual de /public y /.next/static según documentación oficial
if (Test-Path "$StandalonePath\public") { Remove-Item "$StandalonePath\public" -Recurse -Force }
if (Test-Path "$StandalonePath\.next\static") { Remove-Item "$StandalonePath\.next\static" -Recurse -Force }

Copy-Item ".\public" -Destination "$StandalonePath\public" -Recurse -Force
Copy-Item ".\.next\static" -Destination "$StandalonePath\.next\static" -Recurse -Force

# Colocar el archivo `.env` o la app fallará en conexión de BD si prisma necesita URL
# En este caso asumimos que el administrador validará variables de entorno.
if (Test-Path ".\.env") {
    Copy-Item ".\.env" -Destination "$StandalonePath\.env" -Force
}

# 3. Trasladar el ruteo de IIS
Write-Host "3. Agregando Web.Config para Proxy Inverso al entorno nativo..." -ForegroundColor Yellow
Copy-Item ".\deploy\web.config" -Destination "$StandalonePath\web.config" -Force

# 4. Crear o Reiniciar el Servicio Oculto de Windows (node-windows)
Write-Host "4. Instalando Servicio de Windows AgenciasNew_NextJS..." -ForegroundColor Yellow
# Usamos Node para ejecutar nuestro archivo instalador
node .\deploy\install-service.js

Write-Host "--------------------------------------------------------" -ForegroundColor Green
Write-Host "¡Despliegue Configurado con Éxito!" -ForegroundColor Green
Write-Host "1. El servicio 'AgenciasNew_NextJS' ya está encendido en el puerto 3000 de forma invisible."
Write-Host "2. Para activarlo en IIS, debes crear un 'Nuevo Sitio Web' apuntando físicamente a la ruta completa de la carpeta: .next\standalone"
Write-Host "3. IIS usará automáticamente el Web.Config allí colocado para redirigir tráfico 80/443."
Write-Host "(Nota: Requiere que IIS tenga instalado el módulo 'URL Rewrite / ARR')"
Write-Host "--------------------------------------------------------" -ForegroundColor Green
