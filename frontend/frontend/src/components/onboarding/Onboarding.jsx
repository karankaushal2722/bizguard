import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import styles from './Onboarding.module.css'

const INDUSTRIES = [
  { id: 'trucking', label: 'Trucking & Transportation', icon: '🚛', agencies: ['DOT', 'FMCSA', 'IRS'] },
  { id: 'food', label: 'Food & Restaurant', icon: '🍽️', agencies: ['FDA', 'Health Dept', 'IRS'] },
  { id: 'construction', label: 'Construction & Contracting', icon: '🔨', agencies: ['OSHA', 'EPA', 'IRS'] },
  { id: 'cleaning', label: 'Cleaning Services', icon: '🧹', agencies: ['OSHA', 'IRS', 'Labor Dept'] },
  { id: 'retail', label: 'Retail', icon: '🛍️', agencies: ['IRS', 'Sales Tax', 'Labor Dept'] },
  { id: 'healthcare', label: 'Healthcare / Home Health', icon: '🏥', agencies: ['CMS', 'FDA', 'HIPAA'] },
  { id: 'childcare', label: 'Childcare', icon: '👶', agencies: ['State Licensing', 'IRS', 'Labor Dept'] },
  { id: 'beauty', label: 'Beauty & Salons', icon: '💈', agencies: ['State Board', 'IRS', 'OSHA'] },
  { id: 'landscaping', label: 'Landscaping', icon: '🌿', agencies: ['EPA', 'IRS', 'Labor Dept'] },
  { id: 'realestate', label: 'Real Estate', icon: '🏠', agencies: ['State Board', 'IRS', 'Fair Housing'] },
  { id: 'ecommerce', label: 'E-commerce', icon: '📦', agencies: ['FTC', 'IRS', 'Sales Tax'] },
  { id: 'other', label: 'Other / General Business', icon: '💼', agencies: ['IRS', 'Labor Dept', 'State Agencies'] },
]

const BUSINESS_TYPES = [
  { id: 'sole_prop', label: 'Sole Proprietor', desc: 'Just me, no formal entity' },
  { id: 'llc', label: 'LLC', desc: 'Limited Liability Company' },
  { id: 's_corp', label: 'S-Corp', desc: 'S Corporation' },
  { id: 'c_corp', label: 'C-Corp', desc: 'C Corporation' },
  { id: 'partnership', label: 'Partnership', desc: 'Two or more partners' },
  { id: 'nonprofit', label: 'Nonprofit', desc: '501(c)(3) or similar' },
  { id: 'not_sure', label: "I'm not sure", desc: "BizGuard will help you figure it out" },
]

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Español', native: 'Spanish' },
  { code: 'pt', label: 'Português', native: 'Portuguese' },
  { code: 'zh', label: '中文', native: 'Chinese' },
  { code: 'fr', label: 'Français', native: 'French' },
  { code: 'ko', label: '한국어', native: 'Korean' },
]

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','District of Columbia',
]

const EMPLOYEES = [
  { id: 'just_me', label: 'Just me' },
  { id: '2_5', label: '2–5 employees' },
  { id: '6_15', label: '6–15 employees' },
  { id: '16_50', label: '16–50 employees' },
  { id: '50_plus', label: '50+ employees' },
]

const STEPS = ['Language', 'Your Business', 'Business Details', 'Almost Done']

