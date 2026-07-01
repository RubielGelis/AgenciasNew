CREATE OR REPLACE PROCEDURE public.spCotizacionActualizar(
    p_id INT,
    p_data JSONB,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_item RECORD;
    v_tax RECORD;
    v_pax RECORD;
    v_var RECORD;
    v_combo RECORD;
    v_quotation_product_id INT;
BEGIN
    -- Validaciones
    IF NOT EXISTS (SELECT 1 FROM public."Quotation" WHERE id = p_id) THEN
        p_mensaje_resultado := 'ERROR: La cotización con ID ' || p_id || ' no existe.';
        RETURN;
    END IF;

    IF NULLIF(p_data->>'clientId', '') IS NULL THEN
        p_mensaje_resultado := 'ERROR: El campo Cliente es obligatorio.';
        RETURN;
    END IF;

    IF p_data->'items' IS NULL OR jsonb_array_length(p_data->'items') = 0 THEN
        p_mensaje_resultado := 'ERROR: La cotización debe tener al menos un producto.';
        RETURN;
    END IF;

    IF EXISTS (
        SELECT 1 FROM jsonb_to_recordset(p_data->'items') AS x("productId" INT, "mainTaxId" TEXT)
        WHERE "productId" IS NULL OR NULLIF("mainTaxId", '') IS NULL
    ) THEN
        p_mensaje_resultado := 'ERROR: Todos los productos deben tener un producto y un Cargo Principal seleccionado.';
        RETURN;
    END IF;

    UPDATE public."Quotation" SET
        "clientId" = NULLIF(p_data->>'clientId', '')::INT,
        "currency" = p_data->>'currency',
        "exchangeRate" = NULLIF(p_data->>'exchangeRate', '')::FLOAT,
        "branchId" = NULLIF(p_data->>'branchId', '')::INT,
        "implantId" = NULLIF(p_data->>'implantId', '')::INT,
        "sellerId" = NULLIF(p_data->>'sellerId', '')::INT,
        "ticketPrinterId" = NULLIF(p_data->>'ticketPrinterId', '')::INT,
        "commissionPercentage" = NULLIF(p_data->>'commissionPercentage', '')::FLOAT,
        "chargesAndTaxes" = NULLIF(p_data->>'chargesAndTaxes', '')::FLOAT,
        "totalAmount" = NULLIF(p_data->>'totalAmount', '')::FLOAT,
        "state" = COALESCE(p_data->>'state', 'Nuevo'),
        "date" = CURRENT_TIMESTAMP
    WHERE id = p_id;

    DELETE FROM public."QuotationCombo" WHERE "quotationId" = p_id;
    FOR v_combo IN SELECT * FROM jsonb_to_recordset(p_data->'combos') AS x("comboId" INT, "id" INT)
    LOOP
        INSERT INTO public."QuotationCombo" ("quotationId", "comboId")
        VALUES (p_id, COALESCE(v_combo."comboId", v_combo.id));
    END LOOP;

    DELETE FROM public."QuotationProduct" WHERE "quotationId" = p_id;
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_data->'items') AS x(
                      "productId" INT, quantity INT, price FLOAT, cost FLOAT, "providerId" TEXT, "prestadoraId" TEXT,
                      "checkIn" TEXT, "checkOut" TEXT, "nights" INT, "mainTaxId" TEXT,
                      "paxAdults" INT, "paxChildren" INT, "serviceType" TEXT, "destination" TEXT,
                      "reservationCode" TEXT, "sellerCommission" FLOAT, "ticketPrinterCommission" FLOAT,
                      "comboId" TEXT, "appliedTaxes" JSONB, "passengers" JSONB, "variables" JSONB, "inNationality" INT,
                      "servicios" TEXT, "descripcion" TEXT
                  )
    LOOP
        INSERT INTO public."QuotationProduct" (
            "quotationId", "productId", "quantity", "price", "cost", "providerId", "prestadoraId",
            "checkInDate", "checkOutDate", "nights", "paxAdults", "paxChildren",
            "serviceType", "destination", "reservationCode", "sellerCommission", 
            "ticketPrinterCommission", "comboId", "mainTaxId", "inNationality",
            "servicios", "descripcion"
        ) VALUES (
            p_id, v_item."productId", v_item.quantity, v_item.price, v_item.cost, NULLIF(v_item."providerId", '')::INT, NULLIF(v_item."prestadoraId", '')::INT,
            CASE WHEN v_item."checkIn" IS NOT NULL AND v_item."checkIn" <> '' THEN v_item."checkIn"::TIMESTAMP ELSE NULL END,
            CASE WHEN v_item."checkOut" IS NOT NULL AND v_item."checkOut" <> '' THEN v_item."checkOut"::TIMESTAMP ELSE NULL END,
            v_item.nights, v_item."paxAdults", v_item."paxChildren",
            v_item."serviceType", v_item."destination", v_item."reservationCode", v_item."sellerCommission",
            v_item."ticketPrinterCommission", NULLIF(v_item."comboId", '')::INT, NULLIF(v_item."mainTaxId", '')::INT, COALESCE(v_item."inNationality", 1),
            v_item."servicios", v_item."descripcion"
        ) RETURNING id INTO v_quotation_product_id;

        IF v_item.passengers IS NOT NULL THEN
            FOR v_pax IN SELECT * FROM jsonb_to_recordset(v_item.passengers) AS x(name TEXT, document TEXT)
            LOOP
                INSERT INTO public."QuotationProductPassenger" ("quotationProductId", "name", "document")
                VALUES (v_quotation_product_id, v_pax.name, v_pax.document);
            END LOOP;
        END IF;

        IF v_item."appliedTaxes" IS NOT NULL THEN
            FOR v_tax IN SELECT * FROM jsonb_to_recordset(v_item."appliedTaxes") AS x("chargeAndTaxId" INT, "explicitAmount" FLOAT)
            LOOP
                INSERT INTO public."QuotationProductTax" (
                    "quotationProductId", "chargeAndTaxId", "valueSnapshot", "valueTypeSnapshot", "explicitAmount", "isMain"
                )
                SELECT v_quotation_product_id, ct.id, ct.value, ct."valueType", v_tax."explicitAmount", 
                       CASE WHEN NULLIF(v_item."mainTaxId", '')::INT = ct.id THEN TRUE ELSE FALSE END
                FROM public."ChargeAndTax" ct
                WHERE ct.id = v_tax."chargeAndTaxId";
            END LOOP;
        END IF;

        IF v_item.variables IS NOT NULL THEN
            FOR v_var IN SELECT * FROM jsonb_to_recordset(v_item.variables) AS x("masterVariableId" INT, value TEXT)
            LOOP
                INSERT INTO public."QuotationProductVariable" ("quotationProductId", "masterVariableId", "value")
                VALUES (v_quotation_product_id, v_var."masterVariableId", v_var.value);
            END LOOP;
        END IF;
    END LOOP;

    -- Calcular y actualizar el totalAmount basado en QuotationProductTax
    UPDATE public."Quotation"
    SET "totalAmount" = COALESCE("chargesAndTaxes", 0) + (
        SELECT COALESCE(SUM(qpt."explicitAmount"), 0)
        FROM public."QuotationProductTax" qpt
        JOIN public."QuotationProduct" qp ON qpt."quotationProductId" = qp.id
        WHERE qp."quotationId" = p_id
    )
    WHERE id = p_id;

    p_mensaje_resultado := 'SUCCESS: Cotización ' || p_id || ' actualizada correctamente.';

    -- Registrar en Auditoría
    CALL public."spLogRegistrar"(
        p_acting_user_id, 
        'QUOTATION', 
        'UPDATE', 
        'Se actualizó la cotización con ID ' || p_id, 
        p_data, 
        v_quotation_product_id -- Reutilizamos variable para el logId temporal
    );

EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
