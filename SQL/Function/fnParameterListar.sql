CREATE OR REPLACE FUNCTION public.fnParameterListar()
RETURNS SETOF public."SystemParameter"
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public."SystemParameter" ORDER BY name ASC;
END;
$$;
