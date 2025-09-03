const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Replace with your Google AI API Key
const API_KEY = "AIzaSyAPqJn0wK5q7dAf2AvyjCo7y38NTo61fi4";

// Chatbot API route
app.post("/api/chatbot", async (req, res) => {
  const { message } = req.body;

  try {
    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await apiResponse.json();

    // ✅ Extract text safely
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.error?.message ||
      "Sorry, I couldn't get a response.";

    res.json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ reply: "Something went wrong." });
  }
});

app.listen(3000, () =>
  console.log("✅ Gemini Chatbot API running on http://localhost:3000")
);
