const express = require('express');
const router = express.Router();
const { sendEmail } = require('../config/emailConfig');
const medicationService = require('../services/medicationService');
const User = require('../models/User');

// Debug routes - already protected by auth middleware from server.js
router.get('/test-email', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await sendEmail(
      user.email,
      'Test Email from Production',
      '<h2>Email Test</h2><p>This is a test email from the production environment.</p>'
    );

    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/test-reminder', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const testMed = {
      _id: `test-${Date.now()}`,
      name: 'Test Medication',
      type: 'one-time',
      scheduledDate: new Date(Date.now() + 60000)
    };

    await medicationService.sendReminderNow(testMed, user);
    res.json({ message: 'Test reminder sent successfully' });
  } catch (error) {
    console.error('Test reminder error:', error);
    res.status(500).json({ error: error.message });
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
