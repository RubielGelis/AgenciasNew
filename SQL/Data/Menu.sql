-- Datos iniciales para la tabla Menu
INSERT INTO public."Menu" (code, name, parent, action, activo)
VALUES 
    ('DASHBOARD', 'Dashboard', NULL, '/dashboard', true),
    ('COTIZACIONES', 'Cotizaciones', NULL, '/dashboard/quotations/history', true),
    ('FACTURACION', 'Facturación', NULL, '/dashboard/invoices/history', true),
    ('NOTAS_CREDITO', 'Notas Crédito', NULL, '/dashboard/credit-notes/unreferenced', true),
    ('NOTAS_CREDITO_NO_REF', 'Notas Crédito No Referenciadas', (SELECT id FROM public."Menu" WHERE code = 'NOTAS_CREDITO' LIMIT 1), '/dashboard/credit-notes/unreferenced', true),
    ('MAESTROS', 'Maestros', NULL, '/dashboard/settings', true),
    ('REPORTES', 'Reportes', NULL, '/dashboard/reports', true)
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    parent = EXCLUDED.parent,
    action = EXCLUDED.action,
    activo = EXCLUDED.activo;

-- Actualizar parent de NOTAS_CREDITO_NO_REF si fue insertado
UPDATE public."Menu" 
SET parent = (SELECT id FROM public."Menu" WHERE code = 'NOTAS_CREDITO' LIMIT 1)
WHERE code = 'NOTAS_CREDITO_NO_REF';

