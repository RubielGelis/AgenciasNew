const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
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

function colNameToIndex(colName) {
    let index = 0;
    for (let i = 0; i < colName.length; i++) {
        index = index * 26 + (colName.charCodeAt(i) - 64);
    }
    return index - 1;
}

function copySheet(srcSheet, destSheet, srcWorkbook, destWorkbook) {
    if (srcSheet.views) {
        destSheet.views = JSON.parse(JSON.stringify(srcSheet.views));
    }
    if (srcSheet.pageSetup) {
        destSheet.pageSetup = JSON.parse(JSON.stringify(srcSheet.pageSetup));
    }

    if (srcSheet.columns) {
        destSheet.columns = srcSheet.columns.map(col => {
            const colStyle = col.style ? JSON.parse(JSON.stringify(col.style)) : undefined;
            return {
                header: col.header,
                key: col.key,
                width: col.width,
                style: colStyle
            };
        });
    }

    const merges = srcSheet.model.merges || [];
    merges.forEach((m) => {
        try {
            destSheet.mergeCells(m);
        } catch (mergeErr) {
            console.error("Error merging cell in copySheet:", mergeErr);
        }
    });

    srcSheet.eachRow({ includeEmpty: true }, (row, rowNum) => {
        const destRow = destSheet.getRow(rowNum);
        destRow.height = row.height;
        if (row.style) {
            destRow.style = JSON.parse(JSON.stringify(row.style));
        }

        row.eachCell({ includeEmpty: true }, (cell, colNum) => {
            const destCell = destRow.getCell(colNum);
            destCell.value = cell.value;
            
            const style = {};
            if (cell.font) style.font = JSON.parse(JSON.stringify(cell.font));
            if (cell.fill) style.fill = JSON.parse(JSON.stringify(cell.fill));
            if (cell.border) style.border = JSON.parse(JSON.stringify(cell.border));
            if (cell.alignment) style.alignment = JSON.parse(JSON.stringify(cell.alignment));
            if (cell.numFmt) style.numFmt = cell.numFmt;
            if (cell.protection) style.protection = JSON.parse(JSON.stringify(cell.protection));
            
            if (Object.keys(style).length > 0) {
                destCell.style = style;
            }
        });
    });

    try {
        const images = srcSheet.getImages();
        images.forEach(img => {
            try {
                const imageObj = srcWorkbook.getImage(Number(img.imageId));
                if (imageObj && imageObj.buffer) {
                    const newImageId = destWorkbook.addImage({
                        buffer: imageObj.buffer,
                        extension: imageObj.extension,
                    });
                    
                    const range = img.range;
                    const rangeOption = {
                        tl: { col: range.tl.col, row: range.tl.row },
                        editAs: range.editAs
                    };
                    if (range.br) {
                        rangeOption.br = { col: range.br.col, row: range.br.row };
                    } else if (range.ext) {
                        rangeOption.ext = { width: range.ext.width, height: range.ext.height };
                    }

                    destSheet.addImage(newImageId, rangeOption);
                }
            } catch (imgErr) {
                console.error("Error copying image in copySheet:", imgErr);
            }
        });
    } catch (err) {
        console.error("Error getting images in copySheet:", err);
    }
}

