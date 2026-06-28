'use client'

import { motion } from 'framer-motion'
import { useCamera } from '@/hooks/useCamera'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export const Record = () => {
  const {
    videoRef,
    status,
    errorMessage,
    settings,
    recording,
    start,
    stop,
    toggleVideo,
    toggleAudio,
    setResolution,
    startRecording,
    stopRecording,
    togglePauseRecording,
  } = useCamera()

  const isActive = status === 'active'

  return (
    <main className="relative flex-1 h-screen overflow-y-auto pb-12 z-10 px-6 md:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-black text-dark">חדר בקרת שידור חי</h1>
          <p className="text-sm text-muted mt-1">
            שידור והקלטה מהמצלמה שלך — שבי מזהה את החומר ומנחה תוך כדי.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {recording.isRecording && (
            <div className="inline-flex items-center gap-2 h-11 px-4 rounded-2xl bg-red-100 border border-red-300">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-extrabold text-red-600">
                מקליט · {formatDuration(recording.durationSec)}
              </span>
            </div>
          )}
          {!isActive ? (
            <button
              onClick={start}
              disabled={status === 'requesting'}
              aria-label="הפעל מצלמה"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl text-white text-sm font-bold bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] shadow-lg hover:-translate-y-0.5 transition-transform disabled:opacity-60"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                <path d="M2 4h20v16H2zM11 13l4 2.5-4 2.5z" />
              </svg>
              {status === 'requesting' ? 'מבקש גישה…' : 'הפעל מצלמה'}
            </button>
          ) : (
            <button
              onClick={stop}
              aria-label="סיים שידור"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl text-white text-sm font-bold bg-gradient-to-br from-[#FF8A9C] to-[#E5483C] shadow-lg hover:-translate-y-0.5 transition-transform"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                <path d="M6 6h12v12H6z" />
              </svg>
              סיים שידור
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_312px] gap-4 items-start">
        {/* Left column — camera + recording */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-4">
          {/* Camera preview */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-[22px] overflow-hidden bg-[#221F30] shadow-2xl"
          >
            <div className="relative aspect-video bg-gradient-to-br from-[#48445E] to-[#2E2B40]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${isActive && settings.videoEnabled ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* Placeholder / status overlay */}
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-white/60 text-center px-6">
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
                      <path d="M12 14a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4zM19 10a7 7 0 0 1-14 0M12 17v4M8 21h8" />
                    </svg>
                    <span className="text-sm">
                      {status === 'requesting'
                        ? 'מבקש גישה למצלמה…'
                        : errorMessage || 'לחץ "הפעל מצלמה" כדי להתחיל'}
                    </span>
                    {(status === 'denied' || status === 'error') && (
                      <button
                        onClick={start}
                        className="mt-1 px-4 py-1.5 rounded-lg bg-white/15 text-white text-xs font-semibold hover:bg-white/25 transition-colors"
                      >
                        נסה שוב
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Camera off (active but video disabled) */}
              {isActive && !settings.videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center text-white/60">
                  <div className="flex flex-col items-center gap-2">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M2 4h20v16H2zM11 13l4 2.5-4 2.5z" />
                      <path d="M3 3l18 18" stroke="#FF8A9C" strokeWidth="2" />
                    </svg>
                    <span className="text-xs">המצלמה כבויה</span>
                  </div>
                </div>
              )}

              {/* LIVE badge */}
              {recording.isRecording && (
                <div className="absolute top-3.5 right-4 inline-flex items-center gap-1.5 h-7 px-3 rounded-lg bg-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[11px] font-extrabold text-white">REC</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recording controls */}
          <motion.div variants={itemVariants} className="rounded-[22px] glass p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-extrabold text-dark">הקלטת השיעור</span>
              {recording.videoUrl && !recording.isRecording && (
                <span className="text-xs font-bold text-[#2E9E72] bg-[#2E9E72]/10 px-3 py-1 rounded-full">
                  ההקלטה מוכנה ✓
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!recording.isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={!isActive}
                  aria-label="התחל הקלטה"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-white text-sm font-bold bg-red-500 shadow-md hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:translate-y-0"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  התחל הקלטה
                </button>
              ) : (
                <>
                  <button
                    onClick={stopRecording}
                    aria-label="עצור הקלטה"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-white text-sm font-bold bg-[#2E2E48] shadow-md hover:-translate-y-0.5 transition-transform"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    עצור
                  </button>
                  <button
                    onClick={togglePauseRecording}
                    aria-label={recording.isPaused ? 'המשך הקלטה' : 'השהה הקלטה'}
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl text-[#5E5AA8] text-sm font-bold bg-[#5E5AA8]/10 hover:bg-[#5E5AA8]/20 transition-colors"
                  >
                    {recording.isPaused ? 'המשך' : 'השהה'}
                  </button>
                </>
              )}
              {!isActive && (
                <span className="text-xs text-muted">הפעל את המצלמה כדי להקליט</span>
              )}
            </div>

            {/* Playback of last recording */}
            {recording.videoUrl && !recording.isRecording && (
              <div className="mt-4">
                <div className="text-sm font-semibold text-muted mb-2">צפייה בהקלטה האחרונה</div>
                <video
                  src={recording.videoUrl}
                  controls
                  className="w-full rounded-xl bg-black max-h-80"
                />
                <a
                  href={recording.videoUrl}
                  download="binah-recording.webm"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-[#5E5AA8] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M12 3v12M7 11l5 4 5-4M5 21h14" />
                  </svg>
                  הורד הקלטה
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Right column — camera settings */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-4">
          {/* Device controls */}
          <motion.div variants={itemVariants} className="rounded-[22px] glass p-5">
            <div className="text-base font-extrabold text-dark mb-4">בקרת התקנים</div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={toggleVideo}
                disabled={!isActive}
                aria-pressed={settings.videoEnabled}
                aria-label="הפעל או כבה מצלמה"
                className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-xs font-bold transition-all disabled:opacity-50 ${
                  settings.videoEnabled
                    ? 'bg-[#9FB4F5]/16 border-[#9FB4F5]/40 text-[#5E5AA8]'
                    : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 4h20v16H2zM11 13l4 2.5-4 2.5z" />
                </svg>
                מצלמה
              </button>
              <button
                onClick={toggleAudio}
                disabled={!isActive}
                aria-pressed={settings.audioEnabled}
                aria-label="הפעל או כבה מיקרופון"
                className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-xs font-bold transition-all disabled:opacity-50 ${
                  settings.audioEnabled
                    ? 'bg-[#9FB4F5]/16 border-[#9FB4F5]/40 text-[#5E5AA8]'
                    : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />
                </svg>
                מיקרופון
              </button>
            </div>
          </motion.div>

          {/* Resolution settings */}
          <motion.div variants={itemVariants} className="rounded-[22px] glass p-5">
            <div className="text-base font-extrabold text-dark mb-1">הגדרות מצלמה</div>
            <div className="text-xs text-muted mb-3">איכות וידאו</div>
            <div className="grid grid-cols-2 gap-2.5">
              {(['720p', '1080p'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  aria-pressed={settings.resolution === res}
                  className={`px-3 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    settings.resolution === res
                      ? 'bg-[#5E5AA8] border-[#5E5AA8] text-white'
                      : 'bg-white/50 border-gray-200 text-muted hover:border-[#9FB4F5]'
                  }`}
                >
                  {res === '1080p' ? 'Full HD · 1080p' : 'HD · 720p'}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/50 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">סטטוס מצלמה</span>
              <span
                className={`text-xs font-bold ${
                  isActive ? 'text-[#2E9E72]' : status === 'denied' ? 'text-red-500' : 'text-muted'
                }`}
              >
                {isActive ? 'פעילה ●' : status === 'denied' ? 'נדחתה' : status === 'requesting' ? 'מבקש…' : 'כבויה'}
              </span>
            </div>
          </motion.div>

          {/* Shvi assistant tip */}
          <motion.div
            variants={itemVariants}
            className="rounded-[22px] p-4 flex items-center gap-3 bg-gradient-to-br from-[#DDE6FF] to-[#EBDFFB] border border-white/80"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#9FB4F5] to-[#C3A8EE] flex items-center justify-center flex-shrink-0 shadow-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 2l2.2 5.6L20 9l-5.8 1.4L12 16l-2.2-5.6L4 9z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-extrabold text-dark">שבי · עוזר שידור</div>
              <div className="text-xs text-[#6C6C88] leading-relaxed">
                ודא שהתאורה מולך ולא מאחוריך, ובדוק שהמיקרופון פעיל לפני תחילת ההקלטה.
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
