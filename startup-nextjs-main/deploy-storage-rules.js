// Script to deploy Firebase Storage rules
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Storage Rules Deployment Script');
console.log('==========================================');

// Check if Firebase CLI is installed
exec('firebase --version', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Firebase CLI is not installed or not in PATH');
    console.log('📦 Please install Firebase CLI first:');
    console.log('   npm install -g firebase-tools');
    console.log('   firebase login');
    return;
  }
  
  console.log('✅ Firebase CLI found:', stdout.trim());
  
  // Check if storage.rules exists
  const rulesPath = path.join(__dirname, 'storage.rules');
  if (!fs.existsSync(rulesPath)) {
    console.error('❌ storage.rules file not found');
    return;
  }
  
  console.log('✅ storage.rules file found');
  console.log('📋 Rules content:');
  console.log(fs.readFileSync(rulesPath, 'utf8'));
  
  // Deploy storage rules
  console.log('🚀 Deploying storage rules...');
  exec('firebase deploy --only storage', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Failed to deploy storage rules:', error.message);
      console.log('🔧 Manual steps:');
      console.log('1. Run: firebase login');
      console.log('2. Run: firebase use derrick-3157c');
      console.log('3. Run: firebase deploy --only storage');
      console.log('');
      console.log('🌐 Or deploy manually via Firebase Console:');
      console.log('1. Go to: https://console.firebase.google.com/project/derrick-3157c/storage/rules');
      console.log('2. Copy the rules from storage.rules file');
      console.log('3. Paste and publish');
      return;
    }
    
    console.log('✅ Storage rules deployed successfully!');
    console.log(stdout);
    
    if (stderr) {
      console.log('⚠️  Warnings:', stderr);
    }
  });
});
