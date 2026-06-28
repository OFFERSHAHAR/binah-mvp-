// WhatsApp notifications via a self-hosted OpenWA gateway.
// Active only when OPENWA_API_URL + OPENWA_API_KEY + OPENWA_SESSION_ID are set;
// otherwise it no-ops (a notification failure must never break the calling flow).
// ponytail: direct REST to OpenWA's send-text endpoint — no SDK.

const API_URL = process.env.OPENWA_API_URL
const API_KEY = process.env.OPENWA_API_KEY
const SESSION = process.env.OPENWA_SESSION_ID

interface SendResult {
  sent: boolean
  skipped?: boolean
  error?: string
}

// WhatsApp chatId for an individual = "<international digits>@c.us".
function toChatId(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `${digits}@c.us`
}

export async function sendWhatsApp(phone: string, text: string): Promise<SendResult> {
  if (!API_URL || !API_KEY || !SESSION) {
    return { sent: false, skipped: true }
  }
  try {
    const res = await fetch(`${API_URL}/api/sessions/${SESSION}/messages/send-text`, {
      method: 'POST',
      headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: toChatId(phone), text }),
    })
    if (!res.ok) return { sent: false, error: `gateway ${res.status}` }
    return { sent: true }
  } catch {
    return { sent: false, error: 'network' }
  }
}
