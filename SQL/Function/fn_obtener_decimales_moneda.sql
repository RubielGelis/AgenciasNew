CREATE OR REPLACE FUNCTION public.fn_obtener_decimales_moneda(p_currency_code TEXT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    v_decimals INT;
BEGIN
    SELECT COALESCE(decimals, 2) INTO v_decimals
    FROM public."Currency"
    WHERE LOWER(code) = LOWER(p_currency_code);
    
    RETURN COALESCE(v_decimals, 2);
END;
$$;
