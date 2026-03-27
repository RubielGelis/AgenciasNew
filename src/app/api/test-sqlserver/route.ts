import { NextResponse } from 'next/server';
import { getSQLServerConnection } from '@/lib/sqlserver';
import prisma from '@/lib/prisma';

const SQL_PARAM_CODES = [
  'ServidorSQLServer',
  'UsuarioSQLServer',
  'ClaveSQLServer',
  'BaseSQLServer',
  'PuertoSQLServer',
];

export async function GET() {
  const start = Date.now();

  // 1. Leer parámetros actuales desde SystemParameter
  const params = await prisma.systemParameter.findMany({
    where: { code: { in: SQL_PARAM_CODES } },
    select: { code: true, name: true, value: true },
    orderBy: { code: 'asc' },
  });

  // Ocultar la clave
  const paramsSafe = params.map(p => ({
    ...p,
    value: p.code === 'ClaveSQLServer' ? (p.value ? '***' : '(vacío)') : p.value || '(vacío)',
  }));

  // 2. Probar conexión
  try {
    const pool = await getSQLServerConnection();
    const result = await pool.request().query(
      'SELECT @@VERSION AS version, DB_NAME() AS db, @@SERVERNAME AS server_name'
    );
    await pool.close();

    const row = result.recordset[0];
    return NextResponse.json({
      success: true,
      message: '✅ Conexión a SQL Server exitosa',
      parametros: paramsSafe,
      conexion: {
        db: row.db,
        server_name: row.server_name,
        version: row.version?.split('\n')[0],
      },
      elapsed_ms: Date.now() - start,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: '❌ Error al conectar con SQL Server',
        parametros: paramsSafe,
        error: err.message,
        code: err.code,
        detail: err.originalError?.message,
        elapsed_ms: Date.now() - start,
      },
      { status: 500 }
    );
  }
}
