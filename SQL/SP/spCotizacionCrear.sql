CREATE OR REPLACE PROCEDURE public.spCotizacionCrear(
    p_data JSONB,
    p_acting_user_id INT,
    INOUT p_quotation_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_internal_number TEXT;
    v_quotation_id INT;
    v_item RECORD;
    v_tax RECORD;
    v_pax RECORD;
    v_var RECORD;
    v_combo RECORD;
    v_quotation_product_id INT;
BEGIN
    -- Validaciones
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

    v_internal_number := 'QUO-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || floor(random() * 1000)::text;

    INSERT INTO public."Quotation" (
        "internalNumber", "date", "clientId", "currency", "exchangeRate", 
        "branchId", "implantId", "sellerId", "ticketPrinterId", 
        "baseCommissionable", "commissionPercentage", "chargesAndTaxes", 
        "totalAmount", "userId", "state"
    ) VALUES (
        v_internal_number, CURRENT_TIMESTAMP, NULLIF(p_data->>'clientId', '')::INT, p_data->>'currency', NULLIF(p_data->>'exchangeRate', '')::FLOAT,
        NULLIF(p_data->>'branchId', '')::INT, NULLIF(p_data->>'implantId', '')::INT, NULLIF(p_data->>'sellerId', '')::INT, NULLIF(p_data->>'ticketPrinterId', '')::INT,
        0, NULLIF(p_data->>'commissionPercentage', '')::FLOAT, NULLIF(p_data->>'chargesAndTaxes', '')::FLOAT,
        NULLIF(p_data->>'totalAmount', '')::FLOAT, p_acting_user_id, 'NUEVO'
    ) RETURNING id INTO v_quotation_id;

    FOR v_combo IN SELECT * FROM jsonb_to_recordset(p_data->'combos') AS x("comboId" INT, "id" INT)
    LOOP
        DECLARE
            v_combo_real_id INT := COALESCE(v_combo."comboId", v_combo.id);
            v_cupos_disponibles INT;
            v_combo_name TEXT;
        BEGIN
            SELECT "cupos", "name" INTO v_cupos_disponibles, v_combo_name
            FROM public."Combo" WHERE id = v_combo_real_id;

            IF v_cupos_disponibles IS NOT NULL AND v_cupos_disponibles <= 0 THEN
                p_mensaje_resultado := 'ERROR: El combo "' || COALESCE(v_combo_name, v_combo_real_id::TEXT) || '" no tiene cupos disponibles.';
                RETURN;
            END IF;

            INSERT INTO public."QuotationCombo" ("quotationId", "comboId")
            VALUES (v_quotation_id, v_combo_real_id);

            -- Descontar 1 cupo
            UPDATE public."Combo" SET "cupos" = "cupos" - 1 WHERE id = v_combo_real_id;
        END;
    END LOOP;

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
            v_quotation_id, v_item."productId", v_item.quantity, v_item.price, v_item.cost, NULLIF(v_item."providerId", '')::INT, NULLIF(v_item."prestadoraId", '')::INT,
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
        WHERE qp."quotationId" = v_quotation_id
    )
    WHERE id = v_quotation_id;

    p_quotation_id := v_quotation_id;
    p_mensaje_resultado := 'SUCCESS: Cotización creada correctamente con ID ' || v_quotation_id;

    -- Registrar en Auditoría
    CALL public."spLogRegistrar"(
        p_acting_user_id, 
        'QUOTATION', 
        'CREATE', 
        'Se creó la cotización ' || v_internal_number || ' (ID: ' || v_quotation_id || ')', 
        p_data, 
        v_quotation_id -- Reutilizamos variable para el logId temporal
    );

EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END;
$$;
