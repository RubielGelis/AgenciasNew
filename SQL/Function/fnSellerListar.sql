CREATE OR REPLACE FUNCTION public.fnSellerListar()
RETURNS SETOF public."Seller"
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public."Seller" ORDER BY name ASC;
END;
$$;
