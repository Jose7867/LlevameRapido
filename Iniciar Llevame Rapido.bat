@echo off
cd /d "%~dp0"
curl.exe --silent --fail http://127.0.0.1:8080/ -o nul
if not errorlevel 1 (
  echo La pagina ya esta en ejecucion.
  echo Enlace para ingresar: http://127.0.0.1:8080/
  start "" "http://127.0.0.1:8080/"
  pause
  exit /b 0
)
where node >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js. Instala Node.js y vuelve a ejecutar este archivo.
  echo Descarga: https://nodejs.org/
  pause
  exit /b 1
)
node "%~dp0server.js"
if errorlevel 1 pause
