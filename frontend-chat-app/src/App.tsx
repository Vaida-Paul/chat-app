import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore, useUIStore } from "@/store";
import { applyTheme } from "@/styles/themes";
import LandingPage from "@/pages/LandingPage/LandingPage";
import AuthPage from "@/pages/AuthPage/AuthPage";
import ChatPage from "@/pages/ChatPage/ChatPage";
import TermsPage from "./pages/PrivacyTermsPage/TermsPage";
import PrivacyPage from "./pages/PrivacyTermsPage/PrivacyPage";
import ResetPasswordPage from "./pages/ResetPasswordPage/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage/VerifyEmailPage";
import "@/styles/global.scss";

const App: React.FC = () => {
  const theme = useUIStore((s) => s.theme);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/auth" element={<AuthPage />} />

        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/app"
          element={
            isAuthenticated ? <ChatPage /> : <Navigate to="/auth" replace />
          }
        />

        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route
          path="/register"
          element={<Navigate to="/auth?tab=register" replace />}
        />
        <Route path="/chat" element={<Navigate to="/app" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
