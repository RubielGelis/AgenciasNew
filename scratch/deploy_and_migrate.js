const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const standardFieldsMapping = {
  idCotizacion: 'ID Cotización',
  asesor: 'Asesor',
  fecha: 'Fecha',
  clienteNombre: 'Cliente Nombre',
  clienteIdentificacion: 'Cliente ID',
  clienteDireccion: 'Dirección',
  clienteTelefono: 'Teléfono',
  centroCosto: 'C. Costo',
  solicita: 'Solicita',
  tCambio: 'T. Cambio',
  descripcionPlan: 'Desc Plan',
  fechasViaje: 'Fechas Viaje',
  hotelesServicios: 'Servicios',
  pasajeros: 'Pasajeros',
  totalAdultos: 'Total Adultos',
  totalNinos: 'Total Niños',
  logo: 'Celda Logo',
  proveedor1Nombre: 'Prov 1: Nombre',
  proveedor1NIT: 'Prov 1: NIT',
  proveedor1Contacto: 'Prov 1: Contacto',
  prov1TarifaNeta: 'Prov 1: Neta',
  prov1TarifaNetaPago: 'Prov 1: Neta Pago',
  prov1Impuestos: 'Prov 1: Impuestos',
  prov1ImpuestosPago: 'Prov 1: Impuestos Pago',
  prov1Adicionales: 'Prov 1: Adicionales',
  prov1AdicionalesPago: 'Prov 1: Adicionales Pago',
  prov1Comision: 'Prov 1: Comisión',
  prov1Descuento: 'Prov 1: Descuento',
  prov1Sobrecomision: 'Prov 1: Sobrecomisión',
  prov1Fee: 'Prov 1: Fee',
  prov1Total: 'Prov 1: Total',
  prov1TotalPago: 'Prov 1: Total Pago',
  proveedor2Nombre: 'Prov 2: Nombre',
  proveedor2NIT: 'Prov 2: NIT',
  proveedor2Contacto: 'Prov 2: Contacto',
  prov2TarifaNeta: 'Prov 2: Tarifa Neta',
  prov2TarifaNetaPago: 'Prov 2: Neta Pago',
  prov2Impuestos: 'Prov 2: Impuestos',
  prov2ImpuestosPago: 'Prov 2: Impuestos Pago',
  prov2Adicionales: 'Prov 2: Adicionales',
  prov2AdicionalesPago: 'Prov 2: Adicionales Pago',
  prov2Comision: 'Prov 2: Comisión',
  prov2Descuento: 'Prov 2: Descuento',
  prov2Sobrecomision: 'Prov 2: Sobrecomisión',
  prov2Fee: 'Prov 2: Fee',
  prov2Total: 'Prov 2: Total',
  prov2TotalPago: 'Prov 2: Total Pago',
  tarifaNeta: 'Total: Tarifa Neta',
  tarifaNetaPago: 'Total: Neta Pago',
  impuestos: 'Total: Impuestos',
  impuestosPago: 'Total: Impuestos Pago',
  adicionalesServ: 'Total: Adicionales',
  adicionalesServPago: 'Total: Adicionales Pago',
  comision: 'Total: Comisión',
  descuento: 'Total: Descuento',
  sobrecomision: 'Total: Sobrecomisión',
  fee: 'Total: Fee',
  total: 'Total: Total',
  totalPago: 'Total: Total Pago',
  baseComisionable: 'Base Comisión',
  comisionAsesor: 'Comisión Asesor',
  baseComisionTop: 'Comisión Top',
  observaciones: 'Observaciones'
};

