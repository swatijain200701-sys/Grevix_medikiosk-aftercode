import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#7DD3FC]",
  {
    variants: {
      variant: {
        default:
          "border-[#50D6C5]/30 bg-[#50D6C5]/15 text-[#50D6C5]",
        secondary:
          "border-[#294350] bg-[#18303D] text-[#B6C7CF]",
        destructive:
          "border-[#991B1B] bg-[#2B1417] text-[#F87171]",
        caution:
          "border-[#854D0E] bg-[#261B0E] text-[#FBBF24]",
        outline: "text-[#B6C7CF] border-[#294350]",
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
