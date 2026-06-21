CREATE OR REPLACE PROCEDURE public.spImplantCrear(
    p_code TEXT,
    p_name TEXT,
    p_logo BYTEA,
    p_template BYTEA,
    p_template_config JSONB,
    p_html_template TEXT,
    p_branch_id INT,
    p_acting_user_id INT,
    INOUT p_implant_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public."Implant" ("code", "name", "logo", "template", "templateConfig", "htmlTemplate", "branchId")
    VALUES (p_code, p_name, p_logo, p_template, p_template_config, p_html_template, p_branch_id)
    RETURNING id INTO p_implant_id;

    p_mensaje_resultado := 'SUCCESS: Implant creado con ID ' || p_implant_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
