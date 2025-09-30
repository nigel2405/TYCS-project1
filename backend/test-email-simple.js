require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📧 Testing email configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT CONFIGURED');

async function testEmail() {
  try {
    // Create transporter
    console.log('🔧 Creating transporter...');
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('✅ Transporter created successfully');

    // Verify connection
    console.log('🔍 Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'alice+test@test.com', // Test email
      subject: 'Test Email from Backend',
      text: 'This is a test email to verify nodemailer functionality.',
      html: '<p>This is a <b>test email</b> to verify nodemailer functionality.</p>'
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error(error);
  }
}

testEmail();