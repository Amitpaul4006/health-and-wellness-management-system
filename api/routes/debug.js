const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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

    // Create a valid test medication with proper ObjectId
    const testMed = {
      _id: new mongoose.Types.ObjectId(), // Fix: Use proper MongoDB ObjectId
      name: 'Test Medication',
      type: 'one-time',
      description: 'Test reminder medication',
      userId: user._id,
      scheduledDate: new Date(Date.now() + 60000), // 1 minute from now
      status: 'pending'
    };

    console.log('Sending test reminder:', {
      medication: testMed,
      user: {
        id: user._id,
        email: user.email
      }
    });

    // Send immediate reminder
    await medicationService.sendReminderNow(testMed, user);
    
    res.json({ 
      message: 'Test reminder sent successfully',
      details: {
        medicationId: testMed._id,
        scheduledFor: testMed.scheduledDate,
        sentTo: user.email
      }
    });
  } catch (error) {
    console.error('Test reminder error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove auth reference since it's handled in server.js
router.get('/system-status', async (req, res) => {
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
