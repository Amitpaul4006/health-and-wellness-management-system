const { Queue } = require('bullmq');
const Medication = require('../models/Medication');
const User = require('../models/User');
const { generateCSV } = require('../utils/csvGenerator');
const { sendEmail } = require('../config/emailConfig');

const reportQueue = new Queue('reportQueue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

const generateWeeklyReport = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const medications = await Medication.find({
    userId,
    scheduledDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  const csvData = generateCSV(medications);

  await reportQueue.add('sendReport', {
    email: user.email,
    csvData
  });
};

const generateReport = async (userId, userEmail) => {
  try {
    console.log(`Generating report for user ${userId}`);
    const medications = await Medication.find({ user: userId });
    
    // Generate CSV
    const csvData = generateCSVContent(medications);
    
    // Send email in both environments
    await sendEmail({
      to: userEmail,
      subject: 'Your Medication Report',
      html: '<h2>Medication Report</h2><p>Please find your medication report attached.</p>',
      attachments: [{
        filename: 'medications.csv',
        content: csvData
      }]
    });

    return { success: true };
  } catch (error) {
    console.error('Report generation failed:', error);
    throw error;
  }
};

const generateCSVContent = (medications) => {
  const header = 'Name,Description,Type,Status,Date,Time\n';
  const rows = medications.map(med => 
    `${med.name},${med.description || ''},${med.type},${med.status},${med.date},${med.time}`
  ).join('\n');
  return header + rows;
};

module.exports = {
  generateWeeklyReport,
  generateReport
};
