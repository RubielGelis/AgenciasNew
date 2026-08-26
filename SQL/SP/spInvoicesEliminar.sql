CREATE OR REPLACE PROCEDURE public.spInvoicesEliminar(
    p_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    p_mensaje_resultado := 'ERROR: Las facturas no se pueden eliminar del sistema. Solo pueden ser anuladas.';
    RETURN;
END;
$$;
