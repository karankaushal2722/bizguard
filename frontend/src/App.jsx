import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthPage from './components/auth/AuthPage'
import Onboarding from './components/onboarding/Onboarding'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './components/landing/LandingPage'
import PrivacyPolicy from './components/legal/PrivacyPolicy'
import Terms from './components/legal/Terms'
import './styles/global.css'

function AppRoutes() {
  const { user, profile, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Public legal routes — no auth needed
  if (path === '/privacy') return <PrivacyPolicy />
  if (path === '/terms') return <Terms />

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, background: 'var(--dark-900)' }}>
        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#F97316,#7C3AED)', borderRadius: 12 }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading...</p>
      </div>
    )
  }

  if (!user) {
    if (showAuth) return <AuthPage onBack={() => setShowAuth(false)} />
    return <LandingPage onGetStarted={() => setShowAuth(true)} />
  }

  if (!profile) return <Onboarding />

  return <AppLayout />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
