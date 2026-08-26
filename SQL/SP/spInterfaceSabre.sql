CREATE OR REPLACE PROCEDURE public."spInterfaceSabre"(
    p_op TEXT,
    p_Booking TEXT,
    p_file TEXT
)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
    -- Variables Generales
    v_code VARCHAR(12) := NULL;
    v_blanch VARCHAR(25) := '001';
    v_implant VARCHAR(25) := '';
    v_date TIMESTAMP := CURRENT_TIMESTAMP;
    v_seller VARCHAR(25) := '';
    v_currency VARCHAR(10) := 'COP';
    v_exchangeRate DOUBLE PRECISION := 1.0;
    v_aerolinea_vende VARCHAR(10) := 'AA';
    v_provider_matched VARCHAR(50) := NULL;
    v_tiqueteador VARCHAR(20) := '';
    
    -- Lineas
    v_lines TEXT[];
    v_line TEXT;
    v_i INT;
    
    -- Pasajeros
    v_pax_nombres TEXT[] := ARRAY[]::TEXT[];
    v_pax_apellidos TEXT[] := ARRAY[]::TEXT[];
    
    -- Tiquetes y M50
    v_tkt_codes TEXT[] := ARRAY[]::TEXT[];
    v_tkt_prestadoras TEXT[] := ARRAY[]::TEXT[];
    v_tkt_tarifas DOUBLE PRECISION[] := ARRAY[]::DOUBLE PRECISION[];
    v_tkt_impuestos DOUBLE PRECISION[] := ARRAY[]::DOUBLE PRECISION[];
    v_tkt_pay_types TEXT[] := ARRAY[]::TEXT[];
    v_tkt_pay_cards TEXT[] := ARRAY[]::TEXT[];
    v_tkt_pay_numbers TEXT[] := ARRAY[]::TEXT[];
    
    -- Itinerarios
    v_iti_origenes TEXT[] := ARRAY[]::TEXT[];
    v_iti_destinos TEXT[] := ARRAY[]::TEXT[];
    v_iti_vuelos TEXT[] := ARRAY[]::TEXT[];
    v_iti_clases TEXT[] := ARRAY[]::TEXT[];
    v_iti_aerolineas TEXT[] := ARRAY[]::TEXT[];
    v_iti_fechas_salida TIMESTAMP[] := ARRAY[]::TIMESTAMP[];
    v_iti_fechas_llegada TIMESTAMP[] := ARRAY[]::TIMESTAMP[];
    
    -- IDs de Tablas
    v_booking_gds_id INT;
    v_booking_product_gds_id INT;
