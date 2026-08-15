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

console.log('Ejecutando spCotizacionesCrear modificado para depurar TipoProv...');
const req = new mssql.Request();
req.input('xml', mssql.VarChar(mssql.MAX), xml);
const res = await req.query(`
  BEGIN TRY
    BEGIN TRANSACTION;
    
    -- Declaramos una query que emule exactamente spCotizacionesCrear pero con select de depuración al final
    -- Para ver qué valores tienen las tablas temporales antes de insertar en las reales
    
    DECLARE @xmlData XML = TRY_CAST(@xml AS XML);

    -- 1. Declarar tablas temporales
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
			cd_Cotizacion varchar(25) NULL,
      id_CotizacionServicios INT NULL
    );

		DECLARE @CotizacionServicios_TipoProv TABLE(
			id INT IDENTITY(1,1) NOT NULL,
			cd_Cotizacion varchar(25) NULL,
			cd_CotizacionServicios varchar(25) NULL,
			id_CotizacionServicios int NULL,
			id_TipoProveedores int NULL,
			cd_TipoProveedores varchar(25) NULL,
			ds_TipoProveedores varchar(60) NULL,
			cd_proveedores varchar(25) NULL,
			ds_proveedores varchar(250) NULL
		);

    -- 2. Poblar @Cotizacion
    INSERT INTO @Cotizacion(id_sucursal, id_implante, cd_consecutivo, id_usuario, dt_fechacont, dt_fecha, id_usuarioAct, dt_fechaAct, cd_tercero_codigo, ds_tercero_nombre, cd_cliente_codigo, ds_cliente_nombre, ds_cliente_dir, ds_cliente_ciudad, ds_cliente_tel, ds_cliente_dirdesp, ds_cliente_email, ds_cliente_contacto, ds_cliente_contacto_email, id_monedas_IATA, am_tcambio, cd_vendedor, id_tiqueteador, am_tcambiousd, id_tipoventa, ds_observacion, ds_Campo_libre1, ds_Campo_libre2, in_estado, dt_vence, bl_ManejaOpciones, in_NumeroOpciones, bl_CerrarCotizacion, bl_grupos, gk_sabre, ds_AlertaSolicitud, bl_comisiona, ds_FormaDePago, ds_records, bl_entregadoCliente, id_sys_entidades, ds_GDS, bl_existe, id_cotizacion)
    SELECT 1, NULL, C.node.value('cd_consecutivo[1]','CHAR(8)'), 1, GETDATE(), GETDATE(), 1, GETDATE(), '0000001091', 'TEST', '0000001091', 'TEST', 'DIR', '', '', '', '', '', '', 1, 1, '000', 1, 1, 1, '', '', '', 1, GETDATE(), 0, 0, 0, 0, '', '', 0, '', '', 0, 65, '', 0, 23138
    FROM @xmlData.nodes('Cotizaciones/Cotizacion') AS C(node);

    -- 3. Poblar @CotizacionServicios
    INSERT INTO @CotizacionServicios(id_TiposConceptFac, id_ConceptoFacturacion, id_TiposServicio, cd_proveedores, ds_tiposervnm, ds_destino, ds_servicio, ds_descrip, ds_paxname, ds_paxape, cd_paxtype, in_nacionalidad, cd_voucher, in_cantpax, dt_llegada, dt_salida, am_valorprov, id_monedaprov, cd_Consecutivo_VariablesAdicionales, dt_FechaSalidaSrv, dt_FechaLlegadaSrv, dt_VenceFac, cd_Cotizacion, id_CotizacionServicios)
    SELECT 1, 1, 1, 'TBK', 'HOTEL', 'BOG', 'HOTEL', 'HOTEL', 'PAX', 'PAX', 'PAX', 1, '', 1, GETDATE(), GETDATE(), 100, 1, 'Q0000097', GETDATE(), GETDATE(), GETDATE(), 'Q0000003', 81437 -- Simulamos ID real de base
    FROM @xmlData.nodes('Cotizaciones/Cotizacion/CotizacionServicios') AS CS(node);

    -- 4. Poblar @CotizacionServicios_TipoProv
		INSERT INTO @CotizacionServicios_TipoProv(
			cd_Cotizacion,
			cd_CotizacionServicios,
			id_CotizacionServicios,
			id_TipoProveedores,
			cd_TipoProveedores,
			ds_TipoProveedores,
			cd_proveedores,
			ds_proveedores
		)
		SELECT
			cd_Cotizacion=ISNULL(C.CotizacionServicios_TipoProv.value('cd_cotizacion[1]','VARCHAR(25)'),''),
			cd_CotizacionServicios=ISNULL(C.CotizacionServicios_TipoProv.value('cd_cotizacionservicios[1]','VARCHAR(25)'),''),
			id_CotizacionServicios=NULL,
			id_TipoProveedores=ISNULL(TP.id,1),
			cd_TipoProveedores=ISNULL(TP.cd_codigo,'Hotel'),
			ds_TipoProveedores=ISNULL(TP.ds_descrip,'Proveedor Tipo Hotel'),
			cd_proveedores=ISNULL(H.cd_codigo,''),
			ds_proveedores=ISNULL(H.ds_nombre,'')	
		FROM @xmlData.nodes('Cotizaciones/Cotizacion/CotizacionServicios/CotizacionServicios_TipoProv') AS C(CotizacionServicios_TipoProv)
		LEFT JOIN dbo.TipoProveedores TP ON TP.cd_codigo=ISNULL(C.CotizacionServicios_TipoProv.value('cd_tipoproveedores[1]','VARCHAR(3)'),'')
		LEFT JOIN dbo.Hoteles H ON H.cd_codigo=ISNULL(C.CotizacionServicios_TipoProv.value('cd_proveedores[1]','VARCHAR(25)'),'');

    SELECT '1. CotizacionServicios_TipoProv cargado' AS Step, cd_Cotizacion, cd_CotizacionServicios, id_CotizacionServicios, cd_proveedores FROM @CotizacionServicios_TipoProv;

    -- 5. Ejecutar update del id_CotizacionServicios
		UPDATE TP
		SET TP.id_CotizacionServicios=CS.id_CotizacionServicios
		FROM @CotizacionServicios_TipoProv TP
		INNER JOIN @CotizacionServicios CS ON CS.cd_Consecutivo_VariablesAdicionales = TP.cd_CotizacionServicios;

    SELECT '2. Despues de UPDATE' AS Step, cd_Cotizacion, cd_CotizacionServicios, id_CotizacionServicios, cd_proveedores FROM @CotizacionServicios_TipoProv;

    ROLLBACK TRANSACTION;
  END TRY
  BEGIN CATCH
    SELECT ERROR_MESSAGE() AS ErrorMessage;
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
  END CATCH
`);
console.log('Depuración de TipoProv:', JSON.stringify(res.recordsets, null, 2));

await mssql.close();
