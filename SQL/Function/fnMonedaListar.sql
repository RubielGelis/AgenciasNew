DROP FUNCTION IF EXISTS public.fnMonedaListar(INT);

CREATE OR REPLACE FUNCTION public.fnMonedaListar(
    p_id INT DEFAULT NULL
)
RETURNS TABLE (
    id             INT,
    code           TEXT,
    name           TEXT,
    "exchangeRate" FLOAT,
    decimals       INT,
    "isActive"     BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.code,
        c.name,
        c."exchangeRate",
        c.decimals,
        COALESCE(c."isActive", true) AS "isActive"
    FROM public."Currency" c
    WHERE
        p_id IS NULL
        OR c.id = p_id
    ORDER BY c.code;
END;
$$;
