import styles from './Legal.module.css'

export default function Terms() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <a href="/" className={styles.back}>← Back to BizGuard</a>
        <h1>Terms of Service</h1>
        <p className={styles.updated}>Last updated: May 29, 2026</p>
        <p>These Terms of Service govern your use of BizGuard, operated by Emerus Trading Company LLC. By using BizGuard, you agree to these Terms.</p>
        <h2>1. Description of Service</h2>
        <p>BizGuard is an AI-powered information platform providing general guidance on legal, compliance, and accounting topics for small business owners. Our AI advisor Amira is powered by Anthropic's Claude AI.</p>
        <h2>2. Not Legal or Professional Advice</h2>
        <p><strong>BizGuard is not a law firm and does not provide legal advice.</strong> Amira's responses are general informational guidance only. No attorney-client relationship is formed. Always consult a licensed attorney, CPA, or qualified professional for advice specific to your situation.</p>
        <h2>3. Eligibility</h2>
        <p>You must be at least 18 years old to use BizGuard.</p>
        <h2>4. Subscription and Billing</h2>
        <p>Paid plans are billed monthly or annually and auto-renew unless cancelled. You may cancel anytime through account settings. Refunds are provided at our discretion.</p>
        <h2>5. Acceptable Use</h2>
        <p>You agree not to use BizGuard for unlawful purposes, reverse-engineer the service, share account credentials, upload malicious content, or resell access without written permission.</p>
        <h2>6. Intellectual Property</h2>
        <p>BizGuard and its content are owned by Emerus Trading Company LLC. You retain ownership of documents you upload and grant us a limited license to process them solely to provide the service.</p>
        <h2>7. Limitation of Liability</h2>
        <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, EMERUS TRADING COMPANY LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS.</p>
        <h2>8. Governing Law</h2>
        <p>These Terms are governed by the laws of the State of Maryland. Disputes shall be resolved in the courts of Maryland.</p>
        <h2>9. Changes to Terms</h2>
        <p>We may update these Terms at any time. Material changes will be communicated via email or in-app notice. Continued use constitutes acceptance.</p>
        <h2>10. Contact</h2>
        <p>Emerus Trading Company LLC<br />Email: <a href="mailto:support@bizguard.co">support@bizguard.co</a><br />Website: <a href="https://bizguard.co">bizguard.co</a></p>
      </div>
    </div>
  )
}
