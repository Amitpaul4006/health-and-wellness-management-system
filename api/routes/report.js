const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Medication = require('../models/Medication');
const { sendEmail } = require('../config/emailConfig');

router.post('/generate', auth, async (req, res) => {
  try {
    console.log('Report generation started:', {
      userId: req.user?.id,
      userEmail: req.user?.email
    });

    if (!req.user?.email) {
      throw new Error('User email not available');
    }

    // Get medications
    const medications = await Medication.find({ userId: req.user.id });
    
    // Prepare email data
    const emailData = {
      to: req.user.email,
      subject: 'Your Medication Report',
      html: `<h2>Medication Report</h2>
             <p>Hello ${req.user.username || req.user.email},</p>
             <p>Your medication report is attached.</p>
             <p>Total medications: ${medications.length}</p>`,
      attachments: [{
        filename: `medication-report-${new Date().toISOString().split('T')[0]}.csv`,
        content: [
          'Name,Description,Type,Scheduled Date,Status',
          ...medications.map(med => [
            med.name || 'Unnamed',
            (med.description || '').replace(/,/g, ';'),
            med.type || 'unknown',
            med.scheduledDate ? new Date(med.scheduledDate).toISOString() : 'Not scheduled',
            med.status || 'unknown'
          ].join(','))
        ].join('\n'),
        contentType: 'text/csv'
      }]
    };

    // Send email
    await sendEmail(emailData);

    res.json({
      success: true,
      message: 'Report sent successfully',
      recipient: req.user.email
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
