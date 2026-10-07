import { useState, useRef, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";
import { SAMPLE_PACKS } from "./utils/samplePacks";
import { isSupabaseConfigured } from "./utils/supabase";
import {
  fetchSessionsFromDb,
  createSessionInDb,
  deleteSessionInDb,
  saveMessageInDb,
  updateSessionTitleInDb,
} from "./utils/supabaseService";
import {
  summarize,
  getKeywords,
  getDefinitions,
  makeFlashcards,
  makeQuiz,
  generateSyllabusFromText,
  answerQuestion,
} from "./utils/studyEngine";
import "./App.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState([
    {
      id: "session-1",
      title: "Artificial Intelligence Notes",
      messages: [
        {
          id: "m-1",
          sender: "ai",
          text: "Welcome to StudyMate AI! I've loaded your notes on Artificial Intelligence & Neural Networks. Here is your generated study pack with summary, flashcards, quiz, and syllabus:",
          studyPack: {
            rawText: SAMPLE_PACKS[0].text,
            summary: summarize(SAMPLE_PACKS[0].text),
            keywords: getKeywords(SAMPLE_PACKS[0].text),
            definitions: getDefinitions(SAMPLE_PACKS[0].text, getKeywords(SAMPLE_PACKS[0].text)),
            cards: makeFlashcards(SAMPLE_PACKS[0].text),
            quiz: makeQuiz(SAMPLE_PACKS[0].text),
            syllabus: generateSyllabusFromText(SAMPLE_PACKS[0].text),
          },
        },
      ],
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState("session-1");
  const [isGenerating, setIsGenerating] = useState(false);
  const chatScrollRef = useRef(null);

  // Load sessions from Supabase if configured
  useEffect(() => {
    async function loadDb() {
      if (isSupabaseConfigured) {
        const dbSessions = await fetchSessionsFromDb();
        if (dbSessions && dbSessions.length > 0) {
          setSessions(dbSessions);
          setActiveSessionId(dbSessions[0].id);
        }
      }
    }
    loadDb();
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages, isGenerating]);

  const handleNewSession = async () => {
    let newId = `session-${Date.now()}`;
    if (isSupabaseConfigured) {
      const dbId = await createSessionInDb("New Study Session");
      if (dbId) newId = dbId;
    }

    const newSession = {
      id: newId,
      title: "New Study Session",
      messages: [],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = async (id) => {
    if (isSupabaseConfigured) {
      await deleteSessionInDb(id);
    }

    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    if (updated.length > 0) {
      setActiveSessionId(updated[0].id);
    } else {
      handleNewSession();
    }
  };

  const handleSendMessage = async (userText, attachedFile) => {
    let textToAnalyze = userText;
    if (attachedFile) {
      textToAnalyze += "\n\n" + attachedFile.content;
    }

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: userText || `Uploaded study file: ${attachedFile.name}`,
      attachedFile: attachedFile ? { name: attachedFile.name } : null,
    };

    const isFirstMsg = activeSession.messages.length === 0;
    const sessionTitle = isFirstMsg
      ? userText.slice(0, 30) || attachedFile?.name || "Study Session"
      : activeSession.title;

    const updatedMessages = [...activeSession.messages, userMsg];

    setSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === activeSessionId
          ? { ...s, title: sessionTitle, messages: updatedMessages }
          : s
      )
    );

    if (isSupabaseConfigured) {
      if (isFirstMsg) {
        updateSessionTitleInDb(activeSessionId, sessionTitle);
      }
      saveMessageInDb(activeSessionId, userMsg);
    }

    setIsGenerating(true);

    setTimeout(async () => {
      let aiText = "";
      let studyPack = null;

      const fullText = textToAnalyze.trim();

      if (fullText.length > 120 || attachedFile) {
        aiText = `I've processed your study material! Here is your generated Study Suite featuring key summaries, 3D flashcards, gamified quiz, and syllabus roadmap:`;
        studyPack = {
          rawText: fullText,
          summary: summarize(fullText),
          keywords: getKeywords(fullText),
          definitions: getDefinitions(fullText, getKeywords(fullText)),
          cards: makeFlashcards(fullText),
          quiz: makeQuiz(fullText),
          syllabus: generateSyllabusFromText(fullText),
        };
      } else {
        const lastAttachedContext = activeSession.messages
          .find((m) => m.studyPack?.rawText)?.studyPack?.rawText || SAMPLE_PACKS[0].text;
        aiText = answerQuestion(userText, lastAttachedContext);
      }

      const aiMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: aiText,
        studyPack,
      };

      setSessions((prevSessions) =>
        prevSessions.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, userMsg, aiMsg] }
            : s
        )
      );

      if (isSupabaseConfigured) {
        saveMessageInDb(activeSessionId, aiMsg);
      }

      setIsGenerating(false);
    }, 600);
  };

  const handleStartPreset = async (preset) => {
    let newId = `session-${Date.now()}`;
    if (isSupabaseConfigured) {
      const dbId = await createSessionInDb(preset.title);
      if (dbId) newId = dbId;
    }

    const aiMsg = {
      id: `msg-${Date.now()}`,
      sender: "ai",
      text: `Loaded preset module: **${preset.title}**! Here is your AI Study Pack:`,
      studyPack: {
        rawText: preset.text,
        summary: summarize(preset.text),
        keywords: getKeywords(preset.text),
        definitions: getDefinitions(preset.text, getKeywords(preset.text)),
        cards: makeFlashcards(preset.text),
        quiz: makeQuiz(preset.text),
        syllabus: generateSyllabusFromText(preset.text),
      },
    };

    const newSession = {
      id: newId,
      title: preset.title,
      messages: [aiMsg],
    };

    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);

    if (isSupabaseConfigured) {
      saveMessageInDb(newId, aiMsg);
    }
  };

  return (
    <div className="chat-layout">
      {/* Left Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Viewport */}
      <div className="chat-main-viewport">
        {/* Top bar */}
        <header className="chat-topbar">
          <div className="topbar-left">
            <button
              className="toggle-sidebar-icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Sidebar"
            >
              ☰
            </button>
            <span className="app-brand-title">StudyMate AI</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              className="badge"
              style={{
                background: isSupabaseConfigured ? "var(--success-bg)" : "var(--bg-input)",
                color: isSupabaseConfigured ? "var(--success)" : "var(--text-muted)",
              }}
            >
              {isSupabaseConfigured ? "🟢 Supabase Connected" : "⚡ Supabase Ready (.env)"}
            </span>
          </div>
        </header>

        {/* Message Thread or Hero Welcome */}
        <div className="chat-messages-scroll" ref={chatScrollRef}>
          {activeSession.messages.length === 0 ? (
            <div className="hero-welcome">
              <div className="hero-logo">📚</div>
              <h1 className="hero-title">What would you like to study today?</h1>
              <p className="hero-subtitle">
                Attach PDFs, paste course notes, or select a preset module below to generate instant summaries, 3D flashcards, quizzes, and grounded Q&A.
              </p>

              <div className="hero-starter-grid">
                {SAMPLE_PACKS.map((sp) => (
                  <div
                    key={sp.id}
                    className="starter-card"
                    onClick={() => handleStartPreset(sp)}
                  >
                    <div className="starter-title">
                      {sp.icon} {sp.title}
                    </div>
                    <div className="starter-sub">{sp.category}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-inner">
              {activeSession.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {isGenerating && (
                <div className="chat-row ai-row">
                  <div className="message-wrapper">
                    <div className="message-avatar ai-avatar">📚</div>
                    <div className="message-content">
                      <div className="sender-name">StudyMate AI</div>
                      <div className="text-body" style={{ color: "var(--accent-primary)" }}>
                        ⏳ Analyzing study material and syncing with database...
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Input Dock */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
}