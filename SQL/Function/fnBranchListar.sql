CREATE OR REPLACE FUNCTION public.fnBranchListar()
RETURNS SETOF public."Branch"
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public."Branch" ORDER BY name ASC;
END;
$$;
