CREATE OR REPLACE FUNCTION public.fnImplantListar()
RETURNS SETOF public."Implant"
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public."Implant" ORDER BY name ASC;
END;
$$;
