const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  initializeTransporter() {
    // Skip real SMTP setup in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    if (this.transporter) return;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail({ to, subject, text }) {
    if (process.env.NODE_ENV === 'test') {
      // Use the mocked transporter in test environment
      return await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text
      });
    }

    this.initializeTransporter();

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text
      };
      
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  // Method to set transporter (useful for testing)
  setTransporter(mockTransporter) {
    this.transporter = mockTransporter;
  }
}

module.exports = new EmailService();
