-- SCRIPT DE DATOS INICIALES - AGENCIAS NEW
-- RUTA: c:\Proyectos\AgenciasNew\SQL\Data\Inicial.sql

-- 1. Limpieza rápida (Opcional, pero recomendada)
--TRUNCATE public."User", public."Role", public."Branch", public."Client", public."Seller", 
--         public."Provider", public."TicketPrinter", public."Product", public."ChargeAndTax",
--         public."Implant", public."Hotel" RESTART IDENTITY CASCADE;

-- 2. Creación de Rol
INSERT INTO public."Role" (name) VALUES ('Admin');

-- 3. Creación de Sucursal
INSERT INTO public."Branch" (code, name) VALUES ('BOG', 'BOG');
-- 5. Clientes, Vendedores, Proveedores y Tiqueteadores (Mismo Rubiel)
INSERT INTO public."Client" (document, name) VALUES ('73009263', 'Rubiel');
INSERT INTO public."Seller" (code, name, email) VALUES ('73009263', 'Rubiel', 'rubiel1985@msn.com');
INSERT INTO public."Provider" (code, name) VALUES ('73009263', 'Rubiel');
INSERT INTO public."TicketPrinter" (code, name, email) VALUES ('73009263', 'Rubiel', 'rubiel1985@msn.com');

-- 4. Creación de Usuario Administrativo
-- Contraseña: 111985
INSERT INTO public."User" (email, name, "passwordHash", "roleId", "branchId","implanteId","ticketPrinterId") 
VALUES ('rubiel1985@msn.com', 'Rubiel', '$2b$10$IUxxw/yzr2bpC4wRMUcBYOsrIJrG4e0j.FI/p2baH2CGNfKNLbn.S', 
        (SELECT id FROM public."Role" WHERE name = 'Admin'), 
        (SELECT id FROM public."Branch" WHERE code = 'BOG'),
		null
		(SELECT id FROM public."TicketPrinter" WHERE code = '73009263')
		);


-- 6. Productos
INSERT INTO public."Product" (type, description, "basePrice") VALUES ('ALOJAMIENTO', 'Hotel', 0);
INSERT INTO public."Product" (type, description, "basePrice") VALUES ('ALQUILER', 'RestaAuto', 0);

-- 7. Cargos e Impuestos
INSERT INTO public."ChargeAndTax" (name, type, "valueType", value, "isEditable") VALUES ('TAR', 'CHARGE', 'FIXED', 0, true);
INSERT INTO public."ChargeAndTax" (name, type, "valueType", value, "isEditable") VALUES ('IVA', 'TAX', 'PERCENTAGE', 19, true);
INSERT INTO public."ChargeAndTax" (name, type, "valueType", value, "isEditable") VALUES ('OTROS', 'CHARGE', 'FIXED', 0, true);

-- SCRIPT DE PARÁMETROS DE CONECTIVIDAD SQL SERVER (ACTUALIZADO)
-- RUTA: c:\Proyectos\AgenciasNew\SQL\Data\Inicla.sql

-- Borrar si existen para evitar duplicados en la carga inicial
DELETE FROM public."Parameter" WHERE code IN (
    'ServidorSQLServer', 
    'UsuarioSQLServer', 
    'ClaveSQLServer', 
    'BaseSQLServer', 
    'PuertoSQLServer', 
    'EnviarCotizacionesAutoSQLserver'
);

-- Insertar parámetros solicitados
INSERT INTO public."Parameter" (code, name, value) VALUES ('ServidorSQLServer', 'Host de SQL Server', 'Rubiel/RUBIEL');
INSERT INTO public."Parameter" (code, name, value) VALUES ('UsuarioSQLServer', 'Usuario SQL Server', 'sa');
INSERT INTO public."Parameter" (code, name, value) VALUES ('ClaveSQLServer', 'Contraseña SQL Server', '111985*');
INSERT INTO public."Parameter" (code, name, value) VALUES ('BaseSQLServer', 'Base de Datos SQL Server', 'Agencias');
INSERT INTO public."Parameter" (code, name, value) VALUES ('PuertoSQLServer', 'Puerto SQL Server', '');
INSERT INTO public."Parameter" (code, name, value) VALUES ('EnviarCotizacionesAutoSQLserver', 'Envío automático a SQL Server (1: Sí, 0: No)', '1');

