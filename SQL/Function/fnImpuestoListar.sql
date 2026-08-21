CREATE OR REPLACE FUNCTION public.fnImpuestoListar()
RETURNS SETOF JSONB
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'id', t.id,
            'code', t.code,
            'name', t.name,
            'type', t.type,
            'valueType', t."valueType",
            'value', t.value,
            'isEditable', t."isEditable",
            'gdsEquivalences', COALESCE((
                SELECT string_agg(DISTINCT eq."cd_codigointe", ', ')
                FROM public."EquivalencesInterfaces" eq
                INNER JOIN public."Master" m ON m.id = eq.id_master
                WHERE m.code = 'ChargeAndTax' AND eq.cd_codigo = t.code
            ), '')
        )
    FROM public."ChargeAndTax" t
    ORDER BY t.name ASC;
END;
$$;
