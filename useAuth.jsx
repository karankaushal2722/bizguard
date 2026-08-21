import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { configurePurchases, logInPurchases, logOutPurchases } from '../lib/revenuecat'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  configurePurchases()

  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null)
    if (session?.user) {
      fetchProfile(session.user.id)
      logInPurchases(session.user.id)
    } else {
      setLoading(false)
    }
  })

          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
              fetchProfile(session.user.id)
              logInPurchases(session.user.id)
            } else {
              setProfile(null)
              setLoading(false)
              logOutPurchases()
            }
          })

          return () => subscription.unsubscribe()
}, [])

async function fetchProfile(userId) {
  const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
  setProfile(data)
  setLoading(false)
}

async function signOut() {
  try { await supabase.auth.signOut() } catch (e) { console.error('signOut error:', e) }
  try { await logOutPurchases() } catch (e) { console.error('RevenueCat signOut error:', e) }
  setUser(null)
  setProfile(null)
}

async function refreshProfile() {
  if (user) await fetchProfile(user.id)
}

const value = { user, profile, loading, refreshProfile, signOut }

return <AuthContext.Provider value={value} children={children} />
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
