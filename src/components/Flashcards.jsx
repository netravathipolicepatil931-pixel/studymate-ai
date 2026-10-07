import { useState, useEffect } from "react";

export default function Flashcards({ cards: initialCards = [] }) {
  const [cards, setCards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState({});

  useEffect(() => {
    setCards(initialCards);
    setIndex(0);
    setFlipped(false);
  }, [initialCards]);

  if (!cards || !cards.length) {
    return (
      <section className="card">
        <p>No flashcards generated for this topic.</p>
      </section>
    );
  }

  const current = cards[index];

  const go = (step) => {
    setFlipped(false);
    setIndex((prev) => (prev + step + cards.length) % cards.length);
  };

  const toggleMastery = (e) => {
    e.stopPropagation();
    setMastered((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const shuffleCards = () => {
    setFlipped(false);
    setIndex(0);
    setCards([...cards].sort(() => Math.random() - 0.5));
  };

  const masteredCount = Object.values(mastered).filter(Boolean).length;
  const progressPercent = Math.round((masteredCount / cards.length) * 100);

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">🎴 Smart Flashcards</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "4px" }}>
            Click card or press Space to flip. Track concepts you've mastered.
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button className="btn btn-secondary" onClick={shuffleCards} title="Shuffle Deck">
            🔀 Shuffle
          </button>
          <span className="badge">
            Card {index + 1} / {cards.length}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          <span>Mastery Progress</span>
          <span>{masteredCount} of {cards.length} Mastered ({progressPercent}%)</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* 3D Flip Card */}
      <div
        className={`flashcard-wrapper ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front">
            <div style={{ fontSize: "0.78rem", color: "var(--accent-primary)", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
              Question / Prompt
            </div>
            <div className="flashcard-text">{current.q}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "20px" }}>
              💡 Click card to reveal answer
            </div>
          </div>

          <div className="flashcard-face flashcard-back">
            <div style={{ fontSize: "0.78rem", color: "var(--success)", fontWeight: 700, textTransform: "uppercase", marginBottom: "12px" }}>
              Answer Definition
            </div>
            <div className="flashcard-text" style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: "1.4rem" }}>
              {current.a}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "14px", maxWidth: "80%" }}>
              "{current.fullContext}"
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
        <button className="btn btn-secondary" onClick={() => go(-1)}>
          ⬅️ Previous
        </button>

        <button
          className={`btn ${mastered[index] ? "btn-secondary" : ""}`}
          onClick={toggleMastery}
          style={{
            borderColor: mastered[index] ? "var(--success)" : undefined,
            color: mastered[index] ? "var(--success)" : undefined
          }}
        >
          {mastered[index] ? "✅ Mastered" : "⭐ Mark as Mastered"}
        </button>

        <button className="btn" onClick={() => go(1)}>
          Next ➡️
        </button>
      </div>
    </section>
  );
}