CREATE OR REPLACE PROCEDURE public."spInterfaceFile"(
    op TEXT,
    booking TEXT,
    file TEXT
)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
    file_extension TEXT;
BEGIN
    -- Extraer la extensión del archivo (ejemplo: .fil para Sabre)
    file_extension := lower(substring(file from '\.[^\.]*$'));

    IF file_extension = '.fil' THEN
        -- Llamar al procedimiento de Sabre pasando los parámetros correspondientes
        CALL public."spInterfaceSabre"(op, booking, file);
    ELSE
        -- Llamar al procedimiento de Amadeus
        CALL public."spInterfaceAmadeus"(op, booking, file);
    END IF;
END;
$BODY$;
