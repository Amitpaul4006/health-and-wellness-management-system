const Medication = require('../models/Medication');
const { sendEmail } = require('../config/emailConfig');

const generateReport = async (userId, userEmail) => {
  console.log(`Starting report generation for user: ${userId}`);
  try {
    const medications = await Medication.find({ user: userId });
    
    if (!medications.length) {
      console.log('No medications found');
      return { success: false, message: 'No medications to report' };
    }

    const csvContent = generateCSVContent(medications);
    console.log(`Generated CSV with ${medications.length} records`);

    await sendEmail({
      to: userEmail,
      subject: 'Your Medication Report',
      html: `<h2>Your Medication Report</h2><p>Attached is your report with ${medications.length} medications.</p>`,
      attachments: [{
        filename: `medications-${new Date().toISOString().split('T')[0]}.csv`,
        content: csvContent,
        contentType: 'text/csv'
      }]
    });

    return { success: true, message: 'Report sent successfully' };
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
