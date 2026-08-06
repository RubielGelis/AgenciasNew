const ExcelJS = require('exceljs');
const path = require('path');

async function main() {
    try {
        const defaultTemplatePath = path.join(__dirname, '../templates/default_template.xlsx');
        console.log("Loading", defaultTemplatePath);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(defaultTemplatePath);
        console.log("Worksheet count:", workbook.worksheets.length);
        const sheet = workbook.worksheets[0];
        console.log("Sheet Name:", sheet.name);
        console.log("Row count:", sheet.rowCount);
        console.log("Merges:", sheet.model.merges);
        console.log("Views:", sheet.views);
        console.log("PageSetup:", sheet.pageSetup);
        
        let fontCount = 0;
        let fillCount = 0;
        let borderCount = 0;
        
        sheet.eachRow({ includeEmpty: true }, (row, rowNum) => {
            row.eachCell({ includeEmpty: true }, (cell, colNum) => {
                if (cell.font) fontCount++;
                if (cell.fill) fillCount++;
                if (cell.border) borderCount++;
                if (cell.value && typeof cell.value === 'object') {
                    console.log(`Cell ${cell.address} value is object:`, JSON.stringify(cell.value));
                }
            });
        });
        console.log(`Fonts: ${fontCount}, Fills: ${fillCount}, Borders: ${borderCount}`);
    } catch (e) {
        console.error("Error inspecting:", e);
    }
}
main();
