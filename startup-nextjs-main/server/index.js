const express = require("express");
const cors = require("cors");
const { db } = require("./firebaseAdmin");

const app = express();
app.use(cors());
app.use(express.json());

// Add this for notification API
const notificationRoutes = require("./notification");
app.use("/api", notificationRoutes);

// Add property verification API
const propertyVerificationRoutes = require("./propertyVerification");
app.use("/api/property-verification", propertyVerificationRoutes);

// 🔐 POST /login → check email & return role
app.post("/login", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }

    let userData;
    let userId;
    snapshot.forEach((doc) => {
      userData = doc.data();
      userId = doc.id;
      // break after first (emails should be unique)
      return;
    });

    return res.json({
      userId, // Firestore document ID, e.g., "UID1"
      role: userData.roles,
      username: userData.username,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// 📝 POST /signup → create user in Firebase Auth & Firestore
app.post("/signup", async (req, res) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ error: "Email, password, and username are required" });
  }
  try {
    // Create user in Firebase Auth
    const userRecord = await require("./firebaseAdmin")
      .admin.auth()
      .createUser({
        email,
        password,
        displayName: username,
      });

    // Get and increment the user counter
    const counterRef = db.collection("counters").doc("users");
    const counterDoc = await counterRef.get();
    let nextId = 1;
    if (counterDoc.exists) {
      nextId = counterDoc.data().lastId + 1;
    }
    await counterRef.set({ lastId: nextId });

    const customUserId = `UID${nextId}`;

    // Store user info in Firestore with custom ID
    await db.collection("users").doc(customUserId).set({
      email,
      username,
      roles: 3,
      userID: customUserId,
      firebaseUID: userRecord.uid,
      profilePic: "",
      contact: "",
      createdDate: new Date(),
      modifyTime: new Date(),
      agentRequest: 0, // Add this field as a number
    });

    return res.json({ message: "Signup successful", userID: customUserId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Signup failed" });
  }
});

const forgotPasswordRoutes = require("./forgotPassword");
app.use("/api", forgotPasswordRoutes);

const exportDataRoutes = require("./exportData");
app.use("/api", exportDataRoutes);

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`),
);
