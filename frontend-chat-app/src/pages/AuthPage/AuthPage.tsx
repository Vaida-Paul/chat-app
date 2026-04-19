import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/api";
import { useAuthStore } from "@/store";
import Turnstile from "react-turnstile";
import styles from "./AuthPage.module.scss";
import logo from "@/assets/logo.png";
import { IoMdPerson } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";

type Tab = "login" | "register";
type View = "auth" | "verify-pending" | "forgot-password" | "forgot-sent";

const PASSWORD_REQUIREMENTS = [
  { label: "8+ chars", test: (p: string) => p.length >= 8 },
  { label: "uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { label: "lowercase", test: (p: string) => /[a-z]/.test(p) },
  { label: "number", test: (p: string) => /[0-9]/.test(p) },
  { label: "special(!?#..)", test: (p: string) => /[!@#$%^&*]/.test(p) },
];

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [view, setView] = useState<View>("auth");
  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  const shake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 420);
  };

  const passwordStrength = PASSWORD_REQUIREMENTS.map((req) =>
    req.test(password),
  );
  const isPasswordStrong = passwordStrength.every(Boolean);

  const validate = () => {
    if (!email.trim().includes("@")) return "Enter a valid email address.";
    if (tab === "register") {
      if (!username.trim()) return "Username is required.";
      if (!isPasswordStrong) return "Password does not meet all requirements.";
      if (!captchaToken) return "Please complete the captcha.";
    } else {
      if (password.length < 6) return "Password must be at least 6 characters.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) {
      setError(err);
      shake();
      return;
    }

    setLoading(true);
    try {
      if (tab === "login") {
        const res = await authApi.login({ email: email.trim(), password });
        setAuth(res);
        navigate("/app", { replace: true });
      } else {
        await authApi.register({
          username: username.trim(),
          email: email.trim(),
          password,
          captchaToken: captchaToken!,
        });
        setPendingEmail(email.trim());
        setView("verify-pending");
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "";
      if (msg === "EMAIL_NOT_VERIFIED") {
        setPendingEmail(email.trim());
        setView("verify-pending");
        return;
      }
      setError(
        msg ||
          (tab === "login"
            ? "Invalid email or password."
            : "Registration failed. Try a different email."),
      );
      shake();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMsg("");
    try {
      await authApi.resendVerification(pendingEmail);
      setResendMsg("Email resent! Check your inbox.");
    } catch {
      setResendMsg("Failed to resend. Try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(forgotEmail.trim());
      setView("forgot-sent");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setError("");
    setCaptchaToken(null);
  };

  if (view === "verify-pending") {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <img src={logo} alt="Echo" className={styles.logo} />
          <div className={styles.iconEmail}>📧</div>
          <h2 className={styles.heading}>Check your email</h2>
          <p className={styles.subheading}>
            We sent a verification link to <strong>{pendingEmail}</strong>. It
            expires in 5 minutes.
          </p>
          {resendMsg && (
            <div
              className={
                resendMsg.includes("Failed") ? styles.error : styles.success
              }
            >
              {resendMsg}
            </div>
          )}
          <button
            className={styles.submitBtn}
            onClick={handleResend}
            disabled={resendLoading}
          >
            {resendLoading ? (
              <span className={styles.spinner} />
            ) : (
              "Resend email"
            )}
          </button>
          <button
            className={styles.linkBtn}
            onClick={() => {
              setView("auth");
              setError("");
            }}
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  if (view === "forgot-password") {
    return (
      <div className={styles.page}>
        <div className={`${styles.card} ${shaking ? styles.shake : ""}`}>
          <img src={logo} alt="Echo" className={styles.logo} />
          <h2 className={styles.heading}>Forgot password?</h2>
          <p className={styles.subheading}>
            Enter your email and we'll send you a reset link.
          </p>
          {error && <div className={styles.error}>⚠ {error}</div>}
          <form
            onSubmit={handleForgotSubmit}
            className={styles.form}
            noValidate
          >
            <div className={styles.field}>
              <label className={styles.label}>EMAIL</label>
              <div className={styles.inputWrapper}>
                <MdEmail className={styles.inputIcon} />
                <input
                  className={styles.input}
                  type="email"
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>
            <button
              className={styles.submitBtn}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                "Send reset link →"
              )}
            </button>
          </form>
          <button
            className={styles.linkBtn}
            onClick={() => {
              setView("auth");
              setError("");
            }}
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  if (view === "forgot-sent") {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <img src={logo} alt="Echo" className={styles.logo} />
          <div className={styles.iconEmail}>📬</div>
          <h2 className={styles.heading}>Reset link sent</h2>
          <p className={styles.subheading}>
            If <strong>{forgotEmail}</strong> exists, a reset link is on its
            way. Check your inbox — it expires in 15 minutes.
          </p>
          <button
            className={styles.linkBtn}
            onClick={() => {
              setView("auth");
              setError("");
            }}
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${shaking ? styles.shake : ""}`}>
        {tab === "login" && (
          <div className={styles.brand}>
            <div className={styles.brandLogo}>
              <img src={logo} alt="Echo Logo" />
            </div>
            <div>
              <div className={styles.brandName}>Echo</div>
              <div className={styles.brandSub}>Modern messaging</div>
            </div>
          </div>
        )}

        <h1 className={styles.heading}>
          {tab === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className={styles.subheading}>
          {tab === "login"
            ? "Sign in to continue your conversations"
            : "Join Echo and start connecting"}
        </p>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "login" ? styles.tabActive : ""}`}
            onClick={() => switchTab("login")}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`${styles.tab} ${tab === "register" ? styles.tabActive : ""}`}
            onClick={() => switchTab("register")}
            type="button"
          >
            Register
          </button>
        </div>

        {error && <div className={styles.error}>⚠ {error}</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {tab === "register" && (
            <div className={styles.field}>
              <label className={styles.label}>USERNAME</label>
              <div className={styles.inputWrapper}>
                <IoMdPerson className={styles.inputIcon} />
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>EMAIL</label>
            <div className={styles.inputWrapper}>
              <MdEmail className={styles.inputIcon} />
              <input
                className={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>PASSWORD</label>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  tab === "login" ? "current-password" : "new-password"
                }
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </button>
            </div>
            {tab === "register" && (
              <div className={styles.passwordStrength}>
                {PASSWORD_REQUIREMENTS.map((req, i) => (
                  <span
                    key={i}
                    className={passwordStrength[i] ? styles.met : ""}
                  >
                    {req.label}
                    {i < PASSWORD_REQUIREMENTS.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}
          </div>

          {tab === "login" && (
            <button
              type="button"
              className={styles.forgotBtn}
              onClick={() => {
                setView("forgot-password");
                setError("");
              }}
            >
              Forgot password?
            </button>
          )}

          {tab === "register" && (
            <div className={styles.captcha}>
              <Turnstile
                sitekey={import.meta.env.VITE_TURNSTILE_SITEKEY}
                onSuccess={(token) => setCaptchaToken(token)}
                theme="light"
              />
            </div>
          )}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : tab === "login" ? (
              "Sign In →"
            ) : (
              "Create Account →"
            )}
          </button>
        </form>

        <p className={styles.terms}>
          By continuing, you agree to our{" "}
          <Link to="/terms">Terms of Service</Link> and{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
