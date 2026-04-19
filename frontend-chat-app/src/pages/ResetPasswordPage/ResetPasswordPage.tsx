import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "@/api";
import { FaLock } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";
import styles from "./ResetPasswordPage.module.scss";
import logo from "@/assets/logo.png";

const REQUIREMENTS = [
  { label: "8+ chars", test: (p: string) => p.length >= 8 },
  { label: "uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { label: "lowercase", test: (p: string) => /[a-z]/.test(p) },
  { label: "number", test: (p: string) => /[0-9]/.test(p) },
  { label: "special (!@#$)", test: (p: string) => /[!@#$%^&*]/.test(p) },
];

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const strength = REQUIREMENTS.map((r) => r.test(password));
  const isStrong = strength.every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStrong) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/auth", { replace: true }), 2500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Reset failed. Link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token)
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.iconError}>✕</div>
          <h2 className={styles.title}>Invalid link</h2>
          <button className={styles.btn} onClick={() => navigate("/auth")}>
            Back to login
          </button>
        </div>
      </div>
    );

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={logo} alt="Echo" className={styles.logo} />

        {done ? (
          <>
            <div className={styles.iconSuccess}>✓</div>
            <h2 className={styles.title}>Password reset!</h2>
            <p className={styles.text}>Redirecting to login…</p>
          </>
        ) : (
          <>
            <h2 className={styles.title}>New password</h2>
            <p className={styles.sub}>
              Choose a strong password for your account.
            </p>

            {error && <div className={styles.error}>⚠ {error}</div>}

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.field}>
                <label className={styles.label}>PASSWORD</label>
                <div className={styles.inputWrap}>
                  <FaLock className={styles.icon} />
                  <input
                    className={styles.input}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.toggle}
                    onClick={() => setShowPass((v) => !v)}
                  >
                    {showPass ? <IoEyeOff /> : <IoEye />}
                  </button>
                </div>
                <div className={styles.strength}>
                  {REQUIREMENTS.map((r, i) => (
                    <span key={i} className={strength[i] ? styles.met : ""}>
                      {r.label}
                      {i < REQUIREMENTS.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>CONFIRM PASSWORD</label>
                <div className={styles.inputWrap}>
                  <FaLock className={styles.icon} />
                  <input
                    className={styles.input}
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.toggle}
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <IoEyeOff /> : <IoEye />}
                  </button>
                </div>
                {confirm && password !== confirm && (
                  <p className={styles.mismatch}>Passwords don't match</p>
                )}
              </div>

              <button className={styles.btn} type="submit" disabled={loading}>
                {loading ? (
                  <span className={styles.spinner} />
                ) : (
                  "Reset Password →"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
