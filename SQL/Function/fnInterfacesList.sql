CREATE OR REPLACE FUNCTION public."fnInterfacesList"()
RETURNS TABLE(
    id integer,
    code text,
    name text,
    inactivo boolean,
    bl_genera_archivoplano boolean,
    ds_storedprocedure_archivoplano text,
    bl_job boolean,
    ds_nameJob text,
    bl_facturador boolean,
    "id_GDS" integer
) 
LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.code,
        i.name,
        i.inactivo,
        i.bl_genera_archivoplano,
        i.ds_storedprocedure_archivoplano,
        i.bl_job,
        i.ds_nameJob,
        i.bl_facturador,
        i."id_GDS"
    FROM public."Interfaces" i
    ORDER BY i.name ASC;
END;
$BODY$;

ALTER FUNCTION public."fnInterfacesList"() OWNER TO postgres;
