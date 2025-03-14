const nodemailer = require('nodemailer');

const createTransporter = () => {
  // Validate required env vars
  const requiredVars = ['EMAIL_USER', 'EMAIL_APP_PASSWORD'];
  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('Creating email transporter:', {
    emailUser: process.env.EMAIL_USER,
    envFile: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
  });

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    debug: true
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
