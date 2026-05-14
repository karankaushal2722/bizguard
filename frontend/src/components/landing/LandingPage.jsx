import styles from './LandingPage.module.css'

const FEATURES = [
  { icon: '🤖', title: 'Amira — your AI advisor', desc: 'Ask anything about your specific business, industry, and state. Tailored answers, not generic advice.' },
  { icon: '📄', title: 'Document analysis', desc: 'Upload any IRS notice, legal letter, DOT violation, or contract. Amira reads it and tells you what to do.' },
  { icon: '🎙️', title: 'Voice in 6 languages', desc: 'Talk to Amira in English, Spanish, Portuguese, Mandarin, French, or Korean.' },
  { icon: '⚡', title: 'Instant answers', desc: 'No waiting. No $300/hr attorney fees. Clear answers in seconds, day or night.' },
  { icon: '🏛️', title: 'Compliance checklists', desc: 'Know exactly what regulations apply before an inspector shows up.' },
  { icon: '🔒', title: 'Built for your industry', desc: '12 industries covered — trucking, food, construction, healthcare, retail, and more.' },
]

const USECASES = [
  { icon: '📬', title: 'IRS letter', desc: 'Upload it and Amira explains what it means and your exact next steps.' },
  { icon: '🚛', title: 'DOT violation', desc: 'Amira decodes FMCSA violations and tells you how to respond.' },
  { icon: '⚖️', title: 'Received a lawsuit', desc: "Amira reads the summons and tells you what to do first." },
  { icon: '📝', title: 'Reviewing a contract', desc: 'Amira flags unusual clauses and things to negotiate before you sign.' },
  { icon: '🏗️', title: 'OSHA compliance', desc: 'Know what safety requirements apply to your business.' },
  { icon: '💰', title: 'Tax questions', desc: 'IFTA, quarterly taxes, employee vs contractor — answered fast.' },
]

const TESTIMONIALS = [
  { stars: 5, text: '"Got an IRS CP2000 notice and had no idea what to do. BizGuard broke it down step by step. Saved me from a costly mistake."', initials: 'MR', name: 'Marcus R.', role: 'Owner, R&R Plumbing · Texas' },
  { stars: 5, text: '"I drive trucks and Amira answers in Spanish by voice while on the road. Exactly what I needed."', initials: 'JL', name: 'Jorge L.', role: 'Owner-Operator, JL Freight · CA' },
  { stars: 5, text: '"Amira flagged three lease clauses that could have cost me tens of thousands. Worth every penny."', initials: 'TK', name: 'Tanya K.', role: 'Owner, Kleen Pro Services · GA' },
]

const INDUSTRIES = ['🚛 Trucking','🍔 Food & Restaurant','🏗️ Construction','🧹 Cleaning Services','🛒 Retail','🏥 Healthcare','👶 Childcare','💅 Beauty & Salons','🌿 Landscaping','🏠 Real Estate','🛍️ E-commerce','💼 General Business']

export default function LandingPage({ onGetStarted }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.navLogoIcon}>
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/></svg>
          </div>
          BizGuard
        </div>
        <div className={styles.navLinks}>
          <button onClick={() => scrollTo('features')}>Features</button>
          <button onClick={() => scrollTo('how')}>How it works</button>
          <button onClick={() => scrollTo('pricing')}>Pricing</button>
        </div>
        <button className={styles.navCta} onClick={onGetStarted}>Get started free</button>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroBadge}><span className={styles.heroBadgeDot}/>AI-powered legal protection for small business</div>
        <h1 className={styles.heroTitle}>Your business deserves <em>real legal protection</em></h1>
        <p className={styles.heroSub}>Amira is your always-on AI advisor for IRS notices, DOT violations, contracts, legal threats, and compliance — in plain English, in your language.</p>
        <div className={styles.heroActions}>
          <button className={styles.btnPrimary} onClick={onGetStarted}>Start for free — no credit card</button>
          <button className={styles.btnSecondary} onClick={() => scrollTo('how')}>See how it works</button>
        </div>
        <p className={styles.heroNote}>Free forever plan · No setup required · Works in 6 languages</p>
      </section>

      <div className={styles.proofBar}>
        <div className={styles.proofItem}><strong>12</strong> industries</div>
        <div className={styles.proofItem}><strong>6</strong> languages</div>
        <div className={styles.proofItem}><strong>IRS</strong> · DOT · Legal · OSHA</div>
        <div className={styles.proofItem}><strong>Voice</strong> input & output</div>
        <div className={styles.proofItem}><strong>Document</strong> analysis</div>
      </div>

      <section className={styles.section} id="features">
        <div className={styles.sectionLabel}>Features</div>
        <h2 className={styles.sectionTitle}>Everything your business needs to stay protected</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
