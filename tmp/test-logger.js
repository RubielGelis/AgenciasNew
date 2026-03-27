const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Insertando log de prueba...');
    // Probamos insertar directamente con Prisma para ver qué tabla usa
    const newLog = await prisma.systemLog.create({
      data: {
        action: 'DEBUG',
        module: 'SYSTEM',
        description: 'Log de prueba generado por Antigravity para verificar visualización',
        metadata: { test: true }
      }
    });
    console.log('Log insertado correctamente:', newLog.id);

    // Ahora probamos leerlo con el SP
    const logs = await prisma.$queryRawUnsafe('SELECT * FROM sploglistar(10, 0, null, null)');
    console.log('Registros devueltos por sploglistar:', logs.length);
    console.log('Primer registro:', JSON.stringify(logs[0], null, 2));

  } catch (err) {
    console.error('ERROR DETECTADO:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
