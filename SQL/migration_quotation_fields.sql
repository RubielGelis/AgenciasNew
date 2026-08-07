-- 1. Agregar columnas nuevas a la tabla Quotation
ALTER TABLE public."Quotation" 
ADD COLUMN IF NOT EXISTS "costoTotal" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "valorBase" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "utilidad" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "comisionTotalPercentage" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "comisionFreelancePercentage" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "comisionFreelanceValue" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "comisionPropiaPercentage" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "comisionPropiaValue" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "comisionUtilidadPercentage" DOUBLE PRECISION DEFAULT 0;

-- 2. Crear las funciones de cálculo financiero en PostgreSQL con tipo DOUBLE PRECISION
CREATE OR REPLACE FUNCTION public.fn_calcular_utilidad(
    p_valor_base DOUBLE PRECISION, 
    p_costo_total DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN COALESCE(p_valor_base, 0.0) - COALESCE(p_costo_total, 0.0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.fn_calcular_porcentaje_comision(
    p_utilidad DOUBLE PRECISION, 
    p_valor_base DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
BEGIN
    IF COALESCE(p_valor_base, 0.0) = 0.0 THEN
        RETURN 0.0;
    END IF;
    RETURN (COALESCE(p_utilidad, 0.0) / p_valor_base) * 100.0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.fn_calcular_comision_resta(
    p_comision_total DOUBLE PRECISION, 
    p_comision_freelance DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN COALESCE(p_comision_total, 0.0) - COALESCE(p_comision_freelance, 0.0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.fn_calcular_valor_comision(
    p_porcentaje DOUBLE PRECISION, 
    p_valor_base DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN (COALESCE(p_porcentaje, 0.0) / 100.0) * COALESCE(p_valor_base, 0.0);
END;
$$ LANGUAGE plpgsql;

-- 3. Registrar el parámetro del sistema
INSERT INTO public."SystemParameter" ("code", "name", "value") 
VALUES ('MOSTRAR_TOTALIZACION_COTIZACION', 'Mostrar totalización financiera en cotización', 'true')
ON CONFLICT ("code") DO NOTHING;
