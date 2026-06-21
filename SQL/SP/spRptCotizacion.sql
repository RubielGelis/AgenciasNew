CREATE OR REPLACE FUNCTION public."spRptCotizacion"(
	p_id_ini integer,
	p_id_fin integer)
    RETURNS TABLE(
        "idCotizacion" integer,
        "asesor" text,
        "fecha" timestamp without time zone,
        "clienteNombre" text,
        "clienteIdentificacion" text,
        "clienteDireccion" text,
        "clienteTelefono" text,
        "tCambio" double precision,
        "descripcionPlan" text,
        "pasajeros" text,
        "totalAdultos" integer,
        "totalNinos" integer,
        "proveedorNombre" text,
        "proveedorNIT" text,
        "proveedorContacto" text,
        "tarifaNeta" double precision,
        "impuestos" double precision,
        "adicionalesServ" double precision,
        "comision" double precision,
        "descuento" double precision,
        "sobrecomision" double precision,
        "fee" double precision,
        "total" double precision,
        "baseComisionable" double precision,
        "comisionAsesor" double precision,
        "observaciones" text,
        "logo" bytea,
        "fechasViaje" text,
        "hotelesServicios" text
    ) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000

AS $BODY$
BEGIN
    RETURN QUERY
    SELECT 
        q.id AS "idCotizacion",
        COALESCE(s.name, u.name, '')::text AS "asesor",
        q.date AS "fecha",
        c.name::text AS "clienteNombre",
        c.document::text AS "clienteIdentificacion",
        c.address::text AS "clienteDireccion",
        c."contactInfo"::text AS "clienteTelefono",
        q."exchangeRate"::double precision AS "tCambio",
        ('Cotización ' || q."internalNumber")::text AS "descripcionPlan",
        
        -- Aggregate Passengers per Quotation
        (
            SELECT string_agg(p.name, ', ')
            FROM "QuotationProductPassenger" p
            JOIN "QuotationProduct" qp2 ON p."quotationProductId" = qp2.id
            WHERE qp2."quotationId" = q.id
        )::text AS "pasajeros",

        -- Total Adults
        (
            SELECT COALESCE(SUM(qp2."paxAdults"), 0)::integer
            FROM "QuotationProduct" qp2
            WHERE qp2."quotationId" = q.id
        ) AS "totalAdultos",

        -- Total Ninos
        (
            SELECT COALESCE(SUM(qp2."paxChildren"), 0)::integer
            FROM "QuotationProduct" qp2
            WHERE qp2."quotationId" = q.id
        ) AS "totalNinos",

        -- Provider Information
        prov.name::text AS "proveedorNombre",
        prov.code::text AS "proveedorNIT",
        prov."contactInfo"::text AS "proveedorContacto",
        
        -- tarifaNeta: sum of explicitAmount where isMain = true and type = 'TAX' for this provider
        COALESCE(
            (
                SELECT SUM(qpt2."explicitAmount")
                FROM "QuotationProduct" qp2
                JOIN "QuotationProductTax" qpt2 ON qpt2."quotationProductId" = qp2.id
                JOIN "ChargeAndTax" ct2 ON ct2.id = qpt2."chargeAndTaxId"
                WHERE qp2."quotationId" = q.id
                  AND qp2."providerId" = prov.id
                  AND qpt2."isMain" = true
                  AND ct2.type = 'CHARGE'
            ), 0
        )::double precision AS "tarifaNeta",

        -- impuestos: sum of explicitAmount where isMain = false and type = 'TAX' for this provider
        COALESCE(
            (
                SELECT SUM(qpt2."explicitAmount")
                FROM "QuotationProduct" qp2
                JOIN "QuotationProductTax" qpt2 ON qpt2."quotationProductId" = qp2.id
                JOIN "ChargeAndTax" ct2 ON ct2.id = qpt2."chargeAndTaxId"
                WHERE qp2."quotationId" = q.id
                  AND qp2."providerId" = prov.id
                  AND qpt2."isMain" = false
                  AND ct2.type = 'TAX'
            ), 0
        )::double precision AS "impuestos",

        -- adicionalesServ: sum of explicitAmount where type = 'CHARGE' for this provider
        COALESCE(
            (
                SELECT SUM(qpt2."explicitAmount")
                FROM "QuotationProduct" qp2
                JOIN "QuotationProductTax" qpt2 ON qpt2."quotationProductId" = qp2.id
                JOIN "ChargeAndTax" ct2 ON ct2.id = qpt2."chargeAndTaxId"
                WHERE qp2."quotationId" = q.id
                  AND qp2."providerId" = prov.id
				  AND qpt2."isMain" = false
                  AND ct2.type = 'CHARGE'
            ), 0
        )::double precision AS "adicionalesServ",

        COALESCE(SUM(qp."sellerCommission"), 0)::double precision AS "comision",
        0::double precision AS "descuento",
        0::double precision AS "sobrecomision",
        0::double precision AS "fee",
        COALESCE(SUM(qp.price * qp.quantity), 0)::double precision AS "total",
        
        q."baseCommissionable"::double precision AS "baseComisionable",
        q."commissionPercentage"::double precision AS "comisionAsesor",
        q.state::text AS "observaciones",
        COALESCE(i.logo, b.logo) AS "logo",

        -- fechasViaje: MIN(checkInDate) to MAX(checkOutDate)
        (
            SELECT COALESCE(to_char(MIN(qp2."checkInDate"), 'DD/MM/YYYY') || ' al ' || to_char(MAX(qp2."checkOutDate"), 'DD/MM/YYYY'), '')
            FROM "QuotationProduct" qp2
            WHERE qp2."quotationId" = q.id
        )::text AS "fechasViaje",

        -- hotelesServicios: string_agg of Product descriptions
        (
            SELECT COALESCE(string_agg(DISTINCT prod.description, ', '), '')
            FROM "QuotationProduct" qp2
            JOIN "Product" prod ON qp2."productId" = prod.id
            WHERE qp2."quotationId" = q.id
        )::text AS "hotelesServicios"

    FROM "Quotation" q
    LEFT JOIN "Client" c ON q."clientId" = c.id
    LEFT JOIN "Seller" s ON q."sellerId" = s.id
    LEFT JOIN "User" u ON q."userId" = u.id
    LEFT JOIN "Branch" b ON q."branchId" = b.id
    LEFT JOIN "Implant" i ON q."implantId" = i.id
    LEFT JOIN "QuotationProduct" qp ON qp."quotationId" = q.id
    LEFT JOIN "Provider" prov ON qp."providerId" = prov.id
    WHERE q.id BETWEEN p_id_ini AND p_id_fin
    GROUP BY 
        q.id, s.name, u.name, q.date, c.name, c.document, c.address, c."contactInfo", 
        q."exchangeRate", q."internalNumber", prov.id, prov.name, prov.code, prov."contactInfo",
        q."baseCommissionable", q."commissionPercentage", q.state, i.logo, b.logo
    ORDER BY q.id;
END;
$BODY$;
