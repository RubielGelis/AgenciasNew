CREATE OR REPLACE PROCEDURE public.spNotaCreditoNoRef_Insertar(
    p_data JSONB,
    INOUT p_inserted_count INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_item RECORD;
    v_count INT := 0;
BEGIN
    p_inserted_count := 0;
    p_mensaje_resultado := '';

    IF p_data IS NULL THEN
        p_mensaje_resultado := 'ERROR: No se recibieron datos para insertar.';
        RETURN;
    END IF;

    -- Soportar tanto array JSONB como objeto individual
    IF jsonb_typeof(p_data) = 'array' THEN
        FOR v_item IN 
            SELECT * FROM jsonb_to_recordset(p_data) AS x(
                fuente TEXT,
                serie TEXT,
                consecutivo TEXT,
                factura_fuente TEXT,
                factura_serie TEXT,
                factura_numero TEXT,
                fecha TEXT
            )
        LOOP
            INSERT INTO public."NotasCreditoNoRef" (
                fuente,
                serie,
                consecutivo,
                factura_fuente,
                factura_serie,
                factura_numero,
                fecha
            ) VALUES (
                v_item.fuente,
                v_item.serie,
                v_item.consecutivo,
                v_item.factura_fuente,
                v_item.factura_serie,
                v_item.factura_numero,
                CASE 
                    WHEN v_item.fecha IS NOT NULL AND v_item.fecha <> '' THEN v_item.fecha::TIMESTAMP WITH TIME ZONE 
                    ELSE CURRENT_TIMESTAMP 
                END
            );
            v_count := v_count + 1;
        END LOOP;
    ELSE
        INSERT INTO public."NotasCreditoNoRef" (
            fuente,
            serie,
            consecutivo,
            factura_fuente,
            factura_serie,
            factura_numero,
            fecha
        ) VALUES (
            NULLIF(p_data->>'fuente', ''),
            NULLIF(p_data->>'serie', ''),
            NULLIF(p_data->>'consecutivo', ''),
            NULLIF(p_data->>'factura_fuente', ''),
            NULLIF(p_data->>'factura_serie', ''),
            NULLIF(p_data->>'factura_numero', ''),
            CASE 
                WHEN NULLIF(p_data->>'fecha', '') IS NOT NULL THEN (p_data->>'fecha')::TIMESTAMP WITH TIME ZONE 
                ELSE CURRENT_TIMESTAMP 
            END
        );
        v_count := 1;
    END IF;

    p_inserted_count := v_count;
    p_mensaje_resultado := 'SUCCESS: Se insertaron ' || v_count || ' registro(s) en NotasCreditoNoRef.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;