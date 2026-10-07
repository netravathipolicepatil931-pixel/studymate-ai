import { useState, useRef } from "react";
import { extractPdfText } from "../utils/pdf";

export default function ChatInput({ onSendMessage, isGenerating }) {
  const [text, setText] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExtracting(true);
    try {
      let content = "";
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        content = await extractPdfText(file);
      } else {
        content = await file.text();
      }
      setAttachedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        content: content,
      });
    } catch (err) {
      alert("Error reading file: " + err.message);
    } finally {
      setExtracting(false);
    }
  };

  const handleSend = () => {
    if ((!text.trim() && !attachedFile) || isGenerating || extracting) return;
    onSendMessage(text, attachedFile);
    setText("");
    setAttachedFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container">
      {/* Attached file chip */}
      {attachedFile && (
        <div className="attached-file-badge">
          <span>📄 {attachedFile.name} ({attachedFile.size})</span>
          <button onClick={() => setAttachedFile(null)}>✕</button>
        </div>
      )}

      {extracting && (
        <div className="extracting-indicator">
          ⏳ Parsing attached document text...
        </div>
      )}

      {/* Main Input Bar */}
      <div className="chat-input-box">
        <button
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Attach PDF or Text note file"
        >
          📎
        </button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.txt"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <textarea
          className="prompt-textarea"
          rows={1}
          placeholder="Ask StudyMate AI anything, paste notes, or attach a PDF document..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          className="send-btn"
          onClick={handleSend}
          disabled={(!text.trim() && !attachedFile) || isGenerating || extracting}
        >
          ➔
        </button>
      </div>

      <div className="chat-input-disclaimer">
        StudyMate AI can generate summaries, 3D flashcards, interactive quizzes, and grounded study responses.
      </div>
    </div>
  );
}
