const nodemailer = require('nodemailer');

async function testMail() {
    const transporter = nodemailer.createTransport({
        service: 'Hotmail',
        auth: {
            user: 'rubiel1985@msn.com',
            pass: 'jxrfwopldqkomrhj',
        }
    });

    console.log('Sending test email via Hotmail service...');
    try {
        await transporter.sendMail({
            from: 'rubiel1985@msn.com',
            to: 'rubiel1985@msn.com',
            subject: 'Test Email Hotmail',
            text: 'This is a test email using the Hotmail service preset.'
        });
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error details:', error);
    }
}

testMail();
