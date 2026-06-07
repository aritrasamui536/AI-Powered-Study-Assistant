import { useState } from "react";

export default function SummaryView() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://localhost:3001") + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Summarize this for a student. Return ONLY JSON: {"title":"...","overview":"...","sections":[{"heading":"...","text":"..."}],"keyPoints":["..."],"stats":{"words":0,"readTime":"...","complexity":"...","keyTerms":0},"topics":["..."]}. Text:\n${text.slice(0, 3000)}` }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.map((b) => b.text || "").join("") || "{}";
      setSummary(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch { alert("Failed. Check backend."); }
    setLoading(false);
  };

  return (
    <div className="summary-page">
      <div className="page-header">
        <div><div className="page-title">Summarizer</div><div className="page-subtitle">Paste any text for an AI study summary</div></div>
      </div>
      <div className="summary-content">
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "20px" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", color: "var(--text2)" }}>Paste your text below</span>
            <span style={{ fontSize: "12px", color: "var(--text3)" }}>{text.split(/\s+/).filter(Boolean).length} words</span>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste study material, notes, or any text here…"
            style={{ width: "100%", minHeight: "140px", background: "none", border: "none", outline: "none", padding: "16px", color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: "1.65", resize: "vertical" }} />
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary" onClick={generate} disabled={!text.trim() || loading}>
              {loading ? "Summarizing…" : "✦ Summarize"}
            </button>
          </div>
        </div>

        {summary && (
          <div className="summary-grid">
            <div className="summary-main">
              <div className="summary-output">
                <h3>{summary.title}</h3>
                <p>{summary.overview}</p>
                {summary.sections?.map((s, i) => <div key={i}><h4>{s.heading}</h4><p>{s.text}</p></div>)}
                {summary.keyPoints?.length > 0 && <>
                  <h4>Key Points</h4>
                  <ul className="key-points">{summary.keyPoints.map((kp, i) => <li key={i}><span className="kp-dot"/>{kp}</li>)}</ul>
                </>}
              </div>
            </div>
            <div className="summary-sidebar-panel">
              {summary.stats && (
                <div className="panel-card">
                  <h4>Document Stats</h4>
                  {[["Word Count", summary.stats.words], ["Read Time", summary.stats.readTime], ["Complexity", summary.stats.complexity], ["Key Terms", summary.stats.keyTerms]].map(([k, v]) => (
                    <div key={k} className="stat-row"><span className="stat-row-key">{k}</span><span className="stat-row-val">{v}</span></div>
                  ))}
                </div>
              )}
              {summary.topics?.length > 0 && (
                <div className="panel-card">
                  <h4>Key Topics</h4>
                  <div className="topic-chips">{summary.topics.map((t) => <span key={t} className="topic-chip">{t}</span>)}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}