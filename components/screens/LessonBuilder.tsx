'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useCallback } from 'react'

// Scene infographic templates (reused from the broadcast graphics kit).
const TEMPLATES = [
  { key: 'lower-third', label: 'כותרת תחתית', gradient: 'linear-gradient(135deg,#9FB4F5,#C3A8EE)', icon: 'M3 5h18v14H3zM3 15h12' },
  { key: 'diagram', label: 'דיאגרמה', gradient: 'linear-gradient(135deg,#7FD3C0,#9AD9F0)', icon: 'M3 3v18h18M7 14l4-4 3 3 5-6' },
  { key: 'concept', label: 'כרטיס מושג', gradient: 'linear-gradient(135deg,#C3A8EE,#D6B8F0)', icon: 'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L3.2 7.7l5.4-.8z' },
  { key: 'quote', label: 'ציטוט', gradient: 'linear-gradient(135deg,#FFD08A,#FFB0A0)', icon: 'M3 5h18v14H3zM7 9h10M7 13h6' },
  { key: 'poll', label: 'סקר חי', gradient: 'linear-gradient(135deg,#F5B8C8,#E0A8E8)', icon: 'M18 20V10M12 20V4M6 20v-6' },
  { key: 'timer', label: 'טיימר תרגול', gradient: 'linear-gradient(135deg,#9FB4F5,#7FD3C0)', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 7v5l3 2' },
] as const

interface Scene {
  id: string
  title: string
  text: string
  template: (typeof TEMPLATES)[number]
  mediaName?: string
}

/**
 * Heuristic transcript → scene segmenter (the v1 of "auto-generate infographics
 * from transcript"). Splits on blank lines, else sentence groups, and assigns a
 * rotating template per scene. ponytail: heuristic now; swap this one function for
 * an LLM scene-planner (/api/lesson/plan) when an ANTHROPIC_API_KEY is wired.
 */
function segmentTranscript(text: string): Scene[] {
  const clean = text.trim()
  if (!clean) return []

  let chunks = clean.split(/\n\s*\n+/).map((c) => c.trim()).filter(Boolean)
  if (chunks.length < 2) {
    // Fall back to grouping sentences ~2 per scene.
    const sentences = clean.split(/(?<=[.!?。])\s+/).filter(Boolean)
    chunks = []
    for (let i = 0; i < sentences.length; i += 2) {
      chunks.push(sentences.slice(i, i + 2).join(' '))
    }
  }

  return chunks.map((text, i) => ({
    id: `scene-${i}-${text.length}`,
    title: text.split(/\s+/).slice(0, 6).join(' ') + (text.split(/\s+/).length > 6 ? '…' : ''),
    text,
    template: TEMPLATES[i % TEMPLATES.length],
  }))
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const LessonBuilder = () => {
  const [title, setTitle] = useState('שיעור חדש: שרשרת סוכנים + MCP')
  const [mode, setMode] = useState<'video' | 'tts'>('video')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')
  const [ttsScript, setTtsScript] = useState('')
  const [ttsStatus, setTtsStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable' | 'error'>('idle')
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [saved, setSaved] = useState(false)

  const videoInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const pendingSceneRef = useRef<string | null>(null)

  const onVideoPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setVideoUrl(URL.createObjectURL(file))
  }, [])

  const generate = useCallback(() => {
    setScenes(segmentTranscript(mode === 'tts' ? ttsScript : transcript))
    setSaved(false)
  }, [mode, transcript, ttsScript])

  const generateTts = useCallback(async () => {
    if (!ttsScript.trim()) return
    setTtsStatus('loading')
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ttsScript }),
      })
      if (res.status === 503) {
        setTtsStatus('unavailable')
        return
      }
      if (!res.ok) {
        setTtsStatus('error')
        return
      }
      const blob = await res.blob()
      setTtsAudioUrl(URL.createObjectURL(blob))
      setTtsStatus('ready')
    } catch {
      setTtsStatus('error')
    }
  }, [ttsScript])

  const addMedia = useCallback((sceneId: string) => {
    pendingSceneRef.current = sceneId
    mediaInputRef.current?.click()
  }, [])

  const onMediaPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const sceneId = pendingSceneRef.current
    if (file && sceneId) {
      setScenes((prev) => prev.map((s) => (s.id === sceneId ? { ...s, mediaName: file.name } : s)))
    }
    if (mediaInputRef.current) mediaInputRef.current.value = ''
  }, [])

  const removeScene = useCallback((id: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const sourceText = mode === 'tts' ? ttsScript : transcript

  return (
    <main className="relative flex-1 h-screen overflow-y-auto pb-16 z-10 px-6 md:px-8 py-6">
      {/* hidden file inputs */}
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={onVideoPick} />
      <input ref={mediaInputRef} type="file" accept="image/*,video/*,application/pdf" className="hidden" onChange={onMediaPick} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div className="flex-1 min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="כותרת השיעור"
            className="w-full bg-transparent outline-none text-2xl font-black text-dark text-right"
          />
          <div className="text-sm text-muted mt-1">
            {scenes.length} סצנות · יצירת שיעור אוטומטית מטרנסקריפט
          </div>
        </div>
        <button
          onClick={() => setSaved(true)}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl text-white text-sm font-bold bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] shadow-lg hover:-translate-y-0.5 transition-transform shrink-0"
        >
          {saved ? 'נשמר ✓' : 'שמור למאגר'}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 items-start">
        {/* LEFT — source */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[22px] glass p-5">
            <div className="text-base font-extrabold text-dark mb-3">מקור השיעור</div>

            {/* mode tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {([['video', 'העלאת וידאו'], ['tts', 'תסריט ל-TTS']] as const).map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  className={`px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    mode === m ? 'bg-[#5E5AA8] text-white' : 'bg-white/50 text-muted hover:bg-[#9FB4F5]/15'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {mode === 'video' ? (
              <div>
                {videoUrl ? (
                  <video src={videoUrl} controls className="w-full rounded-xl bg-black max-h-56" />
                ) : (
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full flex flex-col items-center gap-2 py-8 rounded-xl border-2 border-dashed border-[#9FB4F5]/40 text-muted hover:bg-[#9FB4F5]/8 transition-colors"
                  >
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#9FB4F5" strokeWidth="1.8">
                      <path d="M2 4h20v16H2zM11 13l4 2.5-4 2.5z" />
                    </svg>
                    <span className="text-sm font-semibold">העלה וידאו של המורה</span>
                  </button>
                )}
                {videoUrl && (
                  <button onClick={() => videoInputRef.current?.click()} className="mt-2 text-xs font-semibold text-[#5E5AA8]">
                    החלף וידאו
                  </button>
                )}
                <div className="mt-3 text-xs text-muted leading-relaxed">
                  תמלול אוטומטי דורש מפתח STT. בינתיים — הדבק/ערוך את הטרנסקריפט מימין.
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  value={ttsScript}
                  onChange={(e) => setTtsScript(e.target.value)}
                  aria-label="תסריט לקריינות"
                  placeholder="כתוב כאן את התסריט שהמערכת תקריא בקול…"
                  className="w-full h-32 rounded-xl bg-white/60 border border-white/70 p-3 text-sm outline-none resize-none text-right"
                />
                <button
                  onClick={generateTts}
                  disabled={!ttsScript.trim() || ttsStatus === 'loading'}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl text-white text-sm font-bold bg-gradient-to-br from-[#7FD3C0] to-[#9AD9F0] disabled:opacity-50 transition-opacity"
                >
                  {ttsStatus === 'loading' ? 'מייצר קריינות…' : 'צור קריינות (TTS)'}
                </button>
                {ttsStatus === 'ready' && ttsAudioUrl && (
                  <audio src={ttsAudioUrl} controls className="mt-3 w-full" />
                )}
                {ttsStatus === 'unavailable' && (
                  <div className="mt-2 text-xs text-amber-600">
                    שירות ה-TTS לא מוגדר עדיין (חסר ELEVENLABS_API_KEY). התסריט עדיין משמש ליצירת הסצנות.
                  </div>
                )}
                {ttsStatus === 'error' && (
                  <div className="mt-2 text-xs text-red-500">שגיאה ביצירת הקריינות. נסה שוב.</div>
                )}
              </div>
            )}
          </div>

          {/* transcript */}
          {mode === 'video' && (
            <div className="rounded-[22px] glass p-5">
              <div className="text-base font-extrabold text-dark mb-2">טרנסקריפט</div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                aria-label="טרנסקריפט השיעור"
                placeholder="הדבק כאן את תמלול דברי המורה. כל פסקה תהפוך לסצנה עם אינפוגרפיקה."
                className="w-full h-44 rounded-xl bg-white/60 border border-white/70 p-3 text-sm outline-none resize-none text-right"
              />
            </div>
          )}

          <button
            onClick={generate}
            disabled={!sourceText.trim()}
            className="inline-flex items-center justify-center gap-2 h-12 rounded-2xl text-white text-sm font-extrabold bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] shadow-lg hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:translate-y-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
              <path d="M12 2l2.2 5.6L20 9l-5.8 1.4L12 16l-2.2-5.6L4 9z" />
            </svg>
            ייצר מבנה שיעור אוטומטית
          </button>
        </div>

        {/* RIGHT — generated scenes */}
        <div className="rounded-[24px] glass p-5 min-h-[60vh]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-base font-extrabold text-dark">מבנה השיעור</div>
            <div className="text-xs text-muted">אינפוגרפיקה ואנימציה לכל סצנה</div>
          </div>

          {scenes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted py-24 gap-3">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#C3C6DA" strokeWidth="1.6">
                <path d="M4 4h16v16H4zM4 9h16M9 13h6" />
              </svg>
              <div className="text-sm max-w-xs">
                העלה וידאו או כתוב תסריט, ולחץ "ייצר מבנה שיעור" — המערכת תפצל לסצנות עם אינפוגרפיקה מותאמת.
              </div>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-3">
              <AnimatePresence>
                {scenes.map((scene, i) => (
                  <motion.div
                    key={scene.id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-stretch gap-3"
                  >
                    <div className="flex flex-col items-center pt-3 shrink-0">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] flex items-center justify-center text-xs font-extrabold text-white">
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-white/85 border border-white/90 shadow-sm">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow"
                        style={{ background: scene.template.gradient }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={scene.template.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-dark truncate">{scene.title}</div>
                        <div className="text-xs text-muted mt-0.5">
                          {scene.template.label}
                          {scene.mediaName ? ` · 📎 ${scene.mediaName}` : ''}
                        </div>
                      </div>
                      <button
                        onClick={() => addMedia(scene.id)}
                        aria-label="הוסף מדיה לסצנה"
                        className="h-9 px-3 rounded-lg bg-[#9FB4F5]/15 text-[#5E5AA8] text-xs font-bold hover:bg-[#9FB4F5]/25 transition-colors shrink-0"
                      >
                        + מדיה
                      </button>
                      <button
                        onClick={() => removeScene(scene.id)}
                        aria-label="הסר סצנה"
                        className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9AA0B4" strokeWidth="2">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
