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
router.get('/', auth, medicationController.getMedications);
router.post('/add', auth, validateMedication, medicationController.addMedication);
router.get('/:id/status', auth, medicationController.getMedicationStatus);
router.patch('/:id/status', auth, medicationController.updateMedicationStatus);

module.exports = router;