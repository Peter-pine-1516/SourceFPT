import { memo } from "react";

const EMPTY_LIST = [];

export const QuestionCard = memo(function QuestionCard({
  question,
  indexInList,
  totalInList,
  displayedOptions,
  pendingPicked,
  isImageOpen,
  onSelectOption,
  onResetQuestion,
  onToggleImage,
}) {
  const attempt = question.attempt;
  const pending = pendingPicked || EMPTY_LIST;
  const need = question.chooseCount || 1;

  const origToDisplay = {};
  for (const o of displayedOptions) {
    origToDisplay[o.origKey] = o.displayLabel;
  }

  const sourceLabel =
    question.sources && question.sources.length > 1
      ? `${question.sources[0]} - lặp ${question.sources.length} đề`
      : `${question.examTitle} - #${question.number}`;

  const correctLabels = attempt
    ? attempt.correctAnswer.map((k) => origToDisplay[k] || k).join(", ")
    : "";

  return (
    <article className="q-card" id={`qcard-${question.uid}`}>
      <div className="q-meta">
        <div className="q-meta-left">
          <span className="q-num">
            Câu {indexInList + 1}/{totalInList}
          </span>
          <span className="q-badge" title={(question.sources || []).join(", ")}>
            {sourceLabel}
          </span>
          {need > 1 ? <span className="q-badge multi">Chọn {need} đáp án</span> : null}
        </div>
      </div>

      <div className="q-stem">{question.question}</div>

      {question.code ? (
        <pre className="q-code">
          <code>{question.code}</code>
        </pre>
      ) : null}

      {question.image ? (
        <div className="q-figure">
          <img src={question.image} alt={`Minh hoạ câu ${question.number}`} loading="lazy" />
        </div>
      ) : null}

      <div className="options-list">
        {displayedOptions.map((opt) => {
          let cls = "opt-btn";
          let mark = "";

          if (attempt) {
            const isTrue = attempt.correctAnswer.includes(opt.origKey);
            const wasPicked = attempt.picked.includes(opt.origKey);
            if (isTrue) {
              cls += " is-correct";
              mark = "Đúng";
            } else if (wasPicked) {
              cls += " is-wrong";
              mark = "Sai";
            } else {
              cls += " is-dimmed";
            }
          } else if (pending.includes(opt.origKey)) {
            cls += " pending-selected";
            mark = "Đã chọn";
          }

          return (
            <button
              key={opt.origKey}
              type="button"
              className={cls}
              disabled={Boolean(attempt)}
              onClick={() => onSelectOption(question, opt.origKey)}
            >
              <span className="opt-key">{opt.displayLabel}</span>
              <span className="opt-text">{opt.text}</span>
              {mark ? <span className="opt-mark">{mark}</span> : null}
            </button>
          );
        })}
      </div>

      {attempt ? (
        <div className={`feedback ${attempt.isCorrect ? "fb-correct" : "fb-wrong"}`}>
          <div className="fb-header">
            <span className={attempt.isCorrect ? "fb-status-correct" : "fb-status-wrong"}>
              {attempt.isCorrect ? "Chính xác" : `Chưa đúng — Đáp án đúng: ${correctLabels}`}
            </span>
          </div>
          {attempt.explanation ? <div className="fb-explain">{attempt.explanation}</div> : null}
          <div className="fb-actions">
            <button
              type="button"
              className="text-link"
              onClick={() => onResetQuestion(question.uid)}
            >
              Làm lại câu này
            </button>
            <button
              type="button"
              className="text-link"
              onClick={() => onToggleImage(question.uid)}
            >
              {isImageOpen ? "Ẩn ảnh đề gốc" : "Xem ảnh đề gốc"}
            </button>
          </div>
          {isImageOpen ? (
            <div className="orig-img-wrap">
              <a
                href={attempt.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="orig-img-link"
                title="Mở ảnh gốc kích thước đầy đủ trong tab mới"
              >
                <img
                  src={attempt.imageUrl}
                  alt={`Ảnh gốc câu ${question.number}`}
                  loading="lazy"
                />
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
});
