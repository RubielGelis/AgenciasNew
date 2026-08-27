DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT oid::regprocedure AS proc_name 
        FROM pg_proc 
        WHERE proname ILIKE 'spClienteEliminar'
    LOOP
        EXECUTE 'DROP PROCEDURE ' || r.proc_name;
    END LOOP;
END $$;

CREATE OR REPLACE PROCEDURE public.spClienteEliminar(
    p_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT DEFAULT ''
)
AS $BODY$
BEGIN
    DELETE FROM public."Client" WHERE id = p_id;
    p_mensaje_resultado := 'SUCCESS: Cliente eliminado.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$BODY$
LANGUAGE plpgsql;
