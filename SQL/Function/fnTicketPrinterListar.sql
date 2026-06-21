CREATE OR REPLACE FUNCTION public.fnTicketPrinterListar()
RETURNS SETOF public."TicketPrinter"
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public."TicketPrinter" ORDER BY name ASC;
END;
$$;
