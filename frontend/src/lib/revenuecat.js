import { Capacitor } from '@capacitor/core'
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor'

// Public (not secret) RevenueCat API key — safe to ship in client apps.
// Set VITE_REVENUECAT_IOS_KEY in your build environment (Vercel/Codemagic).
const REVENUECAT_IOS_KEY = import.meta.env.VITE_REVENUECAT_IOS_KEY || ''

export const IS_IOS_APP = typeof window !== 'undefined' && Capacitor?.getPlatform?.() === 'ios'

// Entitlement identifiers configured in the RevenueCat dashboard
export const ENTITLEMENTS = {
  PRO: 'BizGuard Pro',
  ENTERPRISE: 'BizGuard Enterprise',
}

let configured = false

export async function configurePurchases(appUserId) {
  if (!IS_IOS_APP || configured) return
  if (!REVENUECAT_IOS_KEY) {
    console.warn('Missing VITE_REVENUECAT_IOS_KEY — RevenueCat will not be configured.')
    return
  }
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.WARN })
    await Purchases.configure({ apiKey: REVENUECAT_IOS_KEY, appUserID: appUserId || undefined })
    configured = true
  } catch (err) {
    console.error('RevenueCat configure error:', err)
  }
}

export async function logInPurchases(appUserId) {
  if (!IS_IOS_APP || !configured || !appUserId) return
  try {
    await Purchases.logIn({ appUserID: appUserId })
  } catch (err) {
    console.error('RevenueCat logIn error:', err)
  }
}

export async function logOutPurchases() {
  if (!IS_IOS_APP || !configured) return
  try {
    await Purchases.logOut()
  } catch (err) {
    console.error('RevenueCat logOut error:', err)
  }
}

// Returns the "default" Offering with its packages, or null on failure.
export async function getOfferings() {
  if (!IS_IOS_APP) return null
  try {
    const result = await Purchases.getOfferings()
    return result?.current || null
  } catch (err) {
    console.error('RevenueCat getOfferings error:', err)
    return null
  }
}

// pkg is a RevenueCat Package object from an Offering's availablePackages
export async function purchasePackage(pkg) {
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })
  return customerInfo
}

export async function restorePurchases() {
  const { customerInfo } = await Purchases.restorePurchases()
  return customerInfo
}

export async function getCustomerInfo() {
  const { customerInfo } = await Purchases.getCustomerInfo()
  return customerInfo
}

export function hasEntitlement(customerInfo, entitlementId) {
  return !!customerInfo?.entitlements?.active?.[entitlementId]
}

// Convenience: derive the user's current plan from CustomerInfo
export function getActivePlan(customerInfo) {
  if (!customerInfo) return 'free'
  if (hasEntitlement(customerInfo, ENTITLEMENTS.ENTERPRISE)) return 'enterprise'
  if (hasEntitlement(customerInfo, ENTITLEMENTS.PRO)) return 'pro'
  return 'free'
}
