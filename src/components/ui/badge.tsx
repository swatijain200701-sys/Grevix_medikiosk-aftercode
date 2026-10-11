import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#356B62]",
  {
    variants: {
      variant: {
        default:
          "border-[#356B62]/30 bg-[#D8E5DC] text-[#356B62] font-bold",
        secondary:
          "border-[#B8C9BD] bg-[#FAF7F0] text-[#293D36]",
        destructive:
          "border-[#F87171] bg-[#FEE2E2] text-[#991B1B] font-bold",
        caution:
          "border-[#F59E0B] bg-[#FEF3C7] text-[#92400E] font-bold",
        slate:
          "border-[#304652]/30 bg-[#304652]/10 text-[#304652] font-semibold",
        outline:
          "border-[#B8C9BD] text-[#53665D] bg-transparent",
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