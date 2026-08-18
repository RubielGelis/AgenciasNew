import { verifyLicenseKey, getStoredLicenseStatus, applyLicenseKey } from '../src/lib/license';

async function test() {
    const key = 'KOR1.eyJjIjoiQWdlbmNpYSBEZW1vIiwibiI6IjkwMDEyMzQ1Ni0xIiwiZSI6IjIwMjctMTItMzEiLCJpIjoiMjAyNi0wOC0xOCJ9.611a49669d9bbc62983f5ad42fd7a3962047c02b05c93b5451d1942e398e367b';
    console.log('--- 1. Verificar Firma Token ---');
    const ver = verifyLicenseKey(key);
    console.log(ver);

    console.log('--- 2. Guardar en Base de Datos Postgres ---');
    const applied = await applyLicenseKey(key, 1);
    console.log('Aplicada:', applied);

    console.log('--- 3. Consultar Estado en BD ---');
    const status = await getStoredLicenseStatus();
    console.log('Status BD:', status);

    process.exit(0);
}

test().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
