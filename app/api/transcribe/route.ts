import { NextRequest, NextResponse } from 'next/server'

// Speech-to-text via ElevenLabs Scribe (Hebrew-capable). Drop an audio file,
// get a transcript. Active only when ELEVENLABS_API_KEY is set.
// ponytail: direct multipart forward — no SDK.
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Transcription not configured' }, { status: 503 })
  }

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'audio file is required' }, { status: 400 })
  }

  const fd = new FormData()
  fd.append('file', file)
  fd.append('model_id', 'scribe_v1')

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey },
      body: fd,
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'transcription provider error' }, { status: 502 })
    }
    const data = await res.json()
    return NextResponse.json({ text: data.text || '' })
  } catch {
    return NextResponse.json({ error: 'transcription failed' }, { status: 500 })
  }
}
