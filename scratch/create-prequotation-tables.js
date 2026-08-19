const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public'
});

async function run() {
    await client.connect();
    console.log('Creando secuencia y tablas para Pre-Cotizaciones en PostgreSQL...');

    // 1. Crear secuencia de consecutivo unificado
    await client.query(`
        CREATE SEQUENCE IF NOT EXISTS public.seq_quotation_consecutivo START WITH 671 INCREMENT BY 1;
    `);
    console.log('✅ Secuencia seq_quotation_consecutivo creada o verificada.');

    // 2. Crear tabla PreQuotation
    await client.query(`
        CREATE TABLE IF NOT EXISTS public."PreQuotation" (
            id SERIAL PRIMARY KEY,
            consecutivo INT UNIQUE NOT NULL,
            "clientNameText" TEXT,
            "clientId" INT REFERENCES public."Client"(id) ON DELETE SET NULL,
            "headerDescription" TEXT,
            "providerId" INT REFERENCES public."Provider"(id) ON DELETE SET NULL,
            "ticketPrinterId" INT REFERENCES public."TicketPrinter"(id) ON DELETE SET NULL,
            "sellerId" INT REFERENCES public."Seller"(id) ON DELETE SET NULL,
            "branchId" INT NOT NULL REFERENCES public."Branch"(id) ON DELETE RESTRICT,
            "preQuotationType" VARCHAR(100),
            "quotationNotice" TEXT,
            "noticeResponse" TEXT,
            "startDate" TIMESTAMP,
            "endDate" TIMESTAMP,
            "customFields" JSONB,
            "state" VARCHAR(50) DEFAULT 'POR COTIZAR',
            "convertedQuotationId" INT REFERENCES public."Quotation"(id) ON DELETE SET NULL,
            "convertedAt" TIMESTAMP,
            "convertedUserId" INT REFERENCES public."User"(id) ON DELETE SET NULL,
            "userId" INT NOT NULL REFERENCES public."User"(id) ON DELETE RESTRICT,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✅ Tabla public."PreQuotation" creada.');

    // 3. Crear tabla PreQuotationStateHistory
    await client.query(`
        CREATE TABLE IF NOT EXISTS public."PreQuotationStateHistory" (
            id SERIAL PRIMARY KEY,
            "preQuotationId" INT NOT NULL REFERENCES public."PreQuotation"(id) ON DELETE CASCADE,
            "state" VARCHAR(50) NOT NULL,
            "description" TEXT,
            "userId" INT NOT NULL REFERENCES public."User"(id) ON DELETE RESTRICT,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✅ Tabla public."PreQuotationStateHistory" creada.');

    await client.end();
}

run().catch(console.error);
