import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356B62] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--btn-main)] text-[var(--btn-main-text)] hover:bg-[var(--btn-main-hover)] active:bg-[#244741] shadow-sm font-bold",
        destructive: "bg-[#991B1B] text-[var(--btn-main-text)] hover:bg-[#7F1D1D]",
        outline: "border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-heading)] hover:bg-[var(--bg-panel)]",
        secondary: "bg-[var(--bg-panel)] text-[var(--text-heading)] hover:bg-[#C9D8CE] border border-[var(--border-color)]",
        ghost: "hover:bg-[var(--bg-panel)] text-[var(--text-muted)] hover:text-[var(--text-heading)]",
        link: "text-[var(--btn-main)] underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-7 text-base font-bold",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }