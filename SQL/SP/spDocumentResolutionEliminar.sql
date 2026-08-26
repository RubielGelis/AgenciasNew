CREATE OR REPLACE PROCEDURE public."spDocumentResolutionEliminar"(
    IN p_id integer,
    IN p_user_id integer,
    INOUT p_mensaje_resultado text
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_id IS NULL THEN
        p_mensaje_resultado := 'ERROR: El ID de la resolución es obligatorio.';
        RETURN;
    END IF;

    DELETE FROM public."DocumentResolution"
    WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
