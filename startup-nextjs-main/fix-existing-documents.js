// Script to fix existing documents with fake Firebase Storage URLs
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('./server/serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'derrick-3157c.appspot.com'
  });
}

const db = admin.firestore();

async function fixExistingDocuments() {
  console.log('🔧 Fixing existing documents with fake Firebase Storage URLs...');
  
  try {
    // Get all property documents
    const documentsRef = db.collection('propertyDocuments');
    const snapshot = await documentsRef.get();
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const fileUrl = data.fileUrl;
      
      // Check if this document has a fake Firebase Storage URL
      if (fileUrl && fileUrl.includes('firebasestorage.googleapis.com') && fileUrl.includes('your-project-id')) {
        console.log(`\n📄 Found document with fake URL: ${data.fileName}`);
        console.log(`   Document ID: ${data.documentId}`);
        console.log(`   Fake URL: ${fileUrl}`);
        
        // Update with a placeholder that indicates manual re-upload needed
        const updatedData = {
          fileUrl: 'NEEDS_REUPLOAD', // Special marker
          fixedAt: admin.firestore.FieldValue.serverTimestamp(),
          originalFakeUrl: fileUrl, // Keep record of original fake URL
          fixNote: 'Document needs to be re-uploaded due to Firebase Storage URL fix'
        };
        
        await doc.ref.update(updatedData);
        console.log(`   ✅ Marked for re-upload`);
        fixedCount++;
      } else if (fileUrl && fileUrl.startsWith('data:')) {
        console.log(`✅ Document already has valid base64 URL: ${data.fileName}`);
        skippedCount++;
      } else {
        console.log(`⚠️  Document has unknown URL format: ${data.fileName} - ${fileUrl}`);
        skippedCount++;
      }
    }
    
    console.log(`\n🎉 Fix completed!`);
    console.log(`   📊 Documents marked for re-upload: ${fixedCount}`);
    console.log(`   📊 Documents already valid: ${skippedCount}`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Go to admin panel and look for documents with "NEEDS_REUPLOAD"`);
    console.log(`   2. Ask users to re-upload those documents`);
    console.log(`   3. New uploads will work with "Read Document" button`);
    
  } catch (error) {
    console.error('❌ Error fixing documents:', error);
  }
}

// Run the fix
fixExistingDocuments();
