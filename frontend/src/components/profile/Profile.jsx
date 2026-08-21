import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import styles from './Profile.module.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function Profile() {
  const { user, profile, signOut } = useAuth()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const initials = (profile?.owner_name?.split(' ')[0] || user?.email || 'K').substring(0, 2).toUpperCase()

  async function handleDeleteAccount() {
    if (!user) return
    setDeleting(true)
    setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(API_BASE + '/api/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Could not delete your account. Please try again.')
      }
      await signOut()
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Profile</h1>
        <p className={styles.subtitle}>Manage your account and business details.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.avatarRow}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <div className={styles.name}>{profile?.owner_name || 'Business Owner'}</div>
            <div className={styles.email}>{user?.email}</div>
          </div>
        </div>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Business</div>
            <div className={styles.infoValue}>{profile?.business_name || '—'}</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>Industry</div>
            <div className={styles.infoValue}>{profile?.industry || '—'}</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoLabel}>State</div>
            <div className={styles.infoValue}>{profile?.state || '—'}</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Sign out</h2>
        <p className={styles.sectionDesc}>Sign out of BizGuard on this device.</p>
        <button className={styles.signOutBtn} onClick={signOut}>Sign out</button>
      </div>

      <div className={`${styles.card} ${styles.dangerCard}`}>
        <h2 className={styles.sectionTitle}>Delete account</h2>
        <p className={styles.sectionDesc}>
          Permanently delete your BizGuard account and all associated data, including your chat history,
          uploaded documents, and business profile. This cannot be undone.
        </p>
        {!confirmOpen ? (
          <button className={styles.deleteBtn} onClick={() => setConfirmOpen(true)}>Delete my account</button>
        ) : (
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>
              Type <strong>DELETE</strong> below to permanently delete your account.
            </p>
            <input
              className={styles.confirmInput}
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoCapitalize="characters"
              disabled={deleting}
            />
            {error && <p className={styles.errorText}>{error}</p>}
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => { setConfirmOpen(false); setConfirmText(''); setError('') }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className={styles.confirmDeleteBtn}
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'DELETE' || deleting}
              >
                {deleting ? 'Deleting…' : 'Permanently delete account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
