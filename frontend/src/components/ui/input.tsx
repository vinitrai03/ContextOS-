import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    const inputElement = (
      <input
        id={inputId}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )

    if (!label && !error && !icon && !rightIcon) {
      return inputElement
    }

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-text-muted pointer-events-none">
              {icon}
            </div>
          )}
          {inputElement}
          {rightIcon && (
            <div className="absolute right-3.5 text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-status-error mt-1">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
export default Input
