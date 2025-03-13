const nodemailer = require('nodemailer');

const createTransporter = () => {
  console.log('Creating email transporter:', {
    user: process.env.EMAIL_USER,
    environment: process.env.NODE_ENV
  });

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendEmail = async (to, subject, html, attachments = null) => {
  try {
    const transporter = createTransporter();
    console.log('Sending email:', { to, subject });

    const mailOptions = {
      from: `Health & Wellness <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      ...(attachments && {
        attachments: [{
          filename: 'report.csv',
          content: attachments,
          contentType: 'text/csv'
        }]
      })
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

module.exports = { sendEmail };
