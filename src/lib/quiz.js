const DISPLAY_LABELS = ["A", "B", "C", "D", "E", "F"];
const TABLE_SEP_RE = /^:?-+:?$/;
const UL_RE = /^[-*]\s+/;
const OL_RE = /^\d+\.\s+/;
const FPT_TERM_RANK = { SP: 1, SU: 2, FA: 3 };
const FPT_TERM_RE = /\b(SP|SU|FA)(\d{2})\b/i;

function getFptExamSortTuple(rawExam) {
  const label = `${rawExam.shortTitle || ""} ${rawExam.title || ""} ${rawExam.id || ""}`;
  const match = label.match(FPT_TERM_RE);
  const term = match ? FPT_TERM_RANK[match[1].toUpperCase()] || 99 : 99;
  const year = match ? parseInt(match[2], 10) : 99;

  // Thứ tự chuẩn trong 1 học kỳ FPT:
  // 1. Kỳ chính (10 tuần) - FE
  // 2. Kỳ chính - RE (thi lại sau FE)
  // 3. Block 5 (cuối kỳ) - B5 - FE
  // 4. Block 5 - RE
  const isB5 = /\bB5\b/i.test(label) || /(^|-)b5(-|$)/i.test(rawExam.id || "");
  const isRe = /\bRE\b/i.test(label) || /(^|-)re(-|$)/i.test(rawExam.id || "");
  const stage = (isB5 ? 3 : 1) + (isRe ? 1 : 0);

  return [year, term, stage];
}

function sortExamsChronologically(rawExams) {
  return (rawExams || []).slice().sort((a, b) => {
    const [ya, ta, sa] = getFptExamSortTuple(a);
    const [yb, tb, sb] = getFptExamSortTuple(b);
    if (ya !== yb) return ya - yb;
    if (ta !== tb) return ta - tb;
    if (sa !== sb) return sa - sb;
    return String(a.shortTitle || a.id).localeCompare(String(b.shortTitle || b.id));
  });
}

export function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeText(input) {
  return String(input || "")
    .trim()
    .split(/\s+/)
    .join(" ")
    .toLowerCase();
}

export function buildQuestionBank(raw) {
  const exams = [];
  const questionsByUid = new Map();
  const allUids = [];
  const uniqueIndexByKey = new Map();
  const uniqueQuestions = [];

  for (const rawExam of sortExamsChronologically(raw.exams)) {
    const examUids = [];

    for (const rq of rawExam.questions || []) {
      const sourceTag = `${rawExam.shortTitle} #${rq.number}`;
      const normKey = `${normalizeText(rq.question)}||${normalizeText(rq.code || "")}`;
      const answer = (rq.answer || []).map((a) => String(a).trim().toUpperCase());

      if (uniqueIndexByKey.has(normKey)) {
        const idx = uniqueIndexByKey.get(normKey);
        uniqueQuestions[idx].sources.push(sourceTag);
      } else {
        const nextNum = uniqueQuestions.length + 1;
        const uniqueUid = `unique-q${String(nextNum).padStart(3, "0")}`;
        uniqueIndexByKey.set(normKey, uniqueQuestions.length);

        uniqueQuestions.push({
          uid: uniqueUid,
          number: nextNum,
          examTitle: rawExam.shortTitle,
          folder: rawExam.folder,
          file: rq.file,
          altFile: rq.altFile || null,
          sources: [sourceTag],
          chooseCount: rq.chooseCount || 1,
          question: rq.question,
          code: rq.code || null,
          image: rq.image || null,
          options: rq.options || {},
          answer,
          explanation: rq.explanation || "",
        });
      }

      const record = {
        uid: rq.uid,
        number: rq.number,
        examTitle: rawExam.shortTitle,
        folder: rawExam.folder,
        file: rq.file,
        altFile: rq.altFile || null,
        sources: [sourceTag],
        chooseCount: rq.chooseCount || 1,
        question: rq.question,
        code: rq.code || null,
        image: rq.image || null,
        options: rq.options || {},
        answer,
        explanation: rq.explanation || "",
      };

      examUids.push(record.uid);
      allUids.push(record.uid);
      questionsByUid.set(record.uid, record);
    }

    exams.push({
      id: rawExam.id,
      title: rawExam.title,
      shortTitle: rawExam.shortTitle,
      questionUids: examUids,
    });
  }

  const uniqueUids = [];
  for (const uq of uniqueQuestions) {
    uniqueUids.push(uq.uid);
    questionsByUid.set(uq.uid, uq);
  }

  exams.push({
    id: "unique",
    title: "Tổng hợp không trùng câu",
    shortTitle: "Lọc trùng",
    questionUids: uniqueUids,
  });

  exams.push({
    id: "all",
    title: "Tất cả đề (Gộp nguyên bản)",
    shortTitle: "Tất cả",
    questionUids: allUids,
  });

  return { exams, questionsByUid };
}

