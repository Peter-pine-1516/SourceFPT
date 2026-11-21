export const USERS_KEY = "prm393_users_v1";
export const SESSION_KEY = "prm393_session_v1";
export const GLOBAL_THEME_KEY = "prm393_theme_v1";

export function progressStorageKey(usernameKey) {
  return `prm393_progress_v1_${usernameKey}`;
}

export function prefsStorageKey(usernameKey) {
  return `prm393_prefs_v1_${usernameKey}`;
}

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

export function loadGlobalTheme() {
  try {
    return localStorage.getItem(GLOBAL_THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function saveGlobalTheme(theme) {
  try {
    localStorage.setItem(GLOBAL_THEME_KEY, theme);
  } catch {
    // ignore quota errors
  }
}

export function loadUsers() {
  return readJson(USERS_KEY, {});
}

export function saveUsers(users) {
  return writeJson(USERS_KEY, users);
}

export function loadSessionUserKey() {
  const sess = readJson(SESSION_KEY, null);
  if (!sess || typeof sess.usernameKey !== "string") return null;
  const users = loadUsers();
  return users[sess.usernameKey] ? sess.usernameKey : null;
}

export function saveSessionUserKey(usernameKey) {
  if (!usernameKey) {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    return;
  }
  writeJson(SESSION_KEY, { usernameKey });
}

export function loadUserProgress(usernameKey) {
  if (!usernameKey) return {};
  const raw = readJson(progressStorageKey(usernameKey), { answers: {} });
  if (!raw || typeof raw.answers !== "object" || raw.answers === null || Array.isArray(raw.answers)) {
    return {};
  }
  return raw.answers;
}

export function saveUserProgress(usernameKey, answers) {
  if (!usernameKey) return false;
  return writeJson(progressStorageKey(usernameKey), { answers });
}

export function loadUserPrefs(usernameKey) {
  if (!usernameKey) return {};
  return readJson(prefsStorageKey(usernameKey), {});
}

export function saveUserPrefs(usernameKey, prefs) {
  if (!usernameKey) return false;
  return writeJson(prefsStorageKey(usernameKey), prefs);
}

export async function hashPassword(password, usernameKey) {
  const payload = `prm393_salt_v1:${usernameKey}:${password}`;
  if (window.crypto && window.crypto.subtle) {
    const data = new TextEncoder().encode(payload);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback đồng nhất khi không có Web Crypto (ví dụ HTTP qua IP LAN)
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

export async function registerUser({ username, displayName, password, confirmPassword }) {
  const rawUsername = username.trim();
  const cleanDisplayName = displayName.trim();

  if (!/^[a-zA-Z0-9._-]{3,24}$/.test(rawUsername)) {
    return {
      ok: false,
      error:
        "Tên đăng nhập phải dài 3-24 ký tự và chỉ gồm chữ cái, chữ số, dấu chấm (.), gạch dưới (_) hoặc gạch ngang (-).",
    };
  }

  if (password.length < 4) {
    return { ok: false, error: "Mật khẩu phải có ít nhất 4 ký tự." };
  }

  if (password !== confirmPassword) {
    return { ok: false, error: "Mật khẩu xác nhận không khớp." };
  }

  const usernameKey = rawUsername.toLowerCase();
  const users = loadUsers();
  if (users[usernameKey]) {
    return { ok: false, error: "Tên đăng nhập này đã được đăng ký trên thiết bị." };
  }

  const passwordHash = await hashPassword(password, usernameKey);
  const user = {
    username: rawUsername,
    displayName: cleanDisplayName || rawUsername,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users[usernameKey] = user;
  if (!saveUsers(users)) {
    return { ok: false, error: "Không thể lưu tài khoản vào bộ nhớ đệm trình duyệt." };
  }

  saveSessionUserKey(usernameKey);
  return { ok: true, usernameKey, user };
}

export async function loginUser({ username, password }) {
  const rawUsername = username.trim();
  if (!rawUsername || !password) {
    return { ok: false, error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." };
  }

  const usernameKey = rawUsername.toLowerCase();
  const users = loadUsers();
  const user = users[usernameKey];
  if (!user) {
    return { ok: false, error: "Tài khoản không tồn tại trên thiết bị này." };
  }

  const passHash = await hashPassword(password, usernameKey);
  if (passHash !== user.passwordHash) {
    return { ok: false, error: "Sai tên đăng nhập hoặc mật khẩu." };
  }

  saveSessionUserKey(usernameKey);
  return { ok: true, usernameKey, user };
}
