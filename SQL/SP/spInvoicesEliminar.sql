CREATE OR REPLACE PROCEDURE public.spInvoicesEliminar(
    p_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public."Invoices" WHERE id = p_id) THEN
        p_mensaje_resultado := 'ERROR: La factura con ID ' || p_id || ' no existe.';
        RETURN;
    END IF;

    -- Eliminación lógica (cambio de estado)
    UPDATE public."Invoices" SET state = 'ANULADO' WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Factura ' || p_id || ' anulada correctamente.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
