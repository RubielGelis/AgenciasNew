const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public'
});

async function run() {
    await client.connect();
    console.log('Connected to DB');

    // 1. Role Superadministrador
    await client.query(`
        INSERT INTO public."Role" (name)
        VALUES ('Superadministrador')
        ON CONFLICT (name) DO NOTHING;
    `);
    console.log('1. Role Superadministrador created/checked.');

    // 2. User ebarrera@zagencias.com
    await client.query(`
        INSERT INTO public."User" (email, name, "passwordHash", "roleId", "branchId")
        VALUES (
            'ebarrera@zagencias.com',
            'Superadministrador',
            '$2b$10$EvqWyDZ9b/rcMCNNuSdplOyS/NooFO.keByM/UsOgJ6Zy8tgqSYxS',
            (SELECT id FROM public."Role" WHERE name = 'Superadministrador'),
            (SELECT id FROM public."Branch" LIMIT 1)
        )
        ON CONFLICT (email) DO UPDATE SET
            "passwordHash" = EXCLUDED."passwordHash",
            "roleId" = EXCLUDED."roleId";
    `);
    console.log('2. User ebarrera@zagencias.com created/updated.');

    // 3. Masters
    await client.query(`
        INSERT INTO public."Master" (code, name, "inactivo")
        VALUES
            ('SystemParameter', 'parametros', false),
            ('User', 'usuarios', false),
            ('Branch', 'sucursales', false),
            ('Implant', 'implantes', false),
            ('ChargeAndTax', 'impuestos', false),
            ('Seller', 'vendedores', false),
            ('TicketPrinter', 'tiqueteadores', false),
            ('Prestadora', 'prestadoras', false),
            ('Client', 'clientes', false),
            ('Provider', 'proveedores', false),
            ('Product', 'productos', false),
            ('MasterVariable', 'variables', false),
            ('Combo', 'combos', false),
            ('SystemLog', 'logs', false),
            ('Currency', 'monedas', false),
            ('Equivalences', 'equivalencias', false),
            ('CreditCard', 'tarjetas-credito', false),
            ('Payment', 'formas-pago', false),
            ('Countries', 'paises', false),
            ('Cities', 'ciudades', false),
            ('Airports', 'aeropuertos', false),
            ('TicketType', 'tipos-tiquetes', false),
            ('QuotationState', 'estados-cotizacion', false),
            ('QuotationFormat', 'formatos-cotizacion', false)
        ON CONFLICT (code) DO NOTHING;
    `);
    console.log('3. Masters synced in public."Master".');

    // 4. Menu
    await client.query(`
        INSERT INTO public."Menu" (code, name, parent, action, activo)
        VALUES 
            ('DASHBOARD', 'Dashboard', NULL, '/dashboard', true),
            ('COTIZACIONES', 'Cotizaciones', NULL, '/dashboard/quotations/history', true),
            ('FACTURACION', 'Facturación', NULL, '/dashboard/invoices/history', true),
            ('MAESTROS', 'Maestros', NULL, '/dashboard/settings', true),
            ('REPORTES', 'Reportes', NULL, '/dashboard/reports', true),
            ('EJECUCIONES', 'Ejecuciones', NULL, '/dashboard/executions', true)
        ON CONFLICT (code) DO UPDATE SET 
            name = EXCLUDED.name,
            parent = EXCLUDED.parent,
            action = EXCLUDED.action;
    `);
    console.log('4. Menu items synced in public."Menu".');

    // 5. spSiteModuleMasterToggle
    await client.query(`
        CREATE OR REPLACE PROCEDURE public."spSiteModuleMasterToggle"(
            p_type text,
            p_id integer,
            p_active boolean
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
            IF UPPER(p_type) = 'MENU' THEN
                UPDATE public."Menu"
                SET activo = p_active
                WHERE id = p_id;
            ELSIF UPPER(p_type) = 'MASTER' THEN
                UPDATE public."Master"
                SET inactivo = NOT p_active
                WHERE id = p_id;
            ELSE
                RAISE EXCEPTION 'Tipo no válido: %. Se requiere MENU o MASTER.', p_type;
            END IF;
        END;
        $$;
    `);
    console.log('5. Procedure spSiteModuleMasterToggle created.');

    // 6. fnMenuAll
    await client.query(`
        CREATE OR REPLACE FUNCTION public.fnMenuAll()
        RETURNS SETOF public."Menu"
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN QUERY
            SELECT * FROM public."Menu"
            ORDER BY id ASC;
        END;
        $$;
    `);
    console.log('6. Function fnMenuAll created.');

    await client.end();
    console.log('Migration completed successfully!');
}

run().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
