const { Client } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno de .env
const envPath = path.join(__dirname, '..', '.env');
let dbUrl = 'postgresql://postgres:zzeusagencias@localhost:5432/Korex_colaereo?schema=public';
let secretKey = 'Korex_Master_License_Secret_Key_2026_Secure';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            if (key === 'DATABASE_URL') dbUrl = val;
            if (key === 'LICENSE_SECRET' || key === 'NEXTAUTH_SECRET') secretKey = val;
        }
    });
}

function verifyKey(licenseKey) {
    if (!licenseKey) return { isValid: false, error: 'Clave vacía' };
    const parts = licenseKey.trim().split('.');
    if (parts.length !== 3 || parts[0] !== 'KOR1') {
        return { isValid: false, error: 'Formato de clave no reconocido (debe iniciar por KOR1...)' };
    }

    const [, payloadBase64, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', secretKey).update(payloadBase64).digest('hex');

    if (signature !== expectedSignature) {
        return { isValid: false, error: 'La firma de la clave es inválida o fue alterada.' };
    }

    try {
        const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
        return { isValid: true, payload: { client: decoded.c, nit: decoded.n, exp: decoded.e } };
    } catch (e) {
        return { isValid: false, error: 'Error al descifrar el contenido del token.' };
    }
}

async function activarLicencia(licenseKey) {
    const verification = verifyKey(licenseKey);
    if (!verification.isValid) {
        console.error(`\n❌ ERROR DE ACTIVACIÓN: ${verification.error}\n`);
        process.exit(1);
    }

    const { client: clientName, nit, exp } = verification.payload;
    const pgClient = new Client({ connectionString: dbUrl });

    try {
        await pgClient.connect();

        // Validar si la agencia tiene un NIT registrado que deba coincidir
        const resAgencyNit = await pgClient.query(`SELECT value FROM public."SystemParameter" WHERE code = 'AGENCY_NIT'`);
        if (resAgencyNit.rows.length > 0 && resAgencyNit.rows[0].value) {
            const configuredNit = resAgencyNit.rows[0].value.trim();
            if (configuredNit && configuredNit !== nit.trim()) {
                console.error(`\n❌ ERROR: Esta licencia pertenece al NIT ${nit}, pero esta agencia tiene configurado el NIT ${configuredNit}.\n`);
                await pgClient.end();
                process.exit(1);
            }
        }

        // Registrar/Actualizar Parámetros en PostgreSQL
        await pgClient.query(`
            INSERT INTO public."SystemParameter" (code, name, value) 
            VALUES ('LICENSE_KEY', 'Clave de Licencia del Sistema', $1),
                   ('LICENSE_EXPIRATION_DATE', 'Fecha de Expiración de Licencia', $2),
                   ('AGENCY_NAME', 'Nombre o Razón Social de la Agencia', $3),
                   ('AGENCY_NIT', 'NIT de la Agencia', $4)
            ON CONFLICT (code) DO UPDATE SET value = EXCLUDED.value
        `, [licenseKey.trim(), exp, clientName.trim(), nit.trim()]);

        console.log('\n================================================================');
        console.log('         ✅ LICENCIA ACTIVADA CON ÉXITO EN POSTGRESQL           ');
        console.log('================================================================');
        console.log(`Agencia    : ${clientName}`);
        console.log(`NIT        : ${nit}`);
        console.log(`Nueva Fecha: ${exp}`);
        console.log('================================================================\n');

        await pgClient.end();
    } catch (err) {
        console.error(`\n❌ ERROR EN BASE DE DATOS: ${err.message}\n`);
        process.exit(1);
    }
}

const args = process.argv.slice(2);
if (args.length >= 1) {
    activarLicencia(args[0]);
} else {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.question('Pegue la Clave de Licencia completa (KOR1...): ', (key) => {
        readline.close();
        activarLicencia(key.trim());
    });
}
