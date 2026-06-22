const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('C:\\Proyectos\\AgenciasNew\\FO-ADM-017. Formato venta con mayoristas u operador.xls');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log("All rows of the first sheet:");
  console.log(JSON.stringify(data, null, 2));
} catch (err) {
  console.error("Error reading file:", err);
}
