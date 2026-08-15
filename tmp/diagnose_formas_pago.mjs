import pg from 'pg';
import mssql from 'mssql';

const pgExport = new pg.Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await pgExport.connect();
const exportRes = await pgExport.query(`CALL public.spExportQuotation($1, $2, $3)`, ['3', 5, '']);
const xml = exportRes.rows[0].mensaje_resultado;
await pgExport.end();

const cfgPg = new pg.Client({ connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo' });
await cfgPg.connect();
const cfgData = (await cfgPg.query('SELECT * FROM "fnGetSQLServerConfig"()')).rows[0];
await cfgPg.end();

await mssql.connect({
  server: cfgData.servidor, database: cfgData.base_datos,
  user: cfgData.usuario, password: cfgData.clave,
  port: cfgData.puerto ? parseInt(cfgData.puerto) : 1433,
  options: { encrypt: false, trustServerCertificate: true }
});

console.log('Insertando paso a paso para depurar...');
const req = new mssql.Request();
req.input('xml', mssql.VarChar(mssql.MAX), xml);
const res = await req.query(`
  BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @xmlData XML = TRY_CAST(@xml AS XML);

    -- 1. Declarar tablas temporales equivalentes a spCotizacionesCrear
    DECLARE @Cotizacion TABLE(
			id INT IDENTITY(1,1) NOT NULL,
			id_sucursal INT NOT NULL,
			id_implante INT NULL,
			cd_consecutivo char(8) NOT NULL,
			id_usuario INT NOT NULL,
			dt_fechacont smalldatetime NOT NULL,
			dt_fecha smalldatetime NOT NULL,
			id_usuarioAct INT NOT NULL,
			dt_fechaAct smalldatetime NOT NULL,
			cd_tercero_codigo varchar(25) NOT NULL,
			ds_tercero_nombre varchar(250) NOT NULL,
			cd_cliente_codigo varchar(25) NOT NULL,
			ds_cliente_nombre varchar(250) NOT NULL,
			ds_cliente_dir varchar(250) NOT NULL,
			ds_cliente_ciudad varchar(40) NOT NULL,
			ds_cliente_tel varchar(25) NOT NULL,
			ds_cliente_dirdesp varchar(250) NOT NULL,
			ds_cliente_email varchar(60) NOT NULL,
			ds_cliente_contacto varchar(40) NOT NULL,
			ds_cliente_contacto_email varchar(60) NOT NULL,
			id_monedas_IATA INT NOT NULL,
			cd_vendedor varchar(25) NOT NULL,
			id_tiqueteador INT NOT NULL,
			bn_anexo varbinary(max) NULL,
			am_tcambio smallmoney NOT NULL,
			am_tcambiousd money NOT NULL,
			cd_cencosto varchar(25) NULL,
			ds_observacion varchar(1000) NOT NULL,
			ds_Campo_libre1 varchar(250) NULL,
			ds_Campo_libre2 varchar(250) NULL,
			id_tipoventa INT NOT NULL,
			in_estado INT NOT NULL,
			dt_vence smalldatetime NOT NULL,
			bl_ManejaOpciones BIT NOT NULL,
			in_NumeroOpciones INT NOT NULL,
			bl_CerrarCotizacion BIT NOT NULL,
			in_OpcionSeleccionada INT NULL,
			bl_grupos BIT NOT NULL,
			gk_sabre varchar(20) NOT NULL,
			id_Especialista INT NULL,
			id_TipoFormaPagoProveedor INT NULL,
			id_MedioReservacion INT NULL,
			bl_bloqueada BIT NOT NULL DEFAULT 0,
			id_usuario_Bloqueo INT NULL,
			ds_AlertaSolicitud varchar(100) NOT NULL,
			bl_comisiona BIT NOT NULL,
			ds_FormaDePago varchar(250) NULL,
			ds_records varchar(25) NULL,
			bl_entregadoCliente BIT NOT NULL,
			dt_entregadoCliente smalldatetime NULL,
			id_sys_entidades INT NOT NULL,
			id_MonedaPagoDestino INT NULL,
			id_FormaPagoDestino INT NULL,
			ds_DocumentoPagoDestino varchar(50) NULL,
			dt_CheckInPagoDestino smalldatetime NULL,
			dt_CheckOutPagoDestino smalldatetime NULL,
			bl_fechaPagoDestino BIT NOT NULL DEFAULT 0,
			ds_hotelTieneTiquete varchar(5) NULL,
			ds_GDS varchar(2) NULL,
			id_Evento INT NULL,
			id_cotizacion INT NULL,
			bl_existe BIT NOT NULL DEFAULT 0
    );

    DECLARE @CotizacionServicios TABLE(
			id INT IDENTITY(1,1) NOT NULL,
			id_TiposConceptFac INT NOT NULL,
			id_ConceptoFacturacion INT NOT NULL,
			id_TiposServicio INT NOT NULL,
			id_Cotizacion INT NULL,
			id_fac_factura INT NULL,
			id_fac_remision INT NULL,
			cd_proveedores varchar(25) NOT NULL,
			ds_tiposervnm varchar(60) NOT NULL,
			cd_prov_hotel varchar(25) NULL,
			cd_prov_car varchar(25) NULL,
			cd_prov_air varchar(25) NULL,
			ds_destino varchar(30) NOT NULL,
			ds_servicio varchar(250) NOT NULL,
			ds_descrip varchar(4000) NOT NULL,
			ds_paxname varchar(20) NOT NULL,
			ds_paxape varchar(20) NOT NULL,
			cd_paxtype varchar(25) NOT NULL,
			in_nacionalidad INT NOT NULL,
			cd_voucher varchar(20) NOT NULL,
			in_cantpax INT NOT NULL,
			dt_llegada smalldatetime NOT NULL,
			dt_salida smalldatetime NOT NULL,
			cd_cencosto varchar(25) NULL,
			cd_auxiliar varchar(25) NULL,
			cd_item varchar(25) NULL,
			am_valorprov money NOT NULL,
			id_monedaprov INT NOT NULL,
			ds_InfoAdicional varchar(8000) NULL,
			cd_carrental varchar(25) NULL,
			id_hoteles INT NULL,
			bl_anulado BIT NOT NULL DEFAULT 0,
			cd_tiquete varchar(15) NULL,
			cd_fuente_anul varchar(2) NULL,
			cd_serie_anul varchar(2) NULL,
			cd_consecutivo_anul varchar(8) NULL,
			cd_usuario_anul varchar(25) NULL,
			cd_sucursal_anul varchar(25) NULL,
			cd_implante_anul varchar(25) NULL,
			am_basecomisionable money NOT NULL DEFAULT 0,
			am_porcomision money NOT NULL DEFAULT 0,
			cd_voucherPrefijo varchar(25) NULL,
			bl_notdomicilionacional BIT NOT NULL DEFAULT 0,
			Valor_Comision money NOT NULL DEFAULT 0,
			Valor_Recaudo money NOT NULL DEFAULT 0,
			dias_recaudo INT NOT NULL DEFAULT 0,
			ds_paxClasificacion varchar(25) NOT NULL DEFAULT '',
			id_tipoplan INT NULL,
			id_acomodacion INT NULL,
			in_dias INT NOT NULL DEFAULT 1,
			in_noches INT NOT NULL DEFAULT 1,
			ds_records varchar(25) NULL,
			id_GrConcepto INT NULL,
			in_diasSrv INT NOT NULL DEFAULT 1,
			in_nochesSrv INT NOT NULL DEFAULT 1,
			Id_Especialista INT NULL,
			am_porcentaje_descuento money NOT NULL DEFAULT 0,
			am_valor_descuento money NOT NULL DEFAULT 0,
			ds_motivo_descuento varchar(1000) NULL,
			id_cargosdesc_descuento INT NULL,
			in_NumeroOpcion INT NOT NULL DEFAULT 1,
			dt_FechaSalidaSrv smalldatetime NOT NULL,
			dt_FechaLlegadaSrv smalldatetime NOT NULL,
			cd_localizador varchar(25) NULL,
			cd_voucherpax varchar(25) NULL,
			am_basecomisionableprov money NOT NULL DEFAULT 0,
			am_porcomisionprov money NOT NULL DEFAULT 0,
			cd_NumeFac varchar(15) NULL,
			dt_VenceFac smalldatetime NOT NULL,
			id_AcomodacionSrv INT NULL,
			id_TipoPlanSrv INT NULL,
			in_habitaciones INT NOT NULL DEFAULT 1,
			in_habitacionesSrv INT NOT NULL DEFAULT 1,
			cd_Consecutivo_VariablesAdicionales varchar(8) NOT NULL,
			cd_confirmacion varchar(25) NULL,
			ds_confirmadopor varchar(250) NULL,
			cd_paxidentificacion varchar(25) NULL,
			bl_politicaCancelacion BIT NOT NULL DEFAULT 0,
			dt_politicaCancelacion smalldatetime NULL,
			id_tipoHabitacion INT NULL,
			id_fac_facturaComision INT NULL,
			id_fac_remisionComision INT NULL,
			id_TarjetaAsistencia INT NULL,
			id_Regiones INT NULL,
			Iden_GDS INT NOT NULL DEFAULT 0,
			id_sys_entidades INT NOT NULL DEFAULT 65,
			ds_TipoAuto varchar(50) NULL,
			ds_Origen varchar(30) NULL,
			ds_DirOrigen varchar(250) NULL,
			ds_DirDestino varchar(250) NULL,
			ds_TipoTarifa varchar(50) NULL,
			am_ValorUSD money NOT NULL DEFAULT 0,
			ds_NoVuelo varchar(25) NULL,
			ds_Vehiculo varchar(250) NULL,
			ds_Placa varchar(25) NULL,
			ds_CategoriaVehiculo varchar(250) NULL,
			ds_NombreConductor varchar(50) NULL,
			ds_telefono varchar(25) NULL,
			ds_IdiomaConductor varchar(25) NULL,
			id_MonedaSrv INT NOT NULL DEFAULT 1,
			id_TipoServicio INT NOT NULL DEFAULT 1,
			id_Aerolinea INT NULL,
			in_EdadPax INT NOT NULL DEFAULT 30,
			am_PorFacParcial money NOT NULL DEFAULT 0,
			ds_GDS varchar(25) NULL,
			dt_fechaficheroBBVA smalldatetime NULL,
			bl_tiquete BIT NOT NULL DEFAULT 0,
			am_basedescuento money NOT NULL DEFAULT 0,
			am_pordescuento money NOT NULL DEFAULT 0,
			id_CotizacionServicios_Depende INT NULL,
			cd_Cotizacion varchar(25) NULL
    );

		DECLARE @CotizacionServiciosFormasPago TABLE(
			id INT IDENTITY(1,1) NOT NULL,
			cd_Cotizacion VARCHAR(25) NULL,
			cd_CotizacionServicios VARCHAR(25) NULL,
			id_CotizacionServicios INT NULL,
			Id_Cotizacion INT NULL,
			id_FormasPago INT NULL,
			ds_FPnm VARCHAR(50) NULL,
			bl_FPrepresenta BIT NOT NULL DEFAULT 0,
			id_TarjetasCredito INT NULL,
			cd_tccode NCHAR(10) NULL,
			ds_tcnumber CHAR(16) NULL,
			ds_tcvoucher VARCHAR(25) NULL,
			cd_idbanco CHAR(3) NULL,
			ds_cheque VARCHAR(30) NULL,
			ds_referencia VARCHAR(50) NULL,
			am_valor MONEY NOT NULL DEFAULT 0,
			ds_tcexp VARCHAR(7) NULL,
			ds_plaza CHAR(3) NULL,
			ds_Poliza VARCHAR(20) NULL,
			ds_PolAnexo VARCHAR(20) NULL,
			am_valor_ME MONEY NOT NULL DEFAULT 0,
			ds_tcautorizacion VARCHAR(25) NULL,
			in_tccuotas INT NULL
		);

    -- 2. Poblar @Cotizacion
    INSERT INTO @Cotizacion(id_sucursal, id_implante, cd_consecutivo, id_usuario, dt_fechacont, dt_fecha, id_usuarioAct, dt_fechaAct, cd_tercero_codigo, ds_tercero_nombre, cd_cliente_codigo, ds_cliente_nombre, ds_cliente_dir, ds_cliente_ciudad, ds_cliente_tel, ds_cliente_dirdesp, ds_cliente_email, ds_cliente_contacto, ds_cliente_contacto_email, id_monedas_IATA, am_tcambio, cd_vendedor, id_tiqueteador, am_tcambiousd, id_tipoventa, ds_observacion, ds_Campo_libre1, ds_Campo_libre2, in_estado, dt_vence, bl_ManejaOpciones, in_NumeroOpciones, bl_CerrarCotizacion, bl_grupos, gk_sabre, ds_AlertaSolicitud, bl_comisiona, ds_FormaDePago, ds_records, bl_entregadoCliente, id_sys_entidades, ds_GDS, bl_existe, id_cotizacion)
    SELECT 1, NULL, C.node.value('cd_consecutivo[1]','CHAR(8)'), 1, GETDATE(), GETDATE(), 1, GETDATE(), '0000001091', 'TEST', '0000001091', 'TEST', 'DIR', '', '', '', '', '', '', 1, 1, '000', 1, 1, 1, '', '', '', 1, GETDATE(), 0, 0, 0, 0, '', '', 0, '', '', 0, 65, '', 0, 23138
    FROM @xmlData.nodes('Cotizaciones/Cotizacion') AS C(node);

    -- 3. Poblar @CotizacionServicios
    INSERT INTO @CotizacionServicios(id_TiposConceptFac, id_ConceptoFacturacion, id_TiposServicio, cd_proveedores, ds_tiposervnm, ds_destino, ds_servicio, ds_descrip, ds_paxname, ds_paxape, cd_paxtype, in_nacionalidad, cd_voucher, in_cantpax, dt_llegada, dt_salida, am_valorprov, id_monedaprov, cd_Consecutivo_VariablesAdicionales, dt_FechaSalidaSrv, dt_FechaLlegadaSrv, dt_VenceFac, cd_Cotizacion)
    SELECT 1, 1, 1, 'TBK', 'HOTEL', 'BOG', 'HOTEL', 'HOTEL', 'PAX', 'PAX', 'PAX', 1, '', 1, GETDATE(), GETDATE(), 100, 1, 'Q0000097', GETDATE(), GETDATE(), GETDATE(), 'Q0000003';

    -- 4. Parsear formas de pago desde XML
		INSERT INTO @CotizacionServiciosFormasPago(
			cd_Cotizacion,
			cd_CotizacionServicios,
			ds_FPnm,
			bl_FPrepresenta,
			ds_tcnumber,
			ds_tcvoucher,
			ds_referencia,
			am_valor,
			ds_tcexp,
			am_valor_ME,
			ds_tcautorizacion
		)
		SELECT
			FP.FormasPago.value('../../../cd_consecutivo[1]', 'VARCHAR(25)') AS cd_Cotizacion,
			FP.FormasPago.value('../../cd_Consecutivo_VARiablesAdicionales[1]', 'VARCHAR(25)') AS cd_CotizacionServicios,
			ISNULL(FP.FormasPago.value('ds_FPnm[1]', 'VARCHAR(50)'), '') AS ds_FPnm,
			ISNULL(FP.FormasPago.value('bl_FPrepresenta[1]', 'BIT'), 0) AS bl_FPrepresenta,
			ISNULL(FP.FormasPago.value('ds_tcnumber[1]', 'CHAR(16)'), '') AS ds_tcnumber,
			ISNULL(FP.FormasPago.value('ds_tcvoucher[1]', 'VARCHAR(25)'), '') AS ds_tcvoucher,
			ISNULL(FP.FormasPago.value('ds_referencia[1]', 'VARCHAR(50)'), '') AS ds_referencia,
			ISNULL(FP.FormasPago.value('am_valor[1]', 'MONEY'), 0) AS am_valor,
			ISNULL(FP.FormasPago.value('ds_tcexp[1]', 'VARCHAR(7)'), '') AS ds_tcexp,
			ISNULL(FP.FormasPago.value('am_valor_ME[1]', 'MONEY'), 0) AS am_valor_ME,
			ISNULL(FP.FormasPago.value('ds_tcautorizacion[1]', 'VARCHAR(25)'), '') AS ds_tcautorizacion
		FROM @xmlData.nodes('Cotizaciones/Cotizacion/CotizacionServicios/CotizacionServiciosFormasPago') AS FP(FormasPago);

    SELECT '1. Cantidad parseada' AS Step, COUNT(*) AS FilaCount FROM @CotizacionServiciosFormasPago;

    SELECT '2. Datos parseados' AS Step, cd_Cotizacion, cd_CotizacionServicios, ds_FPnm, am_valor FROM @CotizacionServiciosFormasPago;

    -- 5. Resolver FKs
		UPDATE FP
		SET FP.id_CotizacionServicios = CS.id,
		    FP.Id_Cotizacion          = C.id_cotizacion,
		    FP.id_FormasPago          = ISNULL(FPM.id, 1),
		    FP.ds_FPnm                = ISNULL(FPM.ds_nombre, FP.ds_FPnm)
		FROM @CotizacionServiciosFormasPago FP
		LEFT JOIN dbo.FormasPago FPM ON FPM.cd_codigo = FP.ds_FPnm
		INNER JOIN @CotizacionServicios CS ON CS.cd_Consecutivo_VariablesAdicionales = FP.cd_CotizacionServicios
		INNER JOIN @Cotizacion C ON C.cd_consecutivo = FP.cd_Cotizacion AND C.bl_existe = 0;

    SELECT '3. Despues de UPDATE' AS Step, id_CotizacionServicios, Id_Cotizacion, id_FormasPago, ds_FPnm, am_valor FROM @CotizacionServiciosFormasPago;

    ROLLBACK TRANSACTION;
  END TRY
  BEGIN CATCH
    SELECT ERROR_MESSAGE() AS Error;
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
  END CATCH
`);
console.log('Diagnostico:', JSON.stringify(res.recordsets, null, 2));

await mssql.close();
