'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'error'

export interface CameraSettings {
  videoEnabled: boolean
  audioEnabled: boolean
  facingMode: 'user' | 'environment'
  resolution: '720p' | '1080p'
}

export interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  durationSec: number
  videoUrl: string | null
}

const RESOLUTION_CONSTRAINTS: Record<CameraSettings['resolution'], { width: number; height: number }> = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
}

/**
 * useCamera — real getUserMedia + MediaRecorder camera hook.
 *
 * Handles permission requests, live stream, device toggles (cam/mic),
 * resolution selection, recording (start/stop/pause/resume) and playback.
 * Fully cleans up tracks on unmount to release the device.
 */
export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [status, setStatus] = useState<CameraStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [settings, setSettings] = useState<CameraSettings>({
    videoEnabled: true,
    audioEnabled: true,
    facingMode: 'user',
    resolution: '1080p',
  })
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    durationSec: 0,
    videoUrl: null,
  })

  const attachStream = useCallback((stream: MediaStream) => {
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [])

  const start = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('error')
      setErrorMessage('הדפדפן אינו תומך בגישה למצלמה')
      return
    }

    setStatus('requesting')
    setErrorMessage(null)

    const res = RESOLUTION_CONSTRAINTS[settings.resolution]

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: settings.facingMode,
          width: { ideal: res.width },
          height: { ideal: res.height },
        },
        audio: true,
      })

      // Apply current enable/disable state to the tracks
      stream.getVideoTracks().forEach((t) => (t.enabled = settings.videoEnabled))
      stream.getAudioTracks().forEach((t) => (t.enabled = settings.audioEnabled))

      attachStream(stream)
      setStatus('active')
    } catch (err) {
      const e = err as DOMException
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setStatus('denied')
        setErrorMessage('הגישה למצלמה נדחתה. אפשר גישה בהגדרות הדפדפן ונסה שוב.')
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setStatus('error')
        setErrorMessage('לא נמצאה מצלמה מחוברת.')
      } else {
        setStatus('error')
        setErrorMessage(e.message || 'שגיאה בהפעלת המצלמה')
      }
    }
  }, [settings, attachStream])

  const stop = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStatus('idle')
    setRecording((r) => ({ ...r, isRecording: false, isPaused: false }))
  }, [])

  const toggleVideo = useCallback(() => {
    setSettings((s) => {
      const next = !s.videoEnabled
      streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next))
      return { ...s, videoEnabled: next }
    })
  }, [])

  const toggleAudio = useCallback(() => {
    setSettings((s) => {
      const next = !s.audioEnabled
      streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next))
      return { ...s, audioEnabled: next }
    })
  }, [])

  const setResolution = useCallback(
    (resolution: CameraSettings['resolution']) => {
      setSettings((s) => ({ ...s, resolution }))
      // Restart stream if already active to apply new resolution
      if (status === 'active') {
        stop()
        // start() re-reads settings on next call; defer slightly
        setTimeout(() => start(), 60)
      }
    },
    [status, stop, start]
  )

  const startRecording = useCallback(() => {
    const stream = streamRef.current
    if (!stream || typeof MediaRecorder === 'undefined') return

    chunksRef.current = []
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm'

    const recorder = new MediaRecorder(stream, { mimeType })
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setRecording((r) => ({ ...r, videoUrl: url, isRecording: false, isPaused: false }))
    }

    recorder.start()
    recorderRef.current = recorder

    setRecording((r) => ({ ...r, isRecording: true, isPaused: false, durationSec: 0, videoUrl: null }))

    timerRef.current = setInterval(() => {
      setRecording((r) => (r.isPaused ? r : { ...r, durationSec: r.durationSec + 1 }))
    }, 1000)
  }, [])

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const togglePauseRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder) return
    if (recorder.state === 'recording') {
      recorder.pause()
      setRecording((r) => ({ ...r, isPaused: true }))
    } else if (recorder.state === 'paused') {
      recorder.resume()
      setRecording((r) => ({ ...r, isPaused: false }))
    }
  }, [])

  // Cleanup on unmount — release camera/mic
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return {
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
  }
}
