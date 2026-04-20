import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import styles from './AuthPage.module.css'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'zh', label: '中文' },
  { code: 'fr', label: 'Français' },
  { code: 'ko', label: '한국어' },
]

const UI_TEXT = {
  en: { title: 'Protect your business', subtitle: 'Sign in or create your free account', emailPlaceholder: 'Email address', passwordPlaceholder: 'Password', signin: 'Sign in', signup: 'Create free account', toggle_signin: 'Already have an account? Sign in', toggle_signup: "Don't have an account? Sign up free", loading: 'Please wait...', error_label: 'Error' },
  es: { title: 'Protege tu negocio', subtitle: 'Inicia sesión o crea tu cuenta gratis', emailPlaceholder: 'Correo electrónico', passwordPlaceholder: 'Contraseña', signin: 'Iniciar sesión', signup: 'Crear cuenta gratis', toggle_signin: '¿Ya tienes cuenta? Inicia sesión', toggle_signup: '¿No tienes cuenta? Regístrate gratis', loading: 'Por favor espera...', error_label: 'Error' },
  pt: { title: 'Proteja seu negócio', subtitle: 'Entre ou crie sua conta gratuita', emailPlaceholder: 'E-mail', passwordPlaceholder: 'Senha', signin: 'Entrar', signup: 'Criar conta grátis', toggle_signin: 'Já tem conta? Entre', toggle_signup: 'Não tem conta? Cadastre-se grátis', loading: 'Aguarde...', error_label: 'Erro' },
  zh: { title: '保护您的业务', subtitle: '登录或创建免费账户', emailPlaceholder: '电子邮件', passwordPlaceholder: '密码', signin: '登录', signup: '免费创建账户', toggle_signin: '已有账户？登录', toggle_signup: '没有账户？免费注册', loading: '请稍候...', error_label: '错误' },
  fr: { title: 'Protégez votre entreprise', subtitle: 'Connectez-vous ou créez votre compte gratuit', emailPlaceholder: 'Adresse e-mail', passwordPlaceholder: 'Mot de passe', signin: 'Se connecter', signup: 'Créer un compte gratuit', toggle_signin: 'Déjà un compte ? Se connecter', toggle_signup: 'Pas de compte ? S\'inscrire gratuitement', loading: 'Veuillez patienter...', error_label: 'Erreur' },
  ko: { title: '비즈니스를 보호하세요', subtitle: '로그인하거나 무료 계정을 만드세요', emailPlaceholder: '이메일 주소', passwordPlaceholder: '비밀번호', signin: '로그인', signup: '무료 계정 만들기', toggle_signin: '이미 계정이 있으신가요? 로그인', toggle_signup: '계정이 없으신가요? 무료로 가입', loading: '잠시만 기다려주세요...', error_label: '오류' },
}

export default function AuthPage() {
  const [lang, setLang] = useState('en')
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const t = UI_TEXT[lang] || UI_TEXT.en

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // Navigation handled by App.jsx via auth state change
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
            </svg>
          </div>
          <span>BizGuard</span>
        </div>

        {/* Language selector */}
        <div className={styles.langRow}>
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              className={`${styles.langBtn} ${lang === l.code ? styles.langBtnActive : ''}`}
              onClick={() => setLang(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.subtitle}>{t.subtitle}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            className={styles.input}
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            className={styles.input}
            placeholder={t.passwordPlaceholder}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />

          {error && <div className={styles.error}><strong>{t.error_label}:</strong> {error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? t.loading : mode === 'signin' ? t.signin : t.signup}
          </button>
        </form>

        <button className={styles.toggleBtn} onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}>
          {mode === 'signin' ? t.toggle_signup : t.toggle_signin}
        </button>
      </div>
    </div>
  )
}
