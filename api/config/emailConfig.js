const nodemailer = require('nodemailer');

const sendEmail = async (emailData) => {
  try {
    // Input validation
    if (!emailData?.to) {
      console.error('Missing recipient in emailData:', emailData);
      throw new Error('No recipients defined');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      tls: { rejectUnauthorized: false }
    });

    // Log email attempt
    console.log('Sending email:', {
      to: emailData.to,
      subject: emailData.subject,
      hasAttachments: !!emailData.attachments
    });

    const mailOptions = {
      from: `Health Reminder <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      attachments: emailData.attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', {
      error: error.message,
      to: emailData?.to,
      subject: emailData?.subject
    });
    throw error;
  }
};

module.exports = { sendEmail };
