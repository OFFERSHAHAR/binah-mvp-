// Transactional email via Resend. Active only when RESEND_API_KEY is set;
// otherwise it no-ops (registration must not fail just because email is unconfigured).
// ponytail: direct REST call — no SDK for one endpoint.

interface SendResult {
  sent: boolean
  skipped?: boolean
  error?: string
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  verifyUrl: string
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — verification email skipped for', to)
    return { sent: false, skipped: true }
  }

  // Resend's onboarding@resend.dev works without domain verification for testing.
  const from = process.env.EMAIL_FROM || 'בִּינָה <onboarding@resend.dev>'

  const html = `
    <div dir="rtl" style="font-family:Heebo,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#2E2E48">
      <h1 style="font-size:22px;font-weight:800">ברוך הבא ל-בִּינָה 🎓</h1>
      <p style="font-size:15px;line-height:1.6">שלום ${name}, תודה שנרשמת. לאישור כתובת המייל ולהפעלת החשבון, לחץ על הכפתור:</p>
      <p style="text-align:center;margin:28px 0">
        <a href="${verifyUrl}" style="background:linear-gradient(135deg,#9FB4F5,#C3A8EE);color:#fff;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:12px;display:inline-block">אישור המייל</a>
      </p>
      <p style="font-size:12px;color:#7A7A92">אם לא נרשמת ל-בִּינָה, אפשר להתעלם מהודעה זו. הקישור תקף ל-24 שעות.</p>
    </div>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject: 'אישור הרשמה ל-בִּינָה', html }),
    })
    if (!res.ok) {
      const detail = await res.text()
      console.error('[email] Resend error', res.status, detail)
      return { sent: false, error: `provider ${res.status}` }
    }
    return { sent: true }
  } catch (err) {
    console.error('[email] send failed', err)
    return { sent: false, error: 'network' }
  }
}
