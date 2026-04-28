CREATE OR REPLACE PROCEDURE public.spUsuarioEliminar(
    p_user_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validar si el usuario existe
    IF NOT EXISTS (SELECT 1 FROM public."User" WHERE id = p_user_id) THEN
        p_mensaje_resultado := 'ERROR: Usuario con ID ' || p_user_id || ' no encontrado.';
        RETURN;
    END IF;

    DELETE FROM public."User" WHERE id = p_user_id;
    
    p_mensaje_resultado := 'SUCCESS: Usuario eliminado exitosamente.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
