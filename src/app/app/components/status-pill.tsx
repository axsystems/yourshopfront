import { cn } from "@/lib/utils"
import type { SiteStatus } from "@/lib/supabase"

// STREAM-A-DEPENDENCY: if the SiteStatus union in src/lib/supabase.ts is
// extended with additional copy-cycle states (awaiting_copy_draft,
// awaiting_copy_review, awaiting_copy_approval), add them to STATUS_MAP below
// and update the SiteStatus union — this component will pick them up without
// layout changes.

interface StatusPillProps {
  status: SiteStatus
  className?: string
}

type PillVariant = "green" | "blue" | "amber" | "grey" | "red"

interface PillConfig {
  label: string
  variant: PillVariant
}

const STATUS_MAP: Record<SiteStatus, PillConfig> = {
  live: { label: "Live", variant: "green" },
  provisioning: { label: "Provisioning", variant: "blue" },
  ready_to_build: { label: "Ready to build", variant: "blue" },
  awaiting_approval: { label: "Awaiting your approval", variant: "amber" },
  pending_content: { label: "Awaiting content", variant: "grey" },
  // copy-cycle states — currently one value; see STREAM-A-DEPENDENCY note above
  awaiting_copy: { label: "Drafting copy", variant: "amber" },
  cancelled: { label: "Cancelled", variant: "red" },
  refunded: { label: "Refunded", variant: "red" },
  failed: { label: "Failed", variant: "red" },
}

const VARIANT_CLASSES: Record<PillVariant, { pill: string; dot: string }> = {
  green: {
    pill: "bg-[#E6FBF5] text-[#00614A]",
    dot: "bg-apx-success",
  },
  blue: {
    pill: "bg-apx-primary-soft text-apx-primary-ink",
    dot: "bg-apx-primary",
  },
  amber: {
    pill: "bg-[#FFF8EC] text-[#7A4A00]",
    dot: "bg-[#C97A1F]",
  },
  grey: {
    pill: "bg-apx-tint text-apx-mute",
    dot: "bg-apx-soft",
  },
  red: {
    pill: "bg-[#FFF1EE] text-[#8C1A12]",
    dot: "bg-apx-danger",
  },
}

export function StatusPill({ status, className }: StatusPillProps) {
  const config: PillConfig = STATUS_MAP[status] ?? { label: status, variant: "grey" }
  const { pill, dot } = VARIANT_CLASSES[config.variant]

  return (
    <span
      role="status"
      aria-label={`Site status: ${config.label}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-none",
        pill,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", dot)} aria-hidden />
      {config.label}
    </span>
  )
}
