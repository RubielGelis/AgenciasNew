require('dotenv').config();
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public';
const client = new Client({ connectionString });

async function init() {
    await client.connect();
    console.log('Conectado a Postgres.');

    // 1. Crear la tabla ExecutionProcedure
    await client.query(`
        CREATE TABLE IF NOT EXISTS public."ExecutionProcedure" (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            "spName" VARCHAR(255) NOT NULL,
            description TEXT,
            parameters JSONB,
            "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('Tabla "ExecutionProcedure" verificada.');

    // 2. Crear la tabla ExecutionPreset
    await client.query(`
        CREATE TABLE IF NOT EXISTS public."ExecutionPreset" (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            "procedureId" INTEGER NOT NULL REFERENCES public."ExecutionProcedure"(id) ON DELETE CASCADE,
            description TEXT,
            "filterValues" JSONB,
            "filterConfig" JSONB,
            "columnConfigs" JSONB,
            "selectedTotals" JSONB,
            "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('Tabla "ExecutionPreset" verificada.');

    // 3. Insertar menú si no existe
    const menuCheck = await client.query(`SELECT * FROM public."Menu" WHERE code = 'EJECUCIONES' OR action = '/dashboard/executions'`);
    if (menuCheck.rows.length === 0) {
        await client.query(`
            INSERT INTO public."Menu" (code, name, parent, action, activo)
            VALUES ('EJECUCIONES', 'Ejecuciones', NULL, '/dashboard/executions', true);
        `);
        console.log('Menú "Ejecuciones" registrado.');
    } else {
        console.log('El menú "Ejecuciones" ya existe.');
    }

    // 4. Verificar si el SP Zeus®spze_VentasDetalladasPorConceptos ya fue sembrado
    const spCheck = await client.query(`SELECT * FROM public."ExecutionProcedure" WHERE "spName" LIKE '%Zeus%spze_VentasDetalladasPorConceptos%' OR name = 'Ventas Detalladas Por Conceptos'`);

    const spParameters = [
        // Fechas
        { name: 'fecha_inicio', label: 'Fecha Inicio', type: 'date', section: 'Fechas', defaultValue: 'FIRST_DAY_OF_MONTH', required: false },
        { name: 'fecha_fin', label: 'Fecha Fin', type: 'date', section: 'Fechas', defaultValue: 'TODAY', required: false },
        { name: 'PorFechaDocumento', label: 'Por Fecha Documento', type: 'select', section: 'Fechas', options: [{ label: 'Seleccionar...', value: '' }, { label: 'Sí', value: 'SI' }, { label: 'No', value: 'NO' }], defaultValue: 'NO' },

        // Filtros Generales
        { name: 'Nacionalidad', label: 'Nacionalidad', type: 'select', section: 'Filtros Generales', options: [{ label: 'Todos / Ambas', value: '' }, { label: 'Nacional', value: 'Nacional' }, { label: 'Internacional', value: 'Internacional' }], defaultValue: '' },
        { name: 'cd_sucursal', label: 'Sucursal (Código)', type: 'text', lookupType: 'sucursales', section: 'Filtros Generales', placeholder: 'Ej: 01,02 o de la lupa 🔍', defaultValue: '' },
        { name: 'cd_implante', label: 'Implante (Código)', type: 'text', lookupType: 'implantes', section: 'Filtros Generales', placeholder: 'Ej: TODOS o de la lupa 🔍', defaultValue: '' },
        { name: 'Grupo_Empresarial', label: 'Grupo Empresarial', type: 'text', lookupType: 'gruposempresariales', section: 'Filtros Generales', placeholder: 'Código o de la lupa 🔍', defaultValue: '' },
        { name: 'cd_Tercero', label: 'Código Tercero', type: 'text', lookupType: 'terceros', section: 'Filtros Generales', placeholder: 'Cédula/NIT o de la lupa 🔍', defaultValue: '' },
        { name: 'cd_cliente', label: 'Código Cliente', type: 'text', lookupType: 'clientes', section: 'Filtros Generales', placeholder: 'Código de la lupa 🔍', defaultValue: '' },
        { name: 'cd_vendedor', label: 'Vendedor', type: 'text', lookupType: 'vendedores', section: 'Filtros Generales', placeholder: 'Código de la lupa 🔍', defaultValue: '' },
        { name: 'cd_proveedor', label: 'Proveedor', type: 'text', lookupType: 'proveedores', section: 'Filtros Generales', placeholder: 'Código de la lupa 🔍', defaultValue: '' },
        { name: 'cd_Tiqueteador', label: 'Tiqueteador', type: 'text', lookupType: 'tiqueteadores', section: 'Filtros Generales', placeholder: 'Código de la lupa 🔍', defaultValue: '' },
        { name: 'cd_tipoCliente', label: 'Tipo Cliente', type: 'text', section: 'Filtros Generales', placeholder: 'Tipo Cliente', defaultValue: '' },
        { name: 'id_Segmento', label: 'Segmento', type: 'text', lookupType: 'segmentos', section: 'Filtros Generales', placeholder: 'ID de la lupa 🔍', defaultValue: '' },

        // Documentos & Conceptos
        { name: 'Remision', label: 'Incluir Remisiones', type: 'select', section: 'Documentos & Conceptos', options: [{ label: 'Seleccionar...', value: '' }, { label: 'Sí', value: 'SI' }, { label: 'No', value: 'NO' }], defaultValue: 'NO' },
        { name: 'RemFacturadas', label: 'Remisiones Facturadas', type: 'select', section: 'Documentos & Conceptos', options: [{ label: 'Seleccionar...', value: '' }, { label: 'Sí', value: 'SI' }, { label: 'No', value: 'NO' }], defaultValue: 'NO' },
        { name: 'FacGeneradasRem', label: 'Facturas Generadas de Remisión', type: 'select', section: 'Documentos & Conceptos', options: [{ label: 'Seleccionar...', value: '' }, { label: 'Sí', value: 'SI' }, { label: 'No', value: 'NO' }], defaultValue: 'NO' },
        { name: 'SoloConceptosVenta', label: 'Solo Conceptos de Venta', type: 'select', section: 'Documentos & Conceptos', options: [{ label: 'Seleccionar...', value: '' }, { label: 'Sí', value: 'SI' }, { label: 'No', value: 'NO' }], defaultValue: 'NO' },
        { name: 'cd_ConceptoFacturacion', label: 'Concepto Facturación', type: 'text', lookupType: 'conceptos', section: 'Documentos & Conceptos', placeholder: 'Códigos de la lupa 🔍', defaultValue: '' },
        { name: 'ds_conceptosAdicional', label: 'Conceptos Adicionales', type: 'text', lookupType: 'conceptos', section: 'Documentos & Conceptos', placeholder: 'Códigos adicionales', defaultValue: '' },
        { name: 'ds_cargosdescAdicional', label: 'Cargos/Desc. Adicionales', type: 'text', lookupType: 'cargosdesc', section: 'Documentos & Conceptos', placeholder: 'Cargos y Descuentos', defaultValue: '' },
        { name: 'ds_impretAdicional', label: 'Impuestos/Ret. Adicionales', type: 'text', lookupType: 'impret', section: 'Documentos & Conceptos', placeholder: 'Impuestos y Retenciones', defaultValue: '' },
        { name: 'ds_conceptosunificados', label: 'Conceptos Unificados', type: 'text', lookupType: 'conceptos', section: 'Documentos & Conceptos', placeholder: 'Conceptos unificados', defaultValue: '' },
        { name: 'NoMostrarFeeOcultos', label: 'No Mostrar Fee Ocultos', type: 'select', section: 'Documentos & Conceptos', options: [{ label: 'Seleccionar...', value: '' }, { label: 'Sí', value: 'SI' }, { label: 'No', value: 'NO' }], defaultValue: 'NO' },

        // Visualización & Opciones
        { name: 'MostrarCombustible', label: 'Mostrar Combustible', type: 'select', section: 'Opciones de Reporte', options: [{ label: 'Seleccionar...', value: '' }, { label: 'Sí', value: 'SI' }, { label: 'No', value: 'NO' }], defaultValue: 'SI' },
        { name: 'MostrarTAOCEMColumnas', label: 'Mostrar Columnas TAO / CEM', type: 'select', section: 'Opciones de Reporte', options: [{ label: 'Seleccionar...', value: '' }, { label: 'Sí', value: 'SI' }, { label: 'No', value: 'NO' }], defaultValue: 'NO' },
        { name: 'MostrarAnulacion', label: 'Mostrar Anulaciones', type: 'select', section: 'Opciones de Reporte', options: [{ label: 'Seleccionar...', value: '' }, { label: 'Sí', value: 'SI' }, { label: 'No', value: 'NO' }], defaultValue: 'NO' },
        { name: 'ds_Categorias', label: 'Categorías', type: 'text', lookupType: 'categorias', section: 'Opciones de Reporte', placeholder: 'Categorías de la lupa 🔍', defaultValue: '' },
        { name: 'ds_variables', label: 'Variables Adicionales', type: 'text', section: 'Opciones de Reporte', placeholder: 'Variables maestro', defaultValue: '' },
        { name: 'ds_TipoProveedores', label: 'Tipos de Proveedores', type: 'text', section: 'Opciones de Reporte', placeholder: 'Tipos de proveedores', defaultValue: '' },
        { name: 'ds_EtapasCotizacion', label: 'Etapas Cotización', type: 'text', lookupType: 'etapas', section: 'Opciones de Reporte', placeholder: 'Etapas cotización', defaultValue: '' },
        { name: 'ds_tipoventa', label: 'Tipos de Venta', type: 'text', lookupType: 'tipoventa', section: 'Opciones de Reporte', placeholder: 'Tipos de venta', defaultValue: '' }
    ];

    if (spCheck.rows.length === 0) {
        await client.query(`
            INSERT INTO public."ExecutionProcedure" (name, "spName", description, parameters)
            VALUES ($1, $2, $3, $4);
        `, [
            'Ventas Detalladas Por Conceptos',
            'dbo.[Zeus®spze_VentasDetalladasPorConceptos]',
            'Reporte detallado de ventas por conceptos, facturas, remisiones y cotizaciones de Zeus ERP.',
            JSON.stringify(spParameters)
        ]);
        console.log('SP Zeus®spze_VentasDetalladasPorConceptos registrado con éxito.');
    } else {
        await client.query(`
            UPDATE public."ExecutionProcedure"
            SET parameters = $1
            WHERE id = $2;
        `, [JSON.stringify(spParameters), spCheck.rows[0].id]);
        console.log('SP Zeus®spze_VentasDetalladasPorConceptos actualizado con lookupTypes.');
    }

    await client.end();
}

init().catch(err => {
    console.error('Error al inicializar ejecuciones:', err);
    process.exit(1);
});
