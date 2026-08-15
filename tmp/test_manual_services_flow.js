const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public"
});

async function test() {
    try {
        console.log("=== INICIANDO PRUEBA DE SERVICIOS Y PROVEEDORES MANUALES ===");

        const clientRes = await pool.query('SELECT id FROM public."Client" LIMIT 1');
        const branchRes = await pool.query('SELECT id FROM public."Branch" LIMIT 1');
        const productRes = await pool.query('SELECT id FROM public."Product" LIMIT 1');
        const taxRes = await pool.query('SELECT id FROM public."ChargeAndTax" LIMIT 1');
        const userRes = await pool.query('SELECT id FROM public."User" LIMIT 1');

        const clientId = clientRes.rows[0]?.id;
        const branchId = branchRes.rows[0]?.id;
        const productId = productRes.rows[0]?.id;
        const mainTaxId = taxRes.rows[0]?.id;
        const userId = userRes.rows[0]?.id || 1;

        console.log(`Usando IDs reales -> Client: ${clientId}, Branch: ${branchId}, Product: ${productId}, Tax: ${mainTaxId}, User: ${userId}`);

        const testPayload = {
            clientId: clientId.toString(),
            branchId: branchId.toString(),
            currency: 'COP',
            exchangeRate: 1,
            sellerId: '',
            commissionPercentage: 10,
            chargesAndTaxes: 0,
            totalAmount: 950000,
            items: [
                {
                    productId: productId,
                    quantity: 1,
                    price: 950000,
                    cost: 600000,
                    mainTaxId: mainTaxId
                }
            ],
            manualServices: [
                {
                    providerName: "Hotel Paraiso Test",
                    serviceName: "Alojamiento 3 Noches",
                    cost: 500000,
                    salePrice: 800000,
                    utility: 300000
                },
                {
                    providerName: "Transportes Sol Test",
                    serviceName: "Traslado In/Out",
                    cost: 100000,
                    salePrice: 150000,
                    utility: 50000
                }
            ]
        };

        // 1. Probar la creación mediante spCotizacionCrear
        const resCrear = await pool.query(
            `CALL public.spCotizacionCrear($1::JSONB, $2::INT, $3::INT, $4::TEXT)`,
            [JSON.stringify(testPayload), userId, null, null]
        );
        
        const createdId = resCrear.rows[0]?.p_quotation_id;
        const msgCrear = resCrear.rows[0]?.p_mensaje_resultado;
        console.log("Resultado spCotizacionCrear ID:", createdId, "Mensaje:", msgCrear);

        if (!createdId) throw new Error("No se creó la cotización de prueba: " + msgCrear);

        // 2. Verificar inserción en QuotationManualService
        const resManuales = await pool.query(
            `SELECT * FROM public."QuotationManualService" WHERE "quotationId" = $1 ORDER BY id ASC`,
            [createdId]
        );
        console.log("Servicios manuales insertados (" + resManuales.rows.length + "):");
        console.log(resManuales.rows);

        if (resManuales.rows.length !== 2) {
            throw new Error("Se esperaban 2 registros manuales, se obtuvieron: " + resManuales.rows.length);
        }

        // 3. Probar actualización con spCotizacionActualizar
        testPayload.manualServices.push({
            providerName: "Seguros Bolivar Test",
            serviceName: "Tarjeta Asistencia",
            cost: 50000,
            salePrice: 90000,
            utility: 40000
        });

        const resAct = await pool.query(
            `CALL public.spCotizacionActualizar($1::INT, $2::JSONB, $3::INT, $4::TEXT)`,
            [createdId, JSON.stringify(testPayload), userId, null]
        );
        console.log("Resultado spCotizacionActualizar Mensaje:", resAct.rows[0]?.p_mensaje_resultado);

        // 4. Verificar actualización en QuotationManualService
        const resManualesAct = await pool.query(
            `SELECT * FROM public."QuotationManualService" WHERE "quotationId" = $1 ORDER BY id ASC`,
            [createdId]
        );
        console.log("Servicios manuales tras actualización (" + resManualesAct.rows.length + "):");
        console.log(resManualesAct.rows);

        if (resManualesAct.rows.length !== 3) {
            throw new Error("Se esperaban 3 registros manuales tras actualizar, se obtuvieron: " + resManualesAct.rows.length);
        }

        // 5. Limpieza de datos de prueba
        await pool.query(`DELETE FROM public."Quotation" WHERE id = $1`, [createdId]);
        console.log("Cotización de prueba eliminada limpia.");
        console.log("=== PRUEBA DE INTEGRACIÓN EXITOSA ===");

    } catch (e) {
        console.error("ERROR EN PRUEBA:", e);
    } finally {
        await pool.end();
    }
}

test();
