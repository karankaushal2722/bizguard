import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import Chat from '../chat/Chat'
import styles from './AppLayout.module.css'

const NAV_ITEMS = [
  { id: 'chat', label: 'Ask Amira', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  )},
  { id: 'documents', label: 'My Documents', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 12h6M9 16h6M13 3H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9l-7-6z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <path d="M13 3v6h6" stroke="currentColor" strokeWidth="1.75"/>
    </svg>
  )},
  { id: 'compliance', label: 'Compliance', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="currentColor" strokeWidth="1.75"/>
    </svg>
  )},
  { id: 'profile', label: 'My Profile', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  )},
]

const INDUSTRY_LABELS = {
  trucking: 'Trucking & DOT', food: 'Food & Restaurant', construction: 'Construction',
  cleaning: 'Cleaning Services', retail: 'Retail', healthcare: 'Healthcare',
  childcare: 'Childcare', beauty: 'Beauty & Salons', landscaping: 'Landscaping',
  realestate: 'Real Estate', ecommerce: 'E-commerce', other: 'Business',
}

export default function AppLayout() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('chat')

  async function signOut() {
    await supabase.auth.signOut()
  }

  const firstName = profile?.owner_name?.split(' ')[0] || ''
  const industryLabel = INDUSTRY_LABELS[profile?.industry] || 'Business'
  const initials = profile?.owner_name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?'

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
              </svg>
            </div>
            <span>BizGuard</span>
          </div>

          {/* Business badge */}
          <div className={styles.bizBadge}>
            <div className={styles.bizName}>{profile?.business_name}</div>
            <div className={styles.bizIndustry}>{industryLabel} · {profile?.state}</div>
          </div>

          {/* Nav */}
          <nav className={styles.nav}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`${styles.navItem} ${activeTab === item.id ? styles.navActive : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
                {(item.id === 'documents' || item.id === 'compliance') && (
                  <span className={styles.comingSoon}>Soon</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* User footer */}
        <div className={styles.sidebarBottom}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{firstName}</div>
              <div className={styles.userEmail}>{profile?.email || ''}</div>
            </div>
          </div>
          <button className={styles.signOutBtn} onClick={signOut}>Sign out</button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        {activeTab === 'chat' && <Chat />}
        {activeTab === 'documents' && <ComingSoon title="Document Upload" desc="Upload legal notices, contracts, and IRS letters for AI-powered analysis." />}
        {activeTab === 'compliance' && <ComingSoon title="Compliance Checklist" desc="Your personalized checklist of compliance requirements for your industry and state." />}
        {activeTab === 'profile' && <ProfileView profile={profile} />}
      </main>
    </div>
  )
}

function ComingSoon({ title, desc }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔜</div>
      <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>{title}</div>
      <div style={{ fontSize: '14px', maxWidth: '360px', lineHeight: '1.6' }}>{desc}</div>
      <div style={{ fontSize: '12px', marginTop: '8px', padding: '4px 12px', background: 'var(--blue-50)', color: 'var(--blue-500)', borderRadius: '20px', fontWeight: '500' }}>Coming soon</div>
    </div>
  )
}

function ProfileView({ profile }) {
  const INDUSTRY_LABELS = {
    trucking: 'Trucking & Transportation', food: 'Food & Restaurant', construction: 'Construction & Contracting',
    cleaning: 'Cleaning Services', retail: 'Retail', healthcare: 'Healthcare / Home Health',
    childcare: 'Childcare', beauty: 'Beauty & Salons', landscaping: 'Landscaping',
    realestate: 'Real Estate', ecommerce: 'E-commerce', other: 'Other / General Business',
  }
  const BT_LABELS = { sole_prop: 'Sole Proprietor', llc: 'LLC', s_corp: 'S-Corp', c_corp: 'C-Corp', partnership: 'Partnership', nonprofit: 'Nonprofit', not_sure: 'Not sure yet' }
  const EMP_LABELS = { just_me: 'Just me', '2_5': '2–5 employees', '6_15': '6–15 employees', '16_50': '16–50 employees', '50_plus': '50+ employees' }
  const YEAR_LABELS = { less_1: 'Less than 1 year', '1_3': '1–3 years', '3_5': '3–5 years', '5_10': '5–10 years', '10_plus': '10+ years' }
  const LANG_LABELS = { en: 'English', es: 'Español', pt: 'Português', zh: '中文', fr: 'Français', ko: '한국어' }

  const rows = [
    ['Owner', profile?.owner_name],
    ['Business name', profile?.business_name],
    ['Industry', INDUSTRY_LABELS[profile?.industry]],
    ['Business type', BT_LABELS[profile?.business_type]],
    ['State', profile?.state],
    ['Employees', EMP_LABELS[profile?.employees]],
    ['Years in business', YEAR_LABELS[profile?.years_in_business]],
    ['Language', LANG_LABELS[profile?.language]],
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '560px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1.5rem' }}>Your Business Profile</h2>
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {rows.map(([label, value], i) => value && (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 16px', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', fontSize: '14px' }}>
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <strong style={{ color: 'var(--text)' }}>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
