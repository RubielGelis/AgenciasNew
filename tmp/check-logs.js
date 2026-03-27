const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLastLogs() {
  try {
    console.log('--- BUSCANDO ÚLTIMOS LOGS DE EXPORTACIÓN ---');
    const logs = await prisma.systemLog.findMany({
      where: { module: 'QUOTATION' },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    if (logs.length === 0) {
      console.log('No se encontraron logs recientes para el módulo QUOTATION.');
    } else {
      logs.forEach(log => {
        console.log(`[${log.createdAt.toISOString()}] ${log.action}: ${log.description}`);
        if (log.metadata) console.log('Metadata:', JSON.stringify(log.metadata, null, 2));
        console.log('---');
      });
    }
  } catch (err) {
    console.error('Error al leer logs:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLastLogs();
