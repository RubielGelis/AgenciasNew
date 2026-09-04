-- SCRIPT DE DATOS INICIALES - AGENCIAS NEW
-- RUTA: c:\Proyectos\AgenciasNew\SQL\Data\Inicial.sql
-- IDEMPOTENTE: Puede ejecutarse múltiples veces sin errores

-- 1. Rol Admin y Superadministrador
INSERT INTO public."Role" (name)
VALUES ('Admin'), ('Superadministrador')
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

-- 4.1 Usuario Superadministrador (Contraseña: 123456789)
INSERT INTO public."User" (email, name, "passwordHash", "roleId", "branchId")
VALUES (
    'ebarrera@zagencias.com',
    'Superadministrador',
    '$2b$10$EvqWyDZ9b/rcMCNNuSdplOyS/NooFO.keByM/UsOgJ6Zy8tgqSYxS',
    (SELECT id FROM public."Role" WHERE name = 'Superadministrador'),
    (SELECT id FROM public."Branch" WHERE code = 'BOG')
)
ON CONFLICT (email) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "roleId" = EXCLUDED."roleId";


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
    ('ClaveSQLServer',                   'Contraseña SQL Server',                        '111985'),
    ('BaseSQLServer',                    'Base de Datos SQL Server',                     'Agencias'),
    ('PuertoSQLServer',                  'Puerto SQL Server',                            ''),
    ('EnviarCotizacionesAutoSQLserver',  'Envío automático de cotizaciones a SQL Server (1: Sí, 0: No)', '1'),
	('EnviarFacturacionAutoSQLserver',   'Envío automático a Facturacion SQL Server (1: Sí, 0: No)', '1'),
	('Pais',                    		 'Pais',                     					 'Colombia'),
	('MOSTRAR_TOTALIZACION_COTIZACION',  'Mostrar totalización financiera en cotización', 'true')
ON CONFLICT (code) DO NOTHING;

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

-- 10. Configuración de Facturación Automática por Sucursal y GDS
INSERT INTO public."BranchGDSInvoiceAuto" ("branchId", "gdsId", "EnvoiceAuto")
SELECT b.id, g.id, false
FROM public."Branch" b, public."GDS" g
ON CONFLICT DO NOTHING;


-- 10. Interfaces iniciales


INSERT INTO public."Interfaces" (code, name, "inactivo", "bl_genera_archivoplano", "ds_storedprocedure_archivoplano", "bl_job", "ds_namejob" ,"bl_facturador", "id_gds")
VALUES
    ('SABRE', 'SABRE', true, false, 'spInterfaceSabre', false, '' ,false,  1),
    ('AMADEUS', 'AMADEUS', true, false, 'spInterfaceAmadeus', false, '', false, 2),
    ('IdeasFractal', 'IdeasFractal', false, false, 'spInterfaceIdeasFractal', false, '', false,  8)
ON CONFLICT (code) DO NOTHING;


-- 10.5 Módulos de Menú Principal
CREATE UNIQUE INDEX IF NOT EXISTS "Menu_code_key" ON public."Menu" ("code");
INSERT INTO public."Menu" (code, name, parent, action, activo)
VALUES 
    ('DASHBOARD', 'Dashboard', NULL, '/dashboard', true),
    ('PRECOTIZACIONES', 'Pre-Cotizaciones', NULL, '/dashboard/prequotations', true),
    ('COTIZACIONES', 'Cotizaciones', NULL, '/dashboard/quotations/history', true),
    ('FACTURACION', 'Facturación', NULL, '/dashboard/invoices/history', true),
    ('NOTAS_CREDITO', 'Notas Crédito', NULL, '/dashboard/credit-notes/unreferenced', true),
    ('NOTAS_CREDITO_NO_REF', 'Notas Crédito No Referenciadas', (SELECT id FROM public."Menu" WHERE code = 'NOTAS_CREDITO' LIMIT 1), '/dashboard/credit-notes/unreferenced', true),
    ('MAESTROS', 'Maestros', NULL, '/dashboard/settings', true),
    ('REPORTES', 'Reportes', NULL, '/dashboard/reports', true),
    ('EJECUCIONES', 'Ejecuciones', NULL, '/dashboard/executions', true),
    ('MANUAL', 'Manual Operativo', NULL, '/dashboard/manual', true)
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    parent = EXCLUDED.parent,
    action = EXCLUDED.action,
    activo = EXCLUDED.activo;

