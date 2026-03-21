CREATE OR REPLACE FUNCTION public.fnClienteListar()
RETURNS SETOF public."Client"
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public."Client" ORDER BY name ASC;
END;
$$;
