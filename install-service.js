var Service = require('node-windows').Service;
var path = require('path');
var fs = require('fs');

// Verifica la ubicación de server.js
var scriptPath = path.join(__dirname, 'server.js');
if (!fs.existsSync(scriptPath)) {
    scriptPath = path.join(__dirname, '..', '.next', 'standalone', 'server.js');
}

// Leer puerto dinámicamente desde el archivo .env si existe
var port = 3001;
try {
  var envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    var envContent = fs.readFileSync(envPath, 'utf8');
    var match = envContent.match(/PORT\s*=\s*["']?(\d+)["']?/i);
    if (match) {
      port = parseInt(match[1], 10);
    }
  }
} catch (e) {
  console.error("No se pudo leer el puerto desde .env, usando 3001 como default:", e.message);
}

// Crea el objeto del nuevo servicio
var svc = new Service({
  name: 'Korex_NextJS',
  description: 'Servicio backend de Next.js para el proyecto Korex ejecutándose en Standalone Mode.',
  // El entry point de Next-standalone es un archivo 'server.js' en la carpeta compilada
  script: scriptPath,
  workingDirectory: __dirname, // Fuerza a que la ruta de ejecución sea desde la carpeta del sitio publicado en IIS
  env: [
    {
      name: "PORT",
      value: port
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
  console.log('El servicio está ejecutándose de forma persistente internamente en el puerto ' + port);
});

// Instalar el servicio
svc.install();
