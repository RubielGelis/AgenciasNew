-- Datos iniciales para la tabla Menu
INSERT INTO public."Menu" (code, name, parent, action, activo)
VALUES 
    ('DASHBOARD', 'Dashboard', NULL, '/dashboard', true),
    ('COTIZACIONES', 'Cotizaciones', NULL, '/dashboard/quotations/history', true),
    ('FACTURACION', 'Facturación', NULL, '/dashboard/invoices/history', true),
    ('MAESTROS', 'Maestros', NULL, '/dashboard/settings', true),
    ('REPORTES', 'Reportes', NULL, '/dashboard/reports', true)
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    parent = EXCLUDED.parent,
    action = EXCLUDED.action,
    activo = EXCLUDED.activo;
