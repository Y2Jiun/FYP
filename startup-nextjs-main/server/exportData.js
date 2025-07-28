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

// Export property verification history as JSON (detailed)
router.get("/export/verification-history-json", async (req, res) => {
  try {
    const snapshot = await db.collection("propertyVerificationHistory").get();
    const data = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const d = doc.data();
        // Try to get property title if possible
        let propertyTitle = "-";
        if (d.propertyId) {
          const propDoc = await db.collection("properties").doc(d.propertyId).get();
          if (propDoc.exists) {
            propertyTitle = propDoc.data().title || "-";
          }
        }
        return {
          propertyId: d.propertyId || "-",
          propertyTitle,
          action: d.action || "-",
          category: d.details?.category || "-",
          newStatus: d.details?.newStatus || d.details?.eventType || "-",
          previousStatus: d.details?.previousStatus || "-",
          notes: d.details?.notes || "-",
          documentName: d.details?.documentName || "-",
          documentUrl: d.details?.documentUrl || "-",
          performedBy: d.details?.performedBy || d.performedBy || "-",
          performedByName: d.details?.performedByName || d.performedByName || "-",
          userRole: d.userRole || "-",
          performedAt: d.details?.performedAt || d.performedAt || "-",
        };
      })
    );
    res.json(data);
  } catch (err) {
    console.error("Failed to export verification history as JSON:", err);
    res.status(500).json({ error: "Failed to export verification history as JSON" });
  }
});

// Add similar endpoints for properties, propertyDocuments, auditLogs, etc.

module.exports = router;
