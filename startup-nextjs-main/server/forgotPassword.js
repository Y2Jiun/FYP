const express = require("express");
const router = express.Router();
const admin = require("./firebaseAdmin"); // Your Firebase Admin SDK setup
const nodemailer = require("nodemailer"); // Or your email service
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

// --- Helper: Generate 6-digit code ---
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- Helper: Send email (replace with your email logic) ---
async function sendEmail(to, code) {
  // Use your email service here (Nodemailer, SendGrid, etc.)
  // Example with Nodemailer:
  /*
  const transporter = nodemailer.createTransport({ ... });
  await transporter.sendMail({
    from: '"Your App" <noreply@yourapp.com>',
    to,
    subject: "Your Password Reset Code",
    text: `Your password reset code is: ${code}`,
  });
  */
  console.log(`Pretend sending code ${code} to ${to}`);
}

// --- 1. Send Code ---
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  // Check if user exists
  try {
    await admin.auth().getUserByEmail(email);
  } catch {
    return res.status(404).json({ error: "No user with that email" });
  }

  const code = generateCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store code in Firestore
  await db.collection("passwordResetCodes").doc(email).set({
    code,
    expiresAt,
  });

  await sendEmail(email, code);

  res.json({ message: "Code sent" });
});

// --- 2. Verify Code ---
router.post("/verify-reset-code", async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: "Missing data" });

  const doc = await db.collection("passwordResetCodes").doc(email).get();
  if (!doc.exists) return res.status(400).json({ error: "No code found" });

  const data = doc.data();
  if (data.code !== code)
    return res.status(400).json({ error: "Invalid code" });
  if (Date.now() > data.expiresAt)
    return res.status(400).json({ error: "Code expired" });

  res.json({ message: "Code verified" });
});

// --- 3. Reset Password ---
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing data" });

  // Update password in Firebase Auth
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password });
    // Delete the code after successful reset
    await db.collection("passwordResetCodes").doc(email).delete();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

module.exports = router;
