<#
.SYNOPSIS
    Compila y empaqueta el proyecto AgenciasNew para enviarlo al Cliente Final.
    Crea una carpeta limpia "RELEASE" sin código fuente.
#>

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " CONSTRUYENDO PAQUETE DE INSTALACION PARA CLIENTE FINAL " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

$RootDir = "C:\Proyectos\AgenciasNew"
$ReleaseDir = "$RootDir\RELEASE_AGENCIAS"

# 1. Compilar modo Produccion
Set-Location $RootDir
Write-Host "`n[1/5] Compilando el proyecto Next.js en Modo Standalone..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR EN COMPILACION" -ForegroundColor Red
    exit 1
}

# 2. Recrear directorio de Release
Write-Host "`n[2/5] Creando directorio de distribución seguro..." -ForegroundColor Yellow
if (Test-Path $ReleaseDir) { Remove-Item $ReleaseDir -Recurse -Force }
New-Item -ItemType Directory -Path $ReleaseDir | Out-Null
New-Item -ItemType Directory -Path "$ReleaseDir\SQL" | Out-Null

# 3. Copiar sistema Node.js (Standalone)
Write-Host "`n[3/5] Ensamblando Motor (Archivos Binarios)..." -ForegroundColor Yellow
Copy-Item ".\.next\standalone\*" -Destination $ReleaseDir -Recurse -Force
Copy-Item ".\public" -Destination "$ReleaseDir\public" -Recurse -Force
Copy-Item ".\.next\static" -Destination "$ReleaseDir\.next\static" -Recurse -Force

# 4. Copiar Herramientas y SQL
Write-Host "`n[4/5] Ensamblando Assets y Bases de Datos..." -ForegroundColor Yellow
Copy-Item ".\deploy\install-service.js" -Destination $ReleaseDir -Force
Copy-Item ".\deploy\Setup_Agencias.ps1" -Destination $ReleaseDir -Force
Copy-Item ".\deploy\db_installer.js" -Destination $ReleaseDir -Force
Copy-Item ".\deploy\web.config" -Destination $ReleaseDir -Force
# SQL Master
if (Test-Path ".\SQL\Actualizador\Actualizador.SQL") { Copy-Item ".\SQL\Actualizador\Actualizador.SQL" -Destination "$ReleaseDir\SQL" -Force }
if (Test-Path ".\SQL\Data\Inicial.sql") { Copy-Item ".\SQL\Data\Inicial.sql" -Destination "$ReleaseDir\SQL" -Force }

# 5. Instalar librería temporal de PG en Release para el auto-setup
Write-Host "`n[5/5] Inyectando conectores de Postgres al Release..." -ForegroundColor Yellow
Set-Location $ReleaseDir
npm install pg  --no-save --silent | Out-Null
Set-Location $RootDir

Write-Host "`n==========================================================================" -ForegroundColor Green
Write-Host " ¡PAQUETE CONSTRUIDO CON ÉXITO!" -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Green
Write-Host "Puedes encontrar todo el sistema listo para entregar comprimido en la ruta: "
Write-Host "--> $ReleaseDir" -ForegroundColor Cyan
Write-Host "`nInstrucción: Entrega esa carpeta comprimida en ZIP al encargado de IT del cliente."
Write-Host "El encargado solo deberá hacer Clic Derecho y Ejecutar 'Setup_Agencias.ps1'."
