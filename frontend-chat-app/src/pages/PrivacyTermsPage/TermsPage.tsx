import React from "react";
import { Link } from "react-router-dom";
import styles from "./LegalPages.module.scss";
import logo from "@/assets/logo.png";

const TermsPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src={logo} alt="Echo" className={styles.logo} />
          <span className={styles.appName}>Echo</span>
        </div>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last updated: March 9, 2026</p>

        <div className={styles.content}>
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Echo ("the App"), you agree to be bound by
              these Terms of Service. If you do not agree to all the terms, you
              may not use the App.
            </p>
          </section>

          <section>
            <h2>2. User Accounts</h2>
            <p>
              To use certain features, you must register for an account. You are
              responsible for maintaining the confidentiality of your account
              credentials and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2>3. Acceptable Use</h2>
            <p>You agree not to use the App to:</p>
            <ul>
              <li>Violate any laws or regulations.</li>
              <li>Infringe on the rights of others.</li>
              <li>Distribute spam, malware, or harmful content.</li>
              <li>Impersonate any person or entity.</li>
            </ul>
          </section>

          <section>
            <h2>4. Content</h2>
            <p>
              You retain ownership of any content you submit. By posting
              content, you grant Echo a non‑exclusive, worldwide, royalty‑free
              license to use, store, and display it within the App.
            </p>
          </section>

          <section>
            <h2>5. Termination</h2>
            <p>
              We may suspend or terminate your account at any time for
              violations of these terms or for any other reason at our sole
              discretion.
            </p>
          </section>

          <section>
            <h2>6. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of
              significant changes, but you are encouraged to review this page
              periodically.
            </p>
          </section>

          <section>
            <h2>7. Contact Us</h2>
            <p>
              If you have any questions, please contact us at{" "}
              <a href="mailto:echochat.application@gmail.com">
                echochat.application@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className={styles.footer}>
          <Link to="/privacy" className={styles.link}>
            Privacy Policy
          </Link>
          <span className={styles.separator}>•</span>
          <Link to="/login" className={styles.link}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
