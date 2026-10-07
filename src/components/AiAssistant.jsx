import { useState } from "react";
import { answerQuestion } from "../utils/studyEngine";

export default function AiAssistant({ contextText = "", title = "Study Notes" }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `Hello! I'm your AI Study Assistant. I've analyzed your notes on "${title}". Ask me any question, definition request, or clarification about your material!`,
    },
  ]);
  const [query, setQuery] = useState("");

  const suggestedQuestions = [
    "What are the main concepts in this material?",
    "Can you explain the key terms?",
    "Give me a quick summary of the main points.",
  ];

  const handleSend = (textToSend) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    const newMessages = [...messages, { sender: "user", text: text.trim() }];
    setMessages(newMessages);
    setQuery("");

    setTimeout(() => {
      const response = answerQuestion(text.trim(), contextText);
      setMessages((prev) => [...prev, { sender: "ai", text: response }]);
    }, 400);
  };

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">🤖 AI Study Assistant</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "4px" }}>
            Ask questions answered directly from your uploaded material.
          </p>
        </div>
        <span className="badge">Grounded QA</span>
      </div>

      {/* Suggested prompts */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "12px 0 16px" }}>
        {suggestedQuestions.map((sq, i) => (
          <button
            key={i}
            className="btn btn-secondary"
            style={{ fontSize: "0.8rem", padding: "6px 12px" }}
            onClick={() => handleSend(sq)}
          >
            💡 {sq}
          </button>
        ))}
      </div>

      {/* Chat messages */}
      <div className="chat-container">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: "flex", gap: "8px", marginTop: "12px" }}
      >
        <input
          type="text"
          placeholder="Ask a question about your study material..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontSize: "0.92rem",
          }}
        />
        <button type="submit" className="btn" disabled={!query.trim()}>
          Send 💬
        </button>
      </form>
    </section>
  );
}
