CREATE OR REPLACE FUNCTION public.fnSysConsecutivoListar()
RETURNS TABLE (
    id INT,
    codigo VARCHAR,
    nombre VARCHAR,
    "branchId" INT,
    "branchName" VARCHAR,
    "implantId" INT,
    "implantName" VARCHAR,
    fuente VARCHAR,
    serie VARCHAR,
    consecutivo BIGINT,
    "createdAt" TIMESTAMP,
    "updatedAt" TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sc.id,
        sc.codigo,
        sc.nombre,
        sc."branchId",
        b.name AS "branchName",
        sc."implantId",
        imp.name AS "implantName",
        sc.fuente,
        sc.serie,
        sc.consecutivo,
        sc."createdAt",
        sc."updatedAt"
    FROM public."SysConsecutivo" sc
    LEFT JOIN public."Branch" b ON b.id = sc."branchId"
    LEFT JOIN public."Implant" imp ON imp.id = sc."implantId"
    ORDER BY sc.id DESC;
END;
$$;
