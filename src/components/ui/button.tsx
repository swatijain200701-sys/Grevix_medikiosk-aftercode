import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#356B62] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#356B62] text-[#FFFDF7] hover:bg-[#2B574F] active:bg-[#244741] shadow-sm font-bold",
        destructive: "bg-[#991B1B] text-[#FFFDF7] hover:bg-[#7F1D1D]",
        outline: "border border-[#B8C9BD] bg-[#FAF7F0] text-[#293D36] hover:bg-[#D8E5DC]",
        secondary: "bg-[#D8E5DC] text-[#293D36] hover:bg-[#C9D8CE] border border-[#B8C9BD]",
        ghost: "hover:bg-[#D8E5DC] text-[#53665D] hover:text-[#293D36]",
        link: "text-[#356B62] underline-offset-4 hover:underline font-semibold",
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