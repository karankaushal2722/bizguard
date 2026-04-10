import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import ReactMarkdown from 'react-markdown'
import styles from './Chat.module.css'

// Points to local backend in dev, live backend in production
const API_BASE = import.meta.env.VITE_API_URL || ''

const QUICK_PROMPTS = {
  trucking: [
    'What DOT inspections do I need to stay compliant?',
    'I got an FMCSA violation notice — what do I do?',
    'How do I handle my quarterly IFTA filing?',
    'What ELD requirements apply to my trucks?',
  ],
  food: [
    'What health permits do I need for my restaurant?',
    'How do I respond to an FDA inspection warning?',
    'What are my food handler certification requirements?',
    'How should I store records for health inspections?',
  ],
  construction: [
    'What OSHA safety requirements apply to my job sites?',
    'I received a contractor license complaint — what now?',
    'How do I handle workers comp for subcontractors?',
    'What contracts should I use for client projects?',
  ],
  cleaning: [
    'What insurance does a cleaning business need?',
    'How do I classify my workers: employees or contractors?',
    'What OSHA rules apply to cleaning chemicals?',
    'How do I handle a customer property damage claim?',
  ],
  default: [
    'I received a legal notice — what should I do?',
    'How do I set up payroll for my first employee?',
    'What business licenses do I need in my state?',
    'How do I protect myself from a lawsuit?',
  ]
}

const INDUSTRY_LABELS = {
  trucking: 'Trucking & Transportation', food: 'Food & Restaurant',
  construction: 'Construction', cleaning: 'Cleaning Services',
  retail: 'Retail', healthcare: 'Healthcare', childcare: 'Childcare',
  beauty: 'Beauty & Salons', landscaping: 'Landscaping',
  realestate: 'Real Estate', ecommerce: 'E-commerce', other: 'Business',
}

const SPEECH_LANG = {
  en: 'en-US', es: 'es-ES', pt: 'pt-BR',
  zh: 'zh-CN', fr: 'fr-FR', ko: 'ko-KR',
}

function buildSystemPrompt(profile) {
  const industryLabel = INDUSTRY_LABELS[profile.industry] || 'business'
  const businessType = profile.business_type === 'not_sure'
    ? 'business structure unknown'
    : profile.business_type?.replace('_', ' ')

  return `You are Amira, a warm, knowledgeable, and empowering AI business advisor. Your name is Amira and you work for BizGuard — a platform built to protect small business owners legally and help them stay compliant.

Your job is to help business owners understand their legal rights, stay compliant, protect their business, and run their operations confidently. You are like a trusted friend who happens to know everything about business law, compliance, and operations.

ABOUT THIS USER:
- Name: ${profile.owner_name}
- Business: ${profile.business_name}
- Industry: ${industryLabel}
- Business type: ${businessType}
- State: ${profile.state}
- Employees: ${profile.employees?.replace('_', '–') || 'unknown'}
- Years in business: ${profile.years_in_business || 'not specified'}
- Preferred language: ${profile.language || 'English'}

YOUR PERSONALITY:
- Warm, encouraging, and personal — never robotic or cold
- Address them by first name (${profile.owner_name?.split(' ')[0]}) naturally
- You genuinely care about their success and protecting their business
- Speak plainly — explain jargon when you use it
- Be confident and direct — give real answers, not vague non-answers

ALWAYS:
- Tailor every answer to their industry (${industryLabel}), state (${profile.state}), and business type
- Break complex topics into clear numbered steps
- End with a relevant follow-up question or next action
- If they mention a legal notice, ask for the notice number for specific guidance
- Respond in ${profile.language === 'es' ? 'Spanish' : profile.language === 'pt' ? 'Portuguese' : profile.language === 'zh' ? 'Chinese (Simplified)' : profile.language === 'fr' ? 'French' : profile.language === 'ko' ? 'Korean' : 'English'}

NEVER:
- Say you are ChatGPT, Claude, or any other AI — you are Amira
- Say "I'm just an AI" or refuse to engage
- Claim to be a licensed attorney or guarantee legal outcomes

Add a brief one-line disclaimer for complex legal/tax matters.`
}

function stripMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '').replace(/`(.*?)`/g, '$1')
    .replace(/\n{2,}/g, '. ').replace(/\n/g, ' ')
    .replace(/^\d+\.\s/gm, '').trim()
}

export default function Chat() {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')

  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const synth = useRef(window.speechSynthesis)

  const quickPrompts = QUICK_PROMPTS[profile?.industry] || QUICK_PROMPTS.default
  const firstName = profile?.owner_name?.split(' ')[0] || 'there'
  const lang = profile?.language || 'en'

  useEffect(() => {
    const hasSTT = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    setSpeechSupported(hasSTT && 'speechSynthesis' in window)
  }, [])

  useEffect(() => { if (user && profile) initSession() }, [user, profile])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, liveTranscript])
  useEffect(() => { return () => { recognitionRef.current?.abort(); synth.current?.cancel() } }, [])

  async function initSession() {
    setLoadingHistory(true)
    const today = new Date().toISOString().split('T')[0]
    let { data: session } = await supabase
      .from('chat_sessions').select('id').eq('user_id', user.id).eq('date', today).single()
    if (!session) {
      const { data: ns } = await supabase
        .from('chat_sessions').insert({ user_id: user.id, date: today }).select('id').single()
      session = ns
    }
    if (session) {
      setSessionId(session.id)
      const { data: msgs } = await supabase
        .from('messages').select('role, content, created_at')
        .eq('session_id', session.id).order('created_at', { ascending: true })
      setMessages(msgs || [])
    }
    setLoadingHistory(false)
  }

  async function saveMessage(role, content) {
    if (!sessionId) return
    await supabase.from('messages').insert({ session_id: sessionId, user_id: user.id, role, content })
  }

  function speakText(text) {
    if (!voiceEnabled || !synth.current) return
    synth.current.cancel()
    const chunks = stripMarkdown(text).match(/.{1,220}(?:\s|$)/g) || [text]
    let i = 0
    setIsSpeaking(true)

    function next() {
      if (i >= chunks.length) { setIsSpeaking(false); return }
      const utt = new SpeechSynthesisUtterance(chunks[i])
      utt.lang = SPEECH_LANG[lang] || 'en-US'
      utt.rate = 0.93; utt.pitch = 1.08
      const voices = synth.current.getVoices()
      const langVoices = voices.filter(v => v.lang.startsWith((SPEECH_LANG[lang] || 'en-US').split('-')[0]))
      const preferred = langVoices.find(v => /female|samantha|victoria|karen|zira|aria|jenny/i.test(v.name))
      if (preferred) utt.voice = preferred
      else if (langVoices[0]) utt.voice = langVoices[0]
      utt.onend = () => { i++; next() }
      utt.onerror = () => setIsSpeaking(false)
      synth.current.speak(utt)
    }

    synth.current.getVoices().length === 0
      ? synth.current.addEventListener('voiceschanged', next, { once: true })
      : next()
  }

  function stopSpeaking() { synth.current?.cancel(); setIsSpeaking(false) }

  function toggleListening() {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    stopSpeaking()
    const rec = new SR()
    recognitionRef.current = rec
    rec.lang = SPEECH_LANG[lang] || 'en-US'
    rec.continuous = false; rec.interimResults = true
    rec.onstart = () => { setIsListening(true); setLiveTranscript('') }
    rec.onresult = (e) => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t; else interim += t
      }
      setLiveTranscript(final || interim)
      if (final) { setInput(p => (p + ' ' + final).trim()); setLiveTranscript('') }
    }
    rec.onend = () => { setIsListening(false); setLiveTranscript('') }
    rec.onerror = () => { setIsListening(false); setLiveTranscript('') }
    rec.start()
  }

  async function sendMessage(text) {
    if (!text.trim() || loading) return
    stopSpeaking(); recognitionRef.current?.stop(); setIsListening(false)
    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages); setInput(''); setLiveTranscript(''); setLoading(true)
    await saveMessage('user', text)

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          systemPrompt: buildSystemPrompt(profile),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      const assistantMsg = { role: 'assistant', content: data.content }
      setMessages(prev => [...prev, assistantMsg])
      await saveMessage('assistant', data.content)
      if (voiceEnabled) speakText(data.content)
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I ran into an issue. Please try again. (${err.message})` }])
    } finally {
      setLoading(false); inputRef.current?.focus()
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const showWelcome = messages.length === 0 && !loadingHistory

  return (
    <div className={styles.chat}>
      {isListening && (
        <div className={styles.listeningBanner}>
          <span className={styles.listenDot} />
          <span>Amira is listening{liveTranscript ? `: "${liveTranscript}"` : '...'}</span>
          <button className={styles.bannerCancel} onClick={toggleListening}>Cancel</button>
        </div>
      )}
      {isSpeaking && (
        <div className={styles.speakingBanner}>
          <span className={styles.waveWrap}><span/><span/><span/><span/><span/></span>
          <span>Amira is speaking...</span>
          <button className={styles.bannerCancel} onClick={stopSpeaking}>Stop</button>
        </div>
      )}

      <div className={styles.messages}>
        {loadingHistory && <div className={styles.loadingHistory}>Loading your conversation with Amira...</div>}

        {showWelcome && (
          <div className={styles.welcome}>
            <div className={styles.amiraAvatar}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
              </svg>
            </div>
            <h2 className={styles.welcomeTitle}>Hi {firstName}, I'm Amira.</h2>
            <p className={styles.welcomeDesc}>
              Your personal advisor for <strong>{profile?.business_name}</strong>. I know your industry, your state, and your business — so everything I tell you is tailored to your situation. You can type or just tap the mic and talk to me.
            </p>
            {speechSupported && (
              <div className={styles.voiceHint}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Tap the mic and speak to Amira in any language
              </div>
            )}
            <div className={styles.quickPrompts}>
              <p className={styles.quickLabel}>Common questions for your business:</p>
              <div className={styles.promptGrid}>
                {quickPrompts.map((q, i) => (
                  <button key={i} className={styles.promptBtn} onClick={() => sendMessage(q)}>{q}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAssistant}`}>
            {msg.role === 'assistant' && (
              <div className={styles.msgAvatar}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
                </svg>
              </div>
            )}
            <div className={styles.msgBubble}>
              {msg.role === 'assistant'
                ? <>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {speechSupported && voiceEnabled && i === messages.length - 1 && !loading && (
                      <button className={styles.replayBtn} onClick={() => speakText(msg.content)}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                        Hear again
                      </button>
                    )}
                  </>
                : msg.content
              }
            </div>
          </div>
        ))}

        {loading && (
          <div className={`${styles.message} ${styles.messageAssistant}`}>
            <div className={styles.msgAvatar}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/>
              </svg>
            </div>
            <div className={`${styles.msgBubble} ${styles.typing}`}><span/><span/><span/></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputRow}>
          {speechSupported && (
            <button className={`${styles.iconBtn} ${!voiceEnabled ? styles.iconMuted : ''}`}
              onClick={() => { setVoiceEnabled(v => !v); stopSpeaking() }}
              title={voiceEnabled ? "Mute Amira's voice" : "Unmute Amira's voice"}>
              {voiceEnabled
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" strokeWidth="1.75" fill="none"/><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19" stroke="currentColor" strokeWidth="1.75" fill="none"/><line x1="23" y1="1" x2="1" y2="23" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>
              }
            </button>
          )}
          <textarea ref={inputRef} className={styles.textarea}
            placeholder={isListening ? 'Listening...' : `Ask Amira anything about ${profile?.business_name || 'your business'}...`}
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} rows={1}/>
          {speechSupported && (
            <button className={`${styles.micBtn} ${isListening ? styles.micActive : ''}`}
              onClick={toggleListening} title={isListening ? 'Stop listening' : 'Speak to Amira'}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="1.75" fill={isListening ? 'currentColor' : 'none'}/>
                <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          <button className={styles.sendBtn} onClick={() => sendMessage(input)} disabled={!input.trim() || loading}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className={styles.disclaimer}>Amira provides general guidance, not legal advice. For complex matters, consult a licensed attorney or CPA.</p>
      </div>
    </div>
  )
}
