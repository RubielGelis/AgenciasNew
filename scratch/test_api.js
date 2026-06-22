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
        const results = await prisma.$queryRawUnsafe(
            `SELECT * FROM public."fnRptCotizacion"($1, $2)`,
            44, 44
        );
        console.log("SUCCESS:", results.length, "rows returned");
        if (results.length > 0) {
            console.log("Row sample keys:", Object.keys(results[0]));
            console.log("Row sample data:", results[0]);
        }
    } catch (e) {
        console.error("ERROR EXECUTION:", e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
