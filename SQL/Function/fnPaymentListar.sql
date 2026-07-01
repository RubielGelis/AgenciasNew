CREATE OR REPLACE FUNCTION public."fnPaymentListar"()
RETURNS TABLE(id integer, code text, name text, iscash boolean, iscredit boolean, inactive boolean)
LANGUAGE plpgsql AS $function$
BEGIN
    RETURN QUERY SELECT p.id, p.code, p.name, p.iscash, p.iscredit, p.inactive FROM public."Payment" p ORDER BY p.id ASC;
END; $function$;