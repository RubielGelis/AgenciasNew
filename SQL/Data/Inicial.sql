-- SCRIPT DE DATOS INICIALES - AGENCIAS NEW
-- RUTA: c:\Proyectos\AgenciasNew\SQL\Data\Inicial.sql
-- IDEMPOTENTE: Puede ejecutarse múltiples veces sin errores

-- 1. Rol Admin
INSERT INTO public."Role" (name)
VALUES ('Admin')
ON CONFLICT (name) DO NOTHING;

-- 2. Sucursal
INSERT INTO public."Branch" (code, name)
VALUES ('BOG', 'BOG')
ON CONFLICT (code) DO NOTHING;

-- 3. Clientes, Vendedores, Proveedores y Tiqueteadores
INSERT INTO public."Client" (document, name)
VALUES ('73009263', 'Rubiel')
ON CONFLICT (document) DO NOTHING;

INSERT INTO public."Seller" (code, name, email)
VALUES ('73009263', 'Rubiel', 'rubiel1985@msn.com')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public."Provider" (code, name)
VALUES ('73009263', 'Rubiel')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public."TicketPrinter" (code, name, email)
VALUES ('73009263', 'Rubiel', 'rubiel1985@msn.com')
ON CONFLICT (code) DO NOTHING;

-- 4. Usuario Administrativo (Contraseña: 111985)
INSERT INTO public."User" (email, name, "passwordHash", "roleId", "branchId", "implantId", "ticketPrinterId")
VALUES (
    'rubiel1985@msn.com',
    'Rubiel',
    '$2b$10$IUxxw/yzr2bpC4wRMUcBYOsrIJrG4e0j.FI/p2baH2CGNfKNLbn.S',
    (SELECT id FROM public."Role"          WHERE name = 'Admin'),
    (SELECT id FROM public."Branch"        WHERE code = 'BOG'),
    null,
    (SELECT id FROM public."TicketPrinter" WHERE code = '73009263')
)
ON CONFLICT (email) DO NOTHING;

-- 5. Productos

INSERT INTO public."Product" (code, type, description, "basePrice", cost)
VALUES ('HTL','ALOJAMIENTO', 'Hotel', 0, 0)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public."Product" (code, type, description, "basePrice", cost)
VALUES ('RTA','ALQUILER', 'RestaAuto', 0, 0)
ON CONFLICT (code) DO NOTHING;


-- 6. Cargos e Impuestos
INSERT INTO public."ChargeAndTax" (code, name, type, "valueType", value, "isEditable")
VALUES
    ('TAR',   'TAR',   'CHARGE', 'FIXED',      0,  true),
    ('IVA',   'IVA',   'TAX',    'PERCENTAGE', 19,  true),
    ('OTROS', 'OTROS', 'CHARGE', 'FIXED',       0,  true)
ON CONFLICT (code) DO NOTHING;

-- 7. Parámetros de conectividad SQL Server
INSERT INTO public."SystemParameter" (code, name, value)
VALUES
    ('ServidorSQLServer',                'Host de SQL Server',                           'Rubiel/RUBIEL'),
    ('UsuarioSQLServer',                 'Usuario SQL Server',                           'sa'),
    ('ClaveSQLServer',                   'Contraseña SQL Server',                        '111985*'),
    ('BaseSQLServer',                    'Base de Datos SQL Server',                     'Agencias'),
    ('PuertoSQLServer',                  'Puerto SQL Server',                            ''),
    ('EnviarCotizacionesAutoSQLserver',  'Envío automático a SQL Server (1: Sí, 0: No)', '1'),
	('Pais',                    		 'Pais',                     					 'Colombia')
ON CONFLICT (code) DO UPDATE
    SET name  = EXCLUDED.name,
        value = EXCLUDED.value;

-- 8. Monedas iniciales
INSERT INTO public."Currency" (code, name, "exchangeRate")
VALUES
    ('COP', 'Peso Colombiano',      1.00),
    ('USD', 'Dólar Estadounidense', 4200.00),
    ('EUR', 'Euro',                 4500.00)
ON CONFLICT (code) DO NOTHING;


-- 9. GDS iniciales
INSERT INTO public."GDS" (name)
VALUES
	('SABRE'),
	('AMADEUS'),
	('AEROGAL'),
	('GALILEO'),
	('ZEUS ON LINE (ZOL)'),
	('WEB SERVICE'),
	('KIU'),
	('IdeasFractal'),
	('SparkCopa')
ON CONFLICT (name) DO NOTHING;

-- 10. Interfaces iniciales


INSERT INTO public."Interfaces" (code, name, "inactivo", "bl_genera_archivoplano", "ds_storedprocedure_archivoplano", "bl_job", "ds_namejob" ,"bl_facturador", "id_gds")
VALUES
    ('SABRE', 'SABRE', true, false, 'spInterfaceSabre', false, '' ,false,  1),
    ('AMADEUS', 'AMADEUS', true, false, 'spInterfaceAmadeus', false, '', false, 2),
    ('IdeasFractal', 'IdeasFractal', false, false, 'spInterfaceIdeasFractal', false, '', false,  8)
ON CONFLICT (code) DO NOTHING;


-- 11. Maestros
INSERT INTO public."Master" (code, name, "inactivo")
VALUES
    ('SystemParameter', 'parametros', false),
    ('Client', 'clientes', false),
    ('Provider', 'proveedor', false),
	('Seller', 'vendedor', false),
	('TicketPrinter', 'tiqueteador', false),
	('Prestadora', 'prestadora', false),
	('Branch', 'sucursal', false),
	('Implant', 'implante', false),
	('Product', 'producto', false),
	('ChargeAndTax', 'cargos e impuesto', false),
	('Currency', 'moneda', false)
ON CONFLICT (code) DO NOTHING;
