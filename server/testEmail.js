require('dotenv').config();
const { sendEmail } = require('./config/emailConfig');

const testEmail = async () => {
  const email = 'amitpaul4006@gmail.com';
  const subject = 'Test Email';
  const html = '<h2>Test Email</h2><p>This is a test email.</p>';
  const attachments = 'name,description,type,scheduledDate,time,status\nTest,Description,one-time,2025-03-05T13:58:00.000Z,,done';

  try {
    await sendEmail(email, subject, html, attachments);
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
};

testEmail();
