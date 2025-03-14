const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Medication = require('../models/Medication');
const User = require('../models/User');
const medicationService = require('../services/medicationService');

// Validation middleware
const validateMedication = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('type').isIn(['one-time', 'recurring']).withMessage('Invalid medication type'),
  body(['date', 'schedule.startDate'])
    .optional()
    .custom((value, { req }) => {
      const date = value || req.body.schedule?.startDate;
      if (!date) {
        throw new Error('Date is required');
      }
      // Verify date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error('Date must be in YYYY-MM-DD format');
      }
      return true;
    }),
  body(['time', 'schedule.time'])
    .optional()
    .custom((value, { req }) => {
      const time = value || req.body.schedule?.time;
      if (!time) {
        throw new Error('Time is required');
      }
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
        throw new Error('Time must be in HH:mm format');
      }
      return true;
    }),
  body('description').optional().trim(),
  (req, res, next) => {
    // Transform data if using schedule format
    if (req.body.schedule) {
      req.body.date = req.body.schedule.startDate;
      req.body.time = req.body.schedule.time;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', {
        errors: errors.array(),
        receivedData: req.body
      });
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array(),
        receivedData: req.body
      });
    }
    next();
  }
];

// Routes
router.get('/', auth, async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user.id });
    res.json(medications);
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ message: 'Failed to fetch medications' });
  }
});

// Add medication with reminder
router.post('/add', auth, validateMedication, async (req, res) => {
  try {
    // Get user first
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create medication
    const medication = new Medication({
      userId: req.user.id,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      scheduledDate: new Date(`${req.body.date}T${req.body.time}`),
      status: 'pending'
    });

    // Save medication
    const savedMedication = await medication.save();
    console.log('Medication saved:', {
      id: savedMedication._id,
      type: savedMedication.type,
      scheduledDate: savedMedication.scheduledDate
    });

    // Schedule reminder
    await medicationService.scheduleReminder(savedMedication, {
      _id: user._id,
      email: user.email,
      username: user.username
    });

    console.log('Reminder scheduled for:', {
      medicationId: savedMedication._id,
      email: user.email,
      scheduledDate: savedMedication.scheduledDate
    });

    res.status(201).json(savedMedication);
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update medication status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const medication = await Medication.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: { status } },
      { new: true }
    );

    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    res.json(medication);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.get('/debug/reminders', auth, async (req, res) => {
  try {
    const medications = await Medication.find({
      userId: req.user.id,
      status: 'pending',
      scheduledDate: { $gt: new Date() }
    });

    const reminderInfo = medications.map(med => ({
      id: med._id,
      name: med.name,
      type: med.type,
      scheduledDate: med.scheduledDate,
      timeUntilReminder: new Date(med.scheduledDate) - new Date(),
      minutesUntil: Math.floor((new Date(med.scheduledDate) - new Date()) / 1000 / 60)
    }));

    res.json({
      totalReminders: reminderInfo.length,
      reminders: reminderInfo,
      serverTime: new Date(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  } catch (error) {
    console.error('Debug reminders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add debug endpoint for notifications
router.get('/debug/notifications', auth, async (req, res) => {
  try {
    const activeReminders = await medicationService.getActiveReminders(req.user.id);
    res.json({
      reminders: activeReminders,
      serverTime: new Date(),
      timezone: process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add debug endpoint
router.get('/debug/reminder-status', auth, async (req, res) => {
  try {
    const medications = await Medication.find({
      userId: req.user.id,
      status: 'pending'
    }).sort({ scheduledDate: 1 });

    const now = new Date();
    const reminderStatus = medications.map(med => ({
      id: med._id,
      name: med.name,
      type: med.type,
      scheduledDate: med.scheduledDate,
      timeUntilReminder: med.scheduledDate - now,
      minutesUntil: Math.floor((med.scheduledDate - now) / 1000 / 60),
      lastReminderSent: med.lastReminderSent,
      lastReminderScheduled: med.lastReminderScheduled,
      nextReminder: med.nextReminder
    }));

    res.json({
      count: medications.length,
      currentTime: now,
      medications: reminderStatus
    });
  } catch (error) {
    console.error('Reminder status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get medication status
router.get('/:id/status', auth, async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    res.json({ status: medication.status });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Remove the incorrect reference to medicationController
// router.get('/:id/status', auth, medicationController.getMedicationStatus);

module.exports = router;