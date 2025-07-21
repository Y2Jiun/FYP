const Filter = require("bad-words");
const filter = new Filter();

// Text moderation controller
exports.moderateText = async (req, res) => {
  const { text } = req.body;
  if (!text)
    return res.status(400).json({ flagged: true, reason: "No text provided" });

  // Dynamically import bad-words
  const Filter = (await import("bad-words")).default;
  const filter = new Filter();

  if (filter.isProfane(text)) {
    return res.json({ flagged: true, reason: "Profanity detected" });
  }
  return res.json({ flagged: false });
};

// Image moderation controller
exports.moderateImage = async (req, res) => {
  const { imageUrl } = req.body;
  if (!imageUrl)
    return res
      .status(400)
      .json({ flagged: true, reason: "No image URL provided" });
  try {
    const result = await visionModerateImage(imageUrl);
    res.json(result);
  } catch (err) {
    res.status(500).json({ flagged: true, reason: "Moderation error" });
  }
};
