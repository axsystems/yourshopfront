import "server-only"

const QUO_API_URL = "https://api.openphone.com/v1/messages"

/**
 * Send a one-off SMS to the operator's personal phone via Quo (OpenPhone).
 * Uses the same Quo workspace + sender number as sellyourhomenowaz.
 *
 * Env vars (set in Vercel):
 *   QUO_API_KEY         — workspace API key
 *   QUO_FROM_NUMBER     — sender, E.164 (e.g. +16234398208)
 *   QUO_OPERATOR_PHONE  — recipient, E.164 (e.g. +16236920494)
 *
 * Fire-and-forget — never throws. If env vars are missing OR the API call
 * fails, we log and return so the calling webhook handler isn't blocked.
 */
export async function sendOperatorSms(message: string): Promise<void> {
  const apiKey = process.env.QUO_API_KEY
  const fromNumber = process.env.QUO_FROM_NUMBER
  const toNumber = process.env.QUO_OPERATOR_PHONE

  if (!apiKey || !fromNumber || !toNumber) {
    console.warn(
      "[sms-quo] skipped: missing QUO_API_KEY / QUO_FROM_NUMBER / QUO_OPERATOR_PHONE"
    )
    return
  }

  try {
    const res = await fetch(QUO_API_URL, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
        from: fromNumber,
        to: [toNumber],
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      console.error(`[sms-quo] send failed (${res.status}): ${errText}`)
    }
  } catch (err) {
    console.error("[sms-quo] send threw:", err)
  }
}
