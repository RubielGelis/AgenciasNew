@echo off
echo ========================================================
echo   SINCRONIZANDO CAMBIOS LOCALES EN BASE DE DATOS
echo ========================================================
echo.

node "%~dp0deploy\apply_local_db.js"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Hubo fallos durante la sincronización de base de datos.
    pause
    exit /b %errorlevel%
)
echo.
echo Sincronizacion completada con exito.
pause
