const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public'
});

async function run() {
    await client.connect();
    console.log('Desplegando Funciones y SPs de Roles en PostgreSQL...');

    const fnRoleListar = fs.readFileSync(path.join(__dirname, '../SQL/Function/fnRoleListar.sql'), 'utf8');
    const spRoleGuardar = fs.readFileSync(path.join(__dirname, '../SQL/SP/spRoleGuardarYPermisos.sql'), 'utf8');
    const fnUserPermissions = fs.readFileSync(path.join(__dirname, '../SQL/Function/fnUserPermissions.sql'), 'utf8');

    await client.query(fnRoleListar);
    console.log('✅ Función fnRoleListar() desplegada.');

    await client.query(spRoleGuardar);
    console.log('✅ Procedimiento spRoleGuardarYPermisos desplegado.');

    await client.query(fnUserPermissions);
    console.log('✅ Función fnUserPermissions() desplegada.');

    await client.end();
}

run().catch(console.error);
