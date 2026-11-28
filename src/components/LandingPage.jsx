export function LandingPage({ subjects, theme, onToggleTheme, onSelectSubject }) {
  return (
    <div className="landing-shell">
      <button
        type="button"
        className="chip-btn landing-theme-btn"
        onClick={onToggleTheme}
        title="Đổi giao diện Sáng / Tối"
      >
        {theme === "dark" ? "Sáng" : "Tối"}
      </button>

      <main className="landing-grid" aria-label="Chọn môn học">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            type="button"
            className="subject-card"
            onClick={() => onSelectSubject(subject.id)}
          >
            {subject.code}
          </button>
        ))}
      </main>
    </div>
  );
}
