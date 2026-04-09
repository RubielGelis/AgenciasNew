CREATE OR REPLACE FUNCTION public.fnMonedaListar(
    p_id INT DEFAULT NULL   -- NULL = todas las monedas, valor = una moneda específica
)
RETURNS TABLE (
    id             INT,
    code           TEXT,
    name           TEXT,
    "exchangeRate" FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.code,
        c.name,
        c."exchangeRate"
    FROM public."Currency" c
    WHERE
        p_id IS NULL
        OR c.id = p_id
    ORDER BY c.code;
END;
$$;
