CREATE OR REPLACE PROCEDURE public.spTicketPrinterActualizar(
    p_id INT,
    p_code TEXT,
    p_name TEXT,
    p_email TEXT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public."TicketPrinter" WHERE id = p_id) THEN
        p_mensaje_resultado := 'ERROR: Tiqueteador con ID ' || p_id || ' no encontrado.';
        RETURN;
    END IF;

    UPDATE public."TicketPrinter"
    SET "code" = p_code,
        "name" = p_name,
        "email" = p_email
    WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Tiqueteador actualizado exitosamente.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
