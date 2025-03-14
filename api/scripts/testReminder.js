require('dotenv').config();
const { sendEmail } = require('../config/emailConfig');
const medicationService = require('../services/medicationService');

const testReminder = async () => {
  try {
    // Test immediate email
    console.log('Testing immediate email...');
    await sendEmail(
      process.env.EMAIL_USER,
      'Test Reminder',
      '<h2>Test Reminder</h2><p>This is a test reminder.</p>'
    );
    console.log('Immediate email sent successfully');

    // Test scheduled reminder
    console.log('Testing scheduled reminder...');
    const testMedication = {
      _id: 'test123',
      name: 'Test Medicine',
      description: 'Test Description',
      type: 'one-time',
      scheduledDate: new Date(Date.now() + 1000 * 60) // 1 minute from now
    };

    const testUser = {
      _id: 'user123',
      email: process.env.EMAIL_USER,
      username: 'Test User'
    };

    await medicationService.scheduleReminder(testMedication, testUser);
    console.log('Reminder scheduled successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testReminder();
