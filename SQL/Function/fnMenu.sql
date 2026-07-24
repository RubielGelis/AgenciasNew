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
$$;
