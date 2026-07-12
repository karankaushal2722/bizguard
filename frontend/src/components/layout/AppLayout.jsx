import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Chat from '../chat/Chat'
import DocumentUpload from '../documents/DocumentUpload'
import UpgradePage from '../billing/UpgradePage'
import styles from './AppLayout.module.css'

// Apple App Store Guideline 3.1.1: hide external purchase UI in the iOS app
const IS_IOS_APP = typeof window !== 'undefined' && window.Capacitor?.getPlatform?.() === 'ios'

const NAV_ITEMS = [
  {
    id: 'chat',
    label: 'Ask Amira',
    shortLabel: 'Amira',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    id: 'documents',
    label: 'My Documents',
    shortLabel: 'Docs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
      </svg>
    ),
  },
  {
    id: 'compliance',
    label: 'Compliance',
    shortLabel: 'Comply',
    soon: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'My Profile',
    shortLabel: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: 'upgrade',
    label: 'Upgrade to Pro',
    shortLabel: 'Upgrade',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    ),
  },
]

const VISIBLE_NAV_ITEMS = IS_IOS_APP ? NAV_ITEMS.filter(item => item.id !== 'upgrade') : NAV_ITEMS

export default function AppLayout() {
  const { user, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('chat')
  const [drawerOpen, setDrawerOpen] = useState(false)

  const firstName = profile?.owner_name?.split(' ')[0] || user?.email?.split('@')[0] || 'K'
  const initials = firstName.substring(0, 2).toUpperCase()

  function renderContent() {
    switch (activeTab) {
      case 'chat': return <Chat />
      case 'documents': return <DocumentUpload />
      case 'upgrade': return IS_IOS_APP ? <Chat /> : <UpgradePage />
      default: return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', flexDirection: 'column', gap: 12 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z"/></svg>
          <p style={{ fontSize: 15, fontWeight: 600 }}>Coming soon</p>
        </div>
      )
    }
  }

  const SidebarContent = () => (
    <>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
          </svg>
        </div>
        BizGuard
      </div>
      {profile && (
        <div className={styles.bizBadge}>
          <div className={styles.bizName}>{profile.business_name}</div>
          <div className={styles.bizIndustry}>{profile.industry} · {profile.state}</div>
        </div>
      )}
      <nav className={styles.nav}>
        {VISIBLE_NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeTab === item.id ? styles.navActive : ''} ${item.id === 'upgrade' ? styles.navUpgrade : ''}`}
            onClick={() => { setActiveTab(item.id); setDrawerOpen(false); }}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
            {item.soon && <span className={styles.comingSoon}>Soon</span>}
          </button>
        ))}
      </nav>
    </>
  )

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}><SidebarContent /></div>
        <div className={styles.sidebarBottom}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{profile?.owner_name || user?.email}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button className={styles.signOutBtn} onClick={signOut}>Sign out</button>
        </div>
      </aside>

      <div className={`${styles.drawerOverlay} ${drawerOpen ? styles.drawerOverlayOpen : ''}`} onClick={() => setDrawerOpen(false)} />

      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerTop}><SidebarContent /></div>
        <div className={styles.drawerBottom}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{profile?.owner_name || user?.email}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button className={styles.signOutBtn} onClick={signOut}>Sign out</button>
        </div>
      </div>

      <main className={styles.main}>
        <header className={styles.mobileHeader}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setDrawerOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className={styles.mobileLogoRow}>
            <div className={styles.logoIcon} style={{ width: 28, height: 28 }}>
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
              </svg>
            </div>
            BizGuard
          </div>
          <button className={styles.mobileAvatarBtn} onClick={() => setDrawerOpen(true)}>{initials}</button>
        </header>
        {renderContent()}
      </main>

      <nav className={styles.bottomNav}>
        <div className={styles.bottomNavInner}>
          {VISIBLE_NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`${styles.bottomNavItem} ${activeTab === item.id ? styles.bottomNavActive : ''} ${item.id === 'upgrade' ? styles.bottomNavUpgrade : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={styles.bottomNavIcon}>{item.icon}</span>
              <span className={styles.bottomNavLabel}>{item.shortLabel}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
