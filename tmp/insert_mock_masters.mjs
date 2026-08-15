import pg from 'pg';
import mssql from 'mssql';

const pgClient = new pg.Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await pgClient.connect();
const cfgRes = await pgClient.query('SELECT * FROM "fnGetSQLServerConfig"()');
const cfg = cfgRes.rows[0];
await pgClient.end();

await mssql.connect({
  server: cfg.servidor, database: cfg.base_datos,
  user: cfg.usuario, password: cfg.clave,
  port: cfg.puerto ? parseInt(cfg.puerto) : 1433,
  options: { encrypt: false, trustServerCertificate: true }
});

console.log('Insertando datos de prueba en tablas maestras reales con columnas correctas...');
await mssql.query(`
  -- Cliente
  IF NOT EXISTS (SELECT 1 FROM dbo.CLIENTES WHERE IDCLIENTE = '901631TBK')
    INSERT INTO dbo.CLIENTES (IDCLIENTE, IDTERCERO, RAZONCIAL, DIRECCION, TELEFONO, CIUDAD, EMAIL)
    VALUES ('901631TBK', '901631TBK', 'MOCK CLIENT S.A.', 'Calle Falsa 123', '555-1234', 'BOGOTA', 'test@client.com');

  -- Vendedor
  IF NOT EXISTS (SELECT 1 FROM dbo.MAEVENDE WHERE IDVENDE = '103')
    INSERT INTO dbo.MAEVENDE (IDVENDE, NOMBVENDE, DIRECCION, TELEFONO, CIUDAD)
    VALUES ('103', 'MOCK VENDEDOR', 'Calle Falsa 123', '555-4321', 'BOGOTA');

  -- Tiqueteador
  IF NOT EXISTS (SELECT 1 FROM dbo.Tiqueteadores WHERE cd_codigo = '103')
    INSERT INTO dbo.Tiqueteadores (cd_codigo, ds_nombre, bl_inactivo)
    VALUES ('103', 'MOCK TIQUETEADOR', 0);

  -- Proveedor de Servicio (desde el XML de cotizacion 3 es 'TBK')
  IF NOT EXISTS (SELECT 1 FROM dbo.PROVEEDORES WHERE IDPROVE = 'TBK')
    INSERT INTO dbo.PROVEEDORES (IDPROVE, IDTERCERO, RAZONCIAL, DIRECCION, TELEFONO, CIUDAD)
    VALUES ('TBK', 'TBK', 'MOCK PROVEEDOR SERVICES', 'Calle Real 456', '555-8888', 'BOGOTA');

  -- Sucursal
  IF NOT EXISTS (SELECT 1 FROM dbo.Sucursales WHERE cd_codigo = '01')
    INSERT INTO dbo.Sucursales (cd_codigo, ds_nombre, bl_inactivo)
    VALUES ('01', 'SUCURSAL PRINCIPAL', 0);

  -- Forma de Pago Efectivo (cd_codigo 'Efectivo')
  IF NOT EXISTS (SELECT 1 FROM dbo.FormasPago WHERE cd_codigo = 'Efectivo')
    INSERT INTO dbo.FormasPago (cd_codigo, ds_nombre, bl_inactivo)
    VALUES ('Efectivo', 'Efectivo', 0);
`);
console.log('Datos de prueba insertados exitosamente!');
await mssql.close();
