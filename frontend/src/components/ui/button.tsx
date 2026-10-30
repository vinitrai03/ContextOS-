import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-xs font-semibold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:opacity-90 shadow-minimal",
        destructive: "bg-status-error text-white hover:bg-red-600 shadow-minimal",
        outline: "border border-border bg-transparent hover:border-foreground/40 text-text-primary",
        secondary: "bg-surface-hover text-text-primary border border-border hover:border-foreground/30",
        ghost: "hover:bg-surface-hover text-text-secondary hover:text-text-primary",
        link: "text-text-primary underline-offset-4 hover:underline capitalize",
        primary: "bg-foreground text-background hover:opacity-90 shadow-minimal",
        glow: "bg-foreground text-background hover:opacity-90 shadow-minimal",
        danger: "bg-status-error text-white hover:bg-red-600",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-[11px]",
        md: "h-9 px-4 py-2",
        lg: "h-11 px-7 text-xs",
        icon: "h-9 w-9 rounded-full",
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
  isLoading?: boolean
  icon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, icon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin shrink-0" />}
        {!isLoading && icon && <span className="mr-2 inline-flex shrink-0">{icon}</span>}
        {children}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
