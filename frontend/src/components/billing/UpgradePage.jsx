import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { IS_IOS_APP, getOfferings, purchasePackage, restorePurchases, getActivePlan, getCustomerInfo } from '../../lib/revenuecat'
import styles from './UpgradePage.module.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

// Guideline 3.1.2(c): functional Terms of Use (EULA) + Privacy Policy links must be
// inside the purchase flow. Absolute URLs so they open in the system browser from the iOS app.
// The app's License Agreement in App Store Connect is Apple's Standard EULA (same link as the App Description).
const EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/'
const TERMS_URL = 'https://bizguard.co/terms'
const PRIVACY_URL = 'https://bizguard.co/privacy'

const PLAN_TITLES = {
  business: 'BizGuard Pro',
  enterprise: 'BizGuard Enterprise',
}

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(amount)
  } catch {
    return `$${amount.toFixed(2)}`
  }
}

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

  // iOS: always show the real App Store price/period for the selected plan, never a hardcoded number.
  // Returns null on web (Stripe) or until the offering has loaded.
  function storeInfo(planType, period) {
    if (!IS_IOS_APP) return null
    const rcId = RC_PACKAGE_IDS[planType + '_' + period]
    const product = offering?.availablePackages?.find(p => p.identifier === rcId)?.product
    if (!product || typeof product.price !== 'number') return null
    return {
      priceString: product.priceString,
      price: product.price,
      currency: product.currencyCode,
      title: product.title,
    }
  }

  // What the paywall needs to show for a plan (title, length, price, per-unit price).
  function planDisplay(planType) {
    const period = billing
    const webMonthly = prices[planType + '_' + period]
    if (!IS_IOS_APP) {
      return {
        big: `$${webMonthly}`,
        per: '/month',
        note: period === 'yearly' ? (planType === 'business' ? '$228/year — save $120' : '$384/year — save $204') : null,
        button: `$${webMonthly}/mo`,
        subscription: null,
      }
    }
    const info = storeInfo(planType, period)
    if (!info) return { big: '…', per: '', note: 'Loading price from the App Store…', button: '', subscription: null, loaded: false }
    const monthlyInfo = storeInfo(planType, 'monthly')
    const unit = period === 'yearly' ? 'year' : 'month'
    let note = period === 'yearly'
      ? `Billed ${info.priceString} once a year (about ${formatMoney(info.price / 12, info.currency)}/month)`
      : `Billed ${info.priceString} every month`
    if (period === 'yearly' && monthlyInfo) {
      const savePct = Math.round((1 - info.price / (monthlyInfo.price * 12)) * 100)
      if (savePct > 0) note += ` — save ${savePct}%`
    }
    return {
      big: info.priceString,
      per: `/${unit}`,
      note,
      button: `${info.priceString}/${unit === 'year' ? 'yr' : 'mo'}`,
      subscription: `${info.title || `${PLAN_TITLES[planType]} ${period === 'yearly' ? 'Yearly' : 'Monthly'}`} · ${period === 'yearly' ? '1 year' : '1 month'} · auto-renews`,
      loaded: true,
    }
  }

  async function handleRestore() {
    setLoading('restore')
    try {
      const info = await restorePurchases()
      setActivePlan(getActivePlan(info))
      if (refreshProfile) refreshProfile()
      alert(getActivePlan(info) === 'free' ? 'No previous purchases were found for this Apple ID.' : 'Your purchases have been restored.')
    } catch (err) {
      alert(err?.message || 'Could not restore purchases. Please try again.')
    } finally {
      setLoading('')
    }
  }

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
          <button className={`${styles.toggleBtn} ${billing === 'yearly' ? styles.toggleActive : ''}`} onClick={() => setBilling('yearly')}>Yearly {!IS_IOS_APP && <span className={styles.saveBadge}>Save 34%</span>}</button>
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
            <span className={styles.price}>{planDisplay('business').big}</span>
            <span className={styles.period}>{planDisplay('business').per}</span>
          </div>
          {planDisplay('business').subscription && <p className={styles.planDesc}>{planDisplay('business').subscription}</p>}
          {planDisplay('business').note && <p className={styles.planDesc}>{planDisplay('business').note}</p>}
          <div className={styles.planFeatures}>
            {['Unlimited questions with Amira','Full legal guidance','Document upload & analysis','IRS notice decoder','Contract review','Compliance checklists','All 12 industries','6 languages + voice'].map((f,i) => (
              <div key={i} className={styles.feature}><span className={styles.checkPro}>✓</span>{f}</div>
            ))}
          </div>
          {activePlan === 'pro' || activePlan === 'enterprise' ? (
            <div className={styles.currentPlanBtn}>Your current plan</div>
          ) : (
            <button className={styles.upgradeBtn} onClick={() => handleUpgrade('business')} disabled={loading === 'business' || (IS_IOS_APP && !planDisplay('business').loaded)}>
              {loading === 'business' ? (IS_IOS_APP ? 'Processing…' : 'Redirecting...') : `Upgrade to Business Pro${planDisplay('business').button ? ' — ' + planDisplay('business').button : ''}`}
            </button>
          )}
          <p className={styles.guarantee}>Cancel anytime. No contracts.</p>
        </div>

        {/* Enterprise */}
        <div className={`${styles.planCard} ${styles.planCardEnterprise}`}>
          <div className={styles.enterpriseBadge}>Enterprise</div>
          <div className={styles.planName}>Enterprise</div>
          <div className={styles.planPrice}>
            <span className={styles.price}>{planDisplay('enterprise').big}</span>
            <span className={styles.period}>{planDisplay('enterprise').per}</span>
          </div>
          {planDisplay('enterprise').subscription && <p className={styles.planDesc}>{planDisplay('enterprise').subscription}</p>}
          {planDisplay('enterprise').note && <p className={styles.planDesc}>{planDisplay('enterprise').note}</p>}
          <div className={styles.planFeatures}>
            {['Everything in Business Pro','Priority AI responses','Multi-user team access','Advanced document history','Custom compliance reports','Dedicated support','API access','White-label options'].map((f,i) => (
              <div key={i} className={styles.feature}><span className={styles.checkEnterprise}>✓</span>{f}</div>
            ))}
          </div>
          {activePlan === 'enterprise' ? (
            <div className={styles.currentPlanBtn}>Your current plan</div>
          ) : (
            <button className={styles.upgradeBtn + ' ' + styles.enterpriseBtn} onClick={() => handleUpgrade('enterprise')} disabled={loading === 'enterprise' || (IS_IOS_APP && !planDisplay('enterprise').loaded)}>
              {loading === 'enterprise' ? (IS_IOS_APP ? 'Processing…' : 'Redirecting...') : `Upgrade to Enterprise${planDisplay('enterprise').button ? ' — ' + planDisplay('enterprise').button : ''}`}
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

      {/* Guideline 3.1.2(c): subscription terms + functional EULA / Privacy links in the purchase flow */}
      <div className={styles.legal}>
        {IS_IOS_APP && (
          <p>
            Payment will be charged to your Apple ID account at confirmation of purchase. Subscriptions automatically
            renew for the same period and price unless canceled at least 24 hours before the end of the current
            period. You can manage or cancel your subscription anytime in your App Store account settings.
          </p>
        )}
        <p className={styles.legalLinks}>
          <a href={EULA_URL} target="_blank" rel="noopener noreferrer">Terms of Use (EULA)</a>
          <span aria-hidden="true"> · </span>
          <a href={TERMS_URL} target="_blank" rel="noopener noreferrer">Terms of Service</a>
          <span aria-hidden="true"> · </span>
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          {IS_IOS_APP && (
            <>
              <span aria-hidden="true"> · </span>
              <button type="button" className={styles.restoreBtn} onClick={handleRestore} disabled={loading === 'restore'}>
                {loading === 'restore' ? 'Restoring…' : 'Restore Purchases'}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
