@echo off
echo ========================================================
echo   GENERANDO ENSAMBLADO Y PROGRAMA DE ACTUALIZACION (LITE)
echo ========================================================
echo.

echo Paso 1: Ejecutando script de empaquetado (Next.js)...
powershell.exe -ExecutionPolicy Bypass -File "F:\Proyectos\AgenciasNew\deploy\Generar_Empaquetado.ps1"
if %errorlevel% neq 0 (
    echo Error durante el empaquetado.
    pause
    exit /b %errorlevel%
)
echo.

echo Paso 2: Buscando Inno Setup y compilando actualizador...
set "ISCC_PATH="
if exist "%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe" set "ISCC_PATH=%ProgramFiles(x86)%\Inno Setup 6\ISCC.exe"
if exist "%ProgramFiles%\Inno Setup 6\ISCC.exe" set "ISCC_PATH=%ProgramFiles%\Inno Setup 6\ISCC.exe"
if exist "%ProgramFiles(x86)%\Inno Setup 5\ISCC.exe" set "ISCC_PATH=%ProgramFiles(x86)%\Inno Setup 5\ISCC.exe"
if exist "%ProgramFiles%\Inno Setup 5\ISCC.exe" set "ISCC_PATH=%ProgramFiles%\Inno Setup 5\ISCC.exe"
if exist "C:\Inno Setup 6\ISCC.exe" set "ISCC_PATH=C:\Inno Setup 6\ISCC.exe"
if exist "C:\Users\rubie\AppData\Local\Programs\Inno Setup 6\ISCC.exe" set "ISCC_PATH=C:\Users\rubie\AppData\Local\Programs\Inno Setup 6\ISCC.exe"

if "%ISCC_PATH%"=="" (
    echo Error: No se pudo encontrar Inno Setup ^(ISCC.exe^) en las rutas comunes.
    echo Por favor, instala Inno Setup o compila el archivo .iss manualmente haciendo clic derecho sobre el y seleccionando "Compile".
    pause
    exit /b 1
)

echo Usando compilador en: "%ISCC_PATH%"
"%ISCC_PATH%" "F:\Proyectos\AgenciasNew\deploy\AgenciasNew_Update.iss"
if %errorlevel% neq 0 (
    echo Error compilando actualizador de Inno Setup.
    pause
    exit /b %errorlevel%
)
echo.

echo ========================================================
echo   EXITO: Actualizador generado en la carpeta: Instalador (update_setup.exe)
echo ========================================================
pause
