import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "@/api";
import { useAuthStore } from "@/store";
import styles from "./VerifyEmailPage.module.scss";
import logo from "@/assets/logo.png";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    authApi
      .verifyEmail(token)
      .then((res) => {
        setAuth(res);
        setStatus("success");
        setTimeout(() => navigate("/auth", { replace: true }), 2000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err?.response?.data?.message ??
            "Verification failed or link expired.",
        );
      });
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <img src={logo} alt="Echo" className={styles.logo} />
        {status === "loading" && (
          <>
            <div className={styles.spinner} />
            <p className={styles.text}>Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className={styles.iconSuccess}>✓</div>
            <h2 className={styles.title}>Email verified!</h2>
            <p className={styles.text}>Redirecting you to Echo…</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className={styles.iconError}>✕</div>
            <h2 className={styles.title}>Verification failed</h2>
            <p className={styles.textError}>{message}</p>
            <button className={styles.btn} onClick={() => navigate("/auth")}>
              Back to login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
