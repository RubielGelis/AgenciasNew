DROP FUNCTION IF EXISTS public.fnClienteListar();

CREATE OR REPLACE FUNCTION public.fnClienteListar()
RETURNS TABLE (
    id integer,
    name text,
    document text,
    "contactInfo" text,
    address text,
    "mandatoryVariables" jsonb,
    "sellerId" integer,
    "sellerCode" text,
    "sellerName" text,
    "isActive" boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        COALESCE(c.name, '')::text,
        COALESCE(c.document, '')::text,
        c."contactInfo"::text,
        c.address::text,
        c."mandatoryVariables",
        c."sellerId",
        s.code::text AS "sellerCode",
        s.name::text AS "sellerName",
        COALESCE(c."isActive", true) AS "isActive"
    FROM public."Client" c
    LEFT JOIN public."Seller" s ON s.id = c."sellerId"
    ORDER BY c.id DESC;
END;
$$;
