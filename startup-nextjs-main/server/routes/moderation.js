const express = require("express");
const {
  moderateText,
  moderateImage,
} = require("../controllers/moderationController");
const router = express.Router();

// POST /api/moderate-text
router.post("/moderate-text", moderateText);

// POST /api/moderate-image
router.post("/moderate-image", moderateImage);

module.exports = router;
