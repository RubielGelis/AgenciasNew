CREATE OR REPLACE PROCEDURE public.spHotelEliminar(
    p_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM public."Hotel" WHERE id = p_id;
    p_mensaje_resultado := 'SUCCESS: Hotel eliminado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
