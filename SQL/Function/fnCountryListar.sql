CREATE OR REPLACE FUNCTION public."fnCountryListar"()
RETURNS TABLE(id integer, code text, name text, dane text, region text, prefix text, "curencyId" integer)
LANGUAGE plpgsql AS $function$
BEGIN
    RETURN QUERY SELECT c.id, c.code::text, c.name::text, c.dane::text, c.region::text, c.prefix::text, c."curencyId" FROM public."Countries" c ORDER BY c.id ASC;
END; $function$;