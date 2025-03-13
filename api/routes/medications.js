const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Medication = require('../models/Medication');
const User = require('../models/User');
const { scheduleReminder } = require('../services/jobScheduler');

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
    const medicationData = {
      userId: req.user.id,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      scheduledDate: new Date(`${req.body.date}T${req.body.time}`),
      status: 'pending'
    };

    console.log('Creating medication:', medicationData);
    const medication = new Medication(medicationData);
    const saved = await medication.save();

    // Schedule reminder
    const user = await User.findById(req.user.id);
    await scheduleReminder(saved, user);

    res.status(201).json(saved);
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

router.get('/:id/status', auth, medicationController.getMedicationStatus);

module.exports = router;