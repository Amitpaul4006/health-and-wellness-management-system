const nodemailer = require('nodemailer');

const sendEmail = async (emailData) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      connectionTimeout: 5000,  // Reduced timeout
      socketTimeout: 5000      // Reduced timeout
    });

    console.log(`Attempting to send email to: ${emailData.to}`);
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      ...emailData
    });

    console.log(`Email sent successfully. MessageId: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`Email sending failed:`, error);
    throw error;
  }
};

module.exports = { sendEmail };