BEGIN
    -- 1. Separar líneas del contenido del archivo (p_Booking)
    v_lines := string_to_array(p_Booking, E'\n');
    IF v_lines IS NULL OR array_length(v_lines, 1) = 0 THEN
        RAISE EXCEPTION 'El contenido del archivo Sabre está vacío.' USING ERRCODE = 'P0001';
    END IF;

    -- 2. Recorrer archivo y parsear
    FOR v_i IN 1 .. array_length(v_lines, 1) LOOP
        v_line := REPLACE(REPLACE(v_lines[v_i], E'\r', ''), E'\uFEFF', '');
        
        -- Cabecera AA (PNR y Sucursal)
        IF v_line LIKE 'AA%' OR (v_code IS NULL AND POSITION('AA' IN v_line) = 1) THEN
            IF length(v_line) >= 61 THEN
                v_code := NULLIF(TRIM(SUBSTRING(v_line FROM 56 FOR 6)), '');
            END IF;
            IF v_code IS NULL AND length(v_line) >= 20 THEN
                v_code := NULLIF(TRIM(SUBSTRING(v_line FROM 56 FOR 10)), '');
            END IF;
            IF length(v_line) >= 18 THEN
                v_blanch := COALESCE(NULLIF(TRIM(SUBSTRING(v_line FROM 12 FOR 7)), ''), v_blanch);
            END IF;
        END IF;

        -- Pasajeros M1
        IF v_line LIKE 'M1%' THEN
            DECLARE
                v_raw_pax TEXT;
                v_slash_pos INT;
                v_ape TEXT;
                v_nom TEXT;
            BEGIN
                v_raw_pax := TRIM(SUBSTRING(v_line FROM 5 FOR 80));
                v_slash_pos := POSITION('/' IN v_raw_pax);
                IF v_slash_pos > 0 THEN
                    v_ape := TRIM(SUBSTRING(v_raw_pax FROM 1 FOR v_slash_pos - 1));
                    v_nom := TRIM(SUBSTRING(v_raw_pax FROM v_slash_pos + 1));
                ELSE
                    v_ape := v_raw_pax;
                    v_nom := '';
                END IF;
                IF v_ape <> '' THEN
                    v_pax_apellidos := array_append(v_pax_apellidos, v_ape);
                    v_pax_nombres := array_append(v_pax_nombres, v_nom);
                END IF;
            END;
        END IF;

        -- Itinerarios Vuelos M30
        IF v_line LIKE 'M30%' THEN
            DECLARE
                v_orig TEXT;
                v_dest TEXT;
                v_aero TEXT;
                v_flight TEXT;
                v_class TEXT;
            BEGIN
                v_orig := NULLIF(TRIM(SUBSTRING(v_line FROM 26 FOR 3)), '');
                v_dest := NULLIF(TRIM(SUBSTRING(v_line FROM 46 FOR 3)), '');
                v_aero := NULLIF(TRIM(SUBSTRING(v_line FROM 66 FOR 2)), '');
                v_flight := NULLIF(TRIM(SUBSTRING(v_line FROM 69 FOR 4)), '');
                v_class := NULLIF(TRIM(SUBSTRING(v_line FROM 73 FOR 1)), '');
                
                IF v_aero IS NOT NULL THEN
                    v_aerolinea_vende := v_aero;
                END IF;

                IF v_orig IS NOT NULL AND v_dest IS NOT NULL THEN
                    v_iti_origenes := array_append(v_iti_origenes, v_orig);
                    v_iti_destinos := array_append(v_iti_destinos, v_dest);
                    v_iti_aerolineas := array_append(v_iti_aerolineas, COALESCE(v_aero, 'AA'));
                    v_iti_vuelos := array_append(v_iti_vuelos, COALESCE(v_flight, '0000'));
                    v_iti_clases := array_append(v_iti_clases, COALESCE(v_class, 'Y'));
                    v_iti_fechas_salida := array_append(v_iti_fechas_salida, CURRENT_TIMESTAMP);
                    v_iti_fechas_llegada := array_append(v_iti_fechas_llegada, CURRENT_TIMESTAMP);
                END IF;
            END;
        END IF;

        -- Tiquetes, Valores e Impuestos M50 / M501 / M502
        IF v_line LIKE 'M50%' THEN
            DECLARE
                v_hash_pos INT;
                v_tkt_num TEXT := NULL;
                v_prestadora TEXT := 'AA';
                v_parts TEXT[];
                v_raw_tarifa TEXT;
                v_raw_tax TEXT;
                v_val_tarifa DOUBLE PRECISION := 0.0;
                v_val_tax DOUBLE PRECISION := 0.0;
                v_card_type TEXT := '';
                v_card_num TEXT := '';
                v_cc_pos INT;
                v_match_num TEXT[];
            BEGIN
                -- 1. Numero de Tiquete y Prestadora Code
                v_hash_pos := POSITION('#' IN v_line);
                IF v_hash_pos > 2 THEN
                    v_prestadora := NULLIF(TRIM(SUBSTRING(v_line FROM v_hash_pos - 2 FOR 2)), '');
                    IF v_prestadora IS NULL THEN v_prestadora := 'AA'; END IF;
                END IF;

                IF v_hash_pos > 0 THEN
                    v_parts := string_to_array(v_line, '/');
                    IF array_length(v_parts, 1) >= 1 THEN
                        v_tkt_num := NULLIF(regexp_replace(v_parts[1], '^.*?#', ''), '');
                        IF v_tkt_num IS NOT NULL THEN
                            v_match_num := regexp_matches(v_tkt_num, '[0-9]{10,13}');
                            IF array_length(v_match_num, 1) >= 1 THEN
                                v_tkt_num := v_match_num[1];
                            END IF;
                        END IF;
                    END IF;

                    -- 2. Valor Tarifa (Segmento 3 de string_to_array por '/')
                    IF array_length(v_parts, 1) >= 3 THEN
                        v_raw_tarifa := regexp_replace(v_parts[3], '[^0-9.]', '', 'g');
                        IF v_raw_tarifa <> '' THEN
                            v_val_tarifa := v_raw_tarifa::DOUBLE PRECISION;
                        END IF;
                    END IF;

                    -- 3. Valor Otros Impuestos (Segmento 4 de string_to_array por '/')
                    IF array_length(v_parts, 1) >= 4 THEN
                        v_raw_tax := regexp_replace(v_parts[4], '[^0-9.]', '', 'g');
                        IF v_raw_tax <> '' THEN
                            v_val_tax := v_raw_tax::DOUBLE PRECISION;
                        END IF;
                    END IF;

                    -- 4. Forma de Pago y Tarjeta (Remover CC)
                    v_cc_pos := POSITION('CC' IN v_line);
                    IF v_cc_pos > 0 THEN
                        v_card_type := SUBSTRING(v_line FROM v_cc_pos + 2 FOR 2);
                        v_match_num := regexp_matches(SUBSTRING(v_line FROM v_cc_pos), '[0-9]{10,16}');
                        IF array_length(v_match_num, 1) >= 1 THEN
                            v_card_num := v_match_num[1];
                        END IF;
                    END IF;

                    IF v_tkt_num IS NOT NULL THEN
                        v_tkt_codes := array_append(v_tkt_codes, v_tkt_num);
                        v_tkt_prestadoras := array_append(v_tkt_prestadoras, COALESCE(v_prestadora, 'AA'));
                        v_tkt_tarifas := array_append(v_tkt_tarifas, v_val_tarifa);
                        v_tkt_impuestos := array_append(v_tkt_impuestos, v_val_tax);
                        v_tkt_pay_types := array_append(v_tkt_pay_types, 'TC');
                        v_tkt_pay_cards := array_append(v_tkt_pay_cards, v_card_type);
                        v_tkt_pay_numbers := array_append(v_tkt_pay_numbers, v_card_num);
                    END IF;
                END IF;
            END;
        END IF;

        -- Agente M828
        IF v_line LIKE 'M828AGENT*%' THEN
            v_tiqueteador := TRIM(SUBSTRING(v_line FROM 9 FOR 10));
            v_seller := v_tiqueteador;
        END IF;

    END LOOP;

    -- Validar existencia de PNR
    IF v_code IS NULL OR v_code = '' THEN
        RAISE EXCEPTION 'No se encontro codigo de reserva en la cabecera (AA).' USING ERRCODE = 'P0001';
    END IF;

    -- Upsert en BookingGDS con gds = 1 (SABRE)
    SELECT id INTO v_booking_gds_id FROM public."BookingGDS" WHERE "code" = v_code LIMIT 1;

    IF v_booking_gds_id IS NOT NULL THEN
        UPDATE public."BookingGDS" SET
            "type" = 'RES',
            "blanch" = v_blanch,
            "gds" = 1, -- 1 = SABRE
            "date" = CURRENT_TIMESTAMP,
            "currency" = v_currency,
            "exchangeRate" = v_exchangeRate,
            "seller" = COALESCE(v_seller, ''),
            "booking" = p_Booking,
            "state" = 'NUEVO'
        WHERE id = v_booking_gds_id;

        DELETE FROM public."BookingProductPaymentGDS" WHERE "bookingProductId" IN (SELECT id FROM public."BookingProductGDS" WHERE "bookingId" = v_booking_gds_id);
        DELETE FROM public."BookingProductTaxGDS" WHERE "bookingProductId" IN (SELECT id FROM public."BookingProductGDS" WHERE "bookingId" = v_booking_gds_id);
        DELETE FROM public."BookingProductPassangerGDS" WHERE "bookingProductId" IN (SELECT id FROM public."BookingProductGDS" WHERE "bookingId" = v_booking_gds_id);
        DELETE FROM public."BookingProductItineraryGDS" WHERE "bookingProductId" IN (SELECT id FROM public."BookingProductGDS" WHERE "bookingId" = v_booking_gds_id);
        DELETE FROM public."BookingProductGDS" WHERE "bookingId" = v_booking_gds_id;
    ELSE
        INSERT INTO public."BookingGDS" (
            "code", "type", "blanch", "implant", "external", "gds", "date", 
            "currency", "exchangeRate", "tiquetPrinter", "seller", "client", 
            "booking", "typetransaction", "iata", "description", "observation", "state"
        ) VALUES (
            v_code, 'RES', v_blanch, '', false, 1, CURRENT_TIMESTAMP, -- 1 = SABRE
            v_currency, v_exchangeRate, '', COALESCE(v_seller, ''), '', 
            p_Booking, '1', '', 'Sabre Interface', '', 'NUEVO'
        ) RETURNING id INTO v_booking_gds_id;
    END IF;

    -- Creación de productos y detalles por tiquete / M50
    DECLARE
        v_num_tkts INT;
        v_tkt_i INT;
        v_prod_code TEXT;
        v_prod_prestadora TEXT;
        v_prod_tarifa DOUBLE PRECISION;
        v_prod_tax DOUBLE PRECISION;
        v_total_prod_price DOUBLE PRECISION;
    BEGIN
        v_num_tkts := COALESCE(array_length(v_tkt_codes, 1), 0);
        IF v_num_tkts = 0 THEN
            v_num_tkts := 1;
            v_tkt_codes := ARRAY['VUE'];
            v_tkt_prestadoras := ARRAY[v_aerolinea_vende];
            v_tkt_tarifas := ARRAY[0.0];
            v_tkt_impuestos := ARRAY[0.0];
            v_tkt_pay_types := ARRAY['TC'];
            v_tkt_pay_cards := ARRAY[''];
            v_tkt_pay_numbers := ARRAY[''];
        END IF;

        FOR v_tkt_i IN 1 .. v_num_tkts LOOP
            v_prod_code := v_tkt_codes[v_tkt_i];
            v_prod_prestadora := COALESCE(v_tkt_prestadoras[v_tkt_i], v_aerolinea_vende);
            v_prod_tarifa := COALESCE(v_tkt_tarifas[v_tkt_i], 0.0);
            v_prod_tax := COALESCE(v_tkt_impuestos[v_tkt_i], 0.0);
            v_total_prod_price := v_prod_tarifa + v_prod_tax;

            -- Buscar proveedor por prestadora code
            SELECT code INTO v_provider_matched
            FROM public."Provider"
            WHERE UPPER(sigla) = UPPER(v_prod_prestadora) 
               OR UPPER(code) = UPPER(v_prod_prestadora)
               OR UPPER("airlineCode") = UPPER(v_prod_prestadora)
            LIMIT 1;

            -- Inserción de Producto (Tiquete)
            INSERT INTO public."BookingProductGDS" (
                "bookingId", "code", "type", "description", "prestadoracode", "provider",
                "quantity", "price", "reservationCode", "inNationality", "state", "typeproduct"
            ) VALUES (
                v_booking_gds_id, v_prod_code, 'flight', 'flight', v_prod_prestadora, COALESCE(v_provider_matched, v_prod_prestadora),
                1, v_total_prod_price, v_code, 1, 'NUEVO', 'VUE'
            ) RETURNING id INTO v_booking_product_gds_id;

            -- 1. Impuesto Tarifa (TAR)
            IF v_prod_tarifa > 0 THEN
                INSERT INTO public."BookingProductTaxGDS" (
                    "bookingProductId", "code", "name", "type", "ismain", "percentage", "amount"
                ) VALUES (
                    v_booking_product_gds_id, 'TAR', 'Tarifa', 'CHARGE', true, 0, v_prod_tarifa
                );
            END IF;

            -- 2. Impuesto Otros Impuestos (OTR)
            IF v_prod_tax > 0 THEN
                INSERT INTO public."BookingProductTaxGDS" (
                    "bookingProductId", "code", "name", "type", "ismain", "percentage", "amount"
                ) VALUES (
                    v_booking_product_gds_id, 'OTR', 'Otros Impuestos', 'tax', false, 0, v_prod_tax
                );
            END IF;

            -- 3. Forma de Pago Única para ESTE tiquete
            IF v_tkt_pay_types[v_tkt_i] IS NOT NULL AND v_tkt_pay_types[v_tkt_i] <> '' THEN
                INSERT INTO public."BookingProductPaymentGDS" (
                    "bookingProductId", "code", "name", "type", "typecreditcard", "numbercreditcard", "amount"
                ) VALUES (
                    v_booking_product_gds_id, v_tkt_pay_types[v_tkt_i], v_tkt_pay_types[v_tkt_i], v_tkt_pay_types[v_tkt_i],
                    v_tkt_pay_cards[v_tkt_i], COALESCE(v_tkt_pay_numbers[v_tkt_i], ''), v_total_prod_price
                );
            END IF;

            -- 4. Itinerario para este producto
            FOR v_i IN 1 .. COALESCE(array_length(v_iti_origenes, 1), 0) LOOP
                IF v_iti_origenes[v_i] IS NOT NULL THEN
                    INSERT INTO public."BookingProductItineraryGDS" (
                        "bookingProductId", "orden", "origin", "destination", "class", "checkInDate", 
                        "checkOutDate", "terminal", "prestadoraCode", "farebasis", "Numflight", "Typeflight", "amount"
                    ) VALUES (
                        v_booking_product_gds_id, v_i, v_iti_origenes[v_i], v_iti_destinos[v_i], v_iti_clases[v_i], v_iti_fechas_salida[v_i], 
                        v_iti_fechas_llegada[v_i], v_iti_destinos[v_i], v_iti_aerolineas[v_i], '', v_iti_vuelos[v_i], '', 0
                    );
                END IF;
            END LOOP;

            -- 5. Pasajero para este producto
            IF v_tkt_i <= COALESCE(array_length(v_pax_nombres, 1), 0) AND v_pax_nombres[v_tkt_i] IS NOT NULL THEN
                INSERT INTO public."BookingProductPassangerGDS" (
                    "bookingProductId", "code", "firstnm", "lastnm", "prefix", "identification", "phone", "email"
                ) VALUES (
                    v_booking_product_gds_id, v_tkt_i::TEXT, v_pax_nombres[v_tkt_i], v_pax_apellidos[v_tkt_i], '', COALESCE(v_tkt_codes[v_tkt_i], ''), '', ''
                );
            END IF;

        END LOOP;
    END;

    RAISE NOTICE 'Reserva Sabre PNR % procesada exitosamente.', v_code;
END;
$BODY$;
