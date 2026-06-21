CREATE OR REPLACE PROCEDURE public.spBranchCrear(
    p_code TEXT,
    p_name TEXT,
    p_logo BYTEA,
    p_template BYTEA,
    p_template_config JSONB,
    p_html_template TEXT,
    p_acting_user_id INT,
    INOUT p_branch_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public."Branch" ("code", "name", "logo", "template", "templateConfig", "htmlTemplate")
    VALUES (p_code, p_name, p_logo, p_template, p_template_config, p_html_template)
    RETURNING id INTO p_branch_id;

    p_mensaje_resultado := 'SUCCESS: Sucursal creada con ID ' || p_branch_id;
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
