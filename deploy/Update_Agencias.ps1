<#
.SYNOPSIS
    Script de Actualización Silenciosa para AgenciasNew.
    Detiene el servicio, actualiza la base de datos, y reinicia el servicio.
#>

$TargetDir = $PSScriptRoot
Write-Output "$(Get-Date) - Iniciando actualización..." >> "$TargetDir\install_log.txt"

# 1. VALIDAR/DETENER EL SERVICIO EXISTENTE
if (Get-Service -Name "AgenciasNew_NextJS" -ErrorAction SilentlyContinue) {
    Write-Output "Deteniendo el servicio anterior..." >> "$TargetDir\install_log.txt"
    Stop-Service -Name "AgenciasNew_NextJS" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# 2. EXTRAER CONFIG DE LA DB DEL .ENV EXISTENTE
$EnvFile = "$TargetDir\.env"
$DbUrl = ""
if (Test-Path $EnvFile) {
    $EnvContent = Get-Content $EnvFile
    foreach ($line in $EnvContent) {
        if ($line -match '^DATABASE_URL="(.*)"') { $DbUrl = $matches[1] }
    }
}

if ($DbUrl) {
    # Parsed variables from URL: postgresql://USER:PASS@HOST:PORT/DB
    $PgUser = ""; $PgPass = ""; $PgHost = ""; $PgPort = "5432"; $PgDb = "agencias_new"
    if ($DbUrl -match '^postgresql://([^:]+):([^@]*)@([^:]+):([0-9]+)/([^?]+)') {
        $PgUser = $matches[1]
        $PgPass = $matches[2]
        $PgHost = $matches[3]
        $PgPort = $matches[4]
        $PgDb = $matches[5]
    }
    
    # Ejecutar actualizador de base de datos
    if (Test-Path ".\db_installer.js") {
        Write-Output "Actualizando esquema y procedimientos almacenados en la BD..." >> "$TargetDir\install_log.txt"
        node .\db_installer.js $PgHost $PgPort $PgDb $PgUser $PgPass >> "$TargetDir\install_log.txt" 2>&1
    }
} else {
    Write-Output "[ADVERTENCIA] No se encontró el archivo .env o la DATABASE_URL para actualizar la DB." >> "$TargetDir\install_log.txt"
}

# 3. REINICIAR EL SERVICIO
if (Get-Service -Name "AgenciasNew_NextJS" -ErrorAction SilentlyContinue) {
    Write-Output "Iniciando servicio con los nuevos archivos..." >> "$TargetDir\install_log.txt"
    Start-Service -Name "AgenciasNew_NextJS" -ErrorAction SilentlyContinue
} else {
    # Si por alguna razón no existiera el servicio, intentar instalarlo
    if (Test-Path ".\install-service.js") {
        node .\install-service.js >> "$TargetDir\install_log.txt" 2>&1
        Start-Service -Name "AgenciasNew_NextJS" -ErrorAction SilentlyContinue
    }
}

Write-Output "$(Get-Date) - Actualización completada con éxito." >> "$TargetDir\install_log.txt"
