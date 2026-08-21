CREATE OR REPLACE PROCEDURE public.spImpuestoCrear(
    p_code TEXT,
    p_name TEXT,
    p_type TEXT,
    p_value_type TEXT,
    p_value DECIMAL,
    p_is_editable BOOLEAN,
    p_orden INT DEFAULT 0,
    p_product_ids JSONB DEFAULT '[]'::jsonb,
    p_acting_user_id INT DEFAULT 1,
    INOUT p_tax_id INT DEFAULT 0,
    INOUT p_mensaje_resultado TEXT DEFAULT ''
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public."ChargeAndTax" ("code", "name", "type", "valueType", "value", "isEditable", "orden", "productIds")
    VALUES (p_code, p_name, p_type, p_value_type, p_value, p_is_editable, COALESCE(p_orden, 0), COALESCE(p_product_ids, '[]'::jsonb))
    RETURNING id INTO p_tax_id;

    p_mensaje_resultado := 'SUCCESS: Cargo/Impuesto creado con ID ' || p_tax_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
