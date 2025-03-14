const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    connectionTimeout: 5000,
    socketTimeout: 5000
  });
};

const sendEmail = async (to, subject, html, attachments = null) => {
  try {
    console.log('Sending email:', { to, subject, hasAttachments: !!attachments });
    
    if (!to) {
      throw new Error('No recipients defined');
    }

    const transporter = createTransporter();
    const mailOptions = {
      from: `Health Reminder <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      ...(attachments && {
        attachments: [{
          filename: 'medication-report.csv',
          content: attachments,
          contentType: 'text/csv'
        }]
      })
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
