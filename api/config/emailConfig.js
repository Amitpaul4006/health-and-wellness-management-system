const nodemailer = require('nodemailer');

const createTransporter = () => {
  console.log('Creating email transporter with:', {
    user: process.env.EMAIL_USER,
    hasPass: !!process.env.EMAIL_APP_PASSWORD
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
      attachments: attachments ? [
        {
          filename: 'medication-report.csv',
          content: attachments,
          contentType: 'text/csv'
        }
      ] : undefined
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;

  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

module.exports = { sendEmail };
