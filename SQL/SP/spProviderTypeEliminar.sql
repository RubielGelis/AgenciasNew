CREATE OR REPLACE PROCEDURE public.spProviderTypeEliminar(
    p_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public."ProviderType" WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Tipo de proveedor eliminado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
