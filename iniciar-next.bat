@echo off
title Servidor Next.js

echo ==============================
echo Iniciando servidor Next.js
echo ==============================

cd /d C:\Proyectos\AgenciasNew

IF NOT EXIST package.json (
 echo ERROR: No se encontro package.json
 pause
 exit
)

echo.
echo Instalando dependencias...
call npm install

IF %ERRORLEVEL% NEQ 0 (
 echo Error instalando dependencias
 pause
 exit
)

echo.
echo Compilando proyecto...
call npm run build

IF %ERRORLEVEL% NEQ 0 (
 echo Error en build
 pause
 exit
)

echo.
echo Iniciando servidor Next.js...
npm run start

pause