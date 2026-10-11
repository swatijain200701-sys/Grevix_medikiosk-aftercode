import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#356B62]",
  {
    variants: {
      variant: {
        default:
          "border-[#356B62]/30 bg-[var(--bg-panel)] text-[var(--btn-main)] font-bold",
        secondary:
          "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-heading)]",
        destructive:
          "border-[#F87171] bg-[#FEE2E2] text-[#991B1B] font-bold",
        caution:
          "border-[#F59E0B] bg-[#FEF3C7] text-[#92400E] font-bold",
        slate:
          "border-[var(--border-color)]/30 bg-[var(--slate-accent)]/10 text-[var(--slate-accent)] font-semibold",
        outline:
          "border-[var(--border-color)] text-[var(--text-muted)] bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }