const nodemailer = require('nodemailer');

async function testMail() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: 'rubiel1985@msn.com',
            pass: 'jxrfwopldqkomrhj',
        },
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        }
    });

    console.log('Sending test email...');
    try {
        await transporter.sendMail({
            from: 'rubiel1985@msn.com',
            to: 'rubiel1985@msn.com',
            subject: 'Test Email',
            text: 'This is a test email from the AgenciasNew app script.'
        });
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

testMail();
