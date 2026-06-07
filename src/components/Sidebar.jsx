const TABS = [
  { id: "chat", label: "AI Tutor", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { id: "flashcards", label: "Flashcards", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> },
  { id: "quiz", label: "Quiz", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg> },
  { id: "summary", label: "Summarizer", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
];

export default function Sidebar({ activeTab, setActiveTab, open, setOpen }) {
  return (
    <aside className={`sidebar ${open ? "" : "closed"}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">✦</div>
        {open && <span className="logo-text">Study<span>AI</span></span>}
        <button className="toggle-btn" onClick={() => setOpen(!open)} style={{ marginLeft: "auto" }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {open ? <path d="M11 19l-7-7 7-7M18 19l-7-7 7-7" /> : <path d="M13 5l7 7-7 7M6 5l7 7-7 7" />}
          </svg>
        </button>
      </div>
      <nav className="sidebar-nav">
        {open && <span className="nav-section-label">Tools</span>}
        {TABS.map((tab) => (
          <button key={tab.id} className={`nav-item ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
            {tab.icon}
            {open && tab.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="streak-badge">
          <span className="fire">🔥</span>
          {open && <div className="streak-info"><span className="streak-days">7 Day Streak</span><span className="streak-label">Keep it up!</span></div>}
        </div>
      </div>
    </aside>
  );
}