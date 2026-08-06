DROP FUNCTION IF EXISTS public.fnCotizacionHistorial();

CREATE OR REPLACE FUNCTION public.fnCotizacionHistorial(
    p_referencia VARCHAR DEFAULT NULL,
    p_fecha_desde DATE DEFAULT NULL,
    p_fecha_hasta DATE DEFAULT NULL,
    p_cliente VARCHAR DEFAULT NULL,
    p_elaborado_por VARCHAR DEFAULT NULL,
    p_monto_total NUMERIC DEFAULT NULL,
    p_estado VARCHAR DEFAULT NULL
)
RETURNS SETOF JSONB
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'id', q.id,
            'internalNumber', q."internalNumber",
            'clientName', COALESCE(c.name, 'Cliente desconocido'),
            'providerName', COALESCE((
                SELECT prov.name 
                FROM public."QuotationProduct" qp
                JOIN public."Provider" prov ON qp."providerId" = prov.id
                WHERE qp."quotationId" = q.id
                LIMIT 1
            ), 'Proveedor Desconocido'),
            'createdAt', q.date,
            'totalAmount', q."totalAmount",
            'currency', q.currency,
            'userName', COALESCE(u.name, 'Sistema'),
            'state', COALESCE(q.state, 'NUEVO'),
            'stateDescription', q."stateDescription",
            'stateUpdatedAt', q."stateUpdatedAt",
            'nights', COALESCE((
                SELECT qp.nights 
                FROM public."QuotationProduct" qp
                WHERE qp."quotationId" = q.id
                LIMIT 1
            ), 1),
            'passengerName', COALESCE((
                SELECT qpax.name 
                FROM public."QuotationProduct" qp
                JOIN public."QuotationProductPassenger" qpax ON qpax."quotationProductId" = qp.id
                WHERE qp."quotationId" = q.id
                ORDER BY qpax.id ASC
                LIMIT 1
            ), 'Mismo titular')
        )
    FROM public."Quotation" q
    JOIN public."Client" c ON q."clientId" = c.id
    LEFT JOIN public."User" u ON q."userId" = u.id
    WHERE 
        (p_referencia IS NULL OR q.id::text ILIKE '%' || p_referencia || '%')
        AND (p_fecha_desde IS NULL OR q.date::date >= p_fecha_desde)
        AND (p_fecha_hasta IS NULL OR q.date::date <= p_fecha_hasta)
        AND (p_cliente IS NULL OR c.name ILIKE '%' || p_cliente || '%')
        AND (p_elaborado_por IS NULL OR u.name ILIKE '%' || p_elaborado_por || '%')
        AND (p_monto_total IS NULL OR q."totalAmount" = p_monto_total)
        AND (p_estado IS NULL OR q.state ILIKE '%' || p_estado || '%')
    ORDER BY q.date DESC;
END;
$$;
