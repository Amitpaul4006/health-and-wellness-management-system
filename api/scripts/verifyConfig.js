const path = require('path');
const fs = require('fs');

// Determine the correct env file path
const envPath = path.resolve(__dirname, '..', process.env.NODE_ENV === 'production' ? '.env.production' : '.env');

// Load and validate environment file
if (!fs.existsSync(envPath)) {
  console.error(`Environment file not found: ${envPath}`);
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Print debug info
console.log('Environment Setup:', {
  envPath,
  exists: fs.existsSync(envPath),
  dirname: __dirname,
  env: process.env.NODE_ENV
});

const { sendEmail } = require('../config/emailConfig');

const verifyConfig = async () => {
  // Print the actual environment values for debugging
  console.log('Current environment:', {
    NODE_ENV: process.env.NODE_ENV,
    CONFIG_PATH: envPath,
    EMAIL_USER: process.env.EMAIL_USER || 'Not set',
    EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD ? 'Set (hidden)' : 'Not set',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set (hidden)' : 'Not set',
    MONGODB_URI: process.env.MONGODB_URI ? 'Set (hidden)' : 'Not set'
  });

  // 1. Check if environment variables are set
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
    EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Missing',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing',
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Missing'
  };

  console.log('Environment Check:', envCheck);

  // 2. Test email functionality
  try {
    console.log('Testing email configuration...');
    await sendEmail(
      process.env.EMAIL_USER, // Send to yourself
      'Configuration Test',
      `<h2>Configuration Test</h2>
       <p>This email confirms:</p>
       <ul>
         <li>Email configuration is correct</li>
         <li>SMTP connection works</li>
         <li>Authentication is successful</li>
       </ul>
       <p>Timestamp: ${new Date().toISOString()}</p>`
    );
    console.log('✅ Email test successful');
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    process.exit(1);
  }
};

// Run verification
console.log('Starting configuration verification...');
verifyConfig().then(() => {
  console.log('Configuration verification complete');
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});