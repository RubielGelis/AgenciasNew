import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

function colNameToIndex(colName: string): number {
    let index = 0;
    for (let i = 0; i < colName.length; i++) {
        index = index * 26 + (colName.charCodeAt(i) - 64);
    }
    return index - 1;
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

function hasRealStyleOrValue(cell: any): boolean {
    if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
        return true;
    }
    if (cell.fill) {
        if (cell.fill.type === 'pattern' && cell.fill.pattern && cell.fill.pattern !== 'none') {
            if (cell.fill.fgColor || cell.fill.bgColor) {
                return true;
            }
        }
        if (cell.fill.type === 'gradient') {
            return true;
        }
    }
    if (cell.border) {
        const b = cell.border;
        if (
            (b.top && b.top.style && b.top.style !== 'none') ||
            (b.bottom && b.bottom.style && b.bottom.style !== 'none') ||
            (b.left && b.left.style && b.left.style !== 'none') ||
            (b.right && b.right.style && b.right.style !== 'none')
        ) {
            return true;
        }
    }
    return false;
}

function parseBorderSide(side: any): string | null {
    if (!side || !side.style) return null;
    const style = side.style;
    const color = parseColor(side.color) || '#000000';
    let width = '1px';
    if (style === 'medium' || style === 'thick') width = '2px';
    return `${width} ${style === 'dotted' || style === 'dashed' ? style : 'solid'} ${color}`;
}

