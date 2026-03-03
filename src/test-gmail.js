const nodemailer = require('nodemailer');

async function testGmail() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'rubiel1985@gmail.com',
            pass: 'dijevekyghvtrssu'
        }
    });

    console.log('Enviando correo de prueba vía Gmail...');
    try {
        await transporter.sendMail({
            from: '"Soporte Agencias New" <rubiel1985@gmail.com>',
            to: 'rubiel1985@gmail.com',
            subject: 'Prueba de Conexión Gmail - Agencias New',
            text: 'Si recibes esto, el servidor de correo de Gmail funciona perfectamente con tu clave.'
        });
        console.log('¡Correo enviado con éxito!');
    } catch (error) {
        console.error('Error al enviar:', error.message);
    }
}

testGmail();
