CREATE OR REPLACE PROCEDURE public.spClienteActualizar(
    p_id INT,
    p_name TEXT,
    p_document TEXT,
    p_contact_info TEXT,
    p_address TEXT,
    p_mandatory_variables JSONB,
    p_acting_user_id INT,
    p_seller_id INT DEFAULT NULL,
    INOUT p_mensaje_resultado TEXT DEFAULT ''
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public."Client" WHERE document = p_document AND id <> p_id) THEN
        p_mensaje_resultado := 'ERROR: El documento ya está registrado por otro cliente.';
        RETURN;
    END IF;

    UPDATE public."Client" SET
        "name" = p_name,
        "document" = p_document,
        "contactInfo" = p_contact_info,
        "address" = p_address,
        "mandatoryVariables" = p_mandatory_variables,
        "sellerId" = p_seller_id
    WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Cliente ' || p_id || ' actualizado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
