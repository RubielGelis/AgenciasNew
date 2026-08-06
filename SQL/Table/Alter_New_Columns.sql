-- Script para actualizar las columnas nuevas en base de datos existentes de clientes.
-- Agrega columnas faltantes de manera segura en Branch, Implant, InvoicesProduct e InvoicesProductItinerary.

DO $$
BEGIN
    -- 1. Alteraciones para InvoicesProduct
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'InvoicesProduct' AND column_name = 'servicios') THEN
        ALTER TABLE public."InvoicesProduct" ADD COLUMN "servicios" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'InvoicesProduct' AND column_name = 'descripcion') THEN
        ALTER TABLE public."InvoicesProduct" ADD COLUMN "descripcion" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'InvoicesProduct' AND column_name = 'itinerary') THEN
        ALTER TABLE public."InvoicesProduct" ADD COLUMN "itinerary" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'InvoicesProduct' AND column_name = 'class') THEN
        ALTER TABLE public."InvoicesProduct" ADD COLUMN "class" VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'InvoicesProduct' AND column_name = 'ticketTypeId') THEN
        ALTER TABLE public."InvoicesProduct" ADD COLUMN "ticketTypeId" INT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'InvoicesProduct' AND column_name = 'airline') THEN
        ALTER TABLE public."InvoicesProduct" ADD COLUMN "airline" VARCHAR(100);
    END IF;

    -- 2. Alteraciones para InvoicesProductItinerary
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'InvoicesProductItinerary' AND column_name = 'farebasis') THEN
        ALTER TABLE public."InvoicesProductItinerary" ADD COLUMN "farebasis" VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'InvoicesProductItinerary' AND column_name = 'Numflight') THEN
        ALTER TABLE public."InvoicesProductItinerary" ADD COLUMN "Numflight" VARCHAR(25);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'InvoicesProductItinerary' AND column_name = 'Typeflight') THEN
        ALTER TABLE public."InvoicesProductItinerary" ADD COLUMN "Typeflight" VARCHAR(1);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'InvoicesProductItinerary' AND column_name = 'amount') THEN
        ALTER TABLE public."InvoicesProductItinerary" ADD COLUMN "amount" FLOAT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'InvoicesProductItinerary' AND column_name = 'co2') THEN
        ALTER TABLE public."InvoicesProductItinerary" ADD COLUMN "co2" DECIMAL(10,4);
    END IF;

    -- 3. Alteraciones para Branch (Sucursales)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Branch' AND column_name = 'logo') THEN
        ALTER TABLE public."Branch" ADD COLUMN "logo" BYTEA;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Branch' AND column_name = 'template') THEN
        ALTER TABLE public."Branch" ADD COLUMN "template" BYTEA;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Branch' AND column_name = 'templateConfig') THEN
        ALTER TABLE public."Branch" ADD COLUMN "templateConfig" JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Branch' AND column_name = 'htmlTemplate') THEN
        ALTER TABLE public."Branch" ADD COLUMN "htmlTemplate" TEXT;
    END IF;

    -- 4. Alteraciones para Implant
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Implant' AND column_name = 'logo') THEN
        ALTER TABLE public."Implant" ADD COLUMN "logo" BYTEA;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Implant' AND column_name = 'template') THEN
        ALTER TABLE public."Implant" ADD COLUMN "template" BYTEA;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Implant' AND column_name = 'templateConfig') THEN
        ALTER TABLE public."Implant" ADD COLUMN "templateConfig" JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Implant' AND column_name = 'htmlTemplate') THEN
        ALTER TABLE public."Implant" ADD COLUMN "htmlTemplate" TEXT;
    END IF;
    -- 5. Creación de tabla Menu si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Menu') THEN
        CREATE TABLE public."Menu" (
            id SERIAL PRIMARY KEY,
            code VARCHAR(100) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            parent INT NULL,
            action VARCHAR(500) NOT NULL,
            activo BOOLEAN DEFAULT true
        );
    END IF;