async function main() {
  console.log("Starting deployment and migration of database objects...");

  // 1. Deploy Table DDL
  console.log("Creating CellCustomization table...");
  const tableDdl = `
    CREATE SEQUENCE IF NOT EXISTS public."CellCustomization_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
    
    CREATE TABLE IF NOT EXISTS public."CellCustomization" (
        id integer NOT NULL DEFAULT nextval('"CellCustomization_id_seq"'::regclass),
        code VARCHAR(50) NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "value" VARCHAR(10),
        "branchId" integer,
        "implantId" integer,
        CONSTRAINT "CellCustomization_pkey" PRIMARY KEY (id),
        CONSTRAINT "CellCustomization_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES public."Branch" (id) ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT "CellCustomization_implantId_fkey" FOREIGN KEY ("implantId") REFERENCES public."Implant" (id) ON UPDATE CASCADE ON DELETE CASCADE
    ) TABLESPACE pg_default;
    
    ALTER SEQUENCE public."CellCustomization_id_seq" OWNED BY public."CellCustomization".id;
    
    CREATE UNIQUE INDEX IF NOT EXISTS "CellCustomization_branch_code_key" ON public."CellCustomization" ("branchId", "code") WHERE "branchId" IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS "CellCustomization_implant_code_key" ON public."CellCustomization" ("implantId", "code") WHERE "implantId" IS NOT NULL;
  `;
  await prisma.$executeRawUnsafe(tableDdl);
  console.log("CellCustomization table created/verified successfully.");

  // 2. Deploy Functions & Stored Procedures
  const functionPath = path.join(__dirname, '../SQL/Function/fnCellCustomizationListar.sql');
  const upsertSpPath = path.join(__dirname, '../SQL/SP/spCellCustomizationUpsert.sql');
  const deleteSpPath = path.join(__dirname, '../SQL/SP/spCellCustomizationDelete.sql');

  console.log("Deploying fnCellCustomizationListar...");
  const fnSql = fs.readFileSync(functionPath, 'utf8');
  await prisma.$executeRawUnsafe(fnSql);

  console.log("Deploying spCellCustomizationUpsert...");
  const upsertSql = fs.readFileSync(upsertSpPath, 'utf8');
  await prisma.$executeRawUnsafe(upsertSql);

  console.log("Deploying spCellCustomizationDelete...");
  const deleteSql = fs.readFileSync(deleteSpPath, 'utf8');
  await prisma.$executeRawUnsafe(deleteSql);
  console.log("Database objects deployed successfully.");

  // 3. Migrate existing templateConfig data to physical table
  console.log("Starting migration of existing templateConfigs...");

  // Fetch branches
  const branches = await prisma.branch.findMany({
    select: { id: true, code: true, templateConfig: true }
  });

  for (const branch of branches) {
    if (branch.templateConfig && typeof branch.templateConfig === 'object') {
      console.log(`Migrating branch ${branch.code}...`);
      const config = branch.templateConfig;
      const customNames = config.__customNames || {};

      for (const [key, val] of Object.entries(config)) {
        if (key === '__customNames') continue;

        // Determine description
        let name = standardFieldsMapping[key] || customNames[key];
        if (!name) {
          name = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        }

        // Call SP to upsert with lowercase name to match PG case insensitivity
        await prisma.$executeRawUnsafe(
          `CALL public.spCellCustomizationUpsert($1::text, $2::text, $3::text, $4::integer, NULL::integer)`,
          key, name, val || '', branch.id
        );
      }
    }
  }

  // Fetch implants
  const implants = await prisma.implant.findMany({
    select: { id: true, code: true, templateConfig: true }
  });

  for (const implant of implants) {
    if (implant.templateConfig && typeof implant.templateConfig === 'object') {
      console.log(`Migrating implant ${implant.code}...`);
      const config = implant.templateConfig;
      const customNames = config.__customNames || {};

      for (const [key, val] of Object.entries(config)) {
        if (key === '__customNames') continue;

        // Determine description
        let name = standardFieldsMapping[key] || customNames[key];
        if (!name) {
          name = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        }

        // Call SP to upsert with lowercase name to match PG case insensitivity
        await prisma.$executeRawUnsafe(
          `CALL public.spCellCustomizationUpsert($1::text, $2::text, $3::text, NULL::integer, $4::integer)`,
          key, name, val || '', implant.id
        );
      }
    }
  }

  // 4. Verify Seeding for default BOG if needed
  console.log("Verifying default cell mappings seed...");
  const bogBranch = await prisma.branch.findFirst({ where: { code: 'BOG' } });
  if (bogBranch) {
    const count = await prisma.$queryRawUnsafe(
      `SELECT count(*)::integer FROM public."CellCustomization" WHERE "branchId" = $1`,
      bogBranch.id
    );
    console.log(`BOG has ${count[0].count} mapped cells.`);
    if (count[0].count === 0) {
      console.log("Seeding BOG cells...");
      const seedSql = fs.readFileSync(path.join(__dirname, '../SQL/Data/Inicial.sql'), 'utf8');
      // We extract or run the seed block
      const startIdx = seedSql.indexOf('-- 22. CellCustomizations');
      if (startIdx !== -1) {
        const seedBlock = seedSql.substring(startIdx);
        await prisma.$executeRawUnsafe(seedBlock);
        console.log("BOG seed executed.");
      } else {
        console.log("Could not find CellCustomizations seed block in Inicial.sql, relying on migrated config.");
      }
    }
  }

  console.log("Migration and deployment complete!");
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
