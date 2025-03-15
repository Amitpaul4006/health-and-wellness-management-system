const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Medication = require('../models/Medication');
const { sendEmail } = require('../config/emailConfig');

router.post('/generate', async (req, res) => {
  try {
    // Ensure req.user exists
    if (!req.user || !req.user.id) {
      console.error('No user in request:', req.user);
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user details
    const user = await User.findById(req.user.id);
    if (!user || !user.email) {
      console.error('User not found or no email:', req.user.id);
      return res.status(404).json({ error: 'User email not found' });
    }

    // Get medications with error handling
    const medications = await Medication.find({ userId: req.user.id });
    console.log(`Found ${medications.length} medications for user ${req.user.id}`);

    // Generate CSV with safe checks
    const csvHeader = 'Name,Description,Type,Scheduled Date,Status\n';
    const csvRows = medications.map(med => {
      const scheduledDate = med.scheduledDate ? new Date(med.scheduledDate).toISOString() : 'Not scheduled';
      return [
        med.name || 'No name',
        (med.description || '').replace(/,/g, ';'),
        med.type || 'unknown',
        scheduledDate,
        med.status || 'unknown'
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Send email with report
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
    res.status(500).json({ error: error.message || 'Failed to generate report' });
  }
});

module.exports = router;
