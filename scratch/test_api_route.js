const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const path = require('path');
const fs = require('fs');

const connectionString = "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_CONFIG = {
    asesor: "B4",
    fecha: "G4",
    clienteNombre: "B7",
    clienteIdentificacion: "G7",
    clienteDireccion: "B8",
    clienteTelefono: "G8",
    centroCosto: "B9",
    solicita: "G9",
    tCambio: "G11",
    descripcionPlan: "B12",
    fechasViaje: "G12",
    hotelesServicios: "A13",
    pasajeros: "B14",
    totalAdultos: "C15",
    totalNinos: "G15",
    proveedor1Nombre: "B18",
    proveedor1NIT: "E18",
    proveedor1Contacto: "H18",
    proveedor2Nombre: "B19",
    proveedor2NIT: "E19",
    proveedor2Contacto: "H19",
    prov1TarifaNeta: "B23",
    prov1TarifaNetaPago: "D23",
    prov2TarifaNeta: "G23",
    prov2TarifaNetaPago: "I23",
    prov1Impuestos: "B24",
    prov1ImpuestosPago: "D24",
    prov2Impuestos: "G24",
    prov2ImpuestosPago: "I24",
    prov1Adicionales: "B25",
    prov1AdicionalesPago: "D25",
    prov2Adicionales: "G25",
    prov2AdicionalesPago: "I25",
    prov1Comision: "B26",
    prov2Comision: "G26",
    prov1Descuento: "B27",
    prov2Descuento: "G27",
    prov1Sobrecomision: "B28",
    prov2Sobrecomision: "G28",
    prov1Fee: "B29",
    prov2Fee: "G29",
    prov1Total: "B30",
    prov1TotalPago: "D30",
    prov2Total: "G30",
    prov2TotalPago: "I30",
    baseComisionable: "B35",
    comisionAsesor: "B36",
    baseComisionTop: "B37",
    observaciones: "B42",
    logo: "A1"
};

