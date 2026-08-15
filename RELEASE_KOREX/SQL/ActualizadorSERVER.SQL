-- ==========================================================
-- ARCHIVO ACTUALIZADOR COMPLETO: SPS (SQL SERVER)
-- Generado Automáticamente
-- ==========================================================

-- >>> PROCEDIMIENTOS ALMACENADOS (SQL SERVER) <<<

-- Archivo: spCargosImpAsignadosIntegradoConsultarConceptoFac.sql
IF OBJECT_ID('dbo.spCargosImpAsignadosIntegradoConsultarConceptoFac', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spCargosImpAsignadosIntegradoConsultarConceptoFac;
GO
CREATE PROCEDURE [dbo].[spCargosImpAsignadosIntegradoConsultarConceptoFac] 
	-- Parametros del procedimiento
	@id_usuario INT,
	@id_ConceptFac INT,
	@bu VARCHAR(25) = '',
	@Id_Cliente Varchar(25) = NULL 

 
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
			@retval		TINYINT 		; -- Valor de retorno de este procedimiento: 0:Exito ; 1:Error(Bloque Catch)
	
	SELECT 	@retry				 = 1 		   ,
			@retrycont			 = 0		   ,
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
    	   	
			--Instrucciones del procedimiento-----------------------------------------
			DECLARE @id_TiposConceptoFacturacion INT
			SELECT @id_TiposConceptoFacturacion = ConceptoFacturacion.id_TiposConceptoFacturacion FROM dbo.ConceptoFacturacion WHERE ConceptoFacturacion.id = @id_ConceptFac

			IF ISNULL(@bu,'')=''
			BEGIN
				SELECT @bu = CASE WHEN ISNULL(I.cd_bu,'')<>'' THEN I.cd_bu ELSE ISNULL(S.cd_bu,'') END 
				From dbo.Usuario U
				Left Join [dbo].[Sucursales] S On U.id_sucursal = S.id
				Left Join [dbo].[Implantes] I On U.id_implante = I.id
				WHERE U.id=@id_usuario
			END

			--TODO: Manejo de cargos e impuestos por BU
			DECLARE @Permite_BU AS CHAR(2), @am_valor MONEY				
			SELECT @Permite_BU = rtrim(valor) FROM Parametros  WHERE id = 163
			SELECT @am_valor = am_valor FROM dbo.ConfiguracionClientesConceptos WHERE id_cliente = @Id_Cliente AND id_ConceptoFacturacion=@id_ConceptFac AND bl_inactivo=0
			SET @am_valor = ISNULL(@am_valor,0)
			IF @Permite_BU = 'S'
			BEGIN
				SELECT DISTINCT Codigo
				 	,Concepto
				 	,Porcentaje
				 	,Editable
				 	,Calcular
				 	,Contado
				 	,Credito
				 	,Valor
				 	,id_carg
				 	,id_imp
				 	,Tipo
				 	,Nombre
				 	,Cuenta
				 	,Contabilizar
				 	,NULL AS 'Respuesta'
				 	,noshow 
				 	,id_cargo_dep
				 	,id_imp_dep	   
 				 	,C_Orden
				 	,I_Orden
					,bl_iva
					,bl_iva2
				 FROM (
				 		SELECT 	 CD.cd_codigo 				AS 'Codigo'
							 	,cd.ds_nombre   			AS 'Concepto'
							 	,convert(NUMERIC(8,4),0)	AS 'Porcentaje'
							 	,'S'						AS 'Editable'
							 	,'N/A'						AS 'Calcular'
							 	,CASE WHEN ISNULL(CC.am_valor,0)<>0 AND CD.id=1 THEN CC.am_valor ELSE CD.am_valdef END AS 'Contado' --rgelis 2020/09/30 req.141927
							 	,convert(money,0)			AS 'Credito'
							 	,CASE WHEN ISNULL(CC.am_valor,0)<>0 AND CD.id=1 THEN CC.am_valor ELSE CD.am_valdef END AS 'Valor' --rgelis 2020/09/30 req.141927
								,CD.id 						AS 'id_carg'
								,0							AS 'id_imp'
								,'Tipo'= CASE CD.cd_signo 
											WHEN '+' THEN 'C'
											WHEN '-' THEN 'D'
										 END 				 
								,cd.ds_nombre 				AS 'Nombre'   
								,replicate(' ',16)			AS 'Cuenta'
								,convert(BIT,0)				AS 'Contabilizar'
								,cd.bl_noshow 				AS 'noshow'
								,0 							AS 'id_cargo_dep'
								,0 							AS 'id_imp_dep'																
								,in_Orden 					AS 'C_Orden'
								,0		 					AS 'I_Orden'
								,0		 					AS 'bl_iva'
								,0		 					AS 'bl_iva2'
						FROM dbo.CargosAsignados_ConceptoFac C 
							INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
							LEFT JOIN dbo.ConfiguracionClientesConceptos CC ON CC.id_conceptofacturacion=C.id_ConceptoFac AND CC.Id_Cliente = @Id_Cliente AND CC.bl_inactivo=0
						WHERE C.id_ConceptoFac = @id_ConceptFac
						AND CD.id NOT IN (	--Excluimos cargos que ya estan en descuentos de clientes.
											SELECT cd.Id
											FROM dbo.Configuracion_remisiones C 
												INNER JOIN dbo.Clientes_Descuentos CDSC ON CDSC.Id_Configuracion_remisiones = C.Id --And CDSC.id_ConceptoFacturacion IS NOT NULL
												INNER JOIN dbo.CargosDesc CD ON CD.id = CDSC.id_CargosDesc
											WHERE C.Id_Cliente = @Id_Cliente AND  (CDSC.id_ConceptoFacturacion = @id_ConceptFac OR CDSC.id_ConceptoFacturacion IS NULL)	
											)
						AND NOT EXISTS (
											SELECT cd.id
											FROM dbo.CLIENTES cl
												INNER JOIN dbo.TERCEROS t ON t.IDTERCERO = cl.IDTERCERO
												INNER JOIN dbo.Configuracion_ImpCategoriaFiscal CC ON CC.TipoEmpresa = t.TIPOEMPRESA
												INNER JOIN dbo.CargosAsignados_Configuracion_ImpCategoriaFiscal C ON C.id_Configuracion_ImpCategoriaFiscal =  CC.id
												INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
											WHERE cl.IDCLIENTE = @Id_Cliente AND CC.id_TiposConceptFac = @id_TiposConceptoFacturacion
										)

						UNION ALL
						
						SELECT 
								 IR.cd_codigo 										AS 'Codigo'
							 	,IR.ds_alias	   									AS 'Concepto'
							 	,ISNULL(convert(NUMERIC(8,4),IBU.am_porcentaje),0)	AS 'Porcentaje'
							 	,'Editable' = CASE IR.bl_editar 
												WHEN 0 THEN 'N'
												WHEN 1 THEN 'S'
									  		  END   
							 	,'Calcular'											AS 'Calcular'
							 	,CASE WHEN ISNULL(CC.am_valor,0)<>0 AND CD.id=1 AND IR.id_cargo_dep=1 AND IR.am_porcentaje>0 THEN convert(money,CC.am_valor*(IR.am_porcentaje/100)) ELSE convert(money,0) END AS 'Contado'
							 	,convert(money,0)									AS 'Credito'
							 	,CASE WHEN ISNULL(CC.am_valor,0)<>0 AND CD.id=1 AND IR.id_cargo_dep=1 AND IR.am_porcentaje>0 THEN convert(money,CC.am_valor*(IR.am_porcentaje/100)) ELSE convert(money,0) END AS 'Valor'
								,C.id_CargosDesc					   				AS 'id_carg'
								,I.id_ImpRet										AS 'id_imp'
								,'Tipo'= CASE IR.cd_tipo 
											WHEN 0 THEN 'I'
											WHEN 1 THEN 'R'
										 END     
								,IR.ds_nombre 						   				AS 'Nombre'   
								,IR.cd_cuenta										AS 'Cuenta'
								,bl_contabilizar									AS 'Contabilizar'
								,convert(BIT,0)										AS 'noshow'
								,isnull(IR.id_cargo_dep,0)                          AS 'id_cargo_dep'
								,isnull(IR.id_imp_dep,0)							AS 'id_imp_dep'
								,C.in_orden											AS 'C_Orden'
								,i.in_Orden		 	   								AS 'I_Orden'
								,bl_iva
								,bl_iva2
						FROM dbo.CargosAsignados_ConceptoFac C 
							INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
							LEFT JOIN dbo.ConfiguracionClientesConceptos CC ON CC.id_conceptofacturacion=C.id_ConceptoFac AND CC.Id_Cliente = @Id_Cliente AND CC.bl_inactivo=0
							LEFT JOIN dbo.ImpAsignados_ConceptoFac I ON (C.id = I.id_CargosAsignados_ConceptoFac)
							LEFT JOIN dbo.ImpRet IR ON (I.id_ImpRet = IR.id)
							LEFT JOIN dbo.Impuestos_bu IBU ON (IBU.id_impuesto = IR.id AND ibu.cd_bu = @bu )
						WHERE C.id_ConceptoFac = @id_ConceptFac
						AND NOT EXISTS (
												SELECT IR.id
												FROM dbo.CLIENTES cl
													INNER JOIN dbo.TERCEROS t ON t.IDTERCERO = cl.IDTERCERO
													INNER JOIN dbo.Configuracion_ImpCategoriaFiscal CC ON CC.TipoEmpresa = t.TIPOEMPRESA
													INNER JOIN dbo.CargosAsignados_Configuracion_ImpCategoriaFiscal C ON C.id_Configuracion_ImpCategoriaFiscal =  CC.id
													INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
													INNER JOIN dbo.ImpAsignados_Configuracion_ImpCategoriaFiscal I ON (I.id_CargosAsignados_Configuracion_ImpCategoriaFiscal = C.id )
													INNER JOIN dbo.ImpRet IR ON (I.id_ImpRet = IR.id)
													INNER JOIN dbo.Impuestos_bu IBU ON (IBU.id_impuesto = IR.id AND ibu.cd_bu = @bu )
												WHERE cl.IDCLIENTE = @Id_Cliente AND CC.id_TiposConceptFac = @id_TiposConceptoFacturacion
												)

						UNION ALL 
						--Cargos por categoria fiscal del cliente
				 		SELECT 	 CD.cd_codigo 				AS 'Codigo'
							 	,cd.ds_nombre   			AS 'Concepto'
							 	,convert(NUMERIC(8,4),0)	AS 'Porcentaje'
							 	,'S'						AS 'Editable'
							 	,'N/A'						AS 'Calcular'
							 	,CD.am_valdef    			AS 'Contado'
							 	,convert(money,0)			AS 'Credito'
							 	,CD.am_valdef				AS 'Valor'
								,CD.id 						AS 'id_carg'
								,0							AS 'id_imp'
								,'Tipo'= CASE CD.cd_signo 
											WHEN '+' THEN 'C'
											WHEN '-' THEN 'D'
										 END 				 
								,cd.ds_nombre 				AS 'Nombre'   
								,replicate(' ',16)			AS 'Cuenta'
								,convert(BIT,0)				AS 'Contabilizar'
								,cd.bl_noshow 				AS 'noshow'
								,0 							AS 'id_cargo_dep'
								,0 							AS 'id_imp_dep'																
								,in_Orden 					AS 'C_Orden'
								,0		 					AS 'I_Orden'		
								,0		 					AS 'bl_iva'
								,0		 					AS 'bl_iva2'																						
						FROM dbo.CLIENTES cl
							INNER JOIN dbo.TERCEROS t ON t.IDTERCERO = cl.IDTERCERO
							INNER JOIN dbo.Configuracion_ImpCategoriaFiscal CC ON CC.TipoEmpresa = t.TIPOEMPRESA
							INNER JOIN dbo.CargosAsignados_Configuracion_ImpCategoriaFiscal C ON C.id_Configuracion_ImpCategoriaFiscal =  CC.id
							INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
						WHERE cl.IDCLIENTE = @Id_Cliente AND CC.id_TiposConceptFac = @id_TiposConceptoFacturacion
						--AND CD.id NOT IN (
						--					SELECT CD.id
						--					FROM dbo.CargosAsignados_ConceptoFac C 
						--						INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
						--					WHERE C.id_ConceptoFac = @id_ConceptFac
						--				)	

						UNION ALL 
						--Impuestos por categoria fiscal del cliente
						SELECT 
								 IR.cd_codigo 										AS 'Codigo'
							 	,IR.ds_alias	   									AS 'Concepto'
							 	,ISNULL(convert(NUMERIC(8,4),IBU.am_porcentaje),0)	AS 'Porcentaje'
							 	,'Editable' = CASE IR.bl_editar 
												WHEN 0 THEN 'N'
												WHEN 1 THEN 'S'
									  		  END   
							 	,'Calcular'											AS 'Calcular'
							 	,convert(money,0)									AS 'Contado'
							 	,convert(money,0)									AS 'Credito'
							 	,convert(money,0)									AS 'Valor'
								,C.id_CargosDesc					   				AS 'id_carg'
								,I.id_ImpRet										AS 'id_imp'
								,'Tipo'= CASE IR.cd_tipo 
											WHEN 0 THEN 'I'
											WHEN 1 THEN 'R'
										 END     
								,IR.ds_nombre 						   				AS 'Nombre'   
								,IR.cd_cuenta										AS 'Cuenta'
								,bl_contabilizar									AS 'Contabilizar'
								,convert(BIT,0)										AS 'noshow'
								,isnull(IR.id_cargo_dep,0)                          AS 'id_cargo_dep'
								,isnull(IR.id_imp_dep,0)							AS 'id_imp_dep'
								,C.in_orden											AS 'C_Orden'
								,i.in_Orden		 	   								AS 'I_Orden'
								,bl_iva
								,bl_iva2
						FROM dbo.CLIENTES cl
							INNER JOIN dbo.TERCEROS t ON t.IDTERCERO = cl.IDTERCERO
							INNER JOIN dbo.Configuracion_ImpCategoriaFiscal CC ON CC.TipoEmpresa = t.TIPOEMPRESA
							INNER JOIN dbo.CargosAsignados_Configuracion_ImpCategoriaFiscal C ON C.id_Configuracion_ImpCategoriaFiscal =  CC.id
							INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
							INNER JOIN dbo.ImpAsignados_Configuracion_ImpCategoriaFiscal I ON (I.id_CargosAsignados_Configuracion_ImpCategoriaFiscal = C.id )
							INNER JOIN dbo.ImpRet IR ON (I.id_ImpRet = IR.id)
							INNER JOIN dbo.Impuestos_bu IBU ON (IBU.id_impuesto = IR.id AND ibu.cd_bu = @bu )
						WHERE cl.IDCLIENTE = @Id_Cliente AND CC.id_TiposConceptFac = @id_TiposConceptoFacturacion
						--AND ibu.id_impuesto NOT IN (
						--							SELECT ibu.id_impuesto
						--							FROM dbo.CargosAsignados_ConceptoFac C 
						--								INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
						--								LEFT JOIN dbo.ImpAsignados_ConceptoFac I ON (C.id = I.id_CargosAsignados_ConceptoFac)
						--								LEFT JOIN dbo.ImpRet IR ON (I.id_ImpRet = IR.id)
						--								LEFT JOIN dbo.Impuestos_bu IBU ON (IBU.id_impuesto = IR.id AND ibu.cd_bu = @bu )
						--							WHERE C.id_ConceptoFac = @id_ConceptFac
						--							)
										
						UNION ALL
						--Descuentos de Clientes
				 		SELECT 	 CD.cd_codigo 							AS 'Codigo'
							 	,cd.ds_nombre   						AS 'Concepto'
							 	,convert(NUMERIC(8,4),CDSC.am_porcentaje)	AS 'Porcentaje'
							 	,'S'									AS 'Editable'
							 	,CASE 
							 		WHEN CDSC.am_porcentaje > 0 THEN 'Calcular'								
							 		ELSE 'N/A' END 
							 		AS 'Calcular'
							 	,CDSC.am_valor    						AS 'Contado'
							 	,convert(money,0)						AS 'Credito'
							 	,CDSC.am_valor							AS 'Valor'
								,CD.id 									AS 'id_carg'
								,0										AS 'id_imp'
								,'Tipo'= CASE CD.cd_signo 
											WHEN '+' THEN 'C'
											WHEN '-' THEN 'D'
										 END 				 
								,cd.ds_nombre 							AS 'Nombre'   
								,replicate(' ',16)						AS 'Cuenta'
								,convert(BIT,0)							AS 'Contabilizar'
								,cd.bl_noshow 							AS 'noshow'
								,isnull(cd.id_cargo_dep,0) 				AS 'id_cargo_dep'
								,0 										AS 'id_imp_dep'
								,999	 								AS 'C_Orden'
								,0		 								AS 'I_Orden'
								,0		 								AS 'bl_iva'
								,0		 								AS 'bl_iva2'
						FROM dbo.Configuracion_remisiones C 
							INNER JOIN dbo.Clientes_Descuentos CDSC ON CDSC.Id_Configuracion_remisiones = C.Id --And CDSC.id_ConceptoFacturacion IS NOT NULL
							INNER JOIN dbo.CargosDesc CD ON CD.id = CDSC.id_CargosDesc
						WHERE C.Id_Cliente = @Id_Cliente AND  (CDSC.id_ConceptoFacturacion = @id_ConceptFac OR CDSC.id_ConceptoFacturacion IS NULL)

						/*UNION ALL
						-- Asignacion de por tipo de concepto facturacion
						SELECT  CD.cd_codigo 				AS 'Codigo'
							 	,CD.ds_nombre   			AS 'Concepto'
							 	,convert(NUMERIC(8,4),0)	AS 'Porcentaje'
							 	,'S'						AS 'Editable'
							 	,'N/A'						AS 'Calcular'
							 	,CD.am_valdef    			AS 'Contado'
							 	,convert(money,0)			AS 'Credito'
							 	,CD.am_valdef				AS 'Valor'
								,CD.id 						AS 'id_carg'
								,0							AS 'id_imp'
								,'Tipo'= CASE CD.cd_signo 
											WHEN '+' THEN 'C'
											WHEN '-' THEN 'D'
										 END 				 
								,CD.ds_nombre 				AS 'Nombre'   
								,replicate(' ',16)			AS 'Cuenta'
								,convert(BIT,0)				AS 'Contabilizar'
								,cd.bl_noshow 				AS 'noshow'
								,0 							AS 'id_cargo_dep'
								,0 							AS 'id_imp_dep'																
								,C.in_Orden 				AS 'C_Orden'
								,0		 					AS 'I_Orden'		
								,0		 					AS 'bl_iva'
								,0		 					AS 'bl_iva2'
						FROM dbo.ConceptoFacturacion CF
						INNER JOIN dbo.CargosAsignados C ON C.id_TiposConceptFac = CF.id_TiposConceptoFacturacion
						INNER JOIN dbo.CargosDesc CD ON CD.id = C.id_CargosDesc
						WHERE CF.id = @id_ConceptFac AND CF.bl_contorlarCargImp=0	
						
						UNION ALL
						
						SELECT IR.cd_codigo 										AS 'Codigo'
							 	,IR.ds_alias	   									AS 'Concepto'
							 	,ISNULL(convert(NUMERIC(8,4),IR.am_porcentaje),0)	AS 'Porcentaje'
							 	,'Editable' = CASE IR.bl_editar 
												WHEN 0 THEN 'N'
												WHEN 1 THEN 'S'
									  		  END   
							 	,'Calcular'											AS 'Calcular'
							 	,convert(money,0)									AS 'Contado'
							 	,convert(money,0)									AS 'Credito'
							 	,convert(money,0)									AS 'Valor'
								,C.id_CargosDesc					   				AS 'id_carg'
								,I.id_ImpRet										AS 'id_imp'
								,'Tipo'= CASE IR.cd_tipo 
											WHEN 0 THEN 'I'
											WHEN 1 THEN 'R'
										 END     
								,IR.ds_nombre 						   				AS 'Nombre'   
								,IR.cd_cuenta										AS 'Cuenta'
								,IR.bl_contabilizar									AS 'Contabilizar'
								,convert(BIT,0)										AS 'noshow'
								,isnull(IR.id_cargo_dep,0)                          AS 'id_cargo_dep'
								,isnull(IR.id_imp_dep,0)							AS 'id_imp_dep'
								,C.in_orden											AS 'C_Orden'
								,i.in_Orden		 	   								AS 'I_Orden'
								,bl_iva
								,bl_iva2
						FROM dbo.ConceptoFacturacion CF
						INNER JOIN dbo.CargosAsignados C ON C.id_TiposConceptFac = CF.id_TiposConceptoFacturacion
						INNER JOIN dbo.CargosDesc CD ON CD.id = C.id_CargosDesc
						INNER JOIN  dbo.ImpAsignados I ON I.id_CargosAsignados = C.id
						INNER JOIN dbo.ImpRet IR ON IR.id = I.id_ImpRet
						WHERE CF.id = @id_ConceptFac AND CF.bl_contorlarCargImp=0 
						*/							

				 	) AS temptbl
				 WHERE Codigo IS NOT NULL 
				 ORDER BY C_Orden, I_Orden ,Id_carg,Id_imp
			END 
			ELSE
			BEGIN
				SELECT 	DISTINCT Codigo
				 	,Concepto
				 	,Porcentaje
				 	,Editable
				 	,Calcular
				 	,Contado
				 	,Credito
				 	,Valor
				 	,id_carg
				 	,id_imp
				 	,Tipo
				 	,Nombre
				 	,Cuenta
				 	,Contabilizar
				 	,NULL AS 'Respuesta'
				 	,noshow 
				 	,id_cargo_dep
				 	,id_imp_dep	   
 				 	,C_Orden
				 	,I_Orden
					,bl_iva
					,bl_iva2
				 FROM (
				 		SELECT 	 CD.cd_codigo 				AS 'Codigo'
							 	,cd.ds_nombre   			AS 'Concepto'
							 	,convert(NUMERIC(8,4),am_porcentaje)	AS 'Porcentaje'
							 	,'S'						AS 'Editable'
							 	,CASE 
							 		WHEN am_porcentaje > 0 THEN 'Calcular'								
							 		ELSE 'N/A' END 
							 		AS 'Calcular'
							 	,CASE WHEN ISNULL(CC.am_valor,0)<>0 AND CD.id=1 THEN CC.am_valor ELSE CD.am_valdef END AS 'Contado'
							 	,convert(money,0)			AS 'Credito'
							 	,CASE WHEN ISNULL(CC.am_valor,0)<>0 AND CD.id=1 THEN CC.am_valor ELSE CD.am_valdef END AS 'Valor'
								,CD.id 						AS 'id_carg'
								,0							AS 'id_imp'
								,'Tipo'= CASE CD.cd_signo 
											WHEN '+' THEN 'C'
											WHEN '-' THEN 'D'
										 END 				 
								,cd.ds_nombre 				AS 'Nombre'   
								,replicate(' ',16)			AS 'Cuenta'
								,convert(BIT,0)				AS 'Contabilizar'
								,cd.bl_noshow 				AS 'noshow'
								,isnull(cd.id_cargo_dep,0) 	AS 'id_cargo_dep'
								,0 							AS 'id_imp_dep'																
								,in_Orden 					AS 'C_Orden'
								,0		 					AS 'I_Orden'
								,0		 					AS 'bl_iva'
								,0		 					AS 'bl_iva2'
							FROM dbo.CargosAsignados_ConceptoFac C 
								INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
								LEFT JOIN dbo.ConfiguracionClientesConceptos CC ON CC.id_conceptofacturacion=C.id_ConceptoFac AND CC.Id_Cliente = @Id_Cliente AND CC.bl_inactivo=0
							WHERE C.id_ConceptoFac = @id_ConceptFac
							AND CD.id NOT IN (	--Excluimos cargos que ya estan en descuentos de clientes.
												SELECT cd.Id
												FROM dbo.Configuracion_remisiones C 
													INNER JOIN dbo.Clientes_Descuentos CDSC ON CDSC.Id_Configuracion_remisiones = C.Id --And CDSC.id_ConceptoFacturacion IS NOT NULL
													INNER JOIN dbo.CargosDesc CD ON CD.id = CDSC.id_CargosDesc
												WHERE C.Id_Cliente = @Id_Cliente AND  (CDSC.id_ConceptoFacturacion = @id_ConceptFac OR CDSC.id_ConceptoFacturacion IS NULL)
											  )
						AND NOT EXISTS (
										SELECT cd.id
										FROM dbo.CLIENTES cl
											INNER JOIN dbo.TERCEROS t ON t.IDTERCERO = cl.IDTERCERO
											INNER JOIN dbo.Configuracion_ImpCategoriaFiscal CC ON CC.TipoEmpresa = t.TIPOEMPRESA
											INNER JOIN dbo.CargosAsignados_Configuracion_ImpCategoriaFiscal C ON C.id_Configuracion_ImpCategoriaFiscal =  CC.id
											INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
										WHERE cl.IDCLIENTE = @Id_Cliente AND CC.id_TiposConceptFac = @id_TiposConceptoFacturacion
										)

						UNION ALL
						
						SELECT 
								 IR.cd_codigo 							AS 'Codigo'
							 	,IR.ds_alias	   						AS 'Concepto'
							 	,convert(NUMERIC(8,4),IR.am_porcentaje)	AS 'Porcentaje'
							 	,'Editable' = CASE IR.bl_editar 
												WHEN 0 THEN 'N'
												WHEN 1 THEN 'S'
									  		  END   
							 	,'Calcular'								AS 'Calcular'
							 	,CASE WHEN ISNULL(CC.am_valor,0)<>0 AND CD.id=1 AND IR.id_cargo_dep=1 AND IR.am_porcentaje>0 THEN convert(money,CC.am_valor*(IR.am_porcentaje/100)) ELSE convert(money,0) END AS 'Contado'
							 	,convert(money,0)						AS 'Credito'
							 	,CASE WHEN ISNULL(CC.am_valor,0)<>0 AND CD.id=1 AND IR.id_cargo_dep=1 AND IR.am_porcentaje>0 THEN convert(money,CC.am_valor*(IR.am_porcentaje/100)) ELSE convert(money,0) END AS 'Valor'
								,C.id_CargosDesc						AS 'id_carg'
								,I.id_ImpRet							AS 'id_imp'
								,'Tipo'= CASE IR.cd_tipo 
											WHEN 0 THEN 'I'
											WHEN 1 THEN 'R'
										 END     
								,IR.ds_nombre 							AS 'Nombre'   
								,IR.cd_cuenta							AS 'Cuenta'
								,bl_contabilizar						AS 'Contabilizar'
								,convert(BIT,0)							AS 'noshow'
								,isnull(IR.id_cargo_dep,0) /*  isnull(c.id_CargosDesc,0) */                    AS 'id_cargo_dep' --rgelis 2017/02/11 se cambia por error en superdestinos
								,isnull(IR.id_imp_dep,0)							AS 'id_imp_dep'
								,C.in_orden											AS 'C_Orden'
								,i.in_Orden		 	   								AS 'I_Orden'
								,bl_iva
								,bl_iva2
							FROM dbo.CargosAsignados_ConceptoFac C 
								INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
								LEFT JOIN dbo.ConfiguracionClientesConceptos CC ON CC.id_conceptofacturacion=C.id_ConceptoFac AND CC.Id_Cliente = @Id_Cliente AND CC.bl_inactivo=0
								LEFT JOIN dbo.ImpAsignados_ConceptoFac I ON (C.id = I.id_CargosAsignados_ConceptoFac)
								LEFT JOIN dbo.ImpRet IR ON (I.id_ImpRet = IR.id)
							WHERE C.id_ConceptoFac = @id_ConceptFac
							AND NOT EXISTS(
											SELECT IR.id
											FROM dbo.CLIENTES cl
												INNER JOIN dbo.TERCEROS t ON t.IDTERCERO = cl.IDTERCERO
												INNER JOIN dbo.Configuracion_ImpCategoriaFiscal CC ON CC.TipoEmpresa = t.TIPOEMPRESA
												INNER JOIN dbo.CargosAsignados_Configuracion_ImpCategoriaFiscal C ON C.id_Configuracion_ImpCategoriaFiscal =  CC.id
												INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
												INNER JOIN dbo.ImpAsignados_Configuracion_ImpCategoriaFiscal I ON (I.id_CargosAsignados_Configuracion_ImpCategoriaFiscal = C.id )
												INNER JOIN dbo.ImpRet IR ON (I.id_ImpRet = IR.id)
											WHERE cl.IDCLIENTE = @Id_Cliente AND CC.id_TiposConceptFac = @id_TiposConceptoFacturacion
										   )

						UNION ALL 
						--Cargos por categoria fiscal del cliente
				 		SELECT 	 CD.cd_codigo 				AS 'Codigo'
							 	,cd.ds_nombre   			AS 'Concepto'
							 	,convert(NUMERIC(8,4),0)	AS 'Porcentaje'
							 	,'S'						AS 'Editable'
							 	,'N/A'						AS 'Calcular'
							 	,CD.am_valdef    			AS 'Contado'
							 	,convert(money,0)			AS 'Credito'
							 	,CD.am_valdef				AS 'Valor'
								,CD.id 						AS 'id_carg'
								,0							AS 'id_imp'
								,'Tipo'= CASE CD.cd_signo 
											WHEN '+' THEN 'C'
											WHEN '-' THEN 'D'
										 END 				 
								,cd.ds_nombre 				AS 'Nombre'   
								,replicate(' ',16)			AS 'Cuenta'
								,convert(BIT,0)				AS 'Contabilizar'
								,cd.bl_noshow 				AS 'noshow'
								,0 							AS 'id_cargo_dep'
								,0 							AS 'id_imp_dep'																
								,in_Orden 					AS 'C_Orden'
								,0		 					AS 'I_Orden'			
								,0		 					AS 'bl_iva'
								,0		 					AS 'bl_iva2'																					
						FROM dbo.CLIENTES cl
							INNER JOIN dbo.TERCEROS t ON t.IDTERCERO = cl.IDTERCERO
							INNER JOIN dbo.Configuracion_ImpCategoriaFiscal CC ON CC.TipoEmpresa = t.TIPOEMPRESA
							INNER JOIN dbo.CargosAsignados_Configuracion_ImpCategoriaFiscal C ON C.id_Configuracion_ImpCategoriaFiscal =  CC.id
							INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
						WHERE cl.IDCLIENTE = @Id_Cliente AND CC.id_TiposConceptFac = @id_TiposConceptoFacturacion
						--AND CD.id NOT IN (
						--					SELECT Cd.id
						--					FROM dbo.CargosAsignados_ConceptoFac C 
						--						INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
						--					WHERE C.id_ConceptoFac = @id_ConceptFac										
						--					)						

						UNION ALL 
						--Impuestos por categoria fiscal del cliente
						SELECT 
								 IR.cd_codigo 										AS 'Codigo'
							 	,IR.ds_alias	   									AS 'Concepto'
							 	,convert(NUMERIC(8,4),IR.am_porcentaje)	AS 'Porcentaje'
							 	,'Editable' = CASE IR.bl_editar 
												WHEN 0 THEN 'N'
												WHEN 1 THEN 'S'
									  		  END   
							 	,'Calcular'											AS 'Calcular'
							 	,convert(money,0)									AS 'Contado'
							 	,convert(money,0)									AS 'Credito'
							 	,convert(money,0)									AS 'Valor'
								,C.id_CargosDesc					   				AS 'id_carg'
								,I.id_ImpRet										AS 'id_imp'
								,'Tipo'= CASE IR.cd_tipo 
											WHEN 0 THEN 'I'
											WHEN 1 THEN 'R'
										 END     
								,IR.ds_nombre 						   				AS 'Nombre'   
								,IR.cd_cuenta										AS 'Cuenta'
								,bl_contabilizar									AS 'Contabilizar'
								,convert(BIT,0)										AS 'noshow'
								,isnull(IR.id_cargo_dep,0)                          AS 'id_cargo_dep'
								,isnull(IR.id_imp_dep,0)							AS 'id_imp_dep'
								,C.in_orden											AS 'C_Orden'
								,i.in_Orden		 	   								AS 'I_Orden'
								,bl_iva
								,bl_iva2
						FROM dbo.CLIENTES cl
							INNER JOIN dbo.TERCEROS t ON t.IDTERCERO = cl.IDTERCERO
							INNER JOIN dbo.Configuracion_ImpCategoriaFiscal CC ON CC.TipoEmpresa = t.TIPOEMPRESA
							INNER JOIN dbo.CargosAsignados_Configuracion_ImpCategoriaFiscal C ON C.id_Configuracion_ImpCategoriaFiscal =  CC.id
							INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
							INNER JOIN dbo.ImpAsignados_Configuracion_ImpCategoriaFiscal I ON (I.id_CargosAsignados_Configuracion_ImpCategoriaFiscal = C.id )
							INNER JOIN dbo.ImpRet IR ON (I.id_ImpRet = IR.id)
						WHERE cl.IDCLIENTE = @Id_Cliente AND CC.id_TiposConceptFac = @id_TiposConceptoFacturacion
						--AND IR.id NOT IN (
						--					SELECT IR.id 
						--					FROM dbo.CargosAsignados_ConceptoFac C 
						--						INNER JOIN dbo.CargosDesc CD ON (C.id_CargosDesc = CD.id)
						--						LEFT JOIN dbo.ImpAsignados_ConceptoFac I ON (C.id = I.id_CargosAsignados_ConceptoFac)
						--						LEFT JOIN dbo.ImpRet IR ON (I.id_ImpRet = IR.id)
						--					WHERE C.id_ConceptoFac = @id_ConceptFac					
						--				)						

						UNION ALL
						-- descuentos configurados a cliente
				 		SELECT 	 CD.cd_codigo 							AS 'Codigo'
							 	,cd.ds_nombre   						AS 'Concepto'
							 	,convert(NUMERIC(8,4),CDSC.am_porcentaje)	AS 'Porcentaje'
							 	,'S'									AS 'Editable'
							 	,CASE 
							 		WHEN CDSC.am_porcentaje > 0 THEN 'Calcular'								
							 		ELSE 'N/A' END 
							 		AS 'Calcular'
							 	,CDSC.am_valor    						AS 'Contado'
							 	,convert(money,0)						AS 'Credito'
							 	,CDSC.am_valor							AS 'Valor'
								,CD.id 									AS 'id_carg'
								,0										AS 'id_imp'
								,'Tipo'= CASE CD.cd_signo 
											WHEN '+' THEN 'C'
											WHEN '-' THEN 'D'
										 END 				 
								,cd.ds_nombre 							AS 'Nombre'   
								,replicate(' ',16)						AS 'Cuenta'
								,convert(BIT,0)							AS 'Contabilizar'
								,cd.bl_noshow 							AS 'noshow'
								,isnull(cd.id_cargo_dep,0) 				AS 'id_cargo_dep'
								,0 										AS 'id_imp_dep'
								,999	 								AS 'C_Orden'
								,0		 								AS 'I_Orden'
								,0		 					AS 'bl_iva'
								,0		 					AS 'bl_iva2'
							FROM dbo.Configuracion_remisiones C 
								INNER JOIN dbo.Clientes_Descuentos CDSC ON CDSC.Id_Configuracion_remisiones = C.Id --And CDSC.id_ConceptoFacturacion IS NOT NULL
								INNER JOIN dbo.CargosDesc CD ON CD.id = CDSC.id_CargosDesc
							WHERE C.Id_Cliente = @Id_Cliente AND (CDSC.id_ConceptoFacturacion = @id_ConceptFac OR CDSC.id_ConceptoFacturacion IS NULL)
							
						/*UNION ALL
						-- Asignacion de por tipo de concepto facturacion
						SELECT  CD.cd_codigo 				AS 'Codigo'
							 	,CD.ds_nombre   			AS 'Concepto'
							 	,convert(NUMERIC(8,4),0)	AS 'Porcentaje'
							 	,'S'						AS 'Editable'
							 	,'N/A'						AS 'Calcular'
							 	,CD.am_valdef    			AS 'Contado'
							 	,convert(money,0)			AS 'Credito'
							 	,CD.am_valdef				AS 'Valor'
								,CD.id 						AS 'id_carg'
								,0							AS 'id_imp'
								,'Tipo'= CASE CD.cd_signo 
											WHEN '+' THEN 'C'
											WHEN '-' THEN 'D'
										 END 				 
								,CD.ds_nombre 				AS 'Nombre'   
								,replicate(' ',16)			AS 'Cuenta'
								,convert(BIT,0)				AS 'Contabilizar'
								,cd.bl_noshow 				AS 'noshow'
								,0 							AS 'id_cargo_dep'
								,0 							AS 'id_imp_dep'																
								,C.in_Orden 				AS 'C_Orden'
								,0		 					AS 'I_Orden'		
								,0		 					AS 'bl_iva'
								,0		 					AS 'bl_iva2'
						FROM dbo.ConceptoFacturacion CF
						INNER JOIN dbo.CargosAsignados C ON C.id_TiposConceptFac = CF.id_TiposConceptoFacturacion
						INNER JOIN dbo.CargosDesc CD ON CD.id = C.id_CargosDesc
						WHERE CF.id = @id_ConceptFac AND CF.bl_contorlarCargImp=0	
						
						UNION ALL
						
						SELECT IR.cd_codigo 										AS 'Codigo'
							 	,IR.ds_alias	   									AS 'Concepto'
							 	,ISNULL(convert(NUMERIC(8,4),IR.am_porcentaje),0)	AS 'Porcentaje'
							 	,'Editable' = CASE IR.bl_editar 
												WHEN 0 THEN 'N'
												WHEN 1 THEN 'S'
									  		  END   
							 	,'Calcular'											AS 'Calcular'
							 	,convert(money,0)									AS 'Contado'
							 	,convert(money,0)									AS 'Credito'
							 	,convert(money,0)									AS 'Valor'
								,C.id_CargosDesc					   				AS 'id_carg'
								,I.id_ImpRet										AS 'id_imp'
								,'Tipo'= CASE IR.cd_tipo 
											WHEN 0 THEN 'I'
											WHEN 1 THEN 'R'
										 END     
								,IR.ds_nombre 						   				AS 'Nombre'   
								,IR.cd_cuenta										AS 'Cuenta'
								,IR.bl_contabilizar									AS 'Contabilizar'
								,convert(BIT,0)										AS 'noshow'
								,isnull(IR.id_cargo_dep,0)                          AS 'id_cargo_dep'
								,isnull(IR.id_imp_dep,0)							AS 'id_imp_dep'
								,C.in_orden											AS 'C_Orden'
								,i.in_Orden		 	   								AS 'I_Orden'
								,bl_iva
								,bl_iva2
						FROM dbo.ConceptoFacturacion CF
						INNER JOIN dbo.CargosAsignados C ON C.id_TiposConceptFac = CF.id_TiposConceptoFacturacion
						INNER JOIN dbo.CargosDesc CD ON CD.id = C.id_CargosDesc
						INNER JOIN dbo.ImpAsignados I ON I.id_CargosAsignados = C.id
						INNER JOIN dbo.ImpRet IR ON IR.id = I.id_ImpRet
						WHERE CF.id = @id_ConceptFac AND CF.bl_contorlarCargImp=0 
						*/
				 	) AS temptbl
				 WHERE Codigo IS NOT NULL 
				 ORDER BY C_Orden, I_Orden ,Id_carg,Id_imp
			END 
			 
			--------------------------------------------------------------------------
						
			RETURN @retval 
	    END TRY 
    
    	-- Bloque CATCH (Manejo de excepciones)
    	BEGIN CATCH 
 		
 			-- Tiempo de espera alcanzado --
		    IF ERROR_NUMBER() = 1222
		    BEGIN
      			SET @msg =  'No se pudo ejecutar el proceso. Tiempo de espera agotado.';
      			SET @retval = 1
	   	        RAISERROR (@msg,16,125);
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
					/*IF (@bl_af = 1) EXEC dbo.spzaAuditoria_Insertar	@id_proceso = @idproce   ,
											 			 			@id_usuario = @id_usuario ,
											 			 			@cd_status  = 0           , 
											 			 			@admsg      = @msg	  ;*/				
					RETURN @retval;
		     END
		END CATCH     
	END 
	
	IF (@retrycont>@maxretries) 
	BEGIN 
		SET @retval = 1
		SET @msg = 'No se pudo finalizar el proceso. Maximo numero de reintentos alcanzado.'
		--Se debe auditar proceso fallido
		/*IF (@bl_af = 1) EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce    ,
											 			 @id_usuario = @id_usuario ,
											 			 @cd_status  = 0           , 
											 			 @admsg      = @msg	   ;*/												 	   					   
  		RAISERROR (@msg,16,127);
  		RETURN @retval;
  	END   	
    
    RETURN @retval;
END


-- Archivo: spConfiguracionVariablesObtenerValores.sql
﻿-- Eliminar si existe
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


-- Archivo: spCotizacionesCrear.sql
-- Eliminar si existe
IF OBJECT_ID('dbo.spCotizacionesCrear', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spCotizacionesCrear;
GO

CREATE PROCEDURE dbo.spCotizacionesCrear
(
    @xml VARCHAR(MAX)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        DECLARE @xmlData XML;

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
			ds_cliente_tel varchar(25) NULL,
			ds_cliente_dirdesp varchar(250) NULL,
			ds_cliente_email varchar(60) NULL,
			ds_cliente_contacto varchar(40) NULL,
			ds_cliente_contacto_email varchar(60) NULL,
			id_monedas_IATA INT NOT NULL,
			cd_vendedor char(3) NOT NULL,
			id_tiqueteador INT NOT NULL,
			bn_anexo varbinary(max) NULL,
			am_tcambio smallmoney NOT NULL,
			am_tcambiousd money NULL,
			cd_cencosto char(16) NULL,
			ds_observacion varchar(8000) NULL,
			ds_Campo_libre1 varchar(500) NULL,
			ds_Campo_libre2 varchar(500) NULL,
			id_tipoventa INT NULL,
			in_estado tinyINT NOT NULL,
			dt_vence smalldatetime NULL,
			Id_Etapa INT NULL,
			ds_seguimiento_etapa varchar(500) NULL,
			bl_ManejaOpciones bit NOT NULL,
			in_NumeroOpciones INT NULL,
			bl_CerrarCotizacion bit NOT NULL,
			in_OpcionSeleccionada INT NULL,
			bl_grupos bit NOT NULL,
			gk_sabre varchar(25) NULL,
			id_Especialista INT NULL,
			id_TipoFormaPagoProveedor INT NULL,
			id_MedioReservacion INT NULL,
			bl_bloqueada bit NOT NULL,
			id_usuario_Bloqueo INT NULL,
			ds_AlertaSolicitud varchar(8000) NULL,
			bl_comisiona bit NOT NULL,
			ds_FormaDePago varchar(250) NULL,
			ds_records varchar(25) NULL,
			bl_entregadoCliente bit NOT NULL,
			dt_entregadoCliente smalldatetime NULL,
			id_sys_entidades INT NULL,
			id_MonedaPagoDestino INT NULL,
			id_FormaPagoDestino INT NULL,
			ds_DocumentoPagoDestino varchar(50) NULL,
			dt_CheckInPagoDestino smalldatetime NULL,
			dt_CheckOutPagoDestino smalldatetime NULL,
			bl_fechaPagoDestino bit NOT NULL,
			ds_hotelTieneTiquete varchar(2) NULL,
			ds_GDS varchar(2) NULL,
			id_Evento INT NULL,
			id_Cotizacion INT NULL,
			bl_existe BIT NULL
		)

		DECLARE @CotizacionServicios TABLE(
			id INT IDENTITY(1,1) NOT NULL,
			id_TiposConceptFac INT NOT NULL,
			id_ConceptoFacturacion INT NOT NULL,
			id_TiposServicio INT NULL,
			id_Cotizacion INT NULL,
			id_fac_factura INT NULL,
			id_fac_remision INT NULL,
			cd_proveedores varchar(25) NULL,
			ds_tiposervnm varchar(50) NULL,
			cd_prov_hotel char(10) NULL,
			cd_prov_car char(10) NULL,
			cd_prov_air char(10) NULL,
			ds_destino varchar(30) NULL,
			ds_servicio varchar(250) NULL,
			ds_descrip varchar(4000) NULL,
			ds_paxname varchar(20) NULL,
			ds_paxape varchar(20) NULL,
			cd_paxtype char(3) NULL,
			in_nacionalidad tinyINT NOT NULL,
			cd_voucher varchar(20) NULL,
			in_cantpax INT NOT NULL,
			dt_llegada smalldatetime NULL,
			dt_salida smalldatetime NULL,
			cd_cencosto varchar(16) NULL,
			cd_auxiliar varchar(16) NULL,
			cd_item varchar(16) NULL,
			am_valorprov money NULL,
			id_monedaprov INT NULL,
			ds_InfoAdicional varchar(8000) NULL,
			id_carrental INT NULL,
			id_hoteles INT NULL,
			bl_anulado bit NOT NULL,
			cd_tiquete char(11) NULL,
			cd_fuente_anul char(2) NULL,
			cd_serie_anul char(2) NULL,
			cd_consecutivo_anul char(8) NULL,
			id_usuario_anul INT NULL,
			id_sucursal_anul INT NULL,
			id_implante_anul INT NULL,
			am_basecomisionable money NULL,
			am_porcomision numeric(8, 4) NULL,
			cd_voucherPrefijo varchar(3) NULL,
			bl_notdomicilionacional bit NULL,
			Valor_Comision money NULL,
			Valor_Recaudo money NULL,
			dias_recaudo INT NULL,
			ds_paxClasificacion char(7) NULL,
			id_tipoplan INT NULL,
			id_acomodacion INT NULL,
			in_dias INT NULL,
			in_noches INT NULL,
			ds_records varchar(25) NULL,
			id_GrConcepto INT NULL,
			in_diasSrv INT NULL,
			in_nochesSrv INT NULL,
			Id_Especialista INT NULL,
			am_porcentaje_descuento numeric(8, 4) NULL,
			am_valor_descuento money NULL,
			ds_motivo_descuento varchar(1000) NULL,
			id_cargosdesc_descuento INT NULL,
			in_NumeroOpcion INT NULL,
			dt_FechaSalidaSrv smalldatetime NULL,
			dt_FechaLlegadaSrv smalldatetime NULL,
			cd_localizador varchar(25) NULL,
			cd_voucherpax varchar(25) NULL,
			am_basecomisionableprov money NULL,
			am_porcomisionprov numeric(8, 4) NULL,
			cd_NumeFac varchar(15) NULL,
			dt_VenceFac smalldatetime NULL,
			id_AcomodacionSrv INT NULL,
			id_TipoPlanSrv INT NULL,
			in_habitaciones INT NULL,
			in_habitacionesSrv INT NULL,
			cd_Consecutivo_VariablesAdicionales varchar(8) NULL,
			cd_confirmacion varchar(25) NULL,
			ds_confirmadopor varchar(250) NULL,
			cd_paxidentificacion varchar(25) NULL,
			bl_politicaCancelacion bit NOT NULL,
			dt_politicaCancelacion smalldatetime NULL,
			id_tipoHabitacion INT NULL,
			id_fac_facturaComision INT NULL,
			id_fac_remisionComision INT NULL,
			id_TarjetaAsistencia INT NULL,
			id_Regiones INT NULL,
			Iden_GDS INT NULL,
			id_sys_entidades INT NULL,
			ds_TipoAuto varchar(50) NULL,
			ds_Origen varchar(30) NULL,
			ds_DirOrigen varchar(250) NULL,
			ds_DirDestino varchar(250) NULL,
			ds_TipoTarifa varchar(50) NULL,
			am_ValorUSD money NULL,
			ds_NoVuelo varchar(25) NULL,
			ds_Vehiculo varchar(250) NULL,
			ds_Placa varchar(25) NULL,
			ds_CategoriaVehiculo varchar(250) NULL,
			ds_NombreConductor varchar(50) NULL,
			ds_telefono varchar(25) NULL,
			ds_IdiomaConductor varchar(25) NULL,
			id_MonedaSrv INT NULL,
			id_TipoServicio INT NULL,
			id_Aerolinea INT NULL,
			in_EdadPax INT NULL,
			am_PorFacParcial numeric(8, 4) NOT NULL,
			ds_GDS varchar(2) NULL,
			dt_fechaficheroBBVA smalldatetime NULL,
			bl_tiquete bit NOT NULL,
			am_basedescuento money NULL,
			am_pordescuento numeric(18, 4) NULL,
			id_CotizacionServicios_Depende INT NULL,
			id_CotizacionServicios INT NULL,
			cd_Cotizacion varchar(25) NULL
		 )

		 DECLARE @CotizacionServicios_PaxAdicional TABLE(
			id int IDENTITY(1,1) NOT NULL,
			id_Cotizacion int NULL,
			id_CotizacionServicios int NULL,
			ds_paxape varchar(30) NULL,
			ds_paxname varchar(30) NULL,
			ds_paxprefix char(3) NULL,
			ds_paxClasificacion char(7) NULL,
			cd_voucherpax varchar(25) NULL,
			cd_paxidentificacion varchar(25) NULL,
			in_edad int NULL,
			cd_tiquete char(50) NULL,
			cd_Cotizacion varchar(25) NULL,
			cd_CotizacionServicios varchar(25) NULL
		)

		DECLARE @CotizacionCargos TABLE(
			id int IDENTITY(1,1) NOT NULL,
			id_CotizacionServicios int NULL,
			id_cargosdesc int NOT NULL,
			ds_cargonm varchar(50) NOT NULL,
			bl_noshow bit NOT NULL,
			am_contado money NOT NULL,
			am_credito money NOT NULL,
			am_valor  AS (am_contado+am_credito),
			am_contado_ME money NOT NULL,
			am_credito_ME money NOT NULL,
			am_valor_ME  AS (am_contado_ME+am_credito_ME),
			id_CotizacionCargos INT NULL,
			cd_CotizacionCargos varchar(25) NULL,
			cd_Cotizacion varchar(25) NULL,
			cd_CotizacionServicios varchar(25) NULL
		 )

		 DECLARE @CotizacionImpuestos TABLE(
			id int IDENTITY(1,1) NOT NULL,
			id_CotizacionCargos int NULL,
			id_ImpRet int NOT NULL,
			ds_Impas varchar(50) NOT NULL,
			cd_impcta varchar(16) NULL,
			am_porcentaje smallmoney NOT NULL,
			bl_contabilizar bit NOT NULL,
			am_contado money NOT NULL,
			am_credito money NOT NULL,
			am_valor  AS (am_contado+am_credito),
			am_contado_ME money NOT NULL,
			am_credito_ME money NOT NULL,
			am_valor_ME  AS (am_contado_ME+am_credito_ME),
			cd_CotizacionImpuestos varchar(25) NULL,
			cd_CotizacionCargos varchar(25) NULL,
			cd_Cotizacion varchar(25) NULL,
			cd_CotizacionServicios varchar(25) NULL
		)

		DECLARE @VariableDatosMaestro TABLE(
			id INT IDENTITY(1,1) NOT NULL,
			IDEN_Maestro numeric(18, 0) NOT NULL,
			IDEN_Variable numeric(18, 0) NOT NULL,
			CodigoMaestro varchar(50) NOT NULL,
			ValorNumerico numeric(18, 6) NULL,
			ValorFecha smalldatetime NULL,
			ValorVarchar varchar(500) NULL,
			cd_VariableDatosMaestro varchar(25) NULL,
			cd_Cotizacion varchar(25) NULL,
			cd_CotizacionServicios varchar(25) NULL
		 )

		 DECLARE @Fac_Servicios_TiposFacturacionHoteles TABLE(
			id INT IDENTITY(1,1) NOT NULL,
			cd_Cotizacion varchar(25) NULL,
			cd_CotizacionServicios varchar(25) NULL,
			cd_TiposFacturacionHoteles varchar(25) NULL,
			cd_cargosdesc varchar(25) NULL,
			id_Fac_Servicios int NULL,
			id_CotizacionServicios int NULL,
			Id_TiposFacturacionHoteles int NOT NULL,
			in_cantidad int NULL,
			am_valor money NULL,
			am_contado money NOT NULL,
			am_credito money NOT NULL,
			Id_Cotizacion_Solicitud int NULL,
			id_cargosdesc int NULL,
			ds_cargonm varchar(50) NULL
		 )
		
		DECLARE @CotizacionServicios_TipoProv TABLE(
			id int IDENTITY(1,1) NOT NULL,
			cd_Cotizacion varchar(25) NULL,
			cd_CotizacionServicios varchar(25) NULL,
			id_CotizacionServicios int NULL,
			id_TipoProveedores int NULL,
			cd_TipoProveedores varchar(25) NULL,
			ds_TipoProveedores varchar(60) NULL,
			cd_proveedores varchar(25) NULL,
			ds_proveedores varchar(250) NULL
		)

		DECLARE @CotizacionServiciosFormasPago TABLE(
			id INT IDENTITY(1,1) NOT NULL,
			cd_Cotizacion VARCHAR(25) NULL,
			cd_CotizacionServicios VARCHAR(25) NULL,
			id_CotizacionServicios INT NULL,
			Id_Cotizacion INT NULL,
			id_FormasPago INT NULL,
			cd_codigo VARCHAR(3) NULL,
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
		)

        -- Validar que el XML sea correcto
        IF @xml IS NULL OR LTRIM(RTRIM(@xml)) = ''
        BEGIN
            --THROW 50001, 'El XML es obligatorio.', 1;
            SELECT 'El XML es obligatorio.' AS 'Respuesta', 1 AS 'Estado'
			RETURN 1;
        END

        -- Limpiar saltos de línea y tabuladores para evitar que se guarden en campos de texto (usuario, tercero, dirección, etc.)
        SET @xml = REPLACE(REPLACE(REPLACE(@xml, CHAR(13), ''), CHAR(10), ''), CHAR(9), '');

        SET @xmlData = TRY_CAST(@xml AS XML);

        IF @xmlData IS NULL
        BEGIN
            --THROW 50002, 'El XML no tiene un formato válido.', 1;
            SELECT 'El XML no tiene un formato válido.' AS 'Respuesta', 1 AS 'Estado'
			RETURN 1;
        END

        -- Extraer los principales códigos maestros del XML para validarlos
        DECLARE @val_cd_cliente_codigo VARCHAR(25) = @xmlData.value('(Cotizaciones/Cotizacion/cd_cliente_codigo)[1]', 'VARCHAR(25)');
        DECLARE @val_cd_sucursal VARCHAR(25) = @xmlData.value('(Cotizaciones/Cotizacion/cd_sucursal)[1]', 'VARCHAR(25)');
        DECLARE @val_cd_vendedor VARCHAR(25) = @xmlData.value('(Cotizaciones/Cotizacion/cd_vendedor)[1]', 'VARCHAR(25)');
        DECLARE @val_cd_tiqueteador VARCHAR(25) = @xmlData.value('(Cotizaciones/Cotizacion/cd_tiqueteador)[1]', 'VARCHAR(25)');

        -- 1. Validar Cliente
        IF @val_cd_cliente_codigo IS NOT NULL AND @val_cd_cliente_codigo <> '' AND NOT EXISTS (SELECT 1 FROM dbo.CLIENTES WHERE IDCLIENTE = @val_cd_cliente_codigo)
        BEGIN
            SELECT 'cliente ' + @val_cd_cliente_codigo + ' no existe' AS 'Respuesta', 1 AS 'Estado';
            RETURN 1;
        END

        -- 2. Validar Sucursal
        IF @val_cd_sucursal IS NOT NULL AND @val_cd_sucursal <> '' AND NOT EXISTS (SELECT 1 FROM dbo.Sucursales WHERE cd_codigo = @val_cd_sucursal)
        BEGIN
            SELECT 'sucursal ' + @val_cd_sucursal + ' no existe' AS 'Respuesta', 1 AS 'Estado';
            RETURN 1;
        END

        -- 3. Validar Vendedor (dbo.MAEVENDE)
        IF @val_cd_vendedor IS NOT NULL AND @val_cd_vendedor <> '' AND NOT EXISTS (SELECT 1 FROM dbo.MAEVENDE WHERE IDVENDE = @val_cd_vendedor)
        BEGIN
            SELECT 'vendedor ' + @val_cd_vendedor + ' no existe' AS 'Respuesta', 1 AS 'Estado';
            RETURN 1;
        END

        -- 4. Validar Tiqueteador (dbo.Tiqueteadores)
        IF @val_cd_tiqueteador IS NOT NULL AND @val_cd_tiqueteador <> '' AND NOT EXISTS (SELECT 1 FROM dbo.Tiqueteadores WHERE cd_codigo = @val_cd_tiqueteador)
        BEGIN
            SELECT 'tiqueteador ' + @val_cd_tiqueteador + ' no existe' AS 'Respuesta', 1 AS 'Estado';
            RETURN 1;
        END

        -- 5. Validar Proveedores de Servicios
        DECLARE @invalid_proveedor VARCHAR(25) = NULL;
        
        SELECT TOP 1 @invalid_proveedor = S.node.value('cd_proveedores[1]', 'VARCHAR(25)')
        FROM @xmlData.nodes('Cotizaciones/Cotizacion/CotizacionServicios') AS S(node)
        WHERE S.node.value('cd_proveedores[1]', 'VARCHAR(25)') IS NOT NULL 
          AND S.node.value('cd_proveedores[1]', 'VARCHAR(25)') <> ''
          AND NOT EXISTS (
              SELECT 1 FROM dbo.PROVEEDORES WHERE IDPROVE = S.node.value('cd_proveedores[1]', 'VARCHAR(25)')
          );

        IF @invalid_proveedor IS NOT NULL
        BEGIN
            SELECT 'proveedor ' + @invalid_proveedor + ' no existe' AS 'Respuesta', 1 AS 'Estado';
            RETURN 1;
        END

        -- Extraer datos del XML
        BEGIN TRANSACTION;

		INSERT INTO @Cotizacion(
			id_sucursal,
			id_implante,
			cd_consecutivo,
			id_usuario,
			dt_fechacont,
			dt_fecha,
			id_usuarioAct,
			dt_fechaAct,
			cd_tercero_codigo,
			ds_tercero_nombre,
			cd_cliente_codigo,
			ds_cliente_nombre,
			ds_cliente_dir,
			ds_cliente_ciudad,
			ds_cliente_tel,
			ds_cliente_dirdesp,
			ds_cliente_email,
			ds_cliente_contacto,
			ds_cliente_contacto_email,
			id_monedas_IATA,
			cd_vendedor,
			id_tiqueteador,
			bn_anexo,
			am_tcambio,
			am_tcambiousd,
			cd_cencosto,
			ds_observacion,
			ds_Campo_libre1,
			ds_Campo_libre2,
			id_tipoventa,
			in_estado,
			dt_vence,
			Id_Etapa,
			ds_seguimiento_etapa,
			bl_ManejaOpciones,
			in_NumeroOpciones,
			bl_CerrarCotizacion,
			in_OpcionSeleccionada,
			bl_grupos,
			gk_sabre,
			id_Especialista,
			id_TipoFormaPagoProveedor,
			id_MedioReservacion,
			bl_bloqueada,
			id_usuario_Bloqueo,
			ds_AlertaSolicitud,
			bl_comisiona,
			ds_FormaDePago,
			ds_records,
			bl_entregadoCliente,
			dt_entregadoCliente,
			id_sys_entidades,
			id_MonedaPagoDestino,
			id_FormaPagoDestino,
			ds_DocumentoPagoDestino,
			dt_CheckInPagoDestino,
			dt_CheckOutPagoDestino,
			bl_fechaPagoDestino,
			ds_hotelTieneTiquete,
			ds_GDS,
			id_Evento,
			id_Cotizacion,
			bl_existe
		)	
        SELECT 
			id_sucursal = ISNULL(S.id,1),
			id_implante = I.id,
			cd_consecutivo = C.Cotizacion.value('cd_consecutivo[1]','VARCHAR(25)'),
			id_usuario = ISNULL(U.id,1),
			dt_fechacont = ISNULL(C.Cotizacion.value('dt_fechacont[1]','SMALLDATETIME'),'19000101'),
			dt_fecha = ISNULL(C.Cotizacion.value('dt_fecha[1]','SMALLDATETIME'),'19000101'),
			id_usuarioAct = ISNULL(U.id,1),
			dt_fechaAct = ISNULL(C.Cotizacion.value('dt_fechaAct[1]','SMALLDATETIME'),'19000101'),
			cd_tercero_codigo = ISNULL(TR.IDTERCERO,''),
			ds_tercero_nombre = ISNULL(TR.NOMBRETER,''),
			cd_cliente_codigo = ISNULL(C.Cotizacion.value('cd_cliente_codigo[1]','VARCHAR(25)'),''),
			ds_cliente_nombre = ISNULL(C.Cotizacion.value('ds_cliente_nombre[1]','VARCHAR(250)'),''),
			ds_cliente_dir = ISNULL(C.Cotizacion.value('ds_cliente_dir[1]','VARCHAR(250)'),''),
			ds_cliente_ciudad = ISNULL(C.Cotizacion.value('ds_cliente_ciudad[1]','VARCHAR(40)'),''),
			ds_cliente_tel = ISNULL(C.Cotizacion.value('ds_cliente_tel[1]','VARCHAR(25)'),''),
			ds_cliente_dirdesp = ISNULL(C.Cotizacion.value('ds_cliente_dirdesp[1]','VARCHAR(250)'),''),
			ds_cliente_email = ISNULL(C.Cotizacion.value('ds_cliente_email[1]','VARCHAR(60)'),''),
			ds_cliente_contacto = ISNULL(C.Cotizacion.value('ds_cliente_contacto[1]','VARCHAR(40)'),''),
			ds_cliente_contacto_email = ISNULL(C.Cotizacion.value('ds_cliente_contacto_email[1]','VARCHAR(60)'),''),
			id_monedas_IATA = ISNULL(M.id,1),
			cd_vendedor = ISNULL(C.Cotizacion.value('cd_vendedor[1]','VARCHAR(3)'),''),
			id_tiqueteador = ISNULL(Tq.id, (SELECT TOP 1 id FROM dbo.Tiqueteadores)),
			bn_anexo = NULL,
			am_tcambio = ISNULL(C.Cotizacion.value('am_tcambio[1]','SMALLMONEY'),1),
			am_tcambiousd = ISNULL(C.Cotizacion.value('am_tcambiousd[1]','MONEY'),1),
			cd_cencosto = ISNULL(C.Cotizacion.value('cd_cencosto[1]','VARCHAR(16)'),''),
			ds_observacion = ISNULL(C.Cotizacion.value('ds_observacion[1]','VARCHAR(8000)'),''),
			ds_Campo_libre1 = ISNULL(C.Cotizacion.value('ds_Campo_libre1[1]','VARCHAR(500)'),''),
			ds_Campo_libre2 = ISNULL(C.Cotizacion.value('ds_Campo_libre2[1]','VARCHAR(500)'),''),
			id_tipoventa = Tv.id,
			in_estado = ISNULL(C.Cotizacion.value('in_estado[1]','INT'),1),
			dt_vence = C.Cotizacion.value('dt_vence[1]','SMALLDATETIME'),
			Id_Etapa = NULL,
			ds_seguimiento_etapa = '',
			bl_ManejaOpciones = 0,
			in_NumeroOpciones = NULL,
			bl_CerrarCotizacion = 0,
			in_OpcionSeleccionada = NULL,
			bl_grupos = 0,
			gk_sabre = '',
			id_Especialista = NULL,
			id_TipoFormaPagoProveedor = NULL,
			id_MedioReservacion = NULL,
			bl_bloqueada = 0,
			id_usuario_Bloqueo = NULL,
			ds_AlertaSolicitud = '',
			bl_comisiona = 0,
			ds_FormaDePago = ISNULL(C.Cotizacion.value('ds_FormaDePago[1]','VARCHAR(250)'),''),
			ds_records = '',
			bl_entregadoCliente = 0,
			dt_entregadoCliente = NULL,
			id_sys_entidades = 65,
			id_MonedaPagoDestino = NULL,
			id_FormaPagoDestino = NULL,
			ds_DocumentoPagoDestino = NULL,
			dt_CheckInPagoDestino = NULL,
			dt_CheckOutPagoDestino = NULL,
			bl_fechaPagoDestino = 0,
			ds_hotelTieneTiquete = NULL,
			ds_GDS = C.Cotizacion.value('ds_GDS[1]','VARCHAR(2)'),
			id_Evento = NULL,
			id_Cotizacion = NULL,
			bl_existe = CASE WHEN CC.id IS NOT NULL THEN 1 ELSE 0 END 
        FROM @xmlData.nodes('Cotizaciones/Cotizacion') AS C(Cotizacion)
		LEFT JOIN dbo.Sucursales S ON S.cd_codigo=C.Cotizacion.value('cd_sucursal[1]','VARCHAR(25)')
		LEFT JOIN dbo.Implantes I ON I.cd_codigo=C.Cotizacion.value('cd_implante[1]','VARCHAR(25)')
		LEFT JOIN dbo.Usuario U ON U.Login=C.Cotizacion.value('cd_usuario[1]','VARCHAR(250)')
		LEFT JOIN dbo.CLIENTES CL ON CL.IDCLIENTE = C.Cotizacion.value('cd_cliente_codigo[1]','VARCHAR(25)')
		LEFT JOIN dbo.TERCEROS TR ON TR.IDTERCERO = CL.IDTERCERO 
		LEFT JOIN dbo.Monedas_IATA M ON M.cd_codigo=C.Cotizacion.value('cd_monedas_IATA[1]','VARCHAR(3)')
		LEFT JOIN dbo.Tiqueteadores Tq ON Tq.cd_codigo=C.Cotizacion.value('cd_tiqueteador[1]','VARCHAR(6)')
		LEFT JOIN dbo.TipoVenta Tv ON Tv.cd_codigo=C.Cotizacion.value('cd_tipoventa[1]','VARCHAR(16)')
		LEFT JOIN dbo.Cotizacion CC ON CC.cd_consecutivo = C.Cotizacion.value('cd_consecutivo[1]','VARCHAR(25)')		 
		
		INSERT INTO @CotizacionServicios(
			id_TiposConceptFac ,
			id_ConceptoFacturacion ,
			id_TiposServicio ,
			id_Cotizacion ,
			id_fac_factura ,
			id_fac_remision,
			cd_proveedores ,
			ds_tiposervnm ,
			cd_prov_hotel,
			cd_prov_car,
			cd_prov_air,
			ds_destino ,
			ds_servicio ,
			ds_descrip,
			ds_paxname,
			ds_paxape,
			cd_paxtype,
			in_nacionalidad ,
			cd_voucher ,
			in_cantpax ,
			dt_llegada ,
			dt_salida ,
			cd_cencosto ,
			cd_auxiliar ,
			cd_item ,
			am_valorprov ,
			id_monedaprov ,
			ds_InfoAdicional ,
			id_carrental ,
			id_hoteles ,
			bl_anulado ,
			cd_tiquete ,
			cd_fuente_anul ,
			cd_serie_anul ,
			cd_consecutivo_anul ,
			id_usuario_anul,
			id_sucursal_anul,
			id_implante_anul,
			am_basecomisionable,
			am_porcomision ,
			cd_voucherPrefijo,
			bl_notdomicilionacional,
			Valor_Comision,
			Valor_Recaudo,
			dias_recaudo,
			ds_paxClasificacion,
			id_tipoplan,
			id_acomodacion ,
			in_dias,
			in_noches ,
			ds_records ,
			id_GrConcepto,
			in_diasSrv,
			in_nochesSrv ,
			Id_Especialista ,
			am_porcentaje_descuento ,
			am_valor_descuento ,
			ds_motivo_descuento ,
			id_cargosdesc_descuento,
			in_NumeroOpcion ,
			dt_FechaSalidaSrv ,
			dt_FechaLlegadaSrv ,
			cd_localizador ,
			cd_voucherpax ,
			am_basecomisionableprov ,
			am_porcomisionprov ,
			cd_NumeFac ,
			dt_VenceFac ,
			id_AcomodacionSrv ,
			id_TipoPlanSrv ,
			in_habitaciones ,
			in_habitacionesSrv ,
			cd_Consecutivo_VariablesAdicionales ,
			cd_confirmacion,
			ds_confirmadopor,
			cd_paxidentificacion,
			bl_politicaCancelacion,
			dt_politicaCancelacion,
			id_tipoHabitacion,
			id_fac_facturaComision,
			id_fac_remisionComision,
			id_TarjetaAsistencia,
			id_Regiones,
			Iden_GDS,
			id_sys_entidades,
			ds_TipoAuto,
			ds_Origen,
			ds_DirOrigen ,
			ds_DirDestino,
			ds_TipoTarifa,
			am_ValorUSD,
			ds_NoVuelo ,
			ds_Vehiculo,
			ds_Placa ,
			ds_CategoriaVehiculo ,
			ds_NombreConductor ,
			ds_telefono ,
			ds_IdiomaConductor ,
			id_MonedaSrv ,
			id_TipoServicio ,
			id_Aerolinea ,
			in_EdadPax,
			am_PorFacParcial,
			ds_GDS,
			dt_fechaficheroBBVA,
			bl_tiquete,
			am_basedescuento,
			am_pordescuento,
			id_CotizacionServicios_Depende,
			id_CotizacionServicios,
			cd_Cotizacion
		 )
		 SELECT
			id_TiposConceptFac = ISNULL(CF.id_TiposConceptoFacturacion,2),
			id_ConceptoFacturacion = ISNULL(CF.id,3),
			id_TiposServicio=ISNULL(TS.id,9) ,
			id_Cotizacion=NULL ,
			id_fac_factura=NULL ,
			id_fac_remision=NULL,
			cd_proveedores=ISNULL(C.CotizacionServicios.value('cd_proveedores[1]','VARCHAR(25)'),'') ,
			ds_tiposervnm=ISNULL(C.CotizacionServicios.value('ds_tiposervnm[1]','VARCHAR(25)'),'') ,
			cd_prov_hotel=ISNULL(C.CotizacionServicios.value('cd_prov_hotel[1]','VARCHAR(25)'),'') ,
			cd_prov_car=ISNULL(C.CotizacionServicios.value('cd_prov_car[1]','VARCHAR(25)'),'') ,
			cd_prov_air=ISNULL(C.CotizacionServicios.value('cd_prov_air[1]','VARCHAR(25)'),'') ,
			ds_destino=ISNULL(C.CotizacionServicios.value('ds_destino[1]','VARCHAR(25)'),'') ,
			ds_servicio=ISNULL(C.CotizacionServicios.value('ds_servicio[1]','VARCHAR(25)'),'') ,
			ds_descrip=ISNULL(C.CotizacionServicios.value('ds_descrip[1]','VARCHAR(25)'),'') ,
			ds_paxname=ISNULL(C.CotizacionServicios.value('ds_paxname[1]','VARCHAR(25)'),'') ,
			ds_paxape=ISNULL(C.CotizacionServicios.value('ds_paxape[1]','VARCHAR(25)'),'') ,
			cd_paxtype=SUBSTRING(ISNULL(C.CotizacionServicios.value('cd_paxtype[1]','VARCHAR(25)'),''), 1, 3) ,
			in_nacionalidad=ISNULL(C.CotizacionServicios.value('in_nacionalidad[1]','INT'),1) ,
			cd_voucher=ISNULL(C.CotizacionServicios.value('cd_voucher[1]','VARCHAR(25)'),'') ,
			in_cantpax=ISNULL(C.CotizacionServicios.value('in_cantpax[1]','INT'),1) ,
			dt_llegada=ISNULL(C.CotizacionServicios.value('dt_llegada[1]','SMALLDATETIME'),'19000101'),
			dt_salida=ISNULL(C.CotizacionServicios.value('dt_salida[1]','SMALLDATETIME'),'19000101'),
			cd_cencosto=ISNULL(C.CotizacionServicios.value('cd_cencosto[1]','VARCHAR(25)'),'')  ,
			cd_auxiliar=ISNULL(C.CotizacionServicios.value('cd_auxiliar[1]','VARCHAR(25)'),'')  ,
			cd_item =ISNULL(C.CotizacionServicios.value('cd_item[1]','VARCHAR(25)'),'') ,
			am_valorprov = 0,
			id_monedaprov = NULL,
			ds_InfoAdicional ='',
			id_carrental = NULL,
			id_hoteles = H.id,
			bl_anulado = 0,
			cd_tiquete ='',
			cd_fuente_anul ='',
			cd_serie_anul ='',
			cd_consecutivo_anul ='',
			id_usuario_anul=NULL,
			id_sucursal_anul=NULL,
			id_implante_anul=NULL,
			am_basecomisionable=ISNULL(C.CotizacionServicios.value('am_basecomisionable[1]','MONEY'),0) ,
			am_porcomision=ISNULL(C.CotizacionServicios.value('am_porcomision[1]','MONEY'),0) ,
			cd_voucherPrefijo='',
			bl_notdomicilionacional=0,
			Valor_Comision=ISNULL(C.CotizacionServicios.value('valor_comision[1]','MONEY'),0) ,
			Valor_Recaudo=0,
			dias_recaudo=0,
			ds_paxClasificacion=SUBSTRING(ISNULL(C.CotizacionServicios.value('ds_paxclasificacion[1]','VARCHAR(25)'),''), 1, 7) ,
			id_tipoplan=NULL,
			id_acomodacion=NULL ,
			in_dias=ISNULL(C.CotizacionServicios.value('in_dias[1]','INT'),1),
			in_noches=ISNULL(C.CotizacionServicios.value('in_noches[1]','INT'),1) ,
			ds_records =ISNULL(C.CotizacionServicios.value('ds_records[1]','VARCHAR(25)'),'') ,
			id_GrConcepto=NULL,
			in_diasSrv=0,
			in_nochesSrv=0 ,
			Id_Especialista=NULL ,
			am_porcentaje_descuento=0 ,
			am_valor_descuento=0 ,
			ds_motivo_descuento='' ,
			id_cargosdesc_descuento=NULL,
			in_NumeroOpcion=0 ,
			dt_FechaSalidaSrv=GETDATE() ,
			dt_FechaLlegadaSrv=GETDATE() ,
			cd_localizador='' ,
			cd_voucherpax='' ,
			am_basecomisionableprov=0 ,
			am_porcomisionprov=0 ,
			cd_NumeFac='' ,
			dt_VenceFac=GETDATE() ,
			id_AcomodacionSrv=NULL ,
			id_TipoPlanSrv=NULL ,
			in_habitaciones=0 ,
			in_habitacionesSrv=0 ,
			cd_Consecutivo_VariablesAdicionales=ISNULL(C.CotizacionServicios.value('cd_consecutivo_variablesadicionales[1]','VARCHAR(25)'),'') ,
			cd_confirmacion='',
			ds_confirmadopor='',
			cd_paxidentificacion='',
			bl_politicaCancelacion=0,
			dt_politicaCancelacion=NULL,
			id_tipoHabitacion=NULL,
			id_fac_facturaComision=NULL,
			id_fac_remisionComision=NULL,
			id_TarjetaAsistencia=NULL,
			id_Regiones=NULL,
			Iden_GDS=6,
			id_sys_entidades=35,
			ds_TipoAuto='',
			ds_Origen='',
			ds_DirOrigen='' ,
			ds_DirDestino='',
			ds_TipoTarifa='',
			am_ValorUSD=1,
			ds_NoVuelo='' ,
			ds_Vehiculo='',
			ds_Placa='' ,
			ds_CategoriaVehiculo='' ,
			ds_NombreConductor='' ,
			ds_telefono='' ,
			ds_IdiomaConductor='' ,
			id_MonedaSrv=NULL,
			id_TipoServicio=NULL ,
			id_Aerolinea=NULL ,
			in_EdadPax=0,
			am_PorFacParcial=0,
			ds_GDS='',
			dt_fechaficheroBBVA=GETDATE(),
			bl_tiquete=0,
			am_basedescuento=0,
			am_pordescuento=0,
			id_CotizacionServicios_Depende=NULL,
			id_CotizacionServicios=NULL,
			cd_Cotizacion = ISNULL(C.CotizacionServicios.value('cd_cotizacion[1]','VARCHAR(25)'),'') 
		 FROM @xmlData.nodes('Cotizaciones/Cotizacion/CotizacionServicios') AS C(CotizacionServicios)
		 LEFT JOIN dbo.ConceptoFacturacion CF ON CF.cd_codigo=C.CotizacionServicios.value('cd_conceptofacturacion[1]','VARCHAR(25)')
		 LEFT JOIN dbo.TiposServicios TS ON TS.cd_codigo=C.CotizacionServicios.value('cd_tiposservicio[1]','VARCHAR(25)')
		 LEFT JOIN dbo.Hoteles H ON H.cd_codigo=C.CotizacionServicios.value('cd_hoteles[1]','VARCHAR(25)')
        
		INSERT INTO @CotizacionServicios_PaxAdicional(
			id_Cotizacion,
			id_CotizacionServicios,
			ds_paxape,
			ds_paxname,
			ds_paxprefix,
			ds_paxClasificacion,
			cd_voucherpax,
			cd_paxidentificacion,
			in_edad,
			cd_tiquete,
			cd_Cotizacion,
			cd_CotizacionServicios
		)
		SELECT
			id_Cotizacion=NULL,
			id_CotizacionServicios=NULL,
			ds_paxape=ISNULL(C.CotizacionServicios_PaxAdicional.value('ds_paxape[1]','VARCHAR(30)'),''),
			ds_paxname=ISNULL(C.CotizacionServicios_PaxAdicional.value('ds_paxname[1]','VARCHAR(30)'),''),
			ds_paxprefix=ISNULL(C.CotizacionServicios_PaxAdicional.value('ds_paxprefix[1]','VARCHAR(3)'),''),
			ds_paxClasificacion=ISNULL(C.CotizacionServicios_PaxAdicional.value('ds_paxClasificacion[1]','VARCHAR(7)'),''),
			cd_voucherpax=ISNULL(C.CotizacionServicios_PaxAdicional.value('cd_voucherpax[1]','VARCHAR(25)'),''),
			cd_paxidentificacion=ISNULL(C.CotizacionServicios_PaxAdicional.value('cd_tiquete[1]','VARCHAR(25)'),''),
			in_edad=ISNULL(C.CotizacionServicios_PaxAdicional.value('in_edad[1]','INT'),''),
			cd_tiquete=ISNULL(C.CotizacionServicios_PaxAdicional.value('cd_tiquete[1]','VARCHAR(11)'),''),
			cd_Cotizacion=ISNULL(C.CotizacionServicios_PaxAdicional.value('cd_cotizacion[1]','VARCHAR(25)'),''),
			cd_CotizacionServicios=ISNULL(C.CotizacionServicios_PaxAdicional.value('cd_cotizacionservicios[1]','VARCHAR(25)'),'') 
		FROM @xmlData.nodes('Cotizaciones/Cotizacion/CotizacionServicios/CotizacionServicios_PaxAdicional') AS C(CotizacionServicios_PaxAdicional)	
		
		INSERT INTO @CotizacionCargos(
			id_CotizacionServicios,
			id_cargosdesc,
			ds_cargonm,
			bl_noshow,
			am_contado ,
			am_credito ,
			am_contado_ME ,
			am_credito_ME ,
			id_CotizacionCargos,
			cd_CotizacionCargos,
			cd_Cotizacion,
			cd_CotizacionServicios
		 )
		 SELECT 
			id_CotizacionServicios=NULL,
			id_cargosdesc=CD.id,
			ds_cargonm=ISNULL(C.CotizacionCargos.value('ds_cargonm[1]','VARCHAR(50)'),''),
			bl_noshow=ISNULL(C.CotizacionCargos.value('bl_noshow[1]','INT'),''),
			am_contado=ISNULL(C.CotizacionCargos.value('am_contado[1]','MONEY'),''),
			am_credito=ISNULL(C.CotizacionCargos.value('am_credito[1]','MONEY'),''),
			am_contado_ME=ISNULL(C.CotizacionCargos.value('am_contado_ME[1]','MONEY'),''),
			am_credito_ME=ISNULL(C.CotizacionCargos.value('am_credito_ME[1]','MONEY'),''),
			id_CotizacionCargos=NULL,
			cd_CotizacionCargos = ISNULL(C.CotizacionCargos.value('cd_cotizacioncargos[1]','VARCHAR(25)'),''),
			cd_Cotizacion=ISNULL(C.CotizacionCargos.value('cd_cotizacion[1]','VARCHAR(25)'),''),
			cd_CotizacionServicios=ISNULL(C.CotizacionCargos.value('cd_cotizacionservicios[1]','VARCHAR(25)'),'') 
		 FROM @xmlData.nodes('Cotizaciones/Cotizacion/CotizacionServicios/CotizacionCargos') AS C(CotizacionCargos)
		 LEFT JOIN dbo.CargosDesc CD ON CD.cd_codigo=ISNULL(C.CotizacionCargos.value('cd_cargosdesc[1]','VARCHAR(3)'),'') 

		INSERT INTO @CotizacionImpuestos(
			id_CotizacionCargos,
			id_ImpRet,
			ds_Impas,
			cd_impcta,
			am_porcentaje,
			bl_contabilizar,
			am_contado,
			am_credito,
			am_contado_ME,
			am_credito_ME,
			cd_CotizacionImpuestos,
			cd_CotizacionCargos,
			cd_Cotizacion,
			cd_CotizacionServicios
		)
		SELECT
			id_CotizacionCargos=NULL,
			id_ImpRet=IR.id,
			ds_Impas= ISNULL(C.CotizacionImpuestos.value('ds_impas[1]','VARCHAR(16)'),''),
			cd_impcta= ISNULL(C.CotizacionImpuestos.value('cd_impcta[1]','VARCHAR(16)'),''),
			am_porcentaje=ISNULL(C.CotizacionImpuestos.value('am_porcentaje[1]','MONEY'),0),
			bl_contabilizar=ISNULL(C.CotizacionImpuestos.value('bl_contabilizar[1]','INT'),0),
			am_contado=ISNULL(C.CotizacionImpuestos.value('am_contado[1]','MONEY'),0),
			am_credito=ISNULL(C.CotizacionImpuestos.value('am_credito[1]','MONEY'),0),
			am_contado_ME=ISNULL(C.CotizacionImpuestos.value('am_contado_ME[1]','MONEY'),0),
			am_credito_ME=ISNULL(C.CotizacionImpuestos.value('am_credito_ME[1]','MONEY'),0),
			cd_CotizacionImpuestos = ISNULL(C.CotizacionImpuestos.value('cd_cotizacionimpuestos[1]','VARCHAR(25)'),''),
			cd_CotizacionCargos = ISNULL(C.CotizacionImpuestos.value('cd_cotizacioncargos[1]','VARCHAR(25)'),''),
			cd_Cotizacion=ISNULL(C.CotizacionImpuestos.value('cd_cotizacion[1]','VARCHAR(25)'),''),
			cd_CotizacionServicios=ISNULL(C.CotizacionImpuestos.value('cd_cotizacionservicios[1]','VARCHAR(25)'),'')
		FROM @xmlData.nodes('Cotizaciones/Cotizacion/CotizacionServicios/CotizacionImpuestos') AS C(CotizacionImpuestos)
		LEFT JOIN dbo.ImpRet IR ON IR.cd_codigo=ISNULL(C.CotizacionImpuestos.value('cd_impret[1]','VARCHAR(3)'),'') 

		INSERT INTO @VariableDatosMaestro(
			IDEN_Maestro ,
			IDEN_Variable ,
			CodigoMaestro ,
			ValorNumerico ,
			ValorFecha ,
			ValorVarchar 
		 )
		 SELECT
			IDEN_Maestro=M.IDEN ,
			IDEN_Variable=V.IDEN ,
			CodigoMaestro=ISNULL(C.CotizacionServicios_VariableAdicional.value('cd_cotizacionservicios[1]','VARCHAR(50)'),'') ,
			ValorNumerico=NULL ,
			ValorFecha=NULL ,
			ValorVarchar=ISNULL(C.CotizacionServicios_VariableAdicional.value('ds_valor[1]','VARCHAR(500)'),'') 
		 FROM @xmlData.nodes('Cotizaciones/Cotizacion/CotizacionServicios/CotizacionServicios_VariableAdicional') AS C(CotizacionServicios_VariableAdicional)
		 LEFT JOIN dbo.VariableDefinicion V ON V.Nombre = ISNULL(C.CotizacionServicios_VariableAdicional.value('cd_codigo[1]','VARCHAR(25)'),'')
		 LEFT JOIN dbo.VariableDefinicionMaestro M ON M.Codigo = ISNULL(C.CotizacionServicios_VariableAdicional.value('ds_maestro[1]','VARCHAR(30)'),'')
		 
		 INSERT INTO @Fac_Servicios_TiposFacturacionHoteles (
			cd_Cotizacion,
			cd_CotizacionServicios,
			cd_TiposFacturacionHoteles,
			cd_cargosdesc,
			id_Fac_Servicios,
			id_CotizacionServicios,
			Id_TiposFacturacionHoteles,
			in_cantidad,
			am_valor,
			am_contado,
			am_credito,
			Id_Cotizacion_Solicitud,
			id_cargosdesc,
			ds_cargonm
		)
		SELECT cd_Cotizacion=ISNULL(C.TiposFacturacionHoteles.value('cd_cotizacion[1]','VARCHAR(25)'),''),
			   cd_CotizacionServicios=ISNULL(C.TiposFacturacionHoteles.value('cd_cotizacionservicios[1]','VARCHAR(25)'),''),
			   cd_TiposFacturacionHoteles=ISNULL(C.TiposFacturacionHoteles.value('cd_tiposfacturacionhoteles[1]','VARCHAR(25)'),''),
			   cd_cargosdesc=ISNULL(C.TiposFacturacionHoteles.value('cd_cargosdesc[1]','VARCHAR(25)'),'TAR'),
			   id_Fac_Servicios=NULL,
			   id_CotizacionServicios=NULL,
			   Id_TiposFacturacionHoteles=ISNULL(TF.id,5),
			   in_cantidad=ISNULL(C.TiposFacturacionHoteles.value('in_cantidad[1]','INT'),1),
			   am_valor=ISNULL(C.TiposFacturacionHoteles.value('am_valor[1]','MONEY'),0),
			   am_contado=ISNULL(C.TiposFacturacionHoteles.value('am_contado[1]','MONEY'),0),
			   am_credito=ISNULL(C.TiposFacturacionHoteles.value('am_credito[1]','MONEY'),0),
			   Id_Cotizacion_Solicitud=NULL,
			   id_cargosdesc=ISNULL(CD.id,1),
			   ds_cargonm=ISNULL(CD.ds_nombre,'Tarifa')
		FROM @xmlData.nodes('Cotizaciones/Cotizacion/CotizacionServicios/Fac_Servicios_TiposFacturacionHoteles') AS C(TiposFacturacionHoteles)
		LEFT JOIN dbo.TiposFacturacionHoteles TF ON TF.cd_codigo=ISNULL(C.TiposFacturacionHoteles.value('cd_tiposfacturacionhotel[1]','VARCHAR(3)'),'') 
		LEFT JOIN dbo.CargosDesc CD ON CD.cd_codigo=ISNULL(C.TiposFacturacionHoteles.value('cd_cargosdesc[1]','VARCHAR(3)'),'') 

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
		LEFT JOIN dbo.Hoteles H ON H.cd_codigo=ISNULL(C.CotizacionServicios_TipoProv.value('cd_proveedores[1]','VARCHAR(25)'),'')
		
		-- Insert (cd_consecutivo automático)
        INSERT INTO dbo.Cotizacion(
				id_sucursal,
				id_implante,
				cd_consecutivo,
				id_usuario,
				dt_fechacont,
				id_usuarioAct,  
				dt_fechaAct,
				dt_vence, 
				cd_tercero_codigo,
				ds_tercero_nombre,
				cd_cliente_codigo,
				ds_cliente_nombre,
				ds_cliente_dir,
				ds_cliente_ciudad,
				ds_cliente_tel,
				ds_cliente_dirdesp,
				ds_cliente_email,
				ds_cliente_contacto,
				ds_cliente_contacto_email,
				id_monedas_IATA,
				am_tcambio,
				cd_vendedor,
				id_tiqueteador,
				am_tcambiousd,
				id_tipoventa,
				ds_observacion,
				ds_Campo_libre1,
				ds_Campo_libre2,
				in_estado,
				bl_ManejaOpciones,
				in_NumeroOpciones,
				bl_CerrarCotizacion,
				in_OpcionSeleccionada,
				bl_grupos,
				id_Especialista,
				id_TipoFormaPagoProveedor,
				id_MedioReservacion,
				bl_comisiona,
				ds_alertasolicitud	,
				ds_FormaDePago ,
				bl_entregadoCliente,
				dt_entregadoCliente,
				id_sys_entidades, 
				id_MonedaPagoDestino,	
				id_FormaPagoDestino	,
				ds_DocumentoPagoDestino,
				BL_fechaPagoDestino,
				dt_CheckInPagoDestino,	
				dt_CheckOutPagoDestino,
				ds_hotelTieneTiquete, 
				ds_GDS, 
				id_evento
		)
		SELECT id_sucursal,
				id_implante,
				cd_consecutivo,
				id_usuario,
				dt_fechacont,
				id_usuarioAct,  
				dt_fechaAct,
				dt_vence, 
				cd_tercero_codigo,
				ds_tercero_nombre,
				cd_cliente_codigo,
				ds_cliente_nombre,
				ds_cliente_dir,
				ds_cliente_ciudad,
				ds_cliente_tel,
				ds_cliente_dirdesp,
				ds_cliente_email,
				ds_cliente_contacto,
				ds_cliente_contacto_email,
				id_monedas_IATA,
				am_tcambio,
				cd_vendedor,
				id_tiqueteador,
				am_tcambiousd,
				id_tipoventa,
				ds_observacion,
				ds_Campo_libre1,
				ds_Campo_libre2,
				in_estado,
				bl_ManejaOpciones,
				in_NumeroOpciones,
				bl_CerrarCotizacion,
				in_OpcionSeleccionada,
				bl_grupos,
				id_Especialista,
				id_TipoFormaPagoProveedor,
				id_MedioReservacion,
				bl_comisiona,
				ds_alertasolicitud	,
				ds_FormaDePago ,
				bl_entregadoCliente,
				dt_entregadoCliente,
				id_sys_entidades, 
				id_MonedaPagoDestino,	
				id_FormaPagoDestino	,
				ds_DocumentoPagoDestino,
				BL_fechaPagoDestino,
				dt_CheckInPagoDestino,	
				dt_CheckOutPagoDestino,
				ds_hotelTieneTiquete, 
				ds_GDS, 	
				id_evento
		FROM @Cotizacion
		WHERE bl_existe=0

		UPDATE CC
		SET CC.id_cotizacion=C.id
		FROM @Cotizacion CC
		INNER JOIN dbo.Cotizacion C ON C.cd_consecutivo=CC.cd_consecutivo

		UPDATE CS
		SET CS.id_cotizacion=C.id
		FROM @CotizacionServicios CS
		INNER JOIN dbo.Cotizacion C ON C.cd_consecutivo=CS.cd_Cotizacion
		
		INSERT INTO CotizacionServicios(
			id_TiposConceptFac,
			id_ConceptoFacturacion,
			id_TiposServicio,
			id_Cotizacion,
			id_fac_factura,
			id_fac_remision,
			cd_proveedores,
			ds_tiposervnm ,
			cd_prov_hotel,
			cd_prov_car,
			cd_prov_air,
			ds_destino ,
			ds_servicio,
			ds_descrip ,
			ds_paxname,
			ds_paxape,
			cd_paxtype ,
			in_nacionalidad,
			cd_voucher,
			in_cantpax ,
			dt_llegada ,
			dt_salida ,
			cd_cencosto ,
			cd_auxiliar,
			cd_item ,
			am_valorprov,
			id_monedaprov,
			ds_InfoAdicional,
			id_carrental,
			id_hoteles,
			bl_anulado ,
			cd_tiquete ,
			cd_fuente_anul ,
			cd_serie_anul ,
			cd_consecutivo_anul,
			id_usuario_anul,
			id_sucursal_anul,
			id_implante_anul,
			am_basecomisionable,
			am_porcomision,
			cd_voucherPrefijo,
			bl_notdomicilionacional,
			Valor_Comision,
			Valor_Recaudo,
			dias_recaudo,
			ds_paxClasificacion,
			id_tipoplan,
			id_acomodacion,
			in_dias,
			in_noches,
			ds_records,
			id_GrConcepto,
			in_diasSrv,
			in_nochesSrv,
			Id_Especialista,
			am_porcentaje_descuento,
			am_valor_descuento,
			ds_motivo_descuento,
			id_cargosdesc_descuento,
			in_NumeroOpcion,
			dt_FechaSalidaSrv,
			dt_FechaLlegadaSrv,
			cd_localizador,
			cd_voucherpax,
			am_basecomisionableprov,
			am_porcomisionprov,
			cd_NumeFac,
			dt_VenceFac,
			id_AcomodacionSrv,
			id_TipoPlanSrv,
			in_habitaciones,
			in_habitacionesSrv,
			cd_Consecutivo_VariablesAdicionales,
			cd_confirmacion ,
			ds_confirmadopor ,
			cd_paxidentificacion ,
			bl_politicaCancelacion ,
			dt_politicaCancelacion ,
			id_tipoHabitacion ,
			id_fac_facturaComision,
			id_fac_remisionComision,
			id_TarjetaAsistencia ,
			id_Regiones,
			Iden_GDS,
			id_sys_entidades,
			ds_TipoAuto,
			ds_Origen,
			ds_DirOrigen,
			ds_DirDestino,
			ds_TipoTarifa,
			am_ValorUSD,
			ds_NoVuelo,
			ds_Vehiculo,
			ds_Placa,
			ds_CategoriaVehiculo,
			ds_NombreConductor,
			ds_telefono,
			ds_IdiomaConductor,
			id_MonedaSrv,
			id_TipoServicio,
			id_Aerolinea,
			in_EdadPax,
			am_PorFacParcial,
			ds_GDS,
			dt_fechaficheroBBVA,
			bl_tiquete ,
			am_basedescuento,
			am_pordescuento,
			id_CotizacionServicios_Depende
		)
		SELECT
			cs.id_TiposConceptFac,
			cs.id_ConceptoFacturacion,
			cs.id_TiposServicio,
			cs.id_Cotizacion,
			cs.id_fac_factura,
			cs.id_fac_remision,
			cs.cd_proveedores,
			cs.ds_tiposervnm ,
			cs.cd_prov_hotel,
			cs.cd_prov_car,
			cs.cd_prov_air,
			cs.ds_destino ,
			cs.ds_servicio,
			cs.ds_descrip ,
			cs.ds_paxname,
			cs.ds_paxape,
			cs.cd_paxtype ,
			cs.in_nacionalidad,
			cs.cd_voucher,
			cs.in_cantpax ,
			cs.dt_llegada ,
			cs.dt_salida ,
			cs.cd_cencosto ,
			cs.cd_auxiliar,
			cs.cd_item ,
			cs.am_valorprov,
			cs.id_monedaprov,
			cs.ds_InfoAdicional,
			cs.id_carrental,
			cs.id_hoteles,
			cs.bl_anulado ,
			cs.cd_tiquete ,
			cs.cd_fuente_anul ,
			cs.cd_serie_anul ,
			cs.cd_consecutivo_anul,
			cs.id_usuario_anul,
			cs.id_sucursal_anul,
			cs.id_implante_anul,
			cs.am_basecomisionable,
			cs.am_porcomision,
			cs.cd_voucherPrefijo,
			cs.bl_notdomicilionacional,
			cs.Valor_Comision,
			cs.Valor_Recaudo,
			cs.dias_recaudo,
			cs.ds_paxClasificacion,
			cs.id_tipoplan,
			cs.id_acomodacion,
			cs.in_dias,
			cs.in_noches,
			cs.ds_records,
			cs.id_GrConcepto,
			cs.in_diasSrv,
			cs.in_nochesSrv,
			cs.Id_Especialista,
			cs.am_porcentaje_descuento,
			cs.am_valor_descuento,
			cs.ds_motivo_descuento,
			cs.id_cargosdesc_descuento,
			cs.in_NumeroOpcion,
			cs.dt_FechaSalidaSrv,
			cs.dt_FechaLlegadaSrv,
			cs.cd_localizador,
			cs.cd_voucherpax,
			cs.am_basecomisionableprov,
			cs.am_porcomisionprov,
			cs.cd_NumeFac,
			cs.dt_VenceFac,
			cs.id_AcomodacionSrv,
			cs.id_TipoPlanSrv,
			cs.in_habitaciones,
			cs.in_habitacionesSrv,
			cs.cd_Consecutivo_VariablesAdicionales,
			cs.cd_confirmacion ,
			cs.ds_confirmadopor ,
			cs.cd_paxidentificacion ,
			cs.bl_politicaCancelacion ,
			cs.dt_politicaCancelacion ,
			cs.id_tipoHabitacion ,
			cs.id_fac_facturaComision,
			cs.id_fac_remisionComision,
			cs.id_TarjetaAsistencia ,
			cs.id_Regiones,
			cs.Iden_GDS,
			cs.id_sys_entidades,
			cs.ds_TipoAuto,
			cs.ds_Origen,
			cs.ds_DirOrigen,
			cs.ds_DirDestino,
			cs.ds_TipoTarifa,
			cs.am_ValorUSD,
			cs.ds_NoVuelo,
			cs.ds_Vehiculo,
			cs.ds_Placa,
			cs.ds_CategoriaVehiculo,
			cs.ds_NombreConductor,
			cs.ds_telefono,
			cs.ds_IdiomaConductor,
			cs.id_MonedaSrv,
			cs.id_TipoServicio,
			cs.id_Aerolinea,
			cs.in_EdadPax,
			cs.am_PorFacParcial,
			cs.ds_GDS,
			cs.dt_fechaficheroBBVA,
			cs.bl_tiquete ,
			cs.am_basedescuento,
			cs.am_pordescuento,
			cs.id_CotizacionServicios_Depende	
		FROM @CotizacionServicios cs
		INNER JOIN @Cotizacion c ON c.cd_consecutivo=cs.cd_Cotizacion AND c.bl_existe=0

		UPDATE CCS
		SET CCS.id_CotizacionServicios=CS.id
		FROM @CotizacionServicios CCS
		INNER JOIN dbo.CotizacionServicios CS ON CS.cd_Consecutivo_VariablesAdicionales=CCS.cd_Consecutivo_VariablesAdicionales

		UPDATE CSP
		SET CSP.id_Cotizacion=CS.id_Cotizacion,
			CSP.id_CotizacionServicios=CS.id
		FROM @CotizacionServicios_PaxAdicional CSP 
		INNER JOIN dbo.CotizacionServicios CS ON CS.cd_Consecutivo_VariablesAdicionales=CSP.cd_CotizacionServicios
		INNER JOIN @Cotizacion C ON C.cd_consecutivo = CSP.cd_Cotizacion AND bl_existe=0

		INSERT INTO dbo.CotizacionServicios_PaxAdicional(
			id_Cotizacion,
			id_CotizacionServicios,
			ds_paxape,
			ds_paxname,
			ds_paxprefix,
			ds_paxClasificacion,
			cd_voucherpax,
			cd_paxidentificacion,
			in_edad,
			cd_tiquete
		)
		SELECT
			id_Cotizacion,
			id_CotizacionServicios,
			ds_paxape,
			ds_paxname,
			ds_paxprefix,
			ds_paxClasificacion,
			cd_voucherpax,
			cd_paxidentificacion,
			in_edad,
			cd_tiquete
		FROM @CotizacionServicios_PaxAdicional
		WHERE id_CotizacionServicios IS NOT NULL 

		UPDATE CC
		SET CC.id_CotizacionServicios=CS.id
		FROM @CotizacionCargos CC
		INNER JOIN dbo.CotizacionServicios CS ON CS.cd_Consecutivo_VariablesAdicionales=CC.cd_CotizacionServicios
		INNER JOIN @Cotizacion C ON C.cd_consecutivo = CC.cd_Cotizacion AND bl_existe=0
		
		INSERT INTO dbo.CotizacionCargos(
			id_CotizacionServicios,
			id_cargosdesc,
			ds_cargonm,
			bl_noshow,
			am_contado,
			am_credito,
			am_contado_ME,
			am_credito_ME
		 )
		 SELECT
			id_CotizacionServicios,
			id_cargosdesc,
			ds_cargonm,
			bl_noshow,
			am_contado,
			am_credito,
			am_contado_ME,
			am_credito_ME
		 FROM @CotizacionCargos
		 WHERE id_CotizacionServicios IS NOT NULL 

		 --SELECT c.*
		 --FROM CotizacionCargos C
		 --INNER JOIN @CotizacionCargos CC ON CC.id_cargosdesc=C.id_cargosdesc AND CC.id_CotizacionServicios=C.id_CotizacionServicios

		 UPDATE CC
		 SET CC.id_CotizacionCargos=C.id
		 FROM @CotizacionCargos CC
		 INNER JOIN dbo.CotizacionCargos C ON C.id_cargosdesc=CC.id_cargosdesc AND C.id_CotizacionServicios=CC.id_CotizacionServicios
		 INNER JOIN @Cotizacion CT ON CT.cd_consecutivo = CC.cd_Cotizacion AND bl_existe=0
		 
		 --select  * from @CotizacionCargos
		 
		 UPDATE I
		 SET I.id_CotizacionCargos=C.id_CotizacionCargos
		 FROM @CotizacionImpuestos I
		 INNER JOIN @CotizacionCargos C ON C.cd_CotizacionCargos = I.cd_CotizacionCargos AND C.cd_CotizacionServicios=I.cd_CotizacionServicios
		 INNER JOIN @Cotizacion CT ON CT.cd_consecutivo = C.cd_Cotizacion AND bl_existe=0


		 INSERT INTO dbo.CotizacionImpuestos(
			id_CotizacionCargos,
			id_ImpRet,
			ds_Impas,
			cd_impcta,
			am_porcentaje,
			bl_contabilizar,
			am_contado,
			am_credito,
			am_contado_ME,
			am_credito_ME
		)
		SELECT 
			id_CotizacionCargos,
			id_ImpRet,
			ds_Impas,
			cd_impcta,
			am_porcentaje,
			bl_contabilizar,
			am_contado,
			am_credito,
			am_contado_ME,
			am_credito_ME
		FROM @CotizacionImpuestos
		WHERE id_CotizacionCargos IS NOT NULL 
		
		INSERT INTO dbo.VariableDatosMaestro(
			IDEN_Maestro,
			IDEN_Variable,
			CodigoMaestro,
			ValorNumerico,
			ValorFecha,
			ValorVarchar
		 )
		 SELECT 
			V.IDEN_Maestro,
			V.IDEN_Variable,
			V.CodigoMaestro,
			V.ValorNumerico,
			V.ValorFecha,
			V.ValorVarchar
		 FROM @VariableDatosMaestro V
		 INNER JOIN @CotizacionServicios CS ON CS.cd_Consecutivo_VariablesAdicionales = V.CodigoMaestro
		 INNER JOIN @Cotizacion C ON C.cd_consecutivo = CS.cd_Cotizacion AND bl_existe=0
		 GROUP BY V.IDEN_Maestro,
				  V.IDEN_Variable,
				  V.CodigoMaestro,
				  V.ValorNumerico,
				  V.ValorFecha,
				  V.ValorVarchar
		
		UPDATE TF
		SET TF.id_CotizacionServicios=CS.id_CotizacionServicios
		FROM @Fac_Servicios_TiposFacturacionHoteles TF
		INNER JOIN @CotizacionServicios CS ON CS.cd_Consecutivo_VariablesAdicionales = TF.cd_CotizacionServicios
		INNER JOIN @Cotizacion C ON C.cd_consecutivo = CS.cd_Cotizacion AND C.bl_existe=0

		INSERT INTO dbo.Fac_Servicios_TiposFacturacionHoteles(
			id_Fac_Servicios,
			id_CotizacionServicios,
			Id_TiposFacturacionHoteles,
			in_cantidad,
			am_valor,
			am_contado,
			am_credito,
			Id_Cotizacion_Solicitud,
			id_cargosdesc,
			ds_cargonm
		)
		SELECT id_Fac_Servicios,
			   id_CotizacionServicios,
			   Id_TiposFacturacionHoteles,
			   in_cantidad,
			   am_valor,
			   am_contado,
			   am_credito,
			   Id_Cotizacion_Solicitud,
			   id_cargosdesc,
			   ds_cargonm
		FROM @Fac_Servicios_TiposFacturacionHoteles
		WHERE Id_TiposFacturacionHoteles IS NOT NULL


		UPDATE TP
		SET TP.id_CotizacionServicios=CS.id
		FROM @CotizacionServicios_TipoProv TP
		INNER JOIN dbo.CotizacionServicios CS ON CS.cd_Consecutivo_VariablesAdicionales = TP.cd_CotizacionServicios

		
		INSERT INTO dbo.CotizacionServicios_TipoProv(
			id_CotizacionServicios,
			id_TipoProveedores,
			cd_TipoProveedores,
			ds_TipoProveedores,
			cd_proveedores,
			ds_proveedores
		)
		SELECT 
			id_CotizacionServicios,
			id_TipoProveedores,
			cd_TipoProveedores,
			ds_TipoProveedores,
			cd_proveedores,
			ds_proveedores
		FROM @CotizacionServicios_TipoProv
		WHERE ISNULL(cd_proveedores,'') <> ''  

		-- Parsear formas de pago desde el XML
		INSERT INTO @CotizacionServiciosFormasPago(
			cd_Cotizacion,
			cd_CotizacionServicios,
			cd_codigo,
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
			FP.FormasPago.value('cd_cotizacion[1]', 'VARCHAR(25)') AS cd_Cotizacion,
			FP.FormasPago.value('cd_cotizacionservicios[1]', 'VARCHAR(25)') AS cd_CotizacionServicios,
			ISNULL(FP.FormasPago.value('cd_codigo[1]', 'VARCHAR(3)'), '') AS cd_codigo,
			ISNULL(FP.FormasPago.value('ds_fpnm[1]', 'VARCHAR(50)'), '') AS ds_FPnm,
			ISNULL(FP.FormasPago.value('bl_fprepresenta[1]', 'BIT'), 0) AS bl_FPrepresenta,
			ISNULL(FP.FormasPago.value('ds_tcnumber[1]', 'CHAR(16)'), '') AS ds_tcnumber,
			ISNULL(FP.FormasPago.value('ds_tcvoucher[1]', 'VARCHAR(25)'), '') AS ds_tcvoucher,
			ISNULL(FP.FormasPago.value('ds_referencia[1]', 'VARCHAR(50)'), '') AS ds_referencia,
			ISNULL(FP.FormasPago.value('am_valor[1]', 'MONEY'), 0) AS am_valor,
			ISNULL(FP.FormasPago.value('ds_tcexp[1]', 'VARCHAR(7)'), '') AS ds_tcexp,
			ISNULL(FP.FormasPago.value('am_valor_me[1]', 'MONEY'), 0) AS am_valor_ME,
			ISNULL(FP.FormasPago.value('ds_tcautorizacion[1]', 'VARCHAR(25)'), '') AS ds_tcautorizacion
		FROM @xmlData.nodes('Cotizaciones/Cotizacion/CotizacionServicios/CotizacionServiciosFormasPago') AS FP(FormasPago);

		-- Resolver FKs de formas de pago
		-- ds_FPnm viene con el cd_codigo desde Postgres; se obtiene id y nombre real desde dbo.FormasPago
		UPDATE FP
		SET FP.id_CotizacionServicios = CS.id,
		    FP.Id_Cotizacion          = CS.Id_Cotizacion,
		    FP.id_FormasPago          = ISNULL(FPM.id, 1),
		    FP.ds_FPnm                = ISNULL(FPM.ds_nombre, FP.ds_FPnm)
		FROM @CotizacionServiciosFormasPago FP
		LEFT JOIN dbo.FormasPago FPM ON FPM.cd_codigo = FP.cd_codigo
		INNER JOIN dbo.CotizacionServicios CS ON CS.cd_Consecutivo_VariablesAdicionales = FP.cd_CotizacionServicios
		INNER JOIN @Cotizacion C ON C.cd_consecutivo = FP.cd_Cotizacion AND C.bl_existe=0

		-- Insertar en tabla real
		INSERT INTO dbo.CotizacionServiciosFormasPago(
			id_CotizacionServicios,
			Id_Cotizacion,
			id_FormasPago,
			ds_FPnm,
			bl_FPrepresenta,
			id_TarjetasCredito,
			cd_tccode,
			ds_tcnumber,
			ds_tcvoucher,
			cd_idbanco,
			ds_cheque,
			ds_referencia,
			am_valor,
			ds_tcexp,
			ds_plaza,
			ds_Poliza,
			ds_PolAnexo,
			am_valor_ME,
			ds_tcautorizacion,
			in_tccuotas
		)
		SELECT
			id_CotizacionServicios,
			Id_Cotizacion,
			id_FormasPago,
			ds_FPnm,
			bl_FPrepresenta,
			id_TarjetasCredito,
			cd_tccode,
			ds_tcnumber,
			ds_tcvoucher,
			cd_idbanco,
			ds_cheque,
			ds_referencia,
			am_valor,
			ds_tcexp,
			ds_plaza,
			ds_Poliza,
			ds_PolAnexo,
			am_valor_ME,
			ds_tcautorizacion,
			in_tccuotas
		FROM @CotizacionServiciosFormasPago
		WHERE id_CotizacionServicios IS NOT NULL

		--ROLLBACK TRANSACTION;
        COMMIT TRANSACTION;

		DECLARE @estado VARCHAR(8000)
		SET @estado=''
		SELECT @estado=@estado+CONVERT(VARCHAR(25),CONVERT(INT,REPLACE(ISNULL(cd_consecutivo,'0'),'Q',''))) + ':' + CASE WHEN id_Cotizacion IS NOT NULL THEN 'Enviado' ELSE 'Nuevo' END + '|'
		FROM @Cotizacion;
        -- Retorno mejorado: Lista resumida de lo procesado
        SELECT 
            cd_consecutivo AS Cotizacion,
            CASE 
                WHEN bl_existe = 1 THEN 'Ya existe en SQL Server'
                ELSE 'Creada exitosamente'
            END AS Estado,
            bl_existe,
            id_Cotizacion AS IdProcesado,
			@estado AS Estados
        FROM @Cotizacion;

		RETURN 0
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE 
            @ErrorMessage NVARCHAR(4000),
            @ErrorSeverity INT,
            @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

-- Archivo: spFacturacionesCrear.sql
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID('dbo.spFacturacionesCrear', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spFacturacionesCrear;
GO

CREATE PROCEDURE dbo.spFacturacionesCrear
(
    @xml VARCHAR(MAX)
)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT OFF;

    BEGIN TRY
        -- BEGIN TRANSACTION; -- Comentado para permitir transacciones individuales por factura

        DECLARE @xmlData XML;

        Declare @Error Int
	
		DECLARE @cd_fuente VARCHAR(2)
		DECLARE @cd_serie VARCHAR(2)
		DECLARE @cd_consecutivo VARCHAR(8)
		DECLARE @id_facturacion INT
		DECLARE @id_item INT
		DECLARE @in_tipoitem INT
		Declare @Iden Int
		Declare @Categoria varchar(50)
		Declare @Operacion varchar(500)
		Declare @Llave1 varchar(50)
		Declare @Llave2 varchar(50)
		Declare @Llave3 varchar(50)
		Declare @Llave4 varchar(50)
		Declare @transaccion_guid uniqueidentifier
		Declare @Estado varchar(50)
		Declare @UltimoMensaje varchar(1000)
		Declare @Procesado datetime
		Declare @id_facture INT

		Declare @Fecha datetime
		Declare @FechaCont datetime
		Declare @Intentos Int
		Declare @Minute_wait INT

		Declare @MsjErrorValidar Varchar(MAX)
		Declare @Mensaje_Error Varchar(500);

		Declare @cur_cd_sucursal VARCHAR(MAX)
		Declare @cur_cd_implante VARCHAR(MAX)
		Declare @cur_id_sucursal INT
		Declare @cur_id_implante INT

		Declare @ReservaFactura VARCHAR(100)
		Declare @ds_cliid CHAR(10)
		Declare @cd_cliente CHAR(10)
		Declare @ds_cliname VARCHAR(250)
		Declare @ds_clidir VARCHAR(250)
		Declare @ds_clicity VARCHAR(50)
		Declare @ds_clitel VARCHAR(25)
		Declare @ds_ClienteEmail VARCHAR(100)
		Declare @ds_moneda CHAR(3)
		Declare @cd_vendedor CHAR(3)
		Declare @cd_tiqueteador VARCHAR(6)
		Declare @am_TasaCambio MONEY
		Declare @cd_tipoventa VARCHAR(10)
		Declare @cd_licitacion INT
		Declare @ds_descripcion VARCHAR(500)
		Declare @ds_Observaciones VARCHAR(8000)
		Declare @ds_archivo VARCHAR(250)
		Declare @id_reserva INT
		Declare @cd_reserva VARCHAR(10)
		Declare @cd_sucursal CHAR(5)
		Declare @cd_implante CHAR(5)
		Declare @id_sucursal INT
		Declare @id_implante INT
		Declare @cd_bu VARCHAR(25) 

		Declare @id_monedas_iata INT
		Declare @id_tiqueteador INT
		Declare @id_tipoventa INT
		Declare @am_tcambiousd MONEY
		Declare @ValorFactura MONEY

		Declare @ds_impas_iva VARCHAR(50)
		Declare @cd_impcta_iva VARCHAR(16)
		Declare @am_porcentaje_iva NUMERIC(5,2)

		-- Variables to fetch item fields inside the cursor of a specific invoice
		Declare @item_Tipo VARCHAR(5)
		Declare @item_id_reserva INT
		Declare @item_iden_gds INT
		Declare @item_ds_aero_code CHAR(3)
		Declare @item_ds_tkt_number CHAR(10)
		Declare @item_in_nacionalidad TINYINT
		Declare @item_am_tarifa MONEY
		Declare @item_am_iva MONEY
		Declare @item_am_tua MONEY
		Declare @item_am_comb MONEY
		Declare @item_am_vat MONEY
		Declare @item_am_Comision MONEY
		Declare @item_ds_pax_firstnm VARCHAR(30)
		Declare @item_ds_pax_lastnm VARCHAR(30)
		Declare @item_ds_pax_prefix CHAR(3)
		Declare @item_cd_tourcode VARCHAR(25)
		Declare @item_NumTktConj INT
		Declare @item_cd_TipoTiquete CHAR(3)
		Declare @item_id_air INT
		Declare @item_ds_itinerario VARCHAR(250)
		Declare @item_cd_Ahorro CHAR(3)
		Declare @item_am_highfare MONEY
		Declare @item_am_lowfare MONEY
		Declare @item_ds_solicita VARCHAR(200)
		Declare @item_ds_lapsoviaje VARCHAR(50)
		Declare @item_cd_tktrevisado VARCHAR(14)
		Declare @item_cd_PasaportePax VARCHAR(25)
		Declare @item_am_PorFacParcial MONEY
		Declare @item_in_cantpax INT
		Declare @item_Id_Precompra INT
		Declare @item_cd_FormaPagoTAO VARCHAR(3)
		Declare @item_TarjetaCreditoTAO VARCHAR(4)
		Declare @item_NumeroTarjetaTAO VARCHAR(25)
		Declare @item_am_fptao MONEY
		Declare @item_am_tao MONEY
		Declare @item_am_ivatao MONEY
		Declare @item_Id_Srv INT
		Declare @item_cd_conceptofacturacion INT
		Declare @item_cd_tiposervicio INT
		Declare @item_cd_proveedores VARCHAR(25)
		Declare @item_ds_proveedores VARCHAR(250)
		Declare @item_cd_confirmation VARCHAR(25)
		Declare @item_dt_checkin SMALLDATETIME
		Declare @item_dt_checkout SMALLDATETIME
		Declare @item_cd_city VARCHAR(25)
		Declare @item_in_noches INT
		Declare @item_Servicio VARCHAR(123)
		Declare @item_Descrip VARCHAR(78)
		Declare @item_am_TarifaContado MONEY
		Declare @item_am_IvaContado MONEY
		Declare @item_am_TarifaCredito MONEY
		Declare @item_am_IvaCredito MONEY
		Declare @item_cd_centrocosto VARCHAR(50)
		Declare @item_cd_auxiliar VARCHAR(50)
		DECLARE @item_cd_item VARCHAR(50)
		Declare @item_cd_fp_OtrosItems VARCHAR(3)
		Declare @item_id_tipoproveedor INT
		Declare @item_cd_tipoproveedor VARCHAR(10)
		Declare @item_ds_tipoproveedor VARCHAR(100)
		Declare @item_Fecha_Salida SMALLDATETIME
		Declare @item_Fecha_Llegada SMALLDATETIME
		Declare @item_PNR VARCHAR(62)
		Declare @item_ds_itinerarioaerolinea VARCHAR(128)
		Declare @item_ds_tkt_prefix CHAR(3)
		Declare @item_bl_ahorro BIT
		Declare @item_cd_VencimientoTarjetaTAO CHAR(6)
		Declare @item_cd_NumeroPolizaTAO VARCHAR(50)
		Declare @item_cd_AnexoPolizaTAO VARCHAR(50)
		Declare @item_ds_AutorizacionTarjetaTAO VARCHAR(25)
		Declare @item_in_cuotasTarjetaTAO INT
		Declare @item_id_FormasPago INT
		Declare @item_id_TarjetasCredito INT
		Declare @item_am_fp1 MONEY
		Declare @item_ds_cc_code VARCHAR(2)
		Declare @item_ds_cc_number VARCHAR(25)
		Declare @item_ds_cc_vence VARCHAR(5)
		Declare @item_ds_cc_autorizacion VARCHAR(25)
		Declare @item_ds_cc_voucher VARCHAR(25)
		Declare @item_in_cc_cuotas INT
		Declare @item_am_fp2 MONEY
		Declare @item_ds_cc_code2 VARCHAR(2)
		Declare @item_ds_cc_number2 VARCHAR(25)
		Declare @item_ds_cc_vence2 VARCHAR(5)
		Declare @item_ds_cc_autorizacion2 VARCHAR(25)
		Declare @item_ds_cc_voucher2 VARCHAR(25)
		Declare @item_in_cc_cuotas2 INT
		Declare @item_cd_pax_CC VARCHAR(20)
		Declare @item_cd_destino VARCHAR(3)
		Declare @item_ds_clases VARCHAR(61)
		Declare @item_ds_Observaciones VARCHAR(8000)
		Declare @item_ds_fecha SMALLDATETIME
		Declare @SqlStmt NVARCHAR(MAX)

		Declare @LogResults TABLE (
			invoiceId INT,
			success INT,
			message VARCHAR(MAX)
		);

		Declare @ItemIndex INT
		Declare @ContadoRatio FLOAT
		Declare @TarifaSqlStmt NVARCHAR(MAX)
		Declare @TktSqlStmt NVARCHAR(MAX)
		Declare @TktItinSqlStmt NVARCHAR(MAX)
		Declare @TaoCargSqlStmt NVARCHAR(MAX)
		Declare @TaoFpSqlStmt NVARCHAR(MAX)
		Declare @TaoSqlStmt NVARCHAR(MAX)
		Declare @SrvCargSqlStmt NVARCHAR(MAX)
		Declare @SrvProvSqlStmt NVARCHAR(MAX)
		Declare @SrvPaxSqlStmt NVARCHAR(MAX)
		Declare @SrvHtlSqlStmt NVARCHAR(MAX)
		Declare @SrvImpuestosSqlStmt NVARCHAR(MAX)
		Declare @SrvFpSqlStmt NVARCHAR(MAX)
		Declare @SrvSqlStmt NVARCHAR(MAX)

		Declare @id_formaspago_tao INT
		Declare @ds_fpnm_tao VARCHAR(50)
		Declare @id_tarjetascredito_tao INT

		Declare @ResultTable TABLE (
			Respuesta VARCHAR(1000), 
			Estado INT,
			id_ReciboCaja INT,
			id_FormaPago INT,
			ds_FormaPago VARCHAR(100),
			cd_fuente VARCHAR(10),
			cd_serie VARCHAR(10),
			cd_consecutivo VARCHAR(20),
			ds_Tipo VARCHAR(50),
			am_valor MONEY,
			Resolucionmsg VARCHAR(1000),
			NCF VARCHAR(50),
			FechaCaducidad DATETIME,
			ds_Alerta VARCHAR(1000),
			in_ConsecutivoUnicoDocumento INT,
			DocumentoCausacionCxP VARCHAR(100)
		)
		Declare @FacturaRespuesta VARCHAR(MAX)
		Declare @FacturaEstado INT

		-- Variables for #GenerarConceptosAuto cursor loop
		Declare @c_id_ConceptoFacturacion INT
		Declare @c_cd_ConceptoFacturacion VARCHAR(50)
		Declare @c_ds_ConceptoFacturacion VARCHAR(250)
		Declare @c_id_TiposConceptFac INT
		Declare @c_bl_contorlarCargImp BIT
		Declare @c_bl_CalculoAutoValoresFacturacion BIT
		Declare @c_id_TiposServicio INT
		Declare @c_cd_TiposServicio VARCHAR(50)
		Declare @c_ds_TiposServicio VARCHAR(250)
		Declare @c_cd_proveedores VARCHAR(25)
		Declare @c_ds_proveedores VARCHAR(250)
		Declare @c_cd_tiquete VARCHAR(50)
		Declare @c_ds_servicio VARCHAR(250)
		Declare @c_ds_descrip VARCHAR(500)
		Declare @c_ds_paxname VARCHAR(30)
		Declare @c_ds_paxape VARCHAR(30)
		Declare @c_cd_paxtype CHAR(3)
		Declare @c_ds_paxClasificacion CHAR(6)
		Declare @c_in_nacionalidad TINYINT
		Declare @c_dt_llegada SMALLDATETIME
		Declare @c_dt_salida SMALLDATETIME
		Declare @c_cd_cencosto VARCHAR(50)
		Declare @c_cd_auxiliar VARCHAR(50)
		Declare @c_cd_item VARCHAR(50)
		Declare @c_Valor MONEY
		Declare @c_am_Contado MONEY
		Declare @c_am_Credito MONEY
		Declare @c_ValorIva MONEY
		Declare @c_Total MONEY
		Declare @c_PorIva NUMERIC(5,2)
		Declare @c_am_ContadoIva MONEY
		Declare @c_am_CreditoIva MONEY
		Declare @c_codigoimpiva VARCHAR(3)
		Declare @c_nombreimpiva VARCHAR(50) 
		Declare @c_ColId VARCHAR(25)
		Declare @c_cd_Consecutivo_depende VARCHAR(50)
		Declare @c_CodigoReserva VARCHAR(50)
		Declare @c_am_ImpuestoComision MONEY
		Declare @c_Respuesta VARCHAR(1000)
		Declare @c_bl_RutaExentaIva BIT
		Declare @c_id_FormasPago INT
		Declare @c_id_TarjetasCredito INT
		Declare @c_am_basedescuento MONEY
		Declare @c_am_pordescuento NUMERIC(8,4)
		Declare @c_id_FormasPagoAirPlus INT
		Declare @c_cd_FormasPagoAirPlus VARCHAR(3)
		Declare @c_ds_FormasPagoAirPlus VARCHAR(100)
		Declare @c_id_TarjetasCreditoAirPlus INT
		Declare @c_cd_TarjetasCreditoAirPlus VARCHAR(4)
		Declare @c_ds_numerotarjetaAirPlus VARCHAR(25)
		Declare @c_cd_codigotc VARCHAR(2)
		Declare @c_ds_numerotc VARCHAR(25)
		Declare @c_ds_vencetc VARCHAR(5)
		Declare @c_ds_autorizaciontc VARCHAR(25)
		Declare @c_ds_vouchertc VARCHAR(25)
		Declare @c_in_cuotastc INT


		DECLARE @CalcularAutoValoresItemFac CHAR(1) = 'N';
		DECLARE @RecalcTotalValue MONEY;
		DECLARE @RecalcTotalPayment MONEY;
		DECLARE @NumDecimales INT

		CREATE TABLE #Facturacion (
			id INT IDENTITY(1,1) PRIMARY KEY,
			cd_fuente VARCHAR(2) COLLATE DATABASE_DEFAULT,
			cd_serie VARCHAR(2) COLLATE DATABASE_DEFAULT,
			cd_consecutivo VARCHAR(8) COLLATE DATABASE_DEFAULT,
			Tipo VARCHAR(25) COLLATE DATABASE_DEFAULT,
			Servicio VARCHAR(123) COLLATE DATABASE_DEFAULT,
			Descrip VARCHAR(78) COLLATE DATABASE_DEFAULT,
			id_factura INT,
			id_item INT,
			in_tipoitem INT,
			iden_gds INT,
			ds_fecha SMALLDATETIME,
			cd_tiqueteador VARCHAR(6) COLLATE DATABASE_DEFAULT,
			cd_vendedor CHAR(3) COLLATE DATABASE_DEFAULT,
			cd_cliente CHAR(10) COLLATE DATABASE_DEFAULT,
			am_highfare MONEY,
			am_lowfare MONEY,
			am_fare MONEY,
			ds_reasoncode CHAR(2) COLLATE DATABASE_DEFAULT,
			ds_cliname VARCHAR(250) COLLATE DATABASE_DEFAULT,
			ds_clidir VARCHAR(250) COLLATE DATABASE_DEFAULT,
			ds_clicity VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_cliid CHAR(10) COLLATE DATABASE_DEFAULT,
			ds_itinerario VARCHAR(250) COLLATE DATABASE_DEFAULT,
			ds_clases VARCHAR(61) COLLATE DATABASE_DEFAULT,
			in_nacionalidad TINYINT,
			id_air INT,
			ds_pax_number TINYINT,
			ds_pax_firstnm VARCHAR(30) COLLATE DATABASE_DEFAULT,
			ds_pax_lastnm VARCHAR(30) COLLATE DATABASE_DEFAULT,
			ds_pax_prefix CHAR(3) COLLATE DATABASE_DEFAULT,
			ds_tkt_number CHAR(10) COLLATE DATABASE_DEFAULT,
			ds_tkt_prefix CHAR(3) COLLATE DATABASE_DEFAULT,
			ds_aero_code CHAR(3) COLLATE DATABASE_DEFAULT,
			ds_moneda CHAR(3) COLLATE DATABASE_DEFAULT,
			am_tarifa MONEY,
			am_iva MONEY,
			am_tua MONEY,
			am_comb MONEY,
			am_vat MONEY,
			ds_cc_code CHAR(2) COLLATE DATABASE_DEFAULT,
			ds_cc_number VARCHAR(25) COLLATE DATABASE_DEFAULT,
			am_tao MONEY,
			am_ivatao MONEY,
			am_cap MONEY,
			am_ivacap MONEY,
			ds_cc_code2 CHAR(2) COLLATE DATABASE_DEFAULT,
			ds_cc_number2 CHAR(16) COLLATE DATABASE_DEFAULT,
			am_fp1 MONEY,
			am_fp2 MONEY,
			cd_tktrevisado VARCHAR(14) COLLATE DATABASE_DEFAULT,
			am_TarifaContado MONEY,
			am_IvaContado MONEY,
			am_OtrosContado MONEY,
			am_TarifaCredito MONEY,
			am_IvaCredito MONEY,
			am_OtrosCredito MONEY,
			am_Comision MONEY,
			cd_clitipodoc VARCHAR(100) COLLATE DATABASE_DEFAULT,
			cd_clitipotercero CHAR(1) COLLATE DATABASE_DEFAULT,
			ds_clirazoncial VARCHAR(250) COLLATE DATABASE_DEFAULT,
			ds_cliname2 VARCHAR(60) COLLATE DATABASE_DEFAULT,
			ds_clilastname VARCHAR(60) COLLATE DATABASE_DEFAULT,
			ds_clilastname2 VARCHAR(60) COLLATE DATABASE_DEFAULT,
			cd_clipais VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_clitel VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_TipoTransaccion VARCHAR(1) COLLATE DATABASE_DEFAULT,
			Fecha_Salida SMALLDATETIME,
			Fecha_Llegada SMALLDATETIME,
			Id_Srv INT,
			cd_conceptofacturacion INT,
			cd_tiposervicio INT,
			cd_proveedores VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_proveedores VARCHAR(250) COLLATE DATABASE_DEFAULT,
			id_car INT,
			dt_entrega SMALLDATETIME,
			in_cars INT,
			cd_carcode VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_conf_car VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_citysalida VARCHAR(25) COLLATE DATABASE_DEFAULT,
			dt_retorno SMALLDATETIME,
			cd_cartype VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_currency VARCHAR(10) COLLATE DATABASE_DEFAULT,
			am_tarifacar MONEY,
			cd_bookingsource VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_ratecode VARCHAR(25) COLLATE DATABASE_DEFAULT,
			id_htl INT,
			dt_checkin SMALLDATETIME,
			in_guests INT,
			cd_confirmation VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_city VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_htlchain VARCHAR(25) COLLATE DATABASE_DEFAULT,
			dt_checkout SMALLDATETIME,
			in_noches INT,
			ds_htlname VARCHAR(250) COLLATE DATABASE_DEFAULT,
			in_habs INT,
			cd_bed VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_ratecode_htl VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_htlcur VARCHAR(10) COLLATE DATABASE_DEFAULT,
			am_htltarifa MONEY,
			cd_agcur VARCHAR(10) COLLATE DATABASE_DEFAULT,
			am_agtarifa MONEY,
			ds_dir1 VARCHAR(250) COLLATE DATABASE_DEFAULT,
			ds_tel VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_fax VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_centrocosto VARCHAR(50) COLLATE DATABASE_DEFAULT,
			NumTktConj INT,
			Respuesta VARCHAR(1) COLLATE DATABASE_DEFAULT,
			ds_solicita VARCHAR(200) COLLATE DATABASE_DEFAULT,
			cd_pax_CC VARCHAR(20) COLLATE DATABASE_DEFAULT,
			ds_lapsoviaje VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_archivo VARCHAR(250) COLLATE DATABASE_DEFAULT,
			ds_Observaciones VARCHAR(8000) COLLATE DATABASE_DEFAULT,
			ds_ClienteEmail VARCHAR(100) COLLATE DATABASE_DEFAULT,
			cd_sucursal CHAR(5) COLLATE DATABASE_DEFAULT,
			cd_implante CHAR(5) COLLATE DATABASE_DEFAULT,
			bl_ClienteActualizar BIT,
			bl_NotificacionMPD BIT,
			cd_FormaPagoTAO VARCHAR(3) COLLATE DATABASE_DEFAULT,
			cd_TarjetaCreditoTAO VARCHAR(4) COLLATE DATABASE_DEFAULT,
			cd_NumeroTarjetaTAO VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_VencimientoTarjetaTAO CHAR(6) COLLATE DATABASE_DEFAULT,
			cd_NumeroPolizaTAO VARCHAR(50) COLLATE DATABASE_DEFAULT,
			cd_AnexoPolizaTAO VARCHAR(50) COLLATE DATABASE_DEFAULT,
			am_PorDesFormaPagoTA NUMERIC(8,4),
			cd_Penalidad CHAR(14) COLLATE DATABASE_DEFAULT,
			ds_cc_vence CHAR(5) COLLATE DATABASE_DEFAULT,
			ds_cc_vence2 CHAR(5) COLLATE DATABASE_DEFAULT,
			ds_cc_autorizacion VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_cc_autorizacion2 VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_cc_voucher VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_cc_voucher2 VARCHAR(10) COLLATE DATABASE_DEFAULT,
			ds_AutorizacionTarjetaTAO VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_VoucherTarjetaTAO VARCHAR(25) COLLATE DATABASE_DEFAULT,
			am_fptao MONEY,
			in_cc_cuotas INT,
			in_cc_cuotas2 INT,
			in_cuotasTarjetaTAO INT,
			cd_TipoTarifaTAO VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_TipoTiquete CHAR(3) COLLATE DATABASE_DEFAULT,
			am_TasaCambio MONEY,
			cd_tiqueteador_facturador CHAR(3) COLLATE DATABASE_DEFAULT,
			bl_ahorro BIT,
			in_CantidadTarifaTAO INT,
			in_CantidadSegmentoTAO INT,
			cd_tourcode VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_contrato VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_PasaportePax VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_itinerarioaerolinea VARCHAR(128) COLLATE DATABASE_DEFAULT,
			ds_tkt_prefixIata CHAR(3) COLLATE DATABASE_DEFAULT,
			ds_Evento VARCHAR(250) COLLATE DATABASE_DEFAULT,
			cd_iata VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_aero_codeIata CHAR(3) COLLATE DATABASE_DEFAULT,
			ReservaFactura VARCHAR(100) COLLATE DATABASE_DEFAULT,
			cd_Ahorro CHAR(3) COLLATE DATABASE_DEFAULT,
			cd_Categoria VARCHAR(50) COLLATE DATABASE_DEFAULT,
			Id_FormasPagoAirPlus INT,
			cd_FormasPagoAirPlus VARCHAR(3) COLLATE DATABASE_DEFAULT,
			ds_FormasPagoAirPlus VARCHAR(100) COLLATE DATABASE_DEFAULT,
			cd_TarjetasCreditoAirPlus VARCHAR(4) COLLATE DATABASE_DEFAULT,
			ds_numerotarjetaAirPlus VARCHAR(25) COLLATE DATABASE_DEFAULT,
			am_PorFacParcial MONEY,
			am_PorFacParcial_Utilizar MONEY,
			in_cantpax INT,
			Id_Precompra INT,
			id_sucursal INT,
			bl_cotizacion BIT,
			cd_htl VARCHAR(50) COLLATE DATABASE_DEFAULT,
			id_FormasPago INT,
			id_TarjetasCredito INT,
			id_formapago_cliente INT,
			cd_formapago_cliente VARCHAR(3) COLLATE DATABASE_DEFAULT,
			ds_formapago_cliente VARCHAR(100) COLLATE DATABASE_DEFAULT,
			cd_fp_OtrosItems VARCHAR(3) COLLATE DATABASE_DEFAULT,
			cd_auxiliar VARCHAR(50) COLLATE DATABASE_DEFAULT,
			cd_tipoventa VARCHAR(10) COLLATE DATABASE_DEFAULT,
			am_iva2 MONEY,
			cd_licitacion INT,
			ds_descripcion VARCHAR(500) COLLATE DATABASE_DEFAULT,
			id_tipoproveedor INT,
			cd_tipoproveedor VARCHAR(10) COLLATE DATABASE_DEFAULT,
			ds_tipoproveedor VARCHAR(100) COLLATE DATABASE_DEFAULT,
			cd_Consecutivo_variablesadicionales VARCHAR(50) COLLATE DATABASE_DEFAULT,
			cd_item VARCHAR(50) COLLATE DATABASE_DEFAULT
		);

		CREATE TABLE #CargosImpuestos (
			id INT, id_facturacion INT, id_item INT, in_tipoitem INT,
			in_orden INT, cd_codigo VARCHAR(20) COLLATE DATABASE_DEFAULT, ds_nombre VARCHAR(100) COLLATE DATABASE_DEFAULT, cd_tipo CHAR(1) COLLATE DATABASE_DEFAULT, 
			cd_codigopadre VARCHAR(20) COLLATE DATABASE_DEFAULT, cd_tipopadre VARCHAR(20) COLLATE DATABASE_DEFAULT, am_porcentaje NUMERIC(8,4),
			am_contado MONEY, am_credito MONEY, am_valor MONEY, id_carg INT, id_imp INT, bl_iva BIT
		);

		CREATE TABLE #FormasPagos (
			id INT, id_facturacion INT, id_item INT, in_tipoitem INT,
			in_orden INT, id_formaspago INT, cd_codigo VARCHAR(10) COLLATE DATABASE_DEFAULT, ds_nombre VARCHAR(50) COLLATE DATABASE_DEFAULT,
			id_tarjetascredito INT, cd_tipotarjeta VARCHAR(10) COLLATE DATABASE_DEFAULT, ds_numerotarjeta VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_vouchertarjeta VARCHAR(50) COLLATE DATABASE_DEFAULT, ds_expiraciontarjeta VARCHAR(10) COLLATE DATABASE_DEFAULT, ds_autorizaciontarjeta VARCHAR(50) COLLATE DATABASE_DEFAULT,
			in_coutas INT, cd_banco VARCHAR(50) COLLATE DATABASE_DEFAULT, ds_cheque VARCHAR(50) COLLATE DATABASE_DEFAULT, ds_plaza VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_referencia VARCHAR(50) COLLATE DATABASE_DEFAULT, ds_Poliza VARCHAR(50) COLLATE DATABASE_DEFAULT, ds_PolizaAnexo VARCHAR(50) COLLATE DATABASE_DEFAULT, am_valor MONEY
		);

		CREATE TABLE #Pasajeros (
			id_facturacion INT, id_item INT, in_tipoitem INT,
			ds_paxape VARCHAR(50) COLLATE DATABASE_DEFAULT, ds_paxname VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_paxprefix VARCHAR(10) COLLATE DATABASE_DEFAULT, ds_paxClasificacion VARCHAR(10) COLLATE DATABASE_DEFAULT,
			cd_voucherpax VARCHAR(50) COLLATE DATABASE_DEFAULT, cd_paxidentificacion VARCHAR(50) COLLATE DATABASE_DEFAULT,
			in_edad INT, cd_tiquete VARCHAR(50) COLLATE DATABASE_DEFAULT
		);

		CREATE TABLE #Itinerarios (
			id_facturacion INT, id_item INT, in_tipoitem INT, in_orden INT,
			ds_origen VARCHAR(25) COLLATE DATABASE_DEFAULT, ds_destino VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_clase VARCHAR(25) COLLATE DATABASE_DEFAULT, dt_llegada SMALLDATETIME, dt_salida SMALLDATETIME,
			ds_terminal VARCHAR(25) COLLATE DATABASE_DEFAULT, cd_aerolinea VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_farebasis VARCHAR(25) COLLATE DATABASE_DEFAULT, ds_numerovuelo VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_tipovuelo VARCHAR(25) COLLATE DATABASE_DEFAULT, am_valor MONEY, am_co2 MONEY
		);

		CREATE TABLE #VariablesAdicionales (
			id_facturacion INT, id_item INT, in_tipoitem INT,
			ds_maestro VARCHAR(25) COLLATE DATABASE_DEFAULT, ds_VariableAdicional VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_valor VARCHAR(500) COLLATE DATABASE_DEFAULT, cd_codigo VARCHAR(25) COLLATE DATABASE_DEFAULT
		);

		CREATE TABLE #GenerarConceptosAuto (
			id_ConceptoFacturacion INT,
			cd_ConceptoFacturacion VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_ConceptoFacturacion VARCHAR(250) COLLATE DATABASE_DEFAULT,
			id_TiposConceptFac INT,
			bl_contorlarCargImp BIT,
			bl_CalculoAutoValoresFacturacion BIT,
			id_TiposServicio INT,
			cd_TiposServicio VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_TiposServicio VARCHAR(250) COLLATE DATABASE_DEFAULT,
			cd_proveedores VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_proveedores VARCHAR(250) COLLATE DATABASE_DEFAULT,
			cd_tiquete VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_servicio VARCHAR(250) COLLATE DATABASE_DEFAULT,
			ds_descrip VARCHAR(500) COLLATE DATABASE_DEFAULT,
			ds_paxname VARCHAR(30) COLLATE DATABASE_DEFAULT,
			ds_paxape VARCHAR(30) COLLATE DATABASE_DEFAULT,
			cd_paxtype CHAR(3) COLLATE DATABASE_DEFAULT,
			ds_paxClasificacion CHAR(6) COLLATE DATABASE_DEFAULT,
			in_nacionalidad TINYINT,
			dt_llegada SMALLDATETIME,
			dt_salida SMALLDATETIME,
			cd_cencosto VARCHAR(50) COLLATE DATABASE_DEFAULT,
			cd_auxiliar VARCHAR(50) COLLATE DATABASE_DEFAULT,
			cd_item VARCHAR(50) COLLATE DATABASE_DEFAULT,
			Valor MONEY,
			am_Contado MONEY,
			am_Credito MONEY,
			ColId VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_Consecutivo_depende VARCHAR(50) COLLATE DATABASE_DEFAULT,
			CodigoReserva VARCHAR(50) COLLATE DATABASE_DEFAULT,
			am_ImpuestoComision MONEY,
			Respuesta VARCHAR(1000) COLLATE DATABASE_DEFAULT,
			bl_RutaExentaIva BIT,
			id_FormasPago INT,
			id_TarjetasCredito INT,
			am_basedescuento MONEY,
			am_pordescuento NUMERIC(8,4),
			id_FormasPagoAirPlus INT,
			cd_FormasPagoAirPlus VARCHAR(3) COLLATE DATABASE_DEFAULT,
			ds_FormasPagoAirPlus VARCHAR(100) COLLATE DATABASE_DEFAULT,
			id_TarjetasCreditoAirPlus INT,
			cd_TarjetasCreditoAirPlus VARCHAR(4) COLLATE DATABASE_DEFAULT,
			ds_numerotarjetaAirPlus VARCHAR(25) COLLATE DATABASE_DEFAULT,
			cd_codigotc VARCHAR(2) COLLATE DATABASE_DEFAULT,
			ds_numerotc VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_vencetc VARCHAR(5) COLLATE DATABASE_DEFAULT,
			ds_autorizaciontc VARCHAR(25) COLLATE DATABASE_DEFAULT,
			ds_vouchertc VARCHAR(25) COLLATE DATABASE_DEFAULT,
			in_cuotastc INT
		);

		CREATE TABLE #TmpFacturaItems (
			id INT IDENTITY(1,1) PRIMARY KEY,
			id_factura INT,
			id_item INT,
			in_tipoitem INT,
			tipo_item VARCHAR(10),                 -- 'Aire', 'TAO', 'SRV','Hotel','Auto'
			id_referencia_origen INT,              -- ID de ReservasGDS_Detalles or ReservaGDS_Servicios
			cd_fuente VARCHAR(2) COLLATE DATABASE_DEFAULT,
			cd_serie VARCHAR(2) COLLATE DATABASE_DEFAULT,
			cd_consecutivo VARCHAR(8) COLLATE DATABASE_DEFAULT,
			cd_tiquete VARCHAR(50),
			ds_descrip VARCHAR(500),
			in_nacionalidad INT,
			cd_cencosto VARCHAR(50),
			cd_auxiliar VARCHAR(50),
			cd_item VARCHAR(50),
			am_tarifa MONEY,
			am_iva MONEY,
			am_tua MONEY,
			am_comb MONEY,
			am_vat MONEY,
			am_Comision MONEY,
			ds_paxname VARCHAR(30),
			ds_paxape VARCHAR(30),
			ds_paxprefix CHAR(3),
			cd_tourcode VARCHAR(25),
			NumTktConj INT,
			cd_TipoTiquete CHAR(3),
			id_air INT,
			ds_itinerario VARCHAR(250),
			ds_itinerarioaerolinea VARCHAR(128),
			ds_clases VARCHAR(61),
			ds_Observaciones VARCHAR(8000),
			am_highfare MONEY,
			am_lowfare MONEY,
			ds_solicita VARCHAR(200),
			ds_lapsoviaje VARCHAR(50),
			cd_tktrevisado VARCHAR(14),
			cd_PasaportePax VARCHAR(25),
			cd_pax_CC VARCHAR(20),
			am_PorFacParcial MONEY,
			in_cantpax INT,
			Id_Precompra INT,
			cd_FormaPagoTAO VARCHAR(3),
			cd_TarjetaCreditoTAO VARCHAR(4),
			cd_NumeroTarjetaTAO VARCHAR(25),
			cd_VencimientoTarjetaTAO CHAR(6),
			cd_NumeroPolizaTAO VARCHAR(50),
			cd_AnexoPolizaTAO VARCHAR(50),
			ds_AutorizacionTarjetaTAO VARCHAR(25),
			in_cuotasTarjetaTAO INT,
			id_FormasPago INT,
			id_TarjetasCredito INT,
			am_fp1 MONEY,
			ds_cc_code VARCHAR(2),
			ds_cc_number VARCHAR(25),
			ds_cc_vence VARCHAR(5),
			ds_cc_autorizacion VARCHAR(25),
			ds_cc_voucher VARCHAR(25),
			in_cc_cuotas INT,
			am_fp2 MONEY,
			ds_cc_code2 VARCHAR(2),
			ds_cc_number2 VARCHAR(25),
			ds_cc_vence2 VARCHAR(5),
			ds_cc_autorizacion2 VARCHAR(25),
			ds_cc_voucher2 VARCHAR(25),
			in_cc_cuotas2 INT,
			id_monedas_iata INT,
			Tcambio MONEY,
			id_sucursal INT,
			id_implante INT,
			bl_ahorro BIT,
			cd_TipoTiqueteGDS VARCHAR(3),
			id_TiposDocumento INT,
			id_entdist INT,
			id_entvend INT,
			cd_destino VARCHAR(3),
			dt_fechaexped SMALLDATETIME,
			id_tiqueteadores INT,
			id_gds INT,
			iden_gds INT,
			am_comisionPNR MONEY,
			ds_records VARCHAR(62),
			bl_NoCalcComision BIT,
			bl_NoCalcIvaComision BIT,
			am_basecomisionable MONEY,
			am_porcomision MONEY,
			id_tiposconceptfac INT,
			id_conceptofacturacion INT,
			id_tiposservicio INT,
			cd_proveedores VARCHAR(25),
			ds_servicio VARCHAR(250),
			am_valorprov MONEY,
			id_monedaprov INT,
			dt_llegada SMALLDATETIME,
			dt_salida SMALLDATETIME,
			am_pordescuento NUMERIC(8,4),
			am_basedescuento MONEY,
			Fecha_Salida SMALLDATETIME,
			Fecha_Llegada SMALLDATETIME,
			ColId VARCHAR(25),
			cd_Consecutivo_depende VARCHAR(50),
			CodigoReserva VARCHAR(50),
			cd_Consecutivo_variablesadicionales VARCHAR(50),
			am_valor_total MONEY,
			ds_proveedores VARCHAR(250) COLLATE DATABASE_DEFAULT,
			id_tipoproveedor INT,
			cd_tipoproveedor VARCHAR(10) COLLATE DATABASE_DEFAULT,
			ds_tipoproveedor VARCHAR(100) COLLATE DATABASE_DEFAULT,
			id_FormasPagoAirPlus INT,
			cd_FormasPagoAirPlus VARCHAR(3) COLLATE DATABASE_DEFAULT,
			ds_FormasPagoAirPlus VARCHAR(100) COLLATE DATABASE_DEFAULT,
			id_TarjetasCreditoAirPlus INT,
			cd_TarjetasCreditoAirPlus VARCHAR(4) COLLATE DATABASE_DEFAULT,
			ds_numerotarjetaAirPlus VARCHAR(25) COLLATE DATABASE_DEFAULT,
			id_reserva INT,
			OrdenGrabacion INT
		);

		CREATE TABLE #TmpFacturaCargos (
			id_cargo_temp INT IDENTITY(1,1) PRIMARY KEY,
			id_item INT,
			cd_codigo VARCHAR(20) COLLATE DATABASE_DEFAULT,
			ds_nombre VARCHAR(100) COLLATE DATABASE_DEFAULT,
			cd_tipo CHAR(1) COLLATE DATABASE_DEFAULT,
			am_porcentaje NUMERIC(8,4),
			am_valor MONEY,
			am_contado MONEY,
			am_credito MONEY,
			id_carg INT,
			id_imp INT,
			bl_iva BIT,
			in_orden INT
		);

		CREATE TABLE #TmpFacturaFormasPago (
			id_fp_temp INT IDENTITY(1,1) PRIMARY KEY,
			id_item INT,
			id_formaspago INT,
			cd_codigo VARCHAR(10) COLLATE DATABASE_DEFAULT,
			ds_nombre VARCHAR(50) COLLATE DATABASE_DEFAULT,
			id_tarjetascredito INT,
			cd_tipotarjeta VARCHAR(10) COLLATE DATABASE_DEFAULT,
			ds_numerotarjeta VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_vouchertarjeta VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_expiraciontarjeta VARCHAR(10) COLLATE DATABASE_DEFAULT,
			ds_autorizaciontarjeta VARCHAR(50) COLLATE DATABASE_DEFAULT,
			in_cuotas INT,
			cd_banco VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_cheque VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_plaza VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_referencia VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_Poliza VARCHAR(50) COLLATE DATABASE_DEFAULT,
			ds_PolizaAnexo VARCHAR(50) COLLATE DATABASE_DEFAULT,
			am_valor MONEY
		);


		-- Fetch tax details for standard IVA (id=1)
		SELECT TOP 1 
			@ds_impas_iva = ds_nombre, 
			@cd_impcta_iva = cd_cuenta, 
			@am_porcentaje_iva = am_porcentaje,
			@c_PorIva = am_porcentaje,
			@c_codigoimpiva = cd_codigo,
			@c_nombreimpiva = ds_nombre
		FROM dbo.ImpRet 
		WHERE id = 1;

		SELECT @NumDecimales = CONVERT(INT,LTRIM(RTRIM(valor))) from dbo.parametros where id = 33;
		IF @NumDecimales IS NULL SET @NumDecimales = 2;

		SELECT @CalcularAutoValoresItemFac = ISNULL(LTRIM(RTRIM(valor)), 'N') FROM dbo.Parametros WHERE id = 326;

        -- Validar que el XML sea correcto
        IF @xml IS NULL OR LTRIM(RTRIM(@xml)) = ''
        BEGIN
            --THROW 50001, 'El XML es obligatorio.', 1;
            SELECT 'El XML es obligatorio.' AS 'Respuesta', 1 AS 'Estado'
			RETURN 1;
        END

        -- Limpiar saltos de línea y tabuladores para evitar que se guarden en campos de texto (usuario, tercero, dirección, etc.)
        SET @xml = REPLACE(REPLACE(REPLACE(@xml, CHAR(13), ''), CHAR(10), ''), CHAR(9), '');

        SET @xmlData = TRY_CAST(@xml AS XML);

        IF @xmlData IS NULL
        BEGIN
            --THROW 50002, 'El XML no tiene un formato válido.', 1;
            SELECT 'El XML no tiene un formato válido.' AS 'Respuesta', 1 AS 'Estado'
			RETURN 1;
        END

        -- Extraer datos del XML

		INSERT INTO #Facturacion(
			cd_fuente, 
			cd_serie,
			cd_consecutivo,
			Tipo,
			Servicio,
			Descrip,
			id_factura,
			id_item,
			in_tipoitem,
			iden_gds,
			ds_fecha,
			cd_tiqueteador,
			cd_vendedor,
			cd_cliente,
			am_highfare,
			am_lowfare,
			am_fare,
			ds_reasoncode,
			ds_cliname,
			ds_clidir,
			ds_clicity,
			ds_cliid,
			ds_itinerario,
			ds_clases,
			in_nacionalidad,
			id_air,
			ds_pax_number,
			ds_pax_firstnm,
			ds_pax_lastnm,
			ds_pax_prefix,
			ds_tkt_number,
			ds_tkt_prefix,
			ds_aero_code,
			ds_moneda,
			am_tarifa,
			am_iva,
			am_tua,
			am_comb,
			am_vat,
			ds_cc_code,
			ds_cc_number,
			am_tao,
			am_ivatao,
			am_cap,
			am_ivacap,
			ds_cc_code2,
			ds_cc_number2,
			am_fp1,
			am_fp2,
			cd_tktrevisado,
			am_TarifaContado,
			am_IvaContado,
			am_OtrosContado,
			am_TarifaCredito,
			am_IvaCredito,
			am_OtrosCredito,
			am_Comision,
			cd_clitipodoc,
			cd_clitipotercero,
			ds_clirazoncial,
			ds_cliname2,
			ds_clilastname,
			ds_clilastname2,
			cd_clipais,
			ds_clitel,
			cd_TipoTransaccion,
			Fecha_Salida,
			Fecha_Llegada,
			Id_Srv,
			cd_conceptofacturacion,
			cd_tiposervicio,
			cd_proveedores,
			ds_proveedores,
			id_car,
			dt_entrega,
			in_cars,
			cd_carcode,
			cd_conf_car,
			cd_citysalida,
			dt_retorno,
			cd_cartype,
			cd_currency,
			am_tarifacar,
			cd_bookingsource,
			cd_ratecode,
			id_htl,
			dt_checkin,
			in_guests,
			cd_confirmation,
			cd_city,
			cd_htlchain,
			dt_checkout,
			in_noches,
			ds_htlname,
			in_habs,
			cd_bed,
			cd_ratecode_htl,
			cd_htlcur,
			am_htltarifa,
			cd_agcur,
			am_agtarifa,
			ds_dir1,
			ds_tel,
			ds_fax,
			cd_centrocosto,
			NumTktConj,
			Respuesta,
			ds_solicita,
			cd_pax_CC,
			ds_lapsoviaje,
			ds_archivo,
			ds_Observaciones,
			ds_ClienteEmail,
			cd_sucursal,
			cd_implante, 
			bl_ClienteActualizar,
			bl_NotificacionMPD,
			cd_FormaPagoTAO,
			cd_TarjetaCreditoTAO, 
			cd_NumeroTarjetaTAO, 
			cd_VencimientoTarjetaTAO, 
			cd_NumeroPolizaTAO,
			cd_AnexoPolizaTAO,
			am_PorDesFormaPagoTA, 
			cd_Penalidad, 
			ds_cc_vence, 
			ds_cc_vence2,
			ds_cc_autorizacion ,
			ds_cc_autorizacion2 ,
			ds_cc_voucher,
			ds_cc_voucher2 ,
			ds_AutorizacionTarjetaTAO,
			ds_VoucherTarjetaTAO,
			am_fptao,
			in_cc_cuotas,
			in_cc_cuotas2,
			in_cuotasTarjetaTAO,
			cd_TipoTarifaTAO,
			cd_TipoTiquete,
			am_TasaCambio,
			cd_tiqueteador_facturador ,
			bl_ahorro	,
			in_CantidadTarifaTAO,
			in_CantidadSegmentoTAO,
			cd_tourcode ,
			ds_contrato,
			cd_PasaportePax,
			ds_itinerarioaerolinea,
			ds_tkt_prefixIata,
			ds_Evento,
			cd_iata ,
			ds_aero_codeIata,
			ReservaFactura ,
			cd_Ahorro,
			cd_Categoria ,
			Id_FormasPagoAirPlus,
			cd_FormasPagoAirPlus,
			ds_FormasPagoAirPlus,
			cd_TarjetasCreditoAirPlus,
			ds_numerotarjetaAirPlus,
			am_PorFacParcial,
			am_PorFacParcial_Utilizar,
			in_cantpax,
			Id_Precompra,
			id_sucursal,
			bl_cotizacion,
			cd_htl,
			id_FormasPago,
			id_TarjetasCredito,
			id_formapago_cliente,
			cd_formapago_cliente,
			ds_formapago_cliente,
			cd_fp_OtrosItems,
			cd_auxiliar,
			cd_tipoventa,
			am_iva2,
			cd_licitacion,
			ds_descripcion,
			id_tipoproveedor,
			cd_tipoproveedor,
			ds_tipoproveedor,
			cd_Consecutivo_variablesadicionales,
			cd_item

		)	        
		SELECT 
			cd_fuente = F.Facturacion.value('cd_fuente[1]','VARCHAR(2)'), 
			cd_serie = F.Facturacion.value('cd_serie[1]','VARCHAR(2)'),
			cd_consecutivo = F.Facturacion.value('cd_consecutivo[1]','VARCHAR(8)'),
			Tipo = NULL,
			Servicio = '',
			Descrip = '',
			id_factura = F.Facturacion.value('id_factura[1]','INT'),
			id_item = NULL,
			in_tipoitem = NULL,
			iden_gds = NULL,
			ds_fecha = ISNULL(F.Facturacion.value('dt_fechacont[1]','SMALLDATETIME'),'19000101'),
			cd_tiqueteador = ISNULL(F.Facturacion.value('cd_tiqueteador[1]','VARCHAR(25)'),''),
			cd_vendedor = ISNULL(F.Facturacion.value('cd_vendedor[1]','VARCHAR(25)'),''),
			cd_cliente = ISNULL(F.Facturacion.value('cd_cliente_codigo[1]','VARCHAR(25)'),''),
			am_highfare = 0,
			am_lowfare = 0,
			am_fare = 0,
			ds_reasoncode = '',
			ds_cliname = ISNULL(F.Facturacion.value('ds_cliente_nombre[1]','VARCHAR(250)'),''),
			ds_clidir = ISNULL(F.Facturacion.value('ds_cliente_dir[1]','VARCHAR(250)'),''),
			ds_clicity = ISNULL(F.Facturacion.value('ds_cliente_ciudad[1]','VARCHAR(50)'),''),
			ds_cliid = ISNULL(F.Facturacion.value('cd_cliente_codigo[1]','VARCHAR(10)'),''),
			ds_itinerario = '',
			ds_clases = '',
			in_nacionalidad = 0,
			id_air = NULL,
			ds_pax_number = 0,
			ds_pax_firstnm = '',
			ds_pax_lastnm = '',
			ds_pax_prefix = '',
			ds_tkt_number = '',
			ds_tkt_prefix = '',
			ds_aero_code = '',
			ds_moneda = ISNULL(F.Facturacion.value('cd_monedas_iata[1]','VARCHAR(25)'),'COP'),
			am_tarifa = 0,
			am_iva = 0,
			am_tua = 0,
			am_comb = 0,
			am_vat = 0,
			ds_cc_code = '',
			ds_cc_number = '',
			am_tao = 0,
			am_ivatao = 0,
			am_cap = 0,
			am_ivacap = 0,
			ds_cc_code2 = '',
			ds_cc_number2 = '',
			am_fp1 = 0,
			am_fp2 = 0,
			cd_tktrevisado = '',
			am_TarifaContado = 0,
			am_IvaContado = 0,
			am_OtrosContado = 0,
			am_TarifaCredito = 0,
			am_IvaCredito = 0,
			am_OtrosCredito = 0,
			am_Comision = 0,
			cd_clitipodoc = '',
			cd_clitipotercero = '',
			ds_clirazoncial = '',
			ds_cliname2 = '',
			ds_clilastname = '',
			ds_clilastname2 = '',
			cd_clipais = '',
			ds_clitel = ISNULL(F.Facturacion.value('ds_cliente_tel[1]','VARCHAR(61)'),''),
			cd_TipoTransaccion = '',
			Fecha_Salida = GETDATE(),
			Fecha_Llegada = GETDATE(),
			Id_Srv = NULL,
			cd_conceptofacturacion = '',
			cd_tiposervicio = '',
			cd_proveedores = '',
			ds_proveedores = '',
			id_car = NULL,
			dt_entrega = GETDATE(),
			in_cars = 0,
			cd_carcode = '',
			cd_conf_car = '',
			cd_citysalida=ISNULL(F.Facturacion.value('cd_citysalida[1]','VARCHAR(61)'),''),
			dt_retorno=F.Facturacion.value('dt_retorno[1]','SMALLDATETIME'),
			cd_cartype=ISNULL(F.Facturacion.value('cd_cartype[1]','VARCHAR(61)'),''),
			cd_currency=ISNULL(F.Facturacion.value('cd_currency[1]','VARCHAR(3)'),'COP'),
			am_tarifacar=ISNULL(F.Facturacion.value('am_tarifacar[1]','MONEY'),0),
			cd_bookingsource=ISNULL(F.Facturacion.value('cd_bookingsource[1]','VARCHAR(61)'),''),
			cd_ratecode=ISNULL(F.Facturacion.value('cd_ratecode[1]','VARCHAR(61)'),''),
			id_htl=NULL,
			dt_checkin=F.Facturacion.value('dt_checkin[1]','SMALLDATETIME'),
			in_guests=ISNULL(F.Facturacion.value('in_guests[1]','INT'),0),
			cd_confirmation=ISNULL(F.Facturacion.value('cd_confirmation[1]','VARCHAR(61)'),''),
			cd_city=ISNULL(F.Facturacion.value('cd_city[1]','VARCHAR(61)'),''),
			cd_htlchain=ISNULL(F.Facturacion.value('cd_htlchain[1]','VARCHAR(61)'),''),
			dt_checkout=F.Facturacion.value('dt_checkout[1]','SMALLDATETIME'),
			in_noches=ISNULL(F.Facturacion.value('in_noches[1]','INT'),0),
			ds_htlname=ISNULL(F.Facturacion.value('ds_htlname[1]','VARCHAR(61)'),''),
			in_habs=ISNULL(F.Facturacion.value('in_habs[1]','INT'),0),
			cd_bed=ISNULL(F.Facturacion.value('cd_bed[1]','VARCHAR(61)'),''),
			cd_ratecode_htl=ISNULL(F.Facturacion.value('cd_ratecode_htl[1]','VARCHAR(61)'),''),
			cd_htlcur=ISNULL(F.Facturacion.value('cd_htlcur[1]','VARCHAR(61)'),''),
			am_htltarifa=ISNULL(F.Facturacion.value('am_htltarifa[1]','MONEY'),0),
			cd_agcur=ISNULL(F.Facturacion.value('cd_agcur[1]','VARCHAR(61)'),''),
			am_agtarifa=ISNULL(F.Facturacion.value('am_agtarifa[1]','MONEY'),0),
			ds_dir1=ISNULL(F.Facturacion.value('ds_dir1[1]','VARCHAR(61)'),''),
			ds_tel=ISNULL(F.Facturacion.value('ds_tel[1]','VARCHAR(61)'),''),
			ds_fax=ISNULL(F.Facturacion.value('ds_fax[1]','VARCHAR(61)'),''),
			cd_centrocosto=ISNULL(F.Facturacion.value('cd_centrocosto[1]','VARCHAR(61)'),''),
			NumTktConj=ISNULL(F.Facturacion.value('NumTktConj[1]','VARCHAR(61)'),''),
			Respuesta=NULL,
			ds_solicita = '',
			cd_pax_CC = '',
			ds_lapsoviaje = '',
			ds_archivo = ISNULL(F.Facturacion.value('ds_archivo[1]','VARCHAR(61)'),''),
			ds_Observaciones = ISNULL(F.Facturacion.value('ds_Observacion[1]','VARCHAR(8000)'),''),
			ds_ClienteEmail = ISNULL(F.Facturacion.value('ds_cliente_email[1]','VARCHAR(61)'),''),
			cd_sucursal = ISNULL(F.Facturacion.value('cd_sucursal[1]','VARCHAR(25)'),'OFP'),
			cd_implante = ISNULL(F.Facturacion.value('cd_implante[1]','VARCHAR(25)'),''), 
			bl_ClienteActualizar = 0,
			bl_NotificacionMPD = 0,
			cd_FormaPagoTAO = '',
			cd_TarjetaCreditoTAO = '', 
			cd_NumeroTarjetaTAO = '', 
			cd_VencimientoTarjetaTAO = '__/__', 
			cd_NumeroPolizaTAO = '',
			cd_AnexoPolizaTAO = '',
			am_PorDesFormaPagoTA = 0, 
			cd_Penalidad = '', 
			ds_cc_vence = '', 
			ds_cc_vence2 = '',
			ds_cc_autorizacion = '',
			ds_cc_autorizacion2 = '',
			ds_cc_voucher = '',
			ds_cc_voucher2 = '',
			ds_AutorizacionTarjetaTAO = '',
			ds_VoucherTarjetaTAO = '',
			am_fptao = 0,
			in_cc_cuotas = 0,
			in_cc_cuotas2 = 0,
			in_cuotasTarjetaTAO = 0,
			cd_TipoTarifaTAO = '',
			cd_TipoTiquete = '',
			am_TasaCambio = ISNULL(F.Facturacion.value('Tcambio[1]','MONEY'),1),
			cd_tiqueteador_facturador = '',
			bl_ahorro = 0,
			in_CantidadTarifaTAO = 0,
			in_CantidadSegmentoTAO = 0,
			cd_tourcode = '',
			ds_contrato = '',
			cd_PasaportePax = '',
			ds_itinerarioaerolinea = '',
			ds_tkt_prefixIata = '',
			ds_Evento = ISNULL(F.Facturacion.value('ds_Evento[1]','VARCHAR(61)'),''),
			cd_iata = ISNULL(F.Facturacion.value('cd_iata[1]','VARCHAR(61)'),''),
			ds_aero_codeIata = '',
			ReservaFactura = '',
			cd_Ahorro = '',
			cd_Categoria = '',
			Id_FormasPagoAirPlus = NULL,
			cd_FormasPagoAirPlus = '',
			ds_FormasPagoAirPlus = '',
			cd_TarjetasCreditoAirPlus = '',
			ds_numerotarjetaAirPlus = '',
			am_PorFacParcial = 100,
			am_PorFacParcial_Utilizar = 0,
			in_cantpax = 0,
			Id_Precompra = NULL,
			id_sucursal = 1,
			bl_cotizacion = 0,
			cd_htl = '',
			id_FormasPago = NULL,
			id_TarjetasCredito = NULL,
			id_formapago_cliente = NULL,
			cd_formapago_cliente = '',
			ds_formapago_cliente = '',
			cd_fp_OtrosItems = '',
			cd_auxiliar = '',
			cd_tipoventa = ISNULL(F.Facturacion.value('id_tipoventa[1]','VARCHAR(61)'),''),
			am_iva2 = 0,
			cd_licitacion = ISNULL(F.Facturacion.value('id_Licitacion[1]','VARCHAR(61)'),''),
			ds_descripcion = '',
			id_tipoproveedor = NULL,
			cd_tipoproveedor = '',
			ds_tipoproveedor = '',
			cd_Consecutivo_variablesadicionales = '',
			cd_item = ''
        FROM @xmlData.nodes('/Facturaciones/Facturacion') AS F(Facturacion);


		INSERT INTO #TmpFacturaItems (
			id_factura, id_item, in_tipoitem, tipo_item, id_referencia_origen, cd_fuente, cd_serie, cd_consecutivo, cd_tiquete, ds_descrip, in_nacionalidad, 
			cd_cencosto, cd_auxiliar, cd_item, am_tarifa, am_iva, am_tua, am_comb, am_vat, am_Comision, 
			ds_paxname, ds_paxape, ds_paxprefix, cd_tourcode, NumTktConj, cd_TipoTiquete, id_air, 
			ds_itinerario, ds_itinerarioaerolinea, ds_clases, ds_Observaciones, am_highfare, am_lowfare, 
			ds_solicita, ds_lapsoviaje, cd_tktrevisado, cd_PasaportePax, cd_pax_CC, am_PorFacParcial, 
			in_cantpax, Id_Precompra, cd_FormaPagoTAO, cd_TarjetaCreditoTAO, cd_NumeroTarjetaTAO, 
			cd_VencimientoTarjetaTAO, cd_NumeroPolizaTAO, cd_AnexoPolizaTAO, ds_AutorizacionTarjetaTAO, 
			in_cuotasTarjetaTAO, id_FormasPago, id_TarjetasCredito, am_fp1, ds_cc_code, ds_cc_number, 
			ds_cc_vence, ds_cc_autorizacion, ds_cc_voucher, in_cc_cuotas, am_fp2, ds_cc_code2, 
			ds_cc_number2, ds_cc_vence2, ds_cc_autorizacion2, ds_cc_voucher2, in_cc_cuotas2, 
			id_monedas_iata, Tcambio, id_sucursal, id_implante, bl_ahorro, cd_TipoTiqueteGDS, 
			id_TiposDocumento, id_entdist, id_entvend, cd_destino, dt_fechaexped, id_tiqueteadores, 
			id_gds, iden_gds, am_comisionPNR, ds_records, bl_NoCalcComision, bl_NoCalcIvaComision, 
			am_basecomisionable, am_porcomision, id_tiposconceptfac, id_conceptofacturacion, 
			id_tiposservicio, cd_proveedores, ds_servicio, am_valorprov, id_monedaprov, dt_llegada, 
			dt_salida, am_pordescuento, Fecha_Salida, Fecha_Llegada, am_basedescuento, cd_Consecutivo_depende, 
			cd_Consecutivo_variablesadicionales, am_valor_total, ds_proveedores, id_tipoproveedor, cd_tipoproveedor, ds_tipoproveedor,
			id_FormasPagoAirPlus, cd_FormasPagoAirPlus, ds_FormasPagoAirPlus, id_TarjetasCreditoAirPlus,
			cd_TarjetasCreditoAirPlus, ds_numerotarjetaAirPlus, id_reserva,	OrdenGrabacion
		)
		SELECT 
			id_factura = F.Item.value('id_factura[1]','INT'),
			id_item = F.Item.value('id_item[1]','INT'),
			in_tipoitem = F.Item.value('in_tipoitem[1]','INT'),
			tipo_item = F.Item.value('tipo_item[1]','VARCHAR(10)'),
			id_referencia_origen = F.Item.value('id_referencia_origen[1]','INT'),
			cd_fuente=FF.cd_fuente,
			cd_serie=FF.cd_serie,
			cd_consecutivo=FF.cd_consecutivo,
			cd_tiquete = ISNULL(F.Item.value('cd_tiquete[1]','VARCHAR(50)'),''),
			ds_descrip = ISNULL(F.Item.value('ds_descrip[1]','VARCHAR(500)'),''),
			in_nacionalidad = ISNULL(F.Item.value('in_nacionalidad[1]','INT'),0),
			cd_cencosto = ISNULL(F.Item.value('cd_cencosto[1]','VARCHAR(50)'),''),
			cd_auxiliar = ISNULL(F.Item.value('cd_auxiliar[1]','VARCHAR(50)'),''),
			cd_item = ISNULL(F.Item.value('cd_item[1]','VARCHAR(50)'),''),
			am_tarifa = ISNULL(F.Item.value('am_tarifa[1]','MONEY'),0),
			am_iva = ISNULL(F.Item.value('am_iva[1]','MONEY'),0),
			am_tua = ISNULL(F.Item.value('am_tua[1]','MONEY'),0),
			am_comb = ISNULL(F.Item.value('am_comb[1]','MONEY'),0),
			am_vat = ISNULL(F.Item.value('am_vat[1]','MONEY'),0),
			am_Comision = ISNULL(F.Item.value('am_comision[1]','MONEY'),0),
			ds_paxname = ISNULL(F.Item.value('ds_paxname[1]','VARCHAR(30)'),''),
			ds_paxape = ISNULL(F.Item.value('ds_paxape[1]','VARCHAR(30)'),''),
			ds_paxprefix = ISNULL(F.Item.value('ds_paxprefix[1]','VARCHAR(3)'),''),
			cd_tourcode = ISNULL(F.Item.value('cd_tourcode[1]','VARCHAR(25)'),''),
			NumTktConj = F.Item.value('NumTktConj[1]','INT'),
			cd_TipoTiquete = F.Item.value('cd_tipotiquete[1]','VARCHAR(3)'),
			id_air = F.Item.value('id_air[1]','INT'),
			ds_itinerario = ISNULL(F.Item.value('ds_itinerario[1]','VARCHAR(250)'),''),
			ds_itinerarioaerolinea = ISNULL(F.Item.value('ds_itinerarioaerolinea[1]','VARCHAR(128)'),''),
			ds_clases = ISNULL(F.Item.value('ds_clases[1]','VARCHAR(61)'),''),
			ds_Observaciones = ISNULL(F.Item.value('ds_observaciones[1]','VARCHAR(8000)'),''),
			am_highfare = ISNULL(F.Item.value('am_highfare[1]','MONEY'),0),
			am_lowfare = ISNULL(F.Item.value('am_lowfare[1]','MONEY'),0),
			ds_solicita = ISNULL(F.Item.value('ds_solicita[1]','VARCHAR(200)'),''),
			ds_lapsoviaje = ISNULL(F.Item.value('ds_lapsoviaje[1]','VARCHAR(50)'),''),
			cd_tktrevisado = ISNULL(F.Item.value('cd_tktrevisado[1]','VARCHAR(14)'),''),
			cd_PasaportePax = ISNULL(F.Item.value('cd_pasaportepax[1]','VARCHAR(25)'),''),
			cd_pax_CC = ISNULL(F.Item.value('cd_pax_cc[1]','VARCHAR(20)'),''),
			am_PorFacParcial = ISNULL(F.Item.value('am_porfacparcial[1]','MONEY'),100),
			in_cantpax = ISNULL(F.Item.value('in_cantpax[1]','INT'),0),
			Id_Precompra = F.Item.value('id_precompra[1]','INT'),
			cd_FormaPagoTAO = ISNULL(F.Item.value('cd_formapagotao[1]','VARCHAR(3)'),''),
			cd_TarjetaCreditoTAO = ISNULL(F.Item.value('cd_tarjetacreditotao[1]','VARCHAR(4)'),''),
			cd_NumeroTarjetaTAO = ISNULL(F.Item.value('cd_numerotarjetatao[1]','VARCHAR(25)'),''),
			cd_VencimientoTarjetaTAO = ISNULL(F.Item.value('cd_vencimientotarjetatao[1]','VARCHAR(6)'),''),
			cd_NumeroPolizaTAO = ISNULL(F.Item.value('cd_numeropolizatao[1]','VARCHAR(50)'),''),
			cd_AnexoPolizaTAO = ISNULL(F.Item.value('cd_anexopolizatao[1]','VARCHAR(50)'),''),
			ds_AutorizacionTarjetaTAO = ISNULL(F.Item.value('ds_autorizaciontarjetatao[1]','VARCHAR(25)'),''),
			in_cuotasTarjetaTAO = ISNULL(F.Item.value('in_cuotasTarjetatao[1]','INT'),0),
			id_FormasPago = FP.id,
			id_TarjetasCredito = TC.id,
			am_fp1 = ISNULL(F.Item.value('am_fp1[1]','MONEY'),0),
			ds_cc_code = ISNULL(F.Item.value('ds_cc_code[1]','VARCHAR(2)'),''),
			ds_cc_number = ISNULL(F.Item.value('ds_cc_number[1]','VARCHAR(25)'),''),
			ds_cc_vence = ISNULL(F.Item.value('ds_cc_vence[1]','VARCHAR(5)'),''),
			ds_cc_autorizacion = ISNULL(F.Item.value('ds_cc_autorizacion[1]','VARCHAR(25)'),''),
			ds_cc_voucher = ISNULL(F.Item.value('ds_cc_voucher[1]','VARCHAR(25)'),''),
			in_cc_cuotas = ISNULL(F.Item.value('in_cc_cuotas[1]','INT'),0),
			am_fp2 = ISNULL(F.Item.value('am_fp2[1]','MONEY'),0),
			ds_cc_code2 = ISNULL(F.Item.value('ds_cc_code2[1]','VARCHAR(2)'),''),
			ds_cc_number2 = ISNULL(F.Item.value('ds_cc_number2[1]','VARCHAR(25)'),''),
			ds_cc_vence2 = ISNULL(F.Item.value('ds_cc_vence2[1]','VARCHAR(5)'),''),
			ds_cc_autorizacion2 = ISNULL(F.Item.value('ds_cc_autorizacion2[1]','VARCHAR(25)'),''),
			ds_cc_voucher2 = ISNULL(F.Item.value('ds_cc_voucher2[1]','VARCHAR(25)'),''),
			in_cc_cuotas2 = ISNULL(F.Item.value('in_cc_cuotas2[1]','INT'),0),
			id_monedas_iata = M.id,
			Tcambio = ISNULL(F.Item.value('tcambio[1]','MONEY'),1),
			id_sucursal = S.id,
			id_implante = I.id,
			bl_ahorro = ISNULL(F.Item.value('bl_ahorro[1]','BIT'),0),
			cd_TipoTiqueteGDS = ISNULL(F.Item.value('cd_tipotiquetegds[1]','VARCHAR(3)'),''),
			id_TiposDocumento = TD.id,
			id_entdist = ED.id,
			id_entvend = EV.id,
			cd_destino = ISNULL(F.Item.value('cd_destino[1]','VARCHAR(3)'),''),
			dt_fechaexped = F.Item.value('dt_fechaexped[1]','SMALLDATETIME'),
			id_tiqueteadores = TQ.id,
			id_gds = F.Item.value('id_gds[1]','INT'),
			iden_gds = F.Item.value('iden_gds[1]','INT'),
			am_comisionPNR = ISNULL(F.Item.value('am_comisionpnr[1]','MONEY'),0),
			ds_records = ISNULL(F.Item.value('ds_records[1]','VARCHAR(62)'),''),
			bl_NoCalcComision = ISNULL(F.Item.value('bl_nocalccomision[1]','BIT'),0),
			bl_NoCalcIvaComision = ISNULL(F.Item.value('bl_nocalcivacomision[1]','BIT'),0),
			am_basecomisionable = ISNULL(F.Item.value('am_basecomisionable[1]','MONEY'),0),
			am_porcomision = ISNULL(F.Item.value('am_porcomision[1]','MONEY'),0),
			id_tiposconceptfac = CF.id_TiposConceptoFacturacion,
			id_conceptofacturacion = CF.id,
			id_tiposservicio = CASE WHEN TS.id IS NOT NULL THEN TS.id ELSE TSA.id_TipoServicio END,
			cd_proveedores = ISNULL(F.Item.value('cd_proveedores[1]','VARCHAR(25)'),''),
			ds_servicio = ISNULL(F.Item.value('ds_servicio[1]','VARCHAR(250)'),''),
			am_valorprov = ISNULL(F.Item.value('am_valorprov[1]','MONEY'),0),
			id_monedaprov = F.Item.value('id_monedaprov[1]','INT'),
			dt_llegada = F.Item.value('dt_llegada[1]','SMALLDATETIME'),
			dt_salida = F.Item.value('dt_salida[1]','SMALLDATETIME'),
			am_pordescuento = ISNULL(F.Item.value('am_pordescuento[1]','NUMERIC(8,4)'),0),
			Fecha_Salida = F.Item.value('fecha_salida[1]','SMALLDATETIME'),
			Fecha_Llegada = F.Item.value('fecha_llegada[1]','SMALLDATETIME'),
			am_basedescuento = ISNULL(F.Item.value('am_basedescuento[1]','MONEY'),0),
			cd_Consecutivo_depende = ISNULL(F.Item.value('cd_consecutivo_depende[1]','VARCHAR(50)'),''),
			cd_Consecutivo_variablesadicionales = ISNULL(F.Item.value('cd_consecutivo_variablesadicionales[1]','VARCHAR(50)'),''),
			am_valor_total = ISNULL(F.Item.value('am_valor_total[1]','MONEY'),0), 
			ds_proveedores = ISNULL(F.Item.value('ds_proveedores[1]','VARCHAR(25)'),''),
			id_tipoproveedor = ISNULL(TP.id,1),
			cd_tipoproveedor = ISNULL(F.Item.value('cd_tipoproveedor[1]','VARCHAR(25)'),'HTL'),
			ds_tipoproveedor = ISNULL(F.Item.value('ds_tipoproveedor[1]','VARCHAR(50)'),'Hotel'),
			id_FormasPagoAirPlus = F.Item.value('id_formaspagoairplus[1]','INT'),
			cd_FormasPagoAirPlus = ISNULL(F.Item.value('cd_formaspagoairplus[1]','VARCHAR(25)'),''),
			ds_FormasPagoAirPlus = ISNULL(F.Item.value('ds_formaspagoairplus[1]','VARCHAR(50)'),''),
			id_TarjetasCreditoAirPlus = F.Item.value('id_tarjetascreditoairplus[1]','INT'),
			cd_TarjetasCreditoAirPlus = ISNULL(F.Item.value('cd_tarjetascreditoairplus[1]','VARCHAR(25)'),''),
			ds_numerotarjetaAirPlus = ISNULL(F.Item.value('ds_numerotarjetaairplus[1]','VARCHAR(50)'),''),
			id_reserva = F.Item.value('id_reserva[1]','INT'),	
			OrdenGrabacion = ROW_NUMBER() OVER (ORDER BY id_item ASC)
		FROM @xmlData.nodes('/Facturaciones/Facturacion/Item') F(Item)
		LEFT JOIN #Facturacion FF ON FF.id_factura = F.Item.value('id_factura[1]','INT')
		LEFT JOIN dbo.Monedas_IATA M ON M.cd_codigo = F.Item.value('cd_monedas_iata[1]','VARCHAR(25)')
		LEFT JOIN dbo.Sucursales S ON S.cd_codigo = F.Item.value('cd_sucursal[1]','VARCHAR(25)')
		LEFT JOIN dbo.Implantes I ON I.cd_codigo = F.Item.value('cd_implante[1]','VARCHAR(25)')
		LEFT JOIN dbo.FormasPago FP ON FP.cd_codigo = F.Item.value('cd_formasPago[1]','VARCHAR(25)')
		LEFT JOIN dbo.TarjetasCredito TC ON TC.cd_codigo = F.Item.value('cd_tarjetascredito[1]','VARCHAR(25)')
		LEFT JOIN dbo.TiposDocumento TD ON TD.cd_codigo = F.Item.value('cd_tiposdocumento[1]','VARCHAR(25)')
		LEFT JOIN dbo.Entidades ED ON ED.cd_codigo = F.Item.value('cd_entdist[1]','VARCHAR(25)')
		LEFT JOIN dbo.Entidades	EV ON EV.cd_codigo = F.Item.value('cd_entvend[1]','VARCHAR(25)')
		LEFT JOIN dbo.Tiqueteadores	TQ ON TQ.cd_codigo = F.Item.value('cd_tiqueteadores[1]','VARCHAR(25)')
		LEFT JOIN dbo.TiposServicios TS ON TS.cd_codigo = F.Item.value('cd_tiposservicio[1]','VARCHAR(25)')
		LEFT JOIN dbo.ConceptoFacturacion CF ON CF.cd_codigo = F.Item.value('cd_conceptofacturacion[1]','VARCHAR(25)')
		LEFT JOIN dbo.tiposServicio_asignados TSA ON TSA.id_ConceptoFacturacion = CF.id
		LEFT JOIN dbo.TipoProveedores TP ON TP.cd_codigo = F.Item.value('cd_tipoproveedor[1]','VARCHAR(25)')
		
		-- Populate child tables from XML
		DELETE FROM #Pasajeros;
		INSERT INTO #Pasajeros (
			id_facturacion, id_item, in_tipoitem, ds_paxape, ds_paxname, ds_paxprefix, ds_paxClasificacion, cd_voucherpax, cd_paxidentificacion, in_edad, cd_tiquete
		)
		SELECT 
			id_facturacion=ISNULL(P.Pax.value('id_factura[1]', 'INT'),0),
			id_item=ISNULL(P.Pax.value('id_item[1]', 'INT'),0),
			in_tipoitem=ISNULL(P.Pax.value('in_tipoitem[1]', 'INT'),0),
			ds_paxape=ISNULL(P.Pax.value('ds_paxape[1]', 'VARCHAR(50)'),''),
			ds_paxname=ISNULL(P.Pax.value('ds_paxname[1]', 'VARCHAR(50)'),''),
			ds_paxprefix=ISNULL(P.Pax.value('ds_paxprefix[1]', 'VARCHAR(10)'),''),
			ds_paxclasificacion=ISNULL(P.Pax.value('ds_paxclasificacion[1]', 'VARCHAR(10)'),''),
			cd_voucherpax=ISNULL(P.Pax.value('cd_voucherpax[1]', 'VARCHAR(50)'),''),
			cd_paxidentificacion=ISNULL(P.Pax.value('cd_paxidentificacion[1]', 'VARCHAR(50)'),''),
			in_edad=ISNULL(P.Pax.value('in_edad[1]', 'INT'),0),
			cd_tiquete=ISNULL(P.Pax.value('cd_tiquete[1]', 'VARCHAR(50)'),'')
		FROM @xmlData.nodes('/Facturaciones/Facturacion/Item/Pasajeros') P(Pax);

		DELETE FROM #Itinerarios;
		INSERT INTO #Itinerarios (
			id_facturacion, id_item, in_tipoitem, in_orden, ds_origen, ds_destino, ds_clase, dt_llegada, dt_salida, ds_terminal, cd_aerolinea, cd_farebasis, ds_numerovuelo, ds_tipovuelo, am_valor, am_co2
		)
		SELECT 
			id_facturacion=ISNULL(I.Itin.value('id_factura[1]', 'INT'),0),
			id_item=ISNULL(I.Itin.value('id_item[1]', 'INT'),0),
			in_tipoitem=ISNULL(I.Itin.value('in_tipoitem[1]', 'INT'),0),
			in_orden=ISNULL(I.Itin.value('in_orden[1]', 'INT'),0),
			ds_origen=ISNULL(I.Itin.value('ds_origen[1]', 'VARCHAR(25)'),''),
			ds_destino=ISNULL(I.Itin.value('ds_destino[1]', 'VARCHAR(25)'),''),
			ds_clase=ISNULL(I.Itin.value('ds_clase[1]', 'VARCHAR(25)'),''),
			dt_llegada=ISNULL(I.Itin.value('dt_llegada[1]', 'SMALLDATETIME'),'19000101 00:00'),
			dt_salida=ISNULL(I.Itin.value('dt_salida[1]', 'SMALLDATETIME'),'19000101 00:00'),
			ds_terminal=ISNULL(I.Itin.value('ds_terminal[1]', 'VARCHAR(25)'),''),
			cd_aerolinea=ISNULL(I.Itin.value('cd_aerolinea[1]', 'VARCHAR(25)'),''),
			cd_farebasis=ISNULL(I.Itin.value('cd_farebasis[1]', 'VARCHAR(25)'),''),
			ds_numerovuelo=ISNULL(I.Itin.value('ds_numerovuelo[1]', 'VARCHAR(25)'),''),
			ds_tipovuelo=ISNULL(I.Itin.value('ds_tipovuelo[1]', 'VARCHAR(25)'),''),
			am_valor=ISNULL(I.Itin.value('am_valor[1]', 'MONEY'),0),
			am_co2=ISNULL(I.Itin.value('am_co2[1]', 'MONEY'),0)
		FROM @xmlData.nodes('/Facturaciones/Facturacion/Item/itinerarios') I(Itin);

		DELETE FROM #CargosImpuestos;
		INSERT INTO #CargosImpuestos (
			id_facturacion, id_item, in_tipoitem, cd_codigo, ds_nombre, cd_tipo, am_porcentaje, am_contado, am_credito, am_valor, id_carg, id_imp, bl_iva, in_orden
		)
		SELECT 
			id_facturacion=ISNULL(C.Cargo.value('id_factura[1]', 'INT'),0),
			id_item=ISNULL(C.Cargo.value('id_item[1]', 'INT'),0),
			in_tipoitem=ISNULL(C.Cargo.value('in_tipoitem[1]', 'INT'),0),
			cd_codigo=ISNULL(C.Cargo.value('cd_codigo[1]', 'VARCHAR(20)'),''),
			ds_nombre=ISNULL(C.Cargo.value('ds_nombre[1]', 'VARCHAR(100)'),''),
			cd_tipo=ISNULL(C.Cargo.value('cd_tipo[1]', 'CHAR(1)'),''),
			am_porcentaje=ISNULL(C.Cargo.value('am_porcentaje[1]', 'MONEY'),0),
			am_contado=ISNULL(C.Cargo.value('am_contado[1]', 'MONEY'),0),
			am_credito=ISNULL(C.Cargo.value('am_credito[1]', 'MONEY'),0),
			am_valor=ISNULL(C.Cargo.value('am_valor[1]', 'MONEY'),0),
			id_carg=CASE WHEN CD.id IS NOT NULL THEN CD.id ELSE IR.Id_cargo_dep END, 
			id_imp=IR.id, 
			bl_iva=ISNULL(IR.bl_IVA,0),
			in_orden=ISNULL(C.Cargo.value('in_orden[1]', 'INT'),0)
		FROM @xmlData.nodes('/Facturaciones/Facturacion/Item/CargosImpuestos') C(Cargo)
		LEFT JOIN dbo.CargosDesc CD ON CD.cd_codigo=C.Cargo.value('cd_codigo[1]', 'VARCHAR(20)') AND C.Cargo.value('cd_tipo[1]', 'CHAR(1)') IN ('C','D')
		LEFT JOIN dbo.ImpRet IR ON IR.cd_codigo=C.Cargo.value('cd_codigo[1]', 'VARCHAR(20)') AND C.Cargo.value('cd_tipo[1]', 'CHAR(1)') IN ('I','R'); 

		DELETE FROM #FormasPagos;
		INSERT INTO #FormasPagos (
			id_facturacion, id_item, in_tipoitem, id_formaspago, cd_codigo, ds_nombre, id_tarjetascredito, cd_tipotarjeta, ds_numerotarjeta, ds_vouchertarjeta, ds_expiraciontarjeta, ds_autorizaciontarjeta, in_coutas, cd_banco, ds_cheque, ds_plaza, ds_referencia, ds_Poliza, ds_PolizaAnexo, am_valor
		)
		SELECT 
			id_facturacion=ISNULL(F.Pago.value('id_factura[1]', 'INT'),0),
			id_item=ISNULL(F.Pago.value('id_item[1]', 'INT'),0),
			in_tipoitem=ISNULL(F.Pago.value('in_tipoitem[1]', 'INT'),0),
			id_formaspago=ISNULL(FP.id,0),
			cd_codigo=ISNULL(F.Pago.value('cd_codigo[1]', 'VARCHAR(10)'),''),
			ds_nombre=ISNULL(F.Pago.value('ds_nombre[1]', 'VARCHAR(50)'),''),
			id_tarjetascredito=ISNULL(TC.id,0),
			cd_tipotarjeta=ISNULL(F.Pago.value('cd_tipotarjeta[1]', 'VARCHAR(10)'),''),
			ds_numerotarjeta=ISNULL(F.Pago.value('ds_numerotarjeta[1]', 'VARCHAR(50)'),''),
			ds_vouchertarjeta=ISNULL(F.Pago.value('ds_vouchertarjeta[1]', 'VARCHAR(50)'),''),
			ds_expiraciontarjeta=ISNULL(F.Pago.value('ds_expiraciontarjeta[1]', 'VARCHAR(10)'),''),
			ds_autorizaciontarjeta=ISNULL(F.Pago.value('ds_autorizaciontarjeta[1]', 'VARCHAR(50)'),''),
			in_cuotas=ISNULL(F.Pago.value('in_cuotas[1]', 'INT'),0),
			cd_banco=ISNULL(F.Pago.value('cd_banco[1]', 'VARCHAR(50)'),''),
			ds_cheque=ISNULL(F.Pago.value('ds_cheque[1]', 'VARCHAR(50)'),''),
			ds_plaza=ISNULL(F.Pago.value('ds_plaza[1]', 'VARCHAR(50)'),''),
			ds_referencia=ISNULL(F.Pago.value('ds_referencia[1]', 'VARCHAR(50)'),''),
			ds_Poliza=ISNULL(F.Pago.value('ds_Poliza[1]', 'VARCHAR(50)'),''),
			ds_PolizaAnexo=ISNULL(F.Pago.value('ds_PolizaAnexo[1]', 'VARCHAR(50)'),''),
			am_valor=ISNULL(F.Pago.value('am_valor[1]', 'MONEY'),0)
		FROM @xmlData.nodes('/Facturaciones/Facturacion/Item/Formaspago') F(Pago)
		LEFT JOIN dbo.FormasPago FP ON FP.cd_codigo = F.Pago.value('cd_codigo[1]', 'VARCHAR(10)')
		LEFT JOIN dbo.TarjetasCredito TC ON TC.cd_codigo = F.Pago.value('cd_tipotarjeta[1]', 'VARCHAR(10)');

		DELETE FROM #VariablesAdicionales;
		INSERT INTO #VariablesAdicionales (
			id_facturacion, id_item, in_tipoitem, ds_maestro, ds_VariableAdicional, ds_valor, cd_codigo
		)
		SELECT 
			id_facturacion=ISNULL(V.Var.value('id_factura[1]', 'INT'),0),
			id_item=ISNULL(V.Var.value('id_item[1]', 'INT'),0),
			in_tipoitem=ISNULL(V.Var.value('in_tipoitem[1]', 'INT'),0),
			ds_maestro=ISNULL(V.Var.value('ds_maestro[1]', 'VARCHAR(25)'),''),
			ds_VariableAdicional=ISNULL(V.Var.value('ds_VariableAdicional[1]', 'VARCHAR(25)'),''),
			ds_valor=ISNULL(V.Var.value('ds_valor[1]', 'VARCHAR(500)'),''),
			cd_codigo=ISNULL(V.Var.value('cd_codigo[1]', 'VARCHAR(25)'),'')
		FROM @xmlData.nodes('/Facturaciones/Facturacion/Item/Variables') V(Var);
	
	
	--While 1 = 1
	--Begin
		SET @Fecha = GETDATE();
		SELECT @FechaCont=REPLACE(VALOPAR,'/','') FROM dbo.Parametr WHERE PARAMETRO = 'FECHACT'
		

			-- Cursor over unique ReservaFactura in this query result
			DECLARE curInvoices CURSOR LOCAL FOR
			SELECT DISTINCT cd_fuente,cd_serie,cd_consecutivo,id_factura
			FROM #Facturacion;

			OPEN curInvoices;
			FETCH NEXT FROM curInvoices INTO @cd_fuente,@cd_serie,@cd_consecutivo,@id_facturacion;

			WHILE @@FETCH_STATUS = 0
			BEGIN
			
				DELETE FROM #TmpFacturaCargos;
				DELETE FROM #TmpFacturaFormasPago;

				SET IDENTITY_INSERT #TmpFacturaItems ON;
				

				INSERT INTO #TmpFacturaCargos (id_item, cd_codigo, ds_nombre, cd_tipo, am_porcentaje, am_valor, am_contado, am_credito, id_carg, id_imp, bl_iva, in_orden)
				SELECT id_item, cd_codigo, ds_nombre, cd_tipo, am_porcentaje, am_valor, am_contado, am_credito, id_carg, id_imp, bl_iva, in_orden
				FROM #CargosImpuestos
				WHERE id_facturacion = @id_facturacion;

				INSERT INTO #TmpFacturaFormasPago (id_item, id_formaspago, cd_codigo, ds_nombre, id_tarjetascredito, cd_tipotarjeta, ds_numerotarjeta, ds_vouchertarjeta, ds_expiraciontarjeta, ds_autorizaciontarjeta, in_cuotas, cd_banco, ds_cheque, ds_plaza, ds_referencia, ds_Poliza, ds_PolizaAnexo, am_valor)
				SELECT id_item, id_formaspago, cd_codigo, ds_nombre, id_tarjetascredito, cd_tipotarjeta, ds_numerotarjeta, ds_vouchertarjeta, ds_expiraciontarjeta, ds_autorizaciontarjeta, in_coutas, cd_banco, ds_cheque, ds_plaza, ds_referencia, ds_Poliza, ds_PolizaAnexo, am_valor
				FROM #FormasPagos
				WHERE id_facturacion = @id_facturacion;

				-- Fetch header details from the first record in the group

				SELECT TOP 1
					@id_facturacion = id_factura,
					@id_item = id_item,
					@in_tipoitem = in_tipoitem, 
					@ds_cliid = ds_cliid,
					@cd_cliente = cd_cliente,
					@ds_cliname = ds_cliname,
					@ds_clidir = ds_clidir,
					@ds_clicity = ds_clicity,
					@ds_clitel = ds_clitel,
					@ds_ClienteEmail = ds_ClienteEmail,
					@ds_moneda = ds_moneda,
					@cd_vendedor = cd_vendedor,
					@cd_tiqueteador = cd_tiqueteador,
					@am_TasaCambio = am_TasaCambio,
					@cd_tipoventa = cd_tipoventa,
					@cd_licitacion = cd_licitacion,
					@ds_descripcion = ds_descripcion,
					@ds_Observaciones = ds_Observaciones,
					@ds_archivo = ds_archivo,
					@id_reserva = id,
					@cd_reserva = ReservaFactura,
					@cd_sucursal = cd_sucursal,
					@cd_implante = cd_implante,
					@FechaCont = ds_fecha
				FROM #Facturacion
				WHERE cd_fuente = @cd_fuente
					 AND cd_serie = @cd_serie
					 AND cd_consecutivo = @cd_consecutivo

				-- Resolve IDs for headers
				IF ISNULL(@cd_sucursal,'')=''
				BEGIN
					SET @cd_sucursal='OFP'
					SET @cd_implante=NULL
				END
				SELECT @id_sucursal = id FROM dbo.Sucursales WHERE cd_codigo = @cd_sucursal;
				SELECT @id_implante = id FROM dbo.Implantes WHERE cd_codigo = @cd_implante AND id_sucursal = @id_sucursal;
				SELECT @id_monedas_iata = id FROM dbo.Monedas_IATA WHERE cd_codigo = @ds_moneda;
				SELECT @id_tiqueteador = id FROM dbo.Tiqueteadores WHERE cd_codigo = @cd_tiqueteador;
				SELECT @id_tipoventa = id_tipoventa FROM dbo.Tiqueteadores WHERE cd_codigo = @cd_tiqueteador;
				SELECT @cd_bu = cd_bu FROM dbo.Implantes WHERE cd_codigo = @cd_implante AND id_sucursal = @id_sucursal;
				SELECT @cd_bu = cd_bu FROM dbo.Sucursales WHERE cd_codigo = @cd_sucursal AND ISNULL(@cd_bu,'')='';
				IF @id_tipoventa IS NULL SET @id_tipoventa = 1;

				SELECT TOP 1 @am_tcambiousd = am_tasa_cambio FROM dbo.Monedas_IATA WHERE cd_codigo = 'USD';
				IF @am_tcambiousd IS NULL SET @am_tcambiousd = 1.0;

				SELECT @ValorFactura = SUM(
					CASE 
						WHEN tipo_item = 'Aire' THEN (am_tarifa + am_iva + am_tua + am_comb + am_vat)
						ELSE am_tarifa + am_iva + am_vat
					END
				)
				FROM #TmpFacturaItems;

				UPDATE #Facturacion
				SET cd_Consecutivo_variablesadicionales = LEFT(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 10)
				WHERE tipo IN ('SRV','Hotel','Auto') AND cd_Consecutivo_variablesadicionales IS NULL

				-- Build dynamic SQL @SqlStmt
				SET @SqlStmt = '';
				SET @ItemIndex = 1;	
					

				-- Generar cd_Consecutivo_variablesadicionales aleatorio para los servicios padres
				UPDATE #TmpFacturaItems
				SET cd_Consecutivo_variablesadicionales = LEFT(REPLACE(CONVERT(VARCHAR(36), NEWID()), '-', ''), 10)
				WHERE tipo_item IN ('SRV','Hotel','Auto') AND cd_Consecutivo_variablesadicionales IS NULL
				 
				UPDATE C
				SET C.am_valor = ROUND(p.am_valor * (C.am_porcentaje/ 100.0), @NumDecimales),
					C.am_contado = ROUND(p.am_contado * (C.am_porcentaje / 100.0), @NumDecimales),
					C.am_Credito = ROUND(p.am_Credito * (C.am_porcentaje / 100.0), @NumDecimales)
				FROM #TmpFacturaCargos C
				INNER JOIN #TmpFacturaCargos P ON P.id_cargo_temp <> C.id_cargo_temp AND P.id_item = C.id_item AND p.id_carg = C.id_carg AND ISNULL(P.am_valor,0)<>0 AND P.cd_tipo = 'C'
				INNER JOIN #TmpFacturaItems FI ON FI.id_item = C.id_item
				inner join dbo.ConceptoFacturacion CF ON CF.id = FI.id_conceptofacturacion
				WHERE ISNULL(C.am_valor,0)=0 AND ISNULL(C.am_porcentaje,0)<>0 AND C.cd_tipo IN ('I') AND (@CalcularAutoValoresItemFac = 'S' OR CF.bl_CalculoAutoValoresFacturacion=1)	
					  AND CF.id NOT IN(1,2);

				UPDATE FP
				SET FP.am_valor=ISNULL((SELECT SUM(C.am_valor) FROM #TmpFacturaCargos C WHERE C.id_item = FP.id_item AND ISNULL(C.am_valor,0)<>0),FP.am_valor) 
				FROM #TmpFacturaFormasPago FP
				INNER JOIN #TmpFacturaItems FI ON FI.id_item = FP.id_item
				INNER JOIN dbo.ConceptoFacturacion CF ON CF.id = FI.id_conceptofacturacion
				WHERE (@CalcularAutoValoresItemFac = 'S' OR CF.bl_CalculoAutoValoresFacturacion=1)
					  AND CF.id NOT IN(1,2);	
								
				-- Reconstruct dynamic @SqlStmt from tables
				SET @SqlStmt = '';
				SET @ItemIndex = 1;

				DECLARE @gen_id_item INT, @gen_tipo_item VARCHAR(10), @gen_cd_tiquete VARCHAR(50), @gen_ds_descrip VARCHAR(500), @gen_in_nacionalidad INT, @gen_cd_cencosto VARCHAR(50), @gen_cd_auxiliar VARCHAR(50), @gen_cd_item VARCHAR(50), @gen_am_tarifa MONEY, @gen_am_iva MONEY, @gen_am_tua MONEY, @gen_am_comb MONEY, @gen_am_vat MONEY, @gen_am_Comision MONEY, @gen_ds_paxname VARCHAR(30), @gen_ds_paxape VARCHAR(30), @gen_ds_paxprefix CHAR(3), @gen_cd_tourcode VARCHAR(25), @gen_NumTktConj INT, @gen_cd_TipoTiquete CHAR(3), @gen_id_air INT, @gen_ds_itinerario VARCHAR(250), @gen_ds_itinerarioaerolinea VARCHAR(128), @gen_ds_clases VARCHAR(61), @gen_ds_Observaciones VARCHAR(8000), @gen_am_highfare MONEY, @gen_am_lowfare MONEY, @gen_ds_solicita VARCHAR(200), @gen_ds_lapsoviaje VARCHAR(50), @gen_cd_tktrevisado VARCHAR(14), @gen_cd_PasaportePax VARCHAR(25), @gen_cd_pax_CC VARCHAR(20), @gen_am_PorFacParcial MONEY, @gen_in_cantpax INT, @gen_Id_Precompra INT, @gen_id_FormasPago INT, @gen_id_TarjetasCredito INT, @gen_id_sucursal INT, @gen_id_implante INT, @gen_bl_ahorro BIT, @gen_cd_TipoTiqueteGDS VARCHAR(3), @gen_id_TiposDocumento INT, @gen_id_entdist INT, @gen_id_entvend INT, @gen_cd_destino VARCHAR(3), @gen_dt_fechaexped SMALLDATETIME, @gen_id_tiqueteadores INT, @gen_id_gds INT, @gen_iden_gds INT, @gen_am_comisionPNR MONEY, @gen_ds_records VARCHAR(62), @gen_bl_NoCalcComision BIT, @gen_bl_NoCalcIvaComision BIT, @gen_am_basecomisionable MONEY, @gen_am_porcomision MONEY, @gen_id_tiposconceptfac INT, @gen_id_conceptofacturacion INT, @gen_id_tiposservicio INT,@gen_ds_tiposservicio VARCHAR(50), @gen_cd_proveedores VARCHAR(25), @gen_ds_servicio VARCHAR(250), @gen_am_valorprov MONEY, @gen_id_monedaprov INT, @gen_dt_llegada SMALLDATETIME, @gen_dt_salida SMALLDATETIME, @gen_am_pordescuento NUMERIC(8,4), @gen_Fecha_Salida SMALLDATETIME, @gen_Fecha_Llegada SMALLDATETIME, @gen_am_basedescuento MONEY, @gen_cd_Consecutivo_depende VARCHAR(50), @gen_cd_Consecutivo_variablesadicionales VARCHAR(50), @gen_id_referencia_origen INT, @gen_id_tipoproveedor INT, @gen_cd_tipoproveedor VARCHAR(50), @gen_ds_tipoproveedor VARCHAR(250);


				DECLARE curGenItems CURSOR LOCAL FAST_FORWARD FOR
				SELECT 
					id_item, tipo_item, cd_tiquete, ds_descrip, in_nacionalidad, cd_cencosto, cd_auxiliar, cd_item, am_tarifa, am_iva, am_tua, am_comb, am_vat, am_Comision,
					ds_paxname, ds_paxape, ds_paxprefix, cd_tourcode, NumTktConj, cd_TipoTiquete, id_air, ds_itinerario, ds_itinerarioaerolinea, ds_clases, ds_Observaciones,
					am_highfare, am_lowfare, ds_solicita, ds_lapsoviaje, cd_tktrevisado, cd_PasaportePax, cd_pax_CC, am_PorFacParcial, in_cantpax, Id_Precompra,
					id_FormasPago, id_TarjetasCredito, id_sucursal, id_implante, bl_ahorro, cd_TipoTiqueteGDS, id_TiposDocumento, id_entdist, id_entvend,
					cd_destino, dt_fechaexped, id_tiqueteadores, id_gds, iden_gds, am_comisionPNR, ds_records, bl_NoCalcComision, bl_NoCalcIvaComision,
					am_basecomisionable, am_porcomision, id_tiposconceptfac, id_conceptofacturacion, id_tiposservicio, cd_proveedores, ds_servicio,
					am_valorprov, id_monedaprov, dt_llegada, dt_salida, am_pordescuento, Fecha_Salida, Fecha_Llegada, am_basedescuento, cd_Consecutivo_depende, cd_Consecutivo_variablesadicionales, id_referencia_origen, id_tipoproveedor, cd_tipoproveedor, ds_tipoproveedor
				FROM #TmpFacturaItems
				WHERE id_factura=@id_facturacion
				ORDER BY id_item;

				IF OBJECT_ID('tempdb..#TmpVariablesObtenidas') IS NOT NULL DROP TABLE #TmpVariablesObtenidas;
				CREATE TABLE #TmpVariablesObtenidas (
					Iden_Variable INT,
					Nombre VARCHAR(100) COLLATE DATABASE_DEFAULT,
					ValorObtenido VARCHAR(MAX) COLLATE DATABASE_DEFAULT,
					Id_Reserva INT,
					IDEN_Maestro INT,
					cd_Maestro VARCHAR(50) COLLATE DATABASE_DEFAULT
				);

				OPEN curGenItems;
				FETCH NEXT FROM curGenItems INTO 
					@gen_id_item, @gen_tipo_item, @gen_cd_tiquete, @gen_ds_descrip, @gen_in_nacionalidad, @gen_cd_cencosto, @gen_cd_auxiliar, @gen_cd_item, @gen_am_tarifa, @gen_am_iva, @gen_am_tua, @gen_am_comb, @gen_am_vat, @gen_am_Comision,
					@gen_ds_paxname, @gen_ds_paxape, @gen_ds_paxprefix, @gen_cd_tourcode, @gen_NumTktConj, @gen_cd_TipoTiquete, @gen_id_air, @gen_ds_itinerario, @gen_ds_itinerarioaerolinea, @gen_ds_clases, @gen_ds_Observaciones,
					@gen_am_highfare, @gen_am_lowfare, @gen_ds_solicita, @gen_ds_lapsoviaje, @gen_cd_tktrevisado, @gen_cd_PasaportePax, @gen_cd_pax_CC, @gen_am_PorFacParcial, @gen_in_cantpax, @gen_Id_Precompra,
					@gen_id_FormasPago, @gen_id_TarjetasCredito, @gen_id_sucursal, @gen_id_implante, @gen_bl_ahorro, @gen_cd_TipoTiqueteGDS, @gen_id_TiposDocumento, @gen_id_entdist, @gen_id_entvend,
					@gen_cd_destino, @gen_dt_fechaexped, @gen_id_tiqueteadores, @gen_id_gds, @gen_iden_gds, @gen_am_comisionPNR, @gen_ds_records, @gen_bl_NoCalcComision, @gen_bl_NoCalcIvaComision,
					@gen_am_basecomisionable, @gen_am_porcomision, @gen_id_tiposconceptfac, @gen_id_conceptofacturacion, @gen_id_tiposservicio, @gen_cd_proveedores, @gen_ds_servicio,
					@gen_am_valorprov, @gen_id_monedaprov, @gen_dt_llegada, @gen_dt_salida, @gen_am_pordescuento, @gen_Fecha_Salida, @gen_Fecha_Llegada, @gen_am_basedescuento, @gen_cd_Consecutivo_depende, @gen_cd_Consecutivo_variablesadicionales, @gen_id_referencia_origen, @gen_id_tipoproveedor, @gen_cd_tipoproveedor, @gen_ds_tipoproveedor;
			
				WHILE @@FETCH_STATUS = 0
				BEGIN 
					IF @gen_tipo_item IN ('Aire')
					BEGIN

						-- Build cargos / impuestos SQL
						SET @TktSqlStmt = '';
						
						DELETE FROM #TmpVariablesObtenidas;
						IF @gen_id_referencia_origen IS NOT NULL
						BEGIN
							INSERT INTO #TmpVariablesObtenidas
							EXEC dbo.spConfiguracionVariablesObtenerValores 
								@id_usuario = 1, 
								@id_ReservaGDS_Detalles = @gen_id_referencia_origen;
								
							DECLARE @var_Iden_Variable INT, @var_IDEN_Maestro INT, @var_ValorObtenido VARCHAR(MAX);
							DECLARE curVars CURSOR LOCAL FAST_FORWARD FOR
							SELECT Iden_Variable, IDEN_Maestro, ValorObtenido FROM #TmpVariablesObtenidas WHERE ISNULL(ValorObtenido, '') <> '';

							OPEN curVars;
							FETCH NEXT FROM curVars INTO @var_Iden_Variable, @var_IDEN_Maestro, @var_ValorObtenido;
							WHILE @@FETCH_STATUS = 0
							BEGIN
								SET @TktSqlStmt = @TktSqlStmt + ' INSERT INTO dbo.VariableDatosMaestro (Iden_Variable, IDEN_Maestro, cd_maestro, ValorObtenido) VALUES (' + CAST(@var_Iden_Variable AS VARCHAR) + ', ' + CAST(@var_IDEN_Maestro AS VARCHAR) + ', ''' + REPLACE(@gen_cd_tiquete, '''', '''''') + ''', ''' + REPLACE(@var_ValorObtenido, '''', '''''') + ''');' + CHAR(13) + CHAR(10)
								FETCH NEXT FROM curVars INTO @var_Iden_Variable, @var_IDEN_Maestro, @var_ValorObtenido;
							END;
							CLOSE curVars;
							DEALLOCATE curVars;
						END
						
						DECLARE @c_codigo VARCHAR(20), @ds_nombre VARCHAR(100), @cd_tipo CHAR(1), @am_porcentaje NUMERIC(8,4), @am_valor MONEY, @am_contado MONEY, @am_credito MONEY, @id_carg INT, @id_imp INT;
						
						DECLARE @TktImpuestosSqlStmt VARCHAR(MAX) = '';
						
						DECLARE curItemCargos CURSOR LOCAL FAST_FORWARD FOR
						SELECT cd_codigo, ds_nombre, cd_tipo, am_porcentaje, am_valor, am_contado, am_credito, id_carg, id_imp
						FROM #TmpFacturaCargos
						WHERE id_item = @gen_id_item AND cd_tipo IN ('C','D');

						OPEN curItemCargos;
						FETCH NEXT FROM curItemCargos INTO @c_codigo, @ds_nombre, @cd_tipo, @am_porcentaje, @am_valor, @am_contado, @am_credito, @id_carg, @id_imp;
						WHILE @@FETCH_STATUS = 0
						BEGIN
							DECLARE @c_codigotax VARCHAR(20), @ds_nombretax VARCHAR(100), @cd_tipotax CHAR(1), @am_porcentajetax NUMERIC(8,4), @am_valortax MONEY, @am_contadotax MONEY, @am_creditotax MONEY, @id_cargtax INT, @id_imptax INT;
							SET @TktImpuestosSqlStmt='';
							DECLARE curItemTaxes CURSOR LOCAL FAST_FORWARD FOR
							SELECT cd_codigo, ds_nombre, cd_tipo, am_porcentaje, am_valor, am_contado, am_credito, id_carg, id_imp
							FROM #TmpFacturaCargos
							WHERE id_item = @gen_id_item AND id_carg = @id_carg AND cd_tipo IN ('I','R');

							OPEN curItemTaxes;
							FETCH NEXT FROM curItemTaxes INTO @c_codigotax, @ds_nombretax, @cd_tipotax, @am_porcentajetax, @am_valortax, @am_contadotax, @am_creditotax, @id_cargtax, @id_imptax;
							WHILE @@FETCH_STATUS = 0
							BEGIN
								SET @TktImpuestosSqlStmt = @TktImpuestosSqlStmt + CHAR(13) + CHAR(10) + ' EXECUTE dbo.spza_TiqueteImpuestos_Insertar @id_tiquetecargos = @NewCargId, @id_impret = ' + CAST(ISNULL(@id_imptax, 1) AS VARCHAR) + ', @ds_impas = ''' + REPLACE(@ds_nombretax, '''', '''''') + ''',@cd_impcta='''', @am_valor = ' + CAST(@am_valortax AS VARCHAR) + ', @am_contado = ' + CAST(@am_contadotax AS VARCHAR) + ', @am_credito = ' + CAST(@am_creditotax AS VARCHAR) + ', @am_porcentaje = ' + CAST(@am_porcentajetax AS VARCHAR) + ', @id_monedas_iata = @id_monedas_iata, @Tcambio = @Tcambio, @bl_contabilizar=1;'  
								FETCH NEXT FROM curItemTaxes INTO @c_codigotax, @ds_nombretax, @cd_tipotax, @am_porcentajetax, @am_valortax, @am_contadotax, @am_creditotax, @id_cargtax, @id_imptax;
							END
							CLOSE curItemTaxes;
							DEALLOCATE curItemTaxes;

							SET @TktSqlStmt = @TktSqlStmt + CHAR(13) + CHAR(10) + ' EXECUTE dbo.spza_TiqueteCargos_Insertar @id_fac_remision = @NewRmId, @id_fac_factura = @NewFacId, @id_tiquetes = @NewTktId, @id_cargosdesc = ' + CAST(ISNULL(@id_carg, 1) AS VARCHAR) + ', @ds_cargonm = ''' + REPLACE(@ds_nombre, '''', '''''') + ''', @am_valor = ' + CAST(@am_valor AS VARCHAR) + ', @am_contado = ' + CAST(@am_contado AS VARCHAR) + ', @am_credito = ' + CAST(@am_credito AS VARCHAR) + ', @bl_noshow = 0, @id_monedas_iata = @id_monedas_iata, @Tcambio = @Tcambio, @SqlStmt = ''' + REPLACE(@TktImpuestosSqlStmt, '''', '''''') + ''';'  
							
							FETCH NEXT FROM curItemCargos INTO @c_codigo, @ds_nombre, @cd_tipo, @am_porcentaje, @am_valor, @am_contado, @am_credito, @id_carg, @id_imp;
						END
						CLOSE curItemCargos;
						DEALLOCATE curItemCargos;
								

						-- Build Formas de Pago SQL
						DECLARE @fp_id_fp INT, @fp_id_tc INT, @fp_cd_codigo VARCHAR(10), @fp_ds_nombre VARCHAR(50), @fp_cd_tipotarjeta VARCHAR(10), @fp_ds_numerotarjeta VARCHAR(50), @fp_ds_vouchertarjeta VARCHAR(50), @fp_ds_expiraciontarjeta VARCHAR(10), @fp_ds_autorizaciontarjeta VARCHAR(50), @fp_in_cuotas INT, @fp_am_valor MONEY;
						DECLARE curItemFPs CURSOR LOCAL FAST_FORWARD FOR
						SELECT id_formaspago, id_tarjetascredito, cd_codigo, ds_nombre, cd_tipotarjeta, ds_numerotarjeta, ds_vouchertarjeta, ds_expiraciontarjeta, ds_autorizaciontarjeta, in_cuotas, am_valor
						FROM #TmpFacturaFormasPago
						WHERE id_item = @gen_id_item;

						OPEN curItemFPs;
						FETCH NEXT FROM curItemFPs INTO @fp_id_fp, @fp_id_tc, @fp_cd_codigo, @fp_ds_nombre, @fp_cd_tipotarjeta, @fp_ds_numerotarjeta, @fp_ds_vouchertarjeta, @fp_ds_expiraciontarjeta, @fp_ds_autorizaciontarjeta, @fp_in_cuotas, @fp_am_valor;
						WHILE @@FETCH_STATUS = 0
						BEGIN
							SET @TktSqlStmt = @TktSqlStmt + CHAR(13) + CHAR(10) + ' EXECUTE dbo.spza_TiqueteFormasPago_Insertar @id_tiquetes = @NewTktId, @id_fac_factura = @NewFacId, @id_fac_remision = @NewRmId, @id_FormasPago = ' + CAST(@fp_id_fp AS VARCHAR) + ', @ds_fpnm = ''' + REPLACE(@fp_ds_nombre, '''', '''''') + ''', @bl_fprepresenta = 0, @id_TarjetasCredito = ' + ISNULL(CAST(@fp_id_tc AS VARCHAR), 'NULL') + ', @cd_tccode = ' + ISNULL('''' + @fp_cd_tipotarjeta + '''', 'NULL') + ', @ds_tcnumber = ' + ISNULL('''' + @fp_ds_numerotarjeta + '''', 'NULL') + ', @ds_tcvoucher = ' + ISNULL('''' + @fp_ds_vouchertarjeta + '''', 'NULL') + ', @ds_tcexp = ' + ISNULL('''' + @fp_ds_expiraciontarjeta + '''', 'NULL') + ', @cd_idbanco = NULL, @ds_cheque = NULL, @ds_plaza = NULL, @ds_referencia = NULL, @ds_poliza = NULL, @ds_polanexo = NULL, @am_valor = ' + CAST(@fp_am_valor AS VARCHAR) + ', @id_monedas_iata = @id_monedas_iata, @Tcambio = @Tcambio, @ds_tcautorizacion = ' + ISNULL('''' + @fp_ds_autorizaciontarjeta + '''', 'NULL') + ', @in_tccuotas = ' + ISNULL(CAST(@fp_in_cuotas AS VARCHAR),'0') + ';' 
							FETCH NEXT FROM curItemFPs INTO @fp_id_fp, @fp_id_tc, @fp_cd_codigo, @fp_ds_nombre, @fp_cd_tipotarjeta, @fp_ds_numerotarjeta, @fp_ds_vouchertarjeta, @fp_ds_expiraciontarjeta, @fp_ds_autorizaciontarjeta, @fp_in_cuotas, @fp_am_valor;
						END
						CLOSE curItemFPs;
						DEALLOCATE curItemFPs;

						-- Build Itinerarios SQL (inline query, no temp table needed)
						SET @TktItinSqlStmt = '';
						SELECT 
							@TktItinSqlStmt = @TktItinSqlStmt + + CHAR(13) + CHAR(10) + 
							'EXECUTE dbo.spza_TiqueteItinerarios_Insertar 
								@id_fac_factura = @NewFacId, 
								@id_fac_remision = @NewRmId, 
								@id_Tiquetes = @NewTktId, 
								@orden = ' + CAST(in_orden AS VARCHAR) + ', 
								@cd_origen = ''' + ISNULL(ds_origen,'') + ''', 
								@cd_destino = ''' + ISNULL(ds_destino,'') + ''', 
								@cd_clase = ''' + ISNULL(LEFT(ds_clase,1),'') + ''', 
								@fecha_salida = ''' + ISNULL(CONVERT(VARCHAR(10),dt_salida,111),'') + ''', 
								@hora_salida = ''' + ISNULL(CONVERT(VARCHAR(8),dt_salida,108),'') + ''', 
								@hora_llegada = ''' + ISNULL(CONVERT(VARCHAR(8),dt_llegada,108),'') + ''', 
								@terminal = ''' + REPLACE(ISNULL(ds_terminal,''), '''', '''''') + ''', 
								@cd_aero_siglas = ''' + ISNULL(cd_aerolinea,'') + ''', 
								@cd_farebasis = ''' + ISNULL(cd_farebasis,'') + ''', 
								@ds_NumVuelo = ''' + ISNULL(ds_numerovuelo,'') + ''', 
								@ds_TipoVuelo = ''' + ISNULL(ds_tipovuelo,'') + ''', 
								@am_valor = ' + CAST(ISNULL(am_valor, 0) AS VARCHAR) + ', 
								@bl_NoUtilizado = NULL, 
								@am_co2 = ' + CAST(ISNULL(am_co2, 0) AS VARCHAR) + '; '
						FROM #Itinerarios
						WHERE id_item = @gen_id_item
						ORDER BY in_orden;

						SET @SqlStmt = @SqlStmt + CHAR(13) + CHAR(10) + '
						DECLARE @NewTktId_' + CAST(@ItemIndex AS VARCHAR) + ' INT;
						EXECUTE dbo.spza_Tiquete_Vender
							@cd_tiquete = ''' + ISNULL(@gen_cd_tiquete,'') + ''',
							@id_TiposDocumento = ' + ISNULL(CAST(@gen_id_TiposDocumento AS VARCHAR),'NULL') + ',
							@id_entdist = ' + ISNULL(CAST(@gen_id_entdist AS VARCHAR),'1') + ',
							@in_estado = 1,
							@in_nacionalidad = ' + ISNULL(CAST(@gen_in_nacionalidad AS VARCHAR),'1') + ',
							@id_entvend = ' + ISNULL(CAST(@gen_id_entvend AS VARCHAR),'NULL') + ',
							@id_fac_factura = @NewFacId,
							@id_fac_remision = @NewRmId,
							@cd_tktrevisado = ' + ISNULL('''' + @gen_cd_tktrevisado + '''', 'NULL') + ',
							@id_pax = NULL,
							@ds_paxname = ''' + ISNULL(@gen_ds_paxname,'') + ''',
							@ds_paxape = ''' + ISNULL(@gen_ds_paxape,'') + ''',
							@ds_paxprefix = ''' + ISNULL(@gen_ds_paxprefix, '') + ''',
							@cd_paxcedula = ''' + ISNULL(@gen_cd_pax_CC, '') + ''',
							@ds_itinerario = ''' + ISNULL(LEFT(@gen_ds_itinerario, 63),'') + ''',
							@ds_itinerarioaerolinea = ''' + LEFT(ISNULL(@gen_ds_itinerarioaerolinea, ''), 63) + ''',
							@ds_clases = ''' + ISNULL(@gen_ds_clases, '') + ''',
							@dt_fechasalida = ' + ISNULL('''' + CONVERT(VARCHAR, @gen_Fecha_Salida, 120) + '''', 'NULL') + ',
							@dt_fechallegada = ' + ISNULL('''' + CONVERT(VARCHAR, @gen_Fecha_Llegada, 120) + '''', 'NULL') + ',
							@cd_destino = ''' + ISNULL(@gen_cd_destino, '') + ''',
							@dt_fechaexped = ''' + ISNULL(CONVERT(VARCHAR, @gen_dt_fechaexped, 120),'19000101') + ''',
							@id_usuario = 1,
							@id_tiqueteadores = ' + ISNULL(CAST(@gen_id_tiqueteadores AS VARCHAR),'NULL') + ',
							@am_hf = ' + ISNULL(CAST(@gen_am_highfare AS VARCHAR),'0') + ',
							@am_lf = ' + ISNULL(CAST(@gen_am_lowfare AS VARCHAR),'0') + ',
							@am_tarifa = ' + ISNULL(CAST(@gen_am_tarifa AS VARCHAR),'0') + ',
							@cd_ah = ''' + ISNULL(@gen_cd_tourcode, '') + ''',
							@am_desah = 0,
							@id_gds = ' + ISNULL(CAST(@gen_id_gds AS VARCHAR),'NULL') + ',
							@iden_gds = ' + ISNULL(CAST(@gen_iden_gds AS VARCHAR),'NULL') + ',
							@in_numtktconj = ' + ISNULL(CAST(@gen_NumTktConj AS VARCHAR),'0') + ',
							@bl_NoCalcComision = 0,
							@bl_NoCalcIvaComision = 0,
							@am_comisionPNR = ' + ISNULL(CAST(@gen_am_Comision AS VARCHAR),'0') + ',
							@am_basecomisionable = ' + ISNULL(CAST(@gen_am_tarifa AS VARCHAR),'0') + ',
							@am_porcomision = 0,
							@ds_records = ''' + ISNULL(@gen_ds_records,'') + ''',
							@id_hotel = NULL,
							@id_precompra = ' + ISNULL(CAST(@gen_Id_Precompra AS VARCHAR), 'NULL') + ',
							@id_TipoTiquete = NULL,
							@id_ReassonCode = NULL,
							@cencosto_interno = ''' + ISNULL(@gen_cd_cencosto, '') + ''',
							@ds_solicita = ''' + ISNULL(@gen_ds_solicita, '') + ''',
							@ds_lapsoviaje = ''' + ISNULL(@gen_ds_lapsoviaje, '') + ''',
							@id_monedas_iata = @id_monedas_iata,
							@Tcambio = @Tcambio,
							@cd_TiqueteGr = NULL,
							@SqlStmt = ''' + REPLACE(ISNULL(@TktSqlStmt,''), '''', '''''') + ''',
							@SqlStmtItinerarios = ''' + REPLACE(ISNULL(@TktItinSqlStmt,''), '''', '''''') + ''',
							@id_sucursal = @id_sucursal,
							@id_implante = @id_implante,
							@bl_ahorro = ' + CAST(@gen_bl_ahorro AS VARCHAR) + ',
							@cd_TipoTiqueteGDS = ''' + ISNULL(@gen_cd_TipoTiqueteGDS, '') + ''',
							@cd_tourcode = ''' + ISNULL(@gen_cd_tourcode, '') + ''',
							@cd_PasaportePax = ''' + ISNULL(@gen_cd_PasaportePax, '') + ''',
							@am_valor_aerolinea = ' + ISNULL(CAST(@gen_am_tarifa AS VARCHAR),'') + ',
							@am_porcentaje_comision_BackEnd = 0,
							@am_valor_comision_BackEnd = 0,
							@am_PorFacParcial = ' + CAST(ISNULL(@gen_am_PorFacParcial, 100) AS VARCHAR) + ',
							@in_cantpax = ' + CAST(ISNULL(@gen_in_cantpax, 1) AS VARCHAR) + ',
							@OrdenGrabacion = ' + CAST(ISNULL(@ItemIndex, 1) AS VARCHAR) + ',
							@cd_Penalidad = NULL,
							@id_entdistIata = NULL,
							@id_entvendIata = NULL; ';			
					END
					ELSE IF @gen_tipo_item = 'TAO'
					BEGIN 
						-- Build cargos / impuestos SQL
						SET @TaoCargSqlStmt = '';
						
						DECLARE @tc_codigo VARCHAR(20), @tc_ds_nombre VARCHAR(100), @tc_cd_tipo CHAR(1), @tc_am_porcentaje NUMERIC(8,4), @tc_am_valor MONEY, @tc_am_contado MONEY, @tc_am_credito MONEY, @tc_id_carg INT, @tc_id_imp INT;
						
						DECLARE @TaoImpuestosSqlStmt VARCHAR(MAX) = '';
												
						DECLARE curItemTaoCargos CURSOR LOCAL FAST_FORWARD FOR
						SELECT cd_codigo, ds_nombre, cd_tipo, am_porcentaje, am_valor, am_contado, am_credito, id_carg, id_imp
						FROM #TmpFacturaCargos
						WHERE id_item = @gen_id_item AND cd_tipo IN ('C','D');

						OPEN curItemTaoCargos;
						FETCH NEXT FROM curItemTaoCargos INTO @tc_codigo, @tc_ds_nombre, @tc_cd_tipo, @tc_am_porcentaje, @tc_am_valor, @tc_am_contado, @tc_am_credito, @tc_id_carg, @tc_id_imp;
						WHILE @@FETCH_STATUS = 0
						BEGIN
							DECLARE @tc_codigotax VARCHAR(20), @tc_ds_nombretax VARCHAR(100), @tc_cd_tipotax CHAR(1), @tc_am_porcentajetax NUMERIC(8,4), @tc_am_valortax MONEY, @tc_am_contadotax MONEY, @tc_am_creditotax MONEY, @tc_id_cargtax INT, @tc_id_imptax INT;
							SET @TaoImpuestosSqlStmt='';

							DECLARE curItemTaoTaxes CURSOR LOCAL FAST_FORWARD FOR
							SELECT cd_codigo, ds_nombre, cd_tipo, am_porcentaje, am_valor, am_contado, am_credito, id_carg, id_imp
							FROM #TmpFacturaCargos
							WHERE id_item = @gen_id_item AND id_carg=@tc_id_carg AND cd_tipo IN ('I','R');

							OPEN curItemTaoTaxes;
							FETCH NEXT FROM curItemTaoTaxes INTO @tc_codigotax, @tc_ds_nombretax, @tc_cd_tipotax, @tc_am_porcentajetax, @tc_am_valortax, @tc_am_contadotax, @tc_am_creditotax, @tc_id_cargtax, @tc_id_imptax;	
							WHILE @@FETCH_STATUS = 0
							BEGIN
								SET @TaoImpuestosSqlStmt = @TaoImpuestosSqlStmt + CHAR(13) + CHAR(10) + ' EXECUTE dbo.spza_TaoImpuestos_Insertar @id_FacTaoCargos = @NewCargId, @id_impret = ' + CAST(ISNULL(@tc_id_imptax, 1) AS VARCHAR) + ', @ds_impas = ''' + ISNULL(@tc_ds_nombretax,'') + ''', @cd_impcta='''', @am_valor = ' + CAST(ISNULL(@tc_am_valortax,0) AS VARCHAR) + ', @am_contado = ' + CAST(ISNULL(@tc_am_contadotax,0) AS VARCHAR) + ', @am_credito = ' + CAST(ISNULL(@tc_am_creditotax,0) AS VARCHAR) + ', @am_porcentaje=' + CAST(ISNULL(@tc_am_porcentajetax,0) AS VARCHAR) + ', @id_monedas_iata = @id_monedas_iata, @Tcambio = @Tcambio, @bl_contabilizar=1;' 
								FETCH NEXT FROM curItemTaoTaxes INTO @tc_codigotax, @tc_ds_nombretax, @tc_cd_tipotax, @tc_am_porcentajetax, @tc_am_valortax, @tc_am_contadotax, @tc_am_creditotax, @tc_id_cargtax, @tc_id_imptax;
							END
							CLOSE curItemTaoTaxes;
							DEALLOCATE curItemTaoTaxes;

							SET @TaoCargSqlStmt = @TaoCargSqlStmt + CHAR(13) + CHAR(10) + ' EXECUTE dbo.spza_TaoCargos_Insertar @id_fac_remision = @NewRmId, @id_fac_factura = @NewFacId, @Id_Fac_Tao = @NewTaoId, @id_cargosdesc = ' + CAST(ISNULL(@tc_id_carg, 1) AS VARCHAR) + ', @ds_cargonm = ''' + ISNULL(@tc_ds_nombre,'') + ''', @am_valor = ' + CAST(ISNULL(@tc_am_valor,0) AS VARCHAR) + ', @am_contado = ' + CAST(ISNULL(@tc_am_contado,0) AS VARCHAR) + ', @am_credito = ' + CAST(ISNULL(@tc_am_credito,0) AS VARCHAR) + ', @bl_noshow = 0, @id_monedas_iata = @id_monedas_iata, @Tcambio = @Tcambio, @SqlStmt = ''' + REPLACE(ISNULL(@TaoImpuestosSqlStmt,''), '''', '''''') + ''';' 
							FETCH NEXT FROM curItemTaoCargos INTO @tc_codigo, @tc_ds_nombre, @tc_cd_tipo, @tc_am_porcentaje, @tc_am_valor, @tc_am_contado, @tc_am_credito, @tc_id_carg, @tc_id_imp;
						END
						CLOSE curItemTaoCargos;
						DEALLOCATE curItemTaoCargos;
						
						SET @TaoFpSqlStmt = '';
						
						DECLARE @tfp_id_fp INT, @tfp_id_tc INT, @tfp_cd_codigo VARCHAR(10), @tfp_ds_nombre VARCHAR(50), @tfp_cd_tipotarjeta VARCHAR(10), @tfp_ds_numerotarjeta VARCHAR(50), @tfp_ds_vouchertarjeta VARCHAR(50), @tfp_ds_expiraciontarjeta VARCHAR(10), @tfp_ds_autorizaciontarjeta VARCHAR(50), @tfp_in_cuotas INT, @tfp_am_valor MONEY;
						DECLARE curItemTaoFPs CURSOR LOCAL FAST_FORWARD FOR
						SELECT id_formaspago, id_tarjetascredito, cd_codigo, ds_nombre, cd_tipotarjeta , ds_numerotarjeta, ds_vouchertarjeta, ds_expiraciontarjeta, ds_autorizaciontarjeta, in_cuotas, am_valor
						FROM #TmpFacturaFormasPago
						WHERE id_item = @gen_id_item;

						OPEN curItemTaoFPs;
						FETCH NEXT FROM curItemTaoFPs INTO @tfp_id_fp, @tfp_id_tc, @tfp_cd_codigo, @tfp_ds_nombre, @tfp_cd_tipotarjeta, @tfp_ds_numerotarjeta, @tfp_ds_vouchertarjeta, @tfp_ds_expiraciontarjeta, @tfp_ds_autorizaciontarjeta, @tfp_in_cuotas, @tfp_am_valor;
						WHILE @@FETCH_STATUS = 0
						BEGIN
							SET @TaoFpSqlStmt = @TaoFpSqlStmt + CHAR(13) + CHAR(10) + ' EXECUTE dbo.spza_TaoFormasPago_Insertar @Id_Fac_Tao = @NewTaoId, @id_fac_factura = @NewFacId, @id_fac_remision = @NewRmId, @id_formaspago = ' + CAST(@tfp_id_fp AS VARCHAR) + ', @ds_fpnm = ''' + REPLACE(@tfp_ds_nombre, '''', '''''') + ''', @bl_fprepresenta = 0, @id_tarjetascredito = ' + ISNULL(CAST(@tfp_id_tc AS VARCHAR), 'NULL') + ', @cd_tccode = ' + ISNULL('''' + @tfp_cd_tipotarjeta + '''', 'NULL') + ', @ds_tcnumber = ' + ISNULL('''' + @tfp_ds_numerotarjeta + '''', 'NULL') + ', @ds_tcvoucher = ' + ISNULL('''' + @tfp_ds_vouchertarjeta + '''', 'NULL') + ', @ds_tcexp = ' + ISNULL('''' + @tfp_ds_expiraciontarjeta + '''', 'NULL') + ', @cd_idbanco = NULL, @ds_cheque = NULL, @ds_plaza = NULL, @ds_referencia = NULL, @ds_poliza = NULL, @ds_polanexo = NULL, @am_valor = ' + CAST(@tfp_am_valor AS VARCHAR) + ', @id_monedas_iata = @id_monedas_iata, @Tcambio = @Tcambio, @ds_tcautorizacion = ' + ISNULL('''' + @tfp_ds_autorizaciontarjeta + '''', 'NULL') + ', @in_tccuotas = ' + ISNULL(CAST(@tfp_in_cuotas AS VARCHAR), '0') + ';' 
							FETCH NEXT FROM curItemTaoFPs INTO @tfp_id_fp, @tfp_id_tc, @tfp_cd_codigo, @tfp_ds_nombre, @tfp_cd_tipotarjeta, @tfp_ds_numerotarjeta, @tfp_ds_vouchertarjeta, @tfp_ds_expiraciontarjeta, @tfp_ds_autorizaciontarjeta, @tfp_in_cuotas, @tfp_am_valor;
						END
						CLOSE curItemTaoFPs;
						DEALLOCATE curItemTaoFPs;

						SET @SqlStmt = @SqlStmt + CHAR(13) + CHAR(10) +'
						DECLARE @NewTaoId_' + CAST(@ItemIndex AS VARCHAR) + ' INT;
						EXECUTE dbo.spza_Tao_Vender
							@cd_tiquete = ''' + ISNULL(@gen_cd_tiquete, '') + ''',
							@ds_descrip = ''' + ISNULL(@gen_ds_descrip, '') + ''',
							@id_fac_factura = @NewFacId,
							@id_fac_remision = @NewRmId,
							@in_nacionalidad = ' + CAST(ISNULL(@gen_in_nacionalidad,0) AS VARCHAR) + ',
							@cd_cencosto = ''' + ISNULL(@gen_cd_cencosto, '') + ''',
							@cd_aux = ''' + ISNULL(@gen_cd_auxiliar, '') + ''',
							@cd_coditem = ''' + ISNULL(@gen_cd_item, '') + ''',
							@am_basecomisionable = ' + CAST(ISNULL(@gen_am_tarifa,0) AS VARCHAR) + ',
							@am_porcomision = 0,
							@id_monedas_iata = @id_monedas_iata,
							@Tcambio = @Tcambio,
							@OrdenGrabacion = ' + CAST(@ItemIndex AS VARCHAR) + ',
							@SqlStmt = ''' + REPLACE(@TaoCargSqlStmt + @TaoFpSqlStmt, '''', '''''') + '''; '

							
					END
					ELSE IF @gen_tipo_item IN ('SRV','Hotel','Auto')
					BEGIN
						-- Build cargos / impuestos / provider / pax SQL
						SET @SrvSqlStmt = '';
						SET @SrvImpuestosSqlStmt = '';
						
						DELETE FROM #TmpVariablesObtenidas;
						IF @gen_id_referencia_origen IS NOT NULL
						BEGIN
							INSERT INTO #TmpVariablesObtenidas
							EXEC dbo.spConfiguracionVariablesObtenerValores 
								@id_usuario = 1, 
								@id_ReservaGDS_Servicios = @gen_id_referencia_origen;

							DECLARE @var_Iden_Variable_srv INT, @var_IDEN_Maestro_srv INT, @var_ValorObtenido_srv VARCHAR(MAX);
							DECLARE curVarsSrv CURSOR LOCAL FAST_FORWARD FOR
							SELECT Iden_Variable, IDEN_Maestro, ValorObtenido FROM #TmpVariablesObtenidas WHERE ISNULL(ValorObtenido, '') <> '';

							OPEN curVarsSrv;
							FETCH NEXT FROM curVarsSrv INTO @var_Iden_Variable_srv, @var_IDEN_Maestro_srv, @var_ValorObtenido_srv;
							WHILE @@FETCH_STATUS = 0
							BEGIN
								SET @SrvSqlStmt = @SrvSqlStmt +CHAR(13) + CHAR(10)+ ' INSERT INTO dbo.VariableDatosMaestro (Iden_Variable, IDEN_Maestro, cd_maestro, ValorObtenido) VALUES (' + CAST(@var_Iden_Variable_srv AS VARCHAR) + ', ' + CAST(@var_IDEN_Maestro_srv AS VARCHAR) + ', ''' + REPLACE(@gen_cd_Consecutivo_variablesadicionales, '''', '''''') + ''', ''' + REPLACE(@var_ValorObtenido_srv, '''', '''''') + ''');' 
								FETCH NEXT FROM curVarsSrv INTO @var_Iden_Variable_srv, @var_IDEN_Maestro_srv, @var_ValorObtenido_srv;
							END;
							CLOSE curVarsSrv;
							DEALLOCATE curVarsSrv;
						END
						SET @SrvCargSqlStmt = '';
						SET @SrvFpSqlStmt = '';

						DECLARE @sc_codigo VARCHAR(20), @sc_ds_nombre VARCHAR(100), @sc_cd_tipo CHAR(1), @sc_am_porcentaje NUMERIC(8,4), @sc_am_valor MONEY, @sc_am_contado MONEY, @sc_am_credito MONEY, @sc_id_carg INT, @sc_id_imp INT;
						DECLARE @HasTarCargo BIT, @IsFirstCargo BIT;
						
						-- First Pass: accumulate service taxes (impuestos/retenciones)
						-- Second Pass: process cargos and link accumulated taxes to 'TAR' or first cargo
						DECLARE curItemSrvCargos CURSOR LOCAL FAST_FORWARD FOR
						SELECT cd_codigo, ds_nombre, cd_tipo, am_porcentaje, am_valor, am_contado, am_credito, id_carg, id_imp
						FROM #TmpFacturaCargos
						WHERE id_item = @gen_id_item AND cd_tipo IN ('C','D');
						

						OPEN curItemSrvCargos;
						FETCH NEXT FROM curItemSrvCargos INTO @sc_codigo, @sc_ds_nombre, @sc_cd_tipo, @sc_am_porcentaje, @sc_am_valor, @sc_am_contado, @sc_am_credito, @sc_id_carg, @sc_id_imp;
						WHILE @@FETCH_STATUS = 0
						BEGIN
							DECLARE @sc_codigotax VARCHAR(20), @sc_ds_nombretax VARCHAR(100), @sc_cd_tipotax CHAR(1), @sc_am_porcentajetax NUMERIC(8,4), @sc_am_valortax MONEY, @sc_am_contadotax MONEY, @sc_am_creditotax MONEY, @sc_id_cargtax INT, @sc_id_imptax INT;
							SET @SrvImpuestosSqlStmt='';
							DECLARE curItemSrvTaxes CURSOR LOCAL FAST_FORWARD FOR
							SELECT cd_codigo, ds_nombre, cd_tipo, am_porcentaje, am_valor, am_contado, am_credito, id_carg, id_imp
							FROM #TmpFacturaCargos
							WHERE id_item = @gen_id_item AND id_carg=@sc_id_carg AND cd_tipo IN ('I','R');

							OPEN curItemSrvTaxes;
							FETCH NEXT FROM curItemSrvTaxes INTO @sc_codigotax, @sc_ds_nombretax, @sc_cd_tipotax, @sc_am_porcentajetax, @sc_am_valortax, @sc_am_contadotax, @sc_am_creditotax, @sc_id_cargtax, @sc_id_imptax;
							WHILE @@FETCH_STATUS = 0
							BEGIN
								SET @SrvImpuestosSqlStmt = @SrvImpuestosSqlStmt + CHAR(13) + CHAR(10) + ' EXECUTE dbo.spza_ServicioImpuestos_Insertar @id_FacServiciosCargos = @NewCargId, @id_impret = ' + CAST(ISNULL(@sc_id_imptax, 1) AS VARCHAR) + ', @ds_impas = ''' + ISNULL(@sc_ds_nombretax, '') + ''', @cd_impcta = '''', @am_valor = ' + CAST(ISNULL(@sc_am_valortax,0) AS VARCHAR) + ', @am_contado = ' + CAST(ISNULL(@sc_am_contadotax,0) AS VARCHAR) + ', @am_credito = ' + CAST(ISNULL(@sc_am_creditotax,0) AS VARCHAR) + ', @am_porcentaje = ' + CAST(ISNULL(@sc_am_porcentajetax,0) AS VARCHAR) + ', @id_monedas_iata = @id_monedas_iata, @Tcambio = @Tcambio, @bl_contabilizar = 1, @am_deltaCorreccion = 0;' 
								
								FETCH NEXT FROM curItemSrvTaxes INTO @sc_codigotax, @sc_ds_nombretax, @sc_cd_tipotax, @sc_am_porcentajetax, @sc_am_valortax, @sc_am_contadotax, @sc_am_creditotax, @sc_id_cargtax, @sc_id_imptax;
							END
							CLOSE curItemSrvTaxes;
							DEALLOCATE curItemSrvTaxes;

							SET @SrvCargSqlStmt = @SrvCargSqlStmt + CHAR(13) + CHAR(10) + ' EXECUTE dbo.spza_ServicioCargos_Insertar @id_Fac_Servicios = @NewSrvId, @id_cargosdesc = ' + CAST(ISNULL(@sc_id_carg, 1) AS VARCHAR) + ', @ds_cargonm = ''' + ISNULL(@sc_ds_nombre, '') + ''', @am_valor = ' + CAST(ISNULL(@sc_am_valor,0) AS VARCHAR) + ', @am_contado = ' + CAST(ISNULL(@sc_am_contado,0) AS VARCHAR) + ', @am_credito = ' + CAST(ISNULL(@sc_am_credito,0) AS VARCHAR) + ', @bl_noshow = 0, @id_monedas_iata = @id_monedas_iata, @Tcambio = @Tcambio, @SqlStmt = ''' + REPLACE(ISNULL(@SrvImpuestosSqlStmt,''), '''', '''''') + ''';' 
							
							FETCH NEXT FROM curItemSrvCargos INTO @sc_codigo, @sc_ds_nombre, @sc_cd_tipo, @sc_am_porcentaje, @sc_am_valor, @sc_am_contado, @sc_am_credito, @sc_id_carg, @sc_id_imp;
						END
						CLOSE curItemSrvCargos;
						DEALLOCATE curItemSrvCargos;
						 
						-- Build Formas de Pago SQL
						DECLARE @sfp_id_fp INT, @sfp_id_tc INT, @sfp_cd_codigo VARCHAR(10), @sfp_ds_nombre VARCHAR(50), @sfp_cd_tipotarjeta VARCHAR(10), @sfp_ds_numerotarjeta VARCHAR(50), @sfp_ds_vouchertarjeta VARCHAR(50), @sfp_ds_expiraciontarjeta VARCHAR(10), @sfp_ds_autorizaciontarjeta VARCHAR(50), @sfp_in_cuotas INT, @sfp_am_valor MONEY;
						DECLARE curItemSrvFPs CURSOR LOCAL FAST_FORWARD FOR
						SELECT id_formaspago, id_tarjetascredito, cd_codigo, ds_nombre, cd_tipotarjeta, ds_numerotarjeta, ds_vouchertarjeta, ds_expiraciontarjeta, ds_autorizaciontarjeta, in_cuotas, am_valor
						FROM #TmpFacturaFormasPago
						WHERE id_item = @gen_id_item;

						OPEN curItemSrvFPs;
						FETCH NEXT FROM curItemSrvFPs INTO @sfp_id_fp, @sfp_id_tc, @sfp_cd_codigo, @sfp_ds_nombre, @sfp_cd_tipotarjeta, @sfp_ds_numerotarjeta, @sfp_ds_vouchertarjeta, @sfp_ds_expiraciontarjeta, @sfp_ds_autorizaciontarjeta, @sfp_in_cuotas, @sfp_am_valor;
						WHILE @@FETCH_STATUS = 0
						BEGIN
							SET @SrvFpSqlStmt = @SrvFpSqlStmt + CHAR(13) + CHAR(10) +' EXECUTE dbo.spza_ServicioFormasPago_Insertar @id_Fac_Servicios = @NewSrvId, @id_fac_factura = @NewFacId, @id_fac_remision = @NewRmId, @id_formaspago = ' + CAST(@sfp_id_fp AS VARCHAR) + ',@ds_fpnm =' + ISNULL('''' + @sfp_ds_nombre + '''', 'NULL') + ', @am_valor = ' + CAST(@sfp_am_valor AS VARCHAR) + ',@bl_fprepresenta=0 , @id_tarjetascredito = ' + ISNULL(CAST(@sfp_id_tc AS VARCHAR), 'NULL') + ', @cd_tccode = ' + ISNULL('''' +@sfp_cd_tipotarjeta + '''', 'NULL') + ', @ds_tcnumber = ' + ISNULL('''' + @sfp_ds_numerotarjeta + '''', 'NULL') + ', @ds_tcvoucher = ' + ISNULL('''' + @sfp_ds_vouchertarjeta + '''', 'NULL') + ', @ds_tcexp = ' + ISNULL('''' + @sfp_ds_expiraciontarjeta + '''', 'NULL') + ', @ds_tcautorizacion = ' + ISNULL('''' + @sfp_ds_autorizaciontarjeta + '''', 'NULL') + ', @in_tccuotas = ' + ISNULL(CAST(@sfp_in_cuotas AS VARCHAR),'0') + ', @cd_idbanco=NULL, @ds_cheque=NULL,@ds_plaza=NULL,@ds_referencia=NULL, @id_monedas_iata = @id_monedas_iata, @Tcambio = @Tcambio;' 
							FETCH NEXT FROM curItemSrvFPs INTO @sfp_id_fp, @sfp_id_tc, @sfp_cd_codigo, @sfp_ds_nombre, @sfp_cd_tipotarjeta, @sfp_ds_numerotarjeta, @sfp_ds_vouchertarjeta, @sfp_ds_expiraciontarjeta, @sfp_ds_autorizaciontarjeta, @sfp_in_cuotas, @sfp_am_valor;
						END
						CLOSE curItemSrvFPs;
						DEALLOCATE curItemSrvFPs;

						-- Build provider SQL
						SET @SrvProvSqlStmt = '';
						DECLARE @c_id_tipoproveedor INT, @c_cd_tipoproveedor VARCHAR(10), @c_ds_tipoproveedor VARCHAR(100);
						IF ISNULL(@gen_cd_proveedores, '') <> ''
						BEGIN
							SELECT TOP 1 
								@c_id_tipoproveedor = tp.id, 
								@c_cd_tipoproveedor = tp.cd_codigo, 
								@c_ds_tipoproveedor = tp.ds_nombre 
							FROM dbo.TipoProveedores tp WITH(NOLOCK) 
							WHERE tp.cd_codigo = ISNULL(@gen_cd_tipoproveedor,'HTL');

							SELECT @c_cd_proveedores = IDPROVE
								   ,@c_ds_proveedores = RAZONCIAL
							FROM dbo.PROVEEDORES 
							WHERE IDPROVE = @gen_cd_proveedores;
							
							IF @c_id_tipoproveedor IS NOT NULL
							BEGIN
								SET @SrvProvSqlStmt = CHAR(13) + CHAR(10) + ' EXECUTE dbo.spza_ServicioTipoProv_Insertar @id_Fac_Servicios = @NewSrvId, @id_tipoproveedores = ' + CAST(@c_id_tipoproveedor AS VARCHAR) + ', @cd_TipoProveedores = ''' + ISNULL(@c_cd_tipoproveedor,'') + ''', @ds_TipoProveedores = ''' + ISNULL(@c_ds_tipoproveedor,'')+ ''', @cd_proveedores = ''' + ISNULL(@c_cd_proveedores,'')+''', @ds_proveedores = ''' + ISNULL(@c_ds_proveedores,'')+ ''';'
							END;
						END;

						SELECT @gen_ds_tiposservicio = ds_nombre FROM dbo.TiposServicios WHERE id = @gen_id_tiposservicio

						-- Build pax SQL
						SET @SrvPaxSqlStmt = '';
						IF ISNULL(@gen_ds_paxname, '') <> ''
						BEGIN
							SET @SrvPaxSqlStmt = CHAR(13) + CHAR(10) + ' EXECUTE dbo.spza_ServicioPaxAdicional_insertar @FacId = @NewFacId, @RemId = @NewRemId, @id_Fac_Servicios = @NewSrvId, @ds_paxname = ''' + REPLACE(@gen_ds_paxname, '''', '''''') + ''', @ds_paxape = ''' + REPLACE(@gen_ds_paxape, '''', '''''') + ''', @in_edad = NULL, @ds_paxprefix= ''' + @gen_ds_paxprefix + ''', @ds_paxClasificacion = NULL, @cd_voucherpax=NULL, @cd_tiquete=NULL;'
						END;

						SET @SrvSqlStmt = @SrvCargSqlStmt + @SrvFpSqlStmt + @SrvProvSqlStmt;
						
						SET @SqlStmt = @SqlStmt + CHAR(13) + CHAR(10) + '
						DECLARE @NewSrvId_' + CAST(@ItemIndex AS VARCHAR) + ' INT;
						EXECUTE dbo.spza_Servicio_Vender
							@ds_descrip = ''' + ISNULL(@gen_ds_descrip, '') + ''',
							@id_fac_factura = @NewFacId,
							@id_fac_remision = @NewRmId,
							@id_CotizacionServicios = NULL,
							@in_nacionalidad = ' + CAST(ISNULL(@gen_in_nacionalidad,1) AS VARCHAR) + ',
							@cd_cencosto = ' + CASE WHEN ISNULL(@gen_cd_cencosto, '')='' THEN 'NULL' ELSE '' + ISNULL(@gen_cd_cencosto, '') + '' END + ',
							@cd_auxiliar = ''' + ISNULL(@gen_cd_auxiliar, '') + ''',
							@cd_item = ''' + ISNULL(@gen_cd_item, '') + ''',
							@id_tiposconceptfac = ' + ISNULL(CAST(@gen_id_tiposconceptfac AS VARCHAR), 'NULL') + ',
							@id_conceptofacturacion = ' + ISNULL(CAST(@gen_id_conceptofacturacion AS VARCHAR), 'NULL') + ',
							@id_tiposservicio = ' + ISNULL(CAST(@gen_id_tiposservicio AS VARCHAR), 'NULL') + ',
							@cd_tiquete = ' + ISNULL('''' + @gen_cd_tiquete + '''', 'NULL') + ',
							@id_voucherstocks = NULL,
							@cd_voucherPrefijo = NULL,
							@cd_proveedores = ''' + ISNULL(@gen_cd_proveedores, '') + ''',
							@ds_tiposervnm = ''' + ISNULL(@gen_ds_tiposservicio, '') + ''',
							@cd_prov_hotel = NULL,
							@cd_prov_car = NULL,
							@cd_prov_air = NULL,
							@ds_servicio = ''' + ISNULL(@gen_ds_servicio, '') + ''',
							@am_valorprov = ' + CAST(ISNULL(@gen_am_tarifa,0) AS VARCHAR) + ',
							@id_monedaprov = ' + ISNULL(CAST(@id_monedas_iata AS VARCHAR), 'NULL') + ',
							@ds_InfoAdicional = NULL,
							@ds_paxname = ''' + ISNULL(@gen_ds_paxname, '') + ''',
							@ds_paxape = ''' + ISNULL(@gen_ds_paxape, '') + ''',
							@cd_paxtype = ''' + ISNULL(@gen_ds_paxprefix, '') + ''',
							@in_edad = NULL,
							@cd_voucher = NULL,
							@in_cantpax = 1,
							@dt_llegada = ' + ISNULL('''' + CONVERT(VARCHAR, @gen_Fecha_Llegada, 120) + '''', 'NULL') + ',
							@dt_salida = ' + ISNULL('''' + CONVERT(VARCHAR, @gen_Fecha_Salida, 120) + '''', 'NULL') + ',
							@ds_destino = ''' + ISNULL(@gen_cd_destino, '') + ''',
							@id_gds = '+ CAST(ISNULL(@gen_id_gds,1) AS VARCHAR) + ',
							@am_basecomisionable = ' + CAST(ISNULL(@gen_am_basecomisionable,0) AS VARCHAR) + ',
							@am_porcomision = 0,
							@id_tipoplan = NULL,
							@id_acomodacion = NULL,
							@ds_paxClasificacion = NULL,
							@in_dias = NULL,
							@in_noches = NULL,
							@bl_notdomicilionacional=0,
							@CodigoReserva =''' + ISNULL(@gen_ds_records,'') + ''',
							@AnticiposSqlStmt = NULL,
							@PaxAdicionalSqlStmt = ''' + REPLACE(ISNULL(@SrvPaxSqlStmt,''), '''', '''''') + ''', 
							@VoucherAdicionalSqlStmt = NULL,
							@id_monedas_iata = @id_monedas_iata,
							@Tcambio = @Tcambio,
							@Id_GrConcepto = NULL,
							@in_diasSrv = NULL,
							@in_nochesSrv = NULL,
							@OrdenGrabacion = ' + CAST(@ItemIndex AS VARCHAR) + ',
							@Id_Especialista = NULL,
							@am_porcentaje_descuento = ' + CAST(ISNULL(@gen_am_pordescuento, 0) AS VARCHAR) + ',
							@am_valor_descuento = 0,
							@ds_motivo_descuento = NULL,
							@Id_CargosDesc_Descuento = NULL,
							@dt_FechaSalidaSrv = ' + ISNULL('''' + CONVERT(VARCHAR, @gen_Fecha_Salida, 120) + '''', 'NULL') + ',
							@dt_FechaLlegadaSrv = ' + ISNULL('''' + CONVERT(VARCHAR, @gen_Fecha_Llegada, 120) + '''', 'NULL') + ',
							@cd_localizador = NULL,
							@cd_VoucherPax = NULL,
							@am_basecomisionableprov = ' + CAST(ISNULL(@gen_am_basecomisionable,0) AS VARCHAR) + ',
							@am_porcomisionprov = 0,
							@cd_NumeFac = NULL,
							@dt_VenceFac = NULL,
							@Id_AcomodacionSrv = NULL,
							@Id_TipoPlanSrv = NULL,
							@in_habitaciones = NULL,
							@in_habitacionesSrv = NULL,
							@SqlStmt = ''' + REPLACE(@SrvSqlStmt, '''', '''''') + ''',
							@cd_Consecutivo_variablesadicionales = ' + ISNULL('''' + @gen_cd_Consecutivo_variablesadicionales + '''', 'NULL') + ',
							@cd_confirmacion = NULL,
							@ds_confirmadopor = NULL,
							@cd_paxidentificacion = NULL,
							@bl_politicaCancelacion = 0,
							@dt_politicaCancelacion = NULL,
							@id_tipoHabitacion = NULL,
							@cd_Consecutivo_depende = ' + ISNULL('''' + @gen_cd_Consecutivo_depende + '''', 'NULL') + ',
							@id_TarjetaAsistencia = NULL,
							@id_Regiones = NULL,
							@Iden_GDS = NULL,
							@id_sys_entidades = 108,
							@ds_TipoAuto = NULL,
							@ds_Origen = NULL,
							@ds_DirOrigen = NULL,
							@ds_DirDestino = NULL,
							@ds_TipoTarifa = NULL,
							@am_ValorUSD = NULL,
							@ds_NoVuelo = NULL,
							@ds_Vehiculo = NULL,
							@ds_Placa = NULL,
							@ds_CategoriaVehiculo = NULL,
							@ds_NombreConductor = NULL,
							@ds_telefono = NULL,
							@ds_IdiomaConductor = NULL,
							@id_MonedaSrv = ' + ISNULL(CAST(@gen_id_monedaprov AS VARCHAR), 'NULL') + ',
							@id_TipoServicio = NULL,
							@id_Aerolinea = NULL,
							@am_PorFacParcial = 100,
							@ds_GDS = NULL,
							@am_basedescuento = ' + CAST(ISNULL(@gen_am_basedescuento, 0) AS VARCHAR) + ',
							@am_pordescuento = ' + CAST(ISNULL(@gen_am_pordescuento, 0) AS VARCHAR) + '; '

					END;
					SET @ItemIndex = @ItemIndex + 1;
					FETCH NEXT FROM curGenItems INTO 
						@gen_id_item, @gen_tipo_item, @gen_cd_tiquete, @gen_ds_descrip, @gen_in_nacionalidad, @gen_cd_cencosto, @gen_cd_auxiliar, @gen_cd_item, @gen_am_tarifa, @gen_am_iva, @gen_am_tua, @gen_am_comb, @gen_am_vat, @gen_am_Comision,
						@gen_ds_paxname, @gen_ds_paxape, @gen_ds_paxprefix, @gen_cd_tourcode, @gen_NumTktConj, @gen_cd_TipoTiquete, @gen_id_air, @gen_ds_itinerario, @gen_ds_itinerarioaerolinea, @gen_ds_clases, @gen_ds_Observaciones,
						@gen_am_highfare, @gen_am_lowfare, @gen_ds_solicita, @gen_ds_lapsoviaje, @gen_cd_tktrevisado, @gen_cd_PasaportePax, @gen_cd_pax_CC, @gen_am_PorFacParcial, @gen_in_cantpax, @gen_Id_Precompra,
						@gen_id_FormasPago, @gen_id_TarjetasCredito, @gen_id_sucursal, @gen_id_implante, @gen_bl_ahorro, @gen_cd_TipoTiqueteGDS, @gen_id_TiposDocumento, @gen_id_entdist, @gen_id_entvend,
						@gen_cd_destino, @gen_dt_fechaexped, @gen_id_tiqueteadores, @gen_id_gds, @gen_iden_gds, @gen_am_comisionPNR, @gen_ds_records, @gen_bl_NoCalcComision, @gen_bl_NoCalcIvaComision,
						@gen_am_basecomisionable, @gen_am_porcomision, @gen_id_tiposconceptfac, @gen_id_conceptofacturacion, @gen_id_tiposservicio, @gen_cd_proveedores, @gen_ds_servicio,
						@gen_am_valorprov, @gen_id_monedaprov, @gen_dt_llegada, @gen_dt_salida, @gen_am_pordescuento, @gen_Fecha_Salida, @gen_Fecha_Llegada, @gen_am_basedescuento, @gen_cd_Consecutivo_depende, @gen_cd_Consecutivo_variablesadicionales, @gen_id_referencia_origen, @gen_id_tipoproveedor, @gen_cd_tipoproveedor, @gen_ds_tipoproveedor;
				END;
				CLOSE curGenItems;
				DEALLOCATE curGenItems;
				
				-- Execute spza_Factura_Crear inside a TRY CATCH
				SET @FacturaRespuesta = NULL;
				SET @FacturaEstado = NULL;

				BEGIN TRY
					DECLARE @ReturnCode INT;
					DECLARE @FacturaExecSqlStmt NVARCHAR(MAX);

					DECLARE @ZML_VariablesXML XML = (
						SELECT 
							ds_maestro,
							ds_VariableAdicional,
							ds_valor,
							cd_codigo
						FROM #VariablesAdicionales
						WHERE id_facturacion = @id_facturacion 
						FOR XML PATH('Variable'), ROOT('Variables')
					);

					SET @FacturaExecSqlStmt = N'
						EXEC @ReturnCode = dbo.spFacturaCrear' + CHAR(13) + CHAR(10) +
							'@id_usuario = 1,' + CHAR(13) + CHAR(10) +
							'@id_sucursal = ' + ISNULL(CAST(@id_sucursal AS VARCHAR), 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@id_implante = ' + ISNULL(CAST(@id_implante AS VARCHAR), 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@dt_fechacont = ' + ISNULL('''' + CONVERT(VARCHAR, @FechaCont, 120) + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@dt_vence = ' + ISNULL('''' + CONVERT(VARCHAR, @FechaCont, 120) + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@cd_tercero_codigo = ' + ISNULL('''' + REPLACE(@cd_cliente, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@ds_tercero_nombre = ' + ISNULL('''' + REPLACE(@ds_cliname, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@cd_cliente_codigo = ' + ISNULL('''' + REPLACE(@cd_cliente, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@ds_cliente_nombre = ' + ISNULL('''' + REPLACE(@ds_cliname, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@ds_cliente_dir = ' + ISNULL('''' + REPLACE(@ds_clidir, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@ds_cliente_ciudad = ' + ISNULL('''' + REPLACE(@ds_clicity, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@ds_cliente_tel = ' + ISNULL('''' + REPLACE(@ds_clitel, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@ds_cliente_dirdesp = ' + ISNULL('''' + REPLACE(@ds_clidir, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@ds_cliente_email = ' + ISNULL('''' + REPLACE(@ds_ClienteEmail, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@ds_cliente_contacto = ' + ISNULL('''' + REPLACE(@ds_cliname, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@ds_cliente_contacto_email = ' + ISNULL('''' + REPLACE(@ds_ClienteEmail, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@id_monedas_iata = ' + ISNULL(CAST(@id_monedas_iata AS VARCHAR), 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@cd_vendedor = ' + ISNULL('''' + REPLACE(@cd_vendedor, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@id_tiqueteador = ' + ISNULL(CAST(@id_tiqueteador AS VARCHAR), 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@bn_anexo = NULL,' + CHAR(13) + CHAR(10) +
							'@Tcambio = ' + ISNULL(CAST(@am_TasaCambio AS VARCHAR), 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@am_tcambiousd = ' + ISNULL(CAST(@am_tcambiousd AS VARCHAR), 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@id_tipoventa = ' + ISNULL(CAST(@id_tipoventa AS VARCHAR), 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@ds_num_resolucion = '''',' + CHAR(13) + CHAR(10) +
							'@in_num_inicial = 0,' + CHAR(13) + CHAR(10) +
							'@in_num_final = 0,' + CHAR(13) + CHAR(10) +
							'@ds_numeracion_autorizada = NULL,' + CHAR(13) + CHAR(10) +
							'@dt_fecha_resolucion = NULL,' + CHAR(13) + CHAR(10) +
							'@CodigoArchivoFisico = '''',' + CHAR(13) + CHAR(10) +
							'@ds_Observacion = ' + ISNULL('''' + REPLACE(@ds_Observaciones, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@ds_Campo_libre1 = NULL,' + CHAR(13) + CHAR(10) +
							'@ds_Campo_libre2 = NULL,' + CHAR(13) + CHAR(10) +
							'@cd_fuente_Reemplaza = NULL,' + CHAR(13) + CHAR(10) +
							'@cd_serie_Reemplaza = NULL,' + CHAR(13) + CHAR(10) +
							'@cd_consecutivo_Reemplaza = NULL,' + CHAR(13) + CHAR(10) +
							'@ds_Actividad_Economica = NULL,' + CHAR(13) + CHAR(10) +
							'@ds_Tarifa_ICA = NULL,' + CHAR(13) + CHAR(10) +
							'@SqlStmt = ' + ISNULL('''' + REPLACE(@SqlStmt, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@AnticiposSqlStmt = NULL,' + CHAR(13) + CHAR(10) +
							'@TotalFactura = ' + ISNULL(CAST(@ValorFactura AS VARCHAR), 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@TotalCupoCreditoCliente = 0,' + CHAR(13) + CHAR(10) +
							'@bl_BloqueoCupoCredito = 0,' + CHAR(13) + CHAR(10) +
							'@bl_generadaauto = 1,' + CHAR(13) + CHAR(10) +
							'@ds_CotizacionesId = NULL,' + CHAR(13) + CHAR(10) +
							'@Id_Cierre = NULL,' + CHAR(13) + CHAR(10) +
							'@cd_TipoFact = NULL,' + CHAR(13) + CHAR(10) +
							'@id_fac_remisionRelacionada = NULL,' + CHAR(13) + CHAR(10) +
							'@id_fac_facturaRelacionada = NULL,' + CHAR(13) + CHAR(10) +
							'@ds_DescripcionFac = ' + ISNULL('''' + REPLACE(@ds_descripcion, '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@bl_nocont = 0,' + CHAR(13) + CHAR(10) +
							'@ProductosSqlStmt = NULL,' + CHAR(13) + CHAR(10) +
							'@cd_CF_TipoComprobante = NULL,' + CHAR(13) + CHAR(10) +
							'@id_Licitacion = ' + ISNULL(CAST(@cd_licitacion AS VARCHAR), 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@ValorFactura = ' + ISNULL(CAST(@ValorFactura AS VARCHAR), 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@id_Especialista = NULL,' + CHAR(13) + CHAR(10) +
							'@id_tiqueteador_Facturador = NULL,' + CHAR(13) + CHAR(10) +
							'@id_TipoFormaPagoProveedor = NULL,' + CHAR(13) + CHAR(10) +
							'@id_MedioReservacion = NULL,' + CHAR(13) + CHAR(10) +
							'@bl_refacturacion = 0,' + CHAR(13) + CHAR(10) +
							'@bl_comisiona = 0,' + CHAR(13) + CHAR(10) +
							'@cd_fuente_factura = ' + ISNULL(@cd_fuente, 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@cd_serie_factura = ' + ISNULL(@cd_serie, 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@cd_consecutivo_factura = ' + ISNULL(@cd_consecutivo, 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@id_NotasAerolinea = NULL,' + CHAR(13) + CHAR(10) +
							'@bl_interface = 0,' + CHAR(13) + CHAR(10) +
							'@id_evento = NULL,' + CHAR(13) + CHAR(10) +
							'@bl_NoEnviarFacElectronica = 0,' + CHAR(13) + CHAR(10) +
							'@bl_DescontarComisionCxP = 0,' + CHAR(13) + CHAR(10) +
							'@ds_num_resolucion_Adicional = '''',' + CHAR(13) + CHAR(10) +
							'@id_fac_facturaRefacturacion = NULL,' + CHAR(13) + CHAR(10) +
							'@bl_refacturacion_contabilizar_saldos = 0,' + CHAR(13) + CHAR(10) +
							'@ZML_VariablesXML = ' + ISNULL('''' + REPLACE(CAST(@ZML_VariablesXML AS VARCHAR(MAX)), '''', '''''') + '''', 'NULL') + ',' + CHAR(13) + CHAR(10) +
							'@bl_FormatoResumidoFactElectro = 0,' + CHAR(13) + CHAR(10) +
							'@bl_ExigeAdjuntoFactElectro = 0,' + CHAR(13) + CHAR(10) +
							'@bl_omitir_Validar_IVA_facturacion = 0,' + CHAR(13) + CHAR(10) +
							'@ZML_AjusteIvaXML = NULL,' + CHAR(13) + CHAR(10) +
							'@ds_Respuesta = @FacturaRespuesta OUTPUT;';
					--select @FacturaExecSqlStmt
					--ROLLBACK TRAN
					--RETURN 1
					
					EXEC sp_executesql @FacturaExecSqlStmt, 
						N'@FacturaRespuesta VARCHAR(MAX) OUTPUT, @ReturnCode INT OUTPUT', 
						@FacturaRespuesta = @FacturaRespuesta OUTPUT, 
						@ReturnCode = @ReturnCode OUTPUT;
					
					IF @ReturnCode = 0
					BEGIN
						SET @FacturaEstado = 0;
					END
					ELSE
					BEGIN
						SET @FacturaEstado = 1;
						SET @FacturaRespuesta = ISNULL(@FacturaRespuesta, '') + CHAR(13) + CHAR(10) + '--- DYNAMIC EXECUTION TRACE ---' + CHAR(13) + CHAR(10) + ISNULL(@FacturaExecSqlStmt, '');
					END
				END TRY
				BEGIN CATCH
					SET @FacturaEstado = 1;
					SET @FacturaRespuesta = ERROR_MESSAGE() + CHAR(13) + CHAR(10) + '--- DYNAMIC EXECUTION TRACE ---' + CHAR(13) + CHAR(10) + ISNULL(@FacturaExecSqlStmt, '');
				END CATCH
				-- Collect log result
				INSERT INTO @LogResults (invoiceId, success, message)
				VALUES (@id_facturacion, CASE WHEN @FacturaEstado = 0 THEN 1 ELSE 0 END, @FacturaRespuesta);

				FETCH NEXT FROM curInvoices INTO @cd_fuente,@cd_serie,@cd_consecutivo,@id_facturacion;
			END;

			CLOSE curInvoices;
			DEALLOCATE curInvoices;
			
			IF @@TRANCOUNT > 0
				COMMIT TRANSACTION;
			
			SELECT invoiceId, success, message FROM @LogResults;
			RETURN 0
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE 
            @ErrorMessage NVARCHAR(4000),
            @ErrorSeverity INT,
            @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

-- Archivo: spFacturaCrear.sql
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- Eliminar si existe
IF OBJECT_ID('dbo.spFacturaCrear', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spFacturaCrear;
GO
CREATE PROCEDURE [dbo].[spFacturaCrear]
	-- Parametros del procedimiento		
	@id_usuario						INT,  
	@id_sucursal					INT, 
	@id_implante					INT, 
	@dt_fechacont					SMALLDATETIME,
	@dt_vence						SMALLDATETIME ,
	@cd_tercero_codigo				VARCHAR(25) ,
	@ds_tercero_nombre				VARCHAR(250),
	@cd_cliente_codigo				VARCHAR(25), 
	@ds_cliente_nombre				VARCHAR(250),
	@ds_cliente_dir					VARCHAR(250),
	@ds_cliente_ciudad				VARCHAR(40),
	@ds_cliente_tel					VARCHAR(50),
	@ds_cliente_dirdesp				VARCHAR(250),
	@ds_cliente_email				VARCHAR(60),
	@ds_cliente_contacto			VARCHAR(40),
	@ds_cliente_contacto_email		VARCHAR(60),
	@id_monedas_iata				INT,
	@cd_vendedor					CHAR(3),
	@id_tiqueteador					INT,
	@bn_anexo						VARBINARY = NULL ,
	@Tcambio						MONEY = 1,
	@am_tcambiousd					MONEY = 1,
	@id_tipoventa					INT,
	@ds_num_resolucion				VARCHAR(20), 
	@in_num_inicial					NUMERIC(18,0), 
	@in_num_final					NUMERIC(18,0), 
	@ds_numeracion_autorizada		VARCHAR(50),
	@dt_fecha_resolucion			SMALLDATETIME,	
	@CodigoArchivoFisico			VARCHAR(25),
	@ds_Observacion					VARCHAR(8000) ,
	@ds_Campo_libre1				varchar(500),
	@ds_Campo_libre2				varchar(500),
	@cd_fuente_Reemplaza			CHAR(2),
	@cd_serie_Reemplaza				CHAR(2),
	@cd_consecutivo_Reemplaza		CHAR(8),		
	@ds_Actividad_Economica			VARCHAR(10),
	@ds_Tarifa_ICA					VARCHAR(15),	
	@SqlStmt						NVARCHAR(max),
	@AnticiposSqlStmt				NVARCHAR(max)=NULL,
	@TotalFactura					MONEY = 0,
	@TotalCupoCreditoCliente		MONEY = 0,
	@bl_BloqueoCupoCredito			BIT = 0,
	@bl_generadaauto				BIT = 0,
	@ds_CotizacionesId				Varchar(500)= NULL,
	@Id_Cierre						INT = NULL,
	@cd_TipoFact					CHAR(2)= NULL, 
	@id_fac_remisionRelacionada		INT= NULL, 
	@id_fac_facturaRelacionada		INT= NULL, 
	@ds_DescripcionFac				VARCHAR(500)=NULL, 
	@bl_nocont						BIT = 0, 
	@ProductosSqlStmt				NVARCHAR(max)=NULL,
	@cd_CF_TipoComprobante			VARCHAR(15)=NULL,
	@id_Licitacion					INT   =NULL ,
	@ValorFactura					MONEY = 0	,
	@id_Especialista				INT  =NULL,
	@id_tiqueteador_Facturador		INT = NULL,
	@id_TipoFormaPagoProveedor		INT = NULL,
	@id_MedioReservacion			INT = NULL,
	@bl_refacturacion				BIT = 0,
	@bl_comisiona					BIT = 0,
	@cd_fuente_factura				VARCHAR(2)= NULL,
	@cd_serie_factura				VARCHAR(2)= NULL,
	@cd_consecutivo_factura			VARCHAR(8)= NULL,
	@id_NotasAerolinea				INT=NULL,
	@bl_interface					INT = 0,
	@id_evento						INT   =NULL ,
	@bl_NoEnviarFacElectronica		BIT = 0,
	--@bl_FacturaComision			BIT = 0, -- Descontar comision de la CxP de la factura Original
	@bl_DescontarComisionCxP		BIT = 0,	 --Descontar comision de la CxP de la factura Original
	@ds_num_resolucion_Adicional	VARCHAR(20) = '',
	@id_fac_facturaRefacturacion	VARCHAR(8000) = NULL,
	@bl_refacturacion_contabilizar_saldos BIT = 0,
	@ZML_VariablesXML				VARCHAR(MAX) = NULL,
	@bl_FormatoResumidoFactElectro	BIT= 0, 
	@bl_ExigeAdjuntoFactElectro		BIT= 0, 
	@bl_omitir_Validar_IVA_facturacion BIT = 0,
	@ZML_AjusteIvaXML				VARCHAR(MAX) = NULL,
	@ds_Respuesta					VARCHAR(MAX) = NULL OUTPUT
AS
BEGIN
	-- SET NOCOUNT ON: Previene que conjuntos de resultados extras interfieran con 
	-- expresiones SELECT
	SET NOCOUNT ON;

    -- Declaracion e inicializacion de variables
  	DECLARE @bl_permit				BIT 	, -- Permiso de ejecucion del proceso
  			@bl_as 	   				BIT	, -- Auditar exito
	 		@bl_af 					BIT	, -- Auditar fallido	 		
			@procmsg				VARCHAR(8000)	, -- Mensaje devuelto por procedimientos llamados desde este procedimiento
			@Resolucionmsg			VARCHAR(8000)	, -- Mensaje devuelto por procedimientos llamados desde este procedimiento
			@procret 				BIT 			, -- Valor de retorno de los procedimientos llamados desde este procedimiento
			@idproce				int		    	, -- Codigo de proceso
	 		@retry 					BIT			    , -- 1=Reintentar ; 0=Abortar  
	 		@retrycont				INT			    , -- Contador de reintentos
	 		@maxretries 			INT			    , -- Maximo numero de reintentos
	 		@timeout				NVARCHAR(4000)  , -- Tiempo de espera maximo por bloqueo de registros
	 		@stmt 					NVARCHAR(4000)  , -- Cadena de instrucciones T-SQL
			@msg	    			VARCHAR(8000)   , -- Mensaje retornado por el sistema
			@retval					TINYINT 		, -- Valor de retorno de este procedimiento: 0:Exito ; 1:Error(Bloque Catch)
			@cd_serieRC				CHAR(2)			, -- Recibo de caja automatico
			@cd_fuenteRC			CHAR(2)			, -- Recibo de caja automatico
			@cd_consecutivoRC		CHAR(8)			, -- Recibo de caja automatico	
			@cd_serieRCOtr			CHAR(2)			, -- Recibo de caja automatico
			@cd_fuenteRCOtr			CHAR(2)			, -- Recibo de caja automatico
			@cd_consecutivoRCOtr	CHAR(8)			, -- Recibo de caja automatico	
			@NCF					varchar(25)		,
			@FechaCaducidad 		SmallDateTime	,
			@DocumentoCont			Varchar(10)		,
			@Id_SucursalFullFilment INT				,
			@bl_usarimplanteFullFilment INT			, 
			@Id_implanteFullFilment INT				,
			@Id_SucursalResolucion INT				,
			@Id_implanteResolucion INT				,
			@FacturadorElect varchar(50)			;

	SELECT 	@idproce 			 = 93,
			@retry				 = 1,
			@retrycont			 = 0,
			@retval				 = 0;
  	
  	-- Manejo de tiempo de espera y de reintentos por bloqueo de tablas/registros  
   	SELECT @maxretries = convert(INT,Valor) FROM dbo.Parametros WHERE Id = 60 ;
	SELECT @timeout    = convert(NVARCHAR(4000),Valor) FROM dbo.Parametros WHERE Id = 50 ;		
	SET @stmt = N'SET LOCK_TIMEOUT '+ltrim(rtrim(@timeout))
	EXEC sp_executesql @stmt,N''
	
	
	WHILE ((@retry = 1) AND (@retrycont <= @maxretries) )
	BEGIN
		SET @retry = 0;
    
    	-- Bloque TRY
    	BEGIN TRY 

			IF (NOT EXISTS(SELECT id FROM Usuario WHERE Id = @id_usuario) AND ISNULL(@Id_Cierre,0)<>0)
			BEGIN
				SELECT @id_usuario=id_usuario FROM dbo.Cierres WHERE id = @Id_Cierre  
			END
    	    		
    		--Obteniendo informacion de seguridad y auditoria--
			EXEC dbo.spzaProcesoUsuario_Consultar @id_usuario   = @id_usuario       ,
												  @id_proceso   = @idproce 		    , 
												  @bl_permit    = @bl_permit OUTPUT , 
												  @bl_auditsuc  = @bl_as 	 OUTPUT , 
												  @bl_auditfail = @bl_af 	 OUTPUT ;
			IF (@bl_permit = 0)
			BEGIN 
				SET @ds_Respuesta = 'No posee permisos suficientes para ejecutar esta acción.';SET @ds_Respuesta = 'No posee permisos suficientes para ejecutar esta acción.';
				RETURN @retval;
			END 
			
			IF @id_implante = 0
				SET @id_implante = NULL;

			IF NOT EXISTS(SELECT * FROM dbo.Implantes WHERE Implantes.id = @id_implante and Implantes.id_sucursal = @id_sucursal) AND @id_implante IS NOT NULL
			BEGIN
				SET @procmsg = 'El Implante ingresado en la Factura no esta asociado a la sucursal, verifique la configuracion implante - sucursal'
				SET @ds_Respuesta = @procmsg;
				SET @ds_Respuesta = @procmsg;
				RETURN 1 ;
			END	
			
			IF (RTRIM(ISNULL(@cd_vendedor,'')) = '')
			BEGIN 
				SET @ds_Respuesta = 'No ingreso el vendedor de la factura por favor verificar.';SET @ds_Respuesta = 'No ingreso el vendedor de la factura por favor verificar.';
				RETURN @retval;
			END
					 
			--Jramirez - 20180413 - Ticket #17146
			DECLARE @in_dias_vence INT , @ds_msj_rpta VARCHAR(8000)
			--IF EXISTS(Select * From Configuracion_remisiones Where id_cliente=@cd_cliente_codigo AND bl_BloqDiaVence = 1 AND in_dias_vence>=1)
			--BEGIN 
			--	Select @in_dias_vence = in_dias_vence From Configuracion_remisiones Where id_cliente=@cd_cliente_codigo AND bl_BloqDiaVence = 1 AND in_dias_vence>=1
			--	EXEC [spza_Configuracion_remisiones_ConsultarBloqVence]
			--		@id_usuario 		=1			,
			--		@id_cliente  		 = @cd_cliente_codigo,
			--		@in_dias_vence  	= @in_dias_vence,
			--		@bl_devolverMSJ		= 1,
			--		@ds_msj_rpta		= @ds_msj_rpta OUTPUT
			--		IF @ds_msj_rpta <> ''
			--		BEGIN
			--			SET @ds_Respuesta = @cd_cliente_codigo;
			--			RETURN 1 ;
			--		END 
			--END 

			--Iniciando / salvando transaccion dependiendo si ya esta iniciada o no--
		  	BEGIN TRAN;
			
			--Verificamos si tiene sucursal por Full Filment, es decir toma la inf de facturacion de otra sucursal
			SELECT @Id_SucursalFullFilment = sff.Id
			FROM dbo.Sucursales s
			INNER JOIN dbo.Sucursales sff ON sff.id = s.Id_SucursalFullFilment
			WHERE s.id = @id_sucursal and s.bl_usarsucursalFullFilment = 1

			SELECT @Id_implanteFullFilment = iff.id 
			FROM dbo.Implantes i
			INNER JOIN Implantes iff ON iff.id = i.Id_implanteFullFilment
			WHERE i.id=@id_implante 

			--Instrucciones del procedimiento-----------------------------------------
			SET @procmsg = ''  	
			SET @Resolucionmsg = ''		
			DECLARE @cd_serie CHAR(2);
			DECLARE @cd_fuente CHAR(2);
			DECLARE @cd_consecutivo CHAR(8);
			DECLARE @in_ConsecutivoUnicoDocumento INT; --jramirez - 2017/12/05 - Manejo de consecutivo unico
			DECLARE @id_ConsecutivoUnicoDocumento INT; --jramirez - 2017/12/05 - Manejo de consecutivo unico
			DECLARE @id_Contingencia INT;
			Declare @DocumentoCausacionCxP Varchar(15)  --jramirez -- Causacion CxP servicio de terceros
					
			IF @cd_fuente_factura <> '' AND @cd_serie_factura <> '' AND @cd_consecutivo_factura <> '' 
			BEGIN 
				IF EXISTS(SELECT * FROM dbo.fac_factura WHERE fac_factura.cd_fuente = @cd_fuente_factura and fac_factura.cd_serie = @cd_serie_factura AND fac_factura.cd_consecutivo = @cd_consecutivo_factura)
				BEGIN 
					SET @procmsg = 'El Numero de Factura ingresado ya se encuentra en uso'
				END 
				ELSE
				BEGIN
					SELECT @cd_fuente		= @cd_fuente_factura,
						   @cd_serie		= @cd_serie_factura,
						   @cd_consecutivo	= @cd_consecutivo_factura
				END 
			END
			ELSE 
			BEGIN
				
				IF @Id_SucursalFullFilment IS NOT NULL
				BEGIN 
					EXEC @procret = dbo.spza_IncrementaConsecutivo @id_MaeTipoTransacciones			= 2,
													   			@id_sucursal						= @Id_SucursalFullFilment,
													   			@id_implante						= NULL, 
													   			@cd_fuente							= @cd_fuente OUTPUT,
													   			@cd_serie							= @cd_serie	OUTPUT,
													   			@cd_consecutivo						= @cd_consecutivo OUTPUT,
													   			@errmsg								= @procmsg OUTPUT, 
													   			@msg								= @Resolucionmsg OUTPUT,
																@ds_num_resolucion_Adicional		= @ds_num_resolucion_Adicional,
																@in_ConsecutivoUnicoDocumento		= @in_ConsecutivoUnicoDocumento OUTPUT,
																@id_ConsecutivoUnicoDocumento		= @id_ConsecutivoUnicoDocumento OUTPUT,
																@id_Contingencia					= @id_Contingencia OUTPUT;
				END
				ELSE IF @Id_implanteFullFilment IS NOT NULL 
				BEGIN 
					EXEC @procret = dbo.spza_IncrementaConsecutivo @id_MaeTipoTransacciones = 2,
													   			@id_sucursal             = @id_sucursal    ,
													   			@id_implante             = @Id_implanteFullFilment    , 
													   			@cd_fuente               = @cd_fuente     OUTPUT ,
													   			@cd_serie				 = @cd_serie     OUTPUT ,
													   			@cd_consecutivo          = @cd_consecutivo OUTPUT ,
													   			@errmsg					 = @procmsg OUTPUT, 
													   			@msg					 = @Resolucionmsg OUTPUT,
																@ds_num_resolucion_Adicional = @ds_num_resolucion_Adicional,
																@in_ConsecutivoUnicoDocumento		=@in_ConsecutivoUnicoDocumento OUTPUT,
																@id_ConsecutivoUnicoDocumento		= @id_ConsecutivoUnicoDocumento OUTPUT,
																@id_Contingencia					= @id_Contingencia OUTPUT;
				END 
				ELSE 
				BEGIN 
					EXEC @procret = dbo.spza_IncrementaConsecutivo @id_MaeTipoTransacciones = 2,
													   			@id_sucursal             = @id_sucursal    ,
													   			@id_implante             = @id_implante    , 
													   			@cd_fuente               = @cd_fuente     OUTPUT ,
													   			@cd_serie				 = @cd_serie     OUTPUT ,
													   			@cd_consecutivo          = @cd_consecutivo OUTPUT ,
													   			@errmsg					 = @procmsg OUTPUT, 
													   			@msg					 = @Resolucionmsg OUTPUT,
																@ds_num_resolucion_Adicional = @ds_num_resolucion_Adicional,
																@in_ConsecutivoUnicoDocumento		=@in_ConsecutivoUnicoDocumento OUTPUT,
																@id_ConsecutivoUnicoDocumento		= @id_ConsecutivoUnicoDocumento OUTPUT,
																@id_Contingencia					= @id_Contingencia OUTPUT;
				END
			END 	
			IF NOT @procmsg <> ''
			AND EXISTS(SELECT * FROM dbo.fac_factura WHERE fac_factura.cd_fuente = @cd_fuente and fac_factura.cd_serie = @cd_serie AND fac_factura.cd_consecutivo = @cd_consecutivo)
			BEGIN 
				SET @procmsg = 'El Numero de Factura: ' + @cd_fuente + '-' + @cd_serie + @cd_consecutivo + ' ya se encuentra en uso'
			END 


																					   	
			IF (@procmsg <> '') -- Proceso de incremento de consecutivo fallido				
			BEGIN 
				IF @@TRANCOUNT > 0 
				BEGIN 
					ROLLBACK TRAN;	
				END 
				
				IF (@bl_af = 1) --Se debe auditar proceso fallido
				BEGIN 						
				EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce    ,
												 @id_usuario = @id_usuario ,
												 @cd_status  = 1           , 												 
												 @admsg      = @procmsg	   ;	 
				END 		  
				

			    IF @bl_generadaauto=1
				BEGIN
					SET @ds_Respuesta = @procmsg;
				END 
				ELSE
				BEGIN
					SET @ds_Respuesta = @procmsg;
				END
				
				SET @ds_Respuesta = @procmsg + ' '+  ISNULL(@Resolucionmsg,'') +' SUCURSAL:' + CONVERT(VARCHAR(3),ISNULL(@id_sucursal,0))+' IMPLANTE:' + CONVERT(VARCHAR(3),ISNULL(@id_implante,0));
				RETURN 1 ;

			END 

			--Comprobante fiscal
			If  Exists(Select* from parametros where Id=232 and valor='S') 
			And 
			Not Exists(Select * from clientes where IndNCF=1 And idcliente=@cd_cliente_codigo)
			Begin
				 
				Declare @ErrorNCF		Int
				Declare @LoginUsuario	Varchar(250) 
				Declare @BU				Varchar(25)
				
				Select 
					@ErrorNCF	=	0,
					@LoginUsuario	=	Isnull(Login,''),
					@BU		=	CASE 
									WHEN i.id IS NOT NULL AND Isnull(i.cd_bu,'') <> '' THEN i.cd_bu
									WHEN s.id IS NOT NULL AND Isnull(s.cd_bu,'') <> '' THEN i.cd_bu
									ELSE '' 
								END 
				From dbo.Usuario u
				Inner Join dbo.Sucursales s ON s.id = u.id_sucursal
				Left  Join dbo.Implantes i ON i.id = u.id_implante
				Where u.Id=@id_usuario
				

				
				--Esto se hace para republica dominicana por que se necesita generar el NCF dependiendo del tipo de identificacion 
				--del cliente y agencias no permite mandar varias series, entonces se pone la serie en el codigo alterno del tipo 
				--de identificacion.
				DECLARE @cd_serie_NCF VARCHAR(2)
				SET @cd_serie_NCF = @cd_serie
				IF EXISTS(SELECT * FROM dbo.Parametros WHERE Parametros.Id = 240 AND Parametros.Valor = 'República Dominicana')
				BEGIN
					SELECT @cd_serie_NCF = @cd_CF_TipoComprobante
				END 

				Exec @ErrorNCF = spCF_Configuracion
						@Op='Consecutivo',
						@Fuente=@cd_fuente,
						@Series=@Cd_serie_NCF,
						@Usuario=@LoginUsuario,
						@BU=@Bu,
						@AplicacionUsuario='Agencia Minorista SQL',
						@NoFiscal=@NCF Output,
						@FechaCaducidad = @FechaCaducidad OutPut,
						@FechaDocumento = @dt_fechacont
				

				--Parche Comprobante fiscal: NCF es igual al numero de la factura.
				If  Exists(Select* from parametros where Id=431 and valor='S') 
				BEGIN
					SET @NCF = LEFT(@NCF,7)+@CD_CONSECUTIVO

					UPDATE DC 
					SET DC.NCF=FF.NCF
					FROM CF_DOCUMENTOCONTROL DC
					INNER JOIN FAC_FACTURA FF ON FF.CD_FUENTE = DC.FUENTE AND  FF.NUMERO = DC.DOCUMENTO
					WHERE DC.FUENTE = @cd_fuente AND DC.DOCUMENTO = @cd_serie + @cd_consecutivo AND DC.NCF<>FF.NCF
				END 

				IF (@ErrorNCF <> 0 Or @@Error <> 0) -- Proceso de incremento de consecutivo fallido				
				BEGIN 
					Set @procmsg = 'Error en generación de Número de Comprobante Fiscal'
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN;	
					END 
					
					IF (@bl_af = 1) --Se debe auditar proceso fallido
					BEGIN 						
					EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce    ,
													 @id_usuario = @id_usuario ,
													 @cd_status  = 1           , 												 
													 @admsg      = @procmsg	   ;	 
					END 		  
					
					SET @ds_Respuesta = @procmsg;
					SET @ds_Respuesta = @procmsg;
					RETURN 1 ;
				END 
			End
			
			--	Bloqueo Cupo Credito
		 	--IF @bl_BloqueoCupoCredito = 1
		 	--BEGIN 
				--DECLARE @TotalSacCliente MONEY,@Total MONEY, @FechaTran VARCHAR(10)
				--SET @TotalSacCliente = 0
				--SELECT @FechaTran = left(replace(VALOPAR,'/',''),6) FROM Parametr WHERE parametro ='FECHACT'				
				----VALOPAR FROM Parametr WHERE parametro ='FECHACT'				
				
				--SELECT
				--	@TotalSacCliente = sum(SACTFAC)
				--FROM dbo.FACTURAS
				--WHERE IDCLIPRV = @cd_cliente_codigo
				--	AND SACTFAC <> 0
				--	--AND VENCFAC < @FechaTran
				--	AND ANOMESFAC = @FechaTran
				--	AND CLASECP ='C'
					
				--IF @TotalSacCliente = '' OR @TotalSacCliente IS NULL
				--	SET @TotalSacCliente = 0
					
				--SET @Total = @TotalSacCliente + @TotalFactura 
				
				--IF @Total > @TotalCupoCreditoCliente 
				--BEGIN
				--	IF @@TRANCOUNT > 0 
				--	BEGIN 
				--	END					
				--	SELECT 	'El Cliente excedió su Cupo Crédito.' + space(40) + CHAR(10) + CHAR(13) + 
				--		   	'Saldo: ' + convert(VARCHAR,@TotalSacCliente,1) + CHAR(10) + CHAR(13) +
				--		   	'Total Crédito Factura: ' + convert(VARCHAR,@TotalFactura,1) + CHAR(10) + CHAR(13) +
				--		   	'Cupo Crédito: ' + convert(VARCHAR,@TotalCupoCreditoCliente,1) + CHAR(10) + CHAR(13) 
				--		    'Respuesta',
				--			1 AS 'Estado' ;
				--	RETURN 1 ;
				--END 

		 	--END
/*
			--	Validando presupuesto de la licitacion
			IF @id_Licitacion <>0
		 	BEGIN 
			
				DECLARE @RestanteLicitacion MONEY , @presupuestoLicitacion MONEY
				SET	 @RestanteLicitacion = (SELECT dbo.fnza_RestanteLicitacion(@id_Licitacion))
 				SET @presupuestoLicitacion = ISNULL ((SELECT am_presupuesto FROM Licitaciones WHERE id=@id_Licitacion),0)
				IF @ValorFactura > @RestanteLicitacion 
				BEGIN
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN ;		
					END					
					SELECT 	'Ha sobrepasado el presupuesto de la licitación.' + space(40) + CHAR(10) + CHAR(13) + 
							'Presupuesto: ' + convert(VARCHAR,@presupuestoLicitacion,1) + CHAR(10) + CHAR(13) +
						   	'Saldo: ' + convert(VARCHAR,@RestanteLicitacion ,1) + CHAR(10) + CHAR(13) +
						   	'Total Factura: ' + convert(VARCHAR,@ValorFactura,1) + CHAR(10) + CHAR(13) +
							'Valor faltante: ' + convert(VARCHAR,(@RestanteLicitacion-@ValorFactura),1) + CHAR(10) + CHAR(13)	 
						    'Respuesta',
							1 AS 'Estado' ;
					RETURN 1 ;
				END 

		 	END
*/		
			--Datos de resolucion
			--verificamos si el implante depende de otro implante fullfilment
			IF EXISTS(SELECT * FROM dbo.Implantes 
						WHERE id=@id_implante AND bl_usarimplanteFullFilment = 1 AND Id_implanteFullFilment IS NOT NULL)
			BEGIN
				IF EXISTS(	
							SELECT * FROM dbo.Implantes i
							INNER JOIN Implantes iff ON iff.id = i.Id_implanteFullFilment
							WHERE i.id=@id_implante 
								And iff.ds_num_resolucion is not null
								And iff.in_num_inicial <> 0
								And iff.in_num_final <> 0
								And iff.ds_numeracion_autorizada is not null
						) 	
				BEGIN
					SELECT
						@ds_num_resolucion =iff.ds_num_resolucion,
						@dt_fecha_resolucion=iff.dt_fecha_resolucion,
						@in_num_inicial=iff.in_num_inicial,
						@in_num_final =iff.in_num_final,
						@ds_numeracion_autorizada =iff.ds_numeracion_autorizada,
						@Id_SucursalResolucion = i.id_sucursal,
						@Id_implanteResolucion = i.id	
					FROM dbo.Implantes i
					INNER JOIN Implantes iff ON iff.id = i.Id_implanteFullFilment
					WHERE i.id=@id_implante 									
				END 	
				ELSE
				BEGIN 
					SELECT
						@ds_num_resolucion =ds_num_resolucion,
						@dt_fecha_resolucion=dt_fecha_resolucion,
						@in_num_inicial=in_num_inicial,
						@in_num_final =in_num_final,
						@ds_numeracion_autorizada =ds_numeracion_autorizada,
						@Id_SucursalResolucion = id,
						@Id_implanteResolucion = NULL
					FROM Sucursales WHERE id = @id_sucursal					
				END 		
			END 
			--Implante y sucursales normales
			ELSE IF EXISTS(SELECT * FROM dbo.Implantes 
						WHERE id=@id_implante 
						      And ds_num_resolucion is not null
						      And in_num_inicial <> 0
						      And in_num_final <> 0
						      And ds_numeracion_autorizada is not null
						      ) 
			BEGIN
				SELECT
					@ds_num_resolucion =ds_num_resolucion,
					@dt_fecha_resolucion=dt_fecha_resolucion,
					@in_num_inicial=in_num_inicial,
					@in_num_final =in_num_final,
					@ds_numeracion_autorizada =ds_numeracion_autorizada,
					@Id_SucursalResolucion = id_sucursal,
					@Id_implanteResolucion = id
				FROM dbo.Implantes WHERE id = @id_implante
			END
			ELSE
			BEGIN
				IF @Id_SucursalFullFilment is NOT NULL 
				BEGIN 
					SELECT
						@ds_num_resolucion =ds_num_resolucion,
						@dt_fecha_resolucion=dt_fecha_resolucion,
						@in_num_inicial=in_num_inicial,
						@in_num_final =in_num_final,
						@ds_numeracion_autorizada =ds_numeracion_autorizada,
						@Id_SucursalResolucion = Id,
						@Id_implanteResolucion = NULL
					FROM Sucursales WHERE id = @Id_SucursalFullFilment
				END
				ELSE
				BEGIN
					SELECT
						@ds_num_resolucion =ds_num_resolucion,
						@dt_fecha_resolucion=dt_fecha_resolucion,
						@in_num_inicial=in_num_inicial,
						@in_num_final =in_num_final,
						@ds_numeracion_autorizada =ds_numeracion_autorizada,
						@Id_SucursalResolucion = Id,
						@Id_implanteResolucion = NULL
					FROM Sucursales WHERE id = @id_sucursal
				END 
			END

			IF ISNULL(@id_Contingencia,0)<>0
			BEGIN
				IF @id_implante IS NULL
				BEGIN
					SELECT @ds_num_resolucion =R.ds_num_resolucion,
						   @dt_fecha_resolucion=R.dt_fecha_resolucion,
						   @in_num_inicial=R.in_num_inicial,
						   @in_num_final =R.in_num_final,
						   @ds_numeracion_autorizada =R.ds_numeracion_autorizada,
						   @Id_SucursalResolucion = R.id_sucursal,
						   @Id_implanteResolucion = NULL 
					FROM dbo.ConfiguracionTransacciones_Adicionales CA
					INNER JOIN dbo.resoluciones R ON (R.ds_num_resolucion=CA.ds_num_resolucion AND R.id_sucursal = CA.id_sucursal AND R.id_implante IS NULL)  
					WHERE CA.id_transaccion = 2 
	    				AND CA.id_sucursal = @id_sucursal
						AND CA.id_implante IS NULL
						AND CA.cd_fuente=@cd_fuente
						AND CA.cd_serie=@cd_serie
				END
				ELSE
				BEGIN
					SELECT @ds_num_resolucion =R.ds_num_resolucion,
						   @dt_fecha_resolucion=R.dt_fecha_resolucion,
						   @in_num_inicial=R.in_num_inicial,
						   @in_num_final =R.in_num_final,
						   @ds_numeracion_autorizada =R.ds_numeracion_autorizada,
						   @Id_SucursalResolucion = R.id_sucursal,
						   @Id_implanteResolucion = R.id_implante  
					FROM dbo.ConfiguracionTransacciones_Adicionales CA
					INNER JOIN dbo.resoluciones R ON (R.ds_num_resolucion=CA.ds_num_resolucion AND R.id_sucursal = CA.id_sucursal AND R.id_implante=CA.id_implante)  
					WHERE CA.id_transaccion = 2 
	    				AND CA.id_sucursal = @id_sucursal
						AND CA.id_implante = @id_implante
						AND CA.cd_fuente=@cd_fuente
						AND CA.cd_serie=@cd_serie
				END
			END
			--Validamos las resoluciones

			IF EXISTS
					(
						SELECT * 
						FROM dbo.resoluciones 
						WHERE resoluciones.id_sucursal = @Id_SucursalResolucion
						AND (resoluciones.id_implante = @Id_implanteResolucion or @Id_implanteResolucion is NULL)
						AND ds_num_resolucion = @ds_num_resolucion
						AND resoluciones.bl_nopermitirvencidas = 1
						AND resoluciones.dt_Fechavencimiento < GETDATE()
					)
			BEGIN
				IF @@TRANCOUNT > 0 
				BEGIN 
					ROLLBACK TRAN ;		
				END	
				
				--IF @bl_generadaauto=1
				--BEGIN				
				--	SELECT 	'La resolución: ' + @ds_num_resolucion + ' esta Vencida. Verficar parametrizacion en el maestro de resoluciones o los datos de resolución de la sucursal e implante.' AS 'Respuesta', 2 AS 'Estado' ;
				--END
				--ELSE
				--BEGIN
				--	SELECT 	'La resolución: ' + @ds_num_resolucion + ' esta Vencida. Verficar parametrizacion en el maestro de resoluciones o los datos de resolución de la sucursal e implante.' AS 'Respuesta', 1 AS 'Estado' ;
				--END
				
				SET @ds_Respuesta = 'La resolucion: ' + @ds_num_resolucion + ' esta Vencida. Verficar parametrizacion en el maestro de resoluciones o los datos de resolución de la sucursal e implante.';
				RETURN 1 
			END 

			If @Id_Cierre = 0
				SET @Id_Cierre = NULL
			
			/*inicio rgelis 2012/10/31 req.10779*/	
			if (ISNULL(@cd_TipoFact,'')='')
			BEGIN
			    SELECT @cd_TipoFact=RTrim(LTrim(Valor)) FROM dbo.parametros where Id=237				
			END
			/*inicio rgelis 2012/10/31 req.10779*/

			If @id_fac_facturaRelacionada = 0
			BEGIN
				SET @id_fac_facturaRelacionada = NUll
			END

			If @id_fac_remisionRelacionada = 0
			BEGIN
				SET @id_fac_remisionRelacionada = NUll
			END
			
			If @id_Licitacion = 0
			BEGIN
				SET @id_Licitacion = NUll
			END

			If @id_evento = 0
			BEGIN
				SET @id_evento = NUll
			END			
			
			If @id_tiqueteador_Facturador = 0
			BEGIN
				SET @id_tiqueteador_Facturador = NUll
			END	

			If @id_TipoFormaPagoProveedor = 0
			BEGIN
				SET @id_TipoFormaPagoProveedor = NUll
			END			

			If @id_MedioReservacion = 0
			BEGIN
				SET @id_MedioReservacion = NUll
			END

			IF @id_NotasAerolinea=0
			BEGIN
				SET @id_NotasAerolinea=NULL
			END
			
			DECLARE @NewFacId INTEGER 
			
			INSERT INTO dbo.fac_factura
					(
					id_sucursal,
					id_implante,
					cd_fuente,
					cd_serie,
					cd_consecutivo,
					id_usuario,
					dt_fechacont,
					dt_vence,
					cd_tercero_codigo,
					ds_tercero_nombre,
					cd_cliente_codigo,
					ds_cliente_nombre,
					ds_cliente_dir,
					ds_cliente_ciudad,
					ds_cliente_tel,
					ds_cliente_dirdesp,
					ds_cliente_email,
					ds_cliente_contacto,
					ds_cliente_contacto_email,
					id_monedas_IATA,
					am_tcambio,
					cd_vendedor,
					id_tiqueteador,
					bn_anexo,
					ds_num_resolucion, 
					in_num_inicial, 
					in_num_final, 
					ds_numeracion_autorizada,
					dt_fecha_resolucion,
					am_tcambiousd,
					id_tipoventa,
					ds_observacion,
					ds_Campo_libre1,
					ds_Campo_libre2,
					cd_fuente_Reemplaza,
					cd_serie_Reemplaza,
					cd_consecutivo_Reemplaza,											
					ds_Actividad_Economica,
				   	ds_Tarifa_ICA,
					bl_generadaauto,
					Id_Cierre,
					NCF,
					FechaCaducidad,
					cd_TipoFact, 
					id_fac_remisionRelacionada, 
					id_fac_facturaRelacionada, 
					ds_DescripcionFac,	
					bl_nocont, 
					cd_CF_TipoComprobante,
					id_Licitacion, 	
					id_Especialista,	
					id_tiqueteador_Facturador,
					id_TipoFormaPagoProveedor,
					id_MedioReservacion	,
					bl_refacturacion,
					bl_comisiona,
					id_NotasAerolinea,
					bl_interface,
					id_evento,
					bl_NoEnviarFacElectronica,
					bl_DescontarComisionCxP,
					ds_num_resolucion_Adicional,
					bl_refacturacion_contabilizar_saldos,
					in_ConsecutivoUnicoDocumento,
					id_ConsecutivoUnicoDocumento,
					id_Contingencia,
					bl_FormatoResumidoFactElectro, 
					bl_ExigeAdjuntoFactElectro 
					)
				VALUES 
					(
					@id_sucursal,
					@id_implante,
					@cd_fuente,
					@cd_serie,
					@cd_consecutivo,
					@id_usuario,
					@dt_fechacont,
					@dt_vence,
					@cd_tercero_codigo,
					@ds_tercero_nombre,
					@cd_cliente_codigo,
					@ds_cliente_nombre,
					@ds_cliente_dir,
					@ds_cliente_ciudad,
					@ds_cliente_tel,
					@ds_cliente_dirdesp,
					@ds_cliente_email,
					@ds_cliente_contacto,
					@ds_cliente_contacto_email,
					@id_monedas_iata,
					@Tcambio,
					@cd_vendedor,
					@id_tiqueteador,
					@bn_anexo,
					@ds_num_resolucion, 
					@in_num_inicial, 
					@in_num_final, 
					@ds_numeracion_autorizada,
					@dt_fecha_resolucion,
					@am_tcambiousd,
					@id_tipoventa,
					@ds_Observacion,
					@ds_Campo_libre1,
					@ds_Campo_libre2,
					@cd_fuente_Reemplaza,
					@cd_serie_Reemplaza,
					@cd_consecutivo_Reemplaza,											
					@ds_Actividad_Economica,
				  	@ds_Tarifa_ICA,
					@bl_generadaauto,
					@Id_Cierre,
					@NCF,
					@FechaCaducidad,
					@cd_TipoFact,
					@id_fac_remisionRelacionada , 
					@id_fac_facturaRelacionada, 
					@ds_DescripcionFac,	
					@bl_nocont, 
					@cd_CF_TipoComprobante,
					@id_Licitacion,	
					@id_Especialista,
					@id_tiqueteador_Facturador,
					@id_TipoFormaPagoProveedor,
					@id_MedioReservacion ,
					@bl_refacturacion,
					@bl_comisiona,
					@id_NotasAerolinea,
					@bl_interface,
					@id_evento,
					@bl_NoEnviarFacElectronica,
					@bl_DescontarComisionCxP,
					@ds_num_resolucion_Adicional,
					@bl_refacturacion_contabilizar_saldos,
					@in_ConsecutivoUnicoDocumento,
					@id_ConsecutivoUnicoDocumento,
					@id_Contingencia,
					@bl_FormatoResumidoFactElectro, 
					@bl_ExigeAdjuntoFactElectro 
					)
			
			SET @NewFacId = scope_identity() 
						
			--Grabando Items y Formas de Pago
			--PRINT '--- INICIO DE SQLSTMT ---';
			--PRINT CAST(@SqlStmt AS NTEXT);
			--PRINT '--- FIN DE SQLSTMT ---';
			EXEC dbo.sp_executesql @SqlStmt, N'@NewFacId int, @NewRmId int, @FechaFac smalldatetime, @id_monedas_iata int, @Tcambio money, @id_sucursal int, @id_implante int', @NewFacId, NULL, @dt_fechacont, @id_monedas_iata, @Tcambio, @id_sucursal, @id_implante
			
			--Grabando Anticipos de Clientes
			EXEC dbo.sp_executesql @AnticiposSqlStmt, N'@NewFacId int, @NewRemId int', @NewFacId, NULL

			--Grabando Productos
			EXEC dbo.sp_executesql @ProductosSqlStmt, N'@NewFacId int, @NewRemId int', @NewFacId, NULL			
			
			Declare @ValidarProveedor  Varchar(8000)
			set @ValidarProveedor   = ''
			SELECT @ValidarProveedor = @ValidarProveedor + 'El Proveedor: "' + rtrim(Fac_servicios.cd_proveedores) + '" ingresado en el servicio: "' + rtrim(Fac_servicios.ds_servicio) + '" no existe' + char(10) + Char(13)
			FROM Fac_servicios 
			LEFT JOIN Proveedores On Proveedores.IdProve = Fac_servicios.cd_proveedores
			WHERE Id_fac_factura = @NewFacId AND ISNULL(cd_proveedores,'') <> '' AND Proveedores.IdProve IS NULL
			
			IF isnull(@ValidarProveedor,'') <> '' 
			begin
				IF @@TRANCOUNT > 0 
				BEGIN 
					ROLLBACK TRAN ;		
				END
				SET @ds_Respuesta = @ValidarProveedor;
				RETURN @retval;
			end


			Declare @ValidarSrvAsociado  Varchar(8000)
			set @ValidarSrvAsociado   = ''
			SELECT @ValidarSrvAsociado = @ValidarSrvAsociado + 'El Items: "' + CASE WHEN ISNULL(fs.ds_servicio,'')<>'' THEN rtrim(fs.ds_servicio) ELSE rtrim(fs.ds_descrip) END + '" no tiene servicio asociado y el concepto de facturación: "' + rtrim(cf.ds_nombre) + '" lo exige' + char(10) + Char(13)
			FROM Fac_servicios fs
			INNER JOIN ConceptoFacturacion cf  On cf.id = fs.id_ConceptoFacturacion
			WHERE Id_fac_factura = @NewFacId AND ISNULL(cf.bl_ExigirServicioAsociado,0) <> 0 AND fs.id_Fac_Servicios_Depende IS NULL
			
			IF isnull(@ValidarSrvAsociado,'') <> '' 
			begin
				IF @@TRANCOUNT > 0 
				BEGIN 
					ROLLBACK TRAN ;		
				END
				SET @ds_Respuesta = @ValidarSrvAsociado;
				RETURN @retval;
			end

			--inicio dzuniga 2016/08/05 Req.32444 relacionar a las facturas la nueva factura refacturada
			IF @id_fac_facturaRefacturacion IS NOT NULL
			BEGIN
				INSERT INTO fac_factura_Refacturacion
				(
					id_fac_factura ,
					Id_fac_factura_Refacturacion ,
					dt_fecha_refacturacion,
					id_usuario
				)
				SELECT 
					codigo,
					@NewFacId,
					getdate(),
					@id_usuario
				FROM DBO.fnSplit(@id_fac_facturaRefacturacion,',',0,1) t
			END
			
			--inicio dzuniga 2016/08/05 Req.32444

			--Grabamos los Id de las cotizaciones asociadas a las facturas.
			If @ds_CotizacionesId Is Not Null
			Begin
				Declare @Count Int, @MaxFile Int, @Id_Cotizacion Int
				Declare @NSrvCotz Int, @NSrvFac Int
				Declare @TotalCotizacion MONEY, @TotalSrvCotizaFac MONEY 
				Declare @TempCot Table(id Numeric Identity( 1,1) NOT NULL,  IdC Int);
				Insert Into @TempCot(IdC)
				EXEC SpSplitMejorado @ds_CotizacionesId,','
				Set @MaxFile = @@ROWCOUNT
				
				Insert Into dbo.Cotizacion_facturas (id_cotizacion, id_fac_factura)
				Select Idc,@NewFacId From @TempCot 
					
				Set @Count = 1
				While @Count <= @MaxFile
				Begin
					Select @Id_Cotizacion = IdC From @TempCot Where Id = @Count
					Select @NSrvCotz = Count(Id) From CotizacionServicios Where Id_Cotizacion = @Id_Cotizacion
					Select @NSrvFac = Count(Id) From CotizacionServicios Where Id_Cotizacion = @Id_Cotizacion and (Id_fac_Factura is not null or Id_fac_remision is not null)
					Select @TotalSrvCotizaFac=dbo.fnza_Get_CotizacionFacturaTotal(@Id_Cotizacion) --inicio rgelis 2017/08/11 req.51825
					Select @TotalCotizacion=dbo.fnza_Get_CotizacionTotal(@Id_Cotizacion)
					
					If @TotalCotizacion>@TotalSrvCotizaFac
					Begin
						Update Cotizacion Set in_estado = Case When bl_CerrarCotizacion = 1 AND bl_grupos = 1 Then 3 Else 2 End
						where Id = @Id_cotizacion
					End
					Else If @NSrvCotz <> @NSrvFac AND @NSrvCotz > 1 
					Begin
						--Parcialmente Liquidada
						Update Cotizacion Set in_estado = Case When bl_CerrarCotizacion = 1 AND bl_grupos = 1 Then 3 Else 2 End --Req. 32437 - JARG
						where Id = @Id_cotizacion
					End 
					Else 
					Begin
						--Liquidada
						Update Cotizacion Set in_estado = 3
						where Id = @Id_cotizacion
					End 
					Set @Count = @Count + 1
				End				
			End
			--inserción de comisiones al crear la factura
			DECLARE @Id_Factura VARCHAR(18), @EstadoInsertarComisiones Int, @MsjInsertarComisiones Varchar(8000)
			Set @EstadoInsertarComisiones = 1
			SET @Id_Factura=CONVERT(VARCHAR(18),@NewFacId)+','
			EXEC @retval=dbo.spza_Factura_InsertarComisiones 
							@id_usuario=@id_usuario
							, @id_Facturas=@Id_Factura
							, @Estado=@EstadoInsertarComisiones
							, @Msj=@MsjInsertarComisiones
							, @MostrarMsj ='N'
				
			--inserción de comisiones al crear la factura
						
			-- validacion de las categorias de clientes
			DECLARE @EstadoCategorias Int, @MsjCategorias Varchar(8000)
			Set @EstadoCategorias = 1
			IF @bl_interface = 0
			BEGIN
				EXEC @retval=dbo.spza_Factura_ValidarClientes_Categorias  
								@id_usuario=@id_usuario
								, @id_fac_factura=@NewFacId
								, @Estado=@EstadoCategorias OUTPUT
								, @Msj=@MsjCategorias OUTPUT
								, @MostrarMsj ='N'
				IF @retval<>0
				BEGIN 
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN ;		
					END
					SET @ds_Respuesta = @MsjCategorias;
					RETURN @retval;
				END
			END						
			--validacion de las categorias de clientes
			
		
			DECLARE @Estado Int, @Msj Varchar(8000),@id_Sys_EstadosNota INT
			Set @Estado = 1
			EXEC @retval=dbo.spza_Factura_ValidarAnticiposClientes   
							@id_usuario=@id_usuario
							, @id_fac_factura=@NewFacId
							, @Estado=@Estado OUTPUT
							, @Msj=@Msj OUTPUT
							, @MostrarMsj ='N'
			IF @retval<>0
			BEGIN 
				IF @@TRANCOUNT > 0 
				BEGIN 
					ROLLBACK TRAN ;		
				END
				SET @ds_Respuesta = @Msj;
				RETURN @retval;
			END					
			
			SELECT @id_Sys_EstadosNota=id FROM dbo.Sys_Estados p WHERE p.id_sys_entidades = 27 AND p.bl_generacontabilizacion = 1 AND p.bl_sys = 1
			UPDATE dbo.NotasAerolinea
			SET id_fac_factura=@NewFacId
			   ,id_sys_estados=@id_Sys_EstadosNota 
			WHERE id = @id_NotasAerolinea
			
			-- Cuando la factura tiene un solo item, validar que el tipofac de la factura sea el mismo del item
			If exists(Select * From dbo.Parametros Where Id = 284 And Valor = 'S')
			Begin
				SET @cd_TipoFact = '';
				
				SELECT TOP(1) @cd_TipoFact=cf.cd_TipoFact  
				FROM dbo.Fac_Factura f
					INNER JOIN dbo.Tiquetes t ON t.id_fac_factura = f.id
					INNER JOIN dbo.ConceptoFacturacion cf ON cf.id=t.in_nacionalidad
				WHERE F.Id = @NewFacId
					AND ISNULL(@cd_TipoFact,'')=''
				ORDER BY t.id DESC;

				SELECT TOP(1) @cd_TipoFact=cf.cd_TipoFact  
				FROM dbo.Fac_Factura f
					INNER JOIN dbo.fac_TAO ft ON ft.id_fac_factura = f.id
					INNER JOIN dbo.ConceptoFacturacion cf ON cf.id=ft.in_nacionalidad+3
				WHERE F.Id = @NewFacId
					AND ISNULL(@cd_TipoFact,'')=''
				ORDER BY ft.id DESC;

				SELECT TOP(1) @cd_TipoFact=cf.cd_TipoFact 
				FROM dbo.Fac_Factura f
					INNER JOIN dbo.Fac_Servicios s ON s.id_fac_factura = f.id
					INNER JOIN dbo.ConceptoFacturacion cf ON cf.id=s.id_ConceptoFacturacion
				WHERE F.Id = @NewFacId
					AND ISNULL(@cd_TipoFact,'')=''
				ORDER BY s.id DESC;

				IF (ISNULL(@cd_TipoFact,'')='' OR ISNULL(@cd_TipoFact,'')='RM')
				BEGIN
					 SELECT @cd_TipoFact = RTRIM(LTRIM(Valor)) FROM dbo.Parametros WHERE Id = 237 ;
				END

				UPDATE dbo.Fac_Factura
				Set cd_TipoFact = @cd_TipoFact
				WHERE Id = @NewFacId
			End 
			-- Cuando la factura tiene un solo item, validar que el tipofac de la factura sea el mismo del item
			IF @bl_generadaauto=1 
			BEGIN
				SELECT 
					@bl_ExigeAdjuntoFactElectro = bl_ExigeAdjuntoFactElectro
				FROM dbo.Configuracion_remisiones 
				WHERE id_cliente=@cd_cliente_codigo

				IF @bl_ExigeAdjuntoFactElectro = 1
				BEGIN
					UPDATE dbo.fac_factura 
					SET bl_ExigeAdjuntoFactElectro=@bl_ExigeAdjuntoFactElectro
					WHERE id = @NewFacId
						 AND bl_ExigeAdjuntoFactElectro=0
				END
			END 
			--Facturacion Electronica
			If Exists (Select * from Parametros Where Id=306 and valor='S' AND @bl_NoEnviarFacElectronica=0 AND ISNULL(@id_Contingencia,0)=0)
			BEGIN
				if EXISTS (SELECT * FROM dbo.FUENTES WHERE IDFUENTE = @cd_fuente AND (ManejaFacturaEnLinea = 1 OR ManejaFacturaDeContingencia = 1))
				BEGIN 
					Declare @Documentra Varchar(10)
					Set @Documentra =@cd_Serie + @cd_consecutivo
					Set @Retval = 0
					Exec @Retval = SpFacturaElectronica_Peticion  
										@Categoria = 'Documentos'
										, @Operacion = 'INSERT'
										, @Llave1 = @cd_fuente
										, @Llave2 = @Documentra
										, @Llave3 = ''
										, @Llave4 = ''
										, @Fecha = @dt_fechacont	

					IF (@Retval <> 0 Or @@Error <> 0) -- Proceso fallido				
					BEGIN 
						Set @procmsg = 'Error en generación de Facturación Electrónica'
						IF @@TRANCOUNT > 0 
						BEGIN 
							ROLLBACK TRAN;	
						END 
					
						IF (@bl_af = 1) --Se debe auditar proceso fallido
						BEGIN 						
						EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce    ,
															@id_usuario = @id_usuario ,
															@cd_status  = 1           , 												 
															@admsg      = @procmsg	   ;	 
						END 		  
					
						SET @ds_Respuesta = @procmsg;
						RETURN 1 ;
					END 
				END 				
			End
			IF ISNULL(@id_Contingencia,0)<>0
			BEGIN
				Declare @DocumentraC Varchar(10)
				Set @DocumentraC =@cd_Serie + @cd_consecutivo
				Set @Retval = 0
				Exec @Retval = dbo.[SpContingencias]	 
						@Op				= 'RegDocContingenciaEvento'
					,	@Id				= @id_Contingencia
					,	@Codigo			= NULL
					,	@Nombre			= ''
					,	@Descripcion	= ''
					,	@Tipo			= ''
					,	@FuenteTal		= '' 
					,	@SerieTal		= ''
					,	@FechaInicio	= ''
					,	@Fechafin		= ''
					,	@Estado			= ''
					,	@Usuario		= ''
					,	@FuenteConsulta = @cd_fuente
					,	@SerieConsulta	= @cd_Serie
					,	@Documento		= @DocumentraC
					,	@ZxmlFuentes	= ''
				
				IF (@Retval <> 0 Or @@Error <> 0) -- Proceso fallido				
				BEGIN 
					Set @procmsg = 'Error en guardar de el documento de contingencia'
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN;	
					END 
					
					IF (@bl_af = 1) --Se debe auditar proceso fallido
					BEGIN 						
					EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce    ,
														@id_usuario = @id_usuario ,
														@cd_status  = 1           , 												 
														@admsg      = @procmsg	   ;	 
					END 		  
					
					SET @ds_Respuesta = @procmsg;
					RETURN 1 ;
				END 
			END
			
			IF EXISTS(SELECT * FROM dbo.Configuracion_remisiones WHERE id_cliente = @cd_cliente_codigo AND (bl_ExentoIva=1 or bl_ExentoIva2=1)) AND @bl_interface = 0
			BEGIN
				Set @Estado = 1	   
			    EXEC @retval=dbo.spza_Factura_ValidarClienteExentoIva  
							@id_usuario=@id_usuario
							, @id_fac_factura=@NewFacId
							, @Estado=@Estado OUTPUT
							, @Msj=@Msj OUTPUT
							, @MostrarMsj ='N'
				IF @retval<>0
				BEGIN 
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN ;		
					END
					SET @ds_Respuesta = @Msj;
					RETURN @retval;
				END
			END
			

			
			IF EXISTS(SELECT * From dbo.Parametros WHERE Id = 399 And RTRIM(Valor) = 'S')
			BEGIN
				Set @Estado = 1	   
			    EXEC @retval=dbo.spza_Factura_ValidarTiqueteAutorizacionPagoTC  
							@id_usuario=@id_usuario
							, @id_fac_factura=@NewFacId
							, @Estado=@Estado OUTPUT
							, @Msj=@Msj OUTPUT
							, @MostrarMsj ='N'
				IF @retval<>0
				BEGIN 
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN ;		
					END
					SET @ds_Respuesta = @Msj;
					RETURN @retval;
				END
			END
			

			
			IF EXISTS(SELECT * From dbo.Parametros WHERE Id = 448 And RTRIM(Valor) = 'S')
			BEGIN
				Set @Estado = 1	   
			    EXEC @retval=dbo.spza_Factura_ValidarTiqueteFormasPago  
							@id_usuario=@id_usuario
							, @id_fac_factura=@NewFacId
							, @Estado=@Estado OUTPUT
							, @Msj=@Msj OUTPUT
							, @MostrarMsj ='N'
				IF @retval<>0
				BEGIN 
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN ;		
					END
					SET @ds_Respuesta = @Msj;
					RETURN @retval;
				END
			END
			

			DECLARE @MsjAlerta AS VARCHAR(8000)
			IF ISNULL(@id_Licitacion,0) <> 0
			BEGIN

				Set @Estado = 1	
			    EXEC @retval=dbo.spza_Factura_AfectarLicitacion  @id_usuario=@id_usuario,@id_Licitacion=@id_Licitacion, @id_fac_factura=@NewFacId
				IF @retval<>0
				BEGIN 
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN ;		
					END
					SET @ds_Respuesta = 'Error afectando la licitación';
					RETURN @retval;
				END
				
				Set @Estado = 1	 
			    EXEC @retval=dbo.spza_Factura_ValidarLicitacion  
							@id_usuario=@id_usuario
							, @id_fac_factura=@NewFacId
							, @Estado=@Estado OUTPUT
							, @Msj=@Msj OUTPUT
							, @MsjAlerta=@MsjAlerta OUTPUT
							, @MostrarMsj ='N'
				IF @retval<>0
				BEGIN 
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN ;		
					END
					SET @ds_Respuesta = @Msj;
					RETURN @retval;
				END
			END
			

			IF EXISTS(SELECT * FROM dbo.Cliente_ConfiguracionVariables CV
					  INNER JOIN dbo.VariableDefinicionMaestro VM ON (VM.IDEN=CV.IDEN_Maestro AND VM.IDEN_TipoVariable=2) 
					  WHERE CV.id_cliente = @cd_cliente_codigo 
							AND CV.bl_Exige=1
							AND VM.Codigo IN('Tiquetes','FacturacionServicios')
					 ) 
			BEGIN
				Set @Estado = 1
				EXEC @retval=dbo.spza_Factura_ValidarClientes_VariablesAdicionales  
									@id_usuario=@id_usuario
									, @id_fac_factura=@NewFacId
									, @ZML_VariablesXML=@ZML_VariablesXML
									, @Estado=@Estado OUTPUT
									, @Msj=@Msj OUTPUT
									, @MostrarMsj ='N'
				IF @retval<>0
				BEGIN 
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN ;		
					END
					SET @ds_Respuesta = @Msj;
					RETURN @retval;
				END
			END							
			

			DECLARE @bl_EnvCorreodespuesfacturar int, @bl_EnvCorreodespuesfacturarAuto INT
			SELECT @bl_EnvCorreodespuesfacturar = 0, @bl_EnvCorreodespuesfacturarAuto = 0
			
			SELECT 
				@bl_EnvCorreodespuesfacturar = bl_EnvCorreodespuesfacturar
				, @bl_EnvCorreodespuesfacturarAuto = bl_EnvCorreodespuesfacturarAuto
			FROM dbo.Configuracion_remisiones 
			WHERE id_cliente = @cd_cliente_codigo AND Configuracion_remisiones.bl_ControlarParametrosImp=1

			IF @bl_interface = 0
				AND (EXISTS (SELECT * FROM Parametros WHERE Id=395 and Valor = 'S') OR @bl_generadaauto = 1)
				AND (EXISTS (SELECT * FROM Parametros WHERE Id=394 and Valor = 'S') OR @bl_generadaauto = 0)
			BEGIN
				--24, 'Factura'
				INSERT INTO dbo.ColaImpresion_Documentos (Id_sys_entidades, id_documento )
				VALUES (24, @NewFacId)				
			END
			
			
			--Borramos de la automatica de tiquetes
			DELETE r
			FROM ReservasGDS_FacAuto R
			INNER JOIN (SELECT ReservasGDS.Id as IdReserva
			FROM dbo.fac_factura
			INNER JOIN dbo.Tiquetes on Tiquetes.id_fac_factura = fac_factura.id
			INNER JOIN dbo.ReservasGDS ON ReservasGDS.cd_codigo = Tiquetes.ds_records
			WHERE fac_factura.id = @NewFacId) AS c on c.IdReserva = R.id_reserva

			--Borramos de la automatica de servicios 
			DELETE r
			FROM ReservasGDS_FacAuto R
			INNER JOIN (SELECT ReservasGDS.Id as IdReserva
			FROM dbo.fac_factura
			INNER JOIN dbo.Fac_Servicios on Fac_Servicios.id_fac_factura = fac_factura.id
			INNER JOIN dbo.ReservasGDS ON ReservasGDS.cd_codigo = Fac_Servicios.ds_records
			WHERE fac_factura.id = @NewFacId) AS c on c.IdReserva = R.id_reserva 
			
			-- Bloqueo de Maximo (N) tkts por factura.		
			DECLARE @MaximoNumeroTktsFacturaManual INT
			SELECT @MaximoNumeroTktsFacturaManual = Valor FROM dbo.Parametros WHERE Id = 444
			IF @MaximoNumeroTktsFacturaManual <> 9999 --And @MaximoNumeroTktsFacturaManual <> 0
			Begin
				IF @bl_generadaauto = 0 AND (SELECT COUNT (*) FROM dbo.Tiquetes WHERE id_fac_factura = @NewFacId AND ds_itinerario IS NOT NULL AND ds_itinerario <> '') > @MaximoNumeroTktsFacturaManual
				BEGIN 
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN ;		
					END
					SELECT 
						@retval = 1, @Estado = 1
						, @Msj = 'Excedió el máximo numero de tiquetes establecidos por factura. Revisar los parámetros del sistema.' 
								+ CHAR(13) + 'Parametro: ''Numero máximo de tiquetes en la facturación manual'''
				
					SET @ds_Respuesta = @Msj;
					RETURN @retval;
				END 
			End
			-- Bloqueo de Maximo (N) tkts por factura.
			
		
			IF EXISTS(SELECT * From dbo.Parametros WHERE Id = 479 And RTRIM(Valor) = 'S')
			BEGIN
				Set @Estado = 1	   
			    EXEC @retval=dbo.spza_Factura_ValidarTiqueteGr  
							@id_usuario=@id_usuario
							, @id_fac_factura=@NewFacId
							, @Estado=@Estado OUTPUT
							, @Msj=@Msj OUTPUT
							, @MostrarMsj ='N'
				IF @retval<>0
				BEGIN 
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN ;		
					END
					SET @ds_Respuesta = @Msj;
					RETURN @retval;
				END
			END
			
			IF EXISTS(SELECT * From dbo.Parametros WHERE Id = 491 And RTRIM(Valor) = 'S')
			BEGIN
				Set @Estado = 1	   
			    EXEC @retval=dbo.spza_Factura_ValidarFacturaParcial  
							@id_usuario=@id_usuario
							, @id_fac_factura=@NewFacId
							, @Estado=@Estado OUTPUT
							, @Msj=@Msj OUTPUT
							, @MostrarMsj ='N'
				IF @retval<>0
				BEGIN 
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN ;		
					END
					SET @ds_Respuesta = @Msj;
					RETURN @retval;
				END
			END
			

			Set @Estado = 1	   
			EXEC @retval=dbo.spza_Factura_ValidarConceptos  
						@id_usuario=@id_usuario
						, @id_fac_factura=@NewFacId
						, @Estado=@Estado OUTPUT
						, @Msj=@Msj OUTPUT
						, @MostrarMsj ='N'
			IF @retval<>0
			BEGIN 
				IF @@TRANCOUNT > 0 
				BEGIN 
					ROLLBACK TRAN ;		
				END
				SET @ds_Respuesta = @Msj;
				RETURN @retval;
			END
			

			IF EXISTS(SELECT * FROM dbo.Configuracion_remisiones WHERE id_cliente = @cd_cliente_codigo AND (bl_BloqCupoCrd=1 or bl_BloqDiaVence = 1 or bl_BloqManual = 1 or bl_EnvCorreoBloqDiaVence=1 or bl_EnvCorreoBloqCupoCrd=1 OR bl_AlertaAgotaCupoCrd=1)) --AND @bl_interface = 0
			BEGIN
				Set @Estado = 1	   
				EXEC @retval=dbo.spza_Factura_ValidarCupoCredito 
							@id_usuario=@id_usuario
							, @id_fac_factura=@NewFacId
							, @Estado=@Estado OUTPUT
							, @Msj=@Msj OUTPUT
							, @MsjAlerta=@MsjAlerta OUTPUT
							, @MostrarMsj ='N'
				IF @retval<>0
				BEGIN 
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN ;		
					END
					SET @ds_Respuesta = @Msj;
					RETURN @retval;
				END
			END
			
			
			
			Declare @TAjusteIVA TABLE 	(	am_totalBaseFac MONEY,	am_totalIVAFac MONEY,	am_totalFac MONEY,	am_totalBase_Correccion MONEY,	am_totalIVA_Correccion MONEY,	am_total_Correccion MONEY,	am_total_Diferencia MONEY,	idDocumento INT,	in_tipo INT,	id_item INT,	in_tipoitem INT,	id_cargo INT,	id_imp INT,	am_cargo MONEY,	am_imp MONEY,	am_total MONEY,	am_porcentaje MONEY,	am_impdecimal MONEY,	am_imp1 MONEY,	am_toleranciaMas1 MONEY,	am_imp2 MONEY,	am_toleranciaMenos1 MONEY	,ds_descripcion varchar(8000), am_deltaCorreccion money, am_total_Diferencia_OUT money, Documento Varchar(25))
			Declare @TAjusteIVARes TABLE 	(ds_respuesta VARCHAR(50), in_Estado INT, am_totalBaseFac MONEY,	am_totalIVAFac MONEY,	am_totalFac MONEY,	am_totalBase_Correccion MONEY,	am_totalIVA_Correccion MONEY,	am_total_Correccion MONEY,	am_total_Diferencia MONEY,	idDocumento INT,	in_tipo INT,	id_item INT,	in_tipoitem INT,	id_cargo INT,	id_imp INT,	am_cargo MONEY,	am_imp MONEY,	am_total MONEY,	am_porcentaje MONEY,	am_impdecimal MONEY,	am_imp1 MONEY,	am_toleranciaMas1 MONEY,	am_imp2 MONEY,	am_toleranciaMenos1 MONEY	,ds_descripcion varchar(8000), am_deltaCorreccion money, am_total_Diferencia_OUT money, Documento Varchar(25))
			Declare @am_total_Diferencia_OUT MONEY
			SELECT @FacturadorElect = Valor From dbo.Parametros Where Id=307
			IF (Dbo.[fnza_Get_ValorInterfazVariable](@FacturadorElect,131,'Validar_IVA_facturacion') ='SI') AND @bl_omitir_Validar_IVA_facturacion = 0 AND @bl_generadaauto = 0
			BEGIN

				INSERT INTO @TAjusteIVA 
				EXEC @retval = dbo.[spza_FacturaRemision_AjustarIVA] @id_usuario = @id_usuario, @IdDocumento = @NewFacId, @am_total_Diferencia_OUT = @am_total_Diferencia_OUT OUTPUT, @bl_vista_previa = 0, @Debug = 0,@bl_solo_validar = 1, @Tipo = 1

				Declare @Valor_tolerancia_IVA MONEY
				SELECT @Valor_tolerancia_IVA = isnull(Dbo.[fnza_Get_ValorInterfazVariable](@FacturadorElect,131,'Valor_tolerancia_IVA'),2)
				--select @Valor_tolerancia_IVA as '@Valor_tolerancia_IVA'
				IF ABS(@am_total_Diferencia_OUT) >  = ABS(ISNULL(@Valor_tolerancia_IVA,0))
				BEGIN

					IF @@TRANCOUNT > 0
					BEGIN 
						ROLLBACK TRAN ;		
					END

					SET @ds_Respuesta = 'Se necesita realizar ajuste de IVA';return 1
				END
			END 
			BEGIN
				IF @bl_omitir_Validar_IVA_facturacion <>0 AND @bl_generadaauto = 0
				BEGIN
					--SET @ZML_AjusteIvaXML=REPLACE(@ZML_AjusteIvaXML,'cd_items VARCHAR(50),','')
					--SET @ZML_AjusteIvaXML=REPLACE(@ZML_AjusteIvaXML,'''''Se necesita realizar ajuste de IVA'''',2,','')
					SET @ZML_AjusteIvaXML=REPLACE(@ZML_AjusteIvaXML,'''''','''')
					INSERT INTO @TAjusteIVARes
					EXEC(@ZML_AjusteIvaXML)
					IF EXISTS(SELECT * FROM @TAjusteIVARes WHERE am_deltaCorreccion <> 0)
					BEGIN
						DELETE FROM @TAjusteIVA
						INSERT INTO @TAjusteIVA 
						EXEC @retval = dbo.[spza_FacturaRemision_AjustarIVA] @id_usuario = @id_usuario, @IdDocumento = @NewFacId, @am_total_Diferencia_OUT = @am_total_Diferencia_OUT OUTPUT, @bl_vista_previa = 1, @Debug = 0,@bl_solo_validar = 0, @Tipo = 1	
						IF @retval<>0 
						BEGIN 
   				
   							IF @@TRANCOUNT > 0 
							BEGIN 
								ROLLBACK TRAN ;		
							END
							SELECT @Estado = 1
								 , @Msj = 'Error el Ajustar los valores del iva';
							SET @ds_Respuesta = @Msj;
							RETURN @retval;
						END
					END
				END	
			END

			IF NOT EXISTS(SELECT TOP 1 F.id FROM dbo.fac_factura F
						LEFT JOIN dbo.Tiquetes T ON T.id_fac_factura=F.id
						LEFT JOIN dbo.Fac_Tao FT ON FT.id_fac_factura=F.id
						LEFT JOIN dbo.Fac_Servicios FS ON FS.id_fac_factura=F.id
					  WHERE T.id IS NOT NULL OR FT.id IS NOT NULL OR FS.id IS NOT NULL
					 )
			BEGIN
				IF @@TRANCOUNT > 0 
				BEGIN 
					ROLLBACK TRAN ;		
				END

				SELECT @Estado = 1
					  , @Msj = 'Error en el crear factura no tiene item(tiquetes, tao o servicios)';
				SET @ds_Respuesta = @Msj;
				RETURN 1;
			END

			--Contabilizando la Factura
			SET @retval=0 
			IF (NOT (dbo.fnza_Get_FacturaTotal(@NewFacId) = 0) AND @bl_nocont = 0) 
			BEGIN
				EXEC @retval = dbo.spza_Factura_Contabilizar @id_usuario,@NewFacId,1,@CodigoArchivoFisico
			END 

			IF @retval<>0 
			BEGIN 
   				
   				IF @@TRANCOUNT > 0 
				BEGIN 
					ROLLBACK TRAN ;		
				END
				
				IF (@bl_af = 1) 
				BEGIN 										
					EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce    ,
													 @id_usuario = @id_usuario ,
													 @cd_status  = 1           , 												 
													 @admsg      = 'Error en el proceso de contabilizacion',
								 					 @msgparams  = @msg;
				END
				RETURN @retval;
			END 
			ELSE 
			BEGIN 
				Set @DocumentoCont = @cd_serie + @cd_consecutivo
				If	Exists(Select * From Parametros Where Id = 232 and Valor = 'S')
						And 
					Not Exists(Select * from Clientes Where IndNCF = 1 And IdCliente = @cd_cliente_codigo)
				Begin
					Set @ErrorNCF = 1
					Exec @ErrorNCF = spCF_DocumentoControl   
							@Op = 'I', 
							@Fuente	= @cd_fuente, 
							@Documento = @DocumentoCont, 
							@NCF = @NCF

					IF (Isnull(@ErrorNCF, 0) <> 0 Or @@Error <> 0) --
					BEGIN 
						Set @procmsg = 'Error al actualizar Control Documentos NCF.'
						IF @@TRANCOUNT > 0 
						BEGIN 
							ROLLBACK TRAN;	
						END 
						
						IF (@bl_af = 1) --Se debe auditar proceso fallido
						BEGIN 						
						EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce    ,
														 @id_usuario = @id_usuario ,
														 @cd_status  = 1           , 												 
														 @admsg      = @procmsg	   ;	 
						END 		  
						
						SET @ds_Respuesta = @procmsg;
						RETURN 1 ;
					END 
											
							
				End
				-----------------------------------------------------------------
				----ZOL 
				-----------------------------------------------------------------
				Set @Estado = 1	
			    EXEC @retval=dbo.Spza_Interfaces_ProcesarReservaXFactura  @id_usuario=@id_usuario, @id_fac_factura=@NewFacId
				IF @retval<>0
				BEGIN 
					IF @@TRANCOUNT > 0 
					BEGIN 
						ROLLBACK TRAN ;		
					END
					SET @ds_Respuesta = 'Error actualizando la reserva';
					RETURN @retval;
				END
				-----------------------------------------------------------------
				----FIN ZOL 
				-----------------------------------------------------------------				
				DECLARE @msglog AS VARCHAR(8000)
				SET @msglog='La factura ' + @cd_fuente+'-'+@cd_serie+@cd_consecutivo + ' fue creada exitosamente'

				--Determinando si se debe auditar el proceso exitoso
				IF (@bl_as = 1) 
				BEGIN 										
					EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce    ,
													 @id_usuario = @id_usuario ,
													 @cd_status  = 1           , 												 
													 @admsg      = @msglog     ,
								 					 @msgparams  = NULL;
				END 			 			
				
	 		 	--Si la transaccion fue creada en el procedimiento entonces se actualiza--
				IF (XACT_STATE() <> 0) and (@@TRANCOUNT > 0) 
		   	    BEGIN 
				   COMMIT TRAN;				   
				END
				
				--Obtenemos los datos de los Rc automatico
				--SELECT 
				--	@cd_fuenteRC = cd_fuente_RcAuto
				--	, @cd_serieRC = cd_serie_RcAuto
				--	, @cd_consecutivoRC = cd_consecutivo_RcAuto
				--	, @cd_fuenteRCOtr = cd_fuente_RcOtrAuto
				--	, @cd_serieRCOtr = cd_serie_RcOtrAuto
				--	, @cd_consecutivoRCOtr = cd_consecutivo_RcOtrAuto
				--FROM dbo.fac_factura
				--WHERE id = @NewFacId
 
				--SELECT 	
				--	@cd_fuente+'-'+@cd_serie+@cd_consecutivo
				--	+'-'+CONVERT(VARCHAR(18),@NewFacId)									AS 'Respuesta', 
			 -- 		0																	AS 'Estado',
				--	IsNull(@cd_fuenteRC+'-'+@cd_serieRC+@cd_consecutivoRC,'')			AS 'RcAutomsg',
				--	IsNull(@cd_fuenteRCOtr+'-'+@cd_serieRCOtr+@cd_consecutivoRCOtr,'')	AS 'RcOtrAutomsg',
			 -- 		@Resolucionmsg														AS 'Resolucionmsg',
			 -- 		@NCF																AS 'NCF',
				--	@FechaCaducidad														AS 'FechaCaducidad'
				/*inicio rgelis 2012/10/11 req.10814*/
				IF @bl_generadaauto = 1	AND ISNULL(@Resolucionmsg,'')<> '' 
				BEGIN
					SET @MsjAlerta=ISNULL((@MsjAlerta+CHAR(13)+CHAR(10)),'')+ISNULL(@Resolucionmsg,'')
				END
				
				SELECT 	
					@cd_fuente+'-'+@cd_serie+@cd_consecutivo
					+'-'+CONVERT(VARCHAR(18),@NewFacId)									AS 'Respuesta', 
			  		0																	AS 'Estado',
					RC.ID																AS 'id_ReciboCaja',
					RC.id_FormaPago														AS 'id_FormaPago',
					FP.ds_nombre														AS 'ds_FormaPago',
					RC.cd_Fuente														AS 'cd_fuente',
					RC.cd_Serie															AS 'cd_serie',
					RC.cd_Consecutivo													AS 'cd_consecutivo',
					CASE RC.in_Tipo WHEN 1 THEN 'RC de Tiquetes' 
										   ELSE 'RC de otros Items'
									END													AS 'ds_Tipo',
					RC.am_valor															AS 'am_valor',
			  		CASE 
						WHEN 
							r.ds_num_resolucion IS NOT NULL 
							AND DATEDIFF(DAY,F.dt_fecha,r.dt_Fechavencimiento)<=ISNULL(r.in_diasvencimiento,0)
							AND ISNULL(r.in_diasvencimiento,0) > 0
							AND r.bl_alertarvencimiento = 1
							THEN 'Faltan ' + convert(VARCHAR,DATEDIFF(DAY,F.dt_fecha,r.dt_Fechavencimiento))  + ' días para el vencimiento de la resolución'
						ELSE @Resolucionmsg END											AS 'Resolucionmsg',
			  		ISNULL(@NCF,'')														AS 'NCF',
					ISNULL(@FechaCaducidad,@dt_vence)									AS 'FechaCaducidad',
					ISNULL(@MsjAlerta,'')												AS 'ds_Alerta',
					@in_ConsecutivoUnicoDocumento										AS 'in_ConsecutivoUnicoDocumento',
					case when cd_fuente_NCausacionSrvTer is not null then isnull(cd_fuente_NCausacionSrvTer,'')+'-'+isnull(cd_serie_NCausacionSrvTer,'') + isnull(cd_consecutivo_NCausacionSrvTer,'') else '' end											AS 'DocumentoCausacionCxP'
				FROM dbo.fac_factura As F
					LEFT JOIN dbo.Fac_RecibosCaja As RC ON RC.id_fac_factura=F.id
					LEFT JOIN dbo.FormasPago As FP ON FP.id=RC.id_FormaPago 
					LEFT JOIN dbo.resoluciones r ON r.id_sucursal = F.id_sucursal AND r.ds_num_resolucion = F.ds_num_resolucion
				WHERE F.id = @NewFacId 	
				

				SELECT TOP 1 
					@ds_Respuesta = ISNULL('Factura Creada: '+F.cd_fuente+'-'+F.cd_serie+F.cd_consecutivo+'-'+CONVERT(VARCHAR(18),F.id), '') + 
						CASE WHEN ISNULL(@MsjAlerta, '') <> '' THEN ' - Alerta: ' + @MsjAlerta ELSE '' END +
						CASE WHEN ISNULL(
							CASE WHEN r.ds_num_resolucion IS NOT NULL AND DATEDIFF(DAY,F.dt_fecha,r.dt_Fechavencimiento)<=ISNULL(r.in_diasvencimiento,0) AND ISNULL(r.in_diasvencimiento,0) > 0 AND r.bl_alertarvencimiento = 1 THEN 'Faltan ' + convert(VARCHAR,DATEDIFF(DAY,F.dt_fecha,r.dt_Fechavencimiento))  + ' días para el vencimiento de la resolución' ELSE @Resolucionmsg END
						, '') <> '' THEN ' - Res: ' + 
							CASE WHEN r.ds_num_resolucion IS NOT NULL AND DATEDIFF(DAY,F.dt_fecha,r.dt_Fechavencimiento)<=ISNULL(r.in_diasvencimiento,0) AND ISNULL(r.in_diasvencimiento,0) > 0 AND r.bl_alertarvencimiento = 1 THEN 'Faltan ' + convert(VARCHAR,DATEDIFF(DAY,F.dt_fecha,r.dt_Fechavencimiento))  + ' días para el vencimiento de la resolución' ELSE @Resolucionmsg END
						ELSE '' END +
						CASE WHEN ISNULL(RC.cd_fuente, '') <> '' THEN ' - Pago: ' + ISNULL(FP.ds_nombre, '') + ' ' + ISNULL(RC.cd_Fuente, '') + '-' + ISNULL(RC.cd_Serie, '') + '-' + ISNULL(RC.cd_Consecutivo, '') + ' (' + CASE RC.in_Tipo WHEN 1 THEN 'RC de Tiquetes' ELSE 'RC de otros Items' END + ') ' + ISNULL(CAST(RC.am_valor AS VARCHAR), '') ELSE '' END
				FROM dbo.fac_factura As F
					LEFT JOIN dbo.Fac_RecibosCaja As RC ON RC.id_fac_factura=F.id
					LEFT JOIN dbo.FormasPago As FP ON FP.id=RC.id_FormaPago 
					LEFT JOIN dbo.resoluciones r ON r.id_sucursal = F.id_sucursal AND r.ds_num_resolucion = F.ds_num_resolucion
				WHERE F.id = @NewFacId;
				
				RETURN @retval;
				
			END
		
			------------------------------------------------------------------------
			
	    END TRY 
    
    	-- Bloque CATCH (Manejo de excepciones)
    	BEGIN CATCH 
 
 			-- Tiempo de espera alcanzado --
		    IF ERROR_NUMBER() = 1222
		    BEGIN
      			SET @msg =  'No se pudo ejecutar el proceso. Tiempo de espera agotado.';
      			SET @retval = 1
      			
      			IF (@@TRANCOUNT > 0)
				BEGIN 
					ROLLBACK;
				END
	   	 
	   	        RAISERROR (@msg,16,125);
	   	       	--Se debe auditar proceso fallido
				IF (@bl_af = 1) EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce ,
													 			 @id_usuario = @id_usuario ,
													 			 @cd_status  = 0           , 
													 			 @admsg      = @msg	   ;														 			 		
	   	        SET @ds_Respuesta = @msg;
				RETURN @retval;
		    END
		    
		    -- Registro bloqueado / Conflicto de actualizacion
		    ELSE 
		    IF ERROR_NUMBER() IN (1205, 3960)
    		BEGIN
    		
    			IF (@@TRANCOUNT > 0)
				BEGIN 
					ROLLBACK;
				END
	   	        
		       	SET @retry     = 1              ;
		       	SET @retrycont = @retrycont + 1 ; 
	   	 	END
	    	ELSE
		    BEGIN
		     	-- Error no manejado --					
				IF (@@TRANCOUNT > 0)
				BEGIN 
					ROLLBACK;
				END	
													
				SET @retval = 1;
 				SET @msg =	'Ha ocurrido un error. Información para soporte tecnico:'			+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
						    'Numero: ' + isnull(CAST(ERROR_NUMBER()   AS VARCHAR(10)),'') 		+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
							'Mensaje: ' + isnull(ERROR_MESSAGE(),'') 					   		+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
						 	'Severidad: ' + isnull(CAST(ERROR_SEVERITY() AS VARCHAR(10)),'') 	+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
						 	'Estado: ' + isnull(CAST(ERROR_STATE()    AS VARCHAR(10)),'') 		+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
							'Procedimiento: ' + 'spFacturaCrear'							+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
							'Linea: ' + isnull(CAST(ERROR_LINE() 	   AS VARCHAR(10)),'')      + CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) ; 							
	
				--Se debe auditar proceso fallido
				IF (@bl_af = 1) EXEC dbo.spzaAuditoria_Insertar	@id_proceso = @idproce   ,
										 			 			@id_usuario = @id_usuario ,
										 			 			@cd_status  = 0           , 
										 			 			@admsg      = @msg	  ;	
				--RAISERROR (@msg,16,126);
				--SET @ds_Respuesta = @msg;
				SET @ds_Respuesta = @msg;
				RETURN @retval;
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
  		--RAISERROR (@msg,16,127);
  		SET @ds_Respuesta = @msg;
		RETURN @retval;
  	END   	
    
    RETURN @retval;
END



-- Archivo: spGenerarConceptosAutoConsultar.sql
﻿IF OBJECT_ID('dbo.spGenerarConceptosAutoConsultar', 'P') IS NOT NULL
    DROP PROCEDURE dbo.spGenerarConceptosAutoConsultar;
GO
SET QUOTED_IDENTIFIER ON;
GO
CREATE PROCEDURE [dbo].[spGenerarConceptosAutoConsultar]
	-- Parametros del procedimiento
	@id_usuario			INT,
	@dt_fechaFactura	SMALLDATETIME	= NULL,
	@tasa_usd			MONEY			= 1	,
	@ZML_DatosXML		VARCHAR(MAX)	= NULL  
 
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
			@Prefijo As Varchar(50)		, --Prefijo para indicar si es Dolares o Pesos
			@am_Contado MONEY			,
			@am_Credito MONEY			,
			@MonedaLocal Varchar(3)		,
			@TruncarDecimales Varchar(1),
			@IdMonedaLocal INT			,
			@bl_tomarFPAirplusTkt BIT	,
			@bl_tomarFPTaoTkt BIT;

	SELECT 	@retry				 = 1 		   ,
			@retrycont			 = 0		   ,
			@retval				 = 0;
  	
  	-- Manejo de tiempo de espera y de reintentos por bloqueo de tablas/registros  
   	SELECT @maxretries = convert(INT,Valor) FROM dbo.Parametros WHERE Id = 60 ;
	SELECT @timeout    = convert(NVARCHAR(4000),Valor) FROM dbo.Parametros WHERE Id = 50 ;		
	SET @stmt = N'SET LOCK_TIMEOUT '+ltrim(rtrim(@timeout))
	EXEC sp_executesql @stmt,N''
	
	Select @TruncarDecimales = Valor From parametros Where Id = 521

	WHILE ( (@retry = 1) AND (@retrycont <= @maxretries) )
	BEGIN
		SET @retry = 0;
    
    	-- Bloque TRY
    	BEGIN TRY 
    	    		
    		--Obteniendo informacion de seguridad y auditoria--
			/*EXEC dbo.spzaProcesoUsuario_Consultar @id_usuario   = @id_usuario       ,
												  @id_proceso   = @idproce 		    , 
												  @bl_permit    = @bl_permit OUTPUT , 
												  @bl_auditsuc  = @bl_as 	 OUTPUT , 
												  @bl_auditfail = @bl_af 	 OUTPUT ;
			IF (@bl_permit = 0)
			BEGIN 
				SELECT 'No posee permisos suficientes para ejecutar esta acciÃ³n.' AS 'Respuesta'
				RETURN @retval;
			END */

			
			
			--Instrucciones del procedimiento-----------------------------------------
			DECLARE @NumeroDecimales INT
			SELECT  @NumeroDecimales = Valor from parametros where Id = 33

			Select @MonedaLocal = Valor From parametros where id=10
			Select @IdMonedaLocal =  Id From Monedas_iata Where cd_codigo=@MonedaLocal

			DECLARE @PaisLocal VARCHAR(50)
			SELECT @PaisLocal = Valor From parametros where id=240

			DECLARE @bl_utilizarcencostosuc BIT,@bl_utilizarcencostoimp BIT
			SELECT @bl_utilizarcencostosuc = CASE WHEN RTRIM(LTRIM(Valor))='S' THEN 1 ELSE 0 END From parametros where id=134
			SELECT @bl_utilizarcencostoimp = CASE WHEN RTRIM(LTRIM(Valor))='S' THEN 1 ELSE 0 END From parametros where id=137
			SET @bl_utilizarcencostosuc = ISNULL(@bl_utilizarcencostosuc,0)
			SET @bl_utilizarcencostoimp = ISNULL(@bl_utilizarcencostoimp,0)

			SELECT @bl_tomarFPAirplusTkt = CASE WHEN rtrim(ltrim(Valor))='S' THEN 1 ELSE 0 END  FROM dbo.Parametros where Id=608
			SELECT @bl_tomarFPTaoTkt = CASE WHEN rtrim(ltrim(Valor))='S' THEN 1 ELSE 0 END  FROM dbo.Parametros where Id=609
			SET @bl_tomarFPAirplusTkt=ISNULL(@bl_tomarFPAirplusTkt,0)
			SET @bl_tomarFPTaoTkt=isnull(@bl_tomarFPTaoTkt,0)

			IF OBJECT_ID('tempdb..#Concepto') IS NOT NULL DROP TABLE #Concepto;
			CREATE TABLE #Concepto 
			(Id INT IDENTITY
			,cd_cliente VARCHAR(25) COLLATE DATABASE_DEFAULT
			,id_conceptofacturacion INT
            ,id_tiposservicios INT
            ,in_nacionalidad INT
			,id_aerolinea	INT
			,id_moneda	INT
            ,ds_paxname VARCHAR(30) COLLATE DATABASE_DEFAULT
            ,ds_paxape VARCHAR(30) COLLATE DATABASE_DEFAULT
            ,cd_paxtype CHAR(3) COLLATE DATABASE_DEFAULT
            ,ds_paxClasificacion CHAR(6) COLLATE DATABASE_DEFAULT
			,cd_tiquete CHAR(11) COLLATE DATABASE_DEFAULT
			,cd_proveedores VARCHAR(25) COLLATE DATABASE_DEFAULT
			,dt_llegada SMALLDATETIME
			,dt_salida SMALLDATETIME
			,cd_cencosto VARCHAR(16) COLLATE DATABASE_DEFAULT
			,cd_auxiliar VARCHAR(16) COLLATE DATABASE_DEFAULT
			,cd_item VARCHAR(16) COLLATE DATABASE_DEFAULT
			,CodigoReserva VARCHAR(25) COLLATE DATABASE_DEFAULT
			,am_tarifa MONEY
			,am_total MONEY
			,ColId VARCHAR(25) COLLATE DATABASE_DEFAULT
			,cd_Consecutivo_depende VARCHAR(50) COLLATE DATABASE_DEFAULT
			,am_ValorComision MONEY
			,am_ImpuestoComision MONEY
			,am_totalfactura MONEY
			,cd_tourcode VARCHAR(25) COLLATE DATABASE_DEFAULT
			,am_Contado MONEY --rgelis 2017/02/11 req.47323
			,am_Credito MONEY --rgelis 2017/02/11 req.47323
			,cd_tktrevisado VARCHAR(14) COLLATE DATABASE_DEFAULT --inicio rgelis 2017/09/19 req.5282
			,id_TiposDocumento INT
            ,cd_Penalidad VARCHAR(14) COLLATE DATABASE_DEFAULT
			,cd_TipoTiqueteGDS VARCHAR(3) COLLATE DATABASE_DEFAULT --fin rgelis 2017/09/19 req.5282
			,am_TasaCambio MONEY --rgelis 2017/10/25 req.54014
			,ds_itinerario VARCHAR(123) COLLATE DATABASE_DEFAULT --rgelis 2018/04/16 req.57446
			,id_sucursal INT --inicio rgelis 2018/05/07 req.58559
			,id_implante INT
			,id_FormasPago INT 
			,cd_TarjetasCredito VARCHAR(4) COLLATE DATABASE_DEFAULT --fin rgelis 2018/05/07 req.58559
			,iden_gds INT
			,cd_codigotc VARCHAR(2) COLLATE DATABASE_DEFAULT
			,ds_numerotc VARCHAR(25) COLLATE DATABASE_DEFAULT
			,ds_vencetc VARCHAR(5) COLLATE DATABASE_DEFAULT
			,ds_autorizaciontc VARCHAR(25) COLLATE DATABASE_DEFAULT
			,ds_vouchertc VARCHAR(25) COLLATE DATABASE_DEFAULT
			,in_cuotastc INT
			,id_FormasPagoTAO INT 
			,cd_codigotcTAO VARCHAR(2) COLLATE DATABASE_DEFAULT
			,ds_numerotcTAO VARCHAR(25) COLLATE DATABASE_DEFAULT
			,ds_vencetcTAO VARCHAR(5) COLLATE DATABASE_DEFAULT
			,ds_autorizaciontcTAO VARCHAR(25) COLLATE DATABASE_DEFAULT
			,ds_vouchertcTAO VARCHAR(25) COLLATE DATABASE_DEFAULT
			,in_cuotastcTAO INT 
			)
			
			DECLARE @ExecSQL VARCHAR(MAX) = 'INSERT INTO #Concepto ' + @ZML_DatosXML;
			EXEC(@ExecSQL);
			--select * from #Concepto
			--RETURN 1
			
			-- Loop variables
			DECLARE @cur_cd_cliente VARCHAR(25),
					@cur_id_conceptofacturacion INT,
					@cur_in_nacionalidad INT,
					@cur_id_aerolinea INT,
					@cur_id_moneda INT,
					@cur_ds_paxname VARCHAR(30),
					@cur_ds_paxape VARCHAR(30),
					@cur_cd_paxtype CHAR(3),
					@cur_ds_paxClasificacion CHAR(6),
					@cur_cd_tiquete CHAR(11),
					@cur_dt_llegada SMALLDATETIME,
					@cur_dt_salida SMALLDATETIME,
					@cur_cd_cencosto VARCHAR(16),
					@cur_cd_auxiliar VARCHAR(16),
					@cur_cd_item VARCHAR(16),
					@cur_CodigoReserva VARCHAR(25),
					@cur_id_sucursal INT,
					@cur_id_implante INT,
					@cur_id_FormasPago INT,
					@cur_cd_TarjetasCredito VARCHAR(4),
					@cur_id_TarjetasCredito INT,
					@cur_iden_gds INT,
					@cur_ColId VARCHAR(25),
					@cur_cd_Consecutivo_depende VARCHAR(50),
					@cur_cd_codigotc VARCHAR(2), 
					@cur_ds_numerotc VARCHAR(25),
					@cur_ds_vencetc VARCHAR(5),
					@cur_ds_autorizaciontc VARCHAR(25), 
					@cur_ds_vouchertc VARCHAR(25), 
					@cur_in_cuotastc INT,
					@cur_id_FormasPagoTAO INT,
					@cur_id_TarjetasCreditoTAO INT,
					@cur_cd_codigotcTAO VARCHAR(2),
					@cur_ds_numerotcTAO VARCHAR(25),
					@cur_ds_vencetcTAO VARCHAR(5),
					@cur_ds_autorizaciontcTAO VARCHAR(25),
					@cur_ds_vouchertcTAO VARCHAR(25),
					@cur_in_cuotastcTAO INT

			DECLARE @cur_id_reserva_int INT;

			DECLARE @OriginalConcepto TABLE 
			(
			 cd_cliente VARCHAR(25)
			,id_conceptofacturacion INT
            ,in_nacionalidad INT
			,id_aerolinea	INT
			,id_moneda	INT
            ,ds_paxname VARCHAR(30)
            ,ds_paxape VARCHAR(30)
            ,cd_paxtype CHAR(3)
            ,ds_paxClasificacion CHAR(6)
			,cd_tiquete CHAR(11)
			,dt_llegada SMALLDATETIME
			,dt_salida SMALLDATETIME
			,cd_cencosto VARCHAR(16)
			,cd_auxiliar VARCHAR(16)
			,cd_item VARCHAR(16)
			,CodigoReserva VARCHAR(25)
			,id_sucursal INT
			,id_implante INT
			,id_FormasPago INT 
			,cd_TarjetasCredito VARCHAR(4)
			,iden_gds INT
			,ColId VARCHAR(25)
			,cd_Consecutivo_depende VARCHAR(50)
			,cd_codigotc VARCHAR(2) 
			,ds_numerotc VARCHAR(25)
			,ds_vencetc VARCHAR(5)
			,ds_autorizaciontc VARCHAR(25) 
			,ds_vouchertc VARCHAR(25) 
			,in_cuotastc INT
			,id_FormasPagoTAO INT
			,cd_codigotcTAO VARCHAR(2)
			,ds_numerotcTAO VARCHAR(25)
			,ds_vencetcTAO VARCHAR(5)
			,ds_autorizaciontcTAO VARCHAR(25)
			,ds_vouchertcTAO VARCHAR(25)
			,in_cuotastcTAO INT
			)

			INSERT INTO @OriginalConcepto (cd_cliente, id_conceptofacturacion, in_nacionalidad, id_aerolinea, id_moneda, ds_paxname, ds_paxape, cd_paxtype, ds_paxClasificacion, cd_tiquete, dt_llegada, dt_salida, cd_cencosto, cd_auxiliar, cd_item, CodigoReserva, id_sucursal, id_implante, id_FormasPago, cd_TarjetasCredito, iden_gds, ColId, cd_Consecutivo_depende, cd_codigotc, ds_numerotc, ds_vencetc, ds_autorizaciontc, ds_vouchertc, in_cuotastc, id_FormasPagoTAO, cd_codigotcTAO, ds_numerotcTAO, ds_vencetcTAO, ds_autorizaciontcTAO, ds_vouchertcTAO, in_cuotastcTAO)
			SELECT cd_cliente, id_conceptofacturacion, in_nacionalidad, id_aerolinea, id_moneda, ds_paxname, ds_paxape, cd_paxtype, ds_paxClasificacion, cd_tiquete, dt_llegada, dt_salida, cd_cencosto, cd_auxiliar, cd_item, CodigoReserva, id_sucursal, id_implante, id_FormasPago, cd_TarjetasCredito, iden_gds, ColId, cd_Consecutivo_depende, cd_codigotc, ds_numerotc, ds_vencetc, ds_autorizaciontc, ds_vouchertc, in_cuotastc, id_FormasPagoTAO, cd_codigotcTAO, ds_numerotcTAO, ds_vencetcTAO, ds_autorizaciontcTAO, ds_vouchertcTAO, in_cuotastcTAO 
			FROM #Concepto
			
			--select * from @OriginalConcepto
			--return 1
			-- 1. Construir @ListaReservas
			DECLARE @ListaReservas VARCHAR(MAX) = '';
			SELECT @ListaReservas = @ListaReservas + CAST(id_reserva AS VARCHAR) + ',' 
			FROM (
				SELECT DISTINCT r.id AS id_reserva 
				FROM dbo.ReservasGDS r 
				INNER JOIN #Concepto c ON r.cd_codigo = c.CodigoReserva
			) X;
			IF LEN(@ListaReservas) > 0 SET @ListaReservas = LEFT(@ListaReservas, LEN(@ListaReservas) - 1);

			-- 2. Cargar Itinerarios y FEEs Masivamente
			IF OBJECT_ID('tempdb..#ItinerariosJob') IS NOT NULL DROP TABLE #ItinerariosJob;
			CREATE TABLE #ItinerariosJob (id INT, id_reserva INT, orden INT, cd_origen VARCHAR(10), cd_destino VARCHAR(10), cd_clase VARCHAR(10), fecha_salida VARCHAR(20), hora_salida VARCHAR(10), hora_llegada VARCHAR(10), terminal VARCHAR(50), cd_aero_siglas VARCHAR(10), cd_farebasis VARCHAR(50), ds_NumVuelo VARCHAR(50), ds_TipoVuelo VARCHAR(50), am_valor MONEY, bl_NoUtilizado BIT, am_co2 MONEY);
			
			IF OBJECT_ID('tempdb..#FeesJob') IS NOT NULL DROP TABLE #FeesJob;
			CREATE TABLE #FeesJob (id_reserva INT, cd_tiquete VARCHAR(50), in_orden INT, cd_conceptofac VARCHAR(50), cd_subcodigo VARCHAR(50), am_valor MONEY, ds_servicio VARCHAR(200));
																																
			IF ISNULL(@ListaReservas,'') <> ''
			BEGIN 
				INSERT INTO #ItinerariosJob EXEC dbo.spza_ReservasGDSJOB_Itinerario @id_reserva = @ListaReservas;
				INSERT INTO #FeesJob EXEC dbo.spza_ReservasGDS_FEEJOB_Consultar @Id_Reservas = @ListaReservas;
			END
			
			DECLARE cur_conceptos CURSOR LOCAL FAST_FORWARD FOR
			SELECT cd_cliente, id_conceptofacturacion, in_nacionalidad, id_aerolinea, id_moneda, ds_paxname, ds_paxape, cd_paxtype, ds_paxClasificacion, cd_tiquete, dt_llegada, dt_salida, cd_cencosto, cd_auxiliar, cd_item, CodigoReserva, id_sucursal, id_implante, id_FormasPago, cd_TarjetasCredito, iden_gds, ColId, cd_Consecutivo_depende, cd_codigotc, ds_numerotc, ds_vencetc, ds_autorizaciontc, ds_vouchertc, in_cuotastc, id_FormasPagoTAO, cd_codigotcTAO, ds_numerotcTAO, ds_vencetcTAO, ds_autorizaciontcTAO, ds_vouchertcTAO, in_cuotastcTAO 
			FROM @OriginalConcepto

			OPEN cur_conceptos
			FETCH NEXT FROM cur_conceptos INTO @cur_cd_cliente, @cur_id_conceptofacturacion, @cur_in_nacionalidad, @cur_id_aerolinea, @cur_id_moneda, @cur_ds_paxname, @cur_ds_paxape, @cur_cd_paxtype, @cur_ds_paxClasificacion, @cur_cd_tiquete, @cur_dt_llegada, @cur_dt_salida, @cur_cd_cencosto, @cur_cd_auxiliar, @cur_cd_item, @cur_CodigoReserva, @cur_id_sucursal, @cur_id_implante, @cur_id_FormasPago, @cur_cd_TarjetasCredito, @cur_iden_gds, @cur_ColId, @cur_cd_Consecutivo_depende, @cur_cd_codigotc, @cur_ds_numerotc, @cur_ds_vencetc, @cur_ds_autorizaciontc, @cur_ds_vouchertc, @cur_in_cuotastc, @cur_id_FormasPagoTAO, @cur_cd_codigotcTAO, @cur_ds_numerotcTAO, @cur_ds_vencetcTAO, @cur_ds_autorizaciontcTAO, @cur_ds_vouchertcTAO, @cur_in_cuotastcTAO

			WHILE @@FETCH_STATUS = 0
			BEGIN
				SELECT @cur_id_reserva_int = id FROM dbo.ReservasGDS WHERE cd_codigo = @cur_CodigoReserva

				IF @cur_id_reserva_int IS NOT NULL
				BEGIN
					-- 1. Consultar itinerario y actualizar en @Concepto
					DECLARE @ItinTable TABLE (
						id INT, id_reserva INT, orden INT, cd_origen VARCHAR(10), cd_destino VARCHAR(10),
						cd_clase VARCHAR(10), fecha_salida VARCHAR(20), hora_salida VARCHAR(10),
						hora_llegada VARCHAR(10), terminal VARCHAR(50), cd_aero_siglas VARCHAR(10),
						cd_farebasis VARCHAR(50), ds_NumVuelo VARCHAR(50), ds_TipoVuelo VARCHAR(50),
						am_valor MONEY, bl_NoUtilizado BIT, am_co2 MONEY
					)
					DELETE FROM @ItinTable

					INSERT INTO @ItinTable
					SELECT id, id_reserva, orden, cd_origen, cd_destino, cd_clase, fecha_salida, hora_salida, hora_llegada, terminal, cd_aero_siglas, cd_farebasis, ds_NumVuelo, ds_TipoVuelo, am_valor, bl_NoUtilizado, am_co2
					FROM #ItinerariosJob WHERE id_reserva = @cur_id_reserva_int;

					DECLARE @ds_itinerario VARCHAR(123) = ''
					SELECT @ds_itinerario = CASE WHEN @ds_itinerario = '' THEN cd_origen + '-' + cd_destino ELSE @ds_itinerario + '-' + cd_destino END
					FROM @ItinTable
					ORDER BY orden

					IF @ds_itinerario <> ''
					BEGIN
						UPDATE #Concepto
						SET ds_itinerario = @ds_itinerario
						WHERE cd_tiquete = @cur_cd_tiquete AND CodigoReserva = @cur_CodigoReserva
					END

					-- 2. Consultar FEEs/cargos adicionales por tiquete (solo si es tiquete, id_conceptofacturacion 1 o 2)
					IF @cur_id_conceptofacturacion IN (1, 2)
					BEGIN
						DECLARE @FeeTable TABLE (
							id_reserva INT,
							cd_tiquete VARCHAR(50) COLLATE DATABASE_DEFAULT,
							in_orden INT,
							cd_conceptofac VARCHAR(50) COLLATE DATABASE_DEFAULT,
							cd_subcodigo VARCHAR(50) COLLATE DATABASE_DEFAULT,
							am_valor MONEY,
							ds_servicio VARCHAR(200) COLLATE DATABASE_DEFAULT
						)
						DELETE FROM @FeeTable

						INSERT INTO @FeeTable(id_reserva,cd_tiquete,in_orden,cd_conceptofac,cd_subcodigo,am_valor,ds_servicio)
						SELECT F.id_reserva, F.cd_tiquete, F.in_orden, F.cd_conceptofac, F.cd_subcodigo, F.am_valor, ds_servicio = CASE WHEN ISNULL(F.ds_servicio,'')='' THEN CF.ds_nombre COLLATE DATABASE_DEFAULT +' '+F.cd_tiquete COLLATE DATABASE_DEFAULT ELSE F.ds_servicio COLLATE DATABASE_DEFAULT END 
						FROM #FeesJob F 
						LEFT JOIN dbo.ConceptoFacturacion CF ON CF.cd_codigo COLLATE DATABASE_DEFAULT = F.cd_conceptofac COLLATE DATABASE_DEFAULT
						WHERE F.id_reserva = @cur_id_reserva_int 
						AND (F.cd_tiquete = @cur_cd_tiquete OR F.cd_tiquete = CASE WHEN LEN(@cur_cd_tiquete)>=13 THEN RIGHT(@cur_cd_tiquete,LEN(@cur_cd_tiquete)-3) ELSE @cur_cd_tiquete END);

						SELECT @cur_id_TarjetasCredito = id FROM dbo.TarjetasCredito WHERE cd_codigo=@cur_cd_TarjetasCredito
						SELECT @cur_id_TarjetasCreditoTAO = id FROM dbo.TarjetasCredito WHERE cd_codigo=@cur_cd_codigotcTAO

						INSERT INTO #GenerarConceptosAuto (
							id_ConceptoFacturacion,
							cd_ConceptoFacturacion,
							ds_ConceptoFacturacion,
							id_TiposConceptFac,
							bl_contorlarCargImp,
							bl_CalculoAutoValoresFacturacion,
							id_TiposServicio,
							cd_TiposServicio,
							ds_TiposServicio,
							cd_proveedores,
							ds_proveedores,
							cd_tiquete,
							ds_servicio,
							ds_descrip,
							ds_paxname,
							ds_paxape,
							cd_paxtype,
							ds_paxClasificacion,
							in_nacionalidad,
							dt_llegada,
							dt_salida,
							cd_cencosto,
							cd_auxiliar,
							cd_item,
							Valor,
							am_Contado,
							am_Credito,
							ColId,
							cd_Consecutivo_depende,
							CodigoReserva,
							am_ImpuestoComision,
							Respuesta,
							bl_RutaExentaIva,
							id_FormasPago,
							id_TarjetasCredito,
							am_basedescuento,
							am_pordescuento,
							id_FormasPagoAirPlus,
							cd_FormasPagoAirPlus,
							ds_FormasPagoAirPlus,
							id_TarjetasCreditoAirPlus,
							cd_TarjetasCreditoAirPlus,
							ds_numerotarjetaAirPlus,
							cd_codigotc, 
							ds_numerotc,
							ds_vencetc, 
							ds_autorizaciontc,
							ds_vouchertc, 
							in_cuotastc 
						)
						SELECT 
							id_ConceptoFacturacion=C.id,
							cd_ConceptoFacturacion=C.cd_codigo,
							ds_ConceptoFacturacion=C.ds_nombre,
							id_TiposConceptFac=C.id_TiposConceptoFacturacion,
							bl_contorlarCargImp=C.bl_contorlarCargImp,
							bl_CalculoAutoValoresFacturacion=C.bl_CalculoAutoValoresFacturacion,
							id_TiposServicio=TS.id,
							cd_TiposServicio=TS.cd_codigo,
							ds_TiposServicio=TS.ds_nombre,
							cd_proveedores='',
							ds_proveedores='',
							cd_tiquete=F.cd_tiquete,
							ds_servicio=F.ds_servicio,
							ds_descrip=F.ds_servicio,
							ds_paxname=@cur_ds_paxname,
							ds_paxape=@cur_ds_paxape,
							cd_paxtype=@cur_cd_paxtype,
							ds_paxClasificacion=@cur_ds_paxClasificacion,
							in_nacionalidad=@cur_in_nacionalidad,
							dt_llegada=@cur_dt_llegada,
							dt_salida=@cur_dt_salida,
							cd_cencosto=@cur_cd_cencosto,
							cd_auxiliar=@cur_cd_auxiliar,
							cd_item=@cur_cd_item,
							Valor=F.am_valor,
							am_Contado=CASE WHEN ISNULL(@cur_id_FormasPago,0)<>2 THEN F.am_valor ELSE 0 END,
							am_Credito=CASE WHEN ISNULL(@cur_id_FormasPago,0)=2 THEN F.am_valor ELSE 0 END,
							ColId=@cur_ColId,
							cd_Consecutivo_depende=@cur_cd_Consecutivo_depende,
							CodigoReserva=@cur_CodigoReserva,
							am_ImpuestoComision=0,
							Respuesta='',
							bl_RutaExentaIva=0,
							id_FormasPago=@cur_id_FormasPago,
							id_TarjetasCredito=@cur_id_TarjetasCredito,
							am_basedescuento=0,
							am_pordescuento=0,
							id_FormasPagoAirPlus=NULL,
							cd_FormasPagoAirPlus='',
							ds_FormasPagoAirPlus='',
							id_TarjetasCreditoAirPlus=NULL,
							cd_TarjetasCreditoAirPlus='',
							ds_numerotarjetaAirPlus='',
							cd_codigotc=@cur_cd_codigotc, 
							ds_numerotc=@cur_ds_numerotc,
							ds_vencetc=@cur_ds_vencetc, 
							ds_autorizaciontc=@cur_ds_autorizaciontc,
							ds_vouchertc=@cur_ds_vouchertc, 
							in_cuotastc=@cur_in_cuotastc
						FROM @FeeTable F
						INNER JOIN dbo.ConceptoFacturacion C ON C.cd_codigo = F.cd_conceptofac
						LEFT JOIN dbo.tiposServicio_asignados TSA ON (TSA.id_ConceptoFacturacion = C.id AND TSA.bl_Valdeft = 1) 
						LEFT JOIN dbo.TiposServicios TS ON TS.id = TSA.id_TipoServicio

						-- Auto-TAO Configuration
						DECLARE @AUTOTAO CHAR(1) = (SELECT LTRIM(RTRIM(Valor)) FROM dbo.Parametros WHERE id = 192);
						DECLARE @AUTOTAOAMADEUS CHAR(1) = (SELECT LTRIM(RTRIM(Valor)) FROM dbo.Parametros WHERE id = 213);
						
						DECLARE @ValorTAO MONEY = 0;
						
						-- Validar si el cliente tiene config especial
						DECLARE @bl_TAO BIT, @am_TarifaOneWay MONEY, @am_TarifaRoundTrip MONEY, @am_Tarifa_USD300 MONEY, @am_Tarifa_USD300_USD500 MONEY, @am_Tarifa_USD500_USD800 MONEY, @am_Tarifa_USD800 MONEY;
						SELECT TOP 1 @bl_TAO = ISNULL(bl_TAO,0), @am_TarifaOneWay = am_TarifaOneWay, @am_TarifaRoundTrip = am_TarifaRoundTrip, @am_Tarifa_USD300 = am_Tarifa_USD300, @am_Tarifa_USD300_USD500 = am_Tarifa_USD300_USD500, @am_Tarifa_USD500_USD800 = am_Tarifa_USD500_USD800, @am_Tarifa_USD800 = am_Tarifa_USD800
						FROM dbo.Configuracion_remisiones WHERE id_cliente = @cur_cd_cliente;

						IF @bl_TAO = 1 OR @AUTOTAO = 'S' OR (@AUTOTAOAMADEUS = 'S' AND @cur_iden_gds = 2)
						BEGIN
							IF ISNULL(@bl_TAO, 0) = 0
							BEGIN
								-- Cargar de parametros generales
								SELECT @am_TarifaOneWay = CAST(Valor AS MONEY) FROM dbo.Parametros WHERE id = 61;
								SELECT @am_TarifaRoundTrip = CAST(Valor AS MONEY) FROM dbo.Parametros WHERE id = 62;
								SELECT @am_Tarifa_USD300 = CAST(Valor AS MONEY) FROM dbo.Parametros WHERE id = 67;
								SELECT @am_Tarifa_USD300_USD500 = CAST(Valor AS MONEY) FROM dbo.Parametros WHERE id = 68;
								SELECT @am_Tarifa_USD500_USD800 = CAST(Valor AS MONEY) FROM dbo.Parametros WHERE id = 69;
								SELECT @am_Tarifa_USD800 = CAST(Valor AS MONEY) FROM dbo.Parametros WHERE id = 70;
							END

							-- Determinar rango basado en nacionalidad e itinerario
							DECLARE @tarifa_base MONEY;
							SELECT @tarifa_base = am_tarifa FROM #Concepto WHERE cd_tiquete = @cur_cd_tiquete AND CodigoReserva = @cur_CodigoReserva;

							IF @cur_in_nacionalidad = 1
							BEGIN
								IF dbo.fnza_ItinerarioTipo(@ds_itinerario) = 'OW' SET @ValorTAO = @am_TarifaOneWay;
								ELSE SET @ValorTAO = @am_TarifaRoundTrip;
							END
							ELSE
							BEGIN
								-- Convertir a USD si aplica, aquÃ­ usamos la tarifa base por simplicidad
								DECLARE @TarifaUSD MONEY = ISNULL(@tarifa_base, 0); 
								IF @TarifaUSD <= 300 SET @ValorTAO = @am_Tarifa_USD300;
								ELSE IF @TarifaUSD <= 500 SET @ValorTAO = @am_Tarifa_USD300_USD500;
								ELSE IF @TarifaUSD <= 800 SET @ValorTAO = @am_Tarifa_USD500_USD800;
								ELSE SET @ValorTAO = @am_Tarifa_USD800;
							END

							IF ISNULL(@ValorTAO, 0) > 0
							BEGIN
								INSERT INTO #GenerarConceptosAuto (
										id_ConceptoFacturacion,
										cd_ConceptoFacturacion,
										ds_ConceptoFacturacion,
										id_TiposConceptFac,
										bl_contorlarCargImp,
										bl_CalculoAutoValoresFacturacion,
										id_TiposServicio,
										cd_TiposServicio,
										ds_TiposServicio,
										cd_proveedores,
										ds_proveedores,
										cd_tiquete,
										ds_servicio,
										ds_descrip,
										ds_paxname,
										ds_paxape,
										cd_paxtype,
										ds_paxClasificacion,
										in_nacionalidad,
										dt_llegada,
										dt_salida,
										cd_cencosto,
										cd_auxiliar,
										cd_item,
										Valor,
										am_Contado,
										am_Credito,
										ColId,
										cd_Consecutivo_depende,
										CodigoReserva,
										am_ImpuestoComision,
										Respuesta,
										bl_RutaExentaIva,
										id_FormasPago,
										id_TarjetasCredito,
										am_basedescuento,
										am_pordescuento,
										id_FormasPagoAirPlus,
										cd_FormasPagoAirPlus,
										ds_FormasPagoAirPlus,
										id_TarjetasCreditoAirPlus,
										cd_TarjetasCreditoAirPlus,
										ds_numerotarjetaAirPlus,
										cd_codigotc, 
										ds_numerotc,
										ds_vencetc, 
										ds_autorizaciontc,
										ds_vouchertc, 
										in_cuotastc
								)
								SELECT
										id_ConceptoFacturacion=@cur_in_nacionalidad+3,
										cd_ConceptoFacturacion=CASE WHEN @cur_in_nacionalidad=2 THEN 'CAI' ELSE 'CAN' END,
										ds_ConceptoFacturacion='Tarifa Adminstrativa '+CASE WHEN @cur_in_nacionalidad=2 THEN 'Internacional' ELSE 'Nacional' END,
										id_TiposConceptFac=3,
										bl_contorlarCargImp=0,
										bl_CalculoAutoValoresFacturacion=0,
										id_TiposServicio=NULL,
										cd_TiposServicio='',
										ds_TiposServicio='',
										cd_proveedores='',
										ds_proveedores='',
										cd_tiquete=@cur_cd_tiquete,
										ds_servicio='Tarifa Adminstrativa '+CASE WHEN @cur_in_nacionalidad=2 THEN 'Internacional' ELSE 'Nacional' END + ' Tiquete: ' + ISNULL(@cur_cd_tiquete,''),
										ds_descrip='Tarifa Adminstrativa '+CASE WHEN @cur_in_nacionalidad=2 THEN 'Internacional' ELSE 'Nacional' END + ' Tiquete: ' + ISNULL(@cur_cd_tiquete,''),
										ds_paxname=@cur_ds_paxname,
										ds_paxape=@cur_ds_paxape,
										cd_paxtype=@cur_cd_paxtype,
										ds_paxClasificacion=@cur_ds_paxClasificacion,
										in_nacionalidad=@cur_in_nacionalidad,
										dt_llegada=@cur_dt_llegada,
										dt_salida=@cur_dt_salida,
										cd_cencosto=@cur_cd_cencosto,
										cd_auxiliar=@cur_cd_auxiliar,
										cd_item=@cur_cd_item,
										Valor=@ValorTAO,
										am_Contado=CASE WHEN (CASE WHEN ISNULL(@cur_id_FormasPagoTAO,0)<>0 THEN ISNULL(@cur_id_FormasPagoTAO,0) ELSE ISNULL(@cur_id_FormasPago,0) END)<>2 THEN @ValorTAO ELSE 0 END,
										am_Credito=CASE WHEN (CASE WHEN ISNULL(@cur_id_FormasPagoTAO,0)<>0 THEN ISNULL(@cur_id_FormasPagoTAO,0) ELSE ISNULL(@cur_id_FormasPago,0) END)=2 THEN @ValorTAO ELSE 0 END,
										ColId=@cur_ColId,
										cd_Consecutivo_depende=@cur_cd_Consecutivo_depende,
										CodigoReserva=@cur_CodigoReserva,
										am_ImpuestoComision=0,
										Respuesta='',
										bl_RutaExentaIva=0,
										id_FormasPago=CASE WHEN ISNULL(@cur_id_FormasPagoTAO,0)<>0 THEN @cur_id_FormasPagoTAO ELSE @cur_id_FormasPago END,
										id_TarjetasCredito=CASE WHEN ISNULL(@cur_id_TarjetasCreditoTAO,0)<>0 THEN @cur_id_TarjetasCreditoTAO ELSE @cur_id_TarjetasCredito END,
										am_basedescuento=0,
										am_pordescuento=0,
										id_FormasPagoAirPlus=NULL,
										cd_FormasPagoAirPlus='',
										ds_FormasPagoAirPlus='',
										id_TarjetasCreditoAirPlus=NULL,
										cd_TarjetasCreditoAirPlus='',
										ds_numerotarjetaAirPlus='',
										cd_codigotc=CASE WHEN ISNULL(@cur_cd_codigotcTAO,'')<>'' THEN @cur_cd_codigotcTAO ELSE @cur_cd_codigotc END, 
										ds_numerotc=CASE WHEN ISNULL(@cur_ds_numerotcTAO,'')<>'' THEN @cur_ds_numerotcTAO ELSE @cur_ds_numerotc END,
										ds_vencetc=CASE WHEN ISNULL(@cur_ds_vencetcTAO,'')<>'' THEN @cur_ds_vencetcTAO ELSE @cur_ds_vencetc END, 
										ds_autorizaciontc=CASE WHEN ISNULL(@cur_ds_autorizaciontcTAO,'')<>'' THEN @cur_ds_autorizaciontcTAO ELSE @cur_ds_autorizaciontc END,
										ds_vouchertc=CASE WHEN ISNULL(@cur_ds_vouchertcTAO,'')<>'' THEN @cur_ds_vouchertcTAO ELSE @cur_ds_vouchertc END, 
										in_cuotastc=CASE WHEN ISNULL(@cur_in_cuotastcTAO,0)<>0 THEN @cur_in_cuotastcTAO ELSE @cur_in_cuotastc END
							END
						END
					END
					
					-- 3. Consultar servicios adicionales de la tabla ReservaGDS_Servicios
					/*
					INSERT INTO #Concepto (
						cd_cliente, id_conceptofacturacion, id_tiposservicios, in_nacionalidad,
						id_aerolinea, id_moneda, ds_paxname, ds_paxape, cd_paxtype, ds_paxClasificacion,
						cd_tiquete, cd_proveedores, dt_llegada, dt_salida, cd_cencosto, cd_auxiliar, cd_item,
						CodigoReserva, am_tarifa, am_total, ColId, cd_Consecutivo_depende,
						am_ValorComision, am_ImpuestoComision, am_totalfactura, cd_tourcode,
						am_Contado, am_Credito, cd_tktrevisado, id_TiposDocumento, cd_Penalidad,
						cd_TipoTiqueteGDS, am_TasaCambio, ds_itinerario, id_sucursal, id_implante,
						id_FormasPago, cd_TarjetasCredito, iden_gds
					)
					SELECT 
						@cur_cd_cliente,
						CASE WHEN cd_conceptofacturacion = 'CAN' THEN 4
							 WHEN cd_conceptofacturacion = 'CAI' THEN 5
							 ELSE 3 END,
						NULL,
						ISNULL(in_nacionalidad, @cur_in_nacionalidad),
						@cur_id_aerolinea,
						@cur_id_moneda,
						ISNULL(ds_pax_firstnm, @cur_ds_paxname),
						ISNULL(ds_pax_lastnm, @cur_ds_paxape),
						ISNULL(ds_pax_prefix, @cur_cd_paxtype),
						@cur_ds_paxClasificacion,
						@cur_cd_tiquete,
						cd_proveedores,
						ISNULL(dt_checkout, @cur_dt_llegada),
						ISNULL(dt_checkin, @cur_dt_salida),
						@cur_cd_cencosto,
						ISNULL(cd_auxiliar, @cur_cd_auxiliar),
						@cur_cd_item,
						@cur_CodigoReserva,
						am_tarifa,
						am_tarifa + ISNULL(am_iva, 0),
						CAST(id AS VARCHAR(25)),
						@cur_cd_tiquete,
						ISNULL(am_Comision, 0), 0, am_tarifa + ISNULL(am_iva, 0), NULL,
						ISNULL(am_TarifaContado, 0) + ISNULL(am_IvaContado, 0) + ISNULL(am_OtrosContado, 0),
						ISNULL(am_TarifaCredito, 0) + ISNULL(am_IvaCredito, 0) + ISNULL(am_OtrosCredito, 0),
						NULL, NULL, NULL,
						NULL, 1.0, NULL, @cur_id_sucursal, @cur_id_implante,
						@cur_id_FormasPago, @cur_cd_TarjetasCredito, @cur_iden_gds
					FROM dbo.ReservaGDS_Servicios
					WHERE id_reserva = @cur_id_reserva_int AND ISNULL(bl_anulado, 0) = 0
					*/
				END

				IF @@ERROR <> 0
					BREAK

				FETCH NEXT FROM cur_conceptos INTO @cur_cd_cliente, @cur_id_conceptofacturacion, @cur_in_nacionalidad, @cur_id_aerolinea, @cur_id_moneda, @cur_ds_paxname, @cur_ds_paxape, @cur_cd_paxtype, @cur_ds_paxClasificacion, @cur_cd_tiquete, @cur_dt_llegada, @cur_dt_salida, @cur_cd_cencosto, @cur_cd_auxiliar, @cur_cd_item, @cur_CodigoReserva, @cur_id_sucursal, @cur_id_implante, @cur_id_FormasPago, @cur_cd_TarjetasCredito, @cur_iden_gds, @cur_ColId, @cur_cd_Consecutivo_depende, @cur_cd_codigotc, @cur_ds_numerotc, @cur_ds_vencetc, @cur_ds_autorizaciontc, @cur_ds_vouchertc, @cur_in_cuotastc, @cur_id_FormasPagoTAO, @cur_cd_codigotcTAO, @cur_ds_numerotcTAO, @cur_ds_vencetcTAO, @cur_ds_autorizaciontcTAO, @cur_ds_vouchertcTAO, @cur_in_cuotastcTAO
			END
			CLOSE cur_conceptos
			DEALLOCATE cur_conceptos
			
			SET @msg = 'Conceptos Automaticos Generados Exitosamente'

			--SELECT *
			--	   ,ltrim(rtrim(@msg)) AS 'Respuesta'  
			--FROM #Concepto

			UPDATE c
			SET c.cd_cliente = NULL 
			from #Concepto c
			LEFT JOIN ConfiguracionConceptosAutoClientes ccac ON ccac.cd_cliente = c.cd_cliente
			WHERE ccac.id is NULL 

			Select @NumeroDecimales = 2
			From #Concepto c
			inner JOIN Configuracion_remisiones cr ON cr.id_cliente = c.cd_cliente
			where  bl_decimales_TAO_ConceptoAuto = 1


			INSERT INTO #GenerarConceptosAuto SELECT DISTINCT id_ConceptoFacturacion, cd_ConceptoFacturacion, ds_ConceptoFacturacion, id_TiposConceptFac, bl_contorlarCargImp, bl_CalculoAutoValoresFacturacion, id_TiposServicio, cd_TiposServicio, ds_TiposServicio, cd_proveedores, ds_proveedores, cd_tiquete, ds_servicio, ds_descrip, ds_paxname, ds_paxape, cd_paxtype, ds_paxClasificacion, in_nacionalidad, dt_llegada, dt_salida, cd_cencosto, cd_auxiliar, cd_item
			, Valor 
			, am_Contado 
			, am_Credito
			, ColId, cd_Consecutivo_depende, CodigoReserva, am_ImpuestoComision, Respuesta ,bl_RutaExentaIva --rgelis 2018/04/16 req.57446
			, id_FormasPago, id_TarjetasCredito --rgelis 2018/05/08 req.58559
			,am_basedescuento, am_pordescuento
			,id_FormasPagoAirPlus
            ,cd_FormasPagoAirPlus 
            ,ds_FormasPagoAirPlus
            ,id_TarjetasCreditoAirPlus
            ,cd_TarjetasCreditoAirPlus
            ,ds_numerotarjetaAirPlus
			,cd_codigotc 
			,ds_numerotc
			,ds_vencetc 
			,ds_autorizaciontc
			,ds_vouchertc 
			,in_cuotastc
			From(
				SELECT id_ConceptoFacturacion
					  ,cd_ConceptoFacturacion
					  ,ds_ConceptoFacturacion
					  ,id_TiposConceptFac
					  ,bl_contorlarCargImp
					  ,bl_CalculoAutoValoresFacturacion
					  ,id_TiposServicio
					  ,cd_TiposServicio
					  ,ds_TiposServicio
					  ,cd_proveedores
					  ,ds_proveedores
					  ,cd_tiquete
					  ,ds_servicio
					  ,ds_descrip
					  ,ds_paxname
					  ,ds_paxape
					  ,cd_paxtype
					  ,ds_paxClasificacion
					  ,in_nacionalidad
					  ,dt_llegada
					  ,dt_salida
					  ,cd_cencosto
					  ,cd_auxiliar
					  ,cd_item
					  ,Valor			
					  ,am_Contado = CASE
											WHEN id_FormasPago = 1 THEN valor 
											WHEN am_Contado<>0 AND am_Credito<>0 THEN valor --inicio rgelis 2017/02/11 req.47323
				  							WHEN am_Contado<>0 AND am_Credito=0  THEN valor
				  							ELSE 0 END 
					  ,am_Credito = CASE	WHEN id_FormasPago = 1 THEN 0
											WHEN id_formaspago_padre = 2 THEN valor
											WHEN am_Contado=0 AND am_Credito<>0 THEN valor
				  							ELSE 0 END --fin rgelis 2017/02/11 req.47323	
					  ,ColId
					  ,cd_Consecutivo_depende
					  ,CodigoReserva 
					  ,am_ImpuestoComision
					  ,Respuesta 
					  ,Id_moneda
					  ,id_conceptofacturacionOrigen
					  ,bl_RutaExentaIva --rgelis 2018/04/16 req.57446
					  ,CASE WHEN id_FormasPago = 1 THEN id_FormasPago ELSE NULL END AS 'id_FormasPago'
					  ,NULL  'id_TarjetasCredito'  
					  ,am_basedescuento, am_pordescuento
					  ,id_FormasPagoAirPlus
					  ,cd_FormasPagoAirPlus 
					  ,ds_FormasPagoAirPlus
					  ,id_TarjetasCreditoAirPlus
					  ,cd_TarjetasCreditoAirPlus
					  ,ds_numerotarjetaAirPlus
					  ,cd_codigotc 
					  ,ds_numerotc
					  ,ds_vencetc 
					  ,ds_autorizaciontc
					  ,ds_vouchertc 
					  ,in_cuotastc
				FROM(
					SELECT	cfa.id As 'id_ConceptoFacturacion',
							cfa.cd_codigo As 'cd_ConceptoFacturacion',
							cfa.ds_nombre As 'ds_ConceptoFacturacion',
							cfa.id_TiposConceptoFacturacion As 'id_TiposConceptFac',
							cfa.bl_contorlarCargImp,
							1 AS 'bl_CalculoAutoValoresFacturacion',
							ts.id As 'id_TiposServicio',
							ts.cd_codigo  As 'cd_TiposServicio',
							ts.ds_nombre  As 'ds_TiposServicio',
							cf.cd_proveedores,
							P.RAZONCIAL AS 'ds_proveedores',
							cf.cd_tiquete,
							cfa.ds_nombre As 'ds_servicio',
							cfa.ds_descrip AS 'ds_descrip',
							cf.ds_paxname,
							cf.ds_paxape,
							cf.cd_paxtype,
							cf.ds_paxClasificacion,
							cf.in_nacionalidad,
							cf.dt_llegada,
							cf.dt_salida,
							cd_cencosto = CASE WHEN @bl_utilizarcencostoimp = 1 AND ISNULL(I.cd_cencosto,'')<>'' THEN I.cd_cencosto WHEN @bl_utilizarcencostosuc = 1 AND ISNULL(S.cd_cencosto,'')<>'' THEN S.cd_cencosto ELSE cf.cd_cencosto END,
							cf.cd_auxiliar,
							cf.cd_item,
							Valor=ROUND((CASE WHEN ISNULL(CCC.am_valor,0)<>0 THEN ROUND(CCC.am_valor * CASE WHEN cf.id_moneda <>cc.id_moneda THEN  
																															case when MI.cd_codigo='USD' AND dbo.fnza_Valor_Parametro(424)='N' 
																															THEN @tasa_usd 
																															ELSE  dbo.fnza_Get_TasaCambioDia(@dt_fechaFactura,MI.id_monedaContabilidad) END 
																							 ELSE 1 END
																							 ,@NumeroDecimales) 
										   WHEN cc.bl_Valor=1 AND cc.am_Valor>0 THEN ROUND( cc.am_Valor * CASE WHEN cf.id_moneda <>cc.id_moneda THEN  
																															case when MI.cd_codigo='USD' AND dbo.fnza_Valor_Parametro(424)='N' 
																															THEN @tasa_usd 
																															ELSE  dbo.fnza_Get_TasaCambioDia(@dt_fechaFactura,MI.id_monedaContabilidad) END 
																							 ELSE 1 END
																							 ,@NumeroDecimales)--rgelis 2016/07/22 correccion por redondeo
										   WHEN cc.bl_porcentaje = 1 AND cc.am_porcentaje>0 AND cc.in_tipobasecalcular=0 THEN ROUND((cf.am_tarifa*(cc.am_porcentaje/100)),@NumeroDecimales,case when @TruncarDecimales = 'S' then 1 else 0 end)
										   WHEN cc.bl_porcentaje = 1 AND cc.am_porcentaje>0 AND cc.in_tipobasecalcular=1 THEN ROUND((cf.am_total*(cc.am_porcentaje/100)),@NumeroDecimales,case when @TruncarDecimales = 'S' then 1 else 0 end)
										   WHEN cc.in_tipobasecalcular= 2  THEN cf.am_ValorComision
										   WHEN cc.bl_porcentaje = 1 AND cc.am_porcentaje>0 AND cc.in_tipobasecalcular=3 THEN ROUND((cf.am_totalfactura*(cc.am_porcentaje/100)),@NumeroDecimales,case when @TruncarDecimales = 'S' then 1 else 0 end) 
										   WHEN	cc.bl_rango = 1 AND cc.in_tipobasecalcular=0 THEN dbo.fnza_ValorConceptoAutoRango(c.id,cc.id,cfa.id,cf.am_tarifa)
										   WHEN	cc.bl_rango = 1 AND cc.in_tipobasecalcular=1 THEN dbo.fnza_ValorConceptoAutoRango(c.id,cc.id,cfa.id,cf.am_total) 
										   ELSE 0 
									  END) / CASE WHEN cf.id_moneda <> @IdMonedaLocal AND cf.id_moneda <> cc.id_moneda AND dbo.fnza_Valor_Parametro(504)='S' AND cf.id_conceptofacturacion IN(1,2) AND ISNULL(cf.am_TasaCambio,0)<>0 THEN cf.am_TasaCambio ELSE 1 END --rgelis 2017/10/25/ req.54014
										   * CASE WHEN cf.id_moneda = @IdMonedaLocal AND cf.id_moneda <> cc.id_moneda AND cc.bl_rango = 1 AND ISNULL(@tasa_usd,0)>1 AND dbo.fnza_Valor_Parametro(504)<>'S' AND @PaisLocal='Colombia' THEN @tasa_usd ELSE 1 END,@NumeroDecimales),
							cf.ColId,
							cf.cd_Consecutivo_depende,
							cf.CodigoReserva, 
							am_ImpuestoComision = CASE WHEN cc.in_tipobasecalcular = 2 THEN cf.am_ImpuestoComision ELSE 0 END,
							cf.am_Contado, --rgelis 2017/02/11 req.47323
							cf.am_Credito, --rgelis 2017/02/11 req.47323 
							ltrim(rtrim(@msg)) AS 'Respuesta' ,
							cc.id_moneda,
							c.id_conceptofacturacion As 'id_conceptofacturacionOrigen',
							CASE WHEN c.id_conceptofacturacion IN (1,2) THEN dbo.fnza_RutaTktExentaIva(cf.ds_itinerario) ELSE 0 END AS 'bl_RutaExentaIva', --rgelis 2018/04/16 req.57446
							CFP.id_FormasPago,
							CFP.id_TarjetasCredito,
							CFP.ds_NumeroTarjetasCredito AS 'ds_NumeroTarjetasCredito',
							ISNULL(TC.ds_tcnumber,'') AS 'ds_NumeroTarjetasCreditoGDS',
							id_formaspago_padre = cf.id_formaspago,
							am_basedescuento = 	CASE 
													WHEN cc.bl_porcentaje = 1 AND cc.am_porcentaje>0 AND cc.in_tipobasecalcular=0 THEN cf.am_tarifa
													WHEN cc.bl_porcentaje = 1 AND cc.am_porcentaje>0 AND cc.in_tipobasecalcular=1 THEN cf.am_total
													ELSE 0
												END,
							am_pordescuento = CASE WHEN cc.bl_porcentaje = 1  THEN cc.am_porcentaje ELSE 0 END,
							id_FormasPagoAirPlus = CASE WHEN FPTAO.Id IS NOT NULL THEN FPTAO.Id
														WHEN tcA.Id IS NOT NULL AND cap.id IS NOT NULL THEN cap.Id_FormasPago ELSE NULL END,
							cd_FormasPagoAirPlus = CASE WHEN FPTAO.Id IS NOT NULL THEN FPTAO.cd_codigo
														WHEN tcA.Id IS NOT NULL AND cap.id IS NOT NULL THEN fpap.cd_codigo ELSE NULL END,
							ds_FormasPagoAirPlus = CASE  WHEN FPTAO.Id IS NOT NULL THEN FPTAO.ds_nombre
														WHEN tcA.Id IS NOT NULL AND cap.id IS NOT NULL THEN fpap.ds_nombre ELSE NULL END,
							id_TarjetasCreditoAirPlus = CASE WHEN FPTAO.Id IS NOT NULL AND tctao.id IS NOT NULL Then tctao.id
															 WHEN tcA.Id IS NOT NULL AND cap.id IS NOT NULL Then tcap.id ELSE NULL END,
							cd_TarjetasCreditoAirPlus = CASE WHEN FPTAO.Id IS NOT NULL AND tctao.id IS NOT NULL Then tctao.cd_codigo
															 WHEN tcA.Id IS NOT NULL AND cap.id IS NOT NULL Then tcap.cd_codigo ELSE NULL END,
							ds_numerotarjetaAirPlus = CASE WHEN FPTAO.Id IS NOT NULL AND tctao.id IS NOT NULL Then tkt.cd_NumeroTarjetaTAO
														   WHEN tcA.Id IS NOT NULL AND cap.id IS NOT NULL Then cap.ds_numerotarjeta ELSE NULL END,
							cd_codigotc = cf.cd_codigotc,
							ds_numerotc = cf.ds_numerotc,
							ds_vencetc = cf.ds_vencetc,
							ds_autorizaciontc = cf.ds_autorizaciontc,
							ds_vouchertc = cf.ds_vouchertc, 
							in_cuotastc = cf.in_cuotastc
					FROM dbo.ConfiguracionConceptosAutoClientes c
					INNER JOIN #Concepto cf ON (
												(
													ISNULL(cf.cd_cliente,'') = ISNULL(c.cd_cliente,'') 
													OR (ISNULL(c.cd_cliente,'')='' /*AND ISNULL(cf.cd_cliente,'')=''*/) 
												) 
												AND (
														ISNULL(cf.id_conceptofacturacion,0)=ISNULL(c.id_conceptofacturacion,0) 
														OR (ISNULL(c.id_conceptofacturacion,0)=0 AND ISNULL(cf.id_conceptofacturacion,0)=0)
													)
												AND (
														ISNULL(cf.id_tiposservicios,0)=ISNULL(c.id_tiposservicios,0) 
														OR ISNULL(c.id_tiposservicios,0)=0 --AND ISNULL(cf.id_tiposservicios,0)=0)
													) 
												AND (
														ISNULL(cf.in_nacionalidad,3)=ISNULL(c.in_nacionalidad,3) OR ISNULL(c.in_nacionalidad,3)=3
													)
												AND (
														ISNULL(cf.id_aerolinea,0)=ISNULL(c.id_Aerolinea,0) OR ISNULL(c.id_Aerolinea,0)=0
													)
												AND (
														ISNULL(cf.cd_tourcode,'')=ISNULL(c.cd_tourcode,'') OR ISNULL(c.cd_tourcode,'')=''
													)
												AND (
														ISNULL(cf.id_FormasPago,0)=ISNULL(c.id_formaspago,0) OR ISNULL(c.id_formaspago,0)=0
													)
												AND (
														ISNULL(cf.id_moneda,0)=ISNULL(c.id_moneda,0) OR ISNULL(c.id_moneda,0)=0
													)
												)
					LEFT JOIN dbo.TiposDocumento td ON td.id = cf.id_TiposDocumento --inicio rgelis 2017/09/19 req.52820
					LEFT JOIN dbo.ConfiguracionConceptosAutoClientes_Conceptos cc ON ((cc.id_ConfiguracionConceptosAutoClientes=c.id AND cc.bl_Activo = 1)
																					  AND ((c.id_conceptofacturacion IN (1,2) 
																							AND ((ISNULL(cf.cd_tktrevisado,'')<>'' AND cc.in_revisado=1) 
																								 OR (ISNULL(cf.cd_tktrevisado,'')='' AND cc.in_revisado=2) 
																								 OR cc.in_revisado in (0,3)
																								)
																							AND (((ISNULL(td.bl_EMD,0)=1 OR ISNULL(cf.cd_Penalidad,'')<>'' OR ISNULL(cf.cd_TipoTiqueteGDS,'') = 'EMD') AND cc.in_EMD=1) 
																								 OR ((ISNULL(td.bl_EMD,0)=0 AND ISNULL(cf.cd_Penalidad,'')='' AND ISNULL(cf.cd_TipoTiqueteGDS,'') <> 'EMD') AND cc.in_EMD=2) 
																								 OR cc.in_EMD in (0,3)
																								)
																							AND (((dbo.fnza_RutaTktExentaIva(cf.ds_itinerario)=1) AND cc.in_Exento=1) --inicio rgelis 2018/04/16 req.57446 
																								 OR ((dbo.fnza_RutaTktExentaIva(cf.ds_itinerario)=0) AND cc.in_Exento=2) 
																								 OR cc.in_Exento in (0,3)
																								) --fin rgelis 2018/04/16 req.57446 
																							AND (((dbo.fnza_ItinerarioTipo(cf.ds_itinerario)='OW') AND cc.in_Tipoitinerario=1 AND cc.bl_Tipoitinerario=1) --inicio --rgelis 2019/09/27 req.103215 
																								 OR ((dbo.fnza_ItinerarioTipo(cf.ds_itinerario)='RT') AND cc.in_Tipoitinerario=2 AND cc.bl_Tipoitinerario=1) 
																								 OR (cc.in_Tipoitinerario in (0,3) AND cc.bl_Tipoitinerario=1)
																								 OR cc.bl_Tipoitinerario=0
																								) --fin rgelis 2019/09/27 req.103215 	
																						   )
																						   OR c.id_conceptofacturacion NOT IN (1,2)
																						  )
																					   AND (
																							 (ISNULL(cc.id_sucursal,0) = ISNULL(cf.id_sucursal,0) or ISNULL(cc.id_sucursal,0) = 0)
																							 AND (ISNULL(cc.id_implante,0) = ISNULL(cf.id_implante,0) or ISNULL(cc.id_implante,0) = 0) 
																						   )
																					 ) --fin rgelis 2017/09/19 req.52820
					LEFT JOIN dbo.ConceptoFacturacion cfa ON cfa.id=cc.id_conceptofacturacion
					LEFT JOIN dbo.tiposServicio_asignados tsa ON (tsa.id_ConceptoFacturacion = cfa.id AND tsa.bl_Valdeft = 1) 
					LEFT JOIN dbo.TiposServicios ts ON ts.id = tsa.id_TipoServicio
					LEFT JOIN dbo.PROVEEDORES P ON P.IDPROVE = cfa.cd_proveedor
					LEFT JOIN dbo.Monedas_IATA MI ON MI.id = CC.id_moneda
					--LEFT JOIN dbo.ReservaGDS_Detalles rd on rd.ds_tkt_number = cf.cd_tiquete and cf.id_conceptofacturacion in (1,2)
					--LEFT JOIN dbo.TarjetasCredito TA ON TA.cd_codigo = CF.cd_TarjetasCredito
					OUTER APPLY dbo.fnza_ReservasGdsFormasPago_Table(cf.CodigoReserva,cf.cd_tiquete) AS TC
					LEFT JOIN dbo.ConfiguracioFacturaTarjetasPropias_NumerosTC CFP ON (CFP.ds_NumeroTarjetasCredito = tc.ds_tcnumber AND CFP.id_Sucursal = CF.id_sucursal AND ISNULL(CFP.id_implante,0) = ISNULL(CF.id_implante,0))
					--OUTER APPLY dbo.fnza_ReservasGdsFormasPago_Table(cf.CodigoReserva,cf.cd_tiquete) AS TC
					LEFT JOIN dbo.ConfiguracionClientesConceptos CCC ON CCC.id_conceptofacturacion=cc.id_conceptofacturacion AND CCC.Id_Cliente = c.cd_cliente AND CCC.bl_inactivo=0
					--LEFT JOIN dbo.ReservasGDS r ON r.cd_codigo = cf.CodigoReserva
					LEFT JOIN dbo.ReservaGDS_Detalles tkt ON tkt.ds_tkt_number = cf.cd_tiquete and cf.id_conceptofacturacion in (1,2)
					LEFT JOIN dbo.tarjetascredito tcA on tcA.cd_codigo = tkt.ds_cc_code AND (tcA.bl_airplus = 1 OR @bl_tomarFPAirplusTkt=1)
					LEFT JOIN dbo.Cliente_FP_AirPlus cap on cap.id_cliente = cf.cd_cliente
					LEFT JOIN dbo.tarjetascredito tcap on tcap.id=cap.Id_TarjetasCredito
					LEFT JOIN dbo.FormasPago fpap on fpap.id = cap.Id_FormasPago
					LEFT JOIN dbo.Sucursales S ON S.id = cf.id_sucursal
					LEFT JOIN dbo.Implantes I ON I.id=cf.id_implante
					LEFT JOIN dbo.FormasPago FPTAO ON FPTAO.cd_codigo=Tkt.cd_FormaPagoTAO AND @bl_tomarFPTaoTkt=1 
					LEFT JOIN dbo.tarjetascredito tctao on tctao.cd_codigo=tkt.cd_TarjetaCreditoTAO
					WHERE cc.id is NOT NULL 
					GROUP BY c.id,
							cc.id,
							cc.id_conceptofacturacion,
							cfa.id,
							cfa.id_TiposConceptoFacturacion,
							cfa.bl_contorlarCargImp,
							cf.cd_proveedores,
							P.RAZONCIAL,
							cf.cd_tiquete,
							cfa.cd_codigo,
							cfa.ds_nombre,
							cfa.ds_descrip,
							ts.id,
							ts.cd_codigo,
							ts.ds_nombre,
							cf.ds_paxname,
							cf.ds_paxape,
							cf.cd_paxtype,
							cf.ds_paxClasificacion,
							cf.in_nacionalidad,
							cf.dt_llegada,
							cf.dt_salida,
							cf.cd_cencosto,
							cf.cd_auxiliar,
							cf.cd_item,
							cf.am_tarifa,
							cf.am_total,
							cc.bl_Valor,
							cc.bl_porcentaje,
							cc.am_valor,
							cc.am_porcentaje,
							cc.bl_rango,
							cf.ColId,
							cc.bl_Activo,
							cc.in_tipobasecalcular,
							cf.cd_Consecutivo_depende,
							cf.CodigoReserva,
							cf.am_ValorComision,
							cf.am_ImpuestoComision,
							cf.am_totalfactura ,
							MI.id_monedaContabilidad  ,
							cc.id_moneda ,
							cf.id_moneda, 
							MI.cd_codigo,
							cf.am_Contado, --rgelis 2017/02/11 req.47323
							cf.am_Credito, --rgelis 2017/02/11 req.47323 
							cc.id_moneda,
							c.id_conceptofacturacion,
							cf.id_conceptofacturacion, --rgelis 2017/10/25 req.54014
							CF.am_TasaCambio, --rgelis 2017/10/25 req.54014
							cf.ds_itinerario, --rgelis 2018/04/16 req.57446
							CFP.id_FormasPago, --rgelis 2018/05/08 req.58559
							CFP.id_TarjetasCredito,
							CFP.ds_NumeroTarjetasCredito,
							TC.ds_tcnumber,
							cf.id_formaspago,
							CCC.am_valor,
							tcA.Id,
							cap.id,
							cap.Id_FormasPago, 
							fpap.cd_codigo,
							fpap.ds_nombre,
							tcap.id, 
							tcap.cd_codigo,
							cap.ds_numerotarjeta,
							S.cd_cencosto,
							I.cd_cencosto,
							FPTAO.Id,
							FPTAO.cd_codigo,
							FPTAO.ds_nombre,
							tctao.id,
							tctao.cd_codigo,
							tkt.cd_NumeroTarjetaTAO,
							cf.cd_codigotc,
							cf.ds_numerotc,
							cf.ds_vencetc,
							cf.ds_autorizaciontc,
							cf.ds_vouchertc, 
							cf.in_cuotastc
				) AS C
			 ) AS F			
			--------------------------------------------------------------------------
			
			
			--Determinando si se debe auditar el proceso exitoso
			/*IF (@bl_as = 1) 
			BEGIN 										
				EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce    ,
												 @id_usuario = @id_usuario ,
												 @cd_status  = 1           , 												 
												 @admsg      = NULL        ,
							 					 @msgparams  = @msg;
			END*/ 			 			
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
				/*IF (@bl_af = 1) EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce ,
													 			 @id_usuario = @id_usuario ,
													 			 @cd_status  = 0           , 
													 			 @admsg      = @msg	   ;*/				
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
				IF (XACT_STATE() <> 0)
	   	        BEGIN 				
					SET @retval = 1;
  	 				SET @msg =	'Ha ocurrido un error. InformaciÃ³n para soporte tecnico:'			+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
							    'Numero: ' + isnull(CAST(ERROR_NUMBER()   AS VARCHAR(10)),'') 		+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
								'Mensaje: ' + isnull(ERROR_MESSAGE(),'') 					   		+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
							 	'Severidad: ' + isnull(CAST(ERROR_SEVERITY() AS VARCHAR(10)),'') 	+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
							 	'Estado: ' + isnull(CAST(ERROR_STATE()    AS VARCHAR(10)),'') 		+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
								'Procedimiento: ' + 'spGenerarConceptosAutoConsultar'		+ CHAR(13)+ CHAR(10) + CHAR(13)+ CHAR(10) +
								'Linea: ' + isnull(CAST(ERROR_LINE() 	   AS VARCHAR(10)),''); 							
		
					RAISERROR (@msg,16,126);
					--Se debe auditar proceso fallido
					/*IF (@bl_af = 1) EXEC dbo.spzaAuditoria_Insertar	@id_proceso = @idproce   ,
											 			 			@id_usuario = @id_usuario ,
											 			 			@cd_status  = 0           , 
											 			 			@admsg      = @msg	  ;*/				
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
		/*IF (@bl_af = 1) EXEC dbo.spzaAuditoria_Insertar  @id_proceso = @idproce    ,
											 			 @id_usuario = @id_usuario ,
											 			 @cd_status  = 0           , 
											 			 @admsg      = @msg	   ;*/												 	   					   
  		RAISERROR (@msg,16,127);
  		RETURN @retval;
  	END   	
    
    RETURN @retval;
END
GO



