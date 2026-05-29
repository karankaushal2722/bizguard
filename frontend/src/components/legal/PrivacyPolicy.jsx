import styles from './Legal.module.css'

export default function PrivacyPolicy() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <a href="/" className={styles.back}>← Back to BizGuard</a>
        <h1>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: May 29, 2026</p>
        <p>BizGuard ("we," "our," or "us") is operated by Emerus Trading Company LLC. This Privacy Policy explains how we collect, use, and protect your information when you use BizGuard and our AI advisor, Amira.</p>
        <h2>1. Information We Collect</h2>
        <p><strong>Account information:</strong> Name, email address, and password.</p>
        <p><strong>Business information:</strong> Business name, industry, state, number of employees, and preferred language.</p>
        <p><strong>Usage data:</strong> Questions you ask Amira, documents you upload, and features you use.</p>
        <p><strong>Payment information:</strong> Processed by Stripe. We do not store your full credit card number.</p>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide and personalize BizGuard's AI guidance</li>
          <li>To process payments and manage your subscription</li>
          <li>To improve our AI models and service quality</li>
          <li>To send important service and account notifications</li>
          <li>To comply with legal obligations</li>
        </ul>
        <h2>3. AI and Data Processing</h2>
        <p>BizGuard uses Anthropic's Claude AI to power Amira. Your questions and business information are sent to Anthropic's API to generate responses. We do not sell your data to third parties for advertising purposes.</p>
        <h2>4. Data Storage and Security</h2>
        <p>Your data is stored securely using Supabase (SOC 2 compliant) with TLS encryption in transit and at rest. Data is retained while your account is active and deleted within 90 days of account closure upon request.</p>
        <h2>5. Sharing Your Information</h2>
        <p>We share data only with: Anthropic (AI responses), Stripe (payments), Supabase (database), and law enforcement when required by valid legal process. We do not sell your data.</p>
        <h2>6. Your Rights</h2>
        <p>Email <a href="mailto:support@bizguard.co">support@bizguard.co</a> to access, correct, or delete your personal information. We respond within 30 days.</p>
        <h2>7. Children's Privacy</h2>
        <p>BizGuard is not intended for users under 18 years of age.</p>
        <h2>8. Legal Disclaimer</h2>
        <p>BizGuard and Amira provide general informational guidance only — not legal, accounting, or professional advice. Always consult a licensed attorney or CPA for your specific situation.</p>
        <h2>9. Contact Us</h2>
        <p>Emerus Trading Company LLC<br />Email: <a href="mailto:support@bizguard.co">support@bizguard.co</a><br />Website: <a href="https://bizguard.co">bizguard.co</a></p>
      </div>
    </div>
  )
}
