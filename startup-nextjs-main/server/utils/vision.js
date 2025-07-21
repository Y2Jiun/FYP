const { ImageAnnotatorClient } = require("@google-cloud/vision");

const client = new ImageAnnotatorClient(); // Make sure GOOGLE_APPLICATION_CREDENTIALS is set

exports.visionModerateImage = async (imageUrl) => {
  const [result] = await client.safeSearchDetection(imageUrl);
  const safe = result.safeSearchAnnotation;
  // You can adjust thresholds as needed
  const flagged =
    safe.adult === "LIKELY" ||
    safe.adult === "VERY_LIKELY" ||
    safe.violence === "LIKELY" ||
    safe.violence === "VERY_LIKELY" ||
    safe.racy === "LIKELY" ||
    safe.racy === "VERY_LIKELY";
  let reason = "";
  if (flagged) {
    if (safe.adult === "LIKELY" || safe.adult === "VERY_LIKELY")
      reason = "adult";
    else if (safe.violence === "LIKELY" || safe.violence === "VERY_LIKELY")
      reason = "violence";
    else if (safe.racy === "LIKELY" || safe.racy === "VERY_LIKELY")
      reason = "racy";
  }
  return { flagged, reason };
};