export default function Onboarding({ onComplete }) {
  const { user, refreshProfile } = useAuth()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    language: 'en',
    business_name: '',
    owner_name: '',
    industry: '',
    business_type: '',
    state: '',
    employees: '',
    years_in_business: '',
  })

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function canProceed() {
    if (step === 0) return !!form.language
    if (step === 1) return !!form.business_name && !!form.owner_name && !!form.industry
    if (step === 2) return !!form.business_type && !!form.state
    if (step === 3) return !!form.employees
    return false
  }

  async function finish() {
    setSaving(true)
    setError('')
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        ...form,
        onboarding_complete: true,
        created_at: new Date().toISOString(),
      })
      if (error) throw error
      await refreshProfile()
      onComplete?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
              </svg>
            </div>
            BizGuard
          </div>
          <div className={styles.steps}>
            {STEPS.map((s, i) => (
              <div key={i} className={`${styles.step} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
                <div className={styles.stepDot}>{i < step ? '✓' : i + 1}</div>
                <span className={styles.stepLabel}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 0: Language */}
        {step === 0 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Choose your language</h2>
            <p className={styles.stepDesc}>BizGuard will communicate with you in the language you're most comfortable with.</p>
            <div className={styles.langGrid}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  className={`${styles.optionCard} ${form.language === l.code ? styles.optionSelected : ''}`}
                  onClick={() => set('language', l.code)}
                >
                  <div className={styles.optionLabel}>{l.label}</div>
                  <div className={styles.optionDesc}>{l.native}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Business basics */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Tell us about your business</h2>
            <p className={styles.stepDesc}>This helps BizGuard give you advice that's specific to your situation.</p>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Your name</label>
              <input
                className={styles.input}
                placeholder="First and last name"
                value={form.owner_name}
                onChange={e => set('owner_name', e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Business name</label>
              <input
                className={styles.input}
                placeholder="Your business name"
                value={form.business_name}
                onChange={e => set('business_name', e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Industry</label>
              <div className={styles.industryGrid}>
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind.id}
                    className={`${styles.industryCard} ${form.industry === ind.id ? styles.optionSelected : ''}`}
                    onClick={() => set('industry', ind.id)}
                  >
                    <span className={styles.industryIcon}>{ind.icon}</span>
                    <span className={styles.industryLabel}>{ind.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Business details */}
        {step === 2 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Business structure & location</h2>
            <p className={styles.stepDesc}>These details help us give you the right legal and tax guidance.</p>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Business type</label>
              <div className={styles.typeGrid}>
                {BUSINESS_TYPES.map(bt => (
                  <button
                    key={bt.id}
                    className={`${styles.typeCard} ${form.business_type === bt.id ? styles.optionSelected : ''}`}
                    onClick={() => set('business_type', bt.id)}
                  >
                    <div className={styles.typeLabel}>{bt.label}</div>
                    <div className={styles.typeDesc}>{bt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>State of operation</label>
              <select
                className={styles.select}
                value={form.state}
                onChange={e => set('state', e.target.value)}
              >
                <option value="">Select your state...</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Final details */}
        {step === 3 && (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Almost there, {form.owner_name.split(' ')[0]}!</h2>
            <p className={styles.stepDesc}>Two quick questions and BizGuard will be fully set up for you.</p>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>How many people work in your business?</label>
              <div className={styles.empGrid}>
                {EMPLOYEES.map(e => (
                  <button
                    key={e.id}
                    className={`${styles.empCard} ${form.employees === e.id ? styles.optionSelected : ''}`}
                    onClick={() => set('employees', e.id)}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>How long have you been in business? <span className={styles.optional}>(optional)</span></label>
              <select
                className={styles.select}
                value={form.years_in_business}
                onChange={e => set('years_in_business', e.target.value)}
              >
                <option value="">Select...</option>
                <option value="less_1">Less than 1 year</option>
                <option value="1_3">1–3 years</option>
                <option value="3_5">3–5 years</option>
                <option value="5_10">5–10 years</option>
                <option value="10_plus">10+ years</option>
              </select>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryTitle}>Your BizGuard profile</div>
              <div className={styles.summaryRow}><span>Name</span><strong>{form.owner_name}</strong></div>
              <div className={styles.summaryRow}><span>Business</span><strong>{form.business_name}</strong></div>
              <div className={styles.summaryRow}><span>Industry</span><strong>{INDUSTRIES.find(i => i.id === form.industry)?.label}</strong></div>
              <div className={styles.summaryRow}><span>Structure</span><strong>{BUSINESS_TYPES.find(b => b.id === form.business_type)?.label}</strong></div>
              <div className={styles.summaryRow}><span>State</span><strong>{form.state}</strong></div>
              <div className={styles.summaryRow}><span>Language</span><strong>{LANGUAGES.find(l => l.code === form.language)?.label}</strong></div>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className={styles.footer}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.nav}>
            {step > 0 && (
              <button className={styles.btnBack} onClick={() => setStep(s => s - 1)}>
                ← Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 3 ? (
              <button
                className={styles.btnNext}
                disabled={!canProceed()}
                onClick={() => setStep(s => s + 1)}
              >
                Continue →
              </button>
            ) : (
              <button
                className={styles.btnNext}
                disabled={!canProceed() || saving}
                onClick={finish}
              >
                {saving ? 'Setting up...' : 'Start using BizGuard →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
