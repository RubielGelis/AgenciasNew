import prisma from './prisma';

const FIELD_LABELS: Record<string, string> = {
    idCotizacion: 'ID Cotización',
    asesor: 'Asesor',
    fecha: 'Fecha',
    clienteNombre: 'Cliente Nombre',
    clienteIdentificacion: 'Cliente ID',
    clienteDireccion: 'Dirección',
    clienteTelefono: 'Teléfono',
    centroCosto: 'C. Costo',
    solicita: 'Solicita',
    tCambio: 'T. Cambio',
    descripcionPlan: 'Desc Plan',
    fechasViaje: 'Fechas Viaje',
    hotelesServicios: 'Servicios',
    pasajeros: 'Pasajeros',
    totalAdultos: 'Total Adultos',
    totalNinos: 'Total Niños',
    logo: 'Celda Logo',
    proveedor1Nombre: 'Prov 1: Nombre',
    proveedor1NIT: 'Prov 1: NIT',
    proveedor1Contacto: 'Prov 1: Contacto',
    prov1TarifaNeta: 'Prov 1: Neta',
    prov1TarifaNetaPago: 'Prov 1: Neta Pago',
    prov1Impuestos: 'Prov 1: Impuestos',
    prov1ImpuestosPago: 'Prov 1: Impuestos Pago',
    prov1Adicionales: 'Prov 1: Adicionales',
    prov1AdicionalesPago: 'Prov 1: Adicionales Pago',
    prov1Comision: 'Prov 1: Comisión',
    prov1Descuento: 'Prov 1: Descuento',
    prov1Sobrecomision: 'Prov 1: Sobrecomisión',
    prov1Fee: 'Prov 1: Fee',
    prov1Total: 'Prov 1: Total',
    prov1TotalPago: 'Prov 1: Total Pago',
    proveedor2Nombre: 'Prov 2: Nombre',
    proveedor2NIT: 'Prov 2: NIT',
    proveedor2Contacto: 'Prov 2: Contacto',
    prov2TarifaNeta: 'Prov 2: Neta',
    prov2TarifaNetaPago: 'Prov 2: Neta Pago',
    prov2Impuestos: 'Prov 2: Impuestos',
    prov2ImpuestosPago: 'Prov 2: Impuestos Pago',
    prov2Adicionales: 'Prov 2: Adicionales',
    prov2AdicionalesPago: 'Prov 2: Adicionales Pago',
    prov2Comision: 'Prov 2: Comisión',
    prov2Descuento: 'Prov 2: Descuento',
    prov2Sobrecomision: 'Prov 2: Sobrecomisión',
    prov2Fee: 'Prov 2: Fee',
    prov2Total: 'Prov 2: Total',
    prov2TotalPago: 'Prov 2: Total Pago',
    tarifaNeta: 'Total: Tarifa Neta',
    tarifaNetaPago: 'Total: Neta Pago',
    impuestos: 'Total: Impuestos',
    impuestosPago: 'Total: Impuestos Pago',
    adicionalesServ: 'Total: Adicionales',
    adicionalesServPago: 'Total: Adicionales Pago',
    comision: 'Total: Comisión',
    descuento: 'Total: Descuento',
    sobrecomision: 'Total: Sobrecomisión',
    fee: 'Total: Fee',
    total: 'Total: Total',
    totalPago: 'Total: Total Pago',
    baseComisionable: 'Base Comisión',
    comisionAsesor: 'Comisión Asesor',
    baseComisionTop: 'Comisión Top',
    observaciones: 'Observaciones'
};

export async function getCellCustomizationConfig(
    branchId: number | null,
    implantId: number | null
): Promise<any> {
    try {
        const rows = await prisma.$queryRawUnsafe<any[]>(
            `SELECT * FROM public.fnCellCustomizationListar($1::INT, $2::INT)`,
            branchId,
            implantId
        );

        if (!rows || rows.length === 0) return null;

        const config: Record<string, any> = {};
        const __customNames: Record<string, string> = {};

        rows.forEach(row => {
            const code = row.code;
            config[code] = row.value || '';
            // If it's a dynamic custom field (not in standard predefined labels), save its name
            if (!FIELD_LABELS[code]) {
                __customNames[code] = row.name || code;
            }
        });

        if (Object.keys(__customNames).length > 0) {
            config.__customNames = __customNames;
        }

        return config;
    } catch (err) {
        console.error("Error in getCellCustomizationConfig:", err);
        return null;
    }
}

export async function syncCellCustomization(
    branchId: number | null,
    implantId: number | null,
    templateConfig: any
) {
    if (!templateConfig || typeof templateConfig !== 'object') return;

    try {
        // Fetch current mappings in DB
        const currentRows = await prisma.$queryRawUnsafe<any[]>(
            `SELECT * FROM public.fnCellCustomizationListar($1::INT, $2::INT)`,
            branchId,
            implantId
        );

        const dbCodes = new Set(currentRows.map(r => r.code));
        const __customNames = templateConfig.__customNames || {};

        // Identify codes to delete
        for (const code of dbCodes) {
            if (!(code in templateConfig)) {
                // Call spCellCustomizationDelete
                await prisma.$queryRawUnsafe(
                    `CALL public.spCellCustomizationDelete($1::TEXT, $2::INT, $3::INT)`,
                    code,
                    branchId,
                    implantId
                );
            }
        }

        // Upsert all mapping coordinates
        for (const [key, value] of Object.entries(templateConfig)) {
            if (key === '__customNames') continue;
            // Coordinate value can be empty (meaning deleted or empty, but let's upsert if provided)
            const valStr = value !== null && value !== undefined ? String(value) : '';
            const name = __customNames[key] || FIELD_LABELS[key] || key;

            // Call spCellCustomizationUpsert
            await prisma.$queryRawUnsafe(
                `CALL public.spCellCustomizationUpsert($1::TEXT, $2::TEXT, $3::TEXT, $4::INT, $5::INT)`,
                key,
                name,
                valStr,
                branchId,
                implantId
            );
        }
    } catch (err) {
        console.error("Error in syncCellCustomization:", err);
        throw err;
    }
}
