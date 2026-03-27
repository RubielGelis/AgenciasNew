-- sp_log_registrar.sql
-- RUTA: c:\Proyectos\AgenciasNew\SQL\SP\sp_log_registrar.sql

CREATE OR REPLACE PROCEDURE public.splogregistrar(
    p_user_id INT,
    p_module TEXT,
    p_action TEXT,
    p_description TEXT,
    p_metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public."SystemLog" (
        "userId", 
        "module", 
        "action", 
        "description", 
        "metadata", 
        "createdAt"
    ) VALUES (
        p_user_id, 
        UPPER(p_module), 
        UPPER(p_action), 
        p_description, 
        p_metadata, 
        NOW()
    );
END;
$$;

-- Alias por si ya hay llamadas con mayúsculas
CREATE OR REPLACE PROCEDURE public.spLogRegistrar(
    p_user_id INT, p_module TEXT, p_action TEXT, p_description TEXT, p_metadata JSONB
) LANGUAGE plpgsql AS $$ BEGIN CALL splogregistrar(p_user_id, p_module, p_action, p_description, p_metadata); END; $$;
