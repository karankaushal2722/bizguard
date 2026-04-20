import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import styles from './UpgradePage.module.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function UpgradePage() {
  const { user, profile } = useAuth()
  const [billing, setBilling] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const monthlyPrice = 29
  const yearlyPrice = 19
  const firstName = profile?.owner_name?.split(' ')[0] || 'there'

  async function handleUpgrade() {
    if (!user) return
    setLoading(true)
    try {
      const planId = billing === 'monthly' ? 'pro_monthly' : 'pro_yearly'
      const res = await fetch(API_BASE + '/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userEmail: user.email, planId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error(data.error)
    } catch (err) {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const price = billing === 'monthly' ? monthlyPrice : yearlyPrice

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Upgrade to BizGuard Pro</h1>
        <p className={styles.subtitle}>Give {firstName} and {profile?.business_name} the full protection they deserve.</p>
        <div className={styles.billingToggle}>
          <button className={`${styles.toggleBtn} ${billing === 'monthly' ? styles.toggleActive : ''}`} onClick={() => setBilling('monthly')}>Monthly</button>
          <button className={`${styles.toggleBtn} ${billing === 'yearly' ? styles.toggleActive : ''}`} onClick={() => setBilling('yearly')}>Yearly <span className={styles.saveBadge}>Save 34%</span></button>
        </div>
      </div>
      <div className={styles.plans}>
        <div className={styles.planCard}>
          <div className={styles.planName}>Free</div>
          <div className={styles.planPrice}><span className={styles.price}>$0</span><span className={styles.period}>/month</span></div>
          <div className={styles.planFeatures}>
            {['10 questions per day','Basic compliance guidance','All 12 industries','6 languages','Voice input & output'].map((f,i) => (<div key={i} className={styles.feature}><span className={styles.checkFree}>checkmark</span>{f}</div>))}
          </div>
          <div className={styles.currentPlanBtn}>Your current plan</div>
        </div>
        <div className={`${styles.planCard} ${styles.planCardPro}`}>
          <div className={styles.popularBadge}>Most Popular</div>
          <div className={styles.planName}>Pro</div>
          <div className={styles.planPrice}><span className={styles.price}>${price}</span><span className={styles.period}>/month</span></div>
          <div className={styles.planFeatures}>
            {['Unlimited questions with Amira','Full legal guidance','Document upload & analysis','IRS notice decoder','Contract review','Compliance checklists'].map((f,i) => (<div key={i} className={styles.feature}><span className={styles.checkPro}>checkmark</span>{f}</div>))}
          </div>
          <button className={styles.upgradeBtn} onClick={handleUpgrade} disabled={loading}>{loading ? 'Redirecting...' : `Upgrade to Pro — $${price}/mo`}</button>
          <p className={styles.guarantee}>Cancel anytime. No contracts.</p>
        </div>
      </div>
      <div className={styles.trust}>
        <div className={styles.trustItem}>Secure payments via Stripe</div>
        <div className={styles.trustItem}>Cancel anytime</div>
      </div>
    </div>
  )
}
