import { useState } from "react";

export default function Quiz({ questions = [] }) {
  const [current, setCurrent] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [done, setDone] = useState(false);

  if (!questions || !questions.length) {
    return (
      <section className="card">
        <p>No quiz questions generated.</p>
      </section>
    );
  }

  const q = questions[current];

  const choose = (option) => {
    if (picked) return;
    setPicked(option);
    if (option === q.answer) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const nextS = s + 1;
        if (nextS > maxStreak) setMaxStreak(nextS);
        return nextS;
      });
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (current + 1 === questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setCurrent(0);
    setPicked(null);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setDone(false);
  };

  if (done) {
    const percentage = Math.round((score / questions.length) * 100);
    let medal = "🥇 Excellent!";
    if (percentage < 60) medal = "📚 Keep Practicing!";
    else if (percentage < 80) medal = "🥈 Good Job!";

    return (
      <section className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎉</div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Quiz Completed!</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>{medal}</p>

        <div style={{ display: "flex", justifyContent: "center", gap: "24px", margin: "24px 0" }}>
          <div className="stat-box">
            <div className="stat-val">{score} / {questions.length}</div>
            <div className="stat-lbl">Final Score ({percentage}%)</div>
          </div>

          <div className="stat-box">
            <div className="stat-val">🔥 {maxStreak}</div>
            <div className="stat-lbl">Best Streak</div>
          </div>
        </div>

        <button className="btn" onClick={restart}>
          🔄 Retake Quiz
        </button>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">🧩 Gamified Quiz Arena</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: "4px" }}>
            Test your comprehension with instant feedback.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--warning)" }}>
            🔥 Streak: {streak}
          </span>
          <span className="badge">
            Q{current + 1} of {questions.length}
          </span>
        </div>
      </div>

      <div style={{ margin: "16px 0 20px" }}>
        <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.5 }}>
          {q.question}
        </p>
      </div>

      <div>
        {q.options.map((opt, i) => {
          let stateCls = "";
          if (picked) {
            if (opt === q.answer) stateCls = "correct";
            else if (opt === picked) stateCls = "wrong";
          }

          return (
            <button
              key={i}
              className={`quiz-option ${stateCls}`}
              onClick={() => choose(opt)}
              disabled={!!picked}
            >
              <span>{opt}</span>
              {picked && opt === q.answer && <span>✅</span>}
              {picked && opt === picked && opt !== q.answer && <span>❌</span>}
            </button>
          );
        })}
      </div>

      {picked && (
        <div style={{ marginTop: "16px", animation: "fadeIn 0.2s ease" }}>
          <div
            style={{
              padding: "14px 16px",
              background: "var(--bg-input)",
              borderLeft: `4px solid ${picked === q.answer ? "var(--success)" : "var(--danger)"}`,
              borderRadius: "var(--radius-sm)",
              marginBottom: "16px"
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "4px", color: picked === q.answer ? "var(--success)" : "var(--danger)" }}>
              {picked === q.answer ? "Correct Choice!" : "Incorrect"}
            </div>
            <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              {q.explanation}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn" onClick={next}>
              {current + 1 === questions.length ? "Finish Quiz 🏆" : "Next Question ➡️"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}