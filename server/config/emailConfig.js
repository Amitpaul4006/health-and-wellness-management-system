const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

const sendEmail = async (emailData) => {
  try {
    const mailTransporter = createTransporter();
    const { to, subject, text, html, attachments } = emailData;
    
    const mailOptions = { 
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
      attachments
    };

    // Set timeout for email sending
    const emailPromise = mailTransporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout')), 8000)
    );

    return await Promise.race([emailPromise, timeoutPromise]);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };
