const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  debug: true, // Enable debug logs
  logger: true // Enable logger
});

const sendEmail = async (to, subject, html, attachments = null) => {
  try {
    console.log('Sending email:', { to, subject, hasAttachments: !!attachments });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    };

    if (attachments) {
      mailOptions.attachments = [{
        filename: 'report.csv',
        content: attachments
      }];
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

module.exports = { sendEmail, transporter };
