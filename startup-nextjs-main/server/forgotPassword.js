const express = require("express");
const router = express.Router();
const { admin } = require("./firebaseAdmin"); // Correct import
const nodemailer = require("nodemailer");
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

// --- Helper: Generate 6-digit code ---
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- Helper: Send email using Nodemailer ---
async function sendEmail(to, code) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "derrickyap1230@gmail.com",
      pass: "szmo elhw ipsa jjds", // Use your 16-char App Password
    },
  });

  await transporter.sendMail({
    from: '"Your App" <derrickyap1230@gmail.com>',
    to,
    subject: "Your Password Reset Code",
    text: `Your password reset code is: ${code}`,
  });
}

// --- 1. Send Code ---
router.post("/forgot-password", async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  console.log("Looking up user:", email);

  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const user = await admin.auth().getUserByEmail(email);
    console.log("User found:", user.email);
  } catch (err) {
    console.error("Error from getUserByEmail:", err);
    return res.status(404).json({ error: "No user with that email" });
  }

  const code = generateCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store code in Firestore
  await db.collection("passwordResetCodes").doc(email).set({
    code,
    expiresAt,
  });

  try {
    await sendEmail(email, code);
    res.json({ message: "Code sent" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "Failed to send code." });
  }
});

// --- 2. Verify Code ---
router.post("/verify-reset-code", async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const code = req.body.code;
  console.log("Verifying code for:", email, "code:", code);

  const doc = await db.collection("passwordResetCodes").doc(email).get();
  if (!doc.exists) {
    console.log("No code found for email");
    return res.status(400).json({ error: "No code found" });
  }

  const data = doc.data();
  console.log(
    "Stored code:",
    data.code,
    "Expires at:",
    data.expiresAt,
    "Now:",
    Date.now(),
  );
  if (data.code !== code) {
    console.log("Code mismatch");
    return res.status(400).json({ error: "Invalid code" });
  }
  if (Date.now() > data.expiresAt) {
    console.log("Code expired");
    return res.status(400).json({ error: "Code expired" });
  }

  res.json({ message: "Code verified" });
});

// --- 3. Reset Password ---
router.post("/reset-password", async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;
  if (!email || !password)
    return res.status(400).json({ error: "Missing data" });

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password });
    await db.collection("passwordResetCodes").doc(email).delete();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

module.exports = router;
