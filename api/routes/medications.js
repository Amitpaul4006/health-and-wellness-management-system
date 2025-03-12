const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const medicationController = require('../controllers/medicationController');
const Medication = require('../models/Medication'); // Add this import

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

router.post('/add', auth, validateMedication, async (req, res) => {
  try {
    console.log('Creating medication:', {
      userId: req.user.id,
      body: req.body
    });

    const medicationData = {
      userId: req.user.id,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      scheduledDate: new Date(`${req.body.date}T${req.body.time}`),
      status: 'pending'
    };

    const medication = new Medication(medicationData);
    const saved = await medication.save();
    
    console.log('Medication saved:', saved);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({ 
      message: 'Error creating medication',
      error: error.message
    });
  }
});

router.get('/:id/status', auth, medicationController.getMedicationStatus);
router.patch('/:id/status', auth, medicationController.updateMedicationStatus);

module.exports = router;