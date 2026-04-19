import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { THEMES } from "@/styles/themes";
import type { ThemeKey } from "@/types";
import styles from "./LandingPage.module.scss";
import logo from "@/assets/logo.png";

const themeKeys: ThemeKey[] = [
  "midnight",
  "arctic",
  "rose",
  "forest",
  "sand",
  "ocean",
  "graphite",
  "lavender",
  "ember",
  "galaxy",
  "candy",
  "lipstick_matte",
];

const LandingPage: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("midnight");

  const previewStyle = THEMES[selectedTheme].vars as React.CSSProperties;

  const handleInstall = async () => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") console.log("PWA installed");
      (window as any).deferredPrompt = null;
    } else {
      alert(
        "Your browser supports PWA installation. Look for the install icon in the address bar.",
      );
    }
  };

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return (
    <div className={styles.landing}>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            <img src={logo} alt="Echo" />
            <span>Echo</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#features">Features</a>
            <a href="#themes">Themes</a>
            <a href="#security">Security</a>
          </div>
          <div className={styles.actions}>
            <Link to="/auth" className={styles.btnOutline}>
              Sign In
            </Link>
            <button onClick={handleInstall} className={styles.btnPrimary}>
              Install App
            </button>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>✨ Now available as PWA</div>
            <h1 className={styles.title}>
              Every conversation
              <br />
              finds its <span className={styles.gradient}>echo.</span>
            </h1>
            <p className={styles.subtitle}>
              Echo is a real‑time messaging platform with instant chat,
              crystal‑clear video calls, and beautiful customization – all in
              one modern app.
            </p>
            <div className={styles.buttons}>
              <button onClick={handleInstall} className={styles.btnDownload}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Install Echo – Free
              </button>
              <Link to="/auth" className={styles.btnSecondary}>
                Get Started →
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}></div>
        </div>
      </section>

      <section id="themes" className={styles.themePreviewSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.tag}>Live preview</span>
            <h2>See your style in action</h2>
            <p>Choose any theme and watch the chat preview change instantly.</p>
          </div>
          <div className={styles.themeButtons}>
            {themeKeys.map((key) => (
              <button
                key={key}
                className={`${styles.themeButton} ${selectedTheme === key ? styles.active : ""}`}
                onClick={() => setSelectedTheme(key)}
                style={{
                  backgroundColor: THEMES[key].vars["--accent"],
                  borderColor: THEMES[key].vars["--border"],
                  color: THEMES[key].dark ? "#fff" : "#000",
                }}
              >
                {THEMES[key].name}
              </button>
            ))}
          </div>
          <div className={styles.chatPreview} style={previewStyle}>
            <div className={styles.previewMockup}>
              <div className={styles.previewHeader}>
                <div className={styles.previewAvatar}></div>
                <div className={styles.previewName}>Alex</div>
                <div className={styles.previewStatus}>🟢 Online</div>
              </div>
              <div className={styles.previewMessages}>
                <div className={`${styles.previewMessage} ${styles.previewIn}`}>
                  Hey! How's it going?
                </div>
                <div
                  className={`${styles.previewMessage} ${styles.previewOut}`}
                >
                  I'm great, thanks! Ready for the meeting?
                </div>
                <div className={`${styles.previewMessage} ${styles.previewIn}`}>
                  Yes, let's do it. 👌
                </div>
              </div>
              <div className={styles.previewInput}>
                <div className={styles.previewInputField}>
                  Type a message...
                </div>
                <div className={styles.previewSendBtn}>➤</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.tag}>Everything you need</span>
            <h2>Built for real conversations</h2>
            <p>
              Every feature is designed to make your chats feel natural and
              fast.
            </p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.icon}>💬</div>
              <h3>Real‑time Messaging</h3>
              <p>Instant delivery with typing indicators and read receipts.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.icon}>📹</div>
              <h3>Video & Audio Calls</h3>
              <p>HD calls with screen sharing and picture‑in‑picture.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.icon}>🎨</div>
              <h3>12 Beautiful Themes</h3>
              <p>From Midnight to Galaxy – pick your vibe.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.icon}>🔤</div>
              <h3>Custom Fonts</h3>
              <p>10+ unique typefaces to personalise your chat.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.icon}>🔍</div>
              <h3>Find by Code</h3>
              <p>Connect with friends using unique invite codes.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.icon}>🛡️</div>
              <h3>Block & Report</h3>
              <p>Keep your conversations safe and spam‑free.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className={styles.security}>
        <div className={styles.container}>
          <div className={styles.securityGrid}>
            <div>
              <span className={styles.tag}>Privacy & Security</span>
              <h2>Your conversations belong to you.</h2>
              <p>
                End‑to‑end encryption, password reset, and full control over
                your data.
              </p>
            </div>
            <div className={styles.securityCards}>
              <div className={styles.securityCard}>
                <div className={styles.securityIcon}>🔒</div>
                <h3>End‑to‑End Encrypted</h3>
                <p>Only you and your recipient can read your messages.</p>
              </div>
              <div className={styles.securityCard}>
                <div className={styles.securityIcon}>🗑️</div>
                <h3>Delete for Everyone</h3>
                <p>Remove messages from both sides instantly.</p>
              </div>
              <div className={styles.securityCard}>
                <div className={styles.securityIcon}>🔑</div>
                <h3>Password Reset</h3>
                <p>Secure email‑based recovery.</p>
              </div>
              <div className={styles.securityCard}>
                <div className={styles.securityIcon}>🚫</div>
                <h3>Block Users</h3>
                <p>Instantly block anyone you don't want to hear from.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>Ready to hear your echo?</h2>
          <p>
            Install Echo in seconds. No setup. No fees. Just great
            conversations.
          </p>
          <div className={styles.ctaButtons}>
            <button onClick={handleInstall} className={styles.btnPrimaryLarge}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Install Echo Free
            </button>
            <Link to="/auth" className={styles.btnSecondaryLarge}>
              Sign In →
            </Link>
          </div>
          <p className={styles.ctaNote}>
            Available as a Progressive Web App · Works on any device
          </p>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerLogo}>
              <img src={logo} alt="Echo" />
              <span>Echo</span>
            </div>
            <div className={styles.footerLinks}>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <a href="#">Support</a>
              <a href="#">About</a>
            </div>
            <div className={styles.footerCopy}>
              © 2025 Echo. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
