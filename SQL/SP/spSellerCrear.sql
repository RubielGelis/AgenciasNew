CREATE OR REPLACE PROCEDURE public.spSellerCrear(
    p_code TEXT,
    p_name TEXT,
    p_email TEXT,
    p_acting_user_id INT,
    INOUT p_seller_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public."Seller" ("code", "name", "email")
    VALUES (p_code, p_name, p_email)
    RETURNING id INTO p_seller_id;

    p_mensaje_resultado := 'SUCCESS: Vendedor creado con ID ' || p_seller_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
