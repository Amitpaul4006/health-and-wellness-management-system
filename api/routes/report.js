const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Medication = require('../models/Medication');
const { sendEmail } = require('../config/emailConfig');

router.post('/generate', auth, async (req, res) => {
  try {
    // Add request debugging
    console.log('Report generation started:', {
      userId: req?.user?.id,
      headers: req.headers.authorization ? 'Auth header present' : 'No auth header'
    });

    // Get user
    const user = await User.findById(req.user.id);
    if (!user?.email) {
      throw new Error('User email not found');
    }

    // Get medications with error handling
    const medications = await Medication.find({ userId: req.user.id });
    console.log(`Found ${medications.length} medications for user ${user.email}`);

    // Generate CSV safely
    const csvContent = 'Name,Description,Type,Scheduled Date,Status\n' +
      medications.map(med => [
        med.name || 'Unnamed',
        (med.description || '').replace(/,/g, ';'),
        med.type || 'unknown',
        med.scheduledDate ? new Date(med.scheduledDate).toISOString() : 'Not scheduled',
        med.status || 'unknown'
      ].join(',')).join('\n');

    // Send email with timeout handling
    const emailPromise = sendEmail(
      user.email,
      'Your Medication Report',
      `<h2>Medication Report</h2>
       <p>Hello ${user.username || user.email},</p>
       <p>Your medication report is attached.</p>
       <p>Total medications: ${medications.length}</p>`,
      csvContent
    );

    // Add timeout for serverless environment
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Report generation timed out')), 8000)
    );

    await Promise.race([emailPromise, timeoutPromise]);

    console.log('Report sent successfully to:', user.email);
    res.json({ 
      success: true, 
      count: medications.length,
      email: user.email
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate report' });
  }
});

module.exports = router;
