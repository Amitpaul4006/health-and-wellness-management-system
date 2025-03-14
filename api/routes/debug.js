const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendEmail } = require('../config/emailConfig');
const medicationService = require('../services/medicationService');

router.get('/test-email', auth, async (req, res) => {
  try {
    console.log('Testing email configuration:', {
      emailUser: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_APP_PASSWORD,
      environment: process.env.NODE_ENV
    });

    await sendEmail(
      req.user.email,
      'Test Email from Production',
      '<h2>Email Test</h2><p>This is a test email from the production environment.</p>'
    );

    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

router.get('/test-reminder', auth, async (req, res) => {
  try {
    const testMed = {
      _id: 'test-' + Date.now(),
      name: 'Test Medication',
      description: 'Test Reminder',
      type: 'one-time',
      scheduledDate: new Date(Date.now() + 1000 * 60) // 1 minute from now
    };

    console.log('Testing reminder with:', {
      medication: testMed,
      userEmail: req.user.email
    });

    await medicationService.sendReminderNow(testMed, { 
      email: req.user.email,
      _id: req.user.id 
    });

    res.json({ message: 'Test reminder sent successfully' });
  } catch (error) {
    console.error('Reminder test error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

router.get('/system-status', auth, async (req, res) => {
  const status = {
    environment: process.env.NODE_ENV,
    serverTime: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    emailConfigured: !!process.env.EMAIL_USER && !!process.env.EMAIL_APP_PASSWORD,
    activeReminders: medicationService.getActiveReminders(req.user.id)
  };

  res.json(status);
});

module.exports = router;
