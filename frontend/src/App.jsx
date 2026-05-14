import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import AuthPage from './components/auth/AuthPage'
import Onboarding from './components/onboarding/Onboarding'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './components/landing/LandingPage'
import './styles/global.css'

function AppRoutes() {
  const { user, profile, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--blue-500)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
          </svg>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading BizGuard...</div>
      </div>
    )
  }

  if (user && profile?.onboarding_complete) return <AppLayout />
  if (user && !profile?.onboarding_complete) return <Onboarding />
  if (showAuth) return <AuthPage onBack={() => setShowAuth(false)} />
  return <LandingPage onGetStarted={() => setShowAuth(true)} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
