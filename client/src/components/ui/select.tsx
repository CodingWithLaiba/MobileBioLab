"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

type Option = {
  label: string
  value: string
}

type SelectProps = {
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
}, ref) => {
  return (
    <select
      ref={ref}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        "h-10 w-full rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
    >
      <option value="" disabled>
        {placeholder}
      </option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
})

Select.displayName = "Select"

export default Select
