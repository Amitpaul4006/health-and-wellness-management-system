const path = require('path');
const fs = require('fs');
const { sendEmail } = require('../config/emailConfig');

// Load production environment file
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env.production')
});

const checkProduction = async () => {
  // Environment file check
  const envPath = path.resolve(__dirname, '..', '.env.production');
  console.log('\n📂 Environment File Check:');
  console.log('-'.repeat(50));
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Production environment file not found:', envPath);
    process.exit(1);
  }

  // Group required variables by category
  const requiredVars = {
    email: ['EMAIL_USER', 'EMAIL_APP_PASSWORD', 'EMAIL_FROM'],
    auth: ['JWT_SECRET'],
    database: ['MONGODB_URI'],
    app: ['NODE_ENV', 'CLIENT_URL']
  };

  // Check variables by category
  let missingVars = [];
  
  console.log('\n🔍 Environment Variables Check:');
  console.log('-'.repeat(50));
  
  Object.entries(requiredVars).forEach(([category, vars]) => {
    console.log(`\n${category.toUpperCase()}:`);
    vars.forEach(varName => {
      const value = process.env[varName];
      if (!value) {
        missingVars.push(varName);
        console.log(`❌ ${varName}: Missing`);
      } else {
        const displayValue = varName.includes('PASSWORD') || 
                           varName.includes('SECRET') || 
                           varName.includes('URI')
          ? '[SECURED]'
          : value;
        console.log(`✅ ${varName}: ${displayValue}`);
      }
    });
  });

  // Test email if credentials exist
  if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
    console.log('\n📧 Testing Email Configuration:');
    console.log('-'.repeat(50));
    
    try {
      await sendEmail(
        process.env.EMAIL_USER,
        'Production Environment Test',
        `<h2>Production Configuration Test</h2>
         <p>Environment verification completed at: ${new Date().toISOString()}</p>`
      );
      console.log('✅ Email test successful');
    } catch (error) {
      console.error('❌ Email test failed:', error.message);
      process.exit(1);
    }
  }

  // Final status
  console.log('\n📊 Verification Summary:');
  console.log('-'.repeat(50));
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing ${missingVars.length} required variables:`, missingVars.join(', '));
    process.exit(1);
  } else {
    console.log('✅ All required variables are set');
    console.log('✅ Production environment verification complete');
  }
};

// Run checks
console.log('🚀 Starting production environment verification...');
checkProduction().catch(error => {
  console.error('\n❌ Verification failed:', error.message);
  process.exit(1);
});
