const express = require("express");
const cors = require("cors");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(cors());
app.use(express.json());

// POST /api/chat — general study chat
app.post("/api/chat", async (req, res) => {
  const { messages, apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: "API key required" });

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: `You are an expert Study Assistant. Help students understand concepts, solve problems, create study plans, summarize topics, quiz them, and explain things clearly. 
Format your responses with markdown when helpful. Be encouraging and precise.`,
      messages,
    });
    res.json({ content: response.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quiz — generate quiz from topic
app.post("/api/quiz", async (req, res) => {
  const { topic, numQuestions = 5, apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: "API key required" });

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: `You are a quiz generator. Always respond with ONLY valid JSON, no markdown, no preamble.`,
      messages: [
        {
          role: "user",
          content: `Generate ${numQuestions} multiple choice quiz questions about: "${topic}".
Return ONLY this JSON structure:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "A",
      "explanation": "..."
    }
  ]
}`,
        },
      ],
    });

    const text = response.content[0].text.replace(/```json|```/g, "").trim();
    const quiz = JSON.parse(text);
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/summarize — summarize text/topic
app.post("/api/summarize", async (req, res) => {
  const { text, style = "concise", apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: "API key required" });

  const client = new Anthropic({ apiKey });

  const stylePrompts = {
    concise: "Summarize in 3-5 bullet points.",
    detailed: "Provide a detailed summary with key concepts, examples, and takeaways.",
    "eli5": "Explain this like I'm 5 years old — simple language, fun analogies.",
    "study-notes": "Create structured study notes with headings, key terms bolded, and a quick-review section.",
  };

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `${stylePrompts[style] || stylePrompts.concise}\n\nContent:\n${text}`,
        },
      ],
    });
    res.json({ summary: response.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/flashcards — generate flashcards
app.post("/api/flashcards", async (req, res) => {
  const { topic, count = 8, apiKey } = req.body;
  if (!apiKey) return res.status(400).json({ error: "API key required" });

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: "You are a flashcard generator. Always respond with ONLY valid JSON.",
      messages: [
        {
          role: "user",
          content: `Generate ${count} flashcards for: "${topic}". Return ONLY:
{
  "topic": "${topic}",
  "cards": [
    { "id": 1, "front": "Question or term", "back": "Answer or definition" }
  ]
}`,
        },
      ],
    });

    const text = response.content[0].text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(text);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Study Assistant backend running on port ${PORT}`));
