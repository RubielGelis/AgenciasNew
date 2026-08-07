<#
.SYNOPSIS
    Instalador Silencioso Backend. 
    Usado automáticamente por el setup.exe generado por InnoSetup para montar entorno, DB e IIS sin intervención manual.
#>

$TargetDir = $PSScriptRoot
$SitePort = 3000
$SiteName = "AgenciasNew"

# Optimizar velocidad de descargas desactivando barra de progreso en consola
$ProgressPreference = 'SilentlyContinue'

# 1. VALIDAR / INSTALAR NODE.JS Core
try {
    $nodeVer = node -v
} catch {
    $NodeUrl = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi"
    $NodeMsi = "$env:TEMP\node.msi"
    Invoke-WebRequest -Uri $NodeUrl -OutFile $NodeMsi
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$NodeMsi`" /qn /norestart" -Wait -NoNewWindow
    [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\nodejs\", [EnvironmentVariableTarget]::Machine)
    $env:Path += ";C:\Program Files\nodejs\"
}

# 2. INSTALAR MODULOS DE IIS (ARR / Proxy)
$RewriteMsi = "$env:TEMP\rewrite_amd64.msi"
$ArrMsi = "$env:TEMP\requestRouter_amd64.msi"

# Verificar si URL Rewrite ya está instalado
$RewriteInstalled = Test-Path "$env:SystemRoot\system32\inetsrv\rewrite.dll"
if (-not $RewriteInstalled) {
    if (!(Test-Path $RewriteMsi)) { 
        Invoke-WebRequest -Uri "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_es-ES.msi" -OutFile $RewriteMsi 
    }
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$RewriteMsi`" /qn /norestart" -Wait -NoNewWindow
}

# Verificar si ARR ya está instalado
$ArrInstalled = Test-Path "$env:SystemRoot\system32\inetsrv\requestRouter.dll"
if (-not $ArrInstalled) {
    if (!(Test-Path $ArrMsi)) { 
        Invoke-WebRequest -Uri "https://download.microsoft.com/download/E/9/8/E9849D6A-020E-47E4-9FD0-A023E99B54EB/requestRouter_amd64.msi" -OutFile $ArrMsi 
    }
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$ArrMsi`" /qn /norestart" -Wait -NoNewWindow
}

$AppCmd = "$env:windir\system32\inetsrv\appcmd.exe"
if (Test-Path $AppCmd) {
    & $AppCmd set config -section:system.webServer/proxy /enabled:"True" /commit:apphost | Out-Null
}

# 3. EXTRAER CONFIG DE LA DB (pasada desde el instalador InnoSetup Injected Env)
# The .env file has DATABASE_URL="..." created by InnoSetup
$EnvFile = "$TargetDir\.env"
$DbUrl = ""
if (Test-Path $EnvFile) {
    $EnvContent = Get-Content $EnvFile
    foreach ($line in $EnvContent) {
        if ($line -match '^DATABASE_URL="(.*)"') { $DbUrl = $matches[1] }
    }
}
# Parsed variables from URL: postgresql://USER:PASS@HOST:PORT/DB
$PgUser = ""; $PgPass = ""; $PgHost = ""; $PgPort = "5432"; $PgDb = "agencias_new"
if ($DbUrl -match '^postgresql://([^:]+):([^@]*)@([^:]+):([0-9]+)/([^?]+)') {
    $PgUser = $matches[1]
    $PgPass = $matches[2]
    $PgHost = $matches[3]
    $PgPort = $matches[4]
    $PgDb = $matches[5]
}

# 4. EJECUTAR INSTALADOR Y ESTRUCTURA DE POLIZA DB NATIVA (Postgres)
Set-Location $TargetDir
if (Test-Path ".\db_installer.js") {
    node .\db_installer.js $PgHost $PgPort $PgDb $PgUser $PgPass
}

# 5. INSTALAR SERVICIO DE WINDOWS
Write-Output "$(Get-Date) - Instalando servicio de Node..." >> "$TargetDir\install_log.txt"
if (Get-Service -Name "AgenciasNew_NextJS" -ErrorAction SilentlyContinue) {
    Write-Output "Borrando servicio anterior..." >> "$TargetDir\install_log.txt"
    Stop-Service -Name "AgenciasNew_NextJS" -Force -ErrorAction SilentlyContinue
    sc.exe delete "AgenciasNew_NextJS" | Out-Null
    Start-Sleep -Seconds 2
}

if (Test-Path "$TargetDir\daemon") {
    Write-Output "Limpiando cache del servicio (daemon anterior)..." >> "$TargetDir\install_log.txt"
    Remove-Item "$TargetDir\daemon" -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path ".\install-service.js") {
    node .\install-service.js >> "$TargetDir\install_log.txt" 2>&1
    
    # Garantizar que el servicio quede registrado llamando directamente a winsw si node-windows falló por no-interactividad
    Start-Sleep -Seconds 2
    if (!(Get-Service -Name "AgenciasNew_NextJS" -ErrorAction SilentlyContinue)) {
        Write-Output "El servicio no se registró automáticamente. Registrando mediante winsw..." >> "$TargetDir\install_log.txt"
        if (Test-Path "$TargetDir\daemon\agenciasnew_nextjs.exe") {
            Start-Process -FilePath "$TargetDir\daemon\agenciasnew_nextjs.exe" -ArgumentList "install" -Wait -NoNewWindow >> "$TargetDir\install_log.txt" 2>&1
            Start-Sleep -Seconds 2
        }
    }
    
    # Forzar el arranque del servicio si no está iniciado
    if (Get-Service -Name "AgenciasNew_NextJS" -ErrorAction SilentlyContinue) {
        $svcStatus = (Get-Service -Name "AgenciasNew_NextJS").Status
        if ($svcStatus -ne 'Running') {
            Write-Output "Iniciando servicio AgenciasNew_NextJS..." >> "$TargetDir\install_log.txt"
            Start-Service -Name "AgenciasNew_NextJS" -ErrorAction SilentlyContinue
        }
    }
}

# 6. PUBLICAR SITIO IIS
Write-Output "$(Get-Date) - Configurando IIS Sitio Web..." >> "$TargetDir\install_log.txt"
Import-Module WebAdministration 

if (Get-Website -Name $SiteName -ErrorAction SilentlyContinue) {
    Write-Output "Borrando sitio IIS anterior..." >> "$TargetDir\install_log.txt"
    Stop-Website -Name $SiteName -ErrorAction SilentlyContinue
    Remove-Website -Name $SiteName -Force -Confirm:$false -ErrorAction SilentlyContinue
    Remove-Item "IIS:\Sites\$SiteName" -Recurse -Force -ErrorAction SilentlyContinue
}

try {
    Write-Output "Creando nuevo sitio apuntando a $TargetDir en el puerto $SitePort..." >> "$TargetDir\install_log.txt"
    New-Website -Name $SiteName -PhysicalPath $TargetDir -Port $SitePort -Force >> "$TargetDir\install_log.txt" 2>&1
    Start-Website -Name $SiteName -ErrorAction SilentlyContinue
    Write-Output "Sitio creado e iniciado con éxito." >> "$TargetDir\install_log.txt"
} catch {
    Write-Output "ERROR IIS: $_" >> "$TargetDir\install_log.txt"
}
