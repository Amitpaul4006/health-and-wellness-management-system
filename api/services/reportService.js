const Medication = require('../models/Medication');
const { sendEmail } = require('../config/emailConfig');

const generateReport = async (userId, userEmail) => {
  try {
    console.log(`Starting report generation for user: ${userId}`);
    const medications = await Medication.find({ user: userId });
    
    if (!medications.length) {
      return { success: false, message: 'No medications found' };
    }

    const csvContent = generateCSVContent(medications);

    await sendEmail({
      to: userEmail,
      subject: 'Your Medication Report',
      html: `<h2>Medication Report</h2><p>Your report is attached.</p>`,
      attachments: [{
        filename: `medications-${new Date().toISOString().split('T')[0]}.csv`,
        content: csvContent,
        contentType: 'text/csv'
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

module.exports = { generateReport };
