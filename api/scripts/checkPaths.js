const fs = require('fs');
const path = require('path');

// Load environment variables first
require('dotenv').config({
  path: path.resolve(__dirname, '..', process.env.NODE_ENV === 'production' ? '.env.production' : '.env')
});

const checkPaths = () => {
  // Define important paths
  const paths = {
    currentDir: __dirname,
    apiRoot: path.resolve(__dirname, '..'),
    projectRoot: path.resolve(__dirname, '..', '..'),
    envFiles: {
      development: path.resolve(__dirname, '..', '.env'),
      production: path.resolve(__dirname, '..', '.env.production')
    }
  };

  // Check directories
  console.log('\n🗂️ Directory Structure:');
  console.log('-'.repeat(50));
  Object.entries({
    'Current Directory': paths.currentDir,
    'API Root': paths.apiRoot,
    'Project Root': paths.projectRoot
  }).forEach(([name, dir]) => {
    console.log(`${name}:`, dir);
    try {
      console.log('Contains:', fs.readdirSync(dir).join(', '));
    } catch (error) {
      console.log('Error reading directory:', error.message);
    }
  });

  // Check environment files
  console.log('\n📁 Environment Files:');
  console.log('-'.repeat(50));
  Object.entries(paths.envFiles).forEach(([env, filepath]) => {
    try {
      const exists = fs.existsSync(filepath);
      const stats = exists ? fs.statSync(filepath) : null;
      const content = exists ? fs.readFileSync(filepath, 'utf8') : null;
      const lines = content ? content.split('\n').length : 0;
      
      console.log(`${env}:`, {
        path: filepath,
        exists,
        size: exists ? `${stats.size} bytes` : 'N/A',
        lines: exists ? `${lines} lines` : 'N/A',
        readable: exists ? (stats.mode & fs.constants.R_OK) !== 0 : 'N/A',
        permissions: exists ? stats.mode.toString(8).slice(-3) : 'N/A'
      });
    } catch (error) {
      console.error(`Error checking ${env} file:`, error.message);
    }
  });

  // Check environment variables
  console.log('\n🔑 Environment Variables:');
  console.log('-'.repeat(50));
  [
    'NODE_ENV',
    'EMAIL_USER',
    'EMAIL_APP_PASSWORD',
    'EMAIL_FROM',
    'JWT_SECRET',
    'MONGODB_URI',
    'CLIENT_URL'
  ].forEach(varName => {
    const value = process.env[varName];
    console.log(`${varName}:`, value ? (
      varName.includes('PASSWORD') || varName.includes('SECRET') || varName.includes('URI')
        ? '[SET]'
        : value
    ) : '[NOT SET]');
  });
};

// Run the check
console.log('\n🔍 Starting environment verification...');
checkPaths();
