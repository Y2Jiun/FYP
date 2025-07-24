const fetch = require("node-fetch");

exports.chatbot = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral", // or "gemma3", etc. if you want to switch models
        prompt: message,
        stream: false,
      }),
    });

    const data = await response.json();
    // The answer is in data.response
    const answer = data.response || "Sorry, I could not get an answer.";
    res.json({ answer });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "Chatbot error", details: err.message });
  }
};
