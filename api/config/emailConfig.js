const nodemailer = require('nodemailer');

const sendEmail = async (emailData) => {
  try {
    console.log('Sending email with config:', {
      env: process.env.NODE_ENV,
      hasUser: !!process.env.EMAIL_USER,
      type: emailData.attachments ? 'report' : 'reminder'
    });

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
      from: process.env.EMAIL_FROM,
      ...emailData
    });

    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

module.exports = { sendEmail };
