const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  let credential;

  // Option 1: Use individual environment variables (recommended for production)
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }
  // Option 2: Use service account key file (fallback for development)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
    const serviceAccount = require(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
    );
    credential = admin.credential.cert(serviceAccount);
  }
  // Option 3: Use default service account key file
  else {
    try {
      const serviceAccount = require("./serviceAccountKey.json");
      credential = admin.credential.cert(serviceAccount);
    } catch (error) {
      console.error("Firebase Admin initialization failed:", error.message);
      console.error(
        "Please set up Firebase environment variables or ensure serviceAccountKey.json exists",
      );
      process.exit(1);
    }
  }

  admin.initializeApp({
    credential: credential,
    storageBucket: "derrick-3157c.appspot.com", // Add storage bucket configuration
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { admin, db, bucket };
