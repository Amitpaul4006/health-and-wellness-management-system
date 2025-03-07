const nodemailer = require('nodemailer');
const emailService = require('../services/emailService');
const { setupTestEnv, mockNodemailer, cleanupTestEnv } = require('./utils/testSetup');

jest.mock('nodemailer');

describe('Email Service', () => {
  let mockMailer;

  beforeEach(() => {
    setupTestEnv();
    mockMailer = mockNodemailer();
  });

  afterEach(() => {
    cleanupTestEnv();
    emailService.transporter = null;
  });

  test('should send email with correct parameters', async () => {
    const emailData = {
      to: 'test@example.com',
      subject: 'Medication Reminder',
      text: 'This is a reminder for your medication.'
    };

    await emailService.sendEmail(emailData);

    expect(mockMailer.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      ...emailData
    });
  });
});