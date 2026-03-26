CREATE OR REPLACE PROCEDURE public.spPrestadoraCrear(
    p_code TEXT,
    p_name TEXT,
    p_category TEXT,
    p_location TEXT,
    p_provider_id INT,
    p_type TEXT,
    p_acting_user_id INT,
    INOUT p_prestadora_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public."Prestadora" ("code", "name", "category", "location", "providerId", "type")
    VALUES (p_code, p_name, p_category, p_location, p_provider_id, p_type)
    RETURNING id INTO p_prestadora_id;

    p_mensaje_resultado := 'SUCCESS: Prestadora creado con ID ' || p_prestadora_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
