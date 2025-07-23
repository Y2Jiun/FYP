const express = require("express");
const { chatbot } = require("../controllers/chatbotController");
const router = express.Router();

// POST /api/chatbot
router.post("/chatbot", chatbot);

module.exports = router;
