CREATE OR REPLACE FUNCTION public.fnPrestadoraListar()
RETURNS SETOF JSONB
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'id', h.id,
            'code', h.code,
            'name', h.name,
            'category', h.category,
            'type', h.type,
            'location', h.location,
            'providerId', h."providerId",
            'provider', (
                SELECT jsonb_build_object('id', p.id, 'name', p.name)
                FROM public."Provider" p WHERE p.id = h."providerId"
            )
        )
    FROM public."Prestadora" h
    ORDER BY h.name ASC;
END;
$$;
