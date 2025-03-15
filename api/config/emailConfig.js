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

const sendEmail = async (emailData) => {
  try {
    if (!emailData.to) {
      throw new Error('No recipients defined');
    }

    console.log('Sending email:', {
      to: emailData.to,
      subject: emailData.subject,
      hasAttachments: !!emailData.attachments
    });

    const transporter = createTransporter();
    const mailOptions = {
      from: `Health Reminder <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      ...emailData
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', {
      error: error.message,
      recipient: emailData?.to
    });
    throw error;
  }
};

module.exports = { sendEmail };
