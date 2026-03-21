CREATE OR REPLACE PROCEDURE public.spHotelCrear(
    p_code TEXT,
    p_name TEXT,
    p_category TEXT,
    p_location TEXT,
    p_provider_id INT,
    p_acting_user_id INT,
    INOUT p_hotel_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public."Hotel" ("code", "name", "category", "location", "providerId")
    VALUES (p_code, p_name, p_category, p_location, p_provider_id)
    RETURNING id INTO p_hotel_id;

    p_mensaje_resultado := 'SUCCESS: Hotel creado con ID ' || p_hotel_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