export function isAnswerMatch(expected, picked) {
  if (!Array.isArray(expected) || !Array.isArray(picked)) return false;
  if (expected.length !== picked.length) return false;
  const setA = new Set(expected);
  return picked.every((x) => setA.has(x));
}

export function buildImageUrl(q) {
  const filename = q.altFile || q.file;
  return `/images/${encodeURIComponent(q.folder)}/${encodeURIComponent(filename)}`;
}

export function computeExamStats(exam, questionsByUid, answers) {
  if (!exam) {
    return { correct: 0, wrong: 0, answered: 0, total: 0, accuracyPercent: 0 };
  }
  let correct = 0;
  let wrong = 0;

  for (const uid of exam.questionUids) {
    const q = questionsByUid.get(uid);
    const picked = answers[uid];
    if (q && Array.isArray(picked) && picked.length > 0) {
      if (isAnswerMatch(q.answer, picked)) correct++;
      else wrong++;
    }
  }

  const answered = correct + wrong;
  const total = exam.questionUids.length;
  const accuracyPercent = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  return { correct, wrong, answered, total, accuracyPercent };
}

function matchesKeyword(q, kwLower) {
  if (q.question.toLowerCase().includes(kwLower)) return true;
  if (q.code && q.code.toLowerCase().includes(kwLower)) return true;
  return Object.values(q.options).some((text) => String(text).toLowerCase().includes(kwLower));
}

export function getFilteredQuestions(exam, questionsByUid, answers, { wrongOnly, searchQuery }) {
  if (!exam) return [];
  const kwLower = searchQuery.trim().toLowerCase();
  const out = [];

  for (const uid of exam.questionUids) {
    const q = questionsByUid.get(uid);
    if (!q) continue;

    const picked = answers[uid];
    const hasAttempt = Array.isArray(picked) && picked.length > 0;

    if (wrongOnly && (!hasAttempt || isAnswerMatch(q.answer, picked))) {
      continue;
    }

    if (kwLower && !matchesKeyword(q, kwLower)) {
      continue;
    }

    out.push({
      uid: q.uid,
      number: q.number,
      examTitle: q.examTitle,
      sources: q.sources,
      chooseCount: q.chooseCount,
      question: q.question,
      code: q.code,
      image: q.image,
      options: q.options,
      attempt: hasAttempt
        ? {
            picked,
            correctAnswer: q.answer,
            isCorrect: isAnswerMatch(q.answer, picked),
            explanation: q.explanation,
            imageUrl: buildImageUrl(q),
          }
        : null,
    });
  }

  return out;
}

export function getDisplayedOptions(q, shuffleOptions, optionOrderMap) {
  const origKeys = Object.keys(q.options).sort();
  const orderedOrigKeys =
    shuffleOptions && Array.isArray(optionOrderMap[q.uid]) ? optionOrderMap[q.uid] : origKeys;

  return orderedOrigKeys.map((origKey, idx) => ({
    origKey,
    displayLabel: DISPLAY_LABELS[idx] || origKey,
    text: q.options[origKey],
  }));
}

export function parseStudyGuide(markdown, searchQuery) {
  const kw = searchQuery.trim().toLowerCase();
  const lines = String(markdown || "").split(/\r?\n/);

  const toc = [];
  const blocks = [];
  let listType = null;
  let listItems = [];
  let tableRows = [];

  function flushList() {
    if (!listType || listItems.length === 0) return;
    blocks.push({ type: listType, items: listItems });
    listType = null;
    listItems = [];
  }

  function flushTable() {
    if (tableRows.length === 0) return;
    const header = tableRows[0];
    const body = tableRows.slice(1).filter((row) => !row.every((c) => TABLE_SEP_RE.test(c.trim())));
    blocks.push({ type: "table", header, body });
    tableRows = [];
  }

  for (const line of lines) {
    if (kw && line.trim() && !line.startsWith("#") && !line.toLowerCase().includes(kw)) {
      continue;
    }
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      flushList();
      tableRows.push(trimmed.slice(1, -1).split("|").map((c) => c.trim()));
      continue;
    }
    flushTable();

    if (!trimmed || trimmed === "---") {
      flushList();
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      blocks.push({ type: "h1", text: trimmed.slice(2) });
    } else if (trimmed.startsWith("## ")) {
      flushList();
      const title = trimmed.slice(3);
      const id = `chap-${toc.length + 1}`;
      toc.push({ id, title });
      blocks.push({ type: "h2", id, text: title });
    } else if (trimmed.startsWith("### ")) {
      flushList();
      blocks.push({ type: "h3", text: trimmed.slice(4) });
    } else if (trimmed.startsWith("> ")) {
      flushList();
      blocks.push({ type: "blockquote", text: trimmed.slice(2) });
    } else if (UL_RE.test(trimmed)) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(trimmed.replace(UL_RE, ""));
    } else if (OL_RE.test(trimmed)) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listItems.push(trimmed.replace(OL_RE, ""));
    } else {
      flushList();
      blocks.push({ type: "p", text: trimmed });
    }
  }

  flushList();
  flushTable();

  return { blocks, toc };
}
