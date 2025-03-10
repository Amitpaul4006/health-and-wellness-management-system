const { sendEmail } = require('../config/emailConfig');
const Medication = require('../models/Medication');
const User = require('../models/User');

const generateReport = async (userId, userEmail) => {
  try {
    // Get medications
    const medications = await Medication.find({ user: userId });
    
    // Generate CSV content
    const csvHeader = 'Name,Description,Type,Status,Date,Time\n';
    const csvRows = medications.map(med => 
      `${med.name},${med.description || ''},${med.type},${med.status},${med.date},${med.time}`
    ).join('\n');
    const csvContent = csvHeader + csvRows;

    // Send email directly without queue in serverless
    await sendEmail({
      to: userEmail,
      subject: 'Medication Report',
      html: '<h2>Your Medication Report</h2><p>Please find your medication report attached.</p>',
      attachments: [{
        filename: 'medications.csv',
        content: csvContent,
        contentType: 'text/csv'
      }]
    });

    return { success: true, message: 'Report sent successfully' };
  } catch (error) {
    console.error('Report generation error:', error);
    throw error;
  }
};

module.exports = { generateReport };
