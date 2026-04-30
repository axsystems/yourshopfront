import "server-only"

/**
 * Posts a Slack-flavoured markdown text payload to SLACK_WEBHOOK_URL.
 * Silent skip if the webhook URL isn't set. Never throws — used for
 * real-time lead/sale notifications, not for anything load-bearing.
 */
export async function notifySlack(text: string): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      console.warn(
        "[slack] non-2xx",
        res.status,
        await res.text().catch(() => "")
      )
    }
  } catch (err) {
    console.warn("[slack] threw", err)
  }
}
