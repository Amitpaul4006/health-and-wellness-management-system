const nodemailer = require('nodemailer');

const sendEmail = async (emailData) => {
  try {
    // Validate email data
    if (!emailData?.to) {
      console.error('Missing recipient:', { emailData });
      throw new Error('No recipients defined');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    // Send mail with error handling
    console.log('Attempting to send email to:', emailData.to);
    const info = await transporter.sendMail({
      from: `Health Reminder <${process.env.EMAIL_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      attachments: emailData.attachments
    });

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: emailData.to
    });

    return info;
  } catch (error) {
    console.error('Email send error:', {
      error: error.message,
      stack: error.stack,
      to: emailData?.to
    });
    throw error;
  }
};

module.exports = { sendEmail };
