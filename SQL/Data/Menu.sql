-- Datos iniciales para la tabla Menu
CREATE UNIQUE INDEX IF NOT EXISTS "Menu_code_key" ON public."Menu" ("code");

INSERT INTO public."Menu" (code, name, parent, action, activo)
VALUES 
    ('DASHBOARD', 'Dashboard', NULL, '/dashboard', true),
    ('PRECOTIZACIONES', 'Pre-Cotizaciones', NULL, '/dashboard/prequotations', true),
    ('COTIZACIONES', 'Cotizaciones', NULL, '/dashboard/quotations/history', true),
    ('FACTURACION', 'Facturación', NULL, '/dashboard/invoices/history', true),
    ('MAESTROS', 'Maestros', NULL, '/dashboard/settings', true),
    ('REPORTES', 'Reportes', NULL, '/dashboard/reports', true),
    ('EJECUCIONES', 'Ejecuciones', NULL, '/dashboard/executions', true),
    ('MANUAL', 'Manual Operativo', NULL, '/dashboard/manual', true)
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    parent = EXCLUDED.parent,
    action = EXCLUDED.action;
