-- Eliminar si existe
If Exists ( Select Name From sys.objects Where object_id = OBJECT_ID( N'[dbo].[spConfiguracionVariablesObtenerValores]' ) And OBJECTPROPERTY( object_id , N'IsProcedure' ) = 1 )
	DROP PROCEDURE dbo.spConfiguracionVariablesObtenerValores
GO

CREATE PROCEDURE [dbo].[spConfiguracionVariablesObtenerValores] 
	-- Parametros del procedimiento
	@id_usuario 	INT,
	@id_Reservas	VARCHAR(8000)=NULL,
	@cd_Reservas    Varchar(25)=NULL,
	@id_ReservaGDS_Detalles INT=NULL, --rgelis 2018/10/26 req.62804
	@id_ReservaGDS_Servicios INT=NULL --rgelis 2018/10/26 req.62804
	

WITH Encryption	
AS
BEGIN
	-- SET NOCOUNT ON: Previene que conjuntos de resultados extras interfieran con 
	-- expresiones SELECT
	SET NOCOUNT ON;

    -- Declaracion e inicializacion de variables
  	DECLARE @bl_permit			 BIT 	, -- Permiso de ejecucion del proceso
  			@bl_as 	   			 BIT	, -- Auditar exito
	 		@bl_af 			     BIT	, -- Auditar fallido	 		
			@procmsg	VARCHAR(8000)	, -- Mensaje devuelto por procedimientos llamados desde este procedimiento
			@procret 	BIT 			, -- Valor de retorno de los procedimientos llamados desde este procedimiento
			@idproce	int		    	, -- Codigo de proceso
	 		@retry 		BIT			    , -- 1=Reintentar ; 0=Abortar  
	 		@retrycont	INT			    , -- Contador de reintentos
	 		@maxretries INT			    , -- Maximo numero de reintentos
	 		@timeout	NVARCHAR(4000)  , -- Tiempo de espera maximo por bloqueo de registros
	 		@stmt 		NVARCHAR(4000)  , -- Cadena de instrucciones T-SQL
			@msg	    VARCHAR(8000)   , -- Mensaje retornado por el sistema
			@retval		TINYINT 		, -- Valor de retorno de este procedimiento: 0:Exito ; 1:Error(Bloque Catch)
			@Id_DQB_Conciliacion INT	;

	SELECT 	@idproce 			 = 210,
			@retry				 = 1,
			@retrycont			 = 0,
			@retval				 = 0;
  	
  	-- Manejo de tiempo de espera y de reintentos por bloqueo de tablas/registros  
   	SELECT @maxretries = convert(INT,Valor) FROM dbo.Parametros WHERE Id = 60 ;
	SELECT @timeout    = convert(NVARCHAR(4000),Valor) FROM dbo.Parametros WHERE Id = 50 ;		
	SET @stmt = N'SET LOCK_TIMEOUT '+ltrim(rtrim(@timeout))
	EXEC sp_executesql @stmt,N''
	
	
	WHILE ( (@retry = 1) AND (@retrycont <= @maxretries) )
	BEGIN
		SET @retry = 0;
    
    	-- Bloque TRY
    	BEGIN TRY 
    	    		
    		--Obteniendo informacion de seguridad y auditoria--
			EXEC dbo.spzaProcesoUsuario_Consultar @id_usuario   = @id_usuario       ,
												  @id_proceso   = @idproce 		    , 
												  @bl_permit    = @bl_permit OUTPUT , 
												  @bl_auditsuc  = @bl_as 	 OUTPUT , 
												  @bl_auditfail = @bl_af 	 OUTPUT ;
			IF (@bl_permit = 0)
			BEGIN 
				SELECT 'No posee permisos suficientes para ejecutar esta acción.' AS 'Respuesta'
				RETURN @retval;
			END 
			
			--Instrucciones del procedimiento-----------------------------------------


			DECLARE 
				@GDS 				VARCHAR(MAX)
				, @NumVariables 	INT 
				, @Iden_GDS			INT 
				, @Contador			INT 
				, @Fila 			VARCHAR(MAX)
				--Informacion de las variables
				, @id_Reserva       INT
				, @Iden_Variable    NUMERIC (18)
				, @ds_Linea         VARCHAR (20)
				, @ds_campo         VARCHAR (20)
				, @in_tipo_longitud INT
				, @in_posinicial    INT
				, @in_longitud      INT
				, @ValorObtenido	 VARCHAR(MAX)
				, @PNR				VARCHAR(12)	
				, @IDEN_Maestro		INT --rgelis 2018/10/26 req.62804
				, @NumVariablesFomuladas INT
				, @Formula			VARCHAR(MAX)
				, @FormulaAux		VARCHAR(MAX)

			 
			DECLARE @Tabla TABLE(id_Reserva INT,GDS VARCHAR(MAX),Iden_GDS INT) --rgelis 2017/03/16 req.48076
			DECLARE @TVariablesFormula AS TABLE(id INT IDENTITY,Iden_variable NUMERIC(18),cd_variable VARCHAR(max))
			IF ISNULL(@cd_Reservas,'') <> ''
			BEGIN
				INSERT INTO @Tabla(id_Reserva,GDS,Iden_GDS) --rgelis 2017/03/16 req.48076
				SELECT r.id AS id_Reserva, r.reserva AS  GDS , r.iden_gds  
				FROM dbo.ReservasGDS r WHERE r.cd_codigo = @cd_Reservas
				  
				--SET @PNR = @cd_Reservas --rgelis 2017/03/16 req.48076
			END
			ELSE
			BEGIN 
				INSERT INTO @Tabla(id_Reserva,GDS,Iden_GDS) --rgelis 2017/03/16 req.48076
				SELECT r.id AS id_Reserva, r.reserva AS  GDS , r.iden_gds
				FROM dbo.ReservasGDS r
				INNER JOIN dbo.fnSplitMejorado(@id_Reservas,',',0,1) AS s ON CONVERT(INT,s.Codigo) = r.id
			
				--SELECT @PNR = cd_codigo --rgelis 2017/03/16 req.48076
				--FROM dbo.ReservasGDS
				--WHERE Id IN (SELECT id_Reserva FROM @Tabla)	
			END  

			DECLARE @TVariables TABLE 
							(
							Id               INT IDENTITY NOT NULL,
							Id_Reserva		 INT NOT NULL, --rgelis 2017/03/16 req.48076
							IDEN_Maestro	 NUMERIC (18) NOT NULL,	--rgelis 2017/03/16 req.48076
							Iden_Variable    NUMERIC (18) NOT NULL,
							ds_Linea         VARCHAR (20),
							ds_campo         VARCHAR (20) NOT NULL,
							in_tipo_longitud INT NOT NULL,
							in_posinicial    INT NOT NULL,
							in_longitud      INT NOT NULL,
							ValorObtenido	 VARCHAR(MAX),
							Formula			 VARCHAR(MAX)
							)
				
			--Obtenemos la informacion de la reserva
			--SELECT  --rgelis 2017/03/16 req.48076
			--	@GDS = Reserva 
			--	,@Iden_GDS = iden_gds
			--FROM dbo.ReservasGDS 
			--WHERE cd_codigo=@PNR

			IF @id_ReservaGDS_Detalles = 0 --rgelis 2018/10/26 req.62804
				SET @id_ReservaGDS_Detalles =  NULL
			
			IF @id_ReservaGDS_Servicios = 0
				SET @id_ReservaGDS_Servicios =  NULL --rgelis 2018/10/26 req.62804

			IF @id_ReservaGDS_Detalles IS NULL AND @id_ReservaGDS_Servicios IS NULL --rgelis 2018/10/26 req.62804
			BEGIN 
				--Insetamos la reserva por filas en una tabla temporal
				Declare @TableReserva AS TABLE(id INT IDENTITY,Fila VARCHAR(max),id_reserva INT) --inicio rgelis 2017/03/16 req.48076
				INSERT INTO @TableReserva(Fila,id_reserva) 
				SELECT REPLACE(REPLACE(f.Codigo,CHAR(10),''),CHAR(13),'')  AS Fila,r.id_Reserva 
				FROM @Tabla r
				OUTER APPLY dbo.fnSplitMejorado(r.GDS,CHAR(13)+CHAR(10),0,0) AS f --rgelis 2017/05/10 req.....
				ORDER BY r.id_Reserva,f.id  --fin rgelis 2017/03/16 req.48076

				
				--UPDATE @TableReserva
				--SET FILA = REPLACE(REPLACE(filA,CHAR(10),''),CHAR(13),'')

				--Obtenemos la informacion de las variables parametrizadas para el GDS de la reserva
				INSERT INTO @TVariables (Id_Reserva,IDEN_Maestro,Iden_Variable,ds_Linea,ds_campo,in_tipo_longitud,in_posinicial,in_longitud,Formula) --inicio rgelis 2017/03/16 req.48076
				SELECT r.id_Reserva,c.IDEN_Maestro,c.Iden_Variable,c.ds_Linea,c.ds_campo,c.in_tipo_longitud,c.in_posinicial,c.in_longitud,v.FormulaDefault AS 'Formula' 
				FROM @Tabla r 
				INNER JOIN dbo.ConfiguracionVariables c ON (r.Iden_GDS = c.Iden_GDS OR c.Iden_GDS = 0)
				INNER JOIN dbo.VariableDefinicion v ON v.IDEN = c.Iden_Variable
				GROUP BY r.id_Reserva,c.IDEN_Maestro,c.Iden_Variable,c.ds_Linea,c.ds_campo,c.in_tipo_longitud,c.in_posinicial,c.in_longitud,v.FormulaDefault --fin rgelis 2017/03/16 req.48076  

				SET @NumVariables = @@ROWCOUNT
				/*declare @comodin char(1)*/ --Solo FROSCH
				--select * from @TVariables
				--Inicializamos variables
				SET @Contador = 1
				--Ciclo para obtener la informacion de las varibles
				WHILE @Contador <= @NumVariables
				BEGIN 
	
					SELECT 
						@ds_Linea = RTRIM(ds_Linea)  --rgelis 2020/01/07 ticket.110744
						, @ds_campo = RTRIM(ds_campo) --rgelis 2020/01/07 ticket.110744
						, @in_tipo_longitud = in_tipo_longitud
						, @in_posinicial = in_posinicial
						, @in_longitud = in_longitud
						, @Id_Reserva = Id_Reserva --rgelis 2017/03/16 req.48076
					FROM @TVariables WHERE Id = @Contador
					/*SET @Comodin = Case When right(@ds_campo,1) NOT IN ('*','-','/') THEN space(1) Else '' END*/ --Solo FROSCH
					/*SELECT @Fila = Fila FROM @TableReserva WHERE Fila LIKE (@ds_Linea+'%') AND Fila LIKE ('%'+@ds_campo+@comodin+'%') AND id_reserva = @Id_Reserva --fin rgelis 2017/03/16 req.48076*/--Solo FROSCH
					SELECT @Fila = Fila FROM @TableReserva WHERE Fila LIKE (@ds_Linea+'%') AND Fila LIKE ('%'+@ds_campo+'%') AND id_reserva = @Id_Reserva --fin rgelis 2017/03/16 req.48076
					SELECT @ValorObtenido = substring(@Fila,charindex(@ds_campo,@Fila,0)+len(@ds_campo),len(@Fila))
				
					--Debug
					--SELECT 
					--	@ds_Linea AS '@ds_Linea', @ds_campo AS '@ds_campo', @in_tipo_longitud AS '@in_tipo_longitud', @in_posinicial AS '@in_posinicial', @in_longitud AS '@in_longitud'
					--	, @Fila AS '@Fila', @ValorObtenido AS '@ValorObtenido'

					--Si es longitud fija,obtenemos la informacion segun la configuracion de la variables
					IF @in_tipo_longitud = 0
					BEGIN
						SET @ValorObtenido = substring(@ValorObtenido,@in_posinicial,@in_longitud)
					END 
	
					UPDATE @TVariables
					SET ValorObtenido = @ValorObtenido
					WHERE Id = @Contador	
		
					SET @Contador = @Contador + 1
					SELECT @Fila = ''
				END 
			END
			ELSE IF @id_ReservaGDS_Detalles IS NOT NULL 
			BEGIN
				SELECT @IDEN_Maestro = IDEN FROM dbo.VariableDefinicionMaestro WHERE Codigo = 'Tiquetes' 
				INSERT INTO @TVariables (Id_Reserva,IDEN_Maestro,Iden_Variable,ds_Linea,ds_campo,in_tipo_longitud,in_posinicial,in_longitud,ValorObtenido,Formula) 
				SELECT r.id_Reserva, @IDEN_Maestro AS 'IDEN_Maestro', VD.IDEN AS 'Iden_Variable', '' AS 'ds_Linea', r.ds_nombre AS ds_campo, 0 AS 'in_tipo_longitud', 0 AS 'in_posinicial', 0 AS 'in_longitud', r.ds_valor AS 'ValorObtenido', VD.FormulaDefault AS 'Formula'
				FROM dbo.ReservaGDS_VariableAdicional r
				INNER JOIN @Tabla t ON t.id_Reserva = r.id_reserva 
				INNER JOIN VariableDefinicion VD ON VD.Nombre = r.ds_nombre
				WHERE r.id_ReservaGDS_Detalles = @id_ReservaGDS_Detalles
					AND VD.IDEN_TipoVariable = 2
			END
			ELSE IF @id_ReservaGDS_Servicios IS NOT NULL 
			BEGIN
				SELECT @IDEN_Maestro = IDEN FROM dbo.VariableDefinicionMaestro WHERE Codigo = 'FacturacionServicios' 
				INSERT INTO @TVariables (Id_Reserva,IDEN_Maestro,Iden_Variable,ds_Linea,ds_campo,in_tipo_longitud,in_posinicial,in_longitud,ValorObtenido,Formula) 
				SELECT r.id_Reserva, @IDEN_Maestro AS 'IDEN_Maestro', VD.IDEN AS 'Iden_Variable', '' AS 'ds_Linea', r.ds_nombre AS ds_campo, 0 AS 'in_tipo_longitud', 0 AS 'in_posinicial', 0 AS 'in_longitud', r.ds_valor AS 'ValorObtenido',VD.FormulaDefault AS 'Formula'
				FROM dbo.ReservaGDS_VariableAdicional r
				INNER JOIN @Tabla t ON t.id_Reserva = r.id_reserva 
				INNER JOIN VariableDefinicion VD ON VD.Nombre = r.ds_nombre
				WHERE r.id_ReservaGDS_Servicios = @id_ReservaGDS_Servicios
					AND VD.IDEN_TipoVariable = 2
				
			END

			SELECT @NumVariables = Count(*) FROM @TVariables 
			SELECT @NumVariablesFomuladas = Count(*) FROM @TVariables WHERE ISNULL(Formula,'')<>'' 
			SET @Contador = 1
			--Ciclo para obtener la informacion de las varibles formuladas
			IF (ISNULL(@NumVariablesFomuladas,0)>0)
			BEGIN
				WHILE @Contador <= @NumVariables
				BEGIN
					SELECT 
						@ds_Linea = RTRIM(ds_Linea)  
						, @ds_campo = RTRIM(ds_campo) 
						, @in_tipo_longitud = in_tipo_longitud
						, @in_posinicial = in_posinicial
						, @in_longitud = in_longitud
						, @Id_Reserva = Id_Reserva 
						, @Formula = RTRIM(Formula)
					FROM @TVariables WHERE Id = @Contador AND ISNULL(Formula,'')<>''

					IF ISNULL(@Formula,'')<>''
					BEGIN
						SET @FormulaAux= REPLACE(REPLACE(REPLACE(REPLACE(@Formula,'Z!VAR_',''),'!',''),'&',','),'+',',')
					
						DELETE FROM @TVariablesFormula
					
						INSERT INTO @TVariablesFormula(Iden_Variable,cd_variable)
						SELECT Iden_Variable=IDEN ,cd_variable=Codigo 
						FROM dbo.fnSplitMejorado(@FormulaAux,',',0,1) ve
						INNER JOIN dbo.VariableDefinicion v ON v.Nombre = ve.Codigo AND v.TipoVariable='Documento'
					
						SET @ValorObtenido=@Formula
						SELECT @ValorObtenido=REPLACE(REPLACE(REPLACE(@ValorObtenido,'Z!VAR_'+cd_variable+'!',ValorObtenido),'&',''),'+','') 
						FROM @TVariables v
						INNER JOIN @TVariablesFormula vf ON vf.Iden_variable = v.Iden_Variable  
					
						UPDATE @TVariables
						SET ValorObtenido = @ValorObtenido
						WHERE Id = @Contador AND ISNULL(Formula,'')<>''
					END
				END
			END

			SELECT DISTINCT
				TV.Iden_Variable
	  			,VD.Nombre
	  			,TV.ValorObtenido
				,TV.Id_Reserva --inicio rgelis 2017/03/16 req.48076
				,TV.IDEN_Maestro 
				,VDM.Codigo AS cd_Maestro --fin rgelis 2017/03/16 req.48076 
			FROM @TVariables TV
			INNER JOIN VariableDefinicion VD ON VD.Iden = TV.Iden_Variable
			INNER JOIN VariableDefinicionMaestro VDM ON VDM.IDEN = TV.IDEN_Maestro --rgelis 2017/03/16 req.48076     
			--WHERE ISNULL(ValorObtenido,'') <> '' --rgelis 2017/03/15 req..... correcion para que traiga todas las variables configuradas
			
			IF (@@ROWCOUNT<1)
				SET @msg = 'Consulta Fallida';
							
			--------------------------------------------------------------------------
			--Determinando si se debe auditar el proceso exitoso
			IF (@bl_as = 1) 
			BEGIN 										
				EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce    ,
												 @id_usuario = @id_usuario ,
												 @cd_status  = 1           , 												 
												 @admsg      = NULL        ,
							 					 @msgparams  = @msg;
			END 			 						 		 	
			--SELECT ltrim(rtrim(@msg)) AS 'Respuesta';			
			RETURN @retval;
	    END TRY 
    
    	-- Bloque CATCH (Manejo de excepciones)
    	BEGIN CATCH 
 			
 			-- Tiempo de espera alcanzado --
			IF ERROR_NUMBER() = 1222
			BEGIN
      			SET @msg =  'No se pudo ejecutar el proceso. Tiempo de espera agotado.';
      			SET @retval = 1
	   			RAISERROR (@msg,16,125);
	   	       	--Se debe auditar proceso fallido
				IF (@bl_af = 1) EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce ,
													 			 @id_usuario = @id_usuario ,
													 			 @cd_status  = 0           , 
													 			 @admsg      = @msg	   ;				
	   	        RETURN @retval;
			END 
		   -- Registro bloqueado / Conflicto de actualizacion
			ELSE IF ERROR_NUMBER() IN (1205, 3960)
			BEGIN	   	        
		       	SET @retry     = 1              ;
		       	SET @retrycont = @retrycont + 1 ; 

	    	END
	    	ELSE
		    BEGIN
				-- Error no manejado --
				--IF (XACT_STATE() <> 0)
	   	        BEGIN 				
					SET @retval = 1;
  	 				SET @msg =	'Ha ocurrido un error. Información para soporte tecnico:'			+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
							    'Numero: ' + isnull(CAST(ERROR_NUMBER()   AS VARCHAR(10)),'') 		+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
								'Mensaje: ' + isnull(ERROR_MESSAGE(),'') 					   		+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
							 	'Severidad: ' + isnull(CAST(ERROR_SEVERITY() AS VARCHAR(10)),'') 	+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
							 	'Estado: ' + isnull(CAST(ERROR_STATE()    AS VARCHAR(10)),'') 		+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
								'Procedimiento: ' + isnull(ERROR_PROCEDURE(),'')					+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
								'Linea: ' + isnull(CAST(ERROR_LINE() 	   AS VARCHAR(10)),''); 							
		
					RAISERROR (@msg,16,126);
					--Se debe auditar proceso fallido
					IF (@bl_af = 1) EXEC dbo.spzaAuditoria_Insertar	@id_proceso = @idproce   ,
											 			 			@id_usuario = @id_usuario ,
											 			 			@cd_status  = 0           , 
											 			 			@admsg      = @msg	  ;				
					RETURN @retval;
	   	        END 
		     END
		END CATCH     
	END 
	
	IF (@retrycont>@maxretries) 
	BEGIN 
		SET @retval = 1
		SET @msg = 'No se pudo finalizar el proceso. Maximo numero de reintentos alcanzado.'
		--Se debe auditar proceso fallido
		IF (@bl_af = 1) EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce    ,
											 			 @id_usuario = @id_usuario ,
											 			 @cd_status  = 0           , 
											 			 @admsg      = @msg	   ;												 	   					   
  		RAISERROR (@msg,16,127);
  		RETURN @retval;
  	END   	
    
    RETURN @retval;
END
GO
