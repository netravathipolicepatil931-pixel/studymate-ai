import { useState } from "react";

export default function Summary({ points = [], keywords = [], definitions = {} }) {
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleSpeech = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const fullText = points.join(". ");
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const copySummary = () => {
    const text = points.map((p, i) => `${i + 1}. ${p}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">📌 Executive Study Summary</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "4px" }}>
            Extracted core takeaways & key concepts from your material.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary" onClick={toggleSpeech}>
            {isPlaying ? "⏹️ Stop Audio" : "🔊 Listen Summary"}
          </button>
          <button className="btn btn-secondary" onClick={copySummary}>
            {copied ? "✅ Copied!" : "📋 Copy"}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <ul className="summary-list">
          {points.map((pt, i) => (
            <li key={i} className="summary-item">
              <span className="summary-bullet">0{i + 1}</span>
              <div>{pt}</div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "12px", color: "var(--text-primary)" }}>
          🏷️ Key Terms & Vocabulary Definitions
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "12px" }}>
          Click any term to highlight its definition extracted directly from notes:
        </p>
        <div className="chips-container">
          {keywords.map((term) => (
            <button
              key={term}
              className={`chip-item ${selectedTerm === term ? "active" : ""}`}
              onClick={() => setSelectedTerm(selectedTerm === term ? null : term)}
            >
              #{term}
            </button>
          ))}
        </div>

        {selectedTerm && (
          <div
            style={{
              marginTop: "14px",
              padding: "16px",
              background: "var(--bg-input)",
              border: "1px solid var(--accent-primary)",
              borderRadius: "var(--radius-md)",
              animation: "fadeIn 0.2s ease"
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--accent-primary)", marginBottom: "4px" }}>
              💡 Term Context: <span style={{ textTransform: "capitalize" }}>{selectedTerm}</span>
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontStyle: "italic" }}>
              "{definitions[selectedTerm] || `Core keyword from study material related to ${selectedTerm}.`}"
            </div>
          </div>
        )}
      </div>
    </section>
  );
}