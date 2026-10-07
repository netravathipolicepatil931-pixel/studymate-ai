import { useState, useEffect } from "react";
import { generateSyllabusFromText } from "../utils/studyEngine";

export default function Syllabus({ initialTopics = [], contextText = "" }) {
  const [topics, setTopics] = useState(initialTopics);
  const [newTopicText, setNewTopicText] = useState("");

  useEffect(() => {
    if ((!initialTopics || !initialTopics.length) && contextText) {
      setTopics(generateSyllabusFromText(contextText));
    } else {
      setTopics(initialTopics);
    }
  }, [initialTopics, contextText]);

  const toggleDone = (id) => {
    setTopics(topics.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const addTopic = (e) => {
    e.preventDefault();
    if (!newTopicText.trim()) return;
    setTopics([
      ...topics,
      {
        id: `custom-${Date.now()}`,
        name: newTopicText.trim(),
        done: false,
        priority: "Normal",
      },
    ]);
    setNewTopicText("");
  };

  const doneCount = topics.filter((t) => t.done).length;
  const percent = topics.length ? Math.round((doneCount / topics.length) * 100) : 0;

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">🗺️ Syllabus & Mastery Roadmap</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "4px" }}>
            Track learning progress across key curriculum modules.
          </p>
        </div>

        <span className="badge">
          {doneCount} / {topics.length} Completed
        </span>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          <span>Curriculum Mastery</span>
          <span style={{ fontWeight: 700, color: "var(--accent-primary)" }}>{percent}% Complete</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Topics list */}
      <div style={{ marginBottom: "20px" }}>
        {topics.map((topic) => (
          <div
            key={topic.id}
            className={`syllabus-item ${topic.done ? "done" : ""}`}
            onClick={() => toggleDone(topic.id)}
            style={{ cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                type="checkbox"
                checked={topic.done}
                onChange={() => toggleDone(topic.id)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{topic.name}</span>
            </div>

            <span
              style={{
                fontSize: "0.75rem",
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                background:
                  topic.priority === "High"
                    ? "var(--danger-bg)"
                    : topic.priority === "Medium"
                    ? "var(--warning-bg)"
                    : "var(--bg-card)",
                color:
                  topic.priority === "High"
                    ? "var(--danger)"
                    : topic.priority === "Medium"
                    ? "var(--warning)"
                    : "var(--text-muted)",
                border: "1px solid var(--border-color)",
                fontWeight: 600
              }}
            >
              {topic.priority || "Normal"}
            </span>
          </div>
        ))}
      </div>

      {/* Add Custom Topic Form */}
      <form onSubmit={addTopic} style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          placeholder="Add new topic or learning objective..."
          value={newTopicText}
          onChange={(e) => setNewTopicText(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 14px",
            background: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontSize: "0.9rem"
          }}
        />
        <button type="submit" className="btn btn-secondary" disabled={!newTopicText.trim()}>
          ➕ Add Topic
        </button>
      </form>
    </section>
  );
}