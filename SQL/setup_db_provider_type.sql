-- 1. Crear tabla ProviderType si no existe
CREATE TABLE IF NOT EXISTS public."ProviderType" (
    "id" SERIAL PRIMARY KEY,
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "isAirline" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insertar registros por defecto
INSERT INTO public."ProviderType" ("code", "name", "isAirline", "active")
VALUES 
    ('AIRLINE', 'Aerolínea', true, true),
    ('HOTEL', 'Hotel', false, true),
    ('CAR', 'Renta de Auto', false, true),
    ('OTHER', 'Otro', false, true)
ON CONFLICT ("code") DO UPDATE SET "isAirline" = EXCLUDED."isAirline";

-- 3. Agregar columnas en Provider
ALTER TABLE public."Provider" ADD COLUMN IF NOT EXISTS "providerTypeId" INTEGER REFERENCES public."ProviderType"(id) ON DELETE SET NULL;
ALTER TABLE public."Provider" ADD COLUMN IF NOT EXISTS "airlineCode" VARCHAR(10);
ALTER TABLE public."Provider" ADD COLUMN IF NOT EXISTS "sigla" VARCHAR(10);
