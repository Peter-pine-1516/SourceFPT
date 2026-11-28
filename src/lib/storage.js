export const THEME_KEY = "quiz_theme_v1";

const LEGACY_SESSION_KEY = "prm393_session_v1";
const LEGACY_THEME_KEY = "prm393_theme_v1";
const LEGACY_PREFS_KEY = "prm393_prefs_v1";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // ignore
  }

  const legacyPrefs = readJson(LEGACY_PREFS_KEY, null);
  if (legacyPrefs && (legacyPrefs.theme === "dark" || legacyPrefs.theme === "light")) {
    return legacyPrefs.theme;
  }

  try {
    if (localStorage.getItem(LEGACY_THEME_KEY) === "dark") {
      return "dark";
    }
  } catch {
    // ignore
  }

  return "light";
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme === "dark" ? "dark" : "light");
    return true;
  } catch {
    return false;
  }
}

export function loadProgress(subject) {
  const key = subject.progressKey;
  const direct = readJson(key, null);
  if (
    direct &&
    typeof direct.answers === "object" &&
    direct.answers !== null &&
    !Array.isArray(direct.answers)
  ) {
    return direct.answers;
  }

  if (subject.legacyMigration) {
    // Giữ lại tiến độ nếu người dùng từng đăng nhập cục bộ ở phiên bản trước
    const legacySession = readJson(LEGACY_SESSION_KEY, null);
    if (legacySession && typeof legacySession.usernameKey === "string") {
      const legacyProgress = readJson(`prm393_progress_v1_${legacySession.usernameKey}`, null);
      if (
        legacyProgress &&
        typeof legacyProgress.answers === "object" &&
        legacyProgress.answers !== null &&
        !Array.isArray(legacyProgress.answers)
      ) {
        saveProgress(subject, legacyProgress.answers);
        return legacyProgress.answers;
      }
    }
  }

  return {};
}

export function saveProgress(subject, answers) {
  return writeJson(subject.progressKey, { answers });
}

export function loadSubjectPrefs(subject) {
  const saved = readJson(subject.prefsKey, null);
  if (saved) {
    return {
      examId: saved.examId || subject.defaultExamId,
      viewMode: saved.viewMode === "list" ? "list" : "single",
      shuffleQuestions: Boolean(saved.shuffleQuestions),
      shuffleOptions: Boolean(saved.shuffleOptions),
    };
  }

  return {
    examId: subject.defaultExamId,
    viewMode: "single",
    shuffleQuestions: false,
    shuffleOptions: false,
  };
}

export function saveSubjectPrefs(subject, prefs) {
  return writeJson(subject.prefsKey, prefs);
}
