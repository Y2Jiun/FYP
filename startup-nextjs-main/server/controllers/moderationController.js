const Filter = require("bad-words");
const filter = new Filter();

// Add Malaysian bad words to the filter
const malaysianBadWords = [
  "babi",
  "anjing",
  "bangsat",
  "celaka",
  "sial",
  "bodoh",
  "gila",
  "tolol",
  "bitch",
  "fuck",
  "shit",
  "ass",
  "dick",
  "pussy",
  "cock",
  "cunt",
];

// Add custom words to the filter
filter.addWords(...malaysianBadWords);

// Text moderation controller
exports.moderateText = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ flagged: true, reason: "No text provided" });
  }

  try {
    // Check for profanity using the bad-words filter
    if (filter.isProfane(text)) {
      return res.json({
        flagged: true,
        reason:
          "Inappropriate language detected. Please use respectful language.",
      });
    }

    // Additional checks for common variations
    const lowerText = text.toLowerCase();
    const hasProfanity = malaysianBadWords.some((word) =>
      lowerText.includes(word.toLowerCase()),
    );

    if (hasProfanity) {
      return res.json({
        flagged: true,
        reason:
          "Inappropriate language detected. Please use respectful language.",
      });
    }

    return res.json({ flagged: false });
  } catch (error) {
    console.error("Moderation error:", error);
    return res.status(500).json({
      flagged: true,
      reason: "Moderation service error",
    });
  }
};

// Image moderation controller
exports.moderateImage = async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({
      flagged: true,
      reason: "No image URL provided",
    });
  }

  try {
    // Basic image moderation checks
    // You can integrate with Google Vision API or other services for advanced moderation

    // Check if image URL is valid
    if (!imageUrl.startsWith("http")) {
      return res.json({
        flagged: true,
        reason: "Invalid image URL",
      });
    }

    // For now, we'll do basic checks
    // In a production environment, you should use:
    // - Google Vision API for content detection
    // - AWS Rekognition for image moderation
    // - Or other AI-powered image moderation services

    // Example integration with Google Vision API (commented out):
    /*
    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();
    
    const [result] = await client.safeSearchDetection(imageUrl);
    const detections = result.safeSearchAnnotation;
    
    if (detections.adult === 'LIKELY' || detections.adult === 'VERY_LIKELY' ||
        detections.violence === 'LIKELY' || detections.violence === 'VERY_LIKELY' ||
        detections.racy === 'LIKELY' || detections.racy === 'VERY_LIKELY') {
      return res.json({
        flagged: true,
        reason: "Inappropriate image content detected",
      });
    }
    */

    // For now, return not flagged (you can implement proper image moderation later)
    res.json({ flagged: false });
  } catch (err) {
    console.error("Image moderation error:", err);
    res.status(500).json({
      flagged: true,
      reason: "Image moderation error",
    });
  }
};
