const express = require("express");
const { db } = require("./firebaseAdmin");
const router = express.Router();

// GET /notifications?role=user|agent|all
router.get("/notifications", async (req, res) => {
  const { role } = req.query; // role: 'user', 'agent', or 'all'
  let audienceNum = 3; // default to all
  if (role === "user") audienceNum = 1;
  if (role === "agent") audienceNum = 2;

  try {
    const notifRef = db.collection("notification");
    // Fetch notifications for 'all' and for the specific role
    const snapshot = await notifRef
      .where("audience", "in", [3, audienceNum])
      .orderBy("createdAt", "desc")
      .get();

    const notifications = [];
    snapshot.forEach((doc) => notifications.push(doc.data()));
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

module.exports = router;
