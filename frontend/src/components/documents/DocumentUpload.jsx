import { useState, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import ReactMarkdown from 'react-markdown'
import styles from './DocumentUpload.module.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

const DOC_TYPES = [
  { id: 'irs', label: 'IRS Notice', icon: '📋', desc: 'CP2000, CP503, audit letters, tax bills' },
  { id: 'legal', label: 'Legal Notice', icon: '⚖️', desc: 'Lawsuits, cease & desist, court summons' },
  { id: 'dot', label: 'DOT / FMCSA', icon: '🚛', desc: 'Violations, audit notices, safety ratings' },
  { id: 'contract', label: 'Contract', icon: '📝', desc: 'Agreements, leases, vendor contracts' },
  { id: 'compliance', label: 'Compliance Notice', icon: '🏛️', desc: 'OSHA, FDA, state agency letters' },
  { id: 'other', label: 'Other Document', icon: '📄', desc: 'Any business document you need help with' },
]

function buildDocPrompt(profile, docType, fileName) {
  const industryLabel = profile.industry || 'business'
  const docTypeLabel = DOC_TYPES.find(d => d.id === docType)?.label || 'document'
  return `You are Amira, warm AI advisor for BizGuard. The user (${profile.owner_name}, ${profile.business_name}, ${industryLabel}, ${profile.state}) has uploaded a ${docTypeLabel} called "${fileName}".

Analyze this document and provide:
1. **What this document is** — plain English explanation
2. **What it means for ${profile.owner_name}** — key facts, amounts, dates, requirements
3. **Urgency level** — deadline? How urgent?
4. **Recommended next steps** — numbered list of exactly what to do
5. **Questions to ask** — what to gather or clarify

Be warm, specific, and reassuring. Address them by first name. Focus on their industry (${industryLabel}) and state (${profile.state}).

End with: "What questions do you have about this document? I'm here to help you through every step."

Add a brief one-line disclaimer for complex legal/tax matters.`
}

export default function DocumentUpload() {
  const { user, profile } = useAuth()
  const [docType, setDocType] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [followUp, setFollowUp] = useState('')
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [conversation, setConversation] = useState([])
  const fileRef = useRef(null)

  function handleFile(f) {
    if (!f) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(f.type)) { setError('Please upload a JPG, PNG, WEBP, or PDF file.'); return }
    if (f.size > 10 * 1024 * 1024) { setError('File must be under 10MB.'); return }
    setError(''); setFile(f); setAnalysis(''); setConversation([])
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target.result)
      reader.readAsDataURL(f)
    } else { setPreview('pdf') }
  }

  function handleDrop(e) { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }

  async function analyzeDocument() {
    if (!file || !docType) return
    setLoading(true); setError(''); setAnalysis(''); setConversation([])
    try {
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = e => res(e.target.result.split(',')[1])
        reader.onerror = rej
        reader.readAsDataURL(file)
      })
      const isPdf = file.type === 'application/pdf'
      const messages = [{ role: 'user', content: [
        { type: isPdf ? 'document' : 'image', source: { type: 'base64', media_type: file.type, data: base64 } },
        { type: 'text', text: `Please analyze this ${DOC_TYPES.find(d => d.id === docType)?.label || 'document'} and tell me what it means and what I should do.` }
      ]}]
      const res = await fetch(`${API_BASE}/api/analyze-document`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, systemPrompt: buildDocPrompt(profile, docType, file.name) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setAnalysis(data.content)
      setConversation([{ role: 'user', content: `[Uploaded: ${file.name}]` }, { role: 'assistant', content: data.content }])
      await supabase.from('document_analyses').insert({ user_id: user.id, file_name: file.name, doc_type: docType, analysis: data.content, created_at: new Date().toISOString() }).catch(() => {})
    } catch (err) { setError('Something went wrong: ' + err.message) }
    finally { setLoading(false) }
  }

  async function sendFollowUp() {
    if (!followUp.trim() || followUpLoading) return
    const question = followUp.trim(); setFollowUp(''); setFollowUpLoading(true)
    setConversation(prev => [...prev, { role: 'user', content: question }])
    try {
      const base64 = await new Promise((res, rej) => { const reader = new FileReader(); reader.onload = e => res(e.target.result.split(',')[1]); reader.onerror = rej; reader.readAsDataURL(file) })
      const isPdf = file.type === 'application/pdf'
      const messages = [
        { role: 'user', content: [{ type: isPdf ? 'document' : 'image', source: { type: 'base64', media_type: file.type, data: base64 } }, { type: 'text', text: 'Please analyze this document.' }] },
        { role: 'assistant', content: analysis },
        ...conversation.slice(2).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: question }
      ]
      const res = await fetch(`${API_BASE}/api/analyze-document`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages, systemPrompt: buildDocPrompt(profile, docType, file.name) }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setConversation(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch (err) { setConversation(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]) }
    finally { setFollowUpLoading(false) }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Document Analysis</h1>
        <p className={styles.subtitle}>Upload any legal notice, IRS letter, contract, or business document. Amira will read it and tell you exactly what it means and what to do.</p>
      </div>
      <div className={styles.layout}>
        <div className={styles.uploadPanel}>
          <div className={styles.section}>
            <div className={styles.sectionLabel}>What type of document is this?</div>
            <div className={styles.docTypeGrid}>
              {DOC_TYPES.map(dt => (
                <button key={dt.id} className={`${styles.docTypeCard} ${docType === dt.id ? styles.docTypeSelected : ''}`} onClick={() => setDocType(dt.id)}>
                  <span className={styles.docTypeIcon}>{dt.icon}</span>
                  <div><div className={styles.docTypeLabel}>{dt.label}</div><div className={styles.docTypeDesc}>{dt.desc}</div></div>
                </button>
              ))}
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Upload your document</div>
            <div className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''} ${file ? styles.dropZoneHasFile : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className={styles.fileInput} onChange={e => handleFile(e.target.files[0])} />
              {!file ? (
                <div className={styles.dropContent}>
                  <div className={styles.dropIcon}>📎</div>
                  <div className={styles.dropText}>Drop your document here or click to browse</div>
                  <div className={styles.dropHint}>JPG, PNG, WEBP or PDF · Max 10MB</div>
                  <div className={styles.dropHint}>Take a photo of a paper letter and upload it</div>
                </div>
              ) : (
                <div className={styles.filePreview}>
                  {preview === 'pdf' ? <div className={styles.pdfIcon}>📄</div> : <img src={preview} className={styles.previewImg} alt="preview" />}
                  <div className={styles.fileName}>{file.name}</div>
                  <div className={styles.fileSize}>{(file.size / 1024).toFixed(0)} KB</div>
                  <button className={styles.changeFile} onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); setAnalysis(''); setConversation([]) }}>Change file</button>
                </div>
              )}
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.analyzeBtn} onClick={analyzeDocument} disabled={!file || !docType || loading}>
            {loading ? <span className={styles.analyzing}><span className={styles.spinner} />Amira is reading your document...</span> : '🔍 Analyze with Amira'}
          </button>
          {!docType && <p className={styles.hint}>Select a document type above to get started</p>}
          {docType && !file && <p className={styles.hint}>Upload your document to continue</p>}
        </div>
        <div className={styles.analysisPanel}>
          {!analysis && !loading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <h3>Amira will analyze your document here</h3>
              <p>Upload a document and she'll tell you exactly what it means, what's at stake, and what to do next — in plain English.</p>
              <div className={styles.examples}>
                <div className={styles.exampleItem}>📬 Got a scary IRS letter? Amira explains it.</div>
                <div className={styles.exampleItem}>⚖️ Received a legal notice? Amira tells you what to do.</div>
                <div className={styles.exampleItem}>🚛 DOT violation? Amira walks you through it.</div>
              </div>
            </div>
          )}
          {loading && <div className={styles.loadingState}><div className={styles.loadingDots}><span /><span /><span /></div><p>Amira is carefully reading your document...</p></div>}
          {analysis && (
            <div className={styles.analysisContent}>
              {conversation.slice(1).map((msg, i) => (
                <div key={i} className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgAmira}`}>
                  {msg.role === 'assistant' ? (
                    <><div className={styles.amiraLabel}><div className={styles.amiraAvatar}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/></svg></div>Amira</div><div className={styles.msgContent}><ReactMarkdown>{msg.content}</ReactMarkdown></div></>
                  ) : <div className={styles.msgContent}>{msg.content}</div>}
                </div>
              ))}
              {followUpLoading && <div className={`${styles.msg} ${styles.msgAmira}`}><div className={styles.amiraLabel}><div className={styles.amiraAvatar}><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white"/></svg></div>Amira</div><div className={styles.typingDots}><span/><span/><span/></div></div>}
              <div className={styles.followUpArea}>
                <div className={styles.followUpRow}>
                  <textarea className={styles.followUpInput} placeholder="Ask Amira a follow-up question about this document..." value={followUp} onChange={e => setFollowUp(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFollowUp() } }} rows={1} />
                  <button className={styles.followUpBtn} onClick={sendFollowUp} disabled={!followUp.trim() || followUpLoading}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
