import "server-only"

/**
 * Escapes the three characters Slack's mrkdwn parser treats specially so
 * customer-supplied text can't inject formatting or break out into a
 * `<https://attacker.example|click here>` link inside an operator
 * notification.
 *
 * Per Slack: https://api.slack.com/reference/surfaces/formatting#escaping
 *
 * Only call on user-controlled segments — labels, headers, and other
 * operator-authored text should keep their `*bold*`, `>quotes`, and
 * `<https://...|links>` working.
 */
export function escapeSlackText(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\|/g, "&#124;")
}

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
