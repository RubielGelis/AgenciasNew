-- Tabla: public.NotasCreditoNoRef
CREATE TABLE IF NOT EXISTS public."NotasCreditoNoRef" (
    id SERIAL PRIMARY KEY,
    fuente VARCHAR(10),
    serie VARCHAR(10),
    consecutivo VARCHAR(50),
    factura_fuente VARCHAR(10),
    factura_serie VARCHAR(10),
    factura_numero VARCHAR(50),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_notas_credito_no_ref_consecutivo" ON public."NotasCreditoNoRef"(consecutivo);
CREATE INDEX IF NOT EXISTS "idx_notas_credito_no_ref_factura" ON public."NotasCreditoNoRef"(factura_fuente, factura_serie, factura_numero);