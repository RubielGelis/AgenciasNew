CREATE OR REPLACE PROCEDURE public."spEquivalencesInterfacesEliminar"(
    IN p_id integer,
    IN p_user_id integer,
    INOUT p_success boolean DEFAULT false
)
LANGUAGE plpgsql
AS $BODY$
DECLARE
    v_log_id INT;
BEGIN
    DELETE FROM public."EquivalencesInterfaces"
    WHERE id = p_id;

    IF FOUND THEN
        p_success := true;
        
        -- Registrar en SystemLog
        CALL public."spLogRegistrar"(
            p_user_id,
            'EQUIVALENCES_INTERFACES',
            'DELETE',
            'Eliminación de equivalencia de interface con ID: ' || p_id,
            jsonb_build_object('id', p_id),
            v_log_id
        );
    ELSE
        p_success := false;
    END IF;
END;
$BODY$;
