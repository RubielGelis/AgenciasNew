CREATE OR REPLACE PROCEDURE public.spImplantActualizar(
    p_id INT,
    p_code TEXT,
    p_name TEXT,
    p_logo BYTEA,
    p_template BYTEA,
    p_template_config JSONB,
    p_html_template TEXT,
    p_branch_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public."Implant" WHERE id = p_id) THEN
        p_mensaje_resultado := 'ERROR: Implant con ID ' || p_id || ' no encontrado.';
        RETURN;
    END IF;

    UPDATE public."Implant"
    SET "code" = p_code,
        "name" = p_name,
        "logo" = COALESCE(p_logo, "logo"),
        "template" = COALESCE(p_template, "template"),
        "templateConfig" = COALESCE(p_template_config, "templateConfig"),
        "htmlTemplate" = COALESCE(p_html_template, "htmlTemplate"),
        "branchId" = p_branch_id
    WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Implant actualizado exitosamente.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
