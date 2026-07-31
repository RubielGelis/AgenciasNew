
CREATE OR REPLACE PROCEDURE public."spQuotationStateCrear"(
    p_code TEXT,
    p_name TEXT,
    p_color TEXT,
    p_acting_user_id INT,
    INOUT p_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public."QuotationState" (code, name, color)
    VALUES (p_code, p_name, p_color)
    RETURNING id INTO p_id;
    p_mensaje_resultado := 'SUCCESS: Estado de cotización creado correctamente.';
EXCEPTION
    WHEN unique_violation THEN
        p_mensaje_resultado := 'ERROR: El código ya existe.';
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END; $$;
