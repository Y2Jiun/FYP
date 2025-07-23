const fetch = require("node-fetch");

const HF_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const HF_MODEL = "HuggingFaceH4/zephyr-7b-beta";

exports.chatbot = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: message }),
      },
    );
    const data = await response.json();
    // Zephyr returns an array of objects with 'generated_text' or a string
    let answer = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      answer = data[0].generated_text;
    } else if (typeof data.generated_text === "string") {
      answer = data.generated_text;
    } else if (typeof data === "string") {
      answer = data;
    } else {
      answer = "Sorry, I could not get an answer.";
    }
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: "Chatbot error", details: err.message });
  }
};
