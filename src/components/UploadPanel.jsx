import { useState } from "react";
import { extractPdfText } from "../utils/pdf";
import { SAMPLE_PACKS } from "../utils/samplePacks";

export default function UploadPanel({ onGenerate }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = async (file) => {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const extracted = await extractPdfText(file);
        if (!extracted || extracted.trim().length < 50) {
          throw new Error("Could not parse text from this PDF.");
        }
        setText(extracted);
      } else {
        const rawText = await file.text();
        setText(rawText);
      }
    } catch (err) {
      setError("Unable to read file text. Please try copy-pasting your text directly.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const loadSample = (sample) => {
    setText(sample.text);
    onGenerate(sample.text, sample.title);
  };

  const charCount = text.trim().length;

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">✨ Create Your AI Study Suite</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
            Upload PDFs, paste lecture notes, or pick a sample preset to auto-generate summaries, 3D flashcards, quizzes, and syllabus roadmaps.
          </p>
        </div>
        <span className="badge">AI Powered</span>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h4 style={{ fontSize: "0.88rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.5px", marginBottom: "10px" }}>
          🚀 Quick Sample Presets (Click to test instantly)
        </h4>
        <div className="preset-grid">
          {SAMPLE_PACKS.map((sp) => (
            <div key={sp.id} className="preset-card" onClick={() => loadSample(sp)}>
              <div className="preset-header">
                <span>{sp.icon}</span>
                <span>{sp.title}</span>
              </div>
              <p className="preset-desc">{sp.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragOver ? "var(--accent-primary)" : "var(--border-color)"}`,
          borderRadius: "var(--radius-md)",
          padding: "24px",
          textAlign: "center",
          background: isDragOver ? "var(--accent-glow)" : "var(--bg-input)",
          transition: "all 0.2s ease",
          cursor: "pointer",
          position: "relative"
        }}
      >
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileInput}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
        />
        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📄</div>
        <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>
          Drag & Drop PDF or TXT notes here, or <span style={{ color: "var(--accent-primary)" }}>browse files</span>
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
          Supports exported lecture PDFs, course slides, and text documents
        </p>
      </div>

      {loading && (
        <div style={{ margin: "14px 0", textAlign: "center", color: "var(--accent-primary)", fontWeight: 600 }}>
          ⏳ Extracting & analyzing document text...
        </div>
      )}

      {error && (
        <div style={{ margin: "14px 0", padding: "10px 14px", background: "var(--danger-bg)", color: "var(--danger)", borderRadius: "var(--radius-sm)", fontSize: "0.9rem" }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            ...or paste text notes directly:
          </label>
          <span style={{ fontSize: "0.8rem", color: charCount >= 150 ? "var(--success)" : "var(--text-muted)" }}>
            {charCount} / 150 min characters
          </span>
        </div>

        <textarea
          className="input-textarea"
          rows={7}
          placeholder="Paste lecture notes, chapter summaries, textbook sections, or syllabus guidelines here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
        <button
          className="btn"
          disabled={charCount < 150 || loading}
          onClick={() => onGenerate(text, "Custom Study Notes")}
        >
          ⚡ Generate AI Study Pack
        </button>
      </div>
    </section>
  );
}