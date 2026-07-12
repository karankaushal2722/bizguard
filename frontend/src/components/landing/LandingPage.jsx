import styles from './LandingPage.module.css'

// Apple App Store Guideline 3.1.1: hide pricing/purchase UI in the iOS app
const IS_IOS_APP = typeof window !== 'undefined' && window.Capacitor?.getPlatform?.() === 'ios'

const FEATURES = [
  { icon: '🤖', title: 'Amira — your AI advisor', desc: 'Ask anything about your specific business, industry, and state. Tailored answers, not generic advice.' },
  { icon: '📄', title: 'Document analysis', desc: 'Upload any IRS notice, legal letter, DOT violation, or contract. Amira reads it and tells you what to do.' },
  { icon: '🎙️', title: 'Voice in 6 languages', desc: 'Talk to Amira in English, Spanish, Hindi, Punjabi, Urdu, Farsi, Portuguese, Mandarin, French, or Korean.' },
  { icon: '⚡', title: 'Instant answers', desc: 'No waiting. No $300/hr attorney fees. Clear answers in seconds, day or night.' },
  { icon: '🏛️', title: 'Compliance checklists', desc: 'Know what regulations apply before an inspector shows up.' },
  { icon: '🔒', title: 'Built for your industry', desc: '12 industries — trucking, food, construction, healthcare, retail, and more.' },
]

const USECASES = [
  { icon: '📬', title: 'IRS letter', desc: 'Upload it and Amira explains what it means and your exact next steps.' },
  { icon: '🚛', title: 'DOT violation', desc: 'Amira decodes FMCSA violations and tells you how to respond.' },
  { icon: '⚖️', title: 'Received a lawsuit', desc: 'Amira reads the summons and tells you what to do first.' },
  { icon: '📝', title: 'Reviewing a contract', desc: 'Amira flags unusual clauses and things to negotiate before you sign.' },
  { icon: '🏗️', title: 'OSHA compliance', desc: 'Know what safety requirements apply to your business.' },
  { icon: '💰', title: 'Tax questions', desc: 'IFTA, quarterly taxes, employee vs contractor — answered fast.' },
]

const TESTIMONIALS = [
  { stars: 5, text: '"Got an IRS CP2000 notice and had no idea what to do. BizGuard broke it down step by step. Saved me from a costly mistake."', initials: 'MR', name: 'Marcus R.', role: 'Owner, R&R Plumbing · Texas' },
  { stars: 5, text: '"I drive trucks and Amira answers in Spanish by voice while on the road. Exactly what I needed."', initials: 'JL', name: 'Jorge L.', role: 'Owner-Operator, JL Freight · CA' },
  { stars: 5, text: '"Amira flagged three lease clauses that could have cost me tens of thousands. Worth every penny."', initials: 'TK', name: 'Tanya K.', role: 'Owner, Kleen Pro Services · GA' },
]

const INDUSTRIES = [
  '🚛 Trucking', '🍔 Food & Restaurant', '🏗️ Construction',
  '🧹 Cleaning Services', '🛒 Retail', '🏥 Healthcare',
  '👶 Childcare', '💅 Beauty & Salons', '🌿 Landscaping',
  '🏠 Real Estate', '🛍️ E-commerce', '💼 General Business',
]

