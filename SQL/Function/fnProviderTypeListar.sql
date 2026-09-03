CREATE OR REPLACE FUNCTION public.fnProviderTypeListar()
RETURNS SETOF JSONB
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'id', pt.id,
            'code', pt.code,
            'name', pt.name,
            'isAirline', pt."isAirline",
            'active', pt.active,
            'isActive', COALESCE(pt."isActive", pt.active, true)
        )
    FROM public."ProviderType" pt
    ORDER BY pt.name ASC;
END;
$$;
