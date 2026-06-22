const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const srcPath = 'C:\\Proyectos\\AgenciasNew\\FO-ADM-017. Formato venta con mayoristas u operador.xls';
        const destDir = 'C:\\Proyectos\\AgenciasNew\\templates';
        const destPath = path.join(destDir, 'default_template.xlsx');

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        console.log("Reading legacy XLS file...");
        const workbook = XLSX.readFile(srcPath);

        console.log("Writing modern XLSX file...");
        XLSX.writeFile(workbook, destPath);

        console.log(`Success! Legacy file converted and saved to: ${destPath}`);
    } catch (e) {
        console.error("Error converting file:", e);
    }
}

main();
