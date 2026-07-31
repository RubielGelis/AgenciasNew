-- Script para insertar datos iniciales en QuotationState
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public."QuotationState" WHERE code = 'NUEVO') THEN
        INSERT INTO public."QuotationState" (code, name, color) VALUES ('NUEVO', 'Nuevo', 'blue');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public."QuotationState" WHERE code = 'ENVIADO') THEN
        INSERT INTO public."QuotationState" (code, name, color) VALUES ('ENVIADO', 'ENVIADO', 'emerald');
    END IF;
END $$;
