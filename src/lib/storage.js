export const PROGRESS_KEY = "prm393_progress_v1";
export const PREFS_KEY = "prm393_prefs_v1";

const LEGACY_SESSION_KEY = "prm393_session_v1";
const LEGACY_THEME_KEY = "prm393_theme_v1";

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

export function loadProgress() {
  const direct = readJson(PROGRESS_KEY, null);
  if (direct && typeof direct.answers === "object" && direct.answers !== null && !Array.isArray(direct.answers)) {
    return direct.answers;
  }

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
      saveProgress(legacyProgress.answers);
      return legacyProgress.answers;
    }
  }

  return {};
}

export function saveProgress(answers) {
  return writeJson(PROGRESS_KEY, { answers });
}

export function loadPrefs() {
  const saved = readJson(PREFS_KEY, null);
  if (saved) {
    return {
      examId: saved.examId || "guide",
      viewMode: saved.viewMode === "list" ? "list" : "single",
      shuffleQuestions: Boolean(saved.shuffleQuestions),
      shuffleOptions: Boolean(saved.shuffleOptions),
      theme: saved.theme === "dark" ? "dark" : "light",
    };
  }

  let fallbackTheme = "light";
  try {
    if (localStorage.getItem(LEGACY_THEME_KEY) === "dark") {
      fallbackTheme = "dark";
    }
  } catch {
    // ignore
  }

  return {
    examId: "guide",
    viewMode: "single",
    shuffleQuestions: false,
    shuffleOptions: false,
    theme: fallbackTheme,
  };
}

export function savePrefs(prefs) {
  return writeJson(PREFS_KEY, prefs);
}
