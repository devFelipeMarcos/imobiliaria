"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SwitchSize = "default" | "sm" | "lg"

interface SwitchProps extends Omit<React.ComponentPropsWithoutRef<"button">, "type"> {
  size?: SwitchSize
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, size = "default", checked = false, onCheckedChange, disabled, ...props }, ref) => {
    const sizeClasses: Record<SwitchSize, string> = {
      sm: "h-4 w-7",
      default: "h-6 w-11",
      lg: "h-7 w-12"
    }

    const thumbSizeClasses: Record<SwitchSize, string> = {
      sm: "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0",
      default: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
      lg: "h-6 w-6 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
    }

    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked)
      }
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-input",
          sizeClasses[size],
          className
        )}
        onClick={handleClick}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        <span
          data-state={checked ? "checked" : "unchecked"}
          className={cn(
            "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform",
            thumbSizeClasses[size]
          )}
        />
      </button>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }