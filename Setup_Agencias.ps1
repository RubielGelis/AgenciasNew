<#
.SYNOPSIS
    Instalador Todo En Uno para el Cliente Final.
    Instala Node.js, Módulos IIS, copia archivos al directorio elegido, e inicia los servicios de Postgres y WebServer.
#>
param([switch]$Elevated)

if (-not $Elevated) {
    if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Host "Elevando privilegios..."
        Start-Process PowerShell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Elevated" -Verb RunAs
        exit
    }
}

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "    ASISTENTE DE INSTALACION: AgenciasNew Platform    " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# Petición de Variables Principales
$TargetDir = Read-Host "1. Ingrese Directorio de Instalacion (Ej: C:\AgenciasNew_Sistema) " 
if (-not $TargetDir) { $TargetDir = "C:\AgenciasNew_Sistema" }

Write-Host "`n-- CONFIGURACIÓN DE BASE DE DATOS POSTGRESQL --" -ForegroundColor Yellow
$PgHost = Read-Host "2. Servidor de BD [localhost] "
if (-not $PgHost) { $PgHost = "localhost" }
$PgPort = Read-Host "3. Puerto BD [5432] "
if (-not $PgPort) { $PgPort = "5432" }
$PgDb = Read-Host "4. Nombre de BD [agencias_new] "
if (-not $PgDb) { $PgDb = "agencias_new" }
$PgUser = Read-Host "5. Usuario BD [postgres] "
if (-not $PgUser) { $PgUser = "postgres" }
$PgPass = Read-Host "6. Clave BD [] "

# Generar Variables Derivadas
$CurrentDir = $PSScriptRoot
$SitePort = 3000
$SiteName = "AgenciasNew"

# 1. VERIFICAR INSTALAR NODE.JS (Si no existe, se instala en Modo Silencioso)
Write-Host "`n[-] Comprobando dependencias del sistema (Node.js)..." -ForegroundColor Gray
try {
    $nodeVer = node -v
    Write-Host "    [OK] Node detectado: $nodeVer." -ForegroundColor Green
} catch {
    Write-Host "    [!] Node.js no encontrado. Descargando instalador silencioso..." -ForegroundColor Yellow
    $NodeUrl = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi"
    $NodeMsi = "$env:TEMP\node.msi"
    Invoke-WebRequest -Uri $NodeUrl -OutFile $NodeMsi
    Write-Host "    [i] Instalando Node.js (Esto puede demorar unos minutos)..." -ForegroundColor Yellow
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$NodeMsi`" /qn /norestart" -Wait -NoNewWindow
    [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\nodejs\", [EnvironmentVariableTarget]::Machine)
    $env:Path += ";C:\Program Files\nodejs\"
    Write-Host "    [OK] Node.js Instalado Core." -ForegroundColor Green
}

# 2. INSTALAR MODULOS DE IIS Y PROXY
Write-Host "`n[-] Comprobando Módulos del Servidor IIS (ARR / Rewrite)..." -ForegroundColor Gray
$RewriteMsi = "$env:TEMP\rewrite_amd64.msi"
$ArrMsi = "$env:TEMP\requestRouter_amd64.msi"

if (!(Test-Path $RewriteMsi)) { Invoke-WebRequest -Uri "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_es-ES.msi" -OutFile $RewriteMsi }
if (!(Test-Path $ArrMsi)) { Invoke-WebRequest -Uri "https://download.microsoft.com/download/E/9/8/E9849D6A-020E-47E4-9FD0-A023E99B54EB/requestRouter_amd64.msi" -OutFile $ArrMsi }

Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$RewriteMsi`" /qn /norestart" -Wait -NoNewWindow
Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$ArrMsi`" /qn /norestart" -Wait -NoNewWindow

$AppCmd = "$env:windir\system32\inetsrv\appcmd.exe"
if (Test-Path $AppCmd) {
    & $AppCmd set config -section:system.webServer/proxy /enabled:"True" /commit:apphost | Out-Null
}

# 3. MOVER ARCHIVOS AL DIRECTORIO DESTINO
Write-Host "`n[-] Instalando sistema en $TargetDir..." -ForegroundColor Gray
if (!(Test-Path $TargetDir)) { New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null }
Copy-Item "$CurrentDir\*" -Destination $TargetDir -Recurse -Force | Out-Null

# 4. CONFIGURAR VARIABLES DE ENTORNO DESTINO (.env)
$DatabaseUrl = "postgresql://$($PgUser):$($PgPass)@$($PgHost):$($PgPort)/$($PgDb)?schema=public"
$EnvPath = "$TargetDir\.env"
$EnvContent = "DATABASE_URL=`"$DatabaseUrl`"`nNEXTAUTH_SECRET=`"AgenciasProductionSecretKey2024_Security`"`nNEXTAUTH_URL=`"http://localhost:$SitePort`"`n"
Set-Content -Path $EnvPath -Value $EnvContent -Encoding UTF8

# 5. ACTUALIZAR/CREAR BASE DE DATOS
Write-Host "`n[-] Inyectando Estructuras Maestras en PostgreSQL..." -ForegroundColor Gray
Set-Location $TargetDir
# Ejecutar nodo instalador DB
node .\db_installer.js $PgHost $PgPort $PgDb $PgUser $PgPass
if ($LASTEXITCODE -ne 0) {
    Write-Host "    [1] Hubo advertencias o errores en la inyección SQL. Verifique logs." -ForegroundColor Yellow
} else {
    Write-Host "    [OK] Base de datos estructurada con éxito." -ForegroundColor Green
}

# 6. INSTALAR SERVICIO DE WINDOWS
Write-Host "`n[-] Creando servicio oculto del sistema operativo (Motor Background)..." -ForegroundColor Gray
if (Get-Service -Name "AgenciasNew_NextJS" -ErrorAction SilentlyContinue) {
    Stop-Service -Name "AgenciasNew_NextJS" -Force -ErrorAction SilentlyContinue 
    sc.exe delete "AgenciasNew_NextJS" | Out-Null
    Start-Sleep -Seconds 2
}

if (Test-Path "$TargetDir\daemon") {
    Write-Host "    Limpiando cache del servicio anterior..." -ForegroundColor DarkGray
    Remove-Item "$TargetDir\daemon" -Recurse -Force -ErrorAction SilentlyContinue
}

node .\install-service.js | Out-Null

# Garantizar que el servicio quede registrado llamando directamente a winsw si node-windows falló por no-interactividad
Start-Sleep -Seconds 2
if (!(Get-Service -Name "AgenciasNew_NextJS" -ErrorAction SilentlyContinue)) {
    Write-Host "    Registrando servicio de Windows mediante winsw..." -ForegroundColor Gray
    if (Test-Path "$TargetDir\daemon\agenciasnew_nextjs.exe") {
        Start-Process -FilePath "$TargetDir\daemon\agenciasnew_nextjs.exe" -ArgumentList "install" -Wait -NoNewWindow
        Start-Sleep -Seconds 2
    }
}

# Forzar el arranque del servicio si no está iniciado
if (Get-Service -Name "AgenciasNew_NextJS" -ErrorAction SilentlyContinue) {
    $svcStatus = (Get-Service -Name "AgenciasNew_NextJS").Status
    if ($svcStatus -ne 'Running') {
        Write-Host "    Iniciando servicio de Windows..." -ForegroundColor Gray
        Start-Service -Name "AgenciasNew_NextJS" -ErrorAction SilentlyContinue
    }
}

# 7. PUBLICAR SITIO IIS
Write-Host "`n[-] Configurando Portal en Internet Information Services..." -ForegroundColor Gray
Import-Module WebAdministration 

if (Get-Website -Name $SiteName -ErrorAction SilentlyContinue) {
    Stop-Website -Name $SiteName -ErrorAction SilentlyContinue 
    Remove-Website -Name $SiteName -Force -Confirm:$false -ErrorAction SilentlyContinue
    Remove-Item "IIS:\Sites\$SiteName" -Recurse -Force -ErrorAction SilentlyContinue
}
New-Website -Name $SiteName -PhysicalPath $TargetDir -Port $SitePort -Force | Out-Null
Start-Website -Name $SiteName -ErrorAction SilentlyContinue | Out-Null

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host " ¡INSTALACIÓN COMPLETADA! " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host "- Url Servidor Local (IIS): http://localhost:$SitePort/" 
Write-Host "- Todos los servicios inician automáticamente con Windows." 
Write-Host "Presione una tecla para salir..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