export default function LandingPage({ onGetStarted }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className={styles.page}>

      {/* NAV */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.navLogoIcon}>
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
            </svg>
          </div>
          BizGuard
        </div>
        <div className={styles.navLinks}>
          <button onClick={() => scrollTo('features')}>Features</button>
          <button onClick={() => scrollTo('how')}>How it works</button>
          {!IS_IOS_APP && <button onClick={() => scrollTo('pricing')}>Pricing</button>}
        </div>
        <button className={styles.navCta} onClick={onGetStarted}>Get started free</button>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          AI-powered legal protection for small business
        </div>
        <h1 className={styles.heroTitle}>
          Your own legal & compliance advisor — <em>available 24/7, no appointment needed</em>
        </h1>
        <p className={styles.heroSub}>
          Meet Amira, Your AI Compliance Partner. BizGuard gives small business owners personalized legal and accounting guidance in their language. Amira understands your industry, location, and compliance needs.
        </p>
        <div className={styles.heroActions}>
          <button className={styles.btnPrimary} onClick={onGetStarted}>
            Start for free — no credit card
          </button>
          <button className={styles.btnSecondary} onClick={() => scrollTo('how')}>
            See how it works
          </button>
        </div>
        <p className={styles.heroNote}>Free forever plan · No setup required · Works in 10 languages</p>
      </section>

      {/* PROOF BAR */}
      <div className={styles.proofBar}>
        <div className={styles.proofItem}><strong>12</strong> industries</div>
        <div className={styles.proofItem}><strong>10</strong> languages</div>
        <div className={styles.proofItem}><strong>IRS</strong> · DOT · Legal · OSHA</div>
        <div className={styles.proofItem}><strong>Voice</strong> input & output</div>
        <div className={styles.proofItem}><strong>Document</strong> analysis</div>
      </div>

      {/* FEATURES */}
      <section className={styles.section} id="features">
        <div className={styles.sectionLabel}>Features</div>
        <h2 className={styles.sectionTitle}>Everything your business needs to stay protected</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <section className={styles.usecases}>
        <div className={styles.sectionLabel}>Use cases</div>
        <h2 className={styles.sectionTitle}>Real problems Amira solves</h2>
        <div className={styles.usecaseGrid}>
          {USECASES.map((u, i) => (
            <div key={i} className={styles.usecaseCard}>
              <span className={styles.usecaseEmoji}>{u.icon}</span>
              <h4>{u.title}</h4>
              <p>{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.section} id="how">
        <div className={styles.sectionLabel}>How it works</div>
        <h2 className={styles.sectionTitle}>Up and running in minutes</h2>
        <div className={styles.steps}>
          {[
            ['Tell us about your business', 'Answer a few quick questions — industry, state, employees, language. Takes 2 minutes.'],
            ['Meet Amira, your personal advisor', 'Amira knows your profile and gives answers specific to your situation.'],
            ['Ask anything — type or speak', 'Chat like texting a knowledgeable friend. Or upload any document for instant analysis.'],
            ['Get clear answers and action steps', 'No jargon. No runaround. Just exactly what to do next.'],
          ].map(([title, desc], i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNum}>{i + 1}</div>
              <div className={styles.stepContent}>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.testimonials}>
        <div className={styles.sectionLabel}>Testimonials</div>
        <h2 className={styles.sectionTitle}>Small business owners love BizGuard</h2>
        <div className={styles.testimonialsGrid}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={styles.testimonialCard}>
              <div className={styles.stars}>{'★'.repeat(t.stars)}</div>
              <p className={styles.testimonialText}>{t.text}</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.avatar}>{t.initials}</div>
                <div>
                  <div className={styles.testimonialName}>{t.name}</div>
                  <div className={styles.testimonialRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className={styles.industries}>
        <div className={styles.sectionLabel}>Industries</div>
        <h2 className={styles.sectionTitle}>Built for your industry</h2>
        <div className={styles.pills}>
          {INDUSTRIES.map((ind, i) => (
            <div key={i} className={styles.pill}>{ind}</div>
          ))}
        </div>
      </section>

      {/* PRICING (hidden in iOS app per App Store Guideline 3.1.1) */}
      {!IS_IOS_APP && (
      <section className={styles.section} id="pricing">
        <div className={styles.sectionLabel}>Pricing</div>
        <h2 className={styles.sectionTitle}>Simple, honest pricing</h2>
        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <div className={styles.planName}>Free</div>
            <div className={styles.planPrice}>$0<span>/month</span></div>
            <div className={styles.planFeatures}>
              {['10 questions per day', 'Basic compliance guidance', 'All 12 industries', '10 languages + voice'].map((f, i) => (
                <div key={i} className={styles.planFeature}>
                  <span className={styles.check}>✓</span>{f}
                </div>
              ))}
            </div>
            <button className={`${styles.planBtn} ${styles.planBtnSecondary}`} onClick={onGetStarted}>
              Get started free
            </button>
          </div>

          <div className={`${styles.pricingCard} ${styles.pricingFeatured}`}>
            <div className={styles.featuredBadge}>Most Popular</div>
            <div className={styles.planName} style={{ color: '#185FA5' }}>Business Pro</div>
            <div className={styles.planPrice}>$29<span>/month</span></div>
            <div className={styles.planFeatures}>
              {['Unlimited questions', 'Full legal guidance', 'Document analysis', 'IRS notice decoder', 'Contract review', 'Compliance checklists'].map((f, i) => (
                <div key={i} className={styles.planFeature}>
                  <span className={styles.check}>✓</span>{f}
                </div>
              ))}
            </div>
            <button className={`${styles.planBtn} ${styles.planBtnPrimary}`} onClick={onGetStarted}>
              Upgrade to Business Pro
            </button>
          </div>

          <div className={`${styles.pricingCard} ${styles.pricingEnterprise}`}>
            <div className={styles.enterpriseBadge}>Enterprise</div>
            <div className={styles.planName} style={{ color: '#7c3aed' }}>Enterprise</div>
            <div className={styles.planPrice}>$49<span>/month</span></div>
            <div className={styles.planFeatures}>
              {['Everything in Business Pro', 'Multi-user team access', 'Document history', 'Custom reports', 'Dedicated support', 'API access'].map((f, i) => (
                <div key={i} className={styles.planFeature}>
                  <span className={styles.checkEnterprise}>✓</span>{f}
                </div>
              ))}
            </div>
            <button className={`${styles.planBtn} ${styles.planBtnEnterprise}`} onClick={onGetStarted}>
              Upgrade to Enterprise
            </button>
          </div>
        </div>
      </section>
      )}

      {/* CTA */}
      <div className={styles.cta}>
        <h2>Stop flying blind. Protect your business today.</h2>
        <p>Join thousands of small business owners who handle legal and compliance with confidence.</p>
        <button className={styles.ctaBtn} onClick={onGetStarted}>
          Get started free — no credit card
        </button>
        <p className={styles.ctaNote}>{IS_IOS_APP ? 'Free forever plan. No credit card required.' : 'Free forever plan. Business Pro from $29/month.'}</p>
      </div>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <div className={styles.navLogoIcon} style={{ width: 28, height: 28, flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
              </svg>
            </div>
            BizGuard
          </div>
          <p className={styles.footerTagline}>
            AI-powered legal and compliance protection for small business owners.
          </p>
          <p className={styles.footerDisclaimer}>
            © 2025 BizGuard. General guidance only — not a substitute for licensed legal or tax advice.
          </p>
        </div>
      </footer>

    </div>
  )
}
