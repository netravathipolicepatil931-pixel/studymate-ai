import { useState } from "react";
import Summary from "./Summary";
import Flashcards from "./Flashcards";
import Quiz from "./Quiz";
import Syllabus from "./Syllabus";

export default function ChatMessage({ message }) {
  const isUser = message.sender === "user";
  const [activeWidgetTab, setActiveWidgetTab] = useState("Summary");

  return (
    <div className={`chat-row ${isUser ? "user-row" : "ai-row"}`}>
      <div className="message-wrapper">
        <div className={`message-avatar ${isUser ? "user-avatar" : "ai-avatar"}`}>
          {isUser ? "👤" : "📚"}
        </div>

        <div className="message-content">
          <div className="sender-name">{isUser ? "You" : "StudyMate AI"}</div>

          {/* Attached File display in User message */}
          {message.attachedFile && (
            <div className="msg-file-attachment">
              📄 Attached Document: <strong>{message.attachedFile.name}</strong>
            </div>
          )}

          {/* Main message text */}
          <div className="text-body">{message.text}</div>

          {/* Embedded Study Pack Widget if generated */}
          {message.studyPack && (
            <div className="embedded-study-widget">
              <div className="widget-header-tabs">
                <button
                  className={`widget-tab ${activeWidgetTab === "Summary" ? "active" : ""}`}
                  onClick={() => setActiveWidgetTab("Summary")}
                >
                  📌 Summary
                </button>
                <button
                  className={`widget-tab ${activeWidgetTab === "Flashcards" ? "active" : ""}`}
                  onClick={() => setActiveWidgetTab("Flashcards")}
                >
                  🎴 Flashcards ({message.studyPack.cards.length})
                </button>
                <button
                  className={`widget-tab ${activeWidgetTab === "Quiz" ? "active" : ""}`}
                  onClick={() => setActiveWidgetTab("Quiz")}
                >
                  🧩 Quiz ({message.studyPack.quiz.length})
                </button>
                <button
                  className={`widget-tab ${activeWidgetTab === "Syllabus" ? "active" : ""}`}
                  onClick={() => setActiveWidgetTab("Syllabus")}
                >
                  🗺️ Syllabus
                </button>
              </div>

              <div className="widget-tab-content">
                {activeWidgetTab === "Summary" && (
                  <Summary
                    points={message.studyPack.summary}
                    keywords={message.studyPack.keywords}
                    definitions={message.studyPack.definitions}
                  />
                )}
                {activeWidgetTab === "Flashcards" && (
                  <Flashcards cards={message.studyPack.cards} />
                )}
                {activeWidgetTab === "Quiz" && (
                  <Quiz questions={message.studyPack.quiz} />
                )}
                {activeWidgetTab === "Syllabus" && (
                  <Syllabus
                    initialTopics={message.studyPack.syllabus}
                    contextText={message.studyPack.rawText}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
