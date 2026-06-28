import { NextRequest, NextResponse } from 'next/server'

// Text-to-speech via ElevenLabs. Active only when ELEVENLABS_API_KEY is set;
// otherwise returns 503 so the UI can fall back gracefully.
// ponytail: direct fetch to ElevenLabs — no SDK needed for one endpoint.
export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'TTS not configured' }, { status: 503 })
  }

  const { text } = await request.json()
  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'text is required' }, { status: 400 })
  }

  // Rachel by default; override with ELEVENLABS_VOICE_ID. Multilingual model for Hebrew.
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'TTS provider error' }, { status: 502 })
  }

  return new NextResponse(res.body, {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
  })
}