END $$;

-- Inserción de datos iniciales en Menu
INSERT INTO public."Menu" (code, name, parent, action, activo)
VALUES 
    ('DASHBOARD', 'Dashboard', NULL, '/dashboard', true),
    ('COTIZACIONES', 'Cotizaciones', NULL, '/dashboard/quotations/history', true),
    ('FACTURACION', 'Facturación', NULL, '/dashboard/invoices/history', true),
    ('MAESTROS', 'Maestros', NULL, '/dashboard/settings', true),
    ('REPORTES', 'Reportes', NULL, '/dashboard/reports', true)
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    parent = EXCLUDED.parent,
    action = EXCLUDED.action,
    activo = EXCLUDED.activo;

-- Función fnMenu
CREATE OR REPLACE FUNCTION public.fnMenu()
RETURNS SETOF public."Menu"
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public."Menu"
    WHERE activo = true
    ORDER BY id ASC;
END;
-- 6. Columnas service/servicios en QuotationProduct y tabla QuotationProductPayment
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'QuotationProduct' AND column_name = 'service') THEN
        ALTER TABLE public."QuotationProduct" ADD COLUMN "service" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'QuotationProduct' AND column_name = 'servicios') THEN
        ALTER TABLE public."QuotationProduct" ADD COLUMN "servicios" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'QuotationProductPayment') THEN
        CREATE TABLE public."QuotationProductPayment" (
            "id" SERIAL PRIMARY KEY,
            "quotationProductId" INT NOT NULL,
            "amount" FLOAT NOT NULL,
            "paymentMethod" VARCHAR(100),
            "date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "reference" VARCHAR(255),
            "creditCardId" INT,
            "cardNumber" VARCHAR(20),
            "authorizationCode" VARCHAR(50),
            "voucher" VARCHAR(50),
            "expirationDate" VARCHAR(10),
            CONSTRAINT "QuotationProductPayment_quotationProductId_fkey" FOREIGN KEY ("quotationProductId") REFERENCES public."QuotationProduct" (id) ON UPDATE CASCADE ON DELETE CASCADE
        );
    END IF;
END $$;

-- 7. Alteración para Product (campos obligatorios)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'mandatoryFields') THEN
        ALTER TABLE public."Product" ADD COLUMN "mandatoryFields" JSONB;
    END IF;
END $$;

-- 8. Alteración para Client (variables obligatorias)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Client' AND column_name = 'mandatoryVariables') THEN
        ALTER TABLE public."Client" ADD COLUMN "mandatoryVariables" JSONB;
    END IF;
END $$;

-- 9. Alteraciones para Quotation (historial de estados)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Quotation' AND column_name = 'stateDescription') THEN
        ALTER TABLE public."Quotation" ADD COLUMN "stateDescription" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Quotation' AND column_name = 'stateUpdatedAt') THEN
        ALTER TABLE public."Quotation" ADD COLUMN "stateUpdatedAt" TIMESTAMP WITHOUT TIME ZONE;
    END IF;
END $$;

-- 10. Creación de tabla QuotationStateHistory (Historial completo de estados)
CREATE SEQUENCE IF NOT EXISTS public."QuotationStateHistory_id_seq" INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
CREATE TABLE IF NOT EXISTS public."QuotationStateHistory" (
    id integer NOT NULL DEFAULT nextval('"QuotationStateHistory_id_seq"'::regclass),
    "quotationId" integer NOT NULL,
    state varchar(25) NOT NULL,
    description text,
    "createdAt" timestamp(6) without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" integer,
    CONSTRAINT "QuotationStateHistory_pkey" PRIMARY KEY (id),
    CONSTRAINT "QuotationStateHistory_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES public."Quotation" (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT "QuotationStateHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User" (id) ON UPDATE CASCADE ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "QuotationStateHistory_quotationId_idx" ON public."QuotationStateHistory" ("quotationId");

