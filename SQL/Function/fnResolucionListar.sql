CREATE OR REPLACE FUNCTION public.fnResolucionListar()
RETURNS SETOF public."Resolution"
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public."Resolution" ORDER BY name ASC;
END;
$$;
