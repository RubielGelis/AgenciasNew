import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo'
});

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL');

  // Create QuotationFormat table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public."QuotationFormat" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description VARCHAR(255),
      template BYTEA,
      "templateConfig" JSONB,
      "htmlTemplate" TEXT,
      "branchId" INTEGER REFERENCES public."Branch"(id) ON DELETE CASCADE,
      "implantId" INTEGER REFERENCES public."Implant"(id) ON DELETE CASCADE,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('QuotationFormat table created or already exists');

  // Create FormatCellCustomization table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public."FormatCellCustomization" (
      id SERIAL PRIMARY KEY,
      "formatId" INTEGER NOT NULL REFERENCES public."QuotationFormat"(id) ON DELETE CASCADE,
      code VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL,
      value VARCHAR(10),
      CONSTRAINT "FormatCellCustomization_format_code_key" UNIQUE ("formatId", code)
    )
  `);
  console.log('FormatCellCustomization table created or already exists');

  console.log('Done!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => client.end());
