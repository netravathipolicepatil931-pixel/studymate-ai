import { useState, useEffect } from "react";

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpen,
  onToggleOpen,
}) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("studymate_theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("studymate_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <aside className={`chat-sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewSession}>
          <span style={{ fontSize: "1.1rem" }}>➕</span>
          <span>New Study Session</span>
        </button>
        <button
          className="sidebar-close-btn"
          onClick={onToggleOpen}
          title="Close Sidebar"
        >
          ✕
        </button>
      </div>

      {/* History List */}
      <div className="sidebar-history">
        <div className="history-section-label">Recent Study Chats</div>
        {sessions.length === 0 ? (
          <div className="history-empty">No study chats yet</div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className={`history-item ${s.id === activeSessionId ? "active" : ""}`}
              onClick={() => onSelectSession(s.id)}
            >
              <div className="history-item-title">
                <span>💬</span>
                <span className="title-text">{s.title || "Untitled Session"}</span>
              </div>
              <button
                className="history-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(s.id);
                }}
                title="Delete Session"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button className="footer-setting-btn" onClick={toggleTheme}>
          <span>{theme === "dark" ? "☀️" : "🌙"}</span>
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <div className="user-profile-pill">
          <div className="avatar">🎓</div>
          <div className="user-info">
            <div className="user-name">StudyMate Pro</div>
            <div className="user-plan">AI Learning Suite</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
