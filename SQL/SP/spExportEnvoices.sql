CREATE OR REPLACE PROCEDURE public.spExportEnvoices(
    Envoices_id TEXT,
	User_id INT,
	INOUT mensaje_resultado TEXT
)
LANGUAGE plpgsql
AS $$
/*
    AUTOR: Rubiel Gelis Guzman / Antigravity
    DESCRIPCIÓN: Generación de XML para exportación de Facturas (Invoices).
*/
DECLARE
    v_xml TEXT;
    v_nombre_usuario TEXT;
	v_state   TEXT;
    v_msg     TEXT;
    v_context TEXT;
    v_line    TEXT;
BEGIN
    -- 1. Inicializar
    mensaje_resultado := '';

    Envoices_id := TRIM(BOTH ',' FROM TRIM(COALESCE(Envoices_id, '')));
    IF Envoices_id = '' THEN
        mensaje_resultado := 'ERROR: No se han proporcionado IDs de Facturacion válidos.';
        RETURN;
    END IF;

    -- 2. Validación de usuario
    SELECT "name" INTO v_nombre_usuario FROM public."User" WHERE id = User_id;
    IF NOT FOUND THEN
        mensaje_resultado := 'ERROR: El usuario ' || User_id || ' no existe.';
        RETURN;
    END IF;

    -- 3. Crear Tablas Temporales (ESQUEMA COMPLETO)
    CREATE TEMP TABLE IF NOT EXISTS Facturacion (
		id INTEGER GENERATED ALWAYS AS IDENTITY,
		cd_fuente VARCHAR(2) ,
		cd_serie VARCHAR(2) ,
		cd_consecutivo VARCHAR(50) ,
		Tipo VARCHAR(25) ,
		Servicio VARCHAR(123) ,
		Descrip VARCHAR(78) ,
		id_item INTEGER,
		in_tipoitem INTEGER,
		iden_gds INTEGER,
		ds_fecha TIMESTAMP,
		cd_tiqueteador VARCHAR(6) ,
		cd_vendedor VARCHAR(3) ,
		cd_cliente VARCHAR(10) ,
		am_highfare DECIMAL,
		am_lowfare DECIMAL,
		am_fare DECIMAL,
		ds_reasoncode VARCHAR(2) ,
		ds_cliname VARCHAR(250) ,
		ds_clidir VARCHAR(250) ,
		ds_clicity VARCHAR(50) ,
		ds_cliid VARCHAR(10) ,
		ds_itinerario VARCHAR(250) ,
		ds_clases VARCHAR(61) ,
		in_nacionalidad INTEGER,
		id_air INTEGER,
		ds_pax_number INTEGER,
		ds_pax_firstnm VARCHAR(30) ,
		ds_pax_lastnm VARCHAR(30) ,
		ds_pax_prefix VARCHAR(3) ,
		ds_tkt_number VARCHAR(10) ,
		ds_tkt_prefix VARCHAR(3) ,
		ds_aero_code VARCHAR(3) ,
		ds_moneda VARCHAR(3) ,
		am_tarifa DECIMAL,
		am_iva DECIMAL,
		am_tua DECIMAL,
		am_comb DECIMAL,
		am_vat DECIMAL,
		ds_cc_code VARCHAR(2) ,
		ds_cc_number VARCHAR(25) ,
		am_tao DECIMAL,
		am_ivatao DECIMAL,
		am_cap DECIMAL,
		am_ivacap DECIMAL,
		ds_cc_code2 VARCHAR(2) ,
		ds_cc_number2 VARCHAR(16) ,
		am_fp1 DECIMAL,
		am_fp2 DECIMAL,
		cd_tktrevisado VARCHAR(14) ,
		am_TarifaContado DECIMAL,
		am_IvaContado DECIMAL,
		am_OtrosContado DECIMAL,
		am_TarifaCredito DECIMAL,
		am_IvaCredito DECIMAL,
		am_OtrosCredito DECIMAL,
		am_Comision DECIMAL,
		cd_clitipodoc VARCHAR(100) ,
		cd_clitipotercero VARCHAR(1) ,
		ds_clirazoncial VARCHAR(250) ,
		ds_cliname2 VARCHAR(60) ,
		ds_clilastname VARCHAR(60) ,
		ds_clilastname2 VARCHAR(60) ,
		cd_clipais VARCHAR(25) ,
		ds_clitel VARCHAR(25) ,
		cd_TipoTransaccion VARCHAR(1) ,
		Fecha_Salida TIMESTAMP,
		Fecha_Llegada TIMESTAMP,
		Id_Srv INTEGER,
		cd_conceptofacturacion INTEGER,
		cd_tiposervicio INTEGER,
		cd_proveedores VARCHAR(25) ,
		ds_proveedores VARCHAR(250) ,
		id_car INTEGER,
		dt_entrega TIMESTAMP,
		in_cars INTEGER,
		cd_carcode VARCHAR(25) ,
		cd_conf_car VARCHAR(25) ,
		cd_citysalida VARCHAR(25) ,
		dt_retorno TIMESTAMP,
		cd_cartype VARCHAR(25) ,
		cd_currency VARCHAR(10) ,
		am_tarifacar DECIMAL,
		cd_bookingsource VARCHAR(25) ,
		cd_ratecode VARCHAR(25) ,
		id_htl INTEGER,
		dt_checkin TIMESTAMP,
		in_guests INTEGER,
		cd_confirmation VARCHAR(25) ,
		cd_city VARCHAR(25) ,
		cd_htlchain VARCHAR(25) ,
		dt_checkout TIMESTAMP,
		in_noches INTEGER,
		ds_htlname VARCHAR(250) ,
		in_habs INTEGER,
		cd_bed VARCHAR(25) ,
		cd_ratecode_htl VARCHAR(25) ,
		cd_htlcur VARCHAR(10) ,
		am_htltarifa DECIMAL,
		cd_agcur VARCHAR(10) ,
		am_agtarifa MONEY,
		ds_dir1 VARCHAR(250) ,
		ds_tel VARCHAR(25) ,
		ds_fax VARCHAR(25) ,
		cd_centrocosto VARCHAR(50) ,
		NumTktConj INTEGER,
		Respuesta VARCHAR(1) ,
		ds_solicita VARCHAR(200) ,
		cd_pax_CC VARCHAR(20) ,
		ds_lapsoviaje VARCHAR(50) ,
		ds_archivo VARCHAR(250) ,
		ds_Observaciones VARCHAR(8000) ,
		ds_ClienteEmail VARCHAR(100) ,
		cd_sucursal VARCHAR(5) ,
		cd_implante VARCHAR(5) ,
		bl_ClienteActualizar BIT(1) DEFAULT B'0',
		bl_NotificacionMPD BIT(1) DEFAULT B'0',
		cd_FormaPagoTAO VARCHAR(3) ,
		cd_TarjetaCreditoTAO VARCHAR(4) ,
		cd_NumeroTarjetaTAO VARCHAR(25) ,
		cd_VencimientoTarjetaTAO CHAR(6) ,
		cd_NumeroPolizaTAO VARCHAR(50) ,
		cd_AnexoPolizaTAO VARCHAR(50) ,
		am_PorDesFormaPagoTA NUMERIC(8,4),
		cd_Penalidad VARCHAR(14) ,
		ds_cc_vence VARCHAR(5) ,
		ds_cc_vence2 VARCHAR(5) ,
		ds_cc_autorizacion VARCHAR(25) ,
		ds_cc_autorizacion2 VARCHAR(25) ,
		ds_cc_voucher VARCHAR(25) ,
		ds_cc_voucher2 VARCHAR(10) ,
		ds_AutorizacionTarjetaTAO VARCHAR(25) ,
		ds_VoucherTarjetaTAO VARCHAR(25) ,
		am_fptao DECIMAL,
		in_cc_cuotas INTEGER,
		in_cc_cuotas2 INTEGER,
		in_cuotasTarjetaTAO INTEGER,
		cd_TipoTarifaTAO VARCHAR(25) ,
		cd_TipoTiquete VARCHAR(3) ,
		am_TasaCambio DECIMAL,
		cd_tiqueteador_facturador VARCHAR(3) ,
		bl_ahorro BIT(1) DEFAULT B'0',
		in_CantidadTarifaTAO INTEGER,
		in_CantidadSegmentoTAO INTEGER,
		cd_tourcode VARCHAR(25) ,
		ds_contrato VARCHAR(25) ,
		cd_PasaportePax VARCHAR(25) ,
		ds_itinerarioaerolinea VARCHAR(128) ,
		ds_tkt_prefixIata VARCHAR(3) ,
		ds_Evento VARCHAR(250) ,
		cd_iata VARCHAR(25) ,
		ds_aero_codeIata CHAR(3) ,
		ReservaFactura VARCHAR(100) ,
		cd_Ahorro VARCHAR(3) ,
		cd_Categoria VARCHAR(50) ,
		Id_FormasPagoAirPlus INTEGER,
		cd_FormasPagoAirPlus VARCHAR(3) ,
		ds_FormasPagoAirPlus VARCHAR(100) ,
		cd_TarjetasCreditoAirPlus VARCHAR(4) ,
		ds_numerotarjetaAirPlus VARCHAR(25) ,
		am_PorFacParcial DECIMAL,
		am_PorFacParcial_Utilizar DECIMAL,
		in_cantpax INTEGER,
		Id_Precompra INTEGER,
		id_sucursal INTEGER,
		bl_cotizacion BIT(1) DEFAULT B'0',
		cd_htl VARCHAR(50) ,
		id_FormasPago INTEGER,
		id_TarjetasCredito INTEGER,
		id_formapago_cliente INTEGER,
		cd_formapago_cliente VARCHAR(3) ,
		ds_formapago_cliente VARCHAR(100) ,
		cd_fp_OtrosItems VARCHAR(3) ,
		cd_auxiliar VARCHAR(50) ,
		cd_tipoventa VARCHAR(10) ,
		am_iva2 DECIMAL,
		cd_licitacion INTEGER,
		ds_descripcion VARCHAR(500) ,
		id_tipoproveedor INTEGER,
		cd_tipoproveedor VARCHAR(10) ,
		ds_tipoproveedor VARCHAR(100) ,
		cd_Consecutivo_variablesadicionales VARCHAR(50) ,
		cd_item VARCHAR(50) 
    ) ON COMMIT DROP;

	CREATE TEMP TABLE IF NOT EXISTS CotizacionServicios(
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_TiposConceptFac VARCHAR(25),
		cd_ConceptoFacturacion VARCHAR(25),
		cd_TiposServicio VARCHAR(25) ,
		cd_Cotizacion VARCHAR(25) ,
		cd_fac_factura VARCHAR(25) ,
		cd_fac_remision VARCHAR(25) ,
		cd_proveedores VARCHAR(25) ,
		ds_tiposervnm VARCHAR(50) ,
		cd_prov_hotel CHAR(10) ,
		cd_prov_car CHAR(10) ,
		cd_prov_air CHAR(10) ,
		ds_destino VARCHAR(30) ,
		ds_servicio VARCHAR(250) ,
		ds_descrip VARCHAR(4000) ,
		ds_paxname VARCHAR(20) ,
		ds_paxape VARCHAR(20) ,
		cd_paxtype CHAR(25) ,
		in_nacionalidad INT ,
		cd_voucher VARCHAR(20) ,
		in_cantpax INT ,
		dt_llegada TIMESTAMP ,
		dt_salida TIMESTAMP ,
		cd_cencosto VARCHAR(16) ,
		cd_auxiliar VARCHAR(16) ,
		cd_item VARCHAR(16) ,
		am_valorprov DECIMAL ,
		cd_monedaprov VARCHAR(25) ,
		ds_InfoAdicional VARCHAR(8000) ,
		cd_carrental VARCHAR(25) ,
		cd_hoteles VARCHAR(25) ,
		bl_anulado BIT(1) DEFAULT B'0' ,
		cd_tiquete CHAR(11) ,
		cd_fuente_anul CHAR(2) ,
		cd_serie_anul CHAR(2) ,
		cd_consecutivo_anul CHAR(8) ,
		cd_usuario_anul VARCHAR(25),
		cd_sucursal_anul VARCHAR(25) ,
		cd_implante_anul VARCHAR(25) ,
		am_basecomisionable DECIMAL ,
		am_porcomision NUMERIC(8, 4) ,
		cd_voucherPrefijo VARCHAR(25) ,
		bl_notdomicilionacional BIT(1) DEFAULT B'0' ,
		Valor_Comision DECIMAL ,
		Valor_Recaudo DECIMAL ,
		dias_recaudo INT ,
		ds_paxClasificacion CHAR(7) ,
		cd_tipoplan VARCHAR(25) ,
		cd_acomodacion VARCHAR(25) ,
		in_dias INT ,
		in_noches INT ,
		ds_records VARCHAR(25) ,
		cd_GrConcepto VARCHAR(25) ,
		in_diasSrv INT ,
		in_nochesSrv INT ,
		cd_Especialista VARCHAR(25),
		am_porcentaje_descuento NUMERIC(8, 4) ,
		am_valor_descuento DECIMAL ,
		ds_motivo_descuento VARCHAR(1000) ,
		cd_cargosdesc_descuento VARCHAR(25) ,
		in_NumeroOpcion INT ,
		dt_FechaSalidaSrv TIMESTAMP ,
		dt_FechaLlegadaSrv TIMESTAMP ,
		cd_localizador VARCHAR(25) ,
		cd_voucherpax VARCHAR(25) ,
		am_basecomisionableprov DECIMAL ,
		am_porcomisionprov NUMERIC(8, 4) ,
		cd_NumeFac VARCHAR(15) ,
		dt_VenceFac TIMESTAMP ,
		cd_AcomodacionSrv VARCHAR(25) ,
		cd_TipoPlanSrv VARCHAR(25) ,
		in_habitaciones INT ,
		in_habitacionesSrv INT ,
		cd_Consecutivo_VARiablesAdicionales VARCHAR(8) ,
		cd_confirmacion VARCHAR(25) ,
		ds_confirmadopor VARCHAR(250) ,
		cd_paxidentificacion VARCHAR(25) ,
		bl_politicaCancelacion BIT(1) DEFAULT B'0' ,
		dt_politicaCancelacion TIMESTAMP ,
		cd_tipoHabitacionacion VARCHAR(25) ,
		cd_fac_facturaComision VARCHAR(25) ,
		cd_fac_remisionComision VARCHAR(25) ,
		cd_TarjetaAsistencia VARCHAR(25) ,
		cd_Regiones VARCHAR(25) ,
		Iden_GDS INT ,
		id_sys_entidades INT ,
		ds_TipoAuto VARCHAR(50) ,
		ds_Origen VARCHAR(30) ,
		ds_DirOrigen VARCHAR(250) ,
		ds_DirDestino VARCHAR(250) ,
		ds_TipoTarifa VARCHAR(50) ,
		am_ValorUSD DECIMAL ,
		ds_NoVuelo VARCHAR(25) ,
		ds_Vehiculo VARCHAR(250) ,
		ds_Placa VARCHAR(25) ,
		ds_CategoriaVehiculo VARCHAR(250) ,
		ds_NombreConductor VARCHAR(50) ,
		ds_telefono VARCHAR(25) ,
		ds_IdiomaConductor VARCHAR(25) ,
		cd_MonedaSrv VARCHAR(25) ,
		cd_TipoServicio VARCHAR(25) ,
		cd_Aerolinea VARCHAR(25) ,
		in_EdadPax INT ,
		am_PorFacParcial NUMERIC(8, 4) ,
		ds_GDS VARCHAR(25) ,
		dt_fechaficheroBBVA TIMESTAMP ,
		bl_tiquete BIT(1) DEFAULT B'0' ,
		am_basedescuento DECIMAL ,
		am_pordescuento NUMERIC(18, 4) ,
		cd_CotizacionServicios_Depende VARCHAR(25),
        orig_id_ref INT,
		orig_id_quotationref INT,
		mainTaxId INT
	) ON COMMIT DROP;

	CREATE TEMP TABLE IF NOT EXISTS CotizacionServicios_PaxAdicional(
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_Cotizacion VARCHAR(25),
		cd_CotizacionServicios VARCHAR(25),
		ds_paxape VARCHAR(30),
		ds_paxname VARCHAR(30),
		ds_paxprefix CHAR(25),
		ds_paxClasificacion CHAR(25),
		cd_voucherpax VARCHAR(25),
		cd_paxidentificacion VARCHAR(25),
		in_edad INT,
		cd_tiquete CHAR(50)
	) ON COMMIT DROP;

	CREATE TEMP TABLE IF NOT EXISTS CotizacionServicios_VariableAdicional(
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_Cotizacion VARCHAR(25),
		cd_CotizacionServicios VARCHAR(25),
		ds_maestro VARCHAR(25), 
		ds_VariableAdicional VARCHAR(25),
		ds_valor VARCHAR(500),
		cd_codigo CHAR(25)
	) ON COMMIT DROP;

	CREATE TEMP TABLE IF NOT EXISTS CotizacionCargos(
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_CotizacionServicios VARCHAR(25) ,
		cd_CotizacionCargos VARCHAR(25),
		cd_cargosdesc VARCHAR(25) ,
		ds_cargonm VARCHAR(50) ,
		bl_noshow BIT(1) DEFAULT B'0' ,
		am_contado DECIMAL ,
		am_credito DECIMAL ,
		am_valor DECIMAL GENERATED ALWAYS AS (am_contado + am_credito) STORED,
		am_contado_ME DECIMAL ,
		am_credito_ME DECIMAL ,
		am_valor_ME DECIMAL GENERATED ALWAYS AS (am_contado_ME + am_credito_ME) STORED,
        orig_id_ref INT,
		cd_Cotizacion VARCHAR(25) 
	) ON COMMIT DROP;

	CREATE TEMP TABLE IF NOT EXISTS CotizacionImpuestos(
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_CotizacionCargos VARCHAR(25),
		cd_CotizacionImpuestos VARCHAR(25),
		cd_ImpRet VARCHAR(25),
		ds_Impas VARCHAR(50),
		cd_impcta VARCHAR(16),
		am_porcentaje DECIMAL,
		bl_contabilizar BIT(1) DEFAULT B'0' ,
		am_contado DECIMAL,
		am_credito DECIMAL,
		am_valor DECIMAL GENERATED ALWAYS AS (am_contado + am_credito) STORED,
		am_contado_ME DECIMAL,
		am_credito_ME DECIMAL,
		am_valor_ME DECIMAL GENERATED ALWAYS AS (am_contado_ME + am_credito_ME) STORED,
		cd_CotizacionServicios VARCHAR(25),
		cd_Cotizacion VARCHAR(25)
	) ON COMMIT DROP;

	CREATE TEMP TABLE IF NOT EXISTS Fac_Servicios_TiposFacturacionHoteles(
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_Cotizacion varchar(25),
		cd_CotizacionServicios varchar(25),
		cd_TiposFacturacionHoteles varchar(25),
		cd_cargosdesc varchar(25),
		in_cantidad INT,
		am_contado DECIMAL,
		am_credito DECIMAL,
		am_valor DECIMAL GENERATED ALWAYS AS (am_contado + am_credito) STORED,
		ds_cargonm varchar(50) NULL
	) ON COMMIT DROP;

	CREATE TEMP TABLE IF NOT EXISTS CotizacionServicios_TipoProv(
		id INT GENERATED ALWAYS AS IDENTITY,
		cd_Cotizacion varchar(25),
		cd_CotizacionServicios varchar(25),
		cd_TipoProveedores varchar(25),
		ds_TipoProveedores varchar(60),
		cd_proveedores varchar(25),
		ds_proveedores varchar(250)
	) ON COMMIT DROP;

    -- 4. Poblar Tablas Temporales
    INSERT INTO Facturacion (
        cd_fuente, cd_serie, cd_consecutivo, Tipo, Servicio, Descrip, id_item, in_tipoitem, iden_gds, ds_fecha,
        cd_tiqueteador, cd_vendedor, cd_cliente, am_highfare, am_lowfare, am_fare, ds_reasoncode, ds_cliname,
        ds_clidir, ds_clicity, ds_cliid, ds_itinerario, ds_clases, in_nacionalidad, id_air, ds_pax_number,
        ds_pax_firstnm, ds_pax_lastnm, ds_pax_prefix, ds_tkt_number, ds_tkt_prefix, ds_aero_code, ds_moneda,
        am_tarifa, am_iva, am_tua, am_comb, am_vat, ds_cc_code, ds_cc_number, am_tao, am_ivatao, am_cap,
        am_ivacap, ds_cc_code2, ds_cc_number2, am_fp1, am_fp2, cd_tktrevisado, am_TarifaContado, am_IvaContado,
        am_OtrosContado, am_TarifaCredito, am_IvaCredito, am_OtrosCredito, am_Comision, cd_clitipodoc,
        cd_clitipotercero, ds_clirazoncial, ds_cliname2, ds_clilastname, ds_clilastname2, cd_clipais, ds_clitel,
        cd_TipoTransaccion, Fecha_Salida, Fecha_Llegada, Id_Srv, cd_conceptofacturacion, cd_tiposervicio,
        cd_proveedores, ds_proveedores, id_car, dt_entrega, in_cars, cd_carcode, cd_conf_car, cd_citysalida,
        dt_retorno, cd_cartype, cd_currency, am_tarifacar, cd_bookingsource, cd_ratecode, id_htl, dt_checkin,
        in_guests, cd_confirmation, cd_city, cd_htlchain, dt_checkout, in_noches, ds_htlname, in_habs,
        cd_bed, cd_ratecode_htl, cd_htlcur, am_htltarifa, cd_agcur, am_agtarifa, ds_dir1, ds_tel, ds_fax,
        cd_centrocosto, NumTktConj, Respuesta, ds_solicita, cd_pax_CC, ds_lapsoviaje, ds_archivo,
        ds_Observaciones, ds_ClienteEmail, cd_sucursal, cd_implante, bl_ClienteActualizar, bl_NotificacionMPD,
        cd_FormaPagoTAO, cd_TarjetaCreditoTAO, cd_NumeroTarjetaTAO, cd_VencimientoTarjetaTAO, cd_NumeroPolizaTAO,
        cd_AnexoPolizaTAO, am_PorDesFormaPagoTA, cd_Penalidad, ds_cc_vence, ds_cc_vence2, ds_cc_autorizacion,
        ds_cc_autorizacion2, ds_cc_voucher, ds_cc_voucher2, ds_AutorizacionTarjetaTAO, ds_VoucherTarjetaTAO,
        am_fptao, in_cc_cuotas, in_cc_cuotas2, in_cuotasTarjetaTAO, cd_TipoTarifaTAO, cd_TipoTiquete,
        am_TasaCambio, cd_tiqueteador_facturador, bl_ahorro, in_CantidadTarifaTAO, in_CantidadSegmentoTAO,
        cd_tourcode, ds_contrato, cd_PasaportePax, ds_itinerarioaerolinea, ds_tkt_prefixIata, ds_Evento,
        cd_iata, ds_aero_codeIata, ReservaFactura, cd_Ahorro, cd_Categoria, Id_FormasPagoAirPlus,
        cd_FormasPagoAirPlus, ds_FormasPagoAirPlus, cd_TarjetasCreditoAirPlus, ds_numerotarjetaAirPlus,
        am_PorFacParcial, am_PorFacParcial_Utilizar, in_cantpax, Id_Precompra, id_sucursal, bl_cotizacion,
        cd_htl, id_FormasPago, id_TarjetasCredito, id_formapago_cliente, cd_formapago_cliente, ds_formapago_cliente,
        cd_fp_OtrosItems, cd_auxiliar, cd_tipoventa, am_iva2, cd_licitacion, ds_descripcion, id_tipoproveedor,
        cd_tipoproveedor, ds_tipoproveedor, cd_Consecutivo_variablesadicionales, cd_item
    )
    SELECT 
        '' as cd_fuente, 
		'' as cd_serie,
		'I' || LPAD(e.id::text, 7, '0') as cd_consecutivo,
		CASE WHEN p.type='Tiquete' THEN 'Aire' 
			 WHEN p.type='ALOJAMIENTO' THEN 'Hotel' 
			 WHEN p.type='ALQUILER' THEN 'Auto'
			 WHEN p.type='TAO' THEN 'TAO'
			 ELSE 'SRV'
		END AS Tipo,
		ep."servicios" AS Servicio,
		ep."descripcion" AS Descrip,
		e.id AS id_item,
		CASE WHEN p.type='Tiquete' THEN 1 
			 WHEN p.type='ALOJAMIENTO' THEN 3
			 WHEN p.type='ALQUILER' THEN 3
			 WHEN p.type='TAO' THEN 2
			 ELSE 3
		END AS in_tipoitem,
		1 AS iden_gds,
		e.date AS ds_fecha,
		COALESCE(t."code",'') AS cd_tiqueteador,
		COALESCE(s."code",'') AS cd_vendedor,
		COALESCE(c.document, '') AS cd_cliente,
		0 AS am_highfare,
		0 AS am_lowfare,
		0 AS am_fare,
		'' AS ds_reasoncode,
		COALESCE(c."name", '') AS ds_cliname,
		COALESCE(c."address", '') AS ds_clidir,
		'' AS ds_clicity,
		COALESCE(c.document, '') AS ds_cliid,
		COALESCE(ep.itinerary, '') AS ds_itinerario,
		COALESCE(ep.class, '') AS ds_clases,
		COALESCE(ep."inNationality", 1) AS in_nacionalidad,
		CASE WHEN p.type='Tiquete' THEN ep.id ELSE NULL END AS id_air,
		COALESCE(cardinality(arr),1) AS ds_pax_number,
		CASE 
	        WHEN epp.name IS NULL OR TRIM(epp.name) = '' THEN ''
	        WHEN TRIM(epp.name) NOT LIKE '% %' THEN TRIM(epp.name)
	        ELSE COALESCE(arr[1], '')
	    END AS ds_pax_firstnm,
		CASE 
	        WHEN epp.name IS NULL OR TRIM(epp.name) = '' THEN ''
	        WHEN TRIM(epp.name) NOT LIKE '% %' THEN ''
	        ELSE COALESCE(arr[2], '')
	    END AS ds_pax_lastnm,
		CASE 
	        WHEN TRIM(epp.name) LIKE '% %' THEN COALESCE(arr[3], '')
	        ELSE ''
	    END AS ds_pax_prefix,
		CASE WHEN p.type='Tiquete' THEN p.code ELSE '' END AS ds_tkt_number,
		'' AS ds_tkt_prefix,
		COALESCE(ep.airline, '') AS ds_aero_code,
		COALESCE(e.currency,'COP') AS ds_moneda,
		
		-- am_tarifa (sum isMain = true)
		COALESCE((SELECT SUM("explicitAmount") FROM public."InvoicesProductTax" ipt WHERE ipt."invoiceProductId" = ep.id AND ipt."isMain" = true), 0) AS am_tarifa,
		-- am_iva (code = 'IVA')
		COALESCE((SELECT SUM(ipt."explicitAmount") FROM public."InvoicesProductTax" ipt JOIN public."ChargeAndTax" ct ON ct.id = ipt."chargeAndTaxId" WHERE ipt."invoiceProductId" = ep.id AND ct.code = 'IVA'), 0) AS am_iva,
		-- am_tua (code = 'TUA')
		COALESCE((SELECT SUM(ipt."explicitAmount") FROM public."InvoicesProductTax" ipt JOIN public."ChargeAndTax" ct ON ct.id = ipt."chargeAndTaxId" WHERE ipt."invoiceProductId" = ep.id AND ct.code = 'TUA'), 0) AS am_tua,
		-- am_comb (code = 'CMB')
		COALESCE((SELECT SUM(ipt."explicitAmount") FROM public."InvoicesProductTax" ipt JOIN public."ChargeAndTax" ct ON ct.id = ipt."chargeAndTaxId" WHERE ipt."invoiceProductId" = ep.id AND ct.code = 'CMB'), 0) AS am_comb,
		0 AS am_vat,
		
		-- ds_cc_code
		COALESCE((SELECT cc.code FROM public."InvoicesProductPayment" ipp JOIN public."CreditCard" cc ON cc.id = ipp."creditCardId" WHERE ipp."invoiceProductId" = ep.id AND ipp."paymentMethod" = 'TARJETA' LIMIT 1), '') AS ds_cc_code,
		-- ds_cc_number
		COALESCE((SELECT ipp."cardNumber" FROM public."InvoicesProductPayment" ipp WHERE ipp."invoiceProductId" = ep.id AND ipp."paymentMethod" = 'TARJETA' LIMIT 1), '') AS ds_cc_number,
		0 AS am_tao,
		0 AS am_ivatao,
		0 AS am_cap,
		0 AS am_ivacap,
		'' AS ds_cc_code2,
		'' AS ds_cc_number2,
		0 AS am_fp1,
		0 AS am_fp2,
		'' AS cd_tktrevisado,
		
		-- am_TarifaContado / am_TarifaCredito (based on payment method 'CREDITO')
		CASE WHEN NOT EXISTS (SELECT 1 FROM public."InvoicesProductPayment" ipp WHERE ipp."invoiceProductId" = ep.id AND ipp."paymentMethod" = 'CREDITO') THEN COALESCE((SELECT SUM("explicitAmount") FROM public."InvoicesProductTax" ipt WHERE ipt."invoiceProductId" = ep.id AND ipt."isMain" = true), 0) ELSE 0 END AS am_TarifaContado,
		CASE WHEN NOT EXISTS (SELECT 1 FROM public."InvoicesProductPayment" ipp WHERE ipp."invoiceProductId" = ep.id AND ipp."paymentMethod" = 'CREDITO') THEN COALESCE((SELECT SUM(ipt."explicitAmount") FROM public."InvoicesProductTax" ipt JOIN public."ChargeAndTax" ct ON ct.id = ipt."chargeAndTaxId" WHERE ipt."invoiceProductId" = ep.id AND ct.code = 'IVA'), 0) ELSE 0 END AS am_IvaContado,
		CASE WHEN NOT EXISTS (SELECT 1 FROM public."InvoicesProductPayment" ipp WHERE ipp."invoiceProductId" = ep.id AND ipp."paymentMethod" = 'CREDITO') THEN COALESCE((SELECT SUM(ipt."explicitAmount") FROM public."InvoicesProductTax" ipt JOIN public."ChargeAndTax" ct ON ct.id = ipt."chargeAndTaxId" WHERE ipt."invoiceProductId" = ep.id AND ipt."isMain" = false AND ct.code NOT IN ('IVA', 'CMB', 'TUA')), 0) ELSE 0 END AS am_OtrosContado,
		CASE WHEN EXISTS (SELECT 1 FROM public."InvoicesProductPayment" ipp WHERE ipp."invoiceProductId" = ep.id AND ipp."paymentMethod" = 'CREDITO') THEN COALESCE((SELECT SUM("explicitAmount") FROM public."InvoicesProductTax" ipt WHERE ipt."invoiceProductId" = ep.id AND ipt."isMain" = true), 0) ELSE 0 END AS am_TarifaCredito,
		CASE WHEN EXISTS (SELECT 1 FROM public."InvoicesProductPayment" ipp WHERE ipp."invoiceProductId" = ep.id AND ipp."paymentMethod" = 'CREDITO') THEN COALESCE((SELECT SUM(ipt."explicitAmount") FROM public."InvoicesProductTax" ipt JOIN public."ChargeAndTax" ct ON ct.id = ipt."chargeAndTaxId" WHERE ipt."invoiceProductId" = ep.id AND ct.code = 'IVA'), 0) ELSE 0 END AS am_IvaCredito,
		CASE WHEN EXISTS (SELECT 1 FROM public."InvoicesProductPayment" ipp WHERE ipp."invoiceProductId" = ep.id AND ipp."paymentMethod" = 'CREDITO') THEN COALESCE((SELECT SUM(ipt."explicitAmount") FROM public."InvoicesProductTax" ipt JOIN public."ChargeAndTax" ct ON ct.id = ipt."chargeAndTaxId" WHERE ipt."invoiceProductId" = ep.id AND ipt."isMain" = false AND ct.code NOT IN ('IVA', 'CMB', 'TUA')), 0) ELSE 0 END AS am_OtrosCredito,
		
		COALESCE(ep."sellerCommission", 0) AS am_Comision,
		'' AS cd_clitipodoc,
		'' AS cd_clitipotercero,
		'' AS ds_clirazoncial,
		'' AS ds_cliname2,
		'' AS ds_clilastname,
		'' AS ds_clilastname2,
		'' AS cd_clipais,
		'' AS ds_clitel,
		'' AS cd_TipoTransaccion,
		NULL AS Fecha_Salida,
		NULL AS Fecha_Llegada,
		NULL AS Id_Srv,
		NULL AS cd_conceptofacturacion,
		NULL AS cd_tiposervicio,
		'' AS cd_proveedores,
		'' AS ds_proveedores,
		NULL AS id_car,
		NULL AS dt_entrega,
		NULL AS in_cars,
		'' AS cd_carcode,
		'' AS cd_conf_car,
		'' AS cd_citysalida,
		NULL AS dt_retorno,
		'' AS cd_cartype,
		'' AS cd_currency,
		0 AS am_tarifacar,
		'' AS cd_bookingsource,
		'' AS cd_ratecode,
		NULL AS id_htl,
		NULL AS dt_checkin,
		NULL AS in_guests,
		'' AS cd_confirmation,
		'' AS cd_city,
		'' AS cd_htlchain,
		NULL AS dt_checkout,
		NULL AS in_noches,
		'' AS ds_htlname,
		NULL AS in_habs,
		'' AS cd_bed,
		'' AS cd_ratecode_htl,
		'' AS cd_htlcur,
		0 AS am_htltarifa,
		'' AS cd_agcur,
		0 AS am_agtarifa,
		'' AS ds_dir1,
		'' AS ds_tel,
		'' AS ds_fax,
		'' AS cd_centrocosto,
		NULL AS NumTktConj,
		'' AS Respuesta,
		'' AS ds_solicita,
		'' AS cd_pax_CC,
		'' AS ds_lapsoviaje,
		'' AS ds_archivo,
		'' AS ds_Observaciones,
		COALESCE(u.email, '') AS ds_ClienteEmail,
		COALESCE(b.code, '') AS cd_sucursal,
		COALESCE(i.code, '') AS cd_implante,
		B'0' AS bl_ClienteActualizar,
		B'0' AS bl_NotificacionMPD,
		'' AS cd_FormaPagoTAO,
		'' AS cd_TarjetaCreditoTAO,
		'' AS cd_NumeroTarjetaTAO,
		'' AS cd_VencimientoTarjetaTAO,
		'' AS cd_NumeroPolizaTAO,
		'' AS cd_AnexoPolizaTAO,
		0 AS am_PorDesFormaPagoTA,
		'' AS cd_Penalidad,
		COALESCE((SELECT ipp."expirationDate" FROM public."InvoicesProductPayment" ipp WHERE ipp."invoiceProductId" = ep.id AND ipp."paymentMethod" = 'TARJETA' LIMIT 1), '') AS ds_cc_vence,
		'' AS ds_cc_vence2,
		COALESCE((SELECT ipp."authorizationCode" FROM public."InvoicesProductPayment" ipp WHERE ipp."invoiceProductId" = ep.id AND ipp."paymentMethod" = 'TARJETA' LIMIT 1), '') AS ds_cc_autorizacion,
		'' AS ds_cc_autorizacion2,
		COALESCE((SELECT ipp."voucher" FROM public."InvoicesProductPayment" ipp WHERE ipp."invoiceProductId" = ep.id AND ipp."paymentMethod" = 'TARJETA' LIMIT 1), '') AS ds_cc_voucher,
		'' AS ds_cc_voucher2,
		'' AS ds_AutorizacionTarjetaTAO,
		'' AS ds_VoucherTarjetaTAO,
		0 AS am_fptao,
		NULL AS in_cc_cuotas,
		NULL AS in_cc_cuotas2,
		NULL AS in_cuotasTarjetaTAO,
		'' AS cd_TipoTarifaTAO,
		'' AS cd_TipoTiquete,
		COALESCE(e."exchangeRate", 1.0) AS am_TasaCambio,
		'' AS cd_tiqueteador_facturador,
		B'0' AS bl_ahorro,
		NULL AS in_CantidadTarifaTAO,
		NULL AS in_CantidadSegmentoTAO,
		'' AS cd_tourcode,
		'' AS ds_contrato,
		'' AS cd_PasaportePax,
		COALESCE(ep.itinerary, '') AS ds_itinerarioaerolinea,
		'' AS ds_tkt_prefixIata,
		'' AS ds_Evento,
		'' AS cd_iata,
		'' AS ds_aero_codeIata,
		'' AS ReservaFactura,
		'' AS cd_Ahorro,
		'' AS cd_Categoria,
		NULL AS Id_FormasPagoAirPlus,
		'' AS cd_FormasPagoAirPlus,
		'' AS ds_FormasPagoAirPlus,
		'' AS cd_TarjetasCreditoAirPlus,
		'' AS ds_numerotarjetaAirPlus,
		0 AS am_PorFacParcial,
		0 AS am_PorFacParcial_Utilizar,
		COALESCE(cardinality(arr), 1) AS in_cantpax,
		NULL AS Id_Precompra,
		e."branchId" AS id_sucursal,
		B'0' AS bl_cotizacion,
		'' AS cd_htl,
		NULL AS id_FormasPago,
		NULL AS id_TarjetasCredito,
		NULL AS id_formapago_cliente,
		'' AS cd_formapago_cliente,
		'' AS ds_formapago_cliente,
		'' AS cd_fp_OtrosItems,
		'' AS cd_auxiliar,
		'' AS cd_tipoventa,
		0 AS am_iva2,
		NULL AS cd_licitacion,
		ep.descripcion AS ds_descripcion,
		NULL AS id_tipoproveedor,
		'' AS cd_tipoproveedor,
		'' AS ds_tipoproveedor,
		'I' || LPAD(ep."id"::text, 7, '0') AS cd_Consecutivo_variablesadicionales,
		'I' || LPAD(ep."id"::text, 7, '0') AS cd_item
    FROM public."Invoices" e
	JOIN public."InvoicesProduct" ep ON ep."invoiceId" = e.id
	JOIN public."Product" p ON p.id = ep."productId"
    JOIN public."Client" c ON e."clientId" = c.id
    JOIN public."Branch" b ON e."branchId" = b.id
    LEFT JOIN public."Implant" i ON e."implantId" = i.id
    LEFT JOIN public."Seller" s ON e."sellerId" = s.id
    LEFT JOIN public."TicketPrinter" t ON e."ticketPrinterId" = t.id
    LEFT JOIN public."User" u ON e."userId" = u.id
	LEFT JOIN LATERAL ( SELECT  pp.*,
		        				regexp_split_to_array(TRIM(pp.name), 's+') AS arr
		    			FROM public."InvoicesProductPasenger" pp 
						WHERE pp."invoiceProductId" = ep.id
    					ORDER BY pp.id
    					LIMIT 1) epp ON true
    WHERE e.id = ANY(string_to_array(Envoices_id, ',')::int[]);

    -- 5. Poblar Tablas de Relación (CotizacionServicios y subtablas)
    INSERT INTO CotizacionServicios (
        cd_TiposConceptFac, cd_ConceptoFacturacion, cd_TiposServicio, cd_Cotizacion,
        cd_fac_factura, cd_fac_remision, cd_proveedores, ds_tiposervnm, cd_prov_hotel,
        cd_prov_car, cd_prov_air, ds_destino, ds_servicio, ds_descrip, ds_paxname,
        ds_paxape, cd_paxtype, in_nacionalidad, cd_voucher, in_cantpax, dt_llegada,
        dt_salida, cd_cencosto, cd_auxiliar, cd_item, am_valorprov, cd_monedaprov,
        ds_InfoAdicional, cd_carrental, cd_hoteles, bl_anulado, cd_tiquete,
        cd_fuente_anul, cd_serie_anul, cd_consecutivo_anul, cd_usuario_anul,
        cd_sucursal_anul, cd_implante_anul, am_basecomisionable, am_porcomision,
        cd_voucherPrefijo, bl_notdomicilionacional, Valor_Comision, Valor_Recaudo,
        dias_recaudo, ds_paxClasificacion, cd_tipoplan, cd_acomodacion, in_dias,
        in_noches, ds_records, cd_GrConcepto, in_diasSrv, in_nochesSrv, cd_Especialista,
        am_porcentaje_descuento, am_valor_descuento, ds_motivo_descuento,
        cd_cargosdesc_descuento, in_NumeroOpcion, dt_FechaSalidaSrv, dt_FechaLlegadaSrv,
        cd_localizador, cd_voucherpax, am_basecomisionableprov, am_porcomisionprov,
        cd_NumeFac, dt_VenceFac, cd_AcomodacionSrv, cd_TipoPlanSrv, in_habitaciones,
        in_habitacionesSrv, cd_Consecutivo_VARiablesAdicionales, cd_confirmacion,
        ds_confirmadopor, cd_paxidentificacion, bl_politicaCancelacion,
        dt_politicaCancelacion, cd_tipoHabitacionacion, cd_fac_facturaComision,
        cd_fac_remisionComision, cd_TarjetaAsistencia, cd_Regiones, Iden_GDS, id_sys_entidades,
        ds_TipoAuto, ds_Origen, ds_DirOrigen, ds_DirDestino, ds_TipoTarifa, am_ValorUSD,
        ds_NoVuelo, ds_Vehiculo, ds_Placa, ds_CategoriaVehiculo, ds_NombreConductor,
        ds_telefono, ds_IdiomaConductor, cd_MonedaSrv, cd_TipoServicio, cd_Aerolinea,
        in_EdadPax, am_PorFacParcial, ds_GDS, dt_fechaficheroBBVA, bl_tiquete,
        am_basedescuento, am_pordescuento, cd_CotizacionServicios_Depende, 
		orig_id_ref, orig_id_quotationref, mainTaxId
    )
    SELECT 
        COALESCE(pr."type", '') as cd_TiposConceptFac, 
        COALESCE(pr."billingConcept", pr."code", '') as cd_ConceptoFacturacion, 
        COALESCE(pr."serviceType", ep."serviceType", '') as cd_TiposServicio, 
        f.cd_consecutivo as cd_Cotizacion,
        '' as cd_fac_factura, 
        '' as cd_fac_remision, 
        COALESCE(prov.code, prov.name, '') as cd_proveedores, 
        COALESCE(ep."serviceType", '') as ds_tiposervnm, 
        '' as cd_prov_hotel,
        '' as cd_prov_car, 
        '' as cd_prov_air, 
        COALESCE(ep.destination, '') as ds_destino, 
        COALESCE(pr.description, '') as ds_servicio, 
        COALESCE(pr.description, '') as ds_descrip, 
		CASE 
	        WHEN epp.name IS NULL OR TRIM(epp.name) = '' THEN ''
	        WHEN TRIM(epp.name) NOT LIKE '% %' THEN TRIM(epp.name)
	        ELSE COALESCE(arr[1], '')
	    END AS ds_paxname,
	    CASE 
	        WHEN epp.name IS NULL OR TRIM(epp.name) = '' THEN ''
	        WHEN TRIM(epp.name) NOT LIKE '% %' THEN ''
	        ELSE COALESCE(arr[2], '')
	    END AS ds_paxape,
        CASE 
	        WHEN TRIM(epp.name) LIKE '% %' THEN COALESCE(arr[3], '')
	        ELSE ''
	    END as cd_paxtype, 
        COALESCE(ep."inNationality", 1) as in_nacionalidad, 
        '' as cd_voucher, 
        ep.quantity as in_cantpax, 
        COALESCE(ep."checkInDate", f.ds_fecha) as dt_llegada,
        COALESCE(ep."checkOutDate", f.ds_fecha) as dt_salida, 
        '' as cd_cencosto, 
        '' as cd_auxiliar, 
        '' as cd_item, 
        ep.price as am_valorprov, 
        e.currency as cd_monedaprov,
        '' as ds_InfoAdicional, 
        '' as cd_carrental, 
        COALESCE(pre."code",'') as cd_hoteles, 
        B'0' as bl_anulado, 
        '' as cd_tiquete,
        '' as cd_fuente_anul, 
        '' as cd_serie_anul, 
        '' as cd_consecutivo_anul, 
        '' as cd_usuario_anul,
        '' as cd_sucursal_anul, 
        '' as cd_implante_anul, 
        0 as am_basecomisionable, 
        0 as am_porcomision,
        '' as cd_voucherPrefijo, 
        B'0' as bl_notdomicilionacional, 
        0 as Valor_Comision, 
        0 as Valor_Recaudo,
        0 as dias_recaudo, 
        '' as ds_paxClasificacion, 
        '' as cd_tipoplan, 
        '' as cd_acomodacion, 
        0 as in_dias,
        0 as in_noches, 
        '' as ds_records, 
        '' as cd_GrConcepto, 
        0 as in_diasSrv, 
        0 as in_nochesSrv, 
        '' as cd_Especialista,
        0 as am_porcentaje_descuento, 
        0 as am_valor_descuento, 
        '' as ds_motivo_descuento,
        '' as cd_cargosdesc_descuento, 
        0 as in_NumeroOpcion, 
        f.ds_fecha as dt_FechaSalidaSrv, 
        f.ds_fecha as dt_FechaLlegadaSrv,
        '' as cd_localizador, 
        '' as cd_voucherpax, 
        0 as am_basecomisionableprov, 
        0 as am_porcomisionprov,
        '' as cd_NumeFac, 
        f.ds_fecha as dt_VenceFac, 
        '' as cd_AcomodacionSrv, 
        '' as cd_TipoPlanSrv, 
        0 as in_habitaciones,
        0 as in_habitacionesSrv, 
        'Q' || LPAD(ep."id"::text, 7, '0') as cd_Consecutivo_VARiablesAdicionales, 
        '' as cd_confirmacion,
        '' as ds_confirmadopor, 
        COALESCE(epp.document,'') as cd_paxidentificacion, 
        B'0' as bl_politicaCancelacion,
        f.ds_fecha as dt_politicaCancelacion, 
        '' as cd_tipoHabitacionacion, 
        '' as cd_fac_facturaComision,
        '' as cd_fac_remisionComision, 
        '' as cd_TarjetaAsistencia, 
        '' as cd_Regiones, 
        0 as Iden_GDS, 
        0 as id_sys_entidades,
        '' as ds_TipoAuto, 
        '' as ds_Origen, 
        '' as ds_DirOrigen, 
        '' as ds_DirDestino, 
        '' as ds_TipoTarifa, 
        0 as am_ValorUSD,
        '' as ds_NoVuelo, 
        '' as ds_Vehiculo, 
        '' as ds_Placa, 
        '' as ds_CategoriaVehiculo, 
        '' as ds_NombreConductor,
        '' as ds_telefono, 
        '' as ds_IdiomaConductor, 
        e.currency as cd_MonedaSrv, 
        '' as cd_TipoServicio, 
        '' as cd_Aerolinea,
        0 as in_EdadPax, 
        0 as am_PorFacParcial, 
        '' as ds_GDS, 
        f.ds_fecha as dt_fechaficheroBBVA, 
        B'0' as bl_tiquete,
        0 as am_basedescuento, 
        0 as am_pordescuento, 
        '' as cd_CotizacionServicios_Depende, 
        ep.id as orig_id_ref,
        f.id as orig_id_quotationref,
        ep."mainTaxId" as mainTaxId
    FROM public."InvoicesProduct" ep
	JOIN public."Invoices" e ON ep."invoiceId" = e.id
    JOIN public."Product" pr ON ep."productId" = pr.id
    JOIN Facturacion f ON ep."invoiceId" = f.id_item
    LEFT JOIN public."Provider" prov ON ep."providerId" = prov."id"
	LEFT JOIN public."Prestadora" pre ON pre."id" = ep."prestadoraId"
	LEFT JOIN LATERAL ( SELECT  pp.*,
		        				regexp_split_to_array(TRIM(pp.name), 's+') AS arr
		    			FROM public."InvoicesProductPasenger" pp 
						WHERE pp."invoiceProductId" = ep.id
    					ORDER BY pp.id
    					LIMIT 1) epp ON true;

	INSERT INTO CotizacionServicios_PaxAdicional (
		cd_Cotizacion, cd_CotizacionServicios, ds_paxape, ds_paxname, ds_paxprefix,
		ds_paxClasificacion, cd_voucherpax, cd_paxidentificacion, in_edad, cd_tiquete
	)
	SELECT 
	    cs.cd_Cotizacion, 
	    cs.cd_Consecutivo_VARiablesAdicionales AS cd_CotizacionServicios, 
	    CASE 
	        WHEN p.name IS NULL OR TRIM(p.name) = '' THEN ''
	        WHEN TRIM(p.name) NOT LIKE '% %' THEN ''
	        ELSE COALESCE(arr[2], '')
	    END AS ds_paxape,
	    CASE 
	        WHEN p.name IS NULL OR TRIM(p.name) = '' THEN ''
	        WHEN TRIM(p.name) NOT LIKE '% %' THEN TRIM(p.name)
	        ELSE COALESCE(arr[1], '')
	    END AS ds_paxname,
	    CASE 
	        WHEN TRIM(p.name) LIKE '% %' THEN COALESCE(arr[3], '')
	        ELSE ''
	    END AS ds_paxprefix,
	    CASE 
	        WHEN TRIM(p.name) LIKE '% %' THEN COALESCE(arr[4], '')
	        ELSE ''
	    END AS ds_paxClasificacion,
	    CASE 
	        WHEN TRIM(p.name) LIKE '% %' THEN COALESCE(arr[5], '')
	        ELSE ''
	    END AS cd_voucherpax,
	    p.document AS cd_paxidentificacion, 
	    0 AS in_edad, 
	    '' AS cd_tiquete
		FROM (
		    SELECT 
		        p.*,
		        regexp_split_to_array(TRIM(p.name), 's+') AS arr,
		        ROW_NUMBER() OVER (
		            PARTITION BY p."invoiceProductId"
		            ORDER BY p.id
		        ) AS rn
		    FROM public."InvoicesProductPasenger" p
		) p
		JOIN CotizacionServicios cs 
		    ON p."invoiceProductId" = cs.orig_id_ref
		WHERE p.rn > 1;

	INSERT INTO CotizacionServicios_VariableAdicional (
        cd_Cotizacion, cd_CotizacionServicios, ds_maestro, ds_VariableAdicional, ds_valor, cd_codigo
	)
	SELECT 
        cs.cd_Cotizacion,
        cs.cd_Consecutivo_VARiablesAdicionales as cd_CotizacionServicios, 
        'CotizacionServicios' as ds_maestro, 
        COALESCE(mv.name, '') as ds_VariableAdicional, 
        COALESCE(v.value, '') as ds_valor, 
        COALESCE(mv.code, '') as cd_codigo
    FROM public."InvoicesProductVariable" v
    JOIN public."MasterVariable" mv ON v."masterVariableId" = mv.id
    JOIN CotizacionServicios cs ON v."invoiceProductId" = cs.orig_id_ref;

	INSERT INTO CotizacionCargos (
        cd_CotizacionServicios, cd_CotizacionCargos, cd_cargosdesc, ds_cargonm, bl_noshow, am_contado,
        am_credito, am_valor, am_contado_ME, am_credito_ME, am_valor_ME, orig_id_ref, cd_Cotizacion
	)
	SELECT 
        cs.cd_Consecutivo_VARiablesAdicionales as cd_CotizacionServicios,
        t.id::text as cd_CotizacionCargos,
        COALESCE(ct.code, 'TAR') as cd_cargosdesc,
        COALESCE(ct.name, 'Tarifa') as ds_cargonm,
        B'0' as bl_noshow,
        t."explicitAmount" as am_contado,
        0 as am_credito,
        t."explicitAmount" as am_valor,
        0 as am_contado_ME,
        0 as am_credito_ME,
        0 as am_valor_ME,
        t.id as orig_id_ref,
        cs.cd_Cotizacion
    FROM public."InvoicesProductTax" t
    JOIN public."ChargeAndTax" ct ON t."chargeAndTaxId" = ct.id
    JOIN CotizacionServicios cs ON t."invoiceProductId" = cs.orig_id_ref
    WHERE t."isMain" = true;

	INSERT INTO CotizacionImpuestos (
		cd_CotizacionServicios, cd_Cotizacion, cd_CotizacionCargos, cd_CotizacionImpuestos,
		cd_ImpRet, ds_Impas, cd_impcta, am_porcentaje, bl_contabilizar, am_contado,
		am_credito, am_valor, am_contado_ME, am_credito_ME, am_valor_ME
	)
	SELECT 
		cs.cd_Consecutivo_VARiablesAdicionales as cd_CotizacionServicios, 
		cs.cd_Cotizacion,
		cc.cd_CotizacionCargos,
		t.id::text as cd_CotizacionImpuestos,
		COALESCE(ct.code, 'IVA') as cd_ImpRet,
		COALESCE(ct.name, 'IVA') as ds_Impas,
		'' as cd_impcta,
		COALESCE(ct.value, 19) as am_porcentaje,
		B'0' as bl_contabilizar,
		t."explicitAmount" as am_contado,
		0 as am_credito,
		t."explicitAmount" as am_valor,
		0 as am_contado_ME,
		0 as am_credito_ME,
		0 as am_valor_ME
    FROM public."InvoicesProductTax" t
    JOIN public."ChargeAndTax" ct ON t."chargeAndTaxId" = ct.id
    JOIN CotizacionServicios cs ON t."invoiceProductId" = cs.orig_id_ref
    LEFT JOIN CotizacionCargos cc ON cc.cd_CotizacionServicios = cs.cd_Consecutivo_VARiablesAdicionales
    WHERE t."isMain" = false;

	INSERT INTO Fac_Servicios_TiposFacturacionHoteles (
		cd_Cotizacion, cd_CotizacionServicios, cd_TiposFacturacionHoteles, cd_cargosdesc,
		in_cantidad, am_contado, am_credito, ds_cargonm
	)
	SELECT 
		cs.cd_Cotizacion,
		cs.cd_Consecutivo_VARiablesAdicionales as cd_CotizacionServicios,
		'NCH' as cd_TiposFacturacionHoteles,
		'TAR' as cd_cargosdesc,
		COALESCE(ep."quantity", 0) as in_cantidad,
		COALESCE(t."explicitAmount", 0) as am_contado,
		0 as am_credito,
		COALESCE(ct.name, 'Tarifa') as ds_cargonm
	FROM public."InvoicesProduct" ep
	JOIN CotizacionServicios cs ON ep.id = cs.orig_id_ref
	LEFT JOIN public."ChargeAndTax" ct ON ct.id = ep."mainTaxId"
	LEFT JOIN public."InvoicesProductTax" t ON t."invoiceProductId" = ep.id AND t."chargeAndTaxId" = ep."mainTaxId";

	INSERT INTO CotizacionServicios_TipoProv(
		cd_Cotizacion,
		cd_CotizacionServicios,
		cd_TipoProveedores,
		ds_TipoProveedores,
		cd_proveedores,
		ds_proveedores
	)
	SELECT 
		cs.cd_Cotizacion, 
		cs.cd_Consecutivo_VARiablesAdicionales as cd_CotizacionServicios,
		'HTL' as cd_TipoProveedores,
		'HOTEL' as ds_TipoProveedores,
		COALESCE(pre.code, '') as cd_proveedores,
		COALESCE(pre.name, '') as ds_proveedores
	FROM public."InvoicesProduct" ep
	JOIN CotizacionServicios cs ON ep.id = cs.orig_id_ref
	LEFT JOIN public."Prestadora" pre ON pre.id = ep."prestadoraId";

    -- 5. Generar XML
    SELECT xmlroot(
        xmlelement(name "Facturaciones",
            xmlagg(
                xmlelement(name "Facturacion",
                    xmlforest(
                        f.id,
				        f.cd_fuente, 
						f.cd_serie,
						f.cd_consecutivo,
						f.Tipo,
						f.Servicio,
						f.Descrip,
						f.id_item,
						f.in_tipoitem,
						f.iden_gds,
						f.ds_fecha,
						f.cd_tiqueteador,
						f.cd_vendedor,
						f.cd_cliente,
						f.am_highfare,
						f.am_lowfare,
						f.am_fare,
						f.ds_reasoncode,
						f.ds_cliname,
						f.ds_clidir,
						f.ds_clicity,
						f.ds_cliid,
						f.ds_itinerario,
						f.ds_clases,
						f.in_nacionalidad,
						f.id_air,
						f.ds_pax_number,
						f.ds_pax_firstnm,
						f.ds_pax_lastnm,
						f.ds_pax_prefix,
						f.ds_tkt_number,
						f.ds_tkt_prefix,
						f.ds_aero_code,
						f.ds_moneda,
						f.am_tarifa,
						f.am_iva,
						f.am_tua,
						f.am_comb,
						f.am_vat,
						f.ds_cc_code,
						f.ds_cc_number,
						f.am_tao,
						f.am_ivatao,
						f.am_cap,
						f.am_ivacap,
						f.ds_cc_code2,
						f.ds_cc_number2,
						f.am_fp1,
						f.am_fp2,
						f.cd_tktrevisado,
						f.am_TarifaContado,
						f.am_IvaContado,
						f.am_OtrosContado,
						f.am_TarifaCredito,
						f.am_IvaCredito,
						f.am_OtrosCredito,
						f.am_Comision,
						f.cd_clitipodoc,
						f.cd_clitipotercero,
						f.ds_clirazoncial,
						f.ds_cliname2,
						f.ds_clilastname,
						f.ds_clilastname2,
						f.cd_clipais,
						f.ds_clitel,
						f.cd_TipoTransaccion,
						f.Fecha_Salida,
						f.Fecha_Llegada,
						f.Id_Srv,
						f.cd_conceptofacturacion,
						f.cd_tiposervicio,
						f.cd_proveedores,
						f.ds_proveedores,
						f.id_car,
						f.dt_entrega,
						f.in_cars,
						f.cd_carcode,
						f.cd_conf_car,
						f.cd_citysalida,
						f.dt_retorno,
						f.cd_cartype,
						f.cd_currency,
						f.am_tarifacar,
						f.cd_bookingsource,
						f.cd_ratecode,
						f.id_htl,
						f.dt_checkin,
						f.in_guests,
						f.cd_confirmation,
						f.cd_city,
						f.cd_htlchain,
						f.dt_checkout,
						f.in_noches,
						f.ds_htlname,
						f.in_habs,
						f.cd_bed,
						f.cd_ratecode_htl,
						f.cd_htlcur,
						f.am_htltarifa,
						f.cd_agcur,
						f.am_agtarifa,
						f.ds_dir1,
						f.ds_tel,
						f.ds_fax,
						f.cd_centrocosto,
						f.NumTktConj,
						f.Respuesta,
						f.ds_solicita,
						f.cd_pax_CC,
						f.ds_lapsoviaje,
						f.ds_archivo,
						f.ds_Observaciones,
						f.ds_ClienteEmail,
						f.cd_sucursal,
						f.cd_implante, 
						f.bl_ClienteActualizar,
						f.bl_NotificacionMPD,
						f.cd_FormaPagoTAO,
						f.cd_TarjetaCreditoTAO, 
						f.cd_NumeroTarjetaTAO, 
						f.cd_VencimientoTarjetaTAO, 
						f.cd_NumeroPolizaTAO,
						f.cd_AnexoPolizaTAO,
						f.am_PorDesFormaPagoTA, 
						f.cd_Penalidad, 
						f.ds_cc_vence, 
						f.ds_cc_vence2,
						f.ds_cc_autorizacion,
						f.ds_cc_autorizacion2,
						f.ds_cc_voucher,
						f.ds_cc_voucher2,
						f.ds_AutorizacionTarjetaTAO,
						f.ds_VoucherTarjetaTAO,
						f.am_fptao,
						f.in_cc_cuotas,
						f.in_cc_cuotas2,
						f.in_cuotasTarjetaTAO,
						f.cd_TipoTarifaTAO,
						f.cd_TipoTiquete,
						f.am_TasaCambio,
						f.cd_tiqueteador_facturador,
						f.bl_ahorro,
						f.in_CantidadTarifaTAO,
						f.in_CantidadSegmentoTAO,
						f.cd_tourcode,
						f.ds_contrato,
						f.cd_PasaportePax,
						f.ds_itinerarioaerolinea,
						f.ds_tkt_prefixIata,
						f.ds_Evento,
						f.cd_iata,
						f.ds_aero_codeIata,
						f.ReservaFactura,
						f.cd_Ahorro,
						f.cd_Categoria,
						f.Id_FormasPagoAirPlus,
						f.cd_FormasPagoAirPlus,
						f.ds_FormasPagoAirPlus,
						f.cd_TarjetasCreditoAirPlus,
						f.ds_numerotarjetaAirPlus,
						f.am_PorFacParcial,
						f.am_PorFacParcial_Utilizar,
						f.in_cantpax,
						f.Id_Precompra,
						f.id_sucursal,
						f.bl_cotizacion,
						f.cd_htl,
						f.id_FormasPago,
						f.id_TarjetasCredito,
						f.id_formapago_cliente,
						f.cd_formapago_cliente,
						f.ds_formapago_cliente,
						f.cd_fp_OtrosItems,
						f.cd_auxiliar,
						f.cd_tipoventa,
						f.am_iva2,
						f.cd_licitacion,
						f.ds_descripcion,
						f.id_tipoproveedor,
						f.cd_tipoproveedor,
						f.ds_tipoproveedor,
						f.cd_Consecutivo_variablesadicionales,
						f.cd_item
                    ),
                    (
                        SELECT xmlagg(
                            xmlelement(name "CotizacionServicios",
                                xmlforest(
                                    s.cd_TiposConceptFac, s.cd_ConceptoFacturacion, s.cd_TiposServicio, s.cd_Cotizacion,
                                    s.cd_fac_factura, s.cd_fac_remision, s.cd_proveedores, s.ds_tiposervnm, s.cd_prov_hotel,
                                    s.cd_prov_car, s.cd_prov_air, s.ds_destino, s.ds_servicio, s.ds_descrip, s.ds_paxname,
                                    s.ds_paxape, s.cd_paxtype, s.in_nacionalidad, s.cd_voucher, s.in_cantpax, s.dt_llegada,
                                    s.dt_salida, s.cd_cencosto, s.cd_auxiliar, s.cd_item, s.am_valorprov, s.cd_monedaprov,
                                    s.ds_InfoAdicional, s.cd_carrental, s.cd_htles, s.bl_anulado, s.cd_tiquete,
                                    s.cd_fuente_anul, s.cd_serie_anul, s.cd_consecutivo_anul, s.cd_usuario_anul,
                                    s.cd_sucursal_anul, s.cd_implante_anul, s.am_basecomisionable, s.am_porcomision,
                                    s.cd_voucherPrefijo, s.bl_notdomicilionacional, s.Valor_Comision, s.Valor_Recaudo,
                                    s.dias_recaudo, s.ds_paxClasificacion, s.cd_tipoplan, s.cd_acomodacion, s.in_dias,
                                    s.in_noches, s.ds_records, s.cd_GrConcepto, s.in_diasSrv, s.in_nochesSrv, s.cd_Especialista,
                                    s.am_porcentaje_descuento, s.am_valor_descuento, s.ds_motivo_descuento,
                                    s.cd_cargosdesc_descuento, s.in_NumeroOpcion, s.dt_FechaSalidaSrv, s.dt_FechaLlegadaSrv,
                                    s.cd_localizador, s.cd_voucherpax, s.am_basecomisionableprov, s.am_porcomisionprov,
                                    s.cd_NumeFac, s.dt_VenceFac, s.cd_AcomodacionSrv, s.cd_TipoPlanSrv, s.in_habitaciones,
                                    s.in_habitacionesSrv, s.cd_Consecutivo_VARiablesAdicionales, s.cd_confirmacion,
                                    s.ds_confirmadopor, s.cd_paxidentificacion, s.bl_politicaCancelacion,
                                    s.dt_politicaCancelacion, s.cd_tipoHabitacionacion, s.cd_fac_facturaComision,
                                    s.cd_fac_remisionComision, s.cd_TarjetaAsistencia, s.cd_Regiones, s.Iden_GDS, s.id_sys_entidades,
                                    s.ds_TipoAuto, s.ds_Origen, s.ds_DirOrigen, s.ds_DirDestino, s.ds_TipoTarifa, s.am_ValorUSD,
                                    s.ds_NoVuelo, s.ds_Vehiculo, s.ds_Placa, s.ds_CategoriaVehiculo, s.ds_NombreConductor,
                                    s.ds_telefono, s.ds_IdiomaConductor, s.cd_MonedaSrv, s.cd_TipoServicio, s.cd_Aerolinea,
                                    s.in_EdadPax, s.am_PorFacParcial, s.ds_GDS, s.dt_fechaficheroBBVA, s.bl_tiquete,
                                    s.am_basedescuento, s.am_pordescuento, s.cd_CotizacionServicios_Depende
                                ),
                                (
                                    SELECT xmlagg(
                                        xmlelement(name "CotizacionServicios_PaxAdicional",
                                            xmlforest(
                                                p.cd_Cotizacion, p.cd_CotizacionServicios, p.ds_paxape, p.ds_paxname, p.ds_paxprefix,
                                                p.ds_paxClasificacion, p.cd_voucherpax, p.cd_paxidentificacion, p.in_edad, p.cd_tiquete
                                            )
                                        )
                                    )
                                    FROM CotizacionServicios_PaxAdicional p
                                    WHERE p.cd_CotizacionServicios = s.cd_Consecutivo_VARiablesAdicionales
                                ),
                                (
                                    SELECT xmlagg(
                                        xmlelement(name "CotizacionServicios_VariableAdicional",
                                            xmlforest(
                                                v.cd_Cotizacion, v.cd_CotizacionServicios, v.ds_maestro, v.ds_VariableAdicional, v.ds_valor, v.cd_codigo
                                            )
                                        )
                                    )
                                    FROM CotizacionServicios_VariableAdicional v
                                    WHERE v.cd_CotizacionServicios = s.cd_Consecutivo_VARiablesAdicionales
                                ),
                                (
                                    SELECT xmlagg(
                                        xmlelement(name "CotizacionCargos",
                                            xmlforest(
                                                cr.cd_CotizacionServicios, cr.cd_CotizacionCargos, cr.cd_cargosdesc, cr.ds_cargonm,
                                                cr.bl_noshow, cr.am_contado, cr.am_credito, cr.am_valor, cr.am_contado_ME,
                                                cr.am_credito_ME, cr.am_valor_ME, cr.cd_Cotizacion
                                            ),
                                            (
                                                SELECT xmlagg(
                                                    xmlelement(name "CotizacionImpuestos",
                                                        xmlforest(
                                                            imp.cd_CotizacionServicios, imp.cd_CotizacionCargos, imp.cd_ImpRet,
                                                            imp.ds_Impas, imp.cd_impcta, imp.am_porcentaje, imp.bl_contabilizar,
                                                            imp.am_contado, imp.am_credito, imp.am_valor, imp.am_contado_ME,
                                                            imp.am_credito_ME, imp.am_valor_ME, imp.cd_CotizacionImpuestos, imp.cd_Cotizacion
                                                        )
                                                    )
                                                )
                                                FROM CotizacionImpuestos imp
                                                WHERE imp.cd_CotizacionCargos = cr.cd_CotizacionCargos
                                            )
                                        )
                                    )
                                    FROM CotizacionCargos cr
                                    WHERE cr.cd_CotizacionServicios = s.cd_Consecutivo_VARiablesAdicionales
                                ),
                                (
                                    SELECT xmlagg(
                                        xmlelement(name "Fac_Servicios_TiposFacturacionHoteles",
                                            xmlforest(
                                                TF.cd_Cotizacion, TF.cd_CotizacionServicios, TF.cd_TiposFacturacionHoteles,
                                                TF.cd_cargosdesc, TF.in_cantidad, TF.am_contado, TF.am_credito, TF.am_valor, TF.ds_cargonm
                                            )
                                        )
                                    )
                                    FROM Fac_Servicios_TiposFacturacionHoteles TF
                                    WHERE TF.cd_CotizacionServicios = s.cd_Consecutivo_VARiablesAdicionales
                                ),
                                (
                                    SELECT xmlagg(
                                        xmlelement(name "CotizacionServicios_TipoProv",
                                            xmlforest(
                                                PRE.cd_Cotizacion, PRE.cd_CotizacionServicios, PRE.cd_TipoProveedores,
                                                PRE.ds_TipoProveedores, PRE.cd_proveedores, PRE.ds_proveedores
                                            )
                                        )
                                    )
                                    FROM CotizacionServicios_TipoProv PRE
                                    WHERE PRE.cd_CotizacionServicios = s.cd_Consecutivo_VARiablesAdicionales			
                                )
                            )
                        )
                        FROM CotizacionServicios s
                        WHERE s.cd_Cotizacion = f.cd_consecutivo
                    )
                )
            )
        ),
        version '1.0', standalone yes
    )::text INTO v_xml
    FROM Facturacion f;

    mensaje_resultado := COALESCE(v_xml, '<?xml version="1.0" standalone="yes"?><Facturaciones />');

EXCEPTION
    WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS 
            v_state   = RETURNED_SQLSTATE,
            v_msg     = MESSAGE_TEXT,
            v_context = PG_EXCEPTION_CONTEXT;
		v_line := substring(v_context from 'line ([0-9]+)')::TEXT;
        mensaje_resultado := format('ERROR: %s | EN LÍNEA: %s | ESTADO: %s', v_msg, v_line, v_state);
END;
$$;