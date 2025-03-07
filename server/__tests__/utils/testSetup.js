const nodemailer = require('nodemailer');
const emailService = require('../../services/emailService');

function setupTestEnv() {
  process.env.NODE_ENV = 'test';
  process.env.EMAIL_FROM = 'test@example.com';
}

function mockNodemailer() {
  const mockSendMail = jest.fn().mockImplementation((mailOptions) => 
    Promise.resolve({
      messageId: 'test-id',
      envelope: mailOptions
    })
  );

  const mockTransporter = {
    sendMail: mockSendMail
  };

  // Set the mock transporter directly on the email service
  emailService.setTransporter(mockTransporter);

  return {
    transporter: mockTransporter,
    sendMail: mockSendMail
  };
}

function cleanupTestEnv() {
  delete process.env.NODE_ENV;
  delete process.env.EMAIL_FROM;
  emailService.setTransporter(null);
  jest.clearAllMocks();
}

module.exports = {
  setupTestEnv,
  mockNodemailer,
  cleanupTestEnv
};
