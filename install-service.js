var Service = require('node-windows').Service;
var path = require('path');

var fs = require('fs');

// Verifica la ubicación de server.js
var scriptPath = path.join(__dirname, 'server.js');
if (!fs.existsSync(scriptPath)) {
    scriptPath = path.join(__dirname, '..', '.next', 'standalone', 'server.js');
}

// Crea el objeto del nuevo servicio
var svc = new Service({
  name: 'AgenciasNew_NextJS',
  description: 'Servicio backend de Next.js para el proyecto AgenciasNew ejecutándose en Standalone Mode.',
  // El entry point de Next-standalone es un archivo 'server.js' en la carpeta compilada
  script: scriptPath,
  workingDirectory: __dirname, // Fuerza a que la ruta de ejecución sea desde la carpeta del sitio publicado en IIS
  env: [
    {
      name: "PORT",
      value: 3001 // Internal port for Next.js. IIS proxies from 3000 to this internal port.
    },
    {
      name: "NODE_ENV",
      value: "production"
    }
  ]
});

// Escucha eventos del instalador
svc.on('install', function() {
  console.log('Servicio instalado en Windows Exitosamente!');
  svc.start();
});

svc.on('alreadyinstalled', function() {
  console.log('El servicio ya se encuentra instalado. Intentando reiniciar...');
  svc.restart();
});

svc.on('start', function() {
  console.log('El servicio está ejecutándose de forma persistente internamente en el puerto 3001');
});

// Instalar el servicio
svc.install();
