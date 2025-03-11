const nodemailer = require('nodemailer');

const sendEmail = async (emailData) => {
  console.log('Sending email with config:', {
    hasUser: !!process.env.EMAIL_USER,
    type: emailData.attachments ? 'report' : 'reminder'
  });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      connectionTimeout: 5000,
      socketTimeout: 5000
    });

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      ...emailData
    });

    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email config error:', error);
    throw error;
  }
};

module.exports = { sendEmail };
