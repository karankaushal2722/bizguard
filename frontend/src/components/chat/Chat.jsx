import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import styles from './Chat.module.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

const INDUSTRY_PROMPTS = {
  trucking:    ['What DOT inspections do I need to stay compliant?', 'I got an FMCSA violation notice — what do I do?', 'How do I handle my quarterly IFTA filing?', 'What ELD requirements apply to my trucks?'],
  food:        ['What health permits do I need to operate?', 'How do I handle a health department inspection?', 'What food safety certifications do my staff need?', 'How do I respond to a customer illness complaint?'],
  construction:['What OSHA safety requirements apply to my jobs?', 'Do I need workers comp for subcontractors?', 'How do I handle a workplace injury?', 'What licenses do I need to operate in my state?'],
  cleaning:    ['Do I need to be bonded and insured?', 'What chemicals require special safety training?', 'How do I handle a client property damage claim?', 'What business licenses do I need?'],
  retail:      ['What sales tax do I need to collect?', 'How do I handle a shoplifting incident legally?', 'What are my employee rights obligations?', 'How do I respond to a customer slip-and-fall?'],
  healthcare:  ['What HIPAA requirements apply to my practice?', 'How do I handle a patient complaint?', 'What malpractice insurance do I need?', 'What licenses do my staff need?'],
  childcare:   ['What state licensing do I need for my facility?', 'What background check requirements apply?', 'How do I handle a child injury incident?', 'What staff-to-child ratios are required?'],
  beauty:      ['What cosmetology licenses do I need?', 'How do I handle a client allergic reaction?', 'What sanitation standards must I meet?', 'Do I need business liability insurance?'],
  landscaping: ['What pesticide licenses do I need?', 'How do I handle a property damage claim?', 'What are my worker classification rules?', 'Do I need contractor licensing in my state?'],
  realestate:  ['What disclosures am I required to make?', 'How do I handle a tenant dispute?', 'What fair housing laws apply to me?', 'What landlord rights do I have in my state?'],
  ecommerce:   ['What sales tax do I owe across states?', 'How do I handle a chargeback dispute?', 'What consumer protection laws apply online?', 'How do I write compliant terms of service?'],
  other:       ['What business licenses do I need in my state?', 'How do I protect my business from lawsuits?', 'What are my obligations as an employer?', 'How should I structure my business legally?'],
}

const DEFAULT_PROMPTS = ['What legal protections does my business need?', 'How do I handle a customer dispute?', 'What are my tax obligations as a business owner?', 'What insurance do I need for my business?']

function buildSystemPrompt(profile) {
  if (!profile) return 'You are Amira, a warm and knowledgeable AI legal and compliance advisor for small business owners.'
  return `You are Amira, a warm, knowledgeable, and reassuring AI legal and compliance advisor created by BizGuard. You are speaking with ${profile.owner_name}, the owner of ${profile.business_name}, a ${profile.industry || 'business'} business in ${profile.state} with ${profile.employees} employees.

Key rules:
- Be warm, friendly, and reassuring — this person may be stressed or worried
- Address them by first name (${profile.owner_name?.split(' ')[0]})
- Give specific, actionable advice tailored to their industry and state
- Use plain English — no unnecessary legal jargon
- Always end serious legal/tax matters with a brief note to consult a licensed professional`
}

export default function Chat() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  const firstName = profile?.owner_name?.split(' ')[0] || 'there'
  const prompts = INDUSTRY_PROMPTS[profile?.industry] || DEFAULT_PROMPTS

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const userText = text || input.trim()
    if (!userText || loading) return
    setInput('')
    setLoading(true)
    const userMsg = { role: 'user', content: userText }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })), systemPrompt: buildSystemPrompt(profile) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
      speakText(data.content)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment." }])
    } finally {
      setLoading(false)
    }
  }

  function speakText(text) {
    if (!window.speechSynthesis || !profile?.language || profile.language === 'en') return
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`]/g, '').substring(0, 500))
    const langMap = { es: 'es-ES', pt: 'pt-BR', zh: 'zh-CN', fr: 'fr-FR', ko: 'ko-KR', hi: 'hi-IN', pa: 'pa-IN', ur: 'ur-PK', fa: 'fa-IR' }
    utterance.lang = langMap[profile.language] || 'en-US'
    utterance.rate = 0.9
    setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  function toggleVoice() {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Voice input is not supported in this browser.'); return }
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    const langMap = { en: 'en-US', es: 'es-ES', pt: 'pt-BR', zh: 'zh-CN', fr: 'fr-FR', ko: 'ko-KR', hi: 'hi-IN', pa: 'pa-IN', ur: 'ur-PK', fa: 'fa-IR' }
    recognition.lang = langMap[profile?.language] || 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (e) => { sendMessage(e.results[0][0].transcript); setListening(false) }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
    setListening(true)
  }

  function renderContent(content) {
    return content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')
  }

  return (
    <div className={styles.chat}>
      {messages.length === 0 ? (
        <div className={styles.welcome}>
          <div className={styles.amiraAvatar}>
            <div className={styles.amiraAvatarGlow} />
            <div className={styles.amiraAvatarInner}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
              </svg>
            </div>
          </div>
          <h1 className={styles.welcomeTitle}>Hi {firstName}, I'm Amira.</h1>
          <p className={styles.welcomeSub}>
            Your personal advisor for <strong>{profile?.business_name}</strong>. I know your industry,
            your state, and your business — so everything I tell you is tailored to your situation.
          </p>
          <button className={`${styles.voiceBtn} ${listening ? styles.voiceBtnActive : ''}`} onClick={toggleVoice}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="2"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {listening ? 'Listening…' : 'Tap the mic and speak in any language'}
          </button>
          <div className={styles.quickPromptLabel}>Common questions for your business:</div>
          <div className={styles.quickPrompts}>
            {prompts.map((p, i) => (
              <button key={i} className={styles.quickPrompt} onClick={() => sendMessage(p)}>{p}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.msgWrapper} ${msg.role === 'user' ? styles.msgWrapperUser : ''}`}>
              {msg.role === 'assistant' && (
                <div className={styles.msgAvatarAmira}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
                  </svg>
                </div>
              )}
              <div className={`${styles.msgBubble} ${msg.role === 'user' ? styles.msgBubbleUser : styles.msgBubbleAmira}`}>
                {msg.role === 'assistant'
                  ? <div dangerouslySetInnerHTML={{ __html: '<p>' + renderContent(msg.content) + '</p>' }} />
                  : msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className={styles.msgWrapper}>
              <div className={styles.msgAvatarAmira}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
                </svg>
              </div>
              <div className={`${styles.msgBubble} ${styles.msgBubbleAmira}`}>
                <div className={styles.typingDots}><span/><span/><span/></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
      <div className={styles.inputArea}>
        <div className={styles.inputRow}>
          <div className={styles.voiceIndicator}>
            {speaking && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <textarea
            className={styles.chatInput}
            placeholder={`Ask Amira anything about ${profile?.business_name || 'your business'}…`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            rows={1}
          />
          <button className={`${styles.voiceBtnInput} ${listening ? styles.voiceBtnActive : ''}`} onClick={toggleVoice}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="2"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className={styles.sendBtn} onClick={() => sendMessage()} disabled={!input.trim() || loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className={styles.disclaimer}>Amira provides general guidance, not legal advice. For complex matters, consult a licensed attorney or CPA.</p>
      </div>
    </div>
  )
}
