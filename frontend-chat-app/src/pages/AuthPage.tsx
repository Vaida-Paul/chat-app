import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Turnstile from "react-turnstile";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import styles from "./AuthPage.module.scss";

import { IoMdPerson } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";

import logo from "../assets/logoChatApp.png";

type Tab = "login" | "register";

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

  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 420);
  };

  const passwordStrength = PASSWORD_REQUIREMENTS.map((req) =>
    req.test(password),
  );
  const isPasswordStrong = passwordStrength.every(Boolean);

  const validate = () => {
    if (!email.includes("@")) return "Enter a valid email address.";
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
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res =
        tab === "login"
          ? await authApi.login({ email, password })
          : await authApi.register({
              username,
              email,
              password,
              captchaToken: captchaToken!,
            });

      setAuth(res.token, res.user);
      navigate("/", { replace: true });
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (tab === "login" ? "Invalid credentials." : "Registration failed.");
      setError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${shaking ? styles.shake : ""}`}>
        {tab === "login" && (
          <div className={styles.brand}>
            <img src={logo} alt="Echo" className={styles.brandLogo} />
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
            onClick={() => {
              setTab("login");
              setError("");
            }}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`${styles.tab} ${tab === "register" ? styles.tabActive : ""}`}
            onClick={() => {
              setTab("register");
              setError("");
            }}
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
                {PASSWORD_REQUIREMENTS.map((req, index) => (
                  <span
                    key={index}
                    className={passwordStrength[index] ? styles.met : ""}
                  >
                    {req.label}
                    {index < PASSWORD_REQUIREMENTS.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}
          </div>

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
          <Link to="/terms" target="_self">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" target="_self">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
