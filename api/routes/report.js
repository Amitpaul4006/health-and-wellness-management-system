const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Medication = require('../models/Medication');
const { sendEmail } = require('../config/emailConfig');

router.post('/generate', async (req, res) => {
  try {
    console.log('Report generation request:', req.user);

    // Get user with error handling
    const user = await User.findById(req.user.id).select('email username');
    if (!user?.email) {
      console.error('User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    // Get medications safely
    const medications = await Medication.find({ userId: req.user.id });

    // Generate CSV with error checking
    const csvData = medications.map(med => ({
      name: med.name || 'Unnamed',
      description: (med.description || '').replace(/,/g, ';'),
      type: med.type || 'unknown',
      scheduledDate: med.scheduledDate ? new Date(med.scheduledDate).toISOString() : 'Not scheduled',
      status: med.status || 'unknown'
    }));

    const csvContent = 
      'Name,Description,Type,Scheduled Date,Status\n' +
      csvData.map(row => Object.values(row).join(',')).join('\n');

    // Send report
    await sendEmail(
      user.email,
      'Your Medication Report',
      `<h2>Medication Report</h2>
       <p>Hello ${user.username || user.email},</p>
       <p>Your medication report is attached.</p>
       <p>Total medications: ${medications.length}</p>`,
      csvContent
    );

    res.json({ success: true, count: medications.length });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
