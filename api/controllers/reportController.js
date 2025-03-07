const { Queue } = require('bullmq');
const Medication = require('../models/Medication');

const generateReport = async (req, res) => {
  try {
    console.log('POST /generate endpoint hit');
    console.log('User ID:', req.user.id);

    const medications = await Medication.find({ userId: req.user.id });
    
    // Generate CSV content
    const headers = ['name', 'description', 'type', 'scheduledDate', 'time', 'status'];
    const rows = medications.map(med => [
      med.name,
      med.description,
      med.type,
      med.scheduledDate,
      med.schedule?.time || '',
      med.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
    ].join('\n');

    // Create job with properly formatted attachment data
    const queue = new Queue('reportQueue', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379
      }
    });

    await queue.add('report', {
      email: req.user.email,
      csvData: csvContent
    });

    res.status(200).json({ message: 'Report generation started' });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

module.exports = {
  generateReport
};
