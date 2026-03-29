var Service = require('node-windows').Service;
var path = require('path');

// Crea el objeto del nuevo servicio
var svc = new Service({
  name: 'AgenciasNew_NextJS',
  description: 'Servicio backend de Next.js para el proyecto AgenciasNew ejecutándose en Standalone Mode.',
  // El entry point de Next-standalone es un archivo 'server.js' en la carpeta compilada
  script: path.join(__dirname, '..', '.next', 'standalone', 'server.js'),
  env: [
    {
      name: "PORT",
      value: 3000 // Escuchará internamente en 3000. IIS enrutará el puerto 80 a este.
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
  console.log('El servicio está ejecutándose de forma persistente. (Puerto 3000)');
});

// Instalar el servicio
svc.install();
