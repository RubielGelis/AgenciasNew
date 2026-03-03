const { google } = require('googleapis'); // Note: For Outlook we use a different flow, but similar logic.
// Using a simpler approach with a direct fetch or a library like 'openid-client'

// For simplicity in this environment, we'll use a direct link generation
const CLIENT_ID = 'TU_CLIENT_ID';
const REDIRECT_URI = 'http://localhost:3000';
const SCOPES = 'https://outlook.office.com/SMTP.Send offline_access';

const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&response_mode=query&scope=${encodeURIComponent(SCOPES)}`;

console.log('1. Abre este enlace en tu navegador para autorizar:');
console.log(authUrl);
console.log('\n2. Después de autorizar, serás redirigido a una URL que no carga (localhost:3000).');
console.log('3. Copia el parámetro "?code=" de esa URL y pégalo aquí.');
