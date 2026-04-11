@echo off
title Servidor Produccion Next.js
cd /d "%~dp0"

echo ===========================================
echo   ARRANCANDO SERVIDOR AGENCIA (PRODUCCION)
echo ===========================================
echo.

call npm run start

echo.
echo ===========================================
echo  EL SERVIDOR SE HA DETENIDO
echo ===========================================
pause