async function main() {
    try {
        const idIni = 62;
        const idFin = 62;
        console.log(`Querying for range ${idIni} to ${idFin}...`);
        const rawRows = await prisma.$queryRawUnsafe(
            `SELECT * FROM public."fnRptCotizacion"($1, $2)`,
            idIni, idFin
        );
        console.log(`Found ${rawRows.length} rows.`);

        if (rawRows.length === 0) {
            console.log("No rows found. Exit.");
            return;
        }

        // Group rows by idCotizacion
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

        const quotationsDb = await prisma.quotation.findMany({
            where: { id: { in: quotationIds } },
            select: {
                id: true,
                branch: { select: { id: true, template: true, templateConfig: true } },
                implant: { select: { id: true, template: true, templateConfig: true } }
            }
        });

        const qDbMap = new Map(quotationsDb.map(q => [q.id, q]));
        const outWorkbook = new ExcelJS.Workbook();
        const defaultTemplatePath = path.join(__dirname, '../templates/default_template.xlsx');

        for (const q of groupedList) {
            console.log(`Processing Q#${q.idCotizacion}...`);
            const dbInfo = qDbMap.get(q.idCotizacion);
            const templateBuffer = dbInfo?.implant?.template || dbInfo?.branch?.template;
            const templateConfigRaw = dbInfo?.implant?.templateConfig || dbInfo?.branch?.templateConfig;
            
            let config = DEFAULT_CONFIG;
            if (templateConfigRaw && typeof templateConfigRaw === 'object') {
                config = { ...DEFAULT_CONFIG, ...templateConfigRaw };
            }

            const tempWorkbook = new ExcelJS.Workbook();
            if (templateBuffer) {
                console.log("Using template from database.");
                let finalBuffer = Buffer.from(templateBuffer);
                if (finalBuffer[0] === 0xD0 && finalBuffer[1] === 0xCF && finalBuffer[2] === 0x11 && finalBuffer[3] === 0xE0) {
                    console.log("Template is XLS, converting to XLSX.");
                    const xlsWorkbook = XLSX.read(finalBuffer, { type: 'buffer' });
                    finalBuffer = XLSX.write(xlsWorkbook, { bookType: 'xlsx', type: 'buffer' });
                }
                await tempWorkbook.xlsx.load(finalBuffer);
            } else {
                console.log("Using default template.");
                await tempWorkbook.xlsx.readFile(defaultTemplatePath);
            }

            const srcSheet = tempWorkbook.getWorksheet(1);
            if (!srcSheet) {
                console.log("No sheet found in tempWorkbook");
                continue;
            }

            const destSheet = outWorkbook.addWorksheet(`Cotización ${q.idCotizacion}`);
            
            console.log("Copying sheet...");
            copySheet(srcSheet, destSheet, tempWorkbook, outWorkbook);

            const setVal = (cellKey, value) => {
                if (cellKey) {
                    const cell = destSheet.getCell(cellKey);
                    cell.value = value;
                }
            };

            setVal(config.asesor, q.asesor || '');
            setVal(config.fecha, q.fecha ? new Date(q.fecha) : '');
            setVal(config.clienteNombre, q.clienteNombre || '');
            setVal(config.clienteIdentificacion, q.clienteIdentificacion || '');
            setVal(config.clienteDireccion, q.clienteDireccion || '');
            setVal(config.clienteTelefono, q.clienteTelefono || '');
            setVal(config.tCambio, q.tCambio);
            setVal(config.descripcionPlan, q.descripcionPlan || '');
            setVal(config.pasajeros, q.pasajeros || 'Mismo titular');
            setVal(config.totalAdultos, q.totalAdultos);
            setVal(config.totalNinos, q.totalNinos);

            const prov1 = q.providers[0];
            if (prov1) {
                setVal(config.proveedor1Nombre, prov1.nombre);
                setVal(config.proveedor1NIT, prov1.nit);
                setVal(config.proveedor1Contacto, prov1.contacto);

                setVal(config.prov1TarifaNeta, prov1.tarifaNeta);
                setVal(config.prov1TarifaNetaPago, prov1.tarifaNeta - prov1.comision);
                setVal(config.prov1Impuestos, prov1.impuestos);
                setVal(config.prov1ImpuestosPago, prov1.impuestos);
                setVal(config.prov1Adicionales, prov1.adicionalesServ);
                setVal(config.prov1AdicionalesPago, prov1.adicionalesServ);
                setVal(config.prov1Comision, prov1.comision);
                setVal(config.prov1Descuento, prov1.descuento);
                setVal(config.prov1Sobrecomision, prov1.sobrecomision);
                setVal(config.prov1Fee, prov1.fee);
                setVal(config.prov1Total, prov1.total);
                setVal(config.prov1TotalPago, prov1.total - prov1.comision);
            }

            const prov2 = q.providers[1];
            if (prov2) {
                setVal(config.proveedor2Nombre, prov2.nombre);
                setVal(config.proveedor2NIT, prov2.nit);
                setVal(config.proveedor2Contacto, prov2.contacto);

                setVal(config.prov2TarifaNeta, prov2.tarifaNeta);
                setVal(config.prov2TarifaNetaPago, prov2.tarifaNeta - prov2.comision);
                setVal(config.prov2Impuestos, prov2.impuestos);
                setVal(config.prov2ImpuestosPago, prov2.impuestos);
                setVal(config.prov2Adicionales, prov2.adicionalesServ);
                setVal(config.prov2AdicionalesPago, prov2.adicionalesServ);
                setVal(config.prov2Comision, prov2.comision);
                setVal(config.prov2Descuento, prov2.descuento);
                setVal(config.prov2Sobrecomision, prov2.sobrecomision);
                setVal(config.prov2Fee, prov2.fee);
                setVal(config.prov2Total, prov2.total);
                setVal(config.prov2TotalPago, prov2.total - prov2.comision);
            }

            setVal(config.baseComisionable, q.baseComisionable);
            setVal(config.comisionAsesor, q.comisionAsesor);
            setVal(config.baseComisionTop, q.baseComisionable - q.comisionAsesor);
            setVal(config.observaciones, q.observaciones || '');
            setVal(config.fechasViaje, q.fechasViaje || '');
            setVal(config.hotelesServicios, q.hotelesServicios || '');

            const totalTarifaNeta = q.providers.reduce((sum, p) => sum + p.tarifaNeta, 0);
            const totalImpuestos = q.providers.reduce((sum, p) => sum + p.impuestos, 0);
            const totalAdicionalesServ = q.providers.reduce((sum, p) => sum + p.adicionalesServ, 0);
            const totalComision = q.providers.reduce((sum, p) => sum + p.comision, 0);
            const totalDescuento = q.providers.reduce((sum, p) => sum + p.descuento, 0);
            const totalSobrecomision = q.providers.reduce((sum, p) => sum + p.sobrecomision, 0);
            const totalFee = q.providers.reduce((sum, p) => sum + p.fee, 0);
            const totalTotal = q.providers.reduce((sum, p) => sum + p.total, 0);

            setVal(config.tarifaNeta, totalTarifaNeta);
            setVal(config.tarifaNetaPago, totalTarifaNeta - totalComision);
            setVal(config.impuestos, totalImpuestos);
            setVal(config.impuestosPago, totalImpuestos);
            setVal(config.adicionalesServ, totalAdicionalesServ);
            setVal(config.adicionalesServPago, totalAdicionalesServ);
            setVal(config.comision, totalComision);
            setVal(config.descuento, totalDescuento);
            setVal(config.sobrecomision, totalSobrecomision);
            setVal(config.fee, totalFee);
            setVal(config.total, totalTotal);
            setVal(config.totalPago, totalTotal - totalComision);
            setVal(config.idCotizacion, q.idCotizacion);

            Object.entries(config).forEach(([key, cellKey]) => {
                if (cellKey && typeof cellKey === 'string' && key !== '__customNames') {
                    const standardKeys = [
                        'asesor', 'fecha', 'clienteNombre', 'clienteIdentificacion', 'clienteDireccion',
                        'clienteTelefono', 'tCambio', 'descripcionPlan', 'pasajeros', 'totalAdultos', 'totalNinos',
                        'baseComisionable', 'comisionAsesor', 'baseComisionTop', 'observaciones', 'idCotizacion',
                        'fechasViaje', 'hotelesServicios', 'tarifaNeta', 'tarifaNetaPago', 'impuestos', 'impuestosPago',
                        'adicionalesServ', 'adicionalesServPago', 'comision', 'descuento', 'sobrecomision', 'fee',
                        'total', 'totalPago'
                    ];
                    if (!standardKeys.includes(key) && !key.startsWith('prov') && !key.startsWith('proveedor')) {
                        const qVal = q[key];
                        if (qVal !== undefined && qVal !== null) {
                            setVal(cellKey, qVal);
                        }
                    }
                }
            });

            if (q.logo) {
                try {
                    const imageId = outWorkbook.addImage({
                        buffer: Buffer.from(q.logo),
                        extension: 'png',
                    });

                    const logoCell = config.logo || 'A1';
                    const colName = logoCell.match(/[A-Z]+/)[0] || 'A';
                    const rowNum = parseInt(logoCell.match(/\d+/)[0] || '1') - 1;
                    const colIndex = colNameToIndex(colName);

                    destSheet.addImage(imageId, {
                        tl: { col: colIndex, row: rowNum },
                        ext: { width: 120, height: 48 },
                        editAs: 'oneCell'
                    });
                } catch (logoErr) {
                    console.error("Error embedding logo in Excel sheet:", logoErr);
                }
            }
        }

        const outPath = path.join(__dirname, 'corrupted_test.xlsx');
        console.log("Writing to file:", outPath);
        await outWorkbook.xlsx.writeFile(outPath);
        console.log("Done generating file.");
    } catch (err) {
        console.error("Main execution error:", err);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
