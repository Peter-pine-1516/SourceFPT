(function () {
  "use strict";

  const UI_PREF_KEY = "prm393_rust_ui_prefs_v1";
  let prefs = {};
  try {
    prefs = JSON.parse(localStorage.getItem(UI_PREF_KEY) || "{}") || {};
  } catch (_) {
    prefs = {};
  }

  const state = {
    exams: [],
    examId: prefs.examId || "sp26-b5-fe",
    examTitle: "",
    stats: { correct: 0, wrong: 0, answered: 0, total: 0, accuracyPercent: 0 },
    questions: [],
    viewMode: prefs.viewMode || "single",
    wrongOnly: false,
    shuffleQuestions: Boolean(prefs.shuffleQuestions),
    shuffleOptions: Boolean(prefs.shuffleOptions),
    theme: prefs.theme || "light",
    searchQuery: "",
    currentIndex: 0,
    pending: {},
    questionOrder: {},
    optionOrder: {},
    openImages: {},
    busyUids: new Set(),
  };

  function savePrefs() {
    try {
      localStorage.setItem(
        UI_PREF_KEY,
        JSON.stringify({
          examId: state.examId,
          viewMode: state.viewMode,
          shuffleQuestions: state.shuffleQuestions,
          shuffleOptions: state.shuffleOptions,
          theme: state.theme,
        })
      );
    } catch (_) {}
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    const btn = document.getElementById("btnTheme");
    if (btn) btn.textContent = state.theme === "dark" ? "☀" : "☾";
  }

  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // =========================================================================
  // Giao tiếp với Backend Rust qua REST API
  // =========================================================================

  async function apiGet(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function apiPost(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function loadExamList() {
    state.exams = await apiGet("/api/exams");
    if (!state.exams.some((e) => e.id === state.examId) && state.exams[0]) {
      state.examId = state.exams[0].id;
    }
  }

  async function loadCurrentExamQuestions() {
    const params = new URLSearchParams();
    if (state.wrongOnly) params.set("wrongOnly", "true");
    if (state.searchQuery.trim()) params.set("search", state.searchQuery.trim());

    const qs = params.toString();
    const url = `/api/exams/${encodeURIComponent(state.examId)}${qs ? `?${qs}` : ""}`;
    const detail = await apiGet(url);

    state.examTitle = detail.title;
    state.stats = detail.stats;
    state.questions = detail.questions;
    render();
  }

  function getOrderedQuestions() {
    let list = state.questions.slice();
    if (state.shuffleQuestions) {
      if (
        !state.questionOrder[state.examId] ||
        state.questionOrder[state.examId].length !== list.length
      ) {
        state.questionOrder[state.examId] = shuffleArray(list.map((q) => q.uid));
      }
      const rank = new Map(state.questionOrder[state.examId].map((uid, idx) => [uid, idx]));
      list.sort((a, b) => (rank.get(a.uid) ?? 0) - (rank.get(b.uid) ?? 0));
    }
    return list;
  }

  function getDisplayedOptions(q) {
    const origKeys = Object.keys(q.options);
    const displayLabels = ["A", "B", "C", "D", "E", "F"];
    let orderedOrigKeys = origKeys;

    if (state.shuffleOptions) {
      if (!state.optionOrder[q.uid]) {
        state.optionOrder[q.uid] = shuffleArray(origKeys);
      }
      orderedOrigKeys = state.optionOrder[q.uid];
    }

    return orderedOrigKeys.map((origKey, idx) => ({
      origKey,
      displayLabel: displayLabels[idx] || origKey,
      text: q.options[origKey],
    }));
  }

  async function selectOption(q, origKey) {
    if (q.attempt || state.busyUids.has(q.uid)) return;

    const need = q.chooseCount || 1;
    let pickedList = [];

    if (need === 1) {
      pickedList = [origKey];
    } else {
      const cur = new Set(state.pending[q.uid] || []);
      if (cur.has(origKey)) cur.delete(origKey);
      else cur.add(origKey);
      const arr = Array.from(cur);
      if (arr.length < need) {
        state.pending[q.uid] = arr;
        render();
        return;
      }
      delete state.pending[q.uid];
      pickedList = arr;
    }

    // Gửi lựa chọn lên Rust Server để chấm đúng/sai ngay lập tức!
    state.busyUids.add(q.uid);
    try {
      const res = await apiPost("/api/check", {
        examId: state.examId,
        uid: q.uid,
        picked: pickedList,
      });
      q.attempt = res.attempt;
      state.stats = res.stats;
      render();
    } finally {
      state.busyUids.delete(q.uid);
    }
  }

  async function resetSingleQuestion(q) {
    const res = await apiPost("/api/reset-question", {
      examId: state.examId,
      uid: q.uid,
    });
    q.attempt = null;
    delete state.pending[q.uid];
    state.stats = res.stats;
    if (state.wrongOnly) {
      await loadCurrentExamQuestions();
    } else {
      render();
    }
  }

  async function resetCurrentExam() {
    if (state.stats.answered === 0) return;
    if (!window.confirm(`Xoá kết quả đã làm (${state.stats.answered} câu) của "${state.examTitle}"?`)) {
      return;
    }
    await apiPost("/api/reset-exam", { examId: state.examId });
    state.wrongOnly = false;
    state.currentIndex = 0;
    await loadExamList();
    await loadCurrentExamQuestions();
  }

  // =========================================================================
  // Hiển thị giao diện (Render)
  // =========================================================================

  function renderTabs() {
    const wrap = document.getElementById("examTabs");
    wrap.innerHTML = "";
    for (const ex of state.exams) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tab-btn" + (ex.id === state.examId ? " active" : "");
      btn.innerHTML = `${escapeHtml(ex.shortTitle)}<span class="tab-count">${ex.questionCount}</span>`;
      btn.addEventListener("click", async () => {
        state.examId = ex.id;
        state.currentIndex = 0;
        state.wrongOnly = false;
        savePrefs();
        await loadCurrentExamQuestions();
      });
      wrap.appendChild(btn);
    }
  }

  function renderStatsAndControls() {
    const s = state.stats;
    document.getElementById("statsBar").innerHTML = `
      <span class="stat-item stat-correct">Đúng: <strong>${s.correct}</strong></span>
      <span class="stat-item stat-wrong">Sai: <strong>${s.wrong}</strong></span>
      <span class="stat-item">Đã làm: <strong>${s.answered}/${s.total}</strong></span>
      <span class="stat-item">Chính xác: <strong>${s.accuracyPercent}%</strong></span>
    `;

    const btnView = document.getElementById("btnViewMode");
    btnView.textContent = state.viewMode === "single" ? "Chế độ: Từng câu" : "Chế độ: Danh sách";
    btnView.classList.toggle("active", state.viewMode === "list");

    const btnWrong = document.getElementById("btnWrongOnly");
    btnWrong.textContent = `Câu sai (${s.wrong})`;
    btnWrong.classList.toggle("active", state.wrongOnly);

    document.getElementById("btnShuffleQ").classList.toggle("active", state.shuffleQuestions);
    document.getElementById("btnShuffleOpt").classList.toggle("active", state.shuffleOptions);
    document.getElementById("shortcutHint").style.display =
      state.viewMode === "single" ? "block" : "none";
  }

  function buildQuestionCard(q, idxInList, totalInList) {
    const card = document.createElement("article");
    card.className = "q-card";
    card.id = `qcard-${q.uid}`;

    const attempt = q.attempt || null;
    const pendingAns = state.pending[q.uid] || [];
    const dispOpts = getDisplayedOptions(q);
    const need = q.chooseCount || 1;

    const origToDisplay = {};
    for (const o of dispOpts) {
      origToDisplay[o.origKey] = o.displayLabel;
    }

    const sourceLabel =
      q.sources && q.sources.length > 1
        ? `${q.sources[0]} · lặp ${q.sources.length} đề`
        : `${q.examTitle} · #${q.number}`;

    const metaHtml = `
      <div class="q-meta">
        <div class="q-meta-left">
          <span class="q-num">Câu ${idxInList + 1}/${totalInList}</span>
          <span class="q-badge" title="${escapeHtml((q.sources || []).join(", "))}">${escapeHtml(sourceLabel)}</span>
          ${need > 1 ? `<span class="q-badge multi">Chọn ${need} đáp án</span>` : ""}
        </div>
      </div>
    `;

    const stemHtml = `<div class="q-stem">${escapeHtml(q.question)}</div>`;
    const codeHtml = q.code ? `<pre class="q-code"><code>${escapeHtml(q.code)}</code></pre>` : "";

    card.innerHTML = metaHtml + stemHtml + codeHtml;

    const optsWrap = document.createElement("div");
    optsWrap.className = "options-list";

    for (const opt of dispOpts) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt-btn";

      let mark = "";
      if (attempt) {
        btn.disabled = true;
        const isTrue = attempt.correctAnswer.includes(opt.origKey);
        const wasPicked = attempt.picked.includes(opt.origKey);
        if (isTrue) {
          btn.classList.add("is-correct");
          mark = "✓ Đúng";
        } else if (wasPicked && !isTrue) {
          btn.classList.add("is-wrong");
          mark = "✗ Sai";
        } else {
          btn.classList.add("is-dimmed");
        }
      } else if (pendingAns.includes(opt.origKey)) {
        btn.classList.add("pending-selected");
        mark = "Đã chọn";
      }

      btn.innerHTML = `
        <span class="opt-key">${escapeHtml(opt.displayLabel)}</span>
        <span class="opt-text">${escapeHtml(opt.text)}</span>
        ${mark ? `<span class="opt-mark">${mark}</span>` : ""}
      `;

      btn.addEventListener("click", () => selectOption(q, opt.origKey));
      optsWrap.appendChild(btn);
    }

    card.appendChild(optsWrap);

    if (attempt) {
      const ok = attempt.isCorrect;
      const correctLabels = attempt.correctAnswer.map((k) => origToDisplay[k] || k).join(", ");
      const fb = document.createElement("div");
      fb.className = "feedback " + (ok ? "fb-correct" : "fb-wrong");

      const isImgOpen = Boolean(state.openImages[q.uid]);

      fb.innerHTML = `
        <div class="fb-header">
          <span class="${ok ? "fb-status-correct" : "fb-status-wrong"}">
            ${ok ? "✓ Chính xác!" : `✗ Chưa đúng — Đáp án đúng: ${escapeHtml(correctLabels)}`}
          </span>
        </div>
        ${attempt.explanation ? `<div class="fb-explain">${escapeHtml(attempt.explanation)}</div>` : ""}
        <div class="fb-actions">
          <button type="button" class="text-link btn-retry-one">Làm lại câu này</button>
          <button type="button" class="text-link btn-toggle-img">${isImgOpen ? "Ẩn ảnh đề gốc" : "Xem ảnh đề gốc"}</button>
        </div>
        ${
          isImgOpen
            ? `<div class="orig-img-wrap"><img src="${escapeHtml(attempt.imageUrl)}" alt="Ảnh gốc câu ${q.number}" loading="lazy" /></div>`
            : ""
        }
      `;

      fb.querySelector(".btn-retry-one").addEventListener("click", () => resetSingleQuestion(q));
      fb.querySelector(".btn-toggle-img").addEventListener("click", () => {
        state.openImages[q.uid] = !state.openImages[q.uid];
        render();
      });

      card.appendChild(fb);
    }

    return card;
  }

  function renderQuestionsAndPalette() {
    const list = getOrderedQuestions();
    const col = document.getElementById("questionsCol");
    const grid = document.getElementById("paletteGrid");
    const summary = document.getElementById("paletteSummary");

    col.innerHTML = "";
    grid.innerHTML = "";
    summary.textContent = `${list.length} câu`;

    if (list.length === 0) {
      col.innerHTML = `<div class="empty-state">Không có câu hỏi nào khớp bộ lọc hiện tại.</div>`;
      return;
    }

    if (state.currentIndex >= list.length) {
      state.currentIndex = Math.max(0, list.length - 1);
    }

    if (state.viewMode === "single") {
      const q = list[state.currentIndex];
      col.appendChild(buildQuestionCard(q, state.currentIndex, list.length));

      const nav = document.createElement("div");
      nav.className = "single-nav";
      nav.innerHTML = `
        <button type="button" class="nav-btn" id="btnPrev" ${state.currentIndex === 0 ? "disabled" : ""}>← Câu trước</button>
        <button type="button" class="nav-btn" id="btnNext" ${state.currentIndex >= list.length - 1 ? "disabled" : ""}>Câu tiếp →</button>
      `;
      nav.querySelector("#btnPrev").addEventListener("click", () => {
        if (state.currentIndex > 0) {
          state.currentIndex--;
          render();
        }
      });
      nav.querySelector("#btnNext").addEventListener("click", () => {
        if (state.currentIndex < list.length - 1) {
          state.currentIndex++;
          render();
        }
      });
      col.appendChild(nav);
    } else {
      const frag = document.createDocumentFragment();
      list.forEach((q, idx) => {
        frag.appendChild(buildQuestionCard(q, idx, list.length));
      });
      col.appendChild(frag);
    }

    const pFrag = document.createDocumentFragment();
    list.forEach((q, idx) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "p-cell";
      cell.textContent = String(idx + 1);

      if (q.attempt) {
        cell.classList.add(q.attempt.isCorrect ? "p-correct" : "p-wrong");
      }
      if (state.viewMode === "single" && idx === state.currentIndex) {
        cell.classList.add("p-current");
      }

      cell.addEventListener("click", () => {
        state.currentIndex = idx;
        if (state.viewMode === "single") {
          render();
        } else {
          const el = document.getElementById(`qcard-${q.uid}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      pFrag.appendChild(cell);
    });
    grid.appendChild(pFrag);
  }

  function render() {
    applyTheme();
    renderTabs();
    renderStatsAndControls();
    renderQuestionsAndPalette();
  }

  // Sự kiện thanh công cụ
  document.getElementById("btnViewMode").addEventListener("click", () => {
    state.viewMode = state.viewMode === "single" ? "list" : "single";
    savePrefs();
    render();
  });

  document.getElementById("btnWrongOnly").addEventListener("click", async () => {
    state.wrongOnly = !state.wrongOnly;
    state.currentIndex = 0;
    await loadCurrentExamQuestions();
  });

  document.getElementById("btnShuffleQ").addEventListener("click", () => {
    state.shuffleQuestions = !state.shuffleQuestions;
    state.questionOrder = {};
    state.currentIndex = 0;
    savePrefs();
    render();
  });

  document.getElementById("btnShuffleOpt").addEventListener("click", () => {
    state.shuffleOptions = !state.shuffleOptions;
    state.optionOrder = {};
    savePrefs();
    render();
  });

  document.getElementById("btnResetExam").addEventListener("click", resetCurrentExam);

  document.getElementById("btnTheme").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    savePrefs();
    applyTheme();
  });

  let searchTimer = null;
  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.searchQuery = e.target.value || "";
    state.currentIndex = 0;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      loadCurrentExamQuestions();
    }, 150);
  });

  document.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (state.viewMode !== "single") return;

    const list = getOrderedQuestions();
    if (!list.length) return;
    const q = list[state.currentIndex];
    if (!q) return;

    const key = e.key.toUpperCase();
    const dispOpts = getDisplayedOptions(q);
    const keyToIdx = { "1": 0, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

    if (key in keyToIdx && dispOpts[keyToIdx[key]]) {
      e.preventDefault();
      selectOption(q, dispOpts[keyToIdx[key]].origKey);
      return;
    }

    if (e.key === "ArrowRight" || e.key === " ") {
      if (state.currentIndex < list.length - 1) {
        e.preventDefault();
        state.currentIndex++;
        render();
      }
    } else if (e.key === "ArrowLeft") {
      if (state.currentIndex > 0) {
        e.preventDefault();
        state.currentIndex--;
        render();
      }
    }
  });

  // Khởi chạy ban đầu
  applyTheme();
  loadExamList()
    .then(() => loadCurrentExamQuestions())
    .catch((err) => {
      document.getElementById("questionsCol").innerHTML =
        `<div class="empty-state">Không kết nối được tới Rust Server (${escapeHtml(err.message)}). Hãy chạy <code>cargo run</code> trước nhé!</div>`;
    });
})();
