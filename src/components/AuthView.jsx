import { useState } from "react";
import { loginUser, registerUser } from "../lib/storage";

export function AuthView({ defaultTab, theme, onToggleTheme, onAuthSuccess }) {
  const [tab, setTab] = useState(defaultTab);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [regUsername, setRegUsername] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");

  function handleSwitchTab(nextTab) {
    setTab(nextTab);
    setLoginError("");
    setRegisterError("");
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginError("");
    const result = await loginUser({ username: loginUsername, password: loginPassword });
    if (!result.ok) {
      setLoginError(result.error);
      return;
    }
    setLoginPassword("");
    onAuthSuccess(result.usernameKey, result.user, `Chào mừng trở lại, ${result.user.displayName || result.user.username}.`);
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setRegisterError("");
    const result = await registerUser({
      username: regUsername,
      displayName: regDisplayName,
      password: regPassword,
      confirmPassword: regConfirmPassword,
    });
    if (!result.ok) {
      setRegisterError(result.error);
      return;
    }
    setRegPassword("");
    setRegConfirmPassword("");
    onAuthSuccess(result.usernameKey, result.user, "Tạo tài khoản thành công.");
  }

  return (
    <section className="auth-shell" aria-label="Đăng nhập hoặc đăng ký tài khoản">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand">
            <span className="brand-title">PRM393 FE</span>
            <span className="brand-badge">Ôn tập trắc nghiệm</span>
          </div>
          <button
            type="button"
            className="chip-btn"
            onClick={onToggleTheme}
            title="Đổi giao diện Sáng / Tối"
          >
            {theme === "dark" ? "Giao diện: Sáng" : "Giao diện: Tối"}
          </button>
        </div>

        <p className="auth-subtitle">
          Đăng nhập hoặc tạo tài khoản để lưu riêng tiến độ làm bài trên máy tính của bạn.
        </p>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab${tab === "login" ? " active" : ""}`}
            role="tab"
            aria-selected={tab === "login"}
            onClick={() => handleSwitchTab("login")}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`auth-tab${tab === "register" ? " active" : ""}`}
            role="tab"
            aria-selected={tab === "register"}
            onClick={() => handleSwitchTab("register")}
          >
            Đăng ký
          </button>
        </div>

        {tab === "login" ? (
          <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="loginUsername">
                Tên đăng nhập
              </label>
              <input
                type="text"
                id="loginUsername"
                className="auth-input"
                placeholder="Ví dụ: sinhvien01"
                autoComplete="username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="loginPassword">
                Mật khẩu
              </label>
              <input
                type="password"
                id="loginPassword"
                className="auth-input"
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            {loginError ? (
              <div className="auth-error" role="alert">
                {loginError}
              </div>
            ) : null}

            <button type="submit" className="auth-submit">
              Đăng nhập
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
            <div className="auth-field">
              <label className="auth-label" htmlFor="regUsername">
                Tên đăng nhập
              </label>
              <input
                type="text"
                id="regUsername"
                className="auth-input"
                placeholder="3-24 ký tự (chữ, số, ., _, -)"
                autoComplete="username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="regDisplayName">
                Tên hiển thị (tuỳ chọn)
              </label>
              <input
                type="text"
                id="regDisplayName"
                className="auth-input"
                placeholder="Ví dụ: Nguyễn Văn A"
                autoComplete="name"
                value={regDisplayName}
                onChange={(e) => setRegDisplayName(e.target.value)}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="regPassword">
                Mật khẩu
              </label>
              <input
                type="password"
                id="regPassword"
                className="auth-input"
                placeholder="Tối thiểu 4 ký tự"
                autoComplete="new-password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="regConfirmPassword">
                Nhập lại mật khẩu
              </label>
              <input
                type="password"
                id="regConfirmPassword"
                className="auth-input"
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                required
              />
            </div>

            {registerError ? (
              <div className="auth-error" role="alert">
                {registerError}
              </div>
            ) : null}

            <button type="submit" className="auth-submit">
              Tạo tài khoản
            </button>
          </form>
        )}

        <p className="auth-note">
          Tài khoản và kết quả ôn tập được lưu trực tiếp trong bộ nhớ đệm trình duyệt (localStorage) trên thiết bị hiện tại, không gửi lên máy chủ.
        </p>
      </div>
    </section>
  );
}
