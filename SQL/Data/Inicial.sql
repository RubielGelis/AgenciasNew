-- SCRIPT DE DATOS INICIALES - AGENCIAS NEW
-- RUTA: c:\Proyectos\AgenciasNew\SQL\Data\Inicial.sql

-- 1. Limpieza rápida (Opcional, pero recomendada)
TRUNCATE public."User", public."Role", public."Branch", public."Client", public."Seller", 
         public."Provider", public."TicketPrinter", public."Product", public."ChargeAndTax",
         public."Implant", public."Hotel" RESTART IDENTITY CASCADE;

-- 2. Creación de Rol
INSERT INTO public."Role" (name) VALUES ('Admin');

-- 3. Creación de Sucursal
INSERT INTO public."Branch" (code, name) VALUES ('BOG', 'BOG');

-- 4. Creación de Usuario Administrativo
-- Contraseña: 111985
INSERT INTO public."User" (email, name, "passwordHash", "roleId", "branchId") 
VALUES ('rubiel1985@msn.com', 'Rubiel', '$2b$10$IUxxw/yzr2bpC4wRMUcBYOsrIJrG4e0j.FI/p2baH2CGNfKNLbn.S', 
        (SELECT id FROM public."Role" WHERE name = 'Admin'), 
        (SELECT id FROM public."Branch" WHERE code = 'BOG'));

-- 5. Clientes, Vendedores, Proveedores y Tiqueteadores (Mismo Rubiel)
INSERT INTO public."Client" (document, name) VALUES ('73009263', 'Rubiel');
INSERT INTO public."Seller" (code, name, email) VALUES ('73009263', 'Rubiel', 'rubiel1985@msn.com');
INSERT INTO public."Provider" (code, name) VALUES ('73009263', 'Rubiel');
INSERT INTO public."TicketPrinter" (code, name, email) VALUES ('73009263', 'Rubiel', 'rubiel1985@msn.com');

-- 6. Productos
INSERT INTO public."Product" (type, description, "basePrice") VALUES ('ALOJAMIENTO', 'Hotel', 0);
INSERT INTO public."Product" (type, description, "basePrice") VALUES ('ALQUILER', 'RestaAuto', 0);

-- 7. Cargos e Impuestos
INSERT INTO public."ChargeAndTax" (name, type, "valueType", value, "isEditable") VALUES ('TAR', 'CHARGE', 'FIXED', 0, true);
INSERT INTO public."ChargeAndTax" (name, type, "valueType", value, "isEditable") VALUES ('IVA', 'TAX', 'PERCENTAGE', 19, true);
INSERT INTO public."ChargeAndTax" (name, type, "valueType", value, "isEditable") VALUES ('OTROS', 'CHARGE', 'FIXED', 0, true);
