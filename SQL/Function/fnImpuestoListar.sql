CREATE OR REPLACE FUNCTION public.fnImpuestoListar()
RETURNS SETOF public."ChargeAndTax"
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public."ChargeAndTax" ORDER BY name ASC;
END;
$$;
