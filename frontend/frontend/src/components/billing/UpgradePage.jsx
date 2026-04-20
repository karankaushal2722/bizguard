import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import styles from './UpgradePage.module.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

const FEATURES_FREE = [
  '10 questions per day with Amira',
  'Basic compliance guidance',
  'All 12 industries supported',
  '6 languages supported',
  'Voice input & output',
]

const FEATURES_PRO = [
  'Unlimited questions with Amira',
  'Full legal & compliance guidance',
  'Document upload & analysis',
  'IRS notice decoder',
  'Contract review',
  'Compliance checklists',
  'Priority response speed',
  'Conversation history (90 days)',
  'All 12 industries + custom',
  '6 languages supported',
  'Voice input & output',
]

export default function UpgradePage() {
  const { user, profile } = useAuth()
  const [billing, setBilling] = useState('monthly') // 'monthly' | 'yearly'
  const [loading, setLoading] = useState(false)

  const monthlyPrice = 29
  const yearlyPrice = 19 // per month billed yearly
  const currentPrice = billing === 'monthly' ? monthlyPrice : yearlyPrice

  async function handleUpgrade() {
    if (!user) return
    setLoading(true)
    try {
      const planId = billing === 'monthly' ? 'pro_monthly' : 'pro_yearly'
      const res = await fetch(`${API_BASE}/api/stripe/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          planId,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error(data.error)
    } catch (err) {
      alert('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const firstName = profile?.owner_name?.split(' ')[0] || 'there'

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Upgrade to BizGuard Pro</h1>
        <p className={styles.subtitle}>
          Give {firstName} and {profile?.business_name} the full protection they deserve.
        </p>

        {/* Billing toggle */}
        <div className={styles.billingToggle}>
          <button
            className={`${styles.toggleBtn} ${billing === 'monthly' ? styles.toggleActive : ''}`}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
          <button
            className={`${styles.toggleBtn} ${billing === 'yearly' ? styles.toggleActive : ''}`}
            onClick={() => setBilling('yearly')}
          >
            Yearly
            <span className={styles.saveBadge}>Save 34%</span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className={styles.plans}>
        {/* Free plan */}
        <div className={styles.planCard}>
          <div className={styles.planHeader}>
            <div className={styles.planName}>Free</div>
            <div className={styles.planPrice}>
              <span className={styles.price}>$0</span>
              <span className={styles.period}>/month</span>
            </div>
            <p className={styles.planDesc}>Get started with Amira</p>
          </div>
          <div className={styles.planFeatures}>
            {FEATURES_FREE.map((f, i) => (
              <div key={i} className={styles.feature}>
                <span className={styles.checkFree}>✓</span>
                {f}
              </div>
            ))}
          </div>
          <div className={styles.planFooter}>
            <div className={styles.currentPlanBtn}>Your current plan</div>
          </div>
        </div>

        {/* Pro plan */}
        <div className={`${styles.planCard} ${styles.planCardPro}`}>
          <div className={styles.popularBadge}>Most Popular</div>
          <div className={styles.planHeader}>
            <div className={styles.planName}>Pro</div>
            <div className={styles.planPrice}>
              <span className={styles.price}>${currentPrice}</span>
              <span className={styles.period}>/month</span>
            </div>
            <p className={styles.planDesc}>
              {billing === 'yearly'
                ? `$${yearlyPrice * 12}/year — save $${(monthlyPrice - yearlyPrice) * 12}`
                : 'Full protection for your business'}
            </p>
          </div>
          <div className={styles.planFeatures}>
            {FEATURES_PRO.map((f, i) => (
              <div key={i} className={styles.feature}>
                <span className={styles.checkPro}>✓</span>
                {f}
              </div>
            ))}
          </div>
          <div className={styles.planFooter}>
            <button
              className={styles.upgradeBtn}
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? 'Redirecting...' : `Upgrade to Pro — $${currentPrice}/mo`}
            </button>
            <p className={styles.guarantee}>
              Cancel anytime. No contracts.
            </p>
          </div>
        </div>
      </div>

      {/* Trust signals */}
      <div className={styles.trust}>
        <div className={styles.trustItem}>
          <span>🔒</span>
          <span>Secure payments via Stripe</span>
        </div>
        <div className={styles.trustItem}>
          <span>↩️</span>
          <span>Cancel anytime</span>
        </div>
        <div className={styles.trustItem}>
          <span>🛡️</span>
          <span>Built for small business owners</span>
        </div>
      </div>
    </div>
  )
}
