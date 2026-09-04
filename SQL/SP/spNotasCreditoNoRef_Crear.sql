-- =========================================================================
-- Procedimiento: dbo.spNotasCreditoNoRef_Crear
-- Base de datos: SQL Server (Agencias)
-- Descripción: Recibe un listado de facturas en XML, ejecuta en bucle 
--              dbo.spza_FacturaRemision_NotaCredito para generar la nota crédito
--              a cada una, y retorna el conjunto de resultados para PostgreSQL.
-- =========================================================================
IF OBJECT_ID('dbo.spNotasCreditoNoRef_Crear', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spNotasCreditoNoRef_Crear;
GO

CREATE PROCEDURE dbo.spNotasCreditoNoRef_Crear
(
    @xml VARCHAR(MAX) = NULL,
    @id_usuario INT = 1,
    @ds_observaciones VARCHAR(500) = 'Nota Credito No Referenciada'
)
AS
BEGIN
    SET NOCOUNT ON;

    -- Tabla temporal para almacenar las facturas recibidas
    DECLARE @FacturasAProcesar TABLE (
        Sec INT IDENTITY(1,1) PRIMARY KEY,
        id_factura INT,
        cd_fuente CHAR(2),
        cd_serie CHAR(2),
        cd_consecutivo CHAR(8),
        numero VARCHAR(50),
        id_sucursal INT,
        id_implante INT,
        dt_fechacont SMALLDATETIME
    );

    -- Tabla temporal para almacenar los resultados
    DECLARE @Resultado TABLE (
        id_factura INT,
        fuente_nc CHAR(2),
        serie_nc CHAR(2),
        consecutivo_nc CHAR(8),
        factura_fuente CHAR(2),
        factura_serie CHAR(2),
        factura_numero VARCHAR(50),
        fecha DATETIME,
        estado VARCHAR(50),
        mensaje VARCHAR(1000)
    );

    -- Parsear XML si fue provisto
    IF @xml IS NOT NULL AND RTRIM(@xml) <> ''
    BEGIN
        DECLARE @xmlDoc XML = CAST(@xml AS XML);

        INSERT INTO @FacturasAProcesar (id_factura, cd_fuente, cd_serie, cd_consecutivo, numero, id_sucursal, id_implante, dt_fechacont)
        SELECT 
            T.Item.value('id[1]', 'INT'),
            T.Item.value('fuente[1]', 'CHAR(2)'),
            T.Item.value('serie[1]', 'CHAR(2)'),
            T.Item.value('consecutivo[1]', 'CHAR(8)'),
            T.Item.value('numero[1]', 'VARCHAR(50)'),
            T.Item.value('id_sucursal[1]', 'INT'),
            T.Item.value('id_implante[1]', 'INT'),
            T.Item.value('fecha_contable[1]', 'SMALLDATETIME')
        FROM @xmlDoc.nodes('/Facturas/Factura') AS T(Item);
    END;

    DECLARE @TotalRows INT = (SELECT COUNT(*) FROM @FacturasAProcesar);
    DECLARE @CurrentRow INT = 1;

    DECLARE 
        @cur_id_factura INT,
        @cur_cd_fuente CHAR(2),
        @cur_cd_serie CHAR(2),
        @cur_cd_consecutivo CHAR(8),
        @cur_numero VARCHAR(50),
        @cur_id_sucursal INT,
        @cur_id_implante INT,
        @cur_dt_fechacont SMALLDATETIME;

    WHILE @CurrentRow <= @TotalRows
    BEGIN
        SELECT 
            @cur_id_factura = id_factura,
            @cur_cd_fuente = cd_fuente,
            @cur_cd_serie = cd_serie,
            @cur_cd_consecutivo = cd_consecutivo,
            @cur_numero = numero,
            @cur_id_sucursal = id_sucursal,
            @cur_id_implante = id_implante,
            @cur_dt_fechacont = dt_fechacont
        FROM @FacturasAProcesar
        WHERE Sec = @CurrentRow;

        -- Si faltan datos de la factura, buscarlos en fac_factura
        IF @cur_cd_fuente IS NULL OR @cur_cd_serie IS NULL OR @cur_cd_consecutivo IS NULL
        BEGIN
            SELECT 
                @cur_cd_fuente = cd_fuente,
                @cur_cd_serie = cd_serie,
                @cur_cd_consecutivo = cd_consecutivo,
                @cur_numero = ISNULL(numero, RTRIM(cd_serie) + RTRIM(cd_consecutivo)),
                @cur_id_sucursal = ISNULL(@cur_id_sucursal, id_sucursal),
                @cur_id_implante = ISNULL(@cur_id_implante, id_implante),
                @cur_dt_fechacont = ISNULL(@cur_dt_fechacont, dt_fechacont)
            FROM dbo.fac_factura WITH (NOLOCK)
            WHERE id = @cur_id_factura;
        END;

        -- Validar si ya tiene nota crédito o está anulada
        DECLARE @existing_nc CHAR(8) = NULL;
        DECLARE @existing_fuente_nc CHAR(2) = NULL;
        DECLARE @existing_serie_nc CHAR(2) = NULL;

        SELECT 
            @existing_fuente_nc = cd_fuente_anul,
            @existing_serie_nc = cd_serie_anul,
            @existing_nc = cd_consecutivo_anul
        FROM dbo.fac_factura WITH (NOLOCK)
        WHERE (id = @cur_id_factura) 
           OR (cd_fuente = @cur_cd_fuente AND cd_serie = @cur_cd_serie AND cd_consecutivo = @cur_cd_consecutivo);

        IF @existing_nc IS NOT NULL AND RTRIM(@existing_nc) <> ''
        BEGIN
            INSERT INTO @Resultado (id_factura, fuente_nc, serie_nc, consecutivo_nc, factura_fuente, factura_serie, factura_numero, fecha, estado, mensaje)
            VALUES (@cur_id_factura, @existing_fuente_nc, @existing_serie_nc, @existing_nc, @cur_cd_fuente, @cur_cd_serie, @cur_numero, GETDATE(), 'OMITIDA', 'La factura ya cuenta con Nota Crédito de anulación: ' + RTRIM(@existing_nc));
        END
        ELSE
        BEGIN
            BEGIN TRY
                -- Ejecutar el SP estándar de creación de Nota Crédito en SQL Server
                EXEC dbo.spza_FacturaRemision_NotaCredito
                    @id_usuario = @id_usuario,
                    @id_sucursal = @cur_id_sucursal,
                    @dt_fechacont = @cur_dt_fechacont,
                    @id_implante = @cur_id_implante,
                    @id_Tiquetes_Anulados = NULL,
                    @id_Tiquetes_AnuladosDisp = NULL,
                    @id_TAO_Anulados = NULL,
                    @id_Serv_Anulados = NULL,
                    @CodigoArchivoFisico = NULL,
                    @bl_remision = 0,
                    @cd_fuentefac = @cur_cd_fuente,
                    @cd_seriefac = @cur_cd_serie,
                    @cd_consecutivofac = @cur_cd_consecutivo,
                    @bl_ActivarReservaGDS = 0,
                    @id_Licitacion = NULL,
                    @bl_Licitacion = 0,
                    @bl_AnularSoloFac = 0,
                    @bl_AnularFacRem = 0,
                    @bl_AnularTktsRem = 0,
                    @bl_NoMostrarMsg = 1,
                    @ds_observaciones_NC = @ds_observaciones,
                    @id_motivo_NC = NULL,
                    @ds_motivo_NC = @ds_observaciones,
                    @id_Tiquetes_IncluidoCierre = NULL,
                    @id_usuario_Autoriza = @id_usuario;

                -- Consultar la nota crédito recién generada en fac_factura
                DECLARE @gen_fuente_nc CHAR(2) = NULL;
                DECLARE @gen_serie_nc CHAR(2) = NULL;
                DECLARE @gen_consecutivo_nc CHAR(8) = NULL;
                DECLARE @gen_dt_fecha_anul DATETIME = NULL;

                SELECT 
                    @gen_fuente_nc = cd_fuente_anul,
                    @gen_serie_nc = cd_serie_anul,
                    @gen_consecutivo_nc = cd_consecutivo_anul,
                    @gen_dt_fecha_anul = ISNULL(dt_fecha_anul, GETDATE())
                FROM dbo.fac_factura WITH (NOLOCK)
                WHERE (id = @cur_id_factura) 
                   OR (cd_fuente = @cur_cd_fuente AND cd_serie = @cur_cd_serie AND cd_consecutivo = @cur_cd_consecutivo);

                INSERT INTO @Resultado (id_factura, fuente_nc, serie_nc, consecutivo_nc, factura_fuente, factura_serie, factura_numero, fecha, estado, mensaje)
                VALUES (@cur_id_factura, @gen_fuente_nc, @gen_serie_nc, @gen_consecutivo_nc, @cur_cd_fuente, @cur_cd_serie, @cur_numero, ISNULL(@gen_dt_fecha_anul, GETDATE()), 'EXITO', 'Nota Crédito generada exitosamente: ' + ISNULL(RTRIM(@gen_consecutivo_nc), ''));
            END TRY
            BEGIN CATCH
                DECLARE @ErrMsg VARCHAR(1000) = ERROR_MESSAGE();
                INSERT INTO @Resultado (id_factura, fuente_nc, serie_nc, consecutivo_nc, factura_fuente, factura_serie, factura_numero, fecha, estado, mensaje)
                VALUES (@cur_id_factura, NULL, NULL, NULL, @cur_cd_fuente, @cur_cd_serie, @cur_numero, GETDATE(), 'ERROR', @ErrMsg);
            END CATCH
        END;

        SET @CurrentRow = @CurrentRow + 1;
    END;

    -- Retornar todos los resultados generados en la tabla temporal
    SELECT 
        id_factura,
        fuente_nc,
        serie_nc,
        consecutivo_nc,
        factura_fuente,
        factura_serie,
        factura_numero,
        fecha,
        estado,
        mensaje
    FROM @Resultado;

    RETURN 0;
END;
GO