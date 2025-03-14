require('dotenv').config();
const { sendEmail } = require('../config/emailConfig');

const testReport = async () => {
  try {
    const csvContent = 'Name,Description,Type,Date\nTest Med,Test Description,one-time,2024-03-14';
    
    await sendEmail(
      process.env.EMAIL_USER,
      'Test Report',
      '<h2>Test Report</h2><p>This is a test report email.</p>',
      csvContent
    );
    
    console.log('Test report sent successfully');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testReport();
