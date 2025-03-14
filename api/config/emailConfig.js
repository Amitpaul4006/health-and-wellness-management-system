const nodemailer = require('nodemailer');

const createTransporter = () => {
  console.log('Creating email transporter with:', {
    user: process.env.EMAIL_USER,
    hasPassword: !!process.env.EMAIL_APP_PASSWORD,
    env: process.env.NODE_ENV
  });

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true,
    logger: true
  });
};

const sendEmail = async (to, subject, html) => {
  try {
    console.log('Sending email:', { to, subject });
    
    const transporter = createTransporter();
    const mailOptions = {
      from: `Health Reminder <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

module.exports = { sendEmail };
