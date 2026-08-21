import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { IS_IOS_APP, getOfferings, purchasePackage, getActivePlan, getCustomerInfo } from '../../lib/revenuecat'
import styles from './UpgradePage.module.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

// Maps our plan naming to the RevenueCat package identifiers configured in the dashboard
const RC_PACKAGE_IDS = {
  business_monthly: '$rc_monthly',
  business_yearly: '$rc_annual',
  enterprise_monthly: 'enterprise_monthly',
  enterprise_yearly: 'enterprise_yearly',
}

export default function UpgradePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [billing, setBilling] = useState('monthly')
  const [loading, setLoading] = useState('')
  const [offering, setOffering] = useState(null)
  const [activePlan, setActivePlan] = useState('free')
  const firstName = profile?.owner_name?.split(' ')[0] || 'there'

  const prices = {
    business_monthly: 29,
    business_yearly: 19,
    enterprise_monthly: 49,
    enterprise_yearly: 32,
  }

  useEffect(() => {
    if (!IS_IOS_APP) return
    getOfferings().then(setOffering)
    getCustomerInfo().then(info => setActivePlan(getActivePlan(info))).catch(() => {})
  }, [])

  async function handleUpgrade(planType) {
    if (!user) return
    const planId = planType + '_' + billing
    setLoading(planType)

    if (IS_IOS_APP) {
      try {
        const rcId = RC_PACKAGE_IDS[planId]
        const pkg = offering?.availablePackages?.find(p => p.identifier === rcId)
        if (!pkg) throw new Error('This plan is not available for purchase right now.')
        const customerInfo = await purchasePackage(pkg)
        setActivePlan(getActivePlan(customerInfo))
        if (refreshProfile) refreshProfile()
      } catch (err) {
        if (!err?.userCancelled) alert(err?.message || 'Purchase could not be completed. Please try again.')
      } finally {
        setLoading('')
      }
      return
    }

    try {
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
      setLoading('')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Choose Your Plan</h1>
        <p className={styles.subtitle}>Give {firstName} and {profile?.business_name} the full protection they deserve.</p>
        <div className={styles.billingToggle}>
          <button className={`${styles.toggleBtn} ${billing === 'monthly' ? styles.toggleActive : ''}`} onClick={() => setBilling('monthly')}>Monthly</button>
          <button className={`${styles.toggleBtn} ${billing === 'yearly' ? styles.toggleActive : ''}`} onClick={() => setBilling('yearly')}>Yearly <span className={styles.saveBadge}>Save 34%</span></button>
        </div>
      </div>

      <div className={styles.plans}>
        {/* Free */}
        <div className={styles.planCard}>
          <div className={styles.planName}>Free</div>
          <div className={styles.planPrice}><span className={styles.price}>$0</span><span className={styles.period}>/month</span></div>
          <div className={styles.planFeatures}>
            {['10 questions per day','Basic compliance guidance','All 12 industries','6 languages','Voice input & output'].map((f,i) => (
              <div key={i} className={styles.feature}><span className={styles.checkFree}>✓</span>{f}</div>
            ))}
          </div>
          <div className={styles.currentPlanBtn}>Your current plan</div>
        </div>

        {/* Business Pro */}
        <div className={`${styles.planCard} ${styles.planCardPro}`}>
          <div className={styles.popularBadge}>Most Popular</div>
          <div className={styles.planName}>Business Pro</div>
          <div className={styles.planPrice}>
            <span className={styles.price}>${billing === 'monthly' ? prices.business_monthly : prices.business_yearly}</span>
            <span className={styles.period}>/month</span>
          </div>
          {billing === 'yearly' && <p className={styles.planDesc}>$228/year — save $120</p>}
          <div className={styles.planFeatures}>
            {['Unlimited questions with Amira','Full legal guidance','Document upload & analysis','IRS notice decoder','Contract review','Compliance checklists','All 12 industries','6 languages + voice'].map((f,i) => (
              <div key={i} className={styles.feature}><span className={styles.checkPro}>✓</span>{f}</div>
            ))}
          </div>
          {activePlan === 'pro' || activePlan === 'enterprise' ? (
            <div className={styles.currentPlanBtn}>Your current plan</div>
          ) : (
            <button className={styles.upgradeBtn} onClick={() => handleUpgrade('business')} disabled={loading === 'business'}>
              {loading === 'business' ? (IS_IOS_APP ? 'Processing…' : 'Redirecting...') : `Upgrade to Business Pro — $${billing === 'monthly' ? prices.business_monthly : prices.business_yearly}/mo`}
            </button>
          )}
          <p className={styles.guarantee}>Cancel anytime. No contracts.</p>
        </div>

        {/* Enterprise */}
        <div className={`${styles.planCard} ${styles.planCardEnterprise}`}>
          <div className={styles.enterpriseBadge}>Enterprise</div>
          <div className={styles.planName}>Enterprise</div>
          <div className={styles.planPrice}>
            <span className={styles.price}>${billing === 'monthly' ? prices.enterprise_monthly : prices.enterprise_yearly}</span>
            <span className={styles.period}>/month</span>
          </div>
          {billing === 'yearly' && <p className={styles.planDesc}>$384/year — save $204</p>}
          <div className={styles.planFeatures}>
            {['Everything in Business Pro','Priority AI responses','Multi-user team access','Advanced document history','Custom compliance reports','Dedicated support','API access','White-label options'].map((f,i) => (
              <div key={i} className={styles.feature}><span className={styles.checkEnterprise}>✓</span>{f}</div>
            ))}
          </div>
          {activePlan === 'enterprise' ? (
            <div className={styles.currentPlanBtn}>Your current plan</div>
          ) : (
            <button className={styles.upgradeBtn + ' ' + styles.enterpriseBtn} onClick={() => handleUpgrade('enterprise')} disabled={loading === 'enterprise'}>
              {loading === 'enterprise' ? (IS_IOS_APP ? 'Processing…' : 'Redirecting...') : `Upgrade to Enterprise — $${billing === 'monthly' ? prices.enterprise_monthly : prices.enterprise_yearly}/mo`}
            </button>
          )}
          <p className={styles.guarantee}>Cancel anytime. No contracts.</p>
        </div>
      </div>

      <div className={styles.trust}>
        <div className={styles.trustItem}><span>🔒</span><span>{IS_IOS_APP ? 'Secure payments via Apple' : 'Secure payments via Stripe'}</span></div>
        <div className={styles.trustItem}><span>↩️</span><span>Cancel anytime</span></div>
        <div className={styles.trustItem}><span>🛡️</span><span>Built for small business owners</span></div>
      </div>
    </div>
  )
}
