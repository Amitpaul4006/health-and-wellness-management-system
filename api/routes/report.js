const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Medication = require('../models/Medication');
const { sendEmail } = require('../config/emailConfig');

router.post('/generate', async (req, res) => {
  try {
    // Get user
    const user = await User.findById(req.user.id);
    if (!user?.email) {
      return res.status(400).json({ error: 'User email not found' });
    }

    // Get medications with safer date handling
    const medications = await Medication.find({ userId: req.user.id });
    
    // Generate CSV with null checks
    const csvHeader = 'Name,Description,Type,Scheduled Date,Status\n';
    const csvRows = medications.map(med => {
      const scheduledDate = med.scheduledDate ? new Date(med.scheduledDate).toISOString() : 'Not scheduled';
      return [
        med.name || 'No name',
        (med.description || '').replace(/,/g, ';'), // Replace commas in description
        med.type || 'unknown',
        scheduledDate,
        med.status || 'unknown'
      ].join(',');
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;

    console.log('Generating report for:', {
      userId: req.user.id,
      email: user.email,
      medicationsCount: medications.length
    });

    // Send email with CSV
    await sendEmail(
      user.email,
      'Your Medication Report',
      `<h2>Medication Report</h2>
       <p>Please find your medication report attached.</p>
       <p>Total medications: ${medications.length}</p>
       <p>Generated on: ${new Date().toLocaleString()}</p>`,
      csvContent
    );

    res.json({ 
      message: 'Report generated and sent successfully',
      medicationsCount: medications.length
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate report',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