export async function generateHtmlTemplate(
    templateBuffer: Buffer,
    config: any,
    logoBuffer?: Buffer | null
): Promise<string> {
    let finalBuffer = templateBuffer;
    
    // Check for OLE2 Compound File signature (indicating .xls binary file)
    if (finalBuffer[0] === 0xD0 && finalBuffer[1] === 0xCF && finalBuffer[2] === 0x11 && finalBuffer[3] === 0xE0) {
        try {
            const xlsWorkbook = XLSX.read(finalBuffer, { type: 'buffer' });
            finalBuffer = XLSX.write(xlsWorkbook, { bookType: 'xlsx', type: 'buffer' });
        } catch (convErr) {
            console.error("Error converting XLS template to XLSX in generateHtmlTemplate:", convErr);
        }
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(finalBuffer as any);
    
    const sheet = workbook.worksheets[0];
    if (!sheet) {
        throw new Error("No worksheet found in template");
    }

    // Replace cell values with placeholders based on coordinates config
    if (config && typeof config === 'object') {
        Object.entries(config).forEach(([key, cellKey]) => {
            if (cellKey && typeof cellKey === 'string') {
                try {
                    const cell = sheet.getCell(cellKey);
                    cell.value = `{{${key}}}`;
                } catch (e) {
                    console.error(`Error setting placeholder for key ${key} at ${cellKey}:`, e);
                }
            }
        });
    }

    // Inject logo if provided and config.logo is defined
    if (logoBuffer && config && config.logo) {
        try {
            const logoCell = config.logo;
            const colName = logoCell.match(/[A-Z]+/)?.[0] || 'A';
            const rowNum = parseInt(logoCell.match(/\d+/)?.[0] || '1') - 1;
            const colIndex = colNameToIndex(colName);

            const imageId = workbook.addImage({
                buffer: logoBuffer as any,
                extension: 'png',
            });

            sheet.addImage(imageId, {
                tl: { col: colIndex, row: rowNum },
                ext: { width: 120, height: 48 },
                editAs: 'oneCell'
            });
        } catch (logoErr) {
            console.error("Error embedding logo in generateHtmlTemplate:", logoErr);
        }
    }

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
            const imageObj = workbook.getImage(Number(img.imageId));
            return {
                range: img.range,
                base64: imageObj.buffer ? `data:image/${imageObj.extension};base64,${Buffer.from(imageObj.buffer).toString('base64')}` : null
            };
        } catch (e) {
            return null;
        }
    }).filter(Boolean);

    // Compute actual boundary limits
    let lastUsefulRow = 0;
    for (let r = 1; r <= sheet.rowCount; r++) {
        const row = sheet.getRow(r);
        let rowHasSomething = false;
        row.eachCell({ includeEmpty: true }, (cell) => {
            if (hasRealStyleOrValue(cell)) {
                rowHasSomething = true;
            }
        });
        if (rowHasSomething) {
            lastUsefulRow = r;
        }
    }

    let maxImageRow = 0;
    images.forEach(img => {
        if (img && img.range && img.range.br && img.range.br.row !== undefined) {
            const brRow = Math.floor(img.range.br.row) + 1;
            if (brRow > maxImageRow) {
                maxImageRow = brRow;
            }
        }
    });

    const maxRow = Math.max(lastUsefulRow, maxImageRow) || 1;

    let lastUsefulCol = 0;
    for (let r = 1; r <= maxRow; r++) {
        const row = sheet.getRow(r);
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (hasRealStyleOrValue(cell)) {
                if (colNumber > lastUsefulCol) {
                    lastUsefulCol = colNumber;
                }
            }
        });
    }

    let maxImageCol = 0;
    images.forEach(img => {
        if (img && img.range && img.range.br && img.range.br.col !== undefined) {
            const brCol = Math.floor(img.range.br.col) + 1;
            if (brCol > maxImageCol) {
                maxImageCol = brCol;
            }
        }
    });

    const maxCol = Math.max(lastUsefulCol, maxImageCol) || 1;

    let html = `<table class="excel-table border-collapse table-fixed select-none mx-auto print:mx-0" style="font-family: Arial, sans-serif; width: fit-content; line-height: 1.2; border-spacing: 0; border-collapse: collapse;">`;
    
    html += `<colgroup>`;
    for (let c = 1; c <= maxCol; c++) {
        const col = sheet.getColumn(c);
        const w = col.width || 10;
        html += `<col style="width: ${w * 7.5}px;" />`;
    }
    html += `</colgroup><tbody>`;

    for (let r = 1; r <= maxRow; r++) {
        const row = sheet.getRow(r);
        const heightStyle = row.height ? `height: ${row.height * 1.3}px;` : '';
        html += `<tr style="${heightStyle}">`;

        for (let c = 1; c <= maxCol; c++) {
            const cellKey = `${r}_${c}`;
            const mergeInfo = mergeMap.get(cellKey);
            
            if (mergeInfo && !mergeInfo.isTopLeft) {
                continue;
            }

            const cell = row.getCell(c);
            const logoCell = config?.logo || 'A1';
            const logoColName = logoCell.match(/[A-Z]+/)?.[0] || 'A';
            const logoRowNum = parseInt(logoCell.match(/\d+/)?.[0] || '1');
            const logoColNum = colNameToIndex(logoColName) + 1;
            const isLogoCell = (r === logoRowNum && c === logoColNum);
            const cellImage = isLogoCell ? null : images.find(img => img && Math.floor(img.range.tl.row) === r - 1 && Math.floor(img.range.tl.col) === c - 1);

            const styles: string[] = [];
            if (cell.font?.name) styles.push(`font-family: ${cell.font.name}`);
            if (cell.font?.size) styles.push(`font-size: ${cell.font.size}pt`);
            if (cell.font?.bold) styles.push(`font-weight: bold`);
            if (cell.font?.italic) styles.push(`font-style: italic`);
            
            const color = parseColor(cell.font?.color);
            if (color) styles.push(`color: ${color}`);
            
            const bgColor = parseColor((cell.fill as any)?.fgColor);
            if (bgColor) styles.push(`background-color: ${bgColor}`);
            
            const horizontalAlign = cell.alignment?.horizontal || 'left';
            styles.push(`text-align: ${horizontalAlign}`);
            
            const verticalAlign = cell.alignment?.vertical || 'middle';
            styles.push(`vertical-align: ${verticalAlign}`);

            let bTop = cell.border?.top;
            let bBottom = cell.border?.bottom;
            let bLeft = cell.border?.left;
            let bRight = cell.border?.right;

            if (mergeInfo) {
                // Find top border from any cell in the top row of the merge range
                for (let col = mergeInfo.left; col <= mergeInfo.right; col++) {
                    const b = sheet.getCell(mergeInfo.top, col).border?.top;
                    if (b && b.style) {
                        bTop = b;
                        break;
                    }
                }
                // Find bottom border from any cell in the bottom row of the merge range
                for (let col = mergeInfo.left; col <= mergeInfo.right; col++) {
                    const b = sheet.getCell(mergeInfo.bottom, col).border?.bottom;
                    if (b && b.style) {
                        bBottom = b;
                        break;
                    }
                }
                // Find left border from any cell in the left col of the merge range
                for (let rNum = mergeInfo.top; rNum <= mergeInfo.bottom; rNum++) {
                    const b = sheet.getCell(rNum, mergeInfo.left).border?.left;
                    if (b && b.style) {
                        bLeft = b;
                        break;
                    }
                }
                // Find right border from any cell in the right col of the merge range
                for (let rNum = mergeInfo.top; rNum <= mergeInfo.bottom; rNum++) {
                    const b = sheet.getCell(rNum, mergeInfo.right).border?.right;
                    if (b && b.style) {
                        bRight = b;
                        break;
                    }
                }
            }

            const borderTop = parseBorderSide(bTop);
            if (borderTop) styles.push(`border-top: ${borderTop}`);
            const borderBottom = parseBorderSide(bBottom);
            if (borderBottom) styles.push(`border-bottom: ${borderBottom}`);
            const borderLeft = parseBorderSide(bLeft);
            if (borderLeft) styles.push(`border-left: ${borderLeft}`);
            const borderRight = parseBorderSide(bRight);
            if (borderRight) styles.push(`border-right: ${borderRight}`);

            styles.push(`padding: 4px`);
            styles.push(`word-break: break-word`);
            styles.push(`white-space: pre-wrap`);

            const rowspanAttr = mergeInfo ? ` rowspan="${mergeInfo.bottom - mergeInfo.top + 1}"` : '';
            const colspanAttr = mergeInfo ? ` colspan="${mergeInfo.right - mergeInfo.left + 1}"` : '';

            html += `<td${rowspanAttr}${colspanAttr} style="${styles.join('; ')};">`;
            
            if (cellImage) {
                html += `<img src="${cellImage.base64}" alt="Logo" style="max-height: 100%; max-width: 100%; object-fit: contain; display: block; margin: auto;" />`;
            } else {
                let cellVal = cell.value;
                if (cellVal !== null && cellVal !== undefined) {
                    let textToShow = '';
                    if (typeof cellVal === 'object') {
                        if ('result' in cellVal) {
                            const res = (cellVal as any).result;
                            if ((res as any) instanceof Date) {
                                textToShow = (res as any).toLocaleDateString();
                            } else {
                                textToShow = res !== null && res !== undefined ? String(res) : '';
                            }
                        } else if ('richText' in cellVal) {
                            textToShow = (cellVal as any).richText.map((rt: any) => rt.text || '').join('');
                        } else if ('text' in cellVal) {
                            textToShow = String((cellVal as any).text || '');
                        } else {
                            textToShow = '';
                        }
                    } else if ((cellVal as any) instanceof Date) {
                        textToShow = (cellVal as any).toLocaleDateString();
                    } else {
                        textToShow = String(cellVal);
                    }
                    html += textToShow;
                }
            }
            html += `</td>`;
        }
        html += `</tr>`;
    }
    
    html += `</tbody></table>`;
    return html;
}
