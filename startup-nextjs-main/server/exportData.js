const express = require("express");
const router = express.Router();
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();
const { Parser } = require("json2csv"); // npm install json2csv

// Export property verification history as CSV
router.get("/export/verification-history", async (req, res) => {
  const snapshot = await db.collection("propertyVerificationHistory").get();
  const data = snapshot.docs.map((doc) => doc.data());
  const fields = ["propertyId", "action", "by", "timestamp", "comment"];
  const parser = new Parser({ fields });
  const csv = parser.parse(data);

  res.header("Content-Type", "text/csv");
  res.attachment("verification-history.csv");
  return res.send(csv);
});

// Add similar endpoints for properties, propertyDocuments, auditLogs, etc.

module.exports = router;
