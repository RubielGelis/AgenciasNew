const axios = require('axios');
const qs = require('querystring');

async function getRefreshToken(clientId, clientSecret, code) {
    const data = {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: 'http://localhost:3000',
        grant_type: 'authorization_code',
        scope: 'https://outlook.office.com/SMTP.Send offline_access'
    };

    try {
        const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', qs.stringify(data));
        console.log('TU REFRESH TOKEN ES:');
        console.log(response.data.refresh_token);
    } catch (error) {
        console.error('Error al obtener el token:', error.response ? error.response.data : error.message);
    }
}

// Uso: node get-token.js CLIENT_ID CLIENT_SECRET CODE
const [, , cid, secret, code] = process.argv;
if (!cid || !secret || !code) {
    console.log('Uso: node src/scripts/get-token.js <CLIENT_ID> <CLIENT_SECRET> <CODE>');
} else {
    getRefreshToken(cid, secret, code);
}
