import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import ExcelJS from 'exceljs'
import path from 'path'
import * as XLSX from 'xlsx'
import fs from 'fs'
import { generateHtmlTemplate } from '@/lib/excel-to-html'

interface ProviderInfo {
    nombre: string;
    nit: string;
    contacto: string;
    tarifaNeta: number;
    impuestos: number;
    adicionalesServ: number;
    comision: number;
    descuento: number;
    sobrecomision: number;
    fee: number;
    total: number;
}

interface GroupedQuotation {
    idCotizacion: number;
    asesor: string;
    fecha: string;
    clienteNombre: string;
    clienteIdentificacion: string;
    clienteDireccion: string;
    clienteTelefono: string;
    tCambio: number;
    descripcionPlan: string;
    pasajeros: string;
    totalAdultos: number;
    totalNinos: number;
    baseComisionable: number;
    comisionAsesor: number;
    observaciones: string;
    logo: Buffer | null;
    fechasViaje: string;
    hotelesServicios: string;
    providers: ProviderInfo[];
}

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

function colNameToIndex(colName: string): number {
    let index = 0;
    for (let i = 0; i < colName.length; i++) {
        index = index * 26 + (colName.charCodeAt(i) - 64);
    }
    return index - 1;
}

function copySheet(
    srcSheet: ExcelJS.Worksheet, 
    destSheet: ExcelJS.Worksheet, 
    srcWorkbook: ExcelJS.Workbook, 
    destWorkbook: ExcelJS.Workbook
) {
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

    const merges = (srcSheet.model as any).merges || [];
    merges.forEach((m: string) => {
        try {
            destSheet.mergeCells(m);
        } catch (mergeErr) {
            console.error("Error merging cell in copySheet:", mergeErr);
        }
    });

    srcSheet.eachRow({ includeEmpty: true }, (row, rowNum) => {
        const destRow = destSheet.getRow(rowNum);
        destRow.height = row.height;
        if ((row as any).style) {
            (destRow as any).style = JSON.parse(JSON.stringify((row as any).style));
        }

        row.eachCell({ includeEmpty: true }, (cell, colNum) => {
            const destCell = destRow.getCell(colNum);
            destCell.value = cell.value;
            
            const style: any = {};
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

    // Copy images from source sheet to destination sheet
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
                    
                    // Safety clone of image range to avoid circular reference / sheet mismatch corruption
                    const range = img.range as any;
                    const rangeOption: any = {
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

function getCellText(cell: ExcelJS.Cell): string {
    if (cell.value === null || cell.value === undefined) return '';
    if (typeof cell.value === 'object') {
        if ('result' in cell.value) {
            const res = (cell.value as any).result;
            if ((res as any) instanceof Date) {
                return (res as any).toLocaleDateString();
            }
            return res !== null && res !== undefined ? String(res) : '';
        }
        if ('richText' in cell.value) {
            return (cell.value as any).richText.map((rt: any) => rt.text || '').join('');
        }
        if ('text' in cell.value) {
            return String((cell.value as any).text || '');
        }
        return '';
    }
    if ((cell.value as any) instanceof Date) {
        return (cell.value as any).toLocaleDateString();
    }
    return String(cell.value);
}

function parseColor(colorObj: any): string | null {
    if (!colorObj) return null;
    if (colorObj.argb) {
        const argb = colorObj.argb;
        if (argb.length === 8) {
            return `#${argb.substring(2)}`;
        }
        return `#${argb}`;
    }
    if (colorObj.theme !== undefined) {
        const standardThemes = [
            '#FFFFFF', // 0: White
            '#000000', // 1: Black
            '#E7E6E6', // 2: Light Gray
            '#44546A', // 3: Dark Blue/Gray
            '#5B9BD5', // 4: Blue
            '#ED7D31', // 5: Orange
            '#A5A5A5', // 6: Gray
            '#FFC000', // 7: Gold/Yellow
            '#4472C4', // 8: Blue Accent
            '#70AD47'  // 9: Green
        ];
        return standardThemes[colorObj.theme] || null;
    }
    return null;
}

function parseBorderSide(side: any): string | null {
    if (!side || !side.style) return null;
    const style = side.style;
    const color = parseColor(side.color) || '#000000';
    let width = '1px';
    if (style === 'medium' || style === 'thick') width = '2px';
    return `${width} ${style === 'dotted' || style === 'dashed' ? style : 'solid'} ${color}`;
}

function sheetToHtmlJson(sheet: ExcelJS.Worksheet, outWorkbook: ExcelJS.Workbook) {
    const merges = (sheet.model as any).merges || [];
    const mergeMap = new Map<string, { top: number; left: number; bottom: number; right: number; isTopLeft: boolean }>();
    
    merges.forEach((m: string) => {
        const [startCell, endCell] = m.split(':');
        const startCol = startCell.match(/[A-Z]+/)?.[0] || 'A';
        const startRow = parseInt(startCell.match(/\d+/)?.[0] || '1');
        const endCol = (endCell || startCell).match(/[A-Z]+/)?.[0] || 'A';
        const endRow = parseInt((endCell || startCell).match(/\d+/)?.[0] || '1');
        
        const startColIdx = colNameToIndex(startCol) + 1;
        const endColIdx = colNameToIndex(endCol) + 1;
        
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColIdx; c <= endColIdx; c++) {
                const key = `${r}_${c}`;
                mergeMap.set(key, {
                    top: startRow,
                    left: startColIdx,
                    bottom: endRow,
                    right: endColIdx,
                    isTopLeft: (r === startRow && c === startColIdx)
                });
            }
        }
    });

    const images = sheet.getImages().map(img => {
        try {
            const imageObj = outWorkbook.getImage(Number(img.imageId));
            return {
                range: img.range,
                base64: imageObj.buffer ? `data:image/${imageObj.extension};base64,${Buffer.from(imageObj.buffer).toString('base64')}` : null
            };
        } catch (e) {
            return null;
        }
    }).filter(Boolean);

    const rows = [];
    const maxRow = sheet.rowCount;
    let maxCol = 1;
    sheet.eachRow((row) => {
        if (row.cellCount > maxCol) {
            maxCol = row.cellCount;
        }
    });
    if (maxCol < 15) maxCol = 15;

    for (let r = 1; r <= maxRow; r++) {
        const row = sheet.getRow(r);
        const rowJson = {
            height: row.height,
            cells: [] as any[]
        };

        for (let c = 1; c <= maxCol; c++) {
            const cellKey = `${r}_${c}`;
            const mergeInfo = mergeMap.get(cellKey);
            
            if (mergeInfo && !mergeInfo.isTopLeft) {
                rowJson.cells.push({ isMerged: true });
                continue;
            }

            const cell = row.getCell(c);
            const cellImage = images.find(img => img && Math.floor(img.range.tl.row) === r - 1 && Math.floor(img.range.tl.col) === c - 1);

            const cellJson = {
                value: cell.value,
                text: getCellText(cell),
                address: cell.address,
                isMerged: false,
                rowSpan: mergeInfo ? (mergeInfo.bottom - mergeInfo.top + 1) : 1,
                colSpan: mergeInfo ? (mergeInfo.right - mergeInfo.left + 1) : 1,
                image: cellImage ? cellImage.base64 : null,
                style: {
                    fontFamily: cell.font?.name || null,
                    fontSize: cell.font?.size || null,
                    fontWeight: cell.font?.bold ? 'bold' : 'normal',
                    fontStyle: cell.font?.italic ? 'italic' : 'normal',
                    color: parseColor(cell.font?.color),
                    backgroundColor: parseColor((cell.fill as any)?.fgColor),
                    textAlign: cell.alignment?.horizontal || 'left',
                    verticalAlign: cell.alignment?.vertical || 'middle',
                    borderTop: parseBorderSide(cell.border?.top),
                    borderBottom: parseBorderSide(cell.border?.bottom),
                    borderLeft: parseBorderSide(cell.border?.left),
                    borderRight: parseBorderSide(cell.border?.right),
                }
            };

            rowJson.cells.push(cellJson);
        }
        rows.push(rowJson);
    }

    const colWidths = [];
    for (let c = 1; c <= maxCol; c++) {
        const col = sheet.getColumn(c);
        colWidths.push(col.width || 10);
    }

    return {
        name: sheet.name,
        rows,
        colWidths
    };
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const idIni = searchParams.get('idIni');
        const idFin = searchParams.get('idFin');

        if (!idIni || !idFin) {
            return NextResponse.json({ error: 'idIni and idFin are required' }, { status: 400 });
        }

        // 1. Fetch raw quotation data from database function
        const rawRows: any[] = await prisma.$queryRawUnsafe(
            `SELECT * FROM public."fnRptCotizacion"($1, $2)`,
            parseInt(idIni), parseInt(idFin)
        );

        if (rawRows.length === 0) {
            return NextResponse.json({ error: 'No data found for the specified range' }, { status: 404 });
        }

        // Group rows by idCotizacion
        const grouped: { [key: number]: GroupedQuotation } = {};
        rawRows.forEach((row: any) => {
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
                    logo: row.logo, // Buffer from raw query
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

        // 2. Fetch template files and coordinates configuration for each quotation
        const quotationsDb = await prisma.quotation.findMany({
            where: { id: { in: quotationIds } },
            select: {
                id: true,
                branch: { select: { id: true, template: true, templateConfig: true, htmlTemplate: true } },
                implant: { select: { id: true, template: true, templateConfig: true, htmlTemplate: true } }
            }
        });

        const qDbMap = new Map(quotationsDb.map(q => [q.id, q]));

        // Initialize output workbook
        const outWorkbook = new ExcelJS.Workbook();
        const defaultTemplatePath = path.join(process.cwd(), 'templates', 'default_template.xlsx');

        for (const q of groupedList) {
            const dbInfo = qDbMap.get(q.idCotizacion);
            const templateBuffer = dbInfo?.implant?.template || dbInfo?.branch?.template;
            const templateConfigRaw = dbInfo?.implant?.templateConfig || dbInfo?.branch?.templateConfig;
            
            let config = DEFAULT_CONFIG;
            if (templateConfigRaw && typeof templateConfigRaw === 'object') {
                config = { ...DEFAULT_CONFIG, ...(templateConfigRaw as any) };
            }

            // Load template workbook
            const tempWorkbook = new ExcelJS.Workbook();
            if (templateBuffer) {
                let finalBuffer = Buffer.from(templateBuffer as any) as any;
                // Check for OLE2 Compound File signature (indicating .xls binary file)
                if (finalBuffer[0] === 0xD0 && finalBuffer[1] === 0xCF && finalBuffer[2] === 0x11 && finalBuffer[3] === 0xE0) {
                    try {
                        const xlsWorkbook = XLSX.read(finalBuffer, { type: 'buffer' });
                        finalBuffer = XLSX.write(xlsWorkbook, { bookType: 'xlsx', type: 'buffer' });
                    } catch (convErr) {
                        console.error("Error converting XLS template to XLSX:", convErr);
                    }
                }
                await tempWorkbook.xlsx.load(finalBuffer);
            } else {
                await tempWorkbook.xlsx.readFile(defaultTemplatePath);
            }

            const srcSheet = tempWorkbook.getWorksheet(1);
            if (!srcSheet) continue;

            const destSheet = outWorkbook.addWorksheet(`Cotización ${q.idCotizacion}`);
            
            // Clone template sheet layout & styles
            copySheet(srcSheet, destSheet, tempWorkbook, outWorkbook);

            // Clear configuration JSON or metadata from cell A1 and the logo cell
            const a1Cell = destSheet.getCell('A1');
            const a1Val = a1Cell.value;
            if (a1Val && typeof a1Val === 'string' && a1Val.trim().startsWith('{')) {
                a1Cell.value = '';
            }
            const logoCellKey = config.logo || 'A1';
            const logoCell = destSheet.getCell(logoCellKey);
            const logoVal = logoCell.value;
            if (logoVal && typeof logoVal === 'string' && (logoVal.trim().startsWith('{') || logoVal.includes('logo'))) {
                logoCell.value = '';
            }

            // Populate cells based on config mapping
            const setVal = (cellKey: string, value: any) => {
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

            // Providers data
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

            setVal((config as any).tarifaNeta, totalTarifaNeta);
            setVal((config as any).tarifaNetaPago, totalTarifaNeta - totalComision);
            setVal((config as any).impuestos, totalImpuestos);
            setVal((config as any).impuestosPago, totalImpuestos);
            setVal((config as any).adicionalesServ, totalAdicionalesServ);
            setVal((config as any).adicionalesServPago, totalAdicionalesServ);
            setVal((config as any).comision, totalComision);
            setVal((config as any).descuento, totalDescuento);
            setVal((config as any).sobrecomision, totalSobrecomision);
            setVal((config as any).fee, totalFee);
            setVal((config as any).total, totalTotal);
            setVal((config as any).totalPago, totalTotal - totalComision);
            setVal((config as any).idCotizacion, q.idCotizacion);

            // Dynamically set any other columns from config/q
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
                    if (!standardKeys.includes(key) && !key.startsWith('prov') && !key.startsWith('proveedor') && key !== 'logo') {
                        const qVal = (q as any)[key];
                        if (qVal !== undefined && qVal !== null) {
                            setVal(cellKey, qVal);
                        }
                    }
                }
            });

            // Forcefully clear cell A1 and the designated logo cell to remove any copied JSON or buffer strings
            destSheet.getCell('A1').value = null;
            if (config.logo) {
                destSheet.getCell(config.logo).value = null;
            }

            // Inject logo if present
            if (q.logo) {
                try {
                    const imageId = outWorkbook.addImage({
                        buffer: Buffer.from(q.logo as any) as any,
                        extension: 'png',
                    });

                    const logoCell = config.logo || 'A1';
                    const colName = logoCell.match(/[A-Z]+/)?.[0] || 'A';
                    const rowNum = parseInt(logoCell.match(/\d+/)?.[0] || '1') - 1;
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

        const formatParam = searchParams.get('format');
        if (formatParam === 'html') {
            // For print layout, return populated HTML strings
            const htmlReports = [];
            
            for (const q of groupedList) {
                const dbInfo = qDbMap.get(q.idCotizacion);
                
                // Force regeneration to apply the new dynamic logo layout and bypass the database cache
                let htmlTemplate = null;
                const templateConfigRaw = dbInfo?.implant?.templateConfig || dbInfo?.branch?.templateConfig;
                
                let config = DEFAULT_CONFIG;
                if (templateConfigRaw && typeof templateConfigRaw === 'object') {
                    config = { ...DEFAULT_CONFIG, ...(templateConfigRaw as any) };
                }

                // If htmlTemplate is missing, auto-generate and cache it
                if (!htmlTemplate) {
                    const templateBuffer = dbInfo?.implant?.template || dbInfo?.branch?.template;
                    if (templateBuffer) {
                        try {
                            htmlTemplate = await generateHtmlTemplate(Buffer.from(templateBuffer), config);
                            
                            // Cache it in database
                            if (dbInfo?.implant) {
                                await prisma.implant.update({
                                    where: { id: dbInfo.implant.id },
                                    data: { htmlTemplate }
                                });
                            } else if (dbInfo?.branch) {
                                await prisma.branch.update({
                                    where: { id: dbInfo.branch.id },
                                    data: { htmlTemplate }
                                });
                            }
                        } catch (err) {
                            console.error(`Error auto-generating htmlTemplate for quotation ${q.idCotizacion}:`, err);
                        }
                    }
                }

                // Fallback to default template if still missing
                if (!htmlTemplate) {
                    try {
                        const defaultTemplatePath = path.join(process.cwd(), 'templates', 'default_template.xlsx');
                        const defaultBuffer = fs.readFileSync(defaultTemplatePath);
                        htmlTemplate = await generateHtmlTemplate(defaultBuffer, config);
                    } catch (err) {
                        console.error(`Error loading default template HTML:`, err);
                        htmlTemplate = '<div>No template layout available.</div>';
                    }
                }

                // Interpolate quotation values into tokens
                let compiledHtml = htmlTemplate;

                // Format values for replacement
                const formatDate = (dStr: string) => {
                    if (!dStr) return '';
                    const d = new Date(dStr);
                    return isNaN(d.getTime()) ? dStr : d.toLocaleDateString();
                };

                const formatCurrency = (val: number) => {
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

                const replacements: { [key: string]: string } = {
                    logo: q.logo ? `<img src="data:image/png;base64,${Buffer.from(q.logo as any).toString('base64')}" alt="Logo" style="max-height: 48px; max-width: 120px; object-fit: contain; display: block; margin: auto;" />` : '',
                    asesor: q.asesor || '',
                    fecha: formatDate(q.fecha),
                    clienteNombre: q.clienteNombre || '',
                    clienteIdentificacion: q.clienteIdentificacion || '',
                    clienteDireccion: q.clienteDireccion || '',
                    clienteTelefono: q.clienteTelefono || '',
                    centroCosto: '', // Fill empty for cc
                    solicita: '', // Fill empty for solicita
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

                    // Overall Totals
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

                    // Provider 1
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

                    // Provider 2
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

                // Add any dynamic properties present in the query row 'q'
                Object.keys(q).forEach(key => {
                    if (replacements[key] === undefined && key !== 'logo') {
                        const qVal = (q as any)[key];
                        replacements[key] = qVal !== null && qVal !== undefined ? String(qVal) : '';
                    }
                });

                // Replace all instances of {{key}} with value
                Object.entries(replacements).forEach(([key, val]) => {
                    const token = `{{${key}}}`;
                    compiledHtml = compiledHtml.split(token).join(val);
                });

                htmlReports.push({
                    idCotizacion: q.idCotizacion,
                    html: compiledHtml
                });
            }

            return NextResponse.json(htmlReports);
        }

        if (formatParam === 'json') {
            const worksheetsJson = [];
            for (const sheet of outWorkbook.worksheets) {
                worksheetsJson.push(sheetToHtmlJson(sheet, outWorkbook));
            }
            return NextResponse.json(worksheetsJson);
        }

        const buffer = await outWorkbook.xlsx.writeBuffer();

        return new Response(buffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=Reporte_Cotizaciones_${idIni}_a_${idFin}.xlsx`
            }
        });

    } catch (error: any) {
        console.error('Error generating dynamic Excel report:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
