-- Crear función para obtener el historial de estados de una cotización
CREATE OR REPLACE FUNCTION public.fn_obtener_historial_estados(p_quotation_id INT)
RETURNS TABLE (
    id INT,
    state VARCHAR(25),
    description TEXT,
    "createdAt" TIMESTAMP,
    "userId" INT,
    "userName" TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qsh.id,
        qsh.state,
        qsh.description,
        qsh."createdAt",
        qsh."userId",
        COALESCE(u.name, 'Sistema'::TEXT) AS "userName"
    FROM public."QuotationStateHistory" qsh
    LEFT JOIN public."User" u ON qsh."userId" = u.id
    WHERE qsh."quotationId" = p_quotation_id
    ORDER BY qsh."createdAt" DESC;
END;
$$ LANGUAGE plpgsql;
