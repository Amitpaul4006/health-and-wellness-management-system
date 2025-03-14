
require('dotenv').config();
const { sendEmail } = require('../config/emailConfig');

const verifyConfig = async () => {
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    EMAIL_USER: process.env.EMAIL_USER,
    JWT_SECRET: !!process.env.JWT_SECRET,
    MONGODB_URI: !!process.env.MONGODB_URI
  });

  try {
    await sendEmail(
      process.env.EMAIL_USER,
      'Configuration Test',
      '<h2>Configuration Test</h2><p>This email confirms your email configuration is working.</p>'
    );
    console.log('Email configuration verified');
  } catch (error) {
    console.error('Email configuration error:', error);
  }
};

verifyConfig();