CREATE OR REPLACE FUNCTION public.fnMenuAll()
RETURNS SETOF public."Menu"
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public."Menu"
    ORDER BY id ASC;
END;
$$;
