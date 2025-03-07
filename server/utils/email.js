const nodemailer = require('nodemailer');
const User = require('../models/User'); // Corrected import path

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (userId, subject, text, attachmentPath = null) => {
  const user = await User.findById(userId);
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject,
    text,
  };
  if (attachmentPath) {
    mailOptions.attachments = [{ path: attachmentPath }];
  }
  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };