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
    v_tiquetPrinter VARCHAR(25) := '';
    v_seller VARCHAR(25) := '';
    v_client VARCHAR(25) := '';
    v_external BOOLEAN := false;
    v_typetransaction VARCHAR(25) := '1';
    v_currency VARCHAR(10) := 'COP';
    v_exchangeRate DOUBLE PRECISION := 1.0;
    v_aerolinea_vende VARCHAR(10) := 'AA';
    v_provider_matched VARCHAR(50) := NULL;
    v_tiqueteador VARCHAR(20) := '';
    
    -- Lineas y tokens
    v_lines TEXT[];
    v_line TEXT;
    v_i INT;
    
    -- Pasajeros
    v_pax_nombres TEXT[] := ARRAY[]::TEXT[];
    v_pax_apellidos TEXT[] := ARRAY[]::TEXT[];
    v_pax_tiquetes TEXT[] := ARRAY[]::TEXT[];
    
    -- Itinerarios
    v_iti_origenes TEXT[] := ARRAY[]::TEXT[];
    v_iti_destinos TEXT[] := ARRAY[]::TEXT[];
    v_iti_vuelos TEXT[] := ARRAY[]::TEXT[];
    v_iti_clases TEXT[] := ARRAY[]::TEXT[];
    v_iti_aerolineas TEXT[] := ARRAY[]::TEXT[];
    v_iti_fechas_salida TIMESTAMP[] := ARRAY[]::TIMESTAMP[];
    v_iti_fechas_llegada TIMESTAMP[] := ARRAY[]::TIMESTAMP[];
    
    -- Pagos e Impuestos
    v_pay_tipos TEXT[] := ARRAY[]::TEXT[];
    v_pay_tarjetas TEXT[] := ARRAY[]::TEXT[];
    v_pay_numbers TEXT[] := ARRAY[]::TEXT[];
    v_pay_montos DOUBLE PRECISION[] := ARRAY[]::DOUBLE PRECISION[];
    v_total_tarifa DOUBLE PRECISION := 0.0;
    v_total_impuestos DOUBLE PRECISION := 0.0;
    v_total_reserva DOUBLE PRECISION := 0.0;
    
    -- IDs de Tablas
    v_booking_gds_id INT;
    v_booking_product_gds_id INT;
    v_tkt VARCHAR(50) := NULL;
