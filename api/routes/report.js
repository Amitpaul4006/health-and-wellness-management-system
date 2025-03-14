const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Medication = require('../models/Medication');
const { sendEmail } = require('../config/emailConfig');

router.post('/generate', async (req, res) => {
  try {
    // Get user first to ensure we have email
    const user = await User.findById(req.user.id);
    if (!user || !user.email) {
      return res.status(400).json({ error: 'User email not found' });
    }

    // Get medications
    const medications = await Medication.find({ userId: req.user.id });
    
    // Generate CSV
    const csvHeader = 'Name,Description,Type,Scheduled Date,Status\n';
    const csvRows = medications.map(med => 
      `${med.name},${med.description || ''},${med.type},${med.scheduledDate.toISOString()},${med.status}`
    ).join('\n');
    
    const csvContent = csvHeader + csvRows;

    // Send email with CSV
    await sendEmail(
      user.email,
      'Your Medication Report',
      `<h2>Medication Report</h2>
       <p>Please find your medication report attached.</p>
       <p>Generated on: ${new Date().toLocaleString()}</p>`,
      csvContent
    );

    res.json({ message: 'Report generated and sent successfully' });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate report' });
  }
});

module.exports = router;