async function main() {
    try {
        const idIni = 44;
        const idFin = 44;
        
        console.log("1. Querying database...");
        const rawRows = await prisma.$queryRawUnsafe(
            `SELECT * FROM public."fnRptCotizacion"($1, $2)`,
            idIni, idFin
        );
        console.log("Returned", rawRows.length, "rows");

        // Group rows
        const grouped = {};
        rawRows.forEach((row) => {
            const id = row.idCotizacion;
            if (!grouped[id]) {
                grouped[id] = {
                    idCotizacion: id,
                    asesor: row.asesor,
                    fecha: row.fecha,
                    clienteNombre: row.clienteNombre,
                    clienteIdentificacion: row.clienteIdentificacion,
                    clienteDireccion: row.clienteDireccion,
                    clienteTelefono: row.clienteTelefono,
                    tCambio: row.tCambio || 1.0,
                    descripcionPlan: row.descripcionPlan || `Cotización #${id}`,
                    pasajeros: row.pasajeros,
                    totalAdultos: row.totalAdultos || 0,
                    totalNinos: row.totalNinos || 0,
                    baseComisionable: row.baseComisionable || 0,
                    comisionAsesor: row.comisionAsesor || 0,
                    observaciones: row.observaciones,
                    logo: row.logo,
                    fechasViaje: row.fechasViaje || '',
                    hotelesServicios: row.hotelesServicios || '',
                    providers: []
                };
            }

            if (row.proveedorNombre || row.proveedorNIT || row.tarifaNeta > 0) {
                grouped[id].providers.push({
                    nombre: row.proveedorNombre || '',
                    nit: row.proveedorNIT || '',
                    contacto: row.proveedorContacto || '',
                    tarifaNeta: row.tarifaNeta || 0,
                    impuestos: row.impuestos || 0,
                    adicionalesServ: row.adicionalesServ || 0,
                    comision: row.comision || 0,
                    descuento: row.descuento || 0,
                    sobrecomision: row.sobrecomision || 0,
                    fee: row.fee || 0,
                    total: row.total || 0,
                });
            }
        });

        const groupedList = Object.values(grouped);
        const quotationIds = groupedList.map(q => q.idCotizacion);

        console.log("2. Fetching quotations from DB...");
        const quotationsDb = await prisma.quotation.findMany({
            where: { id: { in: quotationIds } },
            select: {
                id: true,
                branch: { select: { id: true, template: true, templateConfig: true, htmlTemplate: true } },
                implant: { select: { id: true, template: true, templateConfig: true, htmlTemplate: true } }
            }
        });
        const qDbMap = new Map(quotationsDb.map(q => [q.id, q]));

        const defaultTemplatePath = path.join(__dirname, '../../../../../../../Proyectos/AgenciasNew/templates', 'default_template.xlsx');

        for (const q of groupedList) {
            console.log("Processing quotation ID:", q.idCotizacion);
            const dbInfo = qDbMap.get(q.idCotizacion);
            const templateBuffer = dbInfo?.implant?.template || dbInfo?.branch?.template;
            const templateConfigRaw = dbInfo?.implant?.templateConfig || dbInfo?.branch?.templateConfig;
            
            let config = DEFAULT_CONFIG;
            if (templateConfigRaw && typeof templateConfigRaw === 'object') {
                config = { ...DEFAULT_CONFIG, ...templateConfigRaw };
            }

            let htmlTemplate = dbInfo?.implant?.htmlTemplate || dbInfo?.branch?.htmlTemplate;

            if (!htmlTemplate) {
                console.log("HTML template not cached, generating...");
                const { generateHtmlTemplate } = require('../../../../../../../Proyectos/AgenciasNew/src/lib/excel-to-html');
                const bufferToUse = templateBuffer ? Buffer.from(templateBuffer) : fs.readFileSync(defaultTemplatePath);
                htmlTemplate = await generateHtmlTemplate(bufferToUse, config);
            }

            console.log("3. Doing replacements...");
            let compiledHtml = htmlTemplate;

            const formatDate = (dStr) => {
                if (!dStr) return '';
                const d = new Date(dStr);
                return isNaN(d.getTime()) ? dStr : d.toLocaleDateString();
            };

            const formatCurrency = (val) => {
                if (val === null || val === undefined) return '0';
                return val.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
            };

            const prov1 = q.providers[0];
            const prov2 = q.providers[1];

            const totalTarifaNeta = q.providers.reduce((sum, p) => sum + p.tarifaNeta, 0);
            const totalImpuestos = q.providers.reduce((sum, p) => sum + p.impuestos, 0);
            const totalAdicionalesServ = q.providers.reduce((sum, p) => sum + p.adicionalesServ, 0);
            const totalComision = q.providers.reduce((sum, p) => sum + p.comision, 0);
            const totalDescuento = q.providers.reduce((sum, p) => sum + p.descuento, 0);
            const totalSobrecomision = q.providers.reduce((sum, p) => sum + p.sobrecomision, 0);
            const totalFee = q.providers.reduce((sum, p) => sum + p.fee, 0);
            const totalTotal = q.providers.reduce((sum, p) => sum + p.total, 0);

            const replacements = {
                asesor: q.asesor || '',
                fecha: formatDate(q.fecha),
                clienteNombre: q.clienteNombre || '',
                clienteIdentificacion: q.clienteIdentificacion || '',
                clienteDireccion: q.clienteDireccion || '',
                clienteTelefono: q.clienteTelefono || '',
                centroCosto: '',
                solicita: '',
                tCambio: String(q.tCambio || 1.0),
                descripcionPlan: q.descripcionPlan || `Cotización #${q.idCotizacion}`,
                fechasViaje: q.fechasViaje || '',
                hotelesServicios: q.hotelesServicios || '',
                pasajeros: q.pasajeros || 'Mismo titular',
                totalAdultos: String(q.totalAdultos),
                totalNinos: String(q.totalNinos),
                baseComisionable: formatCurrency(q.baseComisionable),
                comisionAsesor: formatCurrency(q.comisionAsesor),
                baseComisionTop: formatCurrency(q.baseComisionable - q.comisionAsesor),
                observaciones: q.observaciones || '',
                idCotizacion: String(q.idCotizacion),

                tarifaNeta: formatCurrency(totalTarifaNeta),
                tarifaNetaPago: formatCurrency(totalTarifaNeta - totalComision),
                impuestos: formatCurrency(totalImpuestos),
                impuestosPago: formatCurrency(totalImpuestos),
                adicionalesServ: formatCurrency(totalAdicionalesServ),
                adicionalesServPago: formatCurrency(totalAdicionalesServ),
                comision: formatCurrency(totalComision),
                descuento: formatCurrency(totalDescuento),
                sobrecomision: formatCurrency(totalSobrecomision),
                fee: formatCurrency(totalFee),
                total: formatCurrency(totalTotal),
                totalPago: formatCurrency(totalTotal - totalComision),

                proveedor1Nombre: prov1?.nombre || '',
                proveedor1NIT: prov1?.nit || '',
                proveedor1Contacto: prov1?.contacto || '',
                prov1TarifaNeta: prov1 ? formatCurrency(prov1.tarifaNeta) : '',
                prov1TarifaNetaPago: prov1 ? formatCurrency(prov1.tarifaNeta - prov1.comision) : '',
                prov1Impuestos: prov1 ? formatCurrency(prov1.impuestos) : '',
                prov1ImpuestosPago: prov1 ? formatCurrency(prov1.impuestos) : '',
                prov1Adicionales: prov1 ? formatCurrency(prov1.adicionalesServ) : '',
                prov1AdicionalesPago: prov1 ? formatCurrency(prov1.adicionalesServ) : '',
                prov1Comision: prov1 ? formatCurrency(prov1.comision) : '',
                prov1Descuento: prov1 ? formatCurrency(prov1.descuento) : '',
                prov1Sobrecomision: prov1 ? formatCurrency(prov1.sobrecomision) : '',
                prov1Fee: prov1 ? formatCurrency(prov1.fee) : '',
                prov1Total: prov1 ? formatCurrency(prov1.total) : '',
                prov1TotalPago: prov1 ? formatCurrency(prov1.total - prov1.comision) : '',

                proveedor2Nombre: prov2?.nombre || '',
                proveedor2NIT: prov2?.nit || '',
                proveedor2Contacto: prov2?.contacto || '',
                prov2TarifaNeta: prov2 ? formatCurrency(prov2.tarifaNeta) : '',
                prov2TarifaNetaPago: prov2 ? formatCurrency(prov2.tarifaNeta - prov2.comision) : '',
                prov2Impuestos: prov2 ? formatCurrency(prov2.impuestos) : '',
                prov2ImpuestosPago: prov2 ? formatCurrency(prov2.impuestos) : '',
                prov2Adicionales: prov2 ? formatCurrency(prov2.adicionalesServ) : '',
                prov2AdicionalesPago: prov2 ? formatCurrency(prov2.adicionalesServ) : '',
                prov2Comision: prov2 ? formatCurrency(prov2.comision) : '',
                prov2Descuento: prov2 ? formatCurrency(prov2.descuento) : '',
                prov2Sobrecomision: prov2 ? formatCurrency(prov2.sobrecomision) : '',
                prov2Fee: prov2 ? formatCurrency(prov2.fee) : '',
                prov2Total: prov2 ? formatCurrency(prov2.total) : '',
                prov2TotalPago: prov2 ? formatCurrency(prov2.total - prov2.comision) : '',
            };

            Object.entries(replacements).forEach(([key, val]) => {
                const token = `{{${key}}}`;
                compiledHtml = compiledHtml.split(token).join(val);
            });
            console.log("Replacements complete. HTML size:", compiledHtml.length);
        }
        console.log("TEST SUCCESSFUL!");
    } catch (e) {
        console.error("TEST FAILED WITH ERROR:", e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
