"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button, TextField } from "@/components/apex"

import { addComment } from "../actions"

export function AddCommentForm({ editRequestId }: { editRequestId: string }) {
  const router = useRouter()
  const [body, setBody] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const trimmed = body.trim()
  const canSubmit = !submitting && trimmed.length >= 1 && trimmed.length <= 5000

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await addComment({ editRequestId, body: trimmed })
      if (!res.ok) {
        setError(res.error)
        setSubmitting(false)
        return
      }
      setBody("")
      setSubmitting(false)
      // revalidatePath in the action refreshes the server tree on next nav;
      // router.refresh forces it now so the comment shows up immediately.
      router.refresh()
    } catch (err) {
      console.error("[edit-requests/comment] submit failed", err)
      setError("Could not post comment. Try again.")
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <TextField
        label="Add a comment"
        multiline
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={5000}
        placeholder="Add detail, answer a question, or ask one."
      />
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-apx-danger/40 bg-apx-danger/5 p-3 text-sm text-apx-danger"
        >
          {error}
        </p>
      ) : null}
      <div className="flex items-center justify-end">
        <Button type="submit" loading={submitting} disabled={!canSubmit}>
          Post comment
        </Button>
      </div>
    </form>
  )
}
