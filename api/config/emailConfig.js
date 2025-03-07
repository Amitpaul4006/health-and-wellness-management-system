const nodemailer = require('nodemailer');

let mockTransporter = null;

const validateCredentials = () => {
  const requiredVars = ['EMAIL_USER', 'EMAIL_APP_PASSWORD'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

const createTransporter = () => {
  if (process.env.NODE_ENV === 'test') {
    if (!mockTransporter) {
      throw new Error('Email transporter not configured for test environment');
    }
    return mockTransporter;
  }

  // Use Gmail with app-specific password
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD // Use app-specific password instead of regular password
    }
  });
};

const validateEmailData = (emailData) => {
  if (!emailData || typeof emailData !== 'object') {
    throw new Error('Invalid email data format');
  }

  if (!emailData.to) {
    throw new Error('No recipients defined in email data');
  }

  if (!emailData.subject) {
    throw new Error('Email subject is required');
  }

  if (!emailData.text && !emailData.html) {
    throw new Error('Email must have either text or HTML content');
  }
};

const sendEmail = async (emailData) => {
  try {
    validateEmailData(emailData);

    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Email configuration:', {
        user: process.env.EMAIL_USER,
        hasAppPassword: !!process.env.EMAIL_APP_PASSWORD,
        emailData
      });
    }

    const mailTransporter = createTransporter();
    const { to, subject, text, html, attachments } = emailData;
    
    return await mailTransporter.sendMail({ 
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
      attachments
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const setTransporter = (transporter) => {
  mockTransporter = transporter;
};

module.exports = {
  sendEmail,
  setTransporter
};
