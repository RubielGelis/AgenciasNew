CREATE OR REPLACE PROCEDURE public.spMonedaCrear(
    p_code         TEXT,
    p_name         TEXT,
    p_exchange_rate FLOAT,
    p_acting_user_id INT,
    INOUT p_currency_id      INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public."Currency" WHERE code = p_code) THEN
        p_mensaje_resultado := 'ERROR: El código de moneda ya está registrado';
        RETURN;
    END IF;

    INSERT INTO public."Currency" (code, name, "exchangeRate")
    VALUES (p_code, p_name, p_exchange_rate)
    RETURNING id INTO p_currency_id;

    p_mensaje_resultado := 'SUCCESS: Moneda creada con ID ' || p_currency_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