BEGIN
    -- 1. Separar líneas del contenido del archivo (p_Booking)
    v_lines := string_to_array(p_Booking, E'\n');
    IF v_lines IS NULL OR array_length(v_lines, 1) = 0 THEN
        RAISE EXCEPTION 'El contenido del archivo Sabre está vacío.' USING ERRCODE = 'P0001';
    END IF;

    -- 2. Primera pasada: Parsear Cabecera (AA), Vuelos (M30), Pasajeros (M1) y Tiquetes (M50)
    FOR v_i IN 1 .. array_length(v_lines, 1) LOOP
        v_line := REPLACE(REPLACE(v_lines[v_i], E'\r', ''), E'\uFEFF', '');
        
        -- Cabecera AA
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

        -- Itinerarios Vuelos M30 (HK, YK, RR, GK)
        IF v_line LIKE 'M30%' THEN
            DECLARE
                v_status TEXT;
                v_orig TEXT;
                v_dest TEXT;
                v_aero TEXT;
                v_flight TEXT;
                v_class TEXT;
            BEGIN
                v_status := SUBSTRING(v_line FROM 8 FOR 2);
                IF v_status IN ('HK', 'YK', 'RR', 'GK', '0H') OR v_line LIKE 'M30%' THEN
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
                END IF;
            END;
        END IF;

        -- Tiquetes y Valores M50 / M501 / M502
        IF v_line LIKE 'M50%' THEN
            DECLARE
                v_hash_pos INT;
                v_tkt_num TEXT;
                v_cc_pos INT;
            BEGIN
                v_hash_pos := POSITION('#' IN v_line);
                IF v_hash_pos > 0 THEN
                    v_tkt_num := SUBSTRING(v_line FROM v_hash_pos + 1 FOR 10);
                    IF v_tkt_num ~ '^[0-9]+$' THEN
                        v_pax_tiquetes := array_append(v_pax_tiquetes, v_tkt_num);
                        IF v_tkt IS NULL THEN v_tkt := v_tkt_num; END IF;
                    END IF;
                END IF;

                -- Tarjeta de Crédito CC
                v_cc_pos := POSITION('CC' IN v_line);
                IF v_cc_pos > 0 THEN
                    v_pay_tipos := array_append(v_pay_tipos, 'TC');
                    v_pay_tarjetas := array_append(v_pay_tarjetas, SUBSTRING(v_line FROM v_cc_pos FOR 4));
                    v_pay_numbers := array_append(v_pay_numbers, SUBSTRING(v_line FROM v_cc_pos + 4 FOR 16));
                END IF;
            END;
        END IF;

        -- Agente / Tiqueteador M828
        IF v_line LIKE 'M828AGENT*%' THEN
            v_tiqueteador := TRIM(SUBSTRING(v_line FROM 9 FOR 10));
            v_seller := v_tiqueteador;
        END IF;

    END LOOP;

    -- Validar existencia de PNR
    IF v_code IS NULL OR v_code = '' THEN
        RAISE EXCEPTION 'No se encontro codigo de reserva en la cabecera (AA).' USING ERRCODE = 'P0001';
    END IF;

    -- Buscar proveedor por sigla / código de aerolínea
    SELECT code INTO v_provider_matched
    FROM public."Provider"
    WHERE UPPER(sigla) = UPPER(v_aerolinea_vende) 
       OR UPPER(code) = UPPER(v_aerolinea_vende)
       OR UPPER("airlineCode") = UPPER(v_aerolinea_vende)
    LIMIT 1;

    -- Upsert en BookingGDS
    SELECT id INTO v_booking_gds_id FROM public."BookingGDS" WHERE "code" = v_code LIMIT 1;

    IF v_booking_gds_id IS NOT NULL THEN
        UPDATE public."BookingGDS" SET
            "type" = 'RES',
            "blanch" = v_blanch,
            "gds" = 2,
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
            v_code, 'RES', v_blanch, '', false, 2, CURRENT_TIMESTAMP, 
            v_currency, v_exchangeRate, '', COALESCE(v_seller, ''), '', 
            p_Booking, '1', '', 'Sabre Interface', '', 'NUEVO'
        ) RETURNING id INTO v_booking_gds_id;
    END IF;

    -- Creación de productos y detalles por pasajero / tiquete
    DECLARE
        v_num_pax INT;
        v_num_prods INT;
        v_pax_i INT;
        v_prod_code TEXT;
    BEGIN
        v_num_pax := GREATEST(COALESCE(array_length(v_pax_nombres, 1), 0), COALESCE(array_length(v_pax_tiquetes, 1), 0));
        v_num_prods := GREATEST(1, v_num_pax);

        FOR v_pax_i IN 1 .. v_num_prods LOOP
            IF v_num_pax > 0 AND v_pax_i <= array_length(v_pax_tiquetes, 1) AND v_pax_tiquetes[v_pax_i] IS NOT NULL THEN
                v_prod_code := v_pax_tiquetes[v_pax_i];
            ELSE
                v_prod_code := COALESCE(v_tkt, 'VUE');
            END IF;

            INSERT INTO public."BookingProductGDS" (
                "bookingId", "code", "type", "description", "prestadoracode", "provider",
                "quantity", "price", "reservationCode", "inNationality", "state", "typeproduct"
            ) VALUES (
                v_booking_gds_id, v_prod_code, 'flight', 'flight', v_aerolinea_vende, COALESCE(v_provider_matched, v_aerolinea_vende),
                1, 0, v_code, 1, 'NUEVO', 'VUE'
            ) RETURNING id INTO v_booking_product_gds_id;

            -- Itinerarios
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

            -- Pasajero
            IF v_num_pax > 0 AND v_pax_i <= array_length(v_pax_nombres, 1) AND v_pax_nombres[v_pax_i] IS NOT NULL THEN
                INSERT INTO public."BookingProductPassangerGDS" (
                    "bookingProductId", "code", "firstnm", "lastnm", "prefix", "identification", "phone", "email"
                ) VALUES (
                    v_booking_product_gds_id, v_pax_i::TEXT, v_pax_nombres[v_pax_i], v_pax_apellidos[v_pax_i], '', COALESCE(v_pax_tiquetes[v_pax_i], ''), '', ''
                );
            END IF;

            -- Forma de Pago
            FOR v_i IN 1 .. COALESCE(array_length(v_pay_tipos, 1), 0) LOOP
                IF v_pay_tipos[v_i] IS NOT NULL THEN
                    INSERT INTO public."BookingProductPaymentGDS" (
                        "bookingProductId", "code", "name", "type", "typecreditcard", "numbercreditcard", "amount"
                    ) VALUES (
                        v_booking_product_gds_id, v_pay_tipos[v_i], v_pay_tipos[v_i], v_pay_tipos[v_i], v_pay_tarjetas[v_i], COALESCE(v_pay_numbers[v_i], ''), 0
                    );
                END IF;
            END LOOP;

        END LOOP;
    END;

    RAISE NOTICE 'Reserva Sabre PNR % procesada exitosamente.', v_code;
END;
$BODY$;
