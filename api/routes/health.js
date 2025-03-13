
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { sendEmail } = require('../config/emailConfig');
const medicationService = require('../services/medicationService');

router.get('/check', async (req, res) => {
  try {
    const status = {
      server: 'ok',
      email: false,
      database: false,
      reminders: false
    };

    // Check email
    try {
      await sendEmail(
        process.env.EMAIL_USER,
        'Health Check',
        '<p>Server health check</p>'
      );
      status.email = true;
    } catch (e) {
      console.error('Email health check failed:', e);
    }

    // Check database
    try {
      await mongoose.connection.db.admin().ping();
      status.database = true;
    } catch (e) {
      console.error('Database health check failed:', e);
    }

    // Check reminder service
    status.reminders = medicationService.isInitialized();

    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;