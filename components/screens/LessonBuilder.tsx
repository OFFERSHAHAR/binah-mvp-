'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useCallback, useEffect } from 'react'

// Locked elastic easing from the design system.
const EASE = [0.34, 1.35, 0.5, 1] as const

// Scene infographic templates.
const TEMPLATES = [
  { key: 'lower-third', label: 'כותרת תחתית', gradient: 'linear-gradient(135deg,#9FB4F5,#C3A8EE)', icon: 'M3 5h18v14H3zM3 15h12' },
  { key: 'diagram', label: 'דיאגרמה', gradient: 'linear-gradient(135deg,#7FD3C0,#9AD9F0)', icon: 'M3 3v18h18M7 14l4-4 3 3 5-6' },
  { key: 'concept', label: 'כרטיס מושג', gradient: 'linear-gradient(135deg,#C3A8EE,#D6B8F0)', icon: 'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L3.2 7.7l5.4-.8z' },
  { key: 'quote', label: 'ציטוט', gradient: 'linear-gradient(135deg,#FFD08A,#FFB0A0)', icon: 'M3 5h18v14H3zM7 9h10M7 13h6' },
  { key: 'poll', label: 'סקר חי', gradient: 'linear-gradient(135deg,#F5B8C8,#E0A8E8)', icon: 'M18 20V10M12 20V4M6 20v-6' },
  { key: 'timer', label: 'טיימר תרגול', gradient: 'linear-gradient(135deg,#9FB4F5,#7FD3C0)', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 7v5l3 2' },
] as const

// Ready-made presenter avatars (DiceBear — free, no key).
const AVATAR_SEEDS = ['Maya', 'Eitan', 'Noa', 'Avi', 'Tamar', 'Daniel']
const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=c3a8ee,9fb4f5,7fd3c0,ffd08a&radius=20`

interface Scene {
  id: string
  title: string
  text: string
  template: (typeof TEMPLATES)[number]
  mediaName?: string
}

/** Heuristic transcript → scenes (v1; swap for an LLM planner later). */
function segmentTranscript(text: string): Scene[] {
  const clean = text.trim()
  if (!clean) return []
  let chunks = clean.split(/\n\s*\n+/).map((c) => c.trim()).filter(Boolean)
  if (chunks.length < 2) {
    const sentences = clean.split(/(?<=[.!?。])\s+/).filter(Boolean)
    chunks = []
    for (let i = 0; i < sentences.length; i += 2) chunks.push(sentences.slice(i, i + 2).join(' '))
  }
  return chunks.map((t, i) => ({
    id: `scene-${i}-${t.length}`,
    title: t.split(/\s+/).slice(0, 6).join(' ') + (t.split(/\s+/).length > 6 ? '…' : ''),
    text: t,
    template: TEMPLATES[i % TEMPLATES.length],
  }))
}

export const LessonBuilder = () => {
  const [title, setTitle] = useState('שיעור חדש: שרשרת סוכנים + MCP')
  const [presenter, setPresenter] = useState(AVATAR_SEEDS[0])
  const [mode, setMode] = useState<'audio' | 'video' | 'tts'>('audio')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')
  const [transcribing, setTranscribing] = useState(false)
  const [transcribeMsg, setTranscribeMsg] = useState<string | null>(null)
  const [ttsScript, setTtsScript] = useState('')
  const [ttsStatus, setTtsStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable' | 'error'>('idle')
  const [ttsUrl, setTtsUrl] = useState<string | null>(null)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [playIdx, setPlayIdx] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)

  const videoInput = useRef<HTMLInputElement>(null)
  const audioInput = useRef<HTMLInputElement>(null)
  const mediaInput = useRef<HTMLInputElement>(null)
  const pendingScene = useRef<string | null>(null)

  // ---- audio → transcript ----
  const onAudioPick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setTranscribing(true)
    setTranscribeMsg(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/transcribe', { method: 'POST', body: fd })
      if (res.status === 503) {
        setTranscribeMsg('שירות התמלול לא מוגדר עדיין (חסר ELEVENLABS_API_KEY). אפשר להדביק טרנסקריפט ידנית.')
      } else if (!res.ok) {
        setTranscribeMsg('שגיאה בתמלול. נסה שוב או הדבק ידנית.')
      } else {
        const data = await res.json()
        setTranscript(data.text || '')
        setTranscribeMsg('✓ תומלל בהצלחה')
      }
    } catch {
      setTranscribeMsg('שגיאת רשת בתמלול.')
    } finally {
      setTranscribing(false)
      if (audioInput.current) audioInput.current.value = ''
    }
  }, [])

  const generateTts = useCallback(async () => {
    if (!ttsScript.trim()) return
    setTtsStatus('loading')
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ttsScript }),
      })
      if (res.status === 503) return setTtsStatus('unavailable')
      if (!res.ok) return setTtsStatus('error')
      setTtsUrl(URL.createObjectURL(await res.blob()))
      setTtsStatus('ready')
    } catch {
      setTtsStatus('error')
    }
  }, [ttsScript])

  const sourceText = mode === 'tts' ? ttsScript : transcript
  const generate = useCallback(() => {
    setScenes(segmentTranscript(sourceText))
    setSaved(false)
  }, [sourceText])

  const addMedia = useCallback((id: string) => {
    pendingScene.current = id
    mediaInput.current?.click()
  }, [])
  const onMediaPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const id = pendingScene.current
    if (file && id) setScenes((p) => p.map((s) => (s.id === id ? { ...s, mediaName: file.name } : s)))
    if (mediaInput.current) mediaInput.current.value = ''
  }, [])

  // ---- preview player auto-advance ----
  useEffect(() => {
    if (playIdx === null) return
    if (playIdx >= scenes.length) { setPlayIdx(null); return }
    const t = setTimeout(() => setPlayIdx((i) => (i === null ? null : i + 1)), 3600)
    return () => clearTimeout(t)
  }, [playIdx, scenes.length])

  return (
    <main className="relative flex-1 h-screen overflow-y-auto pb-24 z-10 px-4 sm:px-6 md:px-8 py-5">
      <input ref={videoInput} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setVideoUrl(URL.createObjectURL(f)) }} />
      <input ref={audioInput} type="file" accept="audio/*" className="hidden" onChange={onAudioPick} />
      <input ref={mediaInput} type="file" accept="image/*,video/*,application/pdf" className="hidden" onChange={onMediaPick} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 mb-5">
        <input
          value={title} onChange={(e) => setTitle(e.target.value)} aria-label="כותרת השיעור"
          className="w-full bg-transparent outline-none text-xl sm:text-2xl font-black text-dark text-right"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs sm:text-sm text-muted">{scenes.length} סצנות · יצירה אוטומטית</span>
          <button onClick={() => setSaved(true)} className="h-10 px-4 rounded-xl text-white text-sm font-bold bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] shadow-lg active:scale-95 transition-transform">
            {saved ? 'נשמר ✓' : 'שמור'}
          </button>
        </div>
      </motion.div>

      {/* Presenter avatar picker */}
      <div className="mb-5">
        <div className="text-sm font-extrabold text-dark mb-2">מנחה השיעור</div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {AVATAR_SEEDS.map((seed) => (
            <button
              key={seed} onClick={() => setPresenter(seed)} aria-label={`בחר מנחה ${seed}`}
              className={`shrink-0 rounded-2xl p-0.5 transition-all ${presenter === seed ? 'ring-2 ring-[#5E5AA8] scale-105' : 'ring-1 ring-gray-200 opacity-70'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl(seed)} alt={seed} width={56} height={56} className="w-14 h-14 rounded-[14px] bg-white" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4 items-start">
        {/* SOURCE */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl glass p-4 sm:p-5">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {([['audio', 'אודיו → תמלול'], ['video', 'וידאו'], ['tts', 'תסריט → קול']] as const).map(([m, label]) => (
                <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
                  className={`px-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${mode === m ? 'bg-[#5E5AA8] text-white' : 'bg-white/50 text-muted'}`}>
                  {label}
                </button>
              ))}
            </div>

            {mode === 'audio' && (
              <div>
                <button onClick={() => audioInput.current?.click()} disabled={transcribing}
                  className="w-full flex flex-col items-center gap-2 py-8 rounded-xl border-2 border-dashed border-[#9FB4F5]/50 text-muted active:bg-[#9FB4F5]/10 transition-colors disabled:opacity-60">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#9FB4F5" strokeWidth="1.8"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
                  <span className="text-sm font-semibold">{transcribing ? 'מתמלל…' : 'זרוק קובץ אודיו לתמלול'}</span>
                </button>
                {transcribeMsg && <div className="mt-2 text-xs text-muted">{transcribeMsg}</div>}
              </div>
            )}
            {mode === 'video' && (
              videoUrl
                ? <video src={videoUrl} controls className="w-full rounded-xl bg-black max-h-52" />
                : <button onClick={() => videoInput.current?.click()} className="w-full flex flex-col items-center gap-2 py-8 rounded-xl border-2 border-dashed border-[#9FB4F5]/50 text-muted active:bg-[#9FB4F5]/10">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#9FB4F5" strokeWidth="1.8"><path d="M2 4h20v16H2zM11 13l4 2.5-4 2.5z" /></svg>
                    <span className="text-sm font-semibold">העלה וידאו של המורה</span>
                  </button>
            )}
            {mode === 'tts' && (
              <div>
                <textarea value={ttsScript} onChange={(e) => setTtsScript(e.target.value)} placeholder="כתוב תסריט להקראה בעברית…" aria-label="תסריט"
                  className="w-full h-28 rounded-xl bg-white/60 border border-white/70 p-3 text-sm outline-none resize-none text-right" />
                <button onClick={generateTts} disabled={!ttsScript.trim() || ttsStatus === 'loading'}
                  className="mt-2 w-full h-10 rounded-xl text-white text-sm font-bold bg-gradient-to-br from-[#7FD3C0] to-[#9AD9F0] disabled:opacity-50">
                  {ttsStatus === 'loading' ? 'מייצר קול…' : 'צור קריינות עברית'}
                </button>
                {ttsStatus === 'ready' && ttsUrl && <audio src={ttsUrl} controls className="mt-3 w-full" />}
                {ttsStatus === 'unavailable' && <div className="mt-2 text-xs text-amber-600">קול לא מוגדר עדיין (חסר ELEVENLABS_API_KEY).</div>}
              </div>
            )}
          </div>

          {/* transcript (audio/video) */}
          {mode !== 'tts' && (
            <div className="rounded-2xl glass p-4 sm:p-5">
              <div className="text-sm font-extrabold text-dark mb-2">טרנסקריפט</div>
              <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} aria-label="טרנסקריפט"
                placeholder="התמלול יופיע כאן — או הדבק ידנית. כל פסקה = סצנה." className="w-full h-40 rounded-xl bg-white/60 border border-white/70 p-3 text-sm outline-none resize-none text-right" />
            </div>
          )}

          <button onClick={generate} disabled={!sourceText.trim()}
            className="h-12 rounded-2xl text-white text-sm font-extrabold bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] shadow-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M12 2l2.2 5.6L20 9l-5.8 1.4L12 16l-2.2-5.6L4 9z" /></svg>
            ייצר מבנה שיעור אוטומטית
          </button>
        </div>

        {/* SCENES */}
        <div className="rounded-2xl glass p-4 sm:p-5 min-h-[40vh]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-extrabold text-dark">מבנה השיעור</div>
            {scenes.length > 0 && (
              <button onClick={() => setPlayIdx(0)} className="h-9 px-4 rounded-xl text-white text-xs font-bold bg-gradient-to-br from-[#5E5AA8] to-[#C3A8EE] active:scale-95 transition-transform flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M5 3l14 9-14 9z" /></svg> נגן תצוגה
              </button>
            )}
          </div>

          {scenes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted py-16 gap-3">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C3C6DA" strokeWidth="1.6"><path d="M4 4h16v16H4zM4 9h16M9 13h6" /></svg>
              <div className="text-sm max-w-xs">זרוק אודיו / וידאו / תסריט, ולחץ "ייצר" — המערכת תפצל לסצנות עם אינפוגרפיקה ואנימציה.</div>
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }} className="flex flex-col gap-2.5">
              <AnimatePresence>
                {scenes.map((s, i) => (
                  <motion.div key={s.id} layout variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }} exit={{ opacity: 0, x: -16 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/85 border border-white/90 shadow-sm">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white text-xs font-extrabold" style={{ background: s.template.gradient }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-dark truncate">{s.title}</div>
                      <div className="text-xs text-muted">{s.template.label}{s.mediaName ? ` · 📎` : ''}</div>
                    </div>
                    <button onClick={() => addMedia(s.id)} aria-label="הוסף מדיה" className="h-8 px-2.5 rounded-lg bg-[#9FB4F5]/15 text-[#5E5AA8] text-xs font-bold shrink-0">+מדיה</button>
                    <button onClick={() => setScenes((p) => p.filter((x) => x.id !== s.id))} aria-label="הסר" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9AA0B4" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* ANIMATED PREVIEW PLAYER */}
      <AnimatePresence>
        {playIdx !== null && scenes[playIdx] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-5"
            style={{ background: 'radial-gradient(circle at 50% 30%, #2E2B40, #15131F)' }}
            onClick={() => setPlayIdx(null)}>
            <button onClick={() => setPlayIdx(null)} aria-label="סגור" className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white/15 text-white text-xl">×</button>

            <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.div key={scenes[playIdx].id}
                  initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.6, ease: EASE }} className="text-center">
                  <motion.div initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.7, ease: EASE }}
                    className="w-28 h-28 mx-auto rounded-[28px] flex items-center justify-center shadow-2xl mb-6" style={{ background: scenes[playIdx].template.gradient }}>
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={scenes[playIdx].template.icon} /></svg>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
                    className="text-xs font-bold tracking-widest text-white/50 mb-2">{scenes[playIdx].template.label} · {playIdx + 1}/{scenes.length}</motion.div>
                  <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.5 }}
                    className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">{scenes[playIdx].title}</motion.h2>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-sm sm:text-base text-white/75 leading-relaxed max-w-md mx-auto">{scenes[playIdx].text}</motion.p>
                  <motion.img initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
                    src={avatarUrl(presenter)} alt="presenter" width={48} height={48} className="w-12 h-12 rounded-xl mx-auto mt-6 bg-white/90" />
                </motion.div>
              </AnimatePresence>

              {/* progress dots */}
              <div className="flex justify-center gap-1.5 mt-8">
                {scenes.map((_, i) => (
                  <button key={i} onClick={() => setPlayIdx(i)} aria-label={`סצנה ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${i === playIdx ? 'w-7 bg-white' : 'w-1.5 bg-white/30'}`} />
                ))}
              </div>
              <div className="flex justify-center gap-3 mt-5">
                <button onClick={() => setPlayIdx((i) => (i && i > 0 ? i - 1 : 0))} className="h-9 px-4 rounded-lg bg-white/15 text-white text-sm font-semibold">הקודם</button>
                <button onClick={() => setPlayIdx((i) => (i !== null && i < scenes.length - 1 ? i + 1 : null))} className="h-9 px-4 rounded-lg bg-white text-[#2E2B40] text-sm font-bold">הבא</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
