CREATE OR REPLACE PROCEDURE public."spAirportEliminar"(IN p_id integer, IN p_user_id integer, INOUT p_mensaje_resultado text)
LANGUAGE plpgsql AS $procedure$
BEGIN
    DELETE FROM public."Airports" WHERE id = p_id; p_mensaje_resultado := 'SUCCESS';
EXCEPTION WHEN foreign_key_violation THEN p_mensaje_resultado := 'ERROR: En uso.'; WHEN OTHERS THEN p_mensaje_resultado := 'ERROR: ' || SQLERRM; END; $procedure$;