-- Actualizar parent de NOTAS_CREDITO_NO_REF si fue insertado
UPDATE public."Menu" 
SET parent = (SELECT id FROM public."Menu" WHERE code = 'NOTAS_CREDITO' LIMIT 1)
WHERE code = 'NOTAS_CREDITO_NO_REF';

-- 12. Estados de Cotización Iniciales
INSERT INTO public."QuotationState" (code, name, color)
VALUES
    ('NUEVO', 'Nuevo', 'blue'),
    ('ENVIADO', 'ENVIADO', 'emerald')
ON CONFLICT (code) DO NOTHING;
INSERT INTO public."SystemParameter" (code, name, value) VALUES ('LICENSE_KEY', 'Clave de Licencia del Sistema', 'KOR1.eyJjIjoiS09SRVggQUdFTkNJQSBQUlVFQkEiLCJuIjoiNzk4OTg0NTYiLCJlIjoiMjAyNi0wOS0xOCIsImkiOiIyMDI2LTA4LTE4In0.c33014ec4605e0dfe9fa66a7bfaeb738875c88e030934e9212f75e72686a99b7') ON CONFLICT (code) DO NOTHING;

INSERT INTO public."SystemParameter" (code, name, value) VALUES ('LICENSE_EXPIRATION_DATE', 'Fecha de Expiración de Licencia', '2026-09-18') ON CONFLICT (code) DO NOTHING;

INSERT INTO public."SystemParameter" (code, name, value) VALUES ('PRODUCTO_RESERVA_GDS', 'Producto por Defecto para Reservas GDS', 'TAN') ON CONFLICT (code) DO NOTHING;

INSERT INTO public."SystemParameter" (code, name, value) VALUES ('AGENCY_NAME', 'Nombre o Razón Social de la Agencia', 'KOREX AGENCIA PRUEBA') ON CONFLICT (code) DO NOTHING;

INSERT INTO public."SystemParameter" (code, name, value) VALUES ('AGENCY_NIT', 'NIT de la Agencia', '79898456') ON CONFLICT (code) DO NOTHING;

INSERT INTO public."SystemParameter" (code, name, value) VALUES ('TASA_CAMBIO_IATA', 'Tasa de Cambio IATA', '4200.00') ON CONFLICT (code) DO NOTHING;

INSERT INTO public."SystemParameter" (code, name, value) VALUES ('TARIFA_ADMIN_OW', 'Tarifa Administrativa Nacional One Way', '29100') ON CONFLICT (code) DO NOTHING;

INSERT INTO public."SystemParameter" (code, name, value) VALUES ('TARIFA_ADMIN_RT', 'Tarifa Administrativa Nacional Roundtrip', '52800') ON CONFLICT (code) DO NOTHING;

INSERT INTO public."SystemParameter" (code, name, value) VALUES ('PRODUCTO_TARIFA_ADMINISTRATIVA', 'Producto por Defecto para Tarifa Administrativa', '77') ON CONFLICT (code) DO NOTHING;

INSERT INTO public."SystemParameter" (code, name, value) VALUES ('TARIFA_ADMIN_INT_RANGES', 'Rangos Tarifa Administrativa Internacional (JSON)', '[{"min":0,"max":354,"feeUsd":15,"label":"Menores o iguales a USD 354"},{"min":354.01,"max":590,"feeUsd":28,"label":"Mayores de USD 354 hasta USD 590"},{"min":590.01,"max":944,"feeUsd":46,"label":"Mayores de USD 590 hasta USD 944"},{"min":944.01,"max":999999,"feeUsd":95,"label":"Mayores de USD 944"}]') ON CONFLICT (code) DO NOTHING;

INSERT INTO public."Master" (code, name, "inactivo") VALUES ('Diagnostics', 'diagnostico', false) ON CONFLICT (code) DO NOTHING;