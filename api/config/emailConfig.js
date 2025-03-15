const nodemailer = require('nodemailer');

const sendEmail = async (emailData) => {
  try {
    // Validate email data
    if (!emailData?.to) {
      console.error('Missing recipient:', emailData);
      throw new Error('No recipients defined');
    }

    // Log attempt
    console.log('Sending email:', {
      to: emailData.to,
      subject: emailData.subject,
      hasAttachments: !!emailData.attachments
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Send with timeout
    const emailPromise = transporter.sendMail({
      from: `Health Reminder <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      ...emailData
    });

    const result = await Promise.race([
      emailPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout')), 8000))
    ]);

    console.log('Email sent successfully:', {
      messageId: result.messageId,
      to: emailData.to
    });

    return result;
  } catch (error) {
    console.error('Email send error:', {
      error: error.message,
      recipient: emailData?.to
    });
    throw error;
  }
};

module.exports = { sendEmail };
