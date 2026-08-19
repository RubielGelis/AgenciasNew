-- =============================================
-- Procedimiento Almacenado: spPreCotizacionConvertir
-- Descripción: Procedimiento en PostgreSQL para registrar la conversión de una Pre-Cotización a Cotización,
--              guardar la respuesta al aviso y registrar la trazabilidad.
-- Base de Datos: PostgreSQL (Korex_colaereo)
-- =============================================
CREATE OR REPLACE PROCEDURE public."spPreCotizacionConvertir"(
    IN p_pre_quotation_id INT,
    IN p_quotation_id INT,
    IN p_acting_user_id INT,
    IN p_notice_response TEXT,
    OUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_pre_quotation_id IS NULL OR p_pre_quotation_id = 0 THEN
        p_mensaje_resultado := 'ERROR: ID de Pre-Cotización inválido.';
        RETURN;
    END IF;

    UPDATE public."PreQuotation"
    SET state = 'COTIZADA',
        "convertedQuotationId" = p_quotation_id,
        "convertedAt" = CURRENT_TIMESTAMP,
        "convertedUserId" = p_acting_user_id,
        "noticeResponse" = COALESCE(p_notice_response, "noticeResponse"),
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = p_pre_quotation_id;

    -- Historial de estado
    INSERT INTO public."PreQuotationStateHistory" ("preQuotationId", "state", "description", "userId", "createdAt")
    VALUES (p_pre_quotation_id, 'COTIZADA', 'Pre-cotización convertida exitosamente a cotización (ID: ' || COALESCE(p_quotation_id::TEXT, 'N/A') || ')', p_acting_user_id, CURRENT_TIMESTAMP);

    p_mensaje_resultado := 'SUCCESS: Pre-Cotización convertida a Cotización correctamente.';
END;
$$;
