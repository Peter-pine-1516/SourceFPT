import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AuthView } from "./components/AuthView";
import { QuestionCard } from "./components/QuestionCard";
import { StudyGuide } from "./components/StudyGuide";
import {
  buildQuestionBank,
  computeExamStats,
  getDisplayedOptions,
  getFilteredQuestions,
  parseStudyGuide,
  shuffleArray,
} from "./lib/quiz";
import {
  loadGlobalTheme,
  loadSessionUserKey,
  loadUserPrefs,
  loadUserProgress,
  loadUsers,
  progressStorageKey,
  saveGlobalTheme,
  saveSessionUserKey,
  saveUserPrefs,
  saveUserProgress,
  SESSION_KEY,
} from "./lib/storage";

const KEY_TO_INDEX = {
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
  "6": 5,
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
};

export function App() {
  const [theme, setTheme] = useState(() => loadGlobalTheme());
  const [session, setSession] = useState(() => {
    const key = loadSessionUserKey();
    if (!key) return null;
    const users = loadUsers();
    return users[key] ? { usernameKey: key, user: users[key] } : null;
  });

  const [answers, setAnswers] = useState(() =>
    session ? loadUserProgress(session.usernameKey) : {}
  );
  const [prefs, setPrefs] = useState(() => {
    const p = session ? loadUserPrefs(session.usernameKey) : {};
    return {
      examId: p.examId || "guide",
      viewMode: p.viewMode === "list" ? "list" : "single",
      shuffleQuestions: Boolean(p.shuffleQuestions),
      shuffleOptions: Boolean(p.shuffleOptions),
    };
  });

  const [bankData, setBankData] = useState(null);
  const [guideMarkdown, setGuideMarkdown] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [wrongOnly, setWrongOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pendingByUid, setPendingByUid] = useState({});
  const [openImages, setOpenImages] = useState({});
  const [questionOrderMap, setQuestionOrderMap] = useState({});
  const [optionOrderMap, setOptionOrderMap] = useState({});

  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);
  const importInputRef = useRef(null);
  const pendingRef = useRef(pendingByUid);
  pendingRef.current = pendingByUid;
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const showToast = useCallback((message) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 3000);
  }, []);

  // Áp dụng theme sáng/tối
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    saveGlobalTheme(theme);
  }, [theme]);

  // Nạp song song ngân hàng đề và tài liệu lý thuyết 1 lần duy nhất
  useEffect(() => {
    let cancelled = false;
    async function loadStaticData() {
      try {
        const [qRes, gRes] = await Promise.all([
          fetch("/data/questions.json"),
          fetch("/data/TAI_LIEU_ON_TAP_PRM393.md"),
        ]);
        if (!qRes.ok) throw new Error(`Không tải được dữ liệu đề thi (HTTP ${qRes.status})`);
        if (!gRes.ok) throw new Error(`Không tải được tài liệu ôn tập (HTTP ${gRes.status})`);

        const [rawBank, mdText] = await Promise.all([qRes.json(), gRes.text()]);
        if (cancelled) return;

        setBankData(buildQuestionBank(rawBank));
        setGuideMarkdown(mdText);
        setLoadError("");
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Lỗi tải dữ liệu ôn tập.");
        }
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    }
    loadStaticData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Đồng bộ dữ liệu nếu người dùng mở nhiều tab cùng lúc
  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === SESSION_KEY) {
        const nextKey = loadSessionUserKey();
        if (!nextKey) {
          setSession(null);
          setAnswers({});
          return;
        }
        const users = loadUsers();
        if (users[nextKey]) {
          setSession({ usernameKey: nextKey, user: users[nextKey] });
          setAnswers(loadUserProgress(nextKey));
        }
        return;
      }

      if (session && e.key === progressStorageKey(session.usernameKey)) {
        setAnswers(loadUserProgress(session.usernameKey));
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [session]);

  const updatePrefs = useCallback(
    (updater) => {
      setPrefs((prev) => {
        const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
        if (session) {
          saveUserPrefs(session.usernameKey, { ...next, theme });
        }
        return next;
      });
    },
    [session, theme]
  );

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (session) {
        saveUserPrefs(session.usernameKey, { ...prefsRef.current, theme: next });
      }
      return next;
    });
  }, [session]);

  const handleAuthSuccess = useCallback(
    (usernameKey, user, welcomeMsg) => {
      const savedPrefs = loadUserPrefs(usernameKey);
      setSession({ usernameKey, user });
      setAnswers(loadUserProgress(usernameKey));
      setPrefs({
        examId: savedPrefs.examId || "guide",
        viewMode: savedPrefs.viewMode === "list" ? "list" : "single",
        shuffleQuestions: Boolean(savedPrefs.shuffleQuestions),
        shuffleOptions: Boolean(savedPrefs.shuffleOptions),
      });
      if (savedPrefs.theme === "dark" || savedPrefs.theme === "light") {
        setTheme(savedPrefs.theme);
      }
      setWrongOnly(false);
      setSearchQuery("");
      setCurrentIndex(0);
      setPendingByUid({});
      setOpenImages({});
      setQuestionOrderMap({});
      setOptionOrderMap({});
      showToast(welcomeMsg);
    },
    [showToast]
  );

  const handleLogout = useCallback(() => {
    saveSessionUserKey(null);
    setSession(null);
    setAnswers({});
    setPendingByUid({});
    setOpenImages({});
    showToast("Đã đăng xuất.");
  }, [showToast]);

  const activeExamId = useMemo(() => {
    if (prefs.examId === "guide") return "guide";
    if (!bankData) return prefs.examId;
    return bankData.exams.some((e) => e.id === prefs.examId)
      ? prefs.examId
      : bankData.exams[0]?.id || "guide";
  }, [prefs.examId, bankData]);

  const currentExam = useMemo(() => {
    if (!bankData || activeExamId === "guide") return null;
    return bankData.exams.find((e) => e.id === activeExamId) || null;
  }, [bankData, activeExamId]);

  const stats = useMemo(() => {
    if (!bankData || !currentExam) {
      return { correct: 0, wrong: 0, answered: 0, total: 0, accuracyPercent: 0 };
    }
    return computeExamStats(currentExam, bankData.questionsByUid, answers);
  }, [bankData, currentExam, answers]);

  const filteredQuestions = useMemo(() => {
    if (!bankData || !currentExam) return [];
    return getFilteredQuestions(currentExam, bankData.questionsByUid, answers, {
      wrongOnly,
      searchQuery: deferredSearch,
    });
  }, [bankData, currentExam, answers, wrongOnly, deferredSearch]);

  const orderedQuestions = useMemo(() => {
    if (!prefs.shuffleQuestions || !currentExam) return filteredQuestions;
    const savedOrder = questionOrderMap[currentExam.id];
    if (!Array.isArray(savedOrder)) return filteredQuestions;
    const rank = new Map(savedOrder.map((uid, idx) => [uid, idx]));
    return filteredQuestions
      .slice()
      .sort((a, b) => (rank.get(a.uid) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.uid) ?? Number.MAX_SAFE_INTEGER));
  }, [filteredQuestions, prefs.shuffleQuestions, currentExam, questionOrderMap]);

  const parsedGuide = useMemo(() => {
    if (activeExamId !== "guide") return { blocks: [], toc: [] };
    return parseStudyGuide(guideMarkdown, deferredSearch);
  }, [activeExamId, guideMarkdown, deferredSearch]);

  // Đảm bảo thứ tự trộn câu & trộn đáp án được sinh khi bật tính năng
  useEffect(() => {
    if (!prefs.shuffleQuestions || !currentExam) return;
    setQuestionOrderMap((prev) => {
      if (Array.isArray(prev[currentExam.id])) return prev;
      return { ...prev, [currentExam.id]: shuffleArray(currentExam.questionUids) };
    });
  }, [prefs.shuffleQuestions, currentExam]);

  useEffect(() => {
    if (!prefs.shuffleOptions || !bankData) return;
    setOptionOrderMap((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      const next = {};
      for (const [uid, q] of bankData.questionsByUid.entries()) {
        next[uid] = shuffleArray(Object.keys(q.options).sort());
      }
      return next;
    });
  }, [prefs.shuffleOptions, bankData]);

  const safeCurrentIndex =
    orderedQuestions.length === 0
      ? 0
      : Math.min(currentIndex, orderedQuestions.length - 1);

  const handleSelectOption = useCallback(
    (q, origKey) => {
      if (!session || q.attempt) return;
      const need = q.chooseCount || 1;

      if (need === 1) {
        const picked = [String(origKey).trim().toUpperCase()];
        const nextAns = { ...answersRef.current, [q.uid]: picked };
        saveUserProgress(session.usernameKey, nextAns);
        setAnswers(nextAns);
        return;
      }

      const cur = new Set(pendingRef.current[q.uid] || []);
      if (cur.has(origKey)) cur.delete(origKey);
      else cur.add(origKey);
      const arr = Array.from(cur);

      if (arr.length < need) {
        setPendingByUid((prev) => ({ ...prev, [q.uid]: arr }));
        return;
      }

      const normalized = Array.from(
        new Set(arr.map((s) => String(s).trim().toUpperCase()))
      ).sort();

      const nextAns = { ...answersRef.current, [q.uid]: normalized };
      saveUserProgress(session.usernameKey, nextAns);
      setAnswers(nextAns);
      setPendingByUid((prev) => {
        const nextPending = { ...prev };
        delete nextPending[q.uid];
        return nextPending;
      });
    },
    [session]
  );

  const handleResetQuestion = useCallback(
    (uid) => {
      if (!session) return;
      const nextAns = { ...answersRef.current };
      delete nextAns[uid];
      saveUserProgress(session.usernameKey, nextAns);
      setAnswers(nextAns);
      setPendingByUid((prev) => {
        if (!(uid in prev)) return prev;
        const next = { ...prev };
        delete next[uid];
        return next;
      });
    },
    [session]
  );

  const handleToggleImage = useCallback((uid) => {
    setOpenImages((prev) => ({ ...prev, [uid]: !prev[uid] }));
  }, []);

  const handleResetExam = useCallback(() => {
    if (!session || !currentExam || stats.answered === 0) return;
    if (!window.confirm(`Xoá kết quả đã làm (${stats.answered} câu) của "${currentExam.title}"?`)) {
      return;
    }

    const nextAns = { ...answersRef.current };
    for (const uid of currentExam.questionUids) {
      delete nextAns[uid];
    }
    saveUserProgress(session.usernameKey, nextAns);
    setAnswers(nextAns);
    setPendingByUid({});
    setWrongOnly(false);
    setCurrentIndex(0);
    showToast(`Đã đặt lại tiến độ của "${currentExam.shortTitle}".`);
  }, [session, currentExam, stats.answered, showToast]);

  const handleExportProgress = useCallback(() => {
    if (!session) return;
    const payload = {
      version: 1,
      username: session.user.username,
      exportedAt: new Date().toISOString(),
      answers,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prm393-progress-${session.usernameKey}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Đã xuất file sao lưu tiến độ.");
  }, [session, answers, showToast]);

  const handleImportProgressChange = useCallback(
    (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file || !session || !bankData) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || "{}"));
          const rawAnswers = parsed && typeof parsed.answers === "object" ? parsed.answers : null;
          if (!rawAnswers || Array.isArray(rawAnswers)) {
            throw new Error("Cấu trúc file JSON không hợp lệ.");
          }

          const sanitized = {};
          for (const [uid, picked] of Object.entries(rawAnswers)) {
            if (!bankData.questionsByUid.has(uid) || !Array.isArray(picked)) continue;
            const cleanPicked = Array.from(
              new Set(picked.map((x) => String(x).trim().toUpperCase()).filter(Boolean))
            ).sort();
            if (cleanPicked.length > 0) sanitized[uid] = cleanPicked;
          }

          const importCount = Object.keys(sanitized).length;
          const existingCount = Object.keys(answers).length;
          if (
            existingCount > 0 &&
            !window.confirm(
              `Thay thế tiến độ hiện tại (${existingCount} câu) bằng file nhập (${importCount} câu)?`
            )
          ) {
            return;
          }

          saveUserProgress(session.usernameKey, sanitized);
          setAnswers(sanitized);
          setPendingByUid({});
          showToast(`Đã khôi phục tiến độ (${importCount} câu đã làm).`);
        } catch (err) {
          showToast(`Lỗi nhập tiến độ: ${err instanceof Error ? err.message : "File không hợp lệ."}`);
        }
      };
      reader.readAsText(file);
    },
    [session, bankData, answers, showToast]
  );

  // Phím tắt 1-4 / A-D và Trái / Phải ở chế độ từng câu
  useEffect(() => {
    if (!session || activeExamId === "guide" || prefs.viewMode !== "single") return;

    function handleKeyDown(e) {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (orderedQuestions.length === 0) return;
      const q = orderedQuestions[safeCurrentIndex];
      if (!q) return;

      const key = e.key.toUpperCase();
      const dispOpts = getDisplayedOptions(q, prefs.shuffleOptions, optionOrderMap);
      if (key in KEY_TO_INDEX && dispOpts[KEY_TO_INDEX[key]]) {
        e.preventDefault();
        handleSelectOption(q, dispOpts[KEY_TO_INDEX[key]].origKey);
        return;
      }

      if (e.key === "ArrowRight" || e.key === " ") {
        if (safeCurrentIndex < orderedQuestions.length - 1) {
          e.preventDefault();
          setCurrentIndex(safeCurrentIndex + 1);
        }
      } else if (e.key === "ArrowLeft") {
        if (safeCurrentIndex > 0) {
          e.preventDefault();
          setCurrentIndex(safeCurrentIndex - 1);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    session,
    activeExamId,
    prefs.viewMode,
    prefs.shuffleOptions,
    orderedQuestions,
    safeCurrentIndex,
    optionOrderMap,
    handleSelectOption,
  ]);

  if (!session) {
    const hasUsers = Object.keys(loadUsers()).length > 0;
    return (
      <>
        <AuthView
          defaultTab={hasUsers ? "login" : "register"}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onAuthSuccess={handleAuthSuccess}
        />
        {toast ? (
          <div className="status-toast" role="status" aria-live="polite">
            {toast}
          </div>
        ) : null}
      </>
    );
  }

  const isGuide = activeExamId === "guide";

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-row">
            <div className="brand">
              <span className="brand-title">PRM393 FE</span>
              <span className="brand-badge">5 bộ đề SP26 &amp; SU26</span>
              <span className="brand-sub">Làm câu nào chấm ngay câu đó</span>
            </div>

            <div className="topbar-right">
              <div className="stats-bar">
                {isGuide ? (
                  <span className="stat-item">
                    Tóm tắt toàn bộ <strong>158 khái niệm</strong> từ 5 bộ đề PRM393 FE
                  </span>
                ) : (
                  <>
                    <span className="stat-item stat-correct">
                      Đúng: <strong>{stats.correct}</strong>
                    </span>
                    <span className="stat-item stat-wrong">
                      Sai: <strong>{stats.wrong}</strong>
                    </span>
                    <span className="stat-item">
                      Đã làm: <strong>{stats.answered}/{stats.total}</strong>
                    </span>
                    <span className="stat-item">
                      Chính xác: <strong>{stats.accuracyPercent}%</strong>
                    </span>
                  </>
                )}
              </div>

              <div className="user-bar">
                <span className="user-name">{session.user.displayName || session.user.username}</span>
                <button
                  type="button"
                  className="chip-btn"
                  onClick={handleExportProgress}
                  title="Tải xuống file JSON sao lưu tiến độ"
                >
                  Xuất tiến độ
                </button>
                <button
                  type="button"
                  className="chip-btn"
                  onClick={() => importInputRef.current && importInputRef.current.click()}
                  title="Khôi phục tiến độ từ file JSON"
                >
                  Nhập tiến độ
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".json,application/json"
                  hidden
                  onChange={handleImportProgressChange}
                />
                <button type="button" className="chip-btn danger" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          <div className="topbar-row">
            <nav className="exam-tabs" aria-label="Chọn bộ đề">
              <button
                type="button"
                className={`tab-btn${isGuide ? " active" : ""}`}
                onClick={() => {
                  updatePrefs({ examId: "guide" });
                }}
              >
                Lý thuyết<span className="tab-count">12 chương</span>
              </button>

              {(bankData ? bankData.exams : []).map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  className={`tab-btn${ex.id === activeExamId ? " active" : ""}`}
                  onClick={() => {
                    updatePrefs({ examId: ex.id });
                    setCurrentIndex(0);
                    setWrongOnly(false);
                  }}
                >
                  {ex.shortTitle}
                  <span className="tab-count">{ex.questionUids.length}</span>
                </button>
              ))}
            </nav>

            <div className="toolbar-controls">
              {!isGuide ? (
                <>
                  <button
                    type="button"
                    className={`chip-btn${prefs.viewMode === "list" ? " active" : ""}`}
                    onClick={() =>
                      updatePrefs((prev) => ({
                        ...prev,
                        viewMode: prev.viewMode === "single" ? "list" : "single",
                      }))
                    }
                    title="Đổi chế độ hiển thị"
                  >
                    {prefs.viewMode === "single" ? "Chế độ: Từng câu" : "Chế độ: Danh sách"}
                  </button>

                  <button
                    type="button"
                    className={`chip-btn${wrongOnly ? " active" : ""}`}
                    onClick={() => {
                      setWrongOnly((prev) => !prev);
                      setCurrentIndex(0);
                    }}
                    title="Chỉ hiện các câu đã chọn sai"
                  >
                    Câu sai ({stats.wrong})
                  </button>

                  <button
                    type="button"
                    className={`chip-btn${prefs.shuffleQuestions ? " active" : ""}`}
                    onClick={() => {
                      setQuestionOrderMap({});
                      setCurrentIndex(0);
                      updatePrefs((prev) => ({
                        ...prev,
                        shuffleQuestions: !prev.shuffleQuestions,
                      }));
                    }}
                    title="Xáo trộn thứ tự câu hỏi"
                  >
                    Trộn câu
                  </button>

                  <button
                    type="button"
                    className={`chip-btn${prefs.shuffleOptions ? " active" : ""}`}
                    onClick={() => {
                      setOptionOrderMap({});
                      updatePrefs((prev) => ({
                        ...prev,
                        shuffleOptions: !prev.shuffleOptions,
                      }));
                    }}
                    title="Xáo trộn vị trí đáp án A/B/C/D"
                  >
                    Trộn đáp án
                  </button>

                  <button
                    type="button"
                    className="chip-btn danger"
                    onClick={handleResetExam}
                    title="Xoá kết quả đã làm của bộ đề hiện tại"
                  >
                    Làm lại
                  </button>
                </>
              ) : null}

              <button
                type="button"
                className="chip-btn"
                onClick={handleToggleTheme}
                title="Đổi giao diện Sáng / Tối"
              >
                {theme === "dark" ? "Giao diện: Sáng" : "Giao diện: Tối"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="questions-col">
          {isLoadingData ? (
            <div className="empty-state">Đang tải dữ liệu ôn tập...</div>
          ) : loadError ? (
            <div className="empty-state">Lỗi tải dữ liệu: {loadError}</div>
          ) : isGuide ? (
            <StudyGuide blocks={parsedGuide.blocks} />
          ) : orderedQuestions.length === 0 ? (
            <div className="empty-state">Không có câu hỏi nào khớp bộ lọc hiện tại.</div>
          ) : prefs.viewMode === "single" ? (
            <>
              <QuestionCard
                question={orderedQuestions[safeCurrentIndex]}
                indexInList={safeCurrentIndex}
                totalInList={orderedQuestions.length}
                displayedOptions={getDisplayedOptions(
                  orderedQuestions[safeCurrentIndex],
                  prefs.shuffleOptions,
                  optionOrderMap
                )}
                pendingPicked={pendingByUid[orderedQuestions[safeCurrentIndex].uid]}
                isImageOpen={Boolean(openImages[orderedQuestions[safeCurrentIndex].uid])}
                onSelectOption={handleSelectOption}
                onResetQuestion={handleResetQuestion}
                onToggleImage={handleToggleImage}
              />
              <div className="single-nav">
                <button
                  type="button"
                  className="nav-btn"
                  disabled={safeCurrentIndex === 0}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                >
                  Câu trước
                </button>
                <button
                  type="button"
                  className="nav-btn"
                  disabled={safeCurrentIndex >= orderedQuestions.length - 1}
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(orderedQuestions.length - 1, i + 1))
                  }
                >
                  Câu tiếp
                </button>
              </div>
            </>
          ) : (
            orderedQuestions.map((q, idx) => (
              <QuestionCard
                key={q.uid}
                question={q}
                indexInList={idx}
                totalInList={orderedQuestions.length}
                displayedOptions={getDisplayedOptions(q, prefs.shuffleOptions, optionOrderMap)}
                pendingPicked={pendingByUid[q.uid]}
                isImageOpen={Boolean(openImages[q.uid])}
                onSelectOption={handleSelectOption}
                onResetQuestion={handleResetQuestion}
                onToggleImage={handleToggleImage}
              />
            ))
          )}
        </section>

        <aside className="sidebar">
          <input
            type="search"
            className="search-input"
            placeholder="Tìm từ khoá câu hỏi / đáp án..."
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentIndex(0);
            }}
          />

          <div className="palette-title">
            <span>{isGuide ? "Mục lục nhanh" : "Danh sách câu"}</span>
            <span>{isGuide ? `${parsedGuide.toc.length} mục` : `${orderedQuestions.length} câu`}</span>
          </div>

          {isGuide ? (
            <div className="toc-list">
              {parsedGuide.toc.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="toc-btn"
                  onClick={() => {
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  {item.title}
                </button>
              ))}
            </div>
          ) : (
            <div className="palette-grid">
              {orderedQuestions.map((q, idx) => {
                let cls = "p-cell";
                if (q.attempt) {
                  cls += q.attempt.isCorrect ? " p-correct" : " p-wrong";
                }
                if (prefs.viewMode === "single" && idx === safeCurrentIndex) {
                  cls += " p-current";
                }

                return (
                  <button
                    key={q.uid}
                    type="button"
                    className={cls}
                    onClick={() => {
                      setCurrentIndex(idx);
                      if (prefs.viewMode === "list") {
                        const el = document.getElementById(`qcard-${q.uid}`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          )}

          {!isGuide && prefs.viewMode === "single" ? (
            <div className="shortcut-hint">
              Phím tắt: <b>1-4</b> hoặc <b>A-D</b> để chọn | Phím mũi tên <b>Trái / Phải</b> để chuyển câu
            </div>
          ) : null}
        </aside>
      </main>

      {toast ? (
        <div className="status-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </>
  );
}
