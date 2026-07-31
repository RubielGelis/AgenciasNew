
CREATE OR REPLACE PROCEDURE public."spQuotationStateActualizar"(
    p_id INT,
    p_code TEXT,
    p_name TEXT,
    p_color TEXT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE public."QuotationState"
    SET code = COALESCE(p_code, code),
        name = COALESCE(p_name, name),
        color = p_color
    WHERE id = p_id;
    p_mensaje_resultado := 'SUCCESS: Estado de cotización actualizado correctamente.';
EXCEPTION
    WHEN unique_violation THEN
        p_mensaje_resultado := 'ERROR: El código ya existe.';
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END; $$;
