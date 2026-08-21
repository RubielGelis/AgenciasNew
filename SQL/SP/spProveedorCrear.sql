CREATE OR REPLACE PROCEDURE public.spProveedorCrear(
    p_code TEXT,
    p_name TEXT,
    p_contact_info TEXT,
    p_commission_config JSONB,
    p_provider_type_id INT,
    p_airline_code TEXT,
    p_sigla TEXT,
    p_acting_user_id INT,
    INOUT p_provider_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public."Provider" ("code", "name", "contactInfo", "commissionConfig", "providerTypeId", "airlineCode", "sigla")
    VALUES (p_code, p_name, p_contact_info, p_commission_config, p_provider_type_id, p_airline_code, p_sigla)
    RETURNING id INTO p_provider_id;

    p_mensaje_resultado := 'SUCCESS: Proveedor creado con ID ' || p_provider_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
