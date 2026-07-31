
CREATE OR REPLACE FUNCTION public."fnQuotationStateListar"()
RETURNS TABLE(id integer, code text, name text, color text, "createdAt" timestamp)
LANGUAGE plpgsql AS $function$
BEGIN
    RETURN QUERY SELECT t.id, t.code::text, t.name::text, t.color::text, t."createdAt"::timestamp FROM public."QuotationState" t ORDER BY t.name ASC;
END; $function$;
