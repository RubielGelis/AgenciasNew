const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public'
});

async function run() {
    await client.connect();
    console.log('Desplegando Funciones y SPs de Pre-Cotizaciones en PostgreSQL...');

    const fnListar = fs.readFileSync(path.join(__dirname, '../SQL/Function/fnPreCotizacionListar.sql'), 'utf8');
    const spCrear = fs.readFileSync(path.join(__dirname, '../SQL/SP/spPreCotizacionCrear.sql'), 'utf8');
    const spConvertir = fs.readFileSync(path.join(__dirname, '../SQL/SP/spPreCotizacionConvertir.sql'), 'utf8');
    const spCotCrear = fs.readFileSync(path.join(__dirname, '../SQL/SP/spCotizacionCrear.sql'), 'utf8');

    await client.query(fnListar);
    console.log('✅ Función fnPreCotizacionListar() desplegada.');

    await client.query(spCrear);
    console.log('✅ Procedimiento spPreCotizacionCrear desplegado.');

    await client.query(spConvertir);
    console.log('✅ Procedimiento spPreCotizacionConvertir desplegado.');

    await client.query(spCotCrear);
    console.log('✅ Procedimiento spCotizacionCrear actualizado.');

    await client.end();
}

run().catch(console.error);
