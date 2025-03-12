const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Medication = require('../models/Medication');
const User = require('../models/User');
const { sendEmail } = require('../config/emailConfig');

router.post('/generate', auth, async (req, res) => {
  try {
    console.log('Generating report for user:', req.user.id);

    // Get user details
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Get medications
    const medications = await Medication.find({ userId: req.user.id });
    
    // Generate CSV
    const csvHeader = 'name,description,type,scheduledDate,time,status\n';
    const csvRows = medications.map(med => {
      const date = new Date(med.scheduledDate);
      return `${med.name},${med.description || ''},${med.type},${date.toISOString()},${date.toTimeString().split(' ')[0]},${med.status}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;

    // Send email
    await sendEmail(
      user.email,
      'Your Medication Report',
      '<h2>Your Medication Report</h2><p>Please find your medication report attached.</p>',
      csvContent
    );

    console.log('Report sent successfully to:', user.email);
    res.json({ message: 'Report generated and sent successfully' });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate report' });
  }
});

module.exports = router;
