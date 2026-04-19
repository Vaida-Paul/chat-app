import React from "react";
import { Link } from "react-router-dom";
import styles from "./LegalPages.module.scss";
import logo from "@/assets/logo.png";

const PrivacyPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src={logo} alt="Echo" className={styles.logo} />
          <span className={styles.appName}>Echo</span>
        </div>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: March 9, 2026</p>

        <div className={styles.content}>
          <section>
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly, such as your name,
              email address, and any messages or files you send through the App.
              We also automatically collect certain usage data, including IP
              address, device information, and interaction logs.
            </p>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information to operate, maintain, and improve the App,
              to communicate with you, and to ensure the security of our
              services. We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2>3. Sharing of Information</h2>
            <p>
              We may share your information with service providers who help us
              run the App, or when required by law. We may also share anonymised
              or aggregated data for analytical purposes.
            </p>
          </section>

          <section>
            <h2>4. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active
              or as needed to provide services. You may request deletion of your
              account at any time.
            </p>
          </section>

          <section>
            <h2>5. Your Rights</h2>
            <p>
              Depending on your location, you may have the right to access,
              correct, or delete your personal data. Contact us at the email
              below to exercise these rights.
            </p>
          </section>

          <section>
            <h2>6. Security</h2>
            <p>
              We implement reasonable security measures to protect your
              information. However, no method of transmission over the internet
              is 100% secure.
            </p>
          </section>

          <section>
            <h2>7. Contact Us</h2>
            <p>
              For privacy-related questions, please email{" "}
              <a href="mailto:echochat.application@gmail.com">
                echochat.application@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className={styles.footer}>
          <Link to="/terms" className={styles.link}>
            Terms of Service
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

export default PrivacyPage;
