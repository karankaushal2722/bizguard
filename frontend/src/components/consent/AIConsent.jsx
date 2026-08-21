import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import styles from './AIConsent.module.css'

export default function AIConsent() {
  const { user, signOut, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAgree() {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ ai_consent_at: new Date().toISOString() })
        .eq('id', user.id)
      if (updateErr) throw updateErr
      if (refreshProfile) await refreshProfile()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </div>

        <h1 className={styles.title}>Before you start chatting with Amira</h1>

        <p className={styles.body}>
          BizGuard's AI advisor, Amira, is powered by <strong>Anthropic's Claude AI</strong>, a third-party AI service.
        </p>
        <p className={styles.body}>
          When you ask Amira a question or upload a document for analysis, we send that message — along with
          relevant business details you've provided (like your industry and state) — to Anthropic's servers so
          Claude can generate a response for you.
        </p>
        <p className={styles.body}>
          Anthropic does not use this data to train its models, and BizGuard does not sell your data to anyone.
          You can read the full details in our{' '}
          <a href="/privacy" className={styles.link}>Privacy Policy</a>.
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.agreeBtn} onClick={handleAgree} disabled={loading}>
          {loading ? 'Saving…' : 'I Agree & Continue'}
        </button>
        <button className={styles.signOutBtn} onClick={signOut} disabled={loading}>
          Sign out instead
        </button>
      </div>
    </div>
  )
}
