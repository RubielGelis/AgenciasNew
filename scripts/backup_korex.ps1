# Script de respaldo automático para la base de datos Korex_test
# Generado por Antigravity

$DbName = "Korex_test"
$DbUser = "postgres"
$DbPass = "zzeusagencias"
$DbHost = "localhost"
$DbPort = "5432"

# Carpeta de destino del backup (puedes cambiar esta ruta si prefieres otra)
$BackupDir = "F:\Backups\Korex"

# Asegurar que existe el directorio de respaldos
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Nombre del archivo con marca de tiempo (ej. Korex_test_backup_20260727_230000.backup)
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "${DbName}_backup_${Timestamp}.backup"

# Establecer contraseña en la variable de entorno para pg_dump
$env:PGPASSWORD = $DbPass

# Ruta al ejecutable pg_dump (PostgreSQL 18)
$PgDumpPath = "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe"

# Verificar si el ejecutable existe
if (-not (Test-Path $PgDumpPath)) {
    Write-Error "No se encontró pg_dump.exe en la ruta: $PgDumpPath"
    exit 1
}

# Ejecutar pg_dump
try {
    Write-Host "Iniciando respaldo de la base de datos '$DbName'..."
    & $PgDumpPath -U $DbUser -h $DbHost -p $DbPort -d $DbName -F c -b -v -f $BackupFile
    Write-Host "Respaldo completado exitosamente en: $BackupFile" -ForegroundColor Green
    
    # Limpieza: Mantener solo respaldos de los últimos 15 días
    $DaysToKeep = -15
    $LimitDate = (Get-Date).AddDays($DaysToKeep)
    Get-ChildItem -Path $BackupDir -Filter "${DbName}_backup_*.backup" | Where-Object { $_.CreationTime -lt $LimitDate } | Remove-Item -Force
    Write-Host "Limpieza de respaldos antiguos completada." -ForegroundColor Yellow
} catch {
    Write-Error "Error al realizar el respaldo: $_"
} finally {
    # Eliminar contraseña de las variables de entorno por seguridad
    if (Test-Path env:PGPASSWORD) {
        Remove-Item env:PGPASSWORD
    }
}
