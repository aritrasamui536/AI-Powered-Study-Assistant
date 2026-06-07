import { useState, useEffect } from "react";

const SAMPLE = [
  { question: "Which organelle is responsible for photosynthesis?", options: ["Mitochondria", "Ribosome", "Chloroplast", "Nucleus"], correct: 2, explanation: "Chloroplasts contain chlorophyll which captures light energy to convert CO₂ and water into glucose.", category: "Biology" },
  { question: "What is the formula for kinetic energy?", options: ["KE = mgh", "KE = ½mv²", "KE = mc²", "KE = Fd"], correct: 1, explanation: "KE = ½mv² where m is mass and v is velocity.", category: "Physics" },
  { question: "Who developed the theory of general relativity?", options: ["Isaac Newton", "Niels Bohr", "Albert Einstein", "Max Planck"], correct: 2, explanation: "Einstein published his theory of general relativity in 1915.", category: "Science History" },
];

export default function QuizView() {
  const [questions, setQuestions] = useState(SAMPLE);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timer, setTimer] = useState(30);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (answered || finished) return;
    if (timer === 0) { handleAnswer(null); return; }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer, answered, finished]);

  const handleAnswer = (idx) => {
    if (answered) return;
    setSelected(idx); setAnswered(true);
    if (idx === questions[currentQ].correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (currentQ + 1 >= questions.length) { setFinished(true); return; }
    setCurrentQ((q) => q + 1); setSelected(null); setAnswered(false); setTimer(30);
  };

  const restart = (qs = questions) => {
    setQuestions(qs); setCurrentQ(0); setSelected(null); setAnswered(false);
    setScore(0); setFinished(false); setTimer(30);
  };

  const generate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Generate 5 multiple-choice questions about "${topic}". Return ONLY a JSON array. Each object: "question", "options" (4 items), "correct" (0-3), "explanation", "category". No markdown, just JSON.` }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map((b) => b.text || "").join("") || "[]";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (Array.isArray(parsed) && parsed.length > 0) { setShowForm(false); restart(parsed); }
    } catch { alert("Generation failed."); }
    setGenerating(false);
  };

  const q = questions[currentQ];
  const letters = ["A", "B", "C", "D"];

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="quiz-page">
        <div className="page-header"><div className="page-title">Quiz Results</div></div>
        <div className="quiz-content">
          <div className="quiz-result-card">
            <div className="result-score">{pct}%</div>
            <div className="result-label">{pct >= 80 ? "Excellent! 🎉" : pct >= 60 ? "Good work! 👍" : "Keep practicing! 💪"}</div>
            <div className="result-stats">
              <div className="result-stat"><span className="result-stat-val green">{score}</span><span className="result-stat-key">Correct</span></div>
              <div className="result-stat"><span className="result-stat-val red">{questions.length - score}</span><span className="result-stat-key">Wrong</span></div>
              <div className="result-stat"><span className="result-stat-val amber">{questions.length}</span><span className="result-stat-key">Total</span></div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="btn btn-primary" onClick={() => restart()}>Try Again</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(true)}>New Topic</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="page-header">
        <div><div className="page-title">Quiz</div><div className="page-subtitle">Test your knowledge</div></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Generate Quiz</button>
      </div>
      <div className="quiz-content">
        {showForm && (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", marginBottom: "20px", maxWidth: "680px", margin: "0 auto 20px" }}>
            <div style={{ fontSize: "15px", fontWeight: "500", marginBottom: "14px", color: "var(--text)" }}>Generate a New Quiz</div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} placeholder="Topic: e.g. Newton's laws..."
                style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: "8px", padding: "9px 12px", color: "var(--text)", fontSize: "14px", outline: "none", fontFamily: "var(--font-sans)" }} />
              <button className="btn btn-primary" onClick={generate} disabled={generating || !topic.trim()}>{generating ? "Generating…" : "Generate"}</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}
        <div className="quiz-card">
          <div className="quiz-meta">
            <span className="quiz-tag">{q.category}</span>
            <div className="quiz-timer">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ color: timer <= 10 ? "var(--red)" : "var(--text2)" }}>{timer}s</span>
              <span style={{ color: "var(--text3)" }}>· {currentQ + 1}/{questions.length}</span>
            </div>
          </div>
          <div className="quiz-question">{q.question}</div>
          <div className="quiz-options">
            {q.options.map((opt, i) => {
              let cls = "";
              if (answered) { if (i === q.correct) cls = "correct"; else if (i === selected) cls = "wrong"; }
              else if (i === selected) cls = "selected";
              return (
                <button key={i} className={`quiz-option ${cls}`} onClick={() => handleAnswer(i)} disabled={answered}>
                  <span className="option-letter">{letters[i]}</span>{opt}
                </button>
              );
            })}
          </div>
          {answered && <div className="quiz-explanation"><strong>Explanation: </strong>{q.explanation}</div>}
          <div className="quiz-nav">{answered && <button className="btn btn-primary" onClick={next}>{currentQ + 1 >= questions.length ? "See Results" : "Next →"}</button>}</div>
        </div>
      </div>
    </div>
  );
}