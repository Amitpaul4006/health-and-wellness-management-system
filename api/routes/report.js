const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const User = require('../models/User');
const { sendEmail } = require('../config/emailConfig');

router.post('/generate', async (req, res) => {
  try {
    console.log('Report generation started:', req.user.id);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new Error('User not found');
    }

    const medications = await Medication.find({ userId: req.user.id });
    console.log('Found medications:', medications.length);

    // Safer date formatting
    const formatDate = (date) => {
      try {
        const d = new Date(date);
        return {
          date: d.toISOString().split('T')[0],
          time: d.toTimeString().split(' ')[0]
        };
      } catch (error) {
        console.error('Date formatting error:', error);
        return { date: 'Invalid date', time: 'Invalid time' };
      }
    };

    // Generate CSV with error handling
    const csvHeader = 'Name,Description,Type,Date,Time,Status\n';
    const csvRows = medications.map(med => {
      const { date, time } = formatDate(med.scheduledDate);
      return [
        med.name || '',
        med.description || '',
        med.type || '',
        date,
        time,
        med.status || 'pending'
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    console.log('CSV generated:', csvContent.substring(0, 100) + '...');

    // Send email
    await sendEmail(
      user.email,
      'Your Medication Report',
      `<h2>Medication Report</h2>
       <p>Please find your medication report attached.</p>
       <p>Generated on: ${new Date().toLocaleString()}</p>`,
      csvContent
    );

    console.log('Report email sent to:', user.email);
    res.json({ message: 'Report generated and sent successfully' });

  } catch (error) {
    console.error('Report generation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
