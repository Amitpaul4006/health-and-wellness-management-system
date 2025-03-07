const express = require('express');
const router = express.Router();
const { generateWeeklyReport } = require('../services/reportService');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate', authMiddleware, async (req, res) => {
  console.log('POST /generate endpoint hit');
  try {
    const userId = req.user.id;
    console.log('User ID:', userId);
    await generateWeeklyReport(userId);
    res.status(200).json({ message: 'Report generation initiated' });
  } catch (error) {
    console.error('Error in /generate endpoint:', error);
    res.status(500).json({ error: 'Failed to initiate report generation' });
  }
});

module.exports = router;
