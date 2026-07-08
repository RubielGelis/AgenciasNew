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
