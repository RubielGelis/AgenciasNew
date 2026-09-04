-- =========================================================================
-- Función: dbo.fnFacturacionesListar
-- Base de datos: SQL Server (Agencias)
-- Descripción: Lista facturas con filtros de fechas, cliente, tipo de concepto y concepto.
-- =========================================================================
IF OBJECT_ID('dbo.fnFacturacionesListar', 'IF') IS NOT NULL
    DROP FUNCTION dbo.fnFacturacionesListar;
GO

IF OBJECT_ID('dbo.fnFacturacionesListar', 'TF') IS NOT NULL
    DROP FUNCTION dbo.fnFacturacionesListar;
GO

IF OBJECT_ID('dbo.fnFacturacionesListar', 'FN') IS NOT NULL
    DROP FUNCTION dbo.fnFacturacionesListar;
GO

CREATE FUNCTION dbo.fnFacturacionesListar
(
    @dt_fecha_desde SMALLDATETIME = NULL,
    @dt_fecha_hasta SMALLDATETIME = NULL,
    @cd_cliente VARCHAR(50) = NULL,
    @id_tipo_concepto INT = NULL,
    @id_concepto INT = NULL
)
RETURNS TABLE
AS
RETURN
(
    SELECT DISTINCT
        f.id AS id_factura,
        f.cd_fuente AS fuente,
        f.cd_serie AS serie,
        f.cd_consecutivo AS consecutivo,
        ISNULL(f.numero, RTRIM(f.cd_serie) + RTRIM(f.cd_consecutivo)) AS numero,
        f.dt_fecha AS fecha,
        f.dt_fechacont AS fecha_contable,
        CASE 
            WHEN f.cd_consecutivo_anul IS NOT NULL AND RTRIM(f.cd_consecutivo_anul) <> '' THEN 'Anulada'
            ELSE 'Facturada'
        END AS estado,
        f.cd_cliente_codigo AS cliente_codigo,
        RTRIM(f.ds_cliente_nombre) AS cliente_nombre,
        f.cd_tercero_codigo AS tercero_codigo,
        RTRIM(f.ds_tercero_nombre) AS tercero_nombre,
        -- Datos de Nota Crédito de Anulación si existe
        f.cd_fuente_anul AS fuente_nc,
        f.cd_serie_anul AS serie_nc,
        f.cd_consecutivo_anul AS numero_nc,
        f.dt_fecha_anul AS fecha_nc,
        -- Conceptos
        fs.id_ConceptoFacturacion AS id_concepto,
        c.cd_codigo AS codigo_concepto,
        c.ds_nombre AS nombre_concepto,
        c.id_TiposConceptoFacturacion AS id_tipo_concepto,
        tc.cd_codigo AS codigo_tipo_concepto,
        tc.ds_nombre AS nombre_tipo_concepto,
        f.id_sucursal,
        f.id_implante
    FROM dbo.fac_factura f WITH (NOLOCK)
    LEFT JOIN dbo.Fac_Servicios fs WITH (NOLOCK) ON f.id = fs.id_fac_factura
    LEFT JOIN dbo.ConceptoFacturacion c WITH (NOLOCK) ON fs.id_ConceptoFacturacion = c.id
    LEFT JOIN dbo.TiposConceptFac tc WITH (NOLOCK) ON c.id_TiposConceptoFacturacion = tc.id
    WHERE 
        (@dt_fecha_desde IS NULL OR f.dt_fecha >= @dt_fecha_desde OR f.dt_fechacont >= @dt_fecha_desde)
        AND (@dt_fecha_hasta IS NULL OR f.dt_fecha <= DATEADD(day, 1, @dt_fecha_hasta) OR f.dt_fechacont <= @dt_fecha_hasta)
        AND (@cd_cliente IS NULL OR RTRIM(f.cd_cliente_codigo) = RTRIM(@cd_cliente) OR f.ds_cliente_nombre LIKE '%' + @cd_cliente + '%')
        AND (@id_tipo_concepto IS NULL OR c.id_TiposConceptoFacturacion = @id_tipo_concepto)
        AND (@id_concepto IS NULL OR fs.id_ConceptoFacturacion = @id_concepto)
);
GO