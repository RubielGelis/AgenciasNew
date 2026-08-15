import ExcelJS from 'exceljs';
import path from 'path';

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(path.join(process.cwd(), 'templates', 'default_template.xlsx'));
const sheet = workbook.getWorksheet(1);
console.log('=== ESTRUCTURA DE PLANTILLA POR DEFECTO ===');
for (let r = 1; r <= 20; r++) {
    const row = sheet.getRow(r);
    const cells = [];
    for (let c = 1; c <= 10; c++) {
        cells.push({
            address: row.getCell(c).address,
            value: row.getCell(c).value
        });
    }
    console.log(`Fila ${r}:`, JSON.stringify(cells));
}
