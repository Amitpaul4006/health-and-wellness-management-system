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
    if (!to) {
      throw new Error('Recipient email is required');
    }

    console.log('Sending email:', {
      to,
      subject,
      hasAttachments: !!attachments,
      attachmentSize: attachments?.length || 0
    });

    const transporter = createTransporter();
    const mailOptions = {
      from: `Health Reminder <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      ...(attachments && {
        attachments: [{
          filename: `medication-report-${new Date().toISOString().split('T')[0]}.csv`,
          content: attachments,
          contentType: 'text/csv'
        }]
      })
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: to
    });
    return info;
  } catch (error) {
    console.error('Email send error:', {
      error: error.message,
      to: to,
      subject: subject
    });
    throw error;
  }
};

module.exports = { sendEmail };
