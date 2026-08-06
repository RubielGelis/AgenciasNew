const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

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
        const defaultTemplatePath = path.join(__dirname, '../templates/default_template.xlsx');
        console.log("Loading", defaultTemplatePath);
        const tempWorkbook = new ExcelJS.Workbook();
        await tempWorkbook.xlsx.readFile(defaultTemplatePath);
        
        const srcSheet = tempWorkbook.getWorksheet(1);
        if (!srcSheet) {
            console.log("No sheet found in tempWorkbook");
            return;
        }

        const outWorkbook = new ExcelJS.Workbook();
        const destSheet = outWorkbook.addWorksheet(`Cotización 62`);
        
        console.log("Copying sheet...");
        copySheet(srcSheet, destSheet, tempWorkbook, outWorkbook);

        const outPath = path.join(__dirname, 'test_no_db.xlsx');
        console.log("Writing to file:", outPath);
        await outWorkbook.xlsx.writeFile(outPath);
        console.log("Done generating file.");
    } catch (err) {
        console.error("Main execution error:", err);
    }
}

main();
