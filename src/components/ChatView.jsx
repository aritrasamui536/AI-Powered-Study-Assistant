import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "Explain quantum entanglement simply",
  "Help me memorize the periodic table",
  "What is the Pythagorean theorem?",
  "Summarize the French Revolution",
];

const SYSTEM_PROMPT = `You are StudyAI, an expert and friendly AI tutor. Explain concepts clearly with examples, use analogies, break down complex topics step by step, and keep answers concise but complete.`;

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatView() {
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hi! I'm your AI Study Assistant 👋\n\nWhat would you like to learn today?", time: formatTime(new Date()) },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: trimmed, time: formatTime(new Date()) }]);
    setInput("");
    setLoading(true);
    try {
      const history = messages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }));
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:3001") + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: SYSTEM_PROMPT, messages: [...history, { role: "user", content: trimmed }] }),
      });
      const data = await res.json();
      const aiText = data.content?.map((b) => b.text || "").join("") || "Sorry, try again.";
      setMessages((prev) => [...prev, { role: "ai", content: aiText, time: formatTime(new Date()) }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: "Connection error. Is the backend running?", time: formatTime(new Date()) }]);
    }
    setLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="page-header">
        <div><div className="page-title">AI Tutor</div><div className="page-subtitle">Ask anything — get clear explanations</div></div>
        <button className="btn btn-ghost" onClick={() => setMessages([{ role: "ai", content: "New chat started!", time: formatTime(new Date()) }])}>↺ New chat</button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className={`msg-avatar ${msg.role}`}>{msg.role === "ai" ? "S" : "U"}</div>
            <div>
              <div className="msg-bubble">{msg.content.split("\n").map((l, j) => <p key={j}>{l}</p>)}</div>
              <div className="msg-time">{msg.time}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message ai">
            <div className="msg-avatar ai">S</div>
            <div className="msg-bubble"><div className="typing-indicator"><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></div></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        {messages.length <= 2 && (
          <div className="chat-suggestions">
            {SUGGESTIONS.map((s) => <button key={s} className="suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>)}
          </div>
        )}
        <div className="chat-input-wrapper">
          <textarea ref={textareaRef} className="chat-textarea" placeholder="Ask me anything…" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            rows={1}
          />
          <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}