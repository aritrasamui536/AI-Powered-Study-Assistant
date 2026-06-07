import { useState } from "react";

const DECKS = [
  { id: 1, name: "Biology — Cell Division", count: 12, mastered: 8 },
  { id: 2, name: "World History — WWII", count: 20, mastered: 5 },
  { id: 3, name: "Math — Calculus", count: 15, mastered: 12 },
];

const DEFAULT_CARDS = [
  { q: "What is mitosis?", a: "Cell division producing two identical daughter cells. Phases: Prophase, Metaphase, Anaphase, Telophase." },
  { q: "What is the powerhouse of the cell?", a: "Mitochondria — produces ATP through cellular respiration." },
  { q: "What is DNA?", a: "Deoxyribonucleic Acid — double-helix molecule carrying genetic instructions." },
  { q: "Function of ribosome?", a: "Synthesizes proteins by translating mRNA sequences." },
];

export default function FlashcardView() {
  const [activeDeck, setActiveDeck] = useState(null);
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [scores, setScores] = useState([]);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleRate = (r) => {
    setScores((p) => [...p, r]);
    setFlipped(false);
    setTimeout(() => setIdx((i) => i + 1), 200);
  };

  const generate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Generate ${count} flashcards about "${topic}". Return ONLY a JSON array with objects having "q" and "a" keys. No markdown, just JSON.` }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map((b) => b.text || "").join("") || "[]";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        setCards(parsed); setIdx(0); setFlipped(false); setScores([]);
        setActiveDeck({ name: topic }); setShowForm(false); setTopic("");
      }
    } catch { alert("Generation failed."); }
    setGenerating(false);
  };

  if (activeDeck && idx < cards.length) {
    const card = cards[idx];
    return (
      <div className="flashcard-page">
        <div className="page-header">
          <div><div className="page-title">{activeDeck.name}</div><div className="page-subtitle">Click card to flip</div></div>
          <button className="btn btn-ghost" onClick={() => { setActiveDeck(null); setIdx(0); setFlipped(false); setScores([]); }}>← Back</button>
        </div>
        <div className="flashcard-content">
          <div className="flashcard-arena">
            <div style={{ width: "520px" }}><div className="fc-progress-bar"><div className="fc-progress-fill" style={{ width: `${(idx / cards.length) * 100}%` }} /></div></div>
            <div className="fc-counter">{idx + 1} / {cards.length}</div>
            <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
              <div className="flashcard-inner">
                <div className="fc-face front"><div className="fc-label">Question</div><div className="fc-question">{card.q}</div><div className="fc-hint">Tap to flip</div></div>
                <div className="fc-face back"><div className="fc-label">Answer</div><div className="fc-answer">{card.a}</div></div>
              </div>
            </div>
            {flipped && (
              <div className="fc-actions">
                <button className="fc-btn wrong" onClick={() => handleRate("wrong")}>✗ Again</button>
                <button className="fc-btn hard" onClick={() => handleRate("hard")}>〜 Hard</button>
                <button className="fc-btn good" onClick={() => handleRate("good")}>✓ Got it</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeDeck && idx >= cards.length) {
    const good = scores.filter((s) => s === "good").length;
    return (
      <div className="flashcard-page">
        <div className="page-header"><div className="page-title">Session Complete! 🎉</div></div>
        <div className="flashcard-content">
          <div className="quiz-result-card">
            <div className="result-score">{Math.round((good / cards.length) * 100)}%</div>
            <div className="result-label">Mastery Score</div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
              <button className="btn btn-primary" onClick={() => { setIdx(0); setFlipped(false); setScores([]); }}>Study Again</button>
              <button className="btn btn-ghost" onClick={() => { setActiveDeck(null); setIdx(0); setFlipped(false); setScores([]); }}>Back to Decks</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcard-page">
      <div className="page-header">
        <div><div className="page-title">Flashcards</div><div className="page-subtitle">Spaced repetition for effective memorization</div></div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Generate with AI</button>
      </div>
      <div className="flashcard-content">
        {showForm && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", marginBottom: "16px" }}>
            <div style={{ fontSize: "15px", fontWeight: "500", marginBottom: "14px", color: "var(--text)" }}>Generate Flashcards</div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} placeholder="Topic: e.g. Photosynthesis..."
                style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: "8px", padding: "9px 12px", color: "var(--text)", fontSize: "14px", outline: "none", fontFamily: "var(--font-sans)" }} />
              <select value={count} onChange={(e) => setCount(+e.target.value)} style={{ background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: "8px", padding: "9px 12px", color: "var(--text)", fontSize: "14px", outline: "none" }}>
                {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <button className="btn btn-primary" onClick={generate} disabled={generating || !topic.trim()}>{generating ? "Generating…" : "Generate"}</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}
        <div className="fc-deck-grid">
          {DECKS.map((deck) => (
            <div key={deck.id} className="deck-card" onClick={() => { setActiveDeck(deck); setCards(DEFAULT_CARDS); setIdx(0); setFlipped(false); setScores([]); }}>
              <div className="deck-name">{deck.name}</div>
              <div className="deck-count">{deck.count} cards · {deck.mastered} mastered</div>
              <div className="deck-bar"><div className="deck-bar-fill" style={{ width: `${(deck.mastered / deck.count) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}