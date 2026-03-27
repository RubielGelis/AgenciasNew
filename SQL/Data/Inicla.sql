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
