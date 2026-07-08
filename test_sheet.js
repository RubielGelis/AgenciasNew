import ExcelJS from 'exceljs';

async function test() {
    const workbook = new ExcelJS.Workbook();
    const sheet1 = workbook.addWorksheet('MySheet');
    console.log("Sheet 1 ID:", sheet1.id); // Usually 1
    console.log("getWorksheet(1):", !!workbook.getWorksheet(1));
    console.log("worksheets[0]:", !!workbook.worksheets[0]);

    // What if we delete it and add another?
    workbook.removeWorksheet(sheet1.id);
    const sheet2 = workbook.addWorksheet('MySheet2');
    console.log("Sheet 2 ID:", sheet2.id); // Usually 2
    console.log("getWorksheet(1):", !!workbook.getWorksheet(1));
    console.log("worksheets[0]:", !!workbook.worksheets[0]);
}
test